from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class OfferCategory(str, Enum):
    FASHION = "fashion"
    CIRCULAR = "circular"
    FOOTWEAR = "footwear"
    CARE = "care"
    RESTORATION = "restoration"
    REPAIR = "repair"


class Offer(BaseModel):
    id: str = Field(..., description="Unique identifier for the offer")
    title: str = Field(..., description="Offer headline, e.g. 15% Off Carbon-Neutral Apparel")
    description: str = Field(..., description="Detailed offer terms and brand info")
    brand: str = Field(..., description="Partner brand name")
    category: OfferCategory = Field(default=OfferCategory.FASHION)
    required_points: int = Field(..., description="Reward points required to unlock")
    discount_value: str = Field(..., description="Human friendly savings: e.g. 15% OFF, $20 VOUCHER")
    badge_text: str = Field(default="Eco Partner")
    icon_name: str = Field(default="leaf", description="Lucide icon reference")
    is_redeemable: bool = Field(default=False, description="Computed dynamically based on user points")
    points_needed: int = Field(default=0, description="Remaining points to unlock")
    is_redeemed: bool = Field(default=False)
    promo_code: Optional[str] = Field(default=None, description="Secret code revealed on redemption")


class OfferRedeemRequest(BaseModel):
    offer_id: str
    user_id: str = Field(default="default_user")
    user_points: Optional[int] = Field(default=None, description="Optional points to sync with session")


class OfferRedeemResponse(BaseModel):
    success: bool
    offer_id: str
    promo_code: str
    remaining_points: int
    title: str
    brand: str
    instructions: str
    message: str


class UserWallet(BaseModel):
    user_id: str = "default_user"
    balance_points: int = 0
    total_earned_points: int = 0
    total_saved_co2_kg: float = 0.0
    redeemed_offer_ids: List[str] = []
