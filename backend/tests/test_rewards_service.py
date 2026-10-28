from app.services.rewards_service import rewards_service
from app.storage.memory_store import store
from app.config import settings


def test_calculate_scan_points():
    # Zero savings returns MIN_SCAN_POINTS
    pts_zero = rewards_service.calculate_scan_points(0.0)
    assert pts_zero == settings.MIN_SCAN_POINTS

    # 5.0 kg savings = 5.0 * 10 + 15 = 65 points
    pts_5kg = rewards_service.calculate_scan_points(5.0)
    assert pts_5kg == 65

    # Extreme high savings clamped at MAX_SCAN_POINTS
    pts_huge = rewards_service.calculate_scan_points(100.0)
    assert pts_huge == settings.MAX_SCAN_POINTS


def test_credit_rewards_wallet():
    user_id = "rewards_test_user"
    initial_wallet = store.get_user_wallet(user_id)
    init_points = initial_wallet.balance_points

    pts_earned, updated_wallet = rewards_service.credit_scan_rewards(3.5, user_id=user_id)
    assert pts_earned == int(round(3.5 * 10 + 15))
    assert updated_wallet.balance_points == init_points + pts_earned


def test_user_tier_levels():
    tier_seedling = rewards_service.get_user_tier(50)
    assert tier_seedling["name"] == "Conscious Seedling"

    tier_sprout = rewards_service.get_user_tier(150)
    assert tier_sprout["name"] == "Eco Sprout"

    tier_guardian = rewards_service.get_user_tier(300)
    assert tier_guardian["name"] == "Forest Guardian"

    tier_champion = rewards_service.get_user_tier(600)
    assert tier_champion["name"] == "Climate Champion"
