from pydantic import BaseModel
from typing import List

class PredictRequest(BaseModel):
    intersection_id: str
    urls: List[str]
    user_id: str