import time
from fastapi import APIRouter
from app.config import settings
from app.services.vision_service import vision_service

router = APIRouter()

START_TIME = time.time()


@router.get("/health", tags=["System"])
def health_check():
    azure_configured = bool(settings.AZURE_OPENAI_ENDPOINT and settings.AZURE_OPENAI_API_KEY)
    openai_configured = bool(settings.OPENAI_API_KEY)
    
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "vision_provider": {
            "azure_openai_configured": azure_configured,
            "openai_configured": openai_configured,
            "active_mode": "azure_foundry_gpt4_vision" if azure_configured else ("openai_vision" if openai_configured else "mock_vision_heuristic"),
            "model_deployment": settings.AZURE_OPENAI_DEPLOYMENT_NAME if azure_configured else "gpt-4o",
        },
        "features": {
            "in_memory_storage": True,
            "camera_capture_supported": True,
            "file_upload_supported": True,
            "extensible_lca_scoring": True,
            "eco_rewards_wallet": True,
        }
    }
