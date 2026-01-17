from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import subprocess
import uuid
import os
from typing import Dict, List, Optional
import logging
import base64
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client (set API key via environment variable OPENAI_API_KEY)
openai_client = None
try:
    openai_client = OpenAI()
    logger.info("OpenAI client initialized ✓")
except Exception as e:
    logger.warning(f"OpenAI client not initialized: {e}")
    logger.warning("Set OPENAI_API_KEY environment variable to enable AI analysis")

# Check and install backend dependencies if needed
def ensure_backend_dependencies():
    """Ensure backend dependencies are installed in the current Python environment."""
    import sys
    import subprocess
    from pathlib import Path
    
    backend_requirements = Path(__file__).parent.parent / "backend" / "requirements.txt"
    
    if not backend_requirements.exists():
        logger.warning(f"Backend requirements.txt not found at {backend_requirements}")
        return
    
    # Try importing a key backend dependency to check if installed
    try:
        import cv2
        import supervision
        from ultralytics import YOLO
        logger.info("Backend dependencies already installed ✓")
    except ImportError as e:
        logger.warning(f"Backend dependencies not found: {e}")
        logger.info("Installing backend dependencies...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "-r", str(backend_requirements)],
                check=True,
                capture_output=True,
                text=True
            )
            logger.info("Backend dependencies installed successfully ✓")
        except subprocess.CalledProcessError as install_error:
            logger.error(f"Failed to install backend dependencies: {install_error}")
            logger.error("Please manually run: pip install -r backend/requirements.txt")

# Install dependencies at startup
ensure_backend_dependencies()

# Initialize FastAPI app
app = FastAPI(title="Soccer Analytics API", version="1.0.0")

# CORS Configuration - Allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory paths (relative to project root)
BASE_DIR = Path(__file__).parent.parent  # Go up to project root
BACKEND_DIR = BASE_DIR / "backend"  # Backend folder
INPUT_DIR = BACKEND_DIR / "input_videos"
OUTPUT_DIR = BACKEND_DIR / "output_images"
PROCESSING_SCRIPT = BACKEND_DIR / "main.py"
TEMP_RESULTS_DIR = Path(__file__).parent / "temp_results"

# Create necessary directories
INPUT_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
TEMP_RESULTS_DIR.mkdir(exist_ok=True)

# In-memory task storage
tasks: Dict[str, dict] = {}


def clear_directory(directory: Path, file_extensions: List[str] = None):
    """
    Clear all files in a directory, optionally filtering by extensions.
    
    Args:
        directory: Path to directory to clear
        file_extensions: List of extensions to delete (e.g., ['.mp4', '.avi']). None = delete all files
    """
    if not directory.exists():
        return
    
    for item in directory.iterdir():
        if item.is_file():
            if file_extensions is None or item.suffix.lower() in file_extensions:
                try:
                    item.unlink()
                    logger.info(f"Deleted file: {item}")
                except Exception as e:
                    logger.error(f"Error deleting {item}: {e}")


