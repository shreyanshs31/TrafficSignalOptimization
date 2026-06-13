import torch
import cv2
import base64
from ultralytics import YOLO
from src.utils.fuzzylogic import validate_and_compute

class IntersectionAgent:
    def __init__(self, simulator):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Loading models
        self.traffic_model = YOLO('models/yolov8n.pt').to(self.device)
        self.ambulance_model = YOLO('models/ambulance_best.pt').to(self.device)
        self.accident_model = YOLO('models/accident_detection_3.pt').to(self.device)
        
        self.simulator = simulator
        self.vehicle_weights = {2: 1.0, 3: 0.5, 5: 2.0, 7: 2.5}
        self.recommended_timings = {'north': 30, 'east': 30, 'south': 30, 'west': 30}

        # --- NEW: Persistence Tracking ---
        # Stores how many consecutive frames an accident has been seen per lane
        self.accident_counters = {'north': 0, 'south': 0, 'east': 0, 'west': 0}
        self.THRESHOLD_FRAMES = 4  # Requires ~1.5 seconds of detection at 4 FPS

    def process_lane(self, lane_id, frame, current_wait_time, flow_multiplier=1.0):
        frame_h, frame_w = frame.shape[:2]
        edge_margin = 30  # Ignore detections within 30px of the boundary

        # 1. AI Inference
        t_res = self.traffic_model.predict(frame, conf=0.3, classes=[2,3,5,7], verbose=False)[0]
        a_res = self.ambulance_model.predict(frame, conf=0.7, classes=[0], verbose=False)[0]
        
        # Accident model now specifically filters for class 0
        acc_res = self.accident_model.predict(frame, conf=0.6, classes=[0], verbose=False)[0]

        # 2. Weighted Vehicle Counting (Standard PCE logic)
        emergency_count = len(a_res.boxes)
        counts = {"cars": 0, "bikes": 0, "buses": 0, "trucks": 0, "emergency_vehicles": 0}
        counts["emergency_vehicles"] = emergency_count
        weighted_sum = 0

        for box in t_res.boxes:
            cls = int(box.cls)
            weight = self.vehicle_weights.get(cls, 1.0)
            weighted_sum += weight
            if cls == 2: counts["cars"] += 1
            elif cls == 3: counts["bikes"] += 1
            elif cls == 5: counts["buses"] += 1
            elif cls == 7: counts["trucks"] += 1

        # 3. Fuzzy Logic
        is_emergency = len(a_res.boxes) > 0
        self.simulator.input['vehicle_count'] = min(40, len(t_res.boxes))
        total_area = (frame_w - edge_margin)*(frame_h - edge_margin)
        self.simulator.input['density'] = min(100, (weighted_sum / total_area) * 100)
        self.simulator.input['urgency'] = 1 if is_emergency else 0
        # Compute fuzzy logic with validation
        fuzzy_output = validate_and_compute(
            self.simulator, 
            {
                'vehicle_count': min(40, len(t_res.boxes)),
                'density': min(100, (weighted_sum / total_area) * 100),
                'urgency': 1 if is_emergency else 0,
                'waiting_time': min(120, current_wait_time)
            }
        )
        
        if fuzzy_output is None:
            print(f"⚠️  Fuzzy logic failed for {lane_id}, using default priority score")
            priority_score = 50
        else:
            priority_score = fuzzy_output['priority'] * flow_multiplier
        recommended_time = 90 if is_emergency else int(10 + (priority_score / 100) * 50)
        self.recommended_timings[lane_id] = recommended_time

        # 4. --- NEW: Spatial & Temporal Accident Filtering ---
        current_frame_accident = False
        for box in acc_res.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            # Check if box is in the "Safe Zone" (not touching edges)
            is_at_edge = (x1 < edge_margin or y1 < edge_margin or 
                          x2 > (frame_w - edge_margin) or y2 > (frame_h - edge_margin))
            
            if not is_at_edge:
                current_frame_accident = True
                break

        # Update persistence counter
        if current_frame_accident:
            self.accident_counters[lane_id] += 1
        else:
            self.accident_counters[lane_id] = 0 # Reset immediately if frame is clear

        # Only trigger alert if detected consistently
        alert_active = self.accident_counters[lane_id] >= self.THRESHOLD_FRAMES
        
        acc_img_encoded = None
        if alert_active:
            _, buffer = cv2.imencode('.jpg', acc_res.plot())
            acc_img_encoded = base64.b64encode(buffer).decode('utf-8')

        return {
            "is_emergency": is_emergency,
            "recommended_time": recommended_time,
            "accident_alert": alert_active,
            "accident_image": acc_img_encoded,
            "stats": counts,
        }