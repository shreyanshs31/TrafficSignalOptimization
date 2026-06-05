import cv2
import numpy as np

class ExitSensor:
    def __init__(self, lane_id):
        """
        Initializes the exit flow sensor for a specific lane.
        """
        self.lane_id = lane_id
        
        # MOG2 handles shadow removal well, which is important for outdoor traffic
        self.fgbg = cv2.createBackgroundSubtractorMOG2(
            history=500, 
            varThreshold=50, 
            detectShadows=True
        )
        
        # Region of Interest (ROI) - adjust these based on your camera view
        # Format: [y1, y2, x1, x2]
        self.roi_coords = [100, 400, 100, 500] 
        
        # Pixel threshold to distinguish a vehicle from wind/noise
        self.min_pixel_threshold = 1000 

    def process_frame(self, frame):
        """
        Detects if vehicles are successfully exiting the intersection.
        """
        # 1. Resize for performance on i5 hardware
        # No need for high resolution to detect motion presence
        frame_resized = cv2.resize(frame, (640, 480))
        
        # 2. Apply Background Subtraction
        fg_mask = self.fgbg.apply(frame_resized)
        
        # 3. Focus on the Exit ROI
        y1, y2, x1, x2 = self.roi_coords
        roi_mask = fg_mask[y1:y2, x1:x2]
        
        # 4. Clean noise (Open morphological operation)
        kernel = np.ones((5, 5), np.uint8)
        roi_mask = cv2.morphologyEx(roi_mask, cv2.MORPH_OPEN, kernel)
        
        # 5. Calculate Presence
        moving_pixels = np.count_nonzero(roi_mask)
        is_flowing = moving_pixels > self.min_pixel_threshold
        
        # Return status for the coordinator
        # If 'flowing', it means the road ahead is clear for more traffic
        return {
            "lane": self.lane_id,
            "status": "flowing" if is_flowing else "clear",
            "intensity": moving_pixels
        }

# # Logic Verification (for testing)
# if __name__ == "__main__":
#     sensor = ExitSensor("north")
#     # Using your camera or a video file for testing
#     cap = cv2.VideoCapture(0) 
    
#     while True:
#         ret, frame = cap.read()
#         if not ret: break
        
#         data = sensor.process_frame(frame)
#         if data["status"] == "flowing":
#             print(f"✅ Flow Verified: Vehicles clearing {data['lane']}ward")
            
#         cv2.imshow(f"Exit Feed - {sensor.lane_id}", frame)
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
#     cap.release()
#     cv2.destroyAllWindows()