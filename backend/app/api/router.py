from fastapi import APIRouter
from app.api.v1 import health, scan, offers, items

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(scan.router)
api_router.include_router(offers.router)
api_router.include_router(items.router)
