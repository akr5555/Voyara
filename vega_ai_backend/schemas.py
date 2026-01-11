from pydantic import BaseModel
from typing import List, Optional

class VegaRequest(BaseModel):
    trip_id: str
    city: str
    country: str
    day: int
    time_slot: str
    total_budget: float
    remaining_budget: float
    preferences: Optional[List[str]] = []
    # NEW FIELDS 👇
    adults: int = 1
    children: int = 0

class VegaSuggestion(BaseModel):
    title: str
    description: str
    reason: str
    # NEW FIELDS 👇
    estimated_price_adult: float
    estimated_price_child: float
    currency: str
    min_age: int
    is_child_allowed: bool

class VegaResponse(BaseModel):
    suggestions: List[VegaSuggestion]