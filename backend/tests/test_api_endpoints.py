import base64
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def create_dummy_jpeg() -> bytes:
    img = Image.new("RGB", (120, 120), color=(30, 80, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "vision_provider" in data
    assert "features" in data


def test_get_carbon_scores_endpoint():
    response = client.get("/api/v1/items/carbon-scores")
    assert response.status_code == 200
    data = response.json()
    assert "baseline_carbon_scores_kg" in data
    assert data["baseline_carbon_scores_kg"]["t-shirt"] == 5.0
    assert data["baseline_carbon_scores_kg"]["jeans"] == 10.0
    assert data["baseline_carbon_scores_kg"]["jacket"] == 15.0
    assert data["baseline_carbon_scores_kg"]["shoes"] == 8.0


def test_update_baseline_score_endpoint():
    payload = {"category": "t-shirt", "score_kg_co2": 4.8}
    response = client.post("/api/v1/items/carbon-scores", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["updated_score_kg_co2"] == 4.8

    # Re-verify GET reflects the update
    get_resp = client.get("/api/v1/items/carbon-scores")
    assert get_resp.json()["baseline_carbon_scores_kg"]["t-shirt"] == 4.8

    # Reset back to 5.0
    client.post("/api/v1/items/carbon-scores", json={"category": "t-shirt", "score_kg_co2": 5.0})


def test_custom_calculate_endpoint():
    payload = {
        "name": "Handmade Linen Shirt",
        "category": "shirt",
        "material": "linen",
        "condition": "sustainable_brand",
        "color": "Sage Green",
    }
    response = client.post("/api/v1/items/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["item"]["name"] == "Handmade Linen Shirt"
    assert data["estimated_co2_kg"] > 0
    assert data["eco_savings_kg"] > 0
    assert data["item_reward_points"] > 0


def test_scan_file_upload_endpoint():
    jpeg_bytes = create_dummy_jpeg()
    files = {"file": ("test_denim.jpg", jpeg_bytes, "image/jpeg")}
    response = client.post("/api/v1/scan", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert "items" in data
    assert len(data["items"]) >= 1
    assert data["total_carbon_kg"] > 0
    assert data["total_reward_points"] >= 25
    assert "equivalencies" in data


def test_scan_base64_endpoint():
    jpeg_bytes = create_dummy_jpeg()
    b64_str = base64.b64encode(jpeg_bytes).decode("utf-8")
    payload = {
        "image_base64": f"data:image/jpeg;base64,{b64_str}",
        "content_type": "image/jpeg",
        "user_id": "api_test_user",
    }
    response = client.post("/api/v1/scan/base64", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_reward_points"] > 0


def test_offers_and_redemption_flow():
    # 1. Fetch offers
    resp = client.get("/api/v1/offers?user_points=150")
    assert resp.status_code == 200
    offers = resp.json()
    assert len(offers) > 0

    # 2. Redeem an offer
    redeem_payload = {
        "offer_id": "OFFER-REEWILD-15",
        "user_id": "flow_user",
        "user_points": 200,
    }
    red_resp = client.post("/api/v1/offers/redeem", json=redeem_payload)
    assert red_resp.status_code == 200
    red_data = red_resp.json()
    assert red_data["success"] is True
    assert "promo_code" in red_data
    assert red_data["remaining_points"] == 150  # 200 - 50

    # 3. Check wallet
    wallet_resp = client.get("/api/v1/offers/wallet?user_id=flow_user")
    assert wallet_resp.status_code == 200
    w_data = wallet_resp.json()
    assert w_data["wallet"]["balance_points"] == 150
    assert "tier" in w_data
