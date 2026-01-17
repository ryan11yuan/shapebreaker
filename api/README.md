# Soccer Analytics FastAPI Backend

FastAPI backend that wraps the existing soccer video processing project, providing a REST API for video uploads and image retrieval.

## Architecture

```
socceranalytics/
├── api/                      # FastAPI backend (NEW)
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # API dependencies
│   ├── README.md           # This file
│   └── temp_results/        # Cached results per task (auto-created)
│       └── {task_id}/      # Individual task results
├── input_videos/            # Existing: Input folder (API writes here)
├── output_videos/           # Existing: Output folder (API reads from here)
├── main.py                  # Existing: Processing script
├── requirements.txt         # Existing: Processing dependencies
└── ... (other project files)
```

## Why the `api/` Folder?

The API is in a separate `api/` folder to:

- Avoid conflicts with the existing `main.py` processing script
- Keep API code organized and separated from processing logic
- Allow independent dependency management for the API layer
- Make it clear which code is the API vs. the processing engine

## Installation

### 1. Install API Dependencies

```bash
cd api
pip install -r requirements.txt
```

**Note:** The main processing dependencies (opencv, ultralytics, etc.) should already be installed in your main project's virtual environment.

### 2. Verify Directory Structure

Ensure these directories exist at the project root (they should already):

- `input_videos/`
- `output_videos/`

The API will create `api/temp_results/` automatically.

## Running the API

### Start the Server

```bash
cd api
python main.py
```

The API will start on `http://0.0.0.0:8000`

You should see:

```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Alternative: Using uvicorn directly

```bash
cd api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload during development.

## API Workflow

1. **Upload Video** → `POST /upload-video`

   - Frontend uploads a video file
   - API saves it to `input_videos/`
   - Returns a unique `task_id`
   - Processing starts in background

2. **Check Status** → `GET /status/{task_id}`

   - Frontend polls this endpoint to check progress
   - Statuses: `queued`, `processing`, `completed`, `failed`

3. **Get Results** → `GET /results/{task_id}` (when status = `completed`)

   - Returns list of image URLs
   - Example: `["/download/{task_id}/team1_formation_start.png", ...]`

4. **Download Images** → `GET /download/{task_id}/{filename}`

   - Frontend displays images using these URLs
   - Images are served from `api/temp_results/{task_id}/`

5. **Cleanup** → `DELETE /cleanup/{task_id}`
   - Frontend calls this when done
   - Deletes video, cached images, and task data

## API Endpoints

### `GET /`

Root endpoint - returns API status and available endpoints.

### `POST /upload-video`

Upload a video for processing.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `video` (file)

**Response:**

```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "message": "Video uploaded successfully. Processing started.",
  "video_filename": "match.mp4"
}
```

### `GET /status/{task_id}`

Check processing status.

**Response:**

```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "video_filename": "match.mp4",
  "result_count": 9,
  "error": null
}
```

Statuses:

- `queued` - Waiting to start
- `processing` - Currently processing
- `completed` - Done, images ready
- `failed` - Error occurred (check `error` field)

### `GET /results/{task_id}`

Get result image URLs (only when status = `completed`).

**Response:**

```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result_count": 9,
  "images": [
    "/download/550e8400-e29b-41d4-a716-446655440000/team1_formation_start.png",
    "/download/550e8400-e29b-41d4-a716-446655440000/team1_formation_middle.png",
    "/download/550e8400-e29b-41d4-a716-446655440000/team1_formation_end.png",
    "/download/550e8400-e29b-41d4-a716-446655440000/team2_formation_start.png",
    "/download/550e8400-e29b-41d4-a716-446655440000/team2_formation_middle.png",
    "/download/550e8400-e29b-41d4-a716-446655440000/team2_formation_end.png",
    "/download/550e8400-e29b-41d4-a716-446655440000/formations_comparison_start.png",
    "/download/550e8400-e29b-41d4-a716-446655440000/formations_comparison_middle.png",
    "/download/550e8400-e29b-41d4-a716-446655440000/formations_comparison_end.png"
  ],
  "image_filenames": ["team1_formation_start.png", ...]
}
```

### `GET /download/{task_id}/{filename}`

Download/view a specific image.

**Response:** Image file (PNG)

### `DELETE /cleanup/{task_id}`

Clean up all files for a task.

**Response:**

```json
{
  "message": "Task cleaned up successfully",
  "task_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### `GET /tasks`

List all tasks (debugging endpoint).

## Testing with cURL

### 1. Upload a video

```bash
curl -X POST http://localhost:8000/upload-video \
  -F "video=@path/to/video.mp4"
