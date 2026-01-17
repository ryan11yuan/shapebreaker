from utils import read_video
from trackers import Tracker
import cv2
import numpy as np
from team_assigner import TeamAssigner
from formation_analyzer import FormationAnalyzer

def main():
    # Read Video
    video_frames = read_video('input_videos/08fd33_4.mp4')
    
    # Initialize Tracker
    tracker = Tracker('models/best.pt')

    tracks = tracker.get_object_tracks(video_frames,
                                       read_from_stub=True,
                                       stub_path='stubs/tracks_stub.pkl')
    
    # Assign Teams (needed for formation analysis)
    team_assigner = TeamAssigner()
    team_assigner.assign_team_color(video_frames[0], tracks['players'][0])

    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            team = team_assigner.get_player_team(video_frames[frame_num],   
                                                 track['bbox'],
                                                 player_id)
            tracks['players'][frame_num][player_id]['team'] = team 
            tracks['players'][frame_num][player_id]['team_color'] = team_assigner.team_colors[team]
    
    # Analyze Formations at First, Middle, and Last frames
    print("\nAnalyzing formations at first, middle, and last frames...")
    formation_analyzer = FormationAnalyzer()
    frame_height, frame_width = video_frames[0].shape[:2]
    
    # Analyze Team 1 at 3 time points
    team1_results = formation_analyzer.analyze_team_formation_over_time(
        tracks, team_id=1, frame_width=frame_width, frame_height=frame_height
    )
    
    # Analyze Team 2 at 3 time points
    team2_results = formation_analyzer.analyze_team_formation_over_time(
        tracks, team_id=2, frame_width=frame_width, frame_height=frame_height
    )
    
    # Save all formation diagrams
    print("\nTeam 1 Formations:")
    for formation_name, diagram, lines, label in team1_results:
        filename = f'output_images/team1_formation_{label.lower()}.png'
        cv2.imwrite(filename, diagram)
        print(f"  {label}: {formation_name} - Saved to {filename}")
    
    print("\nTeam 2 Formations:")
    for formation_name, diagram, lines, label in team2_results:
        filename = f'output_images/team2_formation_{label.lower()}.png'
        cv2.imwrite(filename, diagram)
        print(f"  {label}: {formation_name} - Saved to {filename}")
    
    # Create side-by-side comparisons for each time point
    for i, label in enumerate(['start', 'middle', 'end']):
        combined = np.hstack([team1_results[i][1], team2_results[i][1]])
        cv2.imwrite(f'output_images/formations_comparison_{label}.png', combined)
    
    print("\nAll formation diagrams saved to output_images/")

if __name__ == "__main__":
    main()