import numpy as np
import cv2
from collections import defaultdict
from sklearn.cluster import KMeans
import sys
sys.path.append('../')
from utils import get_center_of_bbox

class FormationAnalyzer:
    def __init__(self):
        self.formations = {
            '4-4-2': [1, 4, 4, 2],
            '4-3-3': [1, 4, 3, 3],
            '3-5-2': [1, 3, 5, 2],
            '4-2-3-1': [1, 4, 2, 3, 1], 
            '3-4-3': [1, 3, 4, 3],    
            '5-3-2': [1, 5, 3, 2],    
            '4-5-1': [1, 4, 5, 1],  
            '5-4-1': [1, 5, 4, 1],
            '3-4-2-1': [1, 3, 4, 2, 1], 
        }
    
    def get_player_positions(self, tracks, team_id, frame_num):
        positions = {}
        
        if frame_num >= len(tracks['players']):
            return positions
        
        # build roster (full 11) by checking nearby frames to not miss any players
        team_roster = set()
        frame_range = range(max(0, frame_num - 10), min(len(tracks['players']), frame_num + 11))
        
        for f in frame_range:
            player_dict = tracks['players'][f]
            for player_id, player_data in player_dict.items():
                if player_data.get('team') == team_id:
                    team_roster.add(player_id)
        
        player_dict = tracks['players'][frame_num]
        
        for player_id in team_roster:
            if player_id in player_dict:
                player_data = player_dict[player_id]

                if player_data.get('team') == team_id:
                    bbox = player_data['bbox']
                    x_center, y_center = get_center_of_bbox(bbox)
                    positions[player_id] = (x_center, y_center)
        
        return positions
    
    def get_best_frame_for_formation(self, tracks, team_id, candidate_frames):
        """
        Find the frame with the most consistent player count (11)
        Returns the best frame number
        """
        frame_scores = []
        
        for frame_num in candidate_frames:
            if frame_num >= len(tracks['players']):
                continue
            
            positions = self.get_player_positions(tracks, team_id, frame_num)
            num_players = len(positions)
            
            # prefer 11 players, penalize deviation
            score = abs(11 - num_players)
            frame_scores.append((frame_num, num_players, score))
        
        if not frame_scores:
            return candidate_frames[0] if candidate_frames else 0
        
        # return frame with score closest to 11 players
        best_frame = min(frame_scores, key=lambda x: x[2])
        return best_frame[0]
    
    def normalize_positions(self, positions, frame_width, frame_height):
        """
        Normalize positions to 0-100 scale for consistent formation detection
        Accounts for camera perspective by expanding Y-axis
        """
        if not positions:
            return {}
        
        # first pass: normalize to 0-100
        normalized = {}
        for player_id, (x, y) in positions.items():
            norm_x = (x / frame_width) * 100
            norm_y = (y / frame_height) * 100
            normalized[player_id] = (norm_x, norm_y)
        
        y_positions = [pos[1] for pos in normalized.values()]
        if len(y_positions) > 1:
            y_min = min(y_positions)
            y_max = max(y_positions)
            y_range = y_max - y_min
            
            # adjust for camera perspective
            if y_range < 40:
                y_center = np.mean(y_positions)
                expansion_factor = 50 / max(y_range, 10)
                
                for player_id in normalized:
                    x, y = normalized[player_id]
                    expanded_y = y_center + (y - y_center) * expansion_factor
                    expanded_y = max(10, min(90, expanded_y))
                    normalized[player_id] = (x, expanded_y)
        
        # for side-camera view: check if team is attacking right to left
        x_positions = [pos[0] for pos in normalized.values()]
        avg_x = np.mean(x_positions)
        
        # if average x > 50, team is on right side, flip horizontally for consistent orientation
        if avg_x > 50:
            for player_id in normalized:
                x, y = normalized[player_id]
                normalized[player_id] = (100 - x, y)
        
        return normalized
    
    def cluster_by_depth_position(self, positions, n_lines):
        """
        Cluster players into defensive/midfield/attacking lines based on X position (depth)
        Returns dict of {line_num: [player_ids]}
        """
        if not positions:
            return {}
        
        n_lines = min(n_lines, len(positions))
        
        if n_lines < 1:
            return {}
        
        x_positions = np.array([[pos[0]] for pos in positions.values()])
        player_ids = list(positions.keys())
        
        kmeans = KMeans(n_clusters=n_lines, random_state=42, n_init=10)
        line_assignments = kmeans.fit_predict(x_positions)
        
        cluster_centers = [(i, kmeans.cluster_centers_[i][0]) for i in range(n_lines)]
        cluster_centers.sort(key=lambda x: x[1])
        cluster_order = {old_idx: new_idx for new_idx, (old_idx, _) in enumerate(cluster_centers)}
        
        lines = defaultdict(list)
        for player_id, line_num in zip(player_ids, line_assignments):
            sorted_line = cluster_order[line_num]
            lines[sorted_line].append(player_id)
        
        for line_num in lines:
            lines[line_num].sort(key=lambda pid: positions[pid][1])
        
        return dict(lines)
    
    def detect_formation(self, positions):
        if not positions:
            return "No players detected", {}
        
        num_players = len(positions)
        
        # try different numbers of lines (3, 4, or 5 lines including goalkeeper)
        best_formation = None
        best_score = float('inf')
        best_lines = {}
        
        # cases where some players aren't detected or extra detections occur
        for formation_name, formation_structure in self.formations.items():
            expected_players = sum(formation_structure)
            
            if abs(num_players - expected_players) > 3:
                continue
            
            n_lines = len(formation_structure)
            lines = self.cluster_by_depth_position(positions, n_lines)
            
            if not lines:
                continue
            
            score = 0
            for line_num, expected_count in enumerate(formation_structure):
                actual_count = len(lines.get(line_num, []))
                score += abs(expected_count - actual_count)
            
            score += abs(num_players - expected_players) * 2
            
            if score < best_score:
                best_score = score
                best_formation = formation_name
                best_lines = lines
        
        # custom formation detection if no standard formation matched well
        if best_formation is None:
            
            for n_lines in [4, 5, 3]:
                if num_players < n_lines:
                    continue
                lines = self.cluster_by_depth_position(positions, n_lines)
                if lines:
                    
                    formation_counts = [len(lines[i]) for i in sorted(lines.keys())]
                    if len(formation_counts) > 1:
                        best_formation = '-'.join(map(str, formation_counts[1:]))
                    else:
                        best_formation = f"{num_players} players"
                    best_lines = lines
                    break
        
        if best_formation is None:
            best_formation = f"{num_players} players (unknown formation)"
        
        if num_players != 11:
            best_formation = f"{best_formation} ({num_players} players)"
        
        return best_formation, best_lines
    
    def draw_formation_skeleton(self, frame_width=1920, frame_height=1080, positions=None, 
                                 lines=None, team_color=(255, 0, 0), formation_name="Unknown", ball_pos=None):
        # Create a blank field representation
        field = np.ones((frame_height, frame_width, 3), dtype=np.uint8) * 50  # Dark green
        
        # Draw field markings (simplified)
        # Field border
        cv2.rectangle(field, (100, 100), (frame_width-100, frame_height-100), (255, 255, 255), 2)
        
        # Center line
        cv2.line(field, (frame_width//2, 100), (frame_width//2, frame_height-100), (255, 255, 255), 2)
        
        # Center circle
        cv2.circle(field, (frame_width//2, frame_height//2), 100, (255, 255, 255), 2)
        
        # Penalty boxes
        cv2.rectangle(field, (100, frame_height//2 - 200), (300, frame_height//2 + 200), (255, 255, 255), 2)
        cv2.rectangle(field, (frame_width-300, frame_height//2 - 200), (frame_width-100, frame_height//2 + 200), (255, 255, 255), 2)
        
        if positions and lines:
            # Draw players and connections
            all_positions_pixel = {}
            
            # Convert normalized positions back to pixel coordinates
            for player_id, (norm_x, norm_y) in positions.items():
                pixel_x = int((norm_x / 100) * (frame_width - 200) + 100)
                pixel_y = int((norm_y / 100) * (frame_height - 200) + 100)
                all_positions_pixel[player_id] = (pixel_x, pixel_y)
            
            # Draw players
            for player_id, (pixel_x, pixel_y) in all_positions_pixel.items():
                # Draw player circle
                cv2.circle(field, (pixel_x, pixel_y), 20, team_color, -1)
                cv2.circle(field, (pixel_x, pixel_y), 20, (255, 255, 255), 2)
                
                # Draw player ID
                cv2.putText(field, str(player_id), (pixel_x - 10, pixel_y + 5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Draw ball if position is provided
        if ball_pos is not None:
            ball_x, ball_y = ball_pos
            pixel_ball_x = int((ball_x / 100) * (frame_width - 200) + 100)
            pixel_ball_y = int((ball_y / 100) * (frame_height - 200) + 100)
            
            # Draw ball
            cv2.circle(field, (pixel_ball_x, pixel_ball_y), 15, (0, 0, 255), -1)
            cv2.circle(field, (pixel_ball_x, pixel_ball_y), 15, (255, 255, 255), 2)
        
        # Draw formation name
        cv2.putText(field, f"Formation: {formation_name}", (50, 50),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)
        
        return field
    
    def analyze_team_formation(self, tracks, team_id, frame_width, frame_height, frame_num):
        """
        Complete formation analysis for a team at a specific frame
        Returns (formation_name, formation_diagram, lines)
        """
        # Get positions at specific frame
        positions = self.get_player_positions(tracks, team_id, frame_num)
        
        # Normalize positions
        normalized_positions = self.normalize_positions(positions, frame_width, frame_height)
        
        # Detect formation
        formation_name, lines = self.detect_formation(normalized_positions)
        
        # Get team color from tracks
        team_color = (255, 0, 0)  # Default red
        if frame_num < len(tracks['players']):
            for player_data in tracks['players'][frame_num].values():
                if player_data.get('team') == team_id:
                    team_color = player_data.get('team_color', (255, 0, 0))
                    break
        
        # Get ball position at this frame
        ball_pos = None
        if frame_num < len(tracks['ball']) and 1 in tracks['ball'][frame_num]:
            ball_bbox = tracks['ball'][frame_num][1]['bbox']
            ball_x, ball_y = get_center_of_bbox(ball_bbox)

            norm_ball_x = (ball_x / frame_width) * 100
            norm_ball_y = (ball_y / frame_height) * 100
            
            x_positions = [pos[0] for pos in normalized_positions.values()]
            if x_positions:
                avg_x = np.mean(x_positions)
                if avg_x < 50: 
                    ball_pos = (norm_ball_x, norm_ball_y)
                    ball_pos = (100 - norm_ball_x, norm_ball_y)
        
        # Draw formation diagram
        formation_diagram = self.draw_formation_skeleton(
            frame_width, frame_height, 
            normalized_positions, lines, 
            team_color, formation_name, ball_pos
        )
        
        return formation_name, formation_diagram, lines
    
    def analyze_team_formation_over_time(self, tracks, team_id, frame_width, frame_height):
        """
        analyze team formation at first, middle, and last frames
        selects best frames with most consistent player detection
        """
        total_frames = len(tracks['players'])
        
        # Define candidate frame ranges for start, middle, end
        start_range = list(range(0, min(50, total_frames)))
        middle_range = list(range(max(0, total_frames//2 - 25), min(total_frames, total_frames//2 + 25)))
        end_range = list(range(max(0, total_frames - 50), total_frames))
        
        # Find best frames (closest to 11 players) for each period
        first_frame = self.get_best_frame_for_formation(tracks, team_id, start_range)
        middle_frame = self.get_best_frame_for_formation(tracks, team_id, middle_range)
        last_frame = self.get_best_frame_for_formation(tracks, team_id, end_range)
        
        results = []
        frame_labels = ['Start', 'Middle', 'End']
        
        for frame_num, label in zip([first_frame, middle_frame, last_frame], frame_labels):
            formation_name, diagram, lines = self.analyze_team_formation(
                tracks, team_id, frame_width, frame_height, frame_num
            )
            
            # Add frame label to diagram
            cv2.putText(diagram, f"Frame: {label} ({frame_num})", (50, 100),
                       cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 0), 2)
            
            results.append((formation_name, diagram, lines, label))
        
        return results
