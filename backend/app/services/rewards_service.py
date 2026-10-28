from typing import Dict, Any
from app.config import settings
from app.storage.memory_store import store
from app.models.offer import UserWallet


class RewardsService:
    """
    Eco-reward calculation engine translating kilograms of carbon avoided
    into actionable reward points redeemable with sustainable brand partners.

    Formula:
        Scan Points = Clamp(
            round(total_eco_savings_kg * POINTS_PER_KG_SAVED + BASE_SCAN_POINTS),
            MIN_SCAN_POINTS,
            MAX_SCAN_POINTS
        )
    """

    def calculate_scan_points(self, total_savings_kg: float) -> int:
        raw_points = total_savings_kg * settings.POINTS_PER_KG_SAVED + settings.BASE_SCAN_POINTS
        rounded_points = int(round(raw_points))
        clamped_points = max(settings.MIN_SCAN_POINTS, min(settings.MAX_SCAN_POINTS, rounded_points))
        return clamped_points

    def credit_scan_rewards(self, total_savings_kg: float, user_id: str = "default_user") -> tuple[int, UserWallet]:
        earned_points = self.calculate_scan_points(total_savings_kg)
        updated_wallet = store.credit_user_wallet(
            points=earned_points,
            saved_co2_kg=total_savings_kg,
            user_id=user_id,
        )
        return earned_points, updated_wallet

    def get_user_tier(self, balance_points: int) -> Dict[str, Any]:
        if balance_points >= 500:
            return {
                "name": "Climate Champion",
                "badge": "👑",
                "perk": "1.5x multiplier on community challenge rewards",
                "progress_pct": 100,
                "next_tier": None,
                "points_to_next": 0,
            }
        elif balance_points >= 250:
            return {
                "name": "Forest Guardian",
                "badge": "🌲",
                "perk": "Early access to limited partner drops",
                "progress_pct": int(((balance_points - 250) / 250) * 100),
                "next_tier": "Climate Champion",
                "points_to_next": 500 - balance_points,
            }
        elif balance_points >= 100:
            return {
                "name": "Eco Sprout",
                "badge": "🌿",
                "perk": "Free shipping on circular partner orders",
                "progress_pct": int(((balance_points - 100) / 150) * 100),
                "next_tier": "Forest Guardian",
                "points_to_next": 250 - balance_points,
            }
        else:
            return {
                "name": "Conscious Seedling",
                "badge": "🌱",
                "perk": "Welcome bonus unlocked",
                "progress_pct": int((balance_points / 100) * 100),
                "next_tier": "Eco Sprout",
                "points_to_next": 100 - balance_points,
            }

    def format_sustainability_summary(self, total_savings_kg: float, items_count: int, points: int) -> str:
        return (
            f"Identified {items_count} clothing garment(s). By choosing pre-loved, mindful materials, "
            f"or durable garment care, you avoided an estimated {total_savings_kg:.1f} kg CO2e, "
            f"earning +{points} Eco-Reward Points!"
        )


rewards_service = RewardsService()
