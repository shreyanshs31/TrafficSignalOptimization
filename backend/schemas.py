from pydantic import BaseModel
from typing import Dict, List, Optional

class SignalTimingRow(BaseModel):
    lane: str
    green_time: int
    yellow_time: int
    red_time: int
    priority: float
    density: float
    waiting_time: int

class VehicleCountRow(BaseModel):
    lane: str
    car: int
    motorcycle: int
    bus: int
    truck: int
    total: int

class Charts(BaseModel):
    density: Optional[str]
    priority: Optional[str]
    green_time: Optional[str]
    cycle_timing: Optional[str]

class PredictResponse(BaseModel):
    images: Dict[str, str]
    signal_timing: List[SignalTimingRow]
    vehicle_counts: List[VehicleCountRow]
    charts: Charts