```

Response:

```json
{
  "task_id": "abc123...",
  "status": "queued",
  ...
}
```

### 2. Check status

```bash
curl http://localhost:8000/status/abc123...
```

### 3. Get results (when completed)

```bash
curl http://localhost:8000/results/abc123...
```

### 4. Download an image

```bash
curl http://localhost:8000/download/abc123.../team1_formation_start.png \
  --output formation.png
```

### 5. Clean up

```bash
curl -X DELETE http://localhost:8000/cleanup/abc123...
```

## Testing with Python

```python
import requests

# Upload video
files = {'video': open('match.mp4', 'rb')}
response = requests.post('http://localhost:8000/upload-video', files=files)
task_id = response.json()['task_id']

# Poll status
import time
while True:
    status_response = requests.get(f'http://localhost:8000/status/{task_id}')
    status = status_response.json()['status']
    print(f"Status: {status}")

    if status == 'completed':
        break
    elif status == 'failed':
        print("Processing failed!")
        break

    time.sleep(2)

# Get results
results = requests.get(f'http://localhost:8000/results/{task_id}').json()
print(f"Generated {results['result_count']} images")

# Download first image
image_url = results['images'][0]
img_response = requests.get(f'http://localhost:8000{image_url}')
with open('result.png', 'wb') as f:
    f.write(img_response.content)

# Cleanup
requests.delete(f'http://localhost:8000/cleanup/{task_id}')
```

## Integration with Next.js

Example Next.js code:

```typescript
// Upload video
const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append("video", file);

  const response = await fetch("http://localhost:8000/upload-video", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.task_id;
};

// Poll status
const pollStatus = async (taskId: string) => {
  const response = await fetch(`http://localhost:8000/status/${taskId}`);
  const data = await response.json();
  return data.status;
};

// Get results
const getResults = async (taskId: string) => {
  const response = await fetch(`http://localhost:8000/results/${taskId}`);
  const data = await response.json();
  return data.images; // Array of image URLs
};

// Complete workflow
const processVideo = async (file: File) => {
  const taskId = await uploadVideo(file);

  // Poll every 2 seconds
  const interval = setInterval(async () => {
    const status = await pollStatus(taskId);

    if (status === "completed") {
      clearInterval(interval);
      const images = await getResults(taskId);
      // Display images in UI
      console.log("Images:", images);
    } else if (status === "failed") {
      clearInterval(interval);
      console.error("Processing failed");
    }
  }, 2000);
};
```

## Important Notes

### File Management

- The API automatically clears `input_videos/` before each upload (only one video at a time)
- The API clears `output_videos/` before processing (to avoid old results)
- Results are copied to `api/temp_results/{task_id}/` to preserve them for each task
- Always call `/cleanup/{task_id}` when done to free disk space

### Processing Time

- Processing time depends on video length and complexity
- Typical range: 30 seconds to several minutes
- The subprocess has a 10-minute timeout

### Error Handling

- If processing fails, check the `error` field in `/status/{task_id}`
- The `stdout` and `stderr` from the processing script are captured for debugging

### CORS

- Currently configured for `http://localhost:3000`
- Modify `allow_origins` in `api/main.py` for production

### Concurrency

- This is a simple single-task system
- Multiple simultaneous uploads will overwrite `input_videos/`
- For production, consider task queuing (Celery, RQ, etc.)

## Troubleshooting

### Port already in use

```bash
# Kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

### Processing script fails

- Check that all dependencies are installed in your Python environment
- Verify `main.py` works standalone: `python main.py`
- Check API logs for stdout/stderr from the subprocess

### Images not found

- Verify `output_videos/` directory exists
- Check that processing script actually generates images
- Look for errors in API logs

### CORS errors

- Ensure Next.js is running on `http://localhost:3000`
- Or update `allow_origins` in `api/main.py`

## Development

### Enable Debug Logging

```python
# In api/main.py, change:
logging.basicConfig(level=logging.DEBUG)
```

### Auto-reload on Code Changes

```bash
uvicorn main:app --reload
```

### View API Documentation

Once running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Production Considerations

For production deployment:

1. Add authentication/authorization
2. Implement proper task queue (Celery, Redis)
3. Use persistent storage (database) instead of in-memory tasks
4. Add rate limiting
5. Configure proper CORS origins
6. Use a production ASGI server (Gunicorn + Uvicorn)
7. Add monitoring and logging
8. Implement file size limits
9. Add video format validation
10. Consider horizontal scaling

## License

Same as the main project.
