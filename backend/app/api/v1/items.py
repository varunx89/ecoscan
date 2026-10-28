import uuid
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from app.models.clothing import (
    ItemCategory,
    MaterialType,
    GarmentCondition,
    DetectedItem,
    ScoredClothingItem,
)
from app.services.carbon_service import carbon_service
from app.storage.memory_store import store

router = APIRouter()


class UpdateBaselineScoreRequest(BaseModel):
    category: str = Field(..., description="Clothing item category, e.g. 't-shirt'")
    score_kg_co2: float = Field(..., gt=0.0, description="Baseline emissions in kg CO2e")


class CalculateItemRequest(BaseModel):
    name: str = Field(default="Custom Apparel Item")
    category: ItemCategory = Field(default=ItemCategory.TSHIRT)
    material: MaterialType = Field(default=MaterialType.CONVENTIONAL_COTTON)
    condition: GarmentCondition = Field(default=GarmentCondition.NEW_STANDARD)
    color: str = Field(default="Neutral")


@router.get("/items/carbon-scores", tags=["Carbon Scoring Data"])
def get_carbon_scoring_data() -> Dict[str, Any]:
    """
    Returns all baseline carbon footprints (in kg CO2e), material multipliers,
    and garment lifecycle condition multipliers from the in-memory store.
    """
    return {
        "baseline_carbon_scores_kg": store.baseline_scores,
        "material_lifecycle_multipliers": store.material_multipliers,
        "condition_lifecycle_multipliers": store.condition_multipliers,
        "carbon_assumptions_metadata": {
            "dataset_benchmark": "WRAP (Waste & Resources Action Programme) & UK Carbon Trust Life Cycle Analysis",
            "unit": "kg CO2e per garment",
            "scope": "Cradle-to-grave lifecycle (raw material extraction, processing, manufacturing, transport, care, end-of-life)",
            "formula": "Estimated CO2 = Baseline Category Footprint * Material Multiplier * Condition Multiplier",
            "eco_savings_formula": "Eco Savings = max(0.5, Conventional Benchmark - Estimated CO2)",
            "points_formula": "Points = clamp(round(Savings * 10 + 15), 25, 500)",
        }
    }


@router.post("/items/carbon-scores", tags=["Carbon Scoring Data"])
def update_baseline_score(payload: UpdateBaselineScoreRequest = Body(...)):
    """
    Dynamically updates or registers a clothing baseline footprint in the in-memory store.
    """
    store.update_baseline_score(payload.category, payload.score_kg_co2)
    return {
        "success": True,
        "category": payload.category.lower(),
        "updated_score_kg_co2": store.get_baseline_score(payload.category),
        "message": f"Baseline score for '{payload.category}' updated to {payload.score_kg_co2} kg CO2e."
    }


@router.post("/items/calculate", response_model=ScoredClothingItem, tags=["Carbon Scoring Data"])
def calculate_custom_item(payload: CalculateItemRequest = Body(...)):
    """
    Simulate carbon footprint and eco-reward score for any custom garment parameters.
    """
    item = DetectedItem(
        id=f"sim-{uuid.uuid4().hex[:8]}",
        name=payload.name,
        category=payload.category,
        color=payload.color,
        material=payload.material,
        condition=payload.condition,
        confidence=1.0,
    )
    return carbon_service.score_item(item)
