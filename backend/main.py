from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
from ultralytics import YOLO
from model import FuzzyTrafficLightOptimizer
from plots import plot_signal_and_density
from schemas import PredictResponse
from contextlib import asynccontextmanager


origins = [
    "http://localhost:5173",
    "http://localhost:4173"
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.yolo_model = YOLO('yolov8n.pt')
    yield

app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/predicts", response_model= PredictResponse)
async def initialiseBacknd(
    request: Request,
    north: UploadFile = File(None),
    east: UploadFile = File(None),
    south: UploadFile = File(None),
    west: UploadFile = File(None)
):
    try:
        optimizer = FuzzyTrafficLightOptimizer(model=request.app.state.yolo_model)
        directions = {"north": north, "east": east, "south": south, "west": west}
        annotated_images = {}
        
        # 1. Process images and update optimizer.lanes
        for lane, file in directions.items():
            img_str = await process_lane_upload(file, lane, optimizer)
            if img_str:
                annotated_images[lane] = img_str

        # 2. Now calculate green_times and charts
        green_times = optimizer.calculate_green_times()
        charts = plot_signal_and_density(optimizer, green_times)
        
        # 3. Prepare tables as before
        signal_timing = []
        vehicle_counts = []

        for lane in directions.keys():
            lane_data = optimizer.lanes[lane]
            signal_timing.append({
                "lane": lane.upper(),
                "green_time": green_times[lane],
                "yellow_time": optimizer.yellow_time,
                "red_time": optimizer.calculate_red_times(green_times)[lane],
                "priority": round(lane_data["priority"], 2),
                "density": round(lane_data["density"], 2),
                "waiting_time": lane_data["waiting_time"]
            })
            vehicle_counts.append({
                "lane": lane.upper(),
                "car": lane_data["vehicles"]["car"],
                "motorcycle": lane_data["vehicles"]["motorcycle"],
                "bus": lane_data["vehicles"]["bus"],
                "truck": lane_data["vehicles"]["truck"],
                "total": sum(lane_data["vehicles"].values())
            })
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))

    return {
    "images": annotated_images,
    "signal_timing": signal_timing,
    "vehicle_counts": vehicle_counts,
    "charts": charts
    }

async def process_lane_upload(file: UploadFile, lane: str, optimizer) -> str:
    
    #Reads an uploaded file, decodes it, processes it, and returns a base64-encoded annotated image.
    
    if file is not None:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        annotated_img = optimizer.process_lane_image(img, lane)
        _, buffer = cv2.imencode('.jpg', annotated_img)
        img_str = base64.b64encode(buffer).decode('utf-8')
        return img_str
    return None