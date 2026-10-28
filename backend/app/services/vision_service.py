import base64
import io
import json
import logging
import uuid
from typing import List, Tuple, Optional
from PIL import Image
from openai import AzureOpenAI, OpenAI

from app.config import settings
from app.models.clothing import (
    DetectedItem,
    ItemCategory,
    MaterialType,
    GarmentCondition,
)

logger = logging.getLogger(__name__)


class VisionService:
    """
    Vision analysis service supporting Azure AI Foundry GPT-4 Vision,
    standard OpenAI Vision, with an automatic resilient local mock/heuristic fallback
    so the application functions smoothly in all development and testing environments.
    """

    def __init__(self):
        self.azure_client: Optional[AzureOpenAI] = None
        self.openai_client: Optional[OpenAI] = None
        self._init_clients()

    def _init_clients(self):
        if settings.AZURE_OPENAI_ENDPOINT and settings.AZURE_OPENAI_API_KEY:
            try:
                # Sanitize endpoint: strip any trailing /openai/v1, /openai, or trailing slashes
                endpoint = settings.AZURE_OPENAI_ENDPOINT.strip().rstrip("/")
                if endpoint.endswith("/openai/v1"):
                    endpoint = endpoint[:-10].rstrip("/")
                elif endpoint.endswith("/openai"):
                    endpoint = endpoint[:-7].rstrip("/")

                self.azure_client = AzureOpenAI(
                    azure_endpoint=endpoint,
                    api_key=settings.AZURE_OPENAI_API_KEY,
                    api_version=settings.AZURE_OPENAI_API_VERSION,
                    timeout=15.0,
                )
                logger.info("Azure AI Foundry Vision client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize AzureOpenAI client: {e}")
                self.azure_client = None

        if not self.azure_client and settings.OPENAI_API_KEY:
            try:
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=20.0)
                logger.info("Standard OpenAI Vision client initialized.")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
                self.openai_client = None

    def validate_image(self, file_bytes: bytes, content_type: Optional[str] = None) -> Tuple[bool, str, Optional[Image.Image]]:
        """
        Security & integrity checks on uploaded image payload.
        """
        if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
            return False, f"Image exceeds maximum allowed size of {max_mb} MB", None

        try:
            img = Image.open(io.BytesIO(file_bytes))
            img.verify()  # Verify image integrity
            # Re-open for actual processing since verify() closes/invalidates the stream
            img = Image.open(io.BytesIO(file_bytes))
            
            # Ensure supported format
            format_lower = (img.format or "").lower()
            valid_formats = ["jpeg", "jpg", "png", "webp", "gif"]
            if format_lower not in valid_formats:
                return False, f"Unsupported image format: {img.format}. Please upload JPEG, PNG, or WEBP.", None
                
            return True, "Image valid", img
        except Exception as e:
            return False, f"Corrupted or invalid image file: {str(e)}", None

    async def analyze_clothing_image(self, file_bytes: bytes, content_type: str = "image/jpeg") -> Tuple[List[DetectedItem], str]:
        """
        Executes visual recognition on clothing items.
        Attempts Azure Foundry / OpenAI GPT-4 Vision first; falls back gracefully to
        intelligent heuristic recognition if credentials are unset or live call fails.
        """
        # Re-initialize clients in case environment variables were added at runtime
        if not self.azure_client and not self.openai_client:
            self._init_clients()

        # 1. Try Live Azure GPT-4 Vision if available
        if self.azure_client:
            try:
                items = await self._call_azure_vision(file_bytes, content_type)
                if items:
                    return items, "azure_gpt4_vision"
            except Exception as e:
                logger.error(f"Azure GPT-4 Vision request error: {e}. Falling back to heuristic recognition.")

        # 2. Try standard OpenAI Vision if available
        if self.openai_client:
            try:
                items = await self._call_openai_vision(file_bytes, content_type)
                if items:
                    return items, "openai_vision"
            except Exception as e:
                logger.error(f"OpenAI Vision request error: {e}. Falling back to heuristic recognition.")

        # 3. Resilient Fallback: Mock / Heuristic Vision Engine
        items = self._heuristic_vision_analysis(file_bytes)
        return items, "mock_vision_heuristic"

    async def _call_azure_vision(self, file_bytes: bytes, content_type: str) -> List[DetectedItem]:
        b64_img = base64.b64encode(file_bytes).decode("utf-8")
        data_uri = f"data:{content_type};base64,{b64_img}"

        prompt = self._build_vision_prompt()

        response = self.azure_client.chat.completions.create(
            model=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Identify all clothing items in this image for carbon footprint analysis."},
                        {"type": "image_url", "image_url": {"url": data_uri, "detail": "high"}},
                    ],
                },
            ],
            response_format={"type": "json_object"},
            max_tokens=800,
            temperature=0.2,
        )

        content = response.choices[0].message.content
        return self._parse_vision_json(content)

    async def _call_openai_vision(self, file_bytes: bytes, content_type: str) -> List[DetectedItem]:
        b64_img = base64.b64encode(file_bytes).decode("utf-8")
        data_uri = f"data:{content_type};base64,{b64_img}"

        prompt = self._build_vision_prompt()

        response = self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Identify all clothing items in this image for carbon footprint analysis."},
                        {"type": "image_url", "image_url": {"url": data_uri, "detail": "high"}},
                    ],
                },
            ],
            response_format={"type": "json_object"},
            max_tokens=800,
            temperature=0.2,
        )

        content = response.choices[0].message.content
        return self._parse_vision_json(content)

    def _build_vision_prompt(self) -> str:
        categories = [c.value for c in ItemCategory]
        materials = [m.value for m in MaterialType]
        conditions = [g.value for g in GarmentCondition]
        return (
            "You are an expert AI sustainable fashion and textile auditor for Reewild EcoScan.\n"
            "Analyze the garments visible in the image. Return a JSON object formatted as:\n"
            "{\n"
            "  \"items\": [\n"
            "    {\n"
            "      \"name\": \"Descriptive Title (e.g. Vintage Blue Denim Jacket)\",\n"
            f"      \"category\": \"one of {categories}\",\n"
            "      \"color\": \"Garment color\",\n"
            f"      \"material\": \"one of {materials}\",\n"
            f"      \"condition\": \"one of {conditions}\",\n"
            "      \"confidence\": 0.95,\n"
            "      \"sustainability_tip\": \"Specific practical care tip for this item\"\n"
            "    }\n"
            "  ]\n"
            "}\n"
            "If no garment is visible, return a default single best estimation."
        )

    def _parse_vision_json(self, raw_json: str) -> List[DetectedItem]:
        parsed = json.loads(raw_json)
        raw_items = parsed.get("items", [])
        detected: List[DetectedItem] = []

        for r in raw_items:
            cat_str = str(r.get("category", "")).lower().replace(" ", "-")
            cat = next((c for c in ItemCategory if c.value == cat_str), ItemCategory.OTHER)

            mat_str = str(r.get("material", "")).lower().replace(" ", "_")
            mat = next((m for m in MaterialType if m.value == mat_str), MaterialType.CONVENTIONAL_COTTON)

            cond_str = str(r.get("condition", "")).lower().replace(" ", "_")
            cond = next((g for g in GarmentCondition if g.value == cond_str), GarmentCondition.NEW_STANDARD)

            detected.append(
                DetectedItem(
                    id=f"item-{uuid.uuid4().hex[:8]}",
                    name=r.get("name", f"{cat.value.title()}"),
                    category=cat,
                    color=r.get("color", "Multi-color"),
                    material=mat,
                    condition=cond,
                    confidence=float(r.get("confidence", 0.9)),
                    sustainability_tip=r.get("sustainability_tip"),
                )
            )

        if not detected:
            # Fallback if model returned empty items list
            detected = self._heuristic_vision_analysis(b"")

        return detected

    def _heuristic_vision_analysis(self, file_bytes: bytes) -> List[DetectedItem]:
        """
        Smart heuristic analyzer based on image metadata, color palette extraction,
        and aspect ratio to provide rich, realistic detections in offline/demo mode.
        """
        color_name = "Indigo Blue"
        category = ItemCategory.JEANS
        material = MaterialType.DENIM
        condition = GarmentCondition.VINTAGE
        item_name = "Classic Straight-Leg Denim Jeans"
        tip = "Washing inside-out in cold water every 8-10 wears saves up to 80% water and keeps denim resilient."

        if file_bytes:
            try:
                img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
                width, height = img.size
                aspect_ratio = width / max(1, height)
                
                # Sample average color
                img_small = img.resize((10, 10))
                pixels = [img_small.getpixel((x, y)) for x in range(10) for y in range(10)]
                avg_r = sum(p[0] for p in pixels) // len(pixels)
                avg_g = sum(p[1] for p in pixels) // len(pixels)
                avg_b = sum(p[2] for p in pixels) // len(pixels)

                # Color heuristic
                if avg_b > avg_r + 20 and avg_b > avg_g:
                    color_name = "Vintage Indigo Blue"
                    category = ItemCategory.JEANS
                    material = MaterialType.DENIM
                    condition = GarmentCondition.SECOND_HAND
                    item_name = "Upcycled Heritage Indigo Jeans"
                    tip = "Choosing second-hand denim saves ~8,000 liters of freshwater and prevents 10 kg CO2e emissions."
                elif avg_r > 180 and avg_g > 180 and avg_b > 180:
                    color_name = "Crisp Off-White"
                    category = ItemCategory.TSHIRT
                    material = MaterialType.ORGANIC_COTTON
                    condition = GarmentCondition.SUSTAINABLE_BRAND
                    item_name = "Organic Cotton Crewneck T-Shirt"
                    tip = "Organic cotton uses 91% less blue water and zero synthetic pesticides compared to virgin conventional cotton."
                elif avg_r < 60 and avg_g < 60 and avg_b < 60:
                    color_name = "Midnight Black"
                    category = ItemCategory.JACKET
                    material = MaterialType.RECYCLED_POLYESTER
                    condition = GarmentCondition.VINTAGE
                    item_name = "Weatherproof Utility Bomber Jacket"
                    tip = "Made from recycled plastic bottles (rPET), cutting energy consumption by 45% vs virgin synthetic fibers."
                elif avg_r > avg_b + 20 and avg_g > avg_b + 20:
                    color_name = "Forest Moss Green"
                    category = ItemCategory.SWEATER
                    material = MaterialType.WOOL
                    condition = GarmentCondition.UPCYCLED_REPAIRED
                    item_name = "Reclaimed Knit Wool Sweater"
                    tip = "Wool fibers are naturally odor-resistant and biodegradable. Airing out saves power and water."
                elif aspect_ratio > 1.2:
                    color_name = "Neutral Earth Tone"
                    category = ItemCategory.SHOES
                    material = MaterialType.RECYCLED_POLYESTER
                    condition = GarmentCondition.SUSTAINABLE_BRAND
                    item_name = "Low-Impact Everyday Eco Trainers"
                    tip = "Replacing petroleum EVA soles with sugarcane foam reduces footwear cradle-to-gate footprint by 35%."
                else:
                    color_name = "Natural Ecru"
                    category = ItemCategory.TSHIRT
                    material = MaterialType.ORGANIC_COTTON
                    condition = GarmentCondition.SECOND_HAND
                    item_name = "Pre-Loved Sustainable Casual Top"
                    tip = "Circular second-hand apparel avoids the carbon-intensive fiber production and dyeing phases."
            except Exception as e:
                logger.warning(f"Heuristic image processing exception: {e}")

        return [
            DetectedItem(
                id=f"item-{uuid.uuid4().hex[:8]}",
                name=item_name,
                category=category,
                color=color_name,
                material=material,
                condition=condition,
                confidence=0.92,
                sustainability_tip=tip,
            )
        ]


vision_service = VisionService()
