from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from app.models.offer import (
    Offer,
    OfferRedeemRequest,
    OfferRedeemResponse,
    UserWallet,
)
from app.services.rewards_service import rewards_service
from app.storage.memory_store import store

router = APIRouter()


class WalletSyncRequest(BaseModel):
    user_id: str = "default_user"
    points: int = Field(..., ge=0)


@router.get("/offers", response_model=List[Offer], tags=["Offers & Rewards"])
def get_offers(
    user_points: Optional[int] = Query(default=None, ge=0, description="Optional user point balance to calculate unlock status"),
    user_id: str = Query(default="default_user", description="User identifier"),
    category: Optional[str] = Query(default=None, description="Filter by offer category"),
):
    """
    Returns available eco-partner offers. If user_points or wallet points are available,
    marks offers as redeemable or locked with the exact points needed to unlock.
    """
    wallet = store.get_user_wallet(user_id)
    effective_points = user_points if user_points is not None else wallet.balance_points
    
    offers = store.get_offers_for_user(user_points=effective_points, user_id=user_id)
    
    if category:
        offers = [o for o in offers if o.category.value.lower() == category.lower()]
        
    return offers


@router.post("/offers/redeem", response_model=OfferRedeemResponse, tags=["Offers & Rewards"])
def redeem_offer(payload: OfferRedeemRequest = Body(...)):
    """
    Redeems an eco-offer using earned reward points.
    Validates point balance, deducts points from the user's wallet, and delivers the voucher code.
    """
    if payload.user_points is not None:
        store.sync_user_wallet_points(payload.user_points, payload.user_id)

    success, offer, message, remaining_balance = store.redeem_offer(
        offer_id=payload.offer_id,
        user_id=payload.user_id,
    )

    if not success or not offer:
        raise HTTPException(status_code=400, detail=message)

    return OfferRedeemResponse(
        success=True,
        offer_id=offer.id,
        promo_code=offer.promo_code or "ECOSCAN-EXCLUSIVE",
        remaining_points=remaining_balance,
        title=offer.title,
        brand=offer.brand,
        instructions=f"Use coupon code '{offer.promo_code}' during checkout at {offer.brand} website to apply your discount.",
        message=message,
    )


@router.get("/offers/wallet", tags=["Offers & Rewards"])
def get_wallet(user_id: str = Query(default="default_user")):
    """
    Returns the user's current eco-wallet status, tier level, and badges.
    """
    wallet = store.get_user_wallet(user_id)
    tier = rewards_service.get_user_tier(wallet.balance_points)
    
    return {
        "wallet": wallet,
        "tier": tier,
    }


@router.post("/offers/wallet/sync", response_model=UserWallet, tags=["Offers & Rewards"])
def sync_wallet(payload: WalletSyncRequest = Body(...)):
    """
    Syncs client points with server in-memory wallet.
    """
    return store.sync_user_wallet_points(points=payload.points, user_id=payload.user_id)