def run_processing_script(task_id: str, video_filename: str):
    """
    Background task to run the video processing script.
    
    Args:
        task_id: Unique identifier for this task
        video_filename: Name of the video file being processed
    """
    try:
        # Update task status to processing
        tasks[task_id]["status"] = "processing"
        logger.info(f"Task {task_id}: Starting processing for {video_filename}")
        
        # Clear output directory before processing
        logger.info(f"Task {task_id}: Clearing output directory")
        clear_directory(OUTPUT_DIR, ['.png', '.jpg', '.jpeg', '.avi', '.mp4'])
        
        # Change to backend directory (where main.py is)
        original_cwd = os.getcwd()
        os.chdir(BACKEND_DIR)
        
        # Find Python executable - prioritize api venv (has all deps), then backend venv, then system
        import sys
        python_exe = sys.executable
        
        # Check for Python with all dependencies installed
        venv_paths = [
            BASE_DIR / "api" / "venv" / "Scripts" / "python.exe",  # API venv (Windows) - has backend deps
            BASE_DIR / "api" / "venv" / "bin" / "python",  # API venv (Linux/Mac)
            BACKEND_DIR / "venv" / "Scripts" / "python.exe",  # Backend venv (Windows)
            BACKEND_DIR / "venv" / "bin" / "python",  # Backend venv (Linux/Mac)
            BASE_DIR / "venv" / "Scripts" / "python.exe",  # Root venv (Windows)
            BASE_DIR / "venv" / "bin" / "python",  # Root venv (Linux/Mac)
        ]
        
        for venv_python in venv_paths:
            if venv_python.exists():
                python_exe = str(venv_python)
                logger.info(f"Task {task_id}: Using venv Python: {python_exe}")
                break
        else:
            logger.info(f"Task {task_id}: Using system Python: {python_exe}")
        
        # Run the processing script
        logger.info(f"Task {task_id}: Running main.py processing script")
        result = subprocess.run(
            [python_exe, "main.py"],
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout
        )
        
        # Return to original directory
        os.chdir(original_cwd)
        
        # Check if processing succeeded
        if result.returncode != 0:
            error_msg = f"Processing script failed with return code {result.returncode}"
            logger.error(f"Task {task_id}: {error_msg}")
            logger.error(f"STDOUT: {result.stdout}")
            logger.error(f"STDERR: {result.stderr}")
            
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = error_msg
            tasks[task_id]["stdout"] = result.stdout
            tasks[task_id]["stderr"] = result.stderr
            return
        
        logger.info(f"Task {task_id}: Processing completed successfully")
        logger.info(f"STDOUT: {result.stdout}")
        
        # Scan output_images directory for generated images
        image_extensions = {'.png', '.jpg', '.jpeg'}
        generated_images = [
            f for f in OUTPUT_DIR.iterdir() 
            if f.is_file() and f.suffix.lower() in image_extensions
        ]
        
        if not generated_images:
            logger.warning(f"Task {task_id}: No images found in output directory")
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = "No images were generated"
            return
        
        # Create task-specific cache directory
        task_cache_dir = TEMP_RESULTS_DIR / task_id
        task_cache_dir.mkdir(exist_ok=True)
        
        # Copy images to task cache
        cached_images = []
        for img in generated_images:
            dest_path = task_cache_dir / img.name
            shutil.copy2(img, dest_path)
            cached_images.append(img.name)
            logger.info(f"Task {task_id}: Cached image {img.name}")
        
        # Update task with results
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["result_images"] = cached_images
        tasks[task_id]["result_count"] = len(cached_images)
        tasks[task_id]["stdout"] = result.stdout
        
        logger.info(f"Task {task_id}: Processing complete with {len(cached_images)} images")

    except subprocess.TimeoutExpired:
        logger.error(f"Task {task_id}: Processing timed out after 10 minutes")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = "Processing timed out after 10 minutes"
    except Exception as e:
        logger.error(f"Task {task_id}: Unexpected error - {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = f"Unexpected error: {str(e)}"


@app.get("/")
async def root():
    """Root endpoint - API status."""
    return {
        "status": "running",
        "message": "Soccer Analytics API",
        "endpoints": {
            "upload": "POST /upload-video",
            "status": "GET /status/{task_id}",
            "results": "GET /results/{task_id}",
            "download": "GET /download/{task_id}/{filename}",
            "cleanup": "DELETE /cleanup/{task_id}"
        }
    }


@app.post("/upload-video")
async def upload_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...)
):
    """
    Upload a video file for processing.
    
    Returns:
        task_id: Unique identifier to track processing status
    """
    try:
        # Validate file type
        if not video.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Clear input_videos directory (only one video at a time)
        logger.info("Clearing input_videos directory")
        clear_directory(INPUT_DIR, ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'])
        
        # Save uploaded video to input_videos
        video_path = INPUT_DIR / video.filename
        with video_path.open("wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        logger.info(f"Saved video: {video_path}")
        
        # Initialize task in memory
        tasks[task_id] = {
            "task_id": task_id,
            "status": "queued",
            "video_filename": video.filename,
            "result_images": [],
            "result_count": 0,
            "error": None
        }
        
        # Start background processing
        background_tasks.add_task(run_processing_script, task_id, video.filename)
        
        return {
            "task_id": task_id,
            "status": "queued",
            "message": f"Video uploaded successfully. Processing started.",
            "video_filename": video.filename
        }
        
    except Exception as e:
        logger.error(f"Error uploading video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/status/{task_id}")
async def get_status(task_id: str):
    """
    Get the current status of a processing task.
    
    Returns:
        Task status information
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    return {
        "task_id": task_id,
        "status": task["status"],
        "video_filename": task["video_filename"],
        "result_count": task["result_count"],
        "error": task.get("error"),
        "stdout": task.get("stdout") if task["status"] == "failed" else None,
        "stderr": task.get("stderr") if task["status"] == "failed" else None
    }


@app.get("/results/{task_id}")
async def get_results(task_id: str):
    """
    Get the list of result images for a completed task.
    
    Returns:
        List of image URLs
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    if task["status"] != "completed":
        raise HTTPException(
            status_code=400, 
            detail=f"Task is not completed. Current status: {task['status']}"
        )
    
    # Generate URLs for each result image
    image_urls = [
        f"/download/{task_id}/{filename}"
        for filename in task["result_images"]
    ]
    
    return {
        "task_id": task_id,
        "status": task["status"],
        "result_count": task["result_count"],
        "images": image_urls,
        "image_filenames": task["result_images"]
    }


@app.get("/download/{task_id}/{filename}")
async def download_image(task_id: str, filename: str):
    """
    Download a specific result image.
    
    Returns:
        Image file
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    if filename not in task["result_images"]:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Get image from task cache
    image_path = TEMP_RESULTS_DIR / task_id / filename
    
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image file not found on disk")
    
    return FileResponse(
        path=image_path,
        media_type="image/png",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )


@app.delete("/cleanup/{task_id}")
async def cleanup_task(task_id: str):
    """
    Clean up all files associated with a task.
    
    Deletes:
        - Video file from input_videos
        - Cached result images
        - Task from memory
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    try:
        # Delete video file from input_videos if it still exists
        video_path = INPUT_DIR / task["video_filename"]
        if video_path.exists():
            video_path.unlink()
            logger.info(f"Deleted video file: {video_path}")
        
        # Delete cached result images
        task_cache_dir = TEMP_RESULTS_DIR / task_id
        if task_cache_dir.exists():
            shutil.rmtree(task_cache_dir)
            logger.info(f"Deleted cache directory: {task_cache_dir}")
        
        # Remove task from memory
        del tasks[task_id]
        
        return {
            "message": "Task cleaned up successfully",
            "task_id": task_id
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")


@app.get("/tasks")
async def list_tasks():
    """
    List all tasks (for debugging).
    
    Returns:
        Dictionary of all tasks
    """
    return {
        "total_tasks": len(tasks),
        "tasks": {
            task_id: {
                "status": task["status"],
                "video_filename": task["video_filename"],
                "result_count": task["result_count"]
            }
            for task_id, task in tasks.items()
        }
    }


@app.post("/analyze/{task_id}")
async def analyze_formations(task_id: str):
    """
    Analyze formation images using OpenAI Vision API.
    
    Returns:
        AI analysis of both teams' formations, weaknesses, and exploitation strategies
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    if task["status"] != "completed":
        raise HTTPException(
            status_code=400, 
            detail=f"Task is not completed. Current status: {task['status']}"
        )
    
    if not openai_client:
        raise HTTPException(
            status_code=503, 
            detail="OpenAI API not configured. Set OPENAI_API_KEY environment variable."
        )
    
    # Check if analysis already exists
    if "ai_analysis" in task and task["ai_analysis"]:
        return {
            "task_id": task_id,
            "analysis": task["ai_analysis"]
        }
    
    try:
        # Get the comparison images (start, middle, end)
        task_cache_dir = TEMP_RESULTS_DIR / task_id
        comparison_images = [
            "formations_comparison_start.png",
            "formations_comparison_middle.png", 
            "formations_comparison_end.png"
        ]
        
        # Encode images to base64
        image_data = []
        for img_name in comparison_images:
            img_path = task_cache_dir / img_name
            if img_path.exists():
                with open(img_path, "rb") as img_file:
                    encoded = base64.b64encode(img_file.read()).decode('utf-8')
                    image_data.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{encoded}"
                        }
                    })
        
        if not image_data:
            raise HTTPException(status_code=404, detail="No formation images found")
        
        # Create prompt for OpenAI
        prompt = """You are an expert football (soccer) tactical analyst. Analyze these formation diagrams showing two teams' formations at different moments in the match (start, middle, end).

For each team:

Tactical Overview/Summary:
Characterize the overall tactical approach of the team based on their formation and positioning. Keep it concise. 2 sentences.

1. **Formation Analysis**: Identify the formation being used
2. **Tactical Weaknesses**: Identify 3 key positional and structural weaknesses
3. **Exploitation Strategy**: For each weakness, explain specifically how the opposition can exploit it

Structure your analysis as follows:

## TEAM 1 ANALYSIS

### Formation
[Describe the formation]

## Tactical Overview
Characterize the overall tactical approach of the team based on their formation and positioning. Keep it concise. 2 sentences.

### Tactical Weaknesses
1. **[Weakness Name]**: [Detailed explanation]
2. **[Weakness Name]**: [Detailed explanation]
3. **[Weakness Name]**: [Detailed explanation]

### Exploitation Strategies
1. **Against [Weakness]**: [Specific tactical approach to exploit this]
2. **Against [Weakness]**: [Specific tactical approach to exploit this]
3. **Against [Weakness]**: [Specific tactical approach to exploit this]

## TEAM 2 ANALYSIS

### Formation
[Describe the formation]

## Tactical Overview
Characterize the overall tactical approach of the team based on their formation and positioning. Keep it concise. 2 sentences.

### Tactical Weaknesses
1. **[Weakness Name]**: [Detailed explanation]
2. **[Weakness Name]**: [Detailed explanation]
3. **[Weakness Name]**: [Detailed explanation]

### Exploitation Strategies
1. **Against [Weakness]**: [Specific tactical approach to exploit this]
2. **Against [Weakness]**: [Specific tactical approach to exploit this]
3. **Against [Weakness]**: [Specific tactical approach to exploit this]

Be specific, tactical, and actionable in your analysis."""

        # Call OpenAI Vision API
        logger.info(f"Task {task_id}: Requesting OpenAI analysis")
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    *image_data
                ]
            }
        ]
        
        response = openai_client.chat.completions.create(
            model="gpt-4o",  
            messages=messages,
            max_tokens=2000,
            temperature=0.7
        )
        
        analysis = response.choices[0].message.content
        
        # Cache the analysis in the task
        tasks[task_id]["ai_analysis"] = analysis
        
        logger.info(f"Task {task_id}: AI analysis completed")
        
        return {
            "task_id": task_id,
            "analysis": analysis
        }
        
    except Exception as e:
        logger.error(f"Error analyzing formations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting Soccer Analytics API on http://0.0.0.0:8000")
    logger.info(f"Base directory: {BASE_DIR}")
    logger.info(f"Backend directory: {BACKEND_DIR}")
    logger.info(f"Input directory: {INPUT_DIR}")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
