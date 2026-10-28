import base64
import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Body
from pydantic import BaseModel, Field

from app.models.clothing import ScanResponse
from app.services.vision_service import vision_service
from app.services.carbon_service import carbon_service
from app.services.rewards_service import rewards_service
from app.storage.memory_store import store

router = APIRouter()


class Base64ScanRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image string, with or without data:image prefix")
    content_type: str = Field(default="image/jpeg", description="MIME type of the image")
    user_id: str = Field(default="default_user")


@router.post("/scan", response_model=ScanResponse, tags=["Scan & Analysis"])
async def scan_clothing_file(
    file: UploadFile = File(..., description="Uploaded clothing image file"),
    user_id: str = Form(default="default_user"),
):
    """
    Primary endpoint for scanning clothing photos from file upload or camera snapshot.
    Validates image, identifies garments via Azure GPT-4 Vision (or fallback),
    computes carbon scores, eco-savings, and awards eco-reward points.
    """
    file_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"

    # 1. Validation
    is_valid, err_msg, _ = vision_service.validate_image(file_bytes, content_type)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    # 2. Vision Recognition
    detected_items, vision_source = await vision_service.analyze_clothing_image(file_bytes, content_type)
    if not detected_items:
        raise HTTPException(status_code=422, detail="Unable to identify any clothing items in the provided image.")

    # 3. Carbon LCA Scoring
    scored_items, total_carbon, total_baseline, total_savings, equivalencies = (
        carbon_service.score_items(detected_items)
    )

    # 4. Eco-Rewards Calculation & Wallet Credit
    reward_points, _ = rewards_service.credit_scan_rewards(total_savings, user_id=user_id)

    # 5. Build Summary
    summary = rewards_service.format_sustainability_summary(
        total_savings_kg=total_savings,
        items_count=len(scored_items),
        points=reward_points,
    )

    scan_id = f"scan-{uuid.uuid4().hex[:10]}"
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    response = ScanResponse(
        scan_id=scan_id,
        timestamp=timestamp,
        vision_source=vision_source,
        items=scored_items,
        total_carbon_kg=total_carbon,
        total_baseline_kg=total_baseline,
        total_savings_kg=total_savings,
        total_reward_points=reward_points,
        equivalencies=equivalencies,
        sustainability_summary=summary,
    )

    # Save to in-memory store
    store.save_scan(scan_id, response.model_dump())

    return response


@router.post("/scan/base64", response_model=ScanResponse, tags=["Scan & Analysis"])
async def scan_clothing_base64(payload: Base64ScanRequest = Body(...)):
    """
    Alternative scan endpoint accepting base64 encoded images (ideal for webcam canvas capture).
    """
    raw_data = payload.image_base64
    content_type = payload.content_type

    if "," in raw_data:
        prefix, raw_data = raw_data.split(",", 1)
        if "data:" in prefix and ";" in prefix:
            content_type = prefix.split("data:")[1].split(";")[0]

    try:
        file_bytes = base64.b64decode(raw_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")

    # 1. Validation
    is_valid, err_msg, _ = vision_service.validate_image(file_bytes, content_type)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    # 2. Vision Recognition
    detected_items, vision_source = await vision_service.analyze_clothing_image(file_bytes, content_type)
    if not detected_items:
        raise HTTPException(status_code=422, detail="Unable to identify any clothing items in the provided image.")

    # 3. Carbon LCA Scoring
    scored_items, total_carbon, total_baseline, total_savings, equivalencies = (
        carbon_service.score_items(detected_items)
    )

    # 4. Eco-Rewards Calculation & Wallet Credit
    reward_points, _ = rewards_service.credit_scan_rewards(total_savings, user_id=payload.user_id)

    # 5. Build Summary
    summary = rewards_service.format_sustainability_summary(
        total_savings_kg=total_savings,
        items_count=len(scored_items),
        points=reward_points,
    )

    scan_id = f"scan-{uuid.uuid4().hex[:10]}"
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    response = ScanResponse(
        scan_id=scan_id,
        timestamp=timestamp,
        vision_source=vision_source,
        items=scored_items,
        total_carbon_kg=total_carbon,
        total_baseline_kg=total_baseline,
        total_savings_kg=total_savings,
        total_reward_points=reward_points,
        equivalencies=equivalencies,
        sustainability_summary=summary,
    )

    store.save_scan(scan_id, response.model_dump())

    return response
