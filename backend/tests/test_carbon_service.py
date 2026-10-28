import pytest
from app.models.clothing import (
    DetectedItem,
    ItemCategory,
    MaterialType,
    GarmentCondition,
)
from app.services.carbon_service import carbon_service
from app.storage.memory_store import store


def test_baseline_scores_present():
    # Mandatory baseline scores specified in the brief
    assert store.get_baseline_score("t-shirt") == 5.0
    assert store.get_baseline_score("jeans") == 10.0
    assert store.get_baseline_score("jacket") == 15.0
    assert store.get_baseline_score("shoes") == 8.0
    # Additional items
    assert store.get_baseline_score("dress") == 11.5
    assert store.get_baseline_score("sweater") == 13.0
    assert store.get_baseline_score("coat") == 20.0


def test_score_standard_tshirt():
    item = DetectedItem(
        id="test-1",
        name="Basic Cotton Tee",
        category=ItemCategory.TSHIRT,
        material=MaterialType.CONVENTIONAL_COTTON,
        condition=GarmentCondition.NEW_STANDARD,
    )
    scored = carbon_service.score_item(item)
    assert scored.baseline_co2_kg == 5.0
    assert scored.material_multiplier == 1.0
    assert scored.condition_multiplier == 1.0
    assert scored.estimated_co2_kg == 5.0
    assert scored.eco_savings_kg >= 0.25
    assert scored.item_reward_points >= 10


def test_score_vintage_denim_jeans_savings():
    item = DetectedItem(
        id="test-2",
        name="Vintage Levi's Jeans",
        category=ItemCategory.JEANS,
        material=MaterialType.DENIM,
        condition=GarmentCondition.SECOND_HAND,
    )
    scored = carbon_service.score_item(item)
    assert scored.baseline_co2_kg == 10.0
    assert scored.material_multiplier == 1.15
    assert scored.condition_multiplier == 0.15
    # Estimated = 10 * 1.15 * 0.15 = 1.725 -> 1.73
    assert scored.estimated_co2_kg == pytest.approx(1.72, abs=0.05)
    # Benchmark = 10 * 1.05 = 10.5. Savings = 10.5 - 1.72 = ~8.78 kg CO2
    assert scored.eco_savings_kg > 8.0
    assert scored.item_reward_points > 80


def test_environmental_equivalencies():
    items = [
        DetectedItem(
            id="item-a",
            name="Organic Hoodie",
            category=ItemCategory.HOODIE,
            material=MaterialType.ORGANIC_COTTON,
            condition=GarmentCondition.SUSTAINABLE_BRAND,
        ),
        DetectedItem(
            id="item-b",
            name="Second-Hand Leather Jacket",
            category=ItemCategory.JACKET,
            material=MaterialType.LEATHER,
            condition=GarmentCondition.SECOND_HAND,
        ),
    ]
    scored, total_co2, total_base, total_savings, eq = carbon_service.score_items(items)
    assert len(scored) == 2
    assert total_co2 > 0
    assert total_savings > 0
    assert eq.car_km_avoided > 0
    assert eq.smartphone_charges > 0
    assert eq.trees_days_absorption > 0
