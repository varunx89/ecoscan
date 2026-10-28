import io
import pytest
from PIL import Image
from app.services.vision_service import vision_service


def create_test_image_bytes(color=(40, 60, 180), size=(100, 100), fmt="JPEG") -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def test_validate_valid_image():
    img_bytes = create_test_image_bytes()
    is_valid, msg, img = vision_service.validate_image(img_bytes, "image/jpeg")
    assert is_valid is True
    assert img is not None


def test_validate_corrupted_image():
    corrupted = b"not_a_valid_image_header_bytes"
    is_valid, msg, img = vision_service.validate_image(corrupted, "image/jpeg")
    assert is_valid is False
    assert "Corrupted or invalid" in msg


def test_validate_oversize_image(monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_BYTES", 100)
    img_bytes = create_test_image_bytes()
    is_valid, msg, _ = vision_service.validate_image(img_bytes, "image/jpeg")
    assert is_valid is False
    assert "exceeds maximum" in msg


@pytest.mark.asyncio
async def test_heuristic_vision_detection():
    # Blue image heuristic -> Jeans
    blue_bytes = create_test_image_bytes(color=(20, 40, 160))
    items, source = await vision_service.analyze_clothing_image(blue_bytes)
    assert len(items) >= 1
    assert source == "mock_vision_heuristic"
    assert items[0].confidence > 0.8
    assert items[0].sustainability_tip is not None
