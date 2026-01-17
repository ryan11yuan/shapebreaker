<div align="center">
<pre>
███████╗ ██████╗  ██████╗ ██████╗███████╗██████╗      █████╗ ██╗
██╔════╝██╔═══██╗██╔════╝██╔════╝██╔════╝██╔══██╗    ██╔══██╗██║
███████╗██║   ██║██║     ██║     █████╗  ██████╔╝    ███████║██║
╚════██║██║   ██║██║     ██║     ██╔══╝  ██╔══██╗    ██╔══██║██║
███████║╚██████╔╝╚██████╗╚██████╗███████╗██║  ██║    ██║  ██║██║
╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝
---------------------------------------------------------------
AI-Powered Football Match Analysis System
</pre>

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00FFFF.svg)](https://github.com/ultralytics/ultralytics)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.12.0-green.svg)](https://opencv.org/)

</div>

Computer vision system that automatically analyzes football match videos using YOLOv8 and deep learning.  
Provides player tracking, team assignment, ball tracking, and possession statistics.

![formation detection](sample_images/video-sample.png)
![screenshot of video frame](sample_images/formation-sample.png)

## Features

- **Multi-object detection and tracking** (players, referees, ball)
- **Automatic team classification** using K-means clustering on jersey colors
- **Real-time possession analysis** with frame-by-frame tracking
- **Formation Analysis** - Automatically detects team formations (4-4-2, 4-3-3, etc.)
- **Formation Diagrams** - Generates tactical visualizations at start, middle, and end of match

## Installation

### Windows

```bash
# Run setup
setup.bat

# Place video in input_videos/ folder

# Run analysis
run.bat
```

### Manual Installation

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run
python main.py
```

## Modules Used

| Module          | Version | Purpose                                 |
| --------------- | ------- | --------------------------------------- |
| `ultralytics`   | 8.3.234 | YOLOv8 object detection framework       |
| `opencv-python` | 4.12.0  | Video processing and frame manipulation |
| `supervision`   | 0.27.0  | Object tracking (ByteTrack algorithm)   |
| `scikit-learn`  | ≥1.3.0  | K-means clustering for team assignment  |
| `numpy`         | ≥1.24.0 | Numerical computations                  |
| `matplotlib`    | ≥3.7.0  | Data visualization                      |

## Trained Models

**YOLOv8 Custom Model** (`models/best.pt`)

- **Dataset**: Football Players Detection (Roboflow)
- **Classes**: Player, Goalkeeper, Referee, Ball
- **Training Images**: 500+ annotated frames
- **Base Model**: YOLOv8m (medium)

## Sample Video

[Sample Input Video File](https://drive.google.com/file/d/1t6agoqggZKx6thamUuPAIdN_1zR9v9S_/view?pli=1)

## How It Works

**1. Object Detection & Tracking**

- YOLOv8 detects players, referees, and ball in each frame
- ByteTrack maintains consistent IDs across frames
- Batch processing (20 frames) for efficiency

**2. Team Assignment**

- Extract jersey colors from player bounding boxes
- K-means clustering separates teams by color
- Assign each player to a team

**3. Ball Possession Analysis**

- Measure distance from ball to each player
- Assign ball to closest player
- Track possession changes frame-by-frame

**4. Formation Analysis**

- Analyzes player positions at key moments (start, middle, end)
- Uses K-means clustering on field depth to identify formation lines
- Detects formations: 4-4-2, 4-3-3, 3-5-2, 4-2-3-1, and more
- Handles camera perspective distortion for accurate positioning
- Generates tactical field diagrams with:
  - Player positions and IDs
  - Ball location
  - Formation labels
  - Team colors

**5. Video Annotation**

- Draw color-coded ellipses for teams
- Mark ball position
- Display possession statistics
- Generate annotated output video

## Output Files

After running `main.py`, you'll get:

**Video Analysis:**

- `output_videos/output_video.avi` - Annotated match video with tracking and possession stats

**Formation Diagrams (PNG):**

- `team1_formation_start.png` - Team 1 formation at match start
- `team1_formation_middle.png` - Team 1 formation at match midpoint
- `team1_formation_end.png` - Team 1 formation at match end
- `team2_formation_start.png` - Team 2 formation at match start
- `team2_formation_middle.png` - Team 2 formation at match midpoint
- `team2_formation_end.png` - Team 2 formation at match end
- `formations_comparison_start.png` - Side-by-side comparison (start)
- `formations_comparison_middle.png` - Side-by-side comparison (middle)
- `formations_comparison_end.png` - Side-by-side comparison (end)

## Configuration

Customize analysis by editing `main.py`:

```python
# Input video
video_frames = read_video('input_videos/YOUR_VIDEO.mp4')

# Model selection
tracker = Tracker('models/best.pt')  # Change model here

# Enable/disable caching
tracks = tracker.get_object_tracks(
    video_frames,
    read_from_stub=True,              # Set False to re-process
    stub_path='stubs/tracks_stub.pkl'
)

# Formation analysis runs automatically
# Outputs saved to output_videos/

# Output video
save_video(output_frames, 'output_videos/YOUR_OUTPUT.avi')
```

### Supported Formations

The system automatically detects these formations:

- 4-4-2 (Classic)
- 4-3-3 (Attacking)
- 3-5-2 (Defensive midfield)
- 4-2-3-1 (Modern standard)
- 3-4-3 (Wing-backs)
- 5-3-2 (Ultra defensive)
- 4-5-1 (Defensive)
- 5-4-1 (Counter-attack)
- 3-4-2-1 (Diamond midfield)

_Custom formations are generated when player positioning doesn't match standard patterns._

## Author

**Ryan**  
[ryanyuan32@gmail.com]
