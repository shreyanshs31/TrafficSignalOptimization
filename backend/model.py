import numpy as np
from ultralytics import YOLO
from collections import defaultdict
import cv2, torch
import matplotlib.pyplot as plt

from fuzzylogic import setup_fuzzy_controller , calculate_lane_priority_fuzzy, visualize_fuzzy_membership
from signalTiming import calculate_green_times, calculate_red_times, update_waiting_times



class FuzzyTrafficLightOptimizer:
    def __init__(self, model = None):
        self.model = model if model is not None else YOLO('yolov8n.pt')
        self.confidence = 0.3 #setting minimum threshold for vehicles to consider 

        #if gpu is available then process with cuda insted of cpu
        if torch.cuda.is_available():
            self.device = 'cuda'
        else:
            self.device = 'cpu'

        #these numbers are choosen because yolov8 is trained on COCO dataset and these are the class index for the following object
        self.target_classes = [2, 3, 5, 7]
        self.class_names = {
            2: 'car',
            3: 'motorcycle',
            5: 'bus',
            7: 'truck'
        }

        #weights are set for giving preference to big vehicles more than small vehicles
        self.class_weights = {
            2: 1.0,
            3: 0.5,
            5: 2.5,
            7: 2.0
        }

        #defining all the lanes 
        self.lanes = {
            'north': {'vehicles': defaultdict(int), 'density': 0, 'waiting_time': 0, 'priority': 0},
            'east': {'vehicles': defaultdict(int), 'density': 0, 'waiting_time': 0, 'priority': 0},
            'south': {'vehicles': defaultdict(int), 'density': 0, 'waiting_time': 0, 'priority': 0},
            'west': {'vehicles': defaultdict(int), 'density': 0, 'waiting_time': 0, 'priority': 0}
        }
        
        self.min_green_time = 10
        self.max_green_time = 60
        self.yellow_time = 3
        self.cycle_time = 90

        # Initialize fuzzy logic controller
        self.priority_ctrl, self.priority_simulator = setup_fuzzy_controller()


    def process_lane_image(self, image, lane_name):
        if lane_name not in self.lanes:
            raise ValueError(f"Invalid lane name: {lane_name}. Must be one of {list(self.lanes.keys())}")

        height, width, _ = image.shape
        results = self.model.predict(image, conf=self.confidence, device=self.device)[0]
        annotated_image = image.copy()
        self.lanes[lane_name]['vehicles'] = defaultdict(int)
        boxes = results.boxes.xyxy.cpu().numpy() if hasattr(results.boxes, 'xyxy') else np.empty((0, 4))
        classes = results.boxes.cls.cpu().numpy() if hasattr(results.boxes, 'cls') else np.empty((0,))
        confidences = results.boxes.conf.cpu().numpy() if hasattr(results.boxes, 'conf') else np.empty((0,))

        # Vectorized filtering for target classes
        classes = classes.astype(int)
        target_mask = np.isin(classes, self.target_classes)
        filtered_boxes = boxes[target_mask]
        filtered_classes = classes[target_mask]
        filtered_confidences = confidences[target_mask]

        # Vectorized area calculation
        if filtered_boxes.size > 0:
            widths = filtered_boxes[:, 2] - filtered_boxes[:, 0]
            heights = filtered_boxes[:, 3] - filtered_boxes[:, 1]
            areas = widths * heights
            vehicle_area = np.sum(areas)
        else:
            vehicle_area = 0

        # Vectorized vehicle counting
        for class_id in self.target_classes:
            count = np.sum(filtered_classes == class_id)
            self.lanes[lane_name]['vehicles'][self.class_names[class_id]] = int(count)

        # Drawing (still needs a loop)
        for box, class_id, confidence in zip(filtered_boxes, filtered_classes, filtered_confidences):
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(annotated_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            label = f"{self.class_names[class_id]} {confidence:.2f}"
            cv2.putText(annotated_image, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        total_area = width * height
        self.lanes[lane_name]['density'] = (vehicle_area / total_area) * 100 if total_area > 0 else 0

        # Calculate and update the lane's priority using fuzzy logic
        self.calculate_lane_priority_fuzzy(lane_name)
        self.add_lane_stats_to_image(annotated_image, lane_name)
        return annotated_image
    

    def add_lane_stats_to_image(self, image, lane_name):
        stats = [
            f"Lane: {lane_name.upper()}",
            f"Cars: {self.lanes[lane_name]['vehicles']['car']}",
            f"Motorcycles: {self.lanes[lane_name]['vehicles']['motorcycle']}",
            f"Buses: {self.lanes[lane_name]['vehicles']['bus']}",
            f"Trucks: {self.lanes[lane_name]['vehicles']['truck']}",
            f"Density: {self.lanes[lane_name]['density']:.2f}%",
            f"Wait Time: {self.lanes[lane_name]['waiting_time']}s",
            f"Priority: {self.lanes[lane_name]['priority']:.2f}"
        ]
        y_offset = 30
        for text in stats:
            cv2.putText(image, text, (20, y_offset), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            y_offset += 30

    
    def calculate_lane_priority_fuzzy(self, lane_name):
        lane_data = self.lanes[lane_name]
        priority = calculate_lane_priority_fuzzy(
            lane_data,
            self.priority_simulator,
            self.class_weights,
            self.class_names
        )
        self.lanes[lane_name]['priority'] = priority
        return priority

    def calculate_green_times(self):
        return calculate_green_times(self.lanes, self.min_green_time, self.max_green_time, self.yellow_time, self.cycle_time)

    def calculate_red_times(self, green_times):
        return calculate_red_times(green_times, self.yellow_time, self.cycle_time)

    def update_waiting_times(self, active_lane=None, time_elapsed=1):
        update_waiting_times(self.lanes, active_lane, time_elapsed)

    def visualize_fuzzy_membership(self, output_dir=None):
        visualize_fuzzy_membership(self.priority_ctrl, output_dir)

