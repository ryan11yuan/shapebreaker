<div align="center">
<pre>
███████╗██████╗ ██████╗ ███████╗ █████╗ ██╗  ██╗███████╗██████╗ 
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗██║ ██╔╝██╔════╝██╔══██╗
███████╗██████╔╝██████╔╝█████╗  ███████║█████╔╝ █████╗  ██████╔╝
╚════██║██╔══██╗██╔══██╗██╔══╝  ██╔══██║██╔═██╗ ██╔══╝  ██╔══██╗
███████║██████╔╝██║  ██║███████╗██║  ██║██║  ██╗███████╗██║  ██║
╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
-------------------------------------------------------------------
AI-Powered Soccer Tactical Analysis Platform
</pre>

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00FFFF.svg)](https://github.com/ultralytics/ultralytics)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)

</div>

Full-stack soccer match analysis system combining computer vision and AI to detect formations, track players, and analyze team tactics from match footage.

## Demo video


https://github.com/user-attachments/assets/69a96366-761f-45f8-8d80-b7ca65c42c14



Demo Site (no functionality since backend hosting required): [frontend](https://shapebreaker-frontend-ijq7.vercel.app/)

## Features

- **Real-time Formation Detection** - Automatically identifies 4-4-2, 4-3-3, 3-5-2, and more
- **Player & Ball Tracking** - YOLOv8-powered multi-object detection and tracking
- **Team Classification** - K-means clustering on jersey colors
- **Tactical Diagrams** - Generates formation visualizations at key match moments
- **Web Interface** - Upload videos and view analysis results through modern UI
- **Possession Statistics** - Frame-by-frame ball possession tracking

## Architecture

```
├── frontend/     # Next.js web application
├── api/          # FastAPI backend service
└── backend/      # YOLOv8 analysis engine
```

## Tech Stack

| Component    | Technology                       | Purpose                        |
| ------------ | -------------------------------- | ------------------------------ |
| **Frontend** | Next.js 15, TypeScript, Tailwind | User interface                 |
| **API**      | FastAPI, Python 3.8+             | REST endpoints                 |
| **Analysis** | YOLOv8, OpenCV, scikit-learn     | Computer vision                |
| **Tracking** | ByteTrack (Supervision)          | Object tracking                |
| **AI**       | OpenAI API                       | Formation analysis enhancement |

## How It Works

**1. Detection & Tracking**

- YOLOv8 custom model detects players, referees, ball
- ByteTrack maintains consistent IDs across frames

**2. Team Assignment**

- Extract jersey colors from bounding boxes
- K-means clustering separates teams

**3. Formation Analysis**

- Analyzes positions at start/middle/end
- Clustering on field depth identifies formation lines
- Detects 4-4-2, 4-3-3, 3-5-2, 4-2-3-1, etc.

**4. Visualization**

- Generates tactical diagrams
- Annotates video with tracking data
- Displays possession statistics

## Models

**Custom YOLOv8 (`backend/models/best.pt`)**

- Dataset: Soccer Players Detection (Roboflow)
- Classes: Player, Goalkeeper, Referee, Ball
- Base: YOLOv8m (500+ annotated frames)

## Supported Formations

4-4-2 • 4-3-3 • 3-5-2 • 4-2-3-1 • 3-4-3 • 5-3-2 • 4-5-1 • 5-4-1 • 3-4-2-1

Custom formations generated for non-standard patterns.

## Next Steps

Add user login with authentication (Supabase, Auth0)
Add more advanced analytics dashboard that includes things like heat maps, expected goals (xG), etc.
Multi-camera support - different angles
Export options (PDF, shareable links, clips)
Mobile responsive
Docker Compose
CI/CD pipeline

## Author

**Ryan Yuan**  
ryanyuan32@gmail.com
