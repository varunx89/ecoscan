from typing import List, Tuple
from app.models.clothing import (
    DetectedItem,
    ScoredClothingItem,
    EnvironmentalEquivalencies,
    ItemCategory,
    MaterialType,
    GarmentCondition,
)
from app.storage.memory_store import store


class CarbonService:
    """
    Life Cycle Assessment (LCA) based carbon scoring service for apparel.
    Combines base garment category footprint with material textile impacts
    and circular lifecycle condition modifiers.
    """

    # Environmental conversion factors
    # - Average petrol car emits ~0.17 kg CO2e per km (DEFRA / EPA)
    # - Fully charging a modern smartphone consumes ~0.015 kWh (~0.006 kg CO2e)
    # - A mature urban tree absorbs approximately 22 kg CO2 per year (~0.06 kg CO2/day)
    KG_CO2_PER_CAR_KM = 0.17
    KG_CO2_PER_SMARTPHONE_CHARGE = 0.006
    KG_CO2_PER_TREE_DAY = 0.06

    def score_item(self, item: DetectedItem) -> ScoredClothingItem:
        baseline = store.get_baseline_score(item.category.value)
        mat_mult = store.get_material_multiplier(item.material.value)
        cond_mult = store.get_condition_multiplier(item.condition.value)

        # Net estimated carbon footprint (kg CO2e)
        estimated_co2 = round(baseline * mat_mult * cond_mult, 2)

        # Conventional benchmark (virgin conventional cotton / synthetic, brand new)
        benchmark_co2 = round(baseline * 1.05 * 1.0, 2)

        # Eco-savings achieved through conscious choice, circularity, or sustainable fiber
        # Minimum 0.5 kg awarded for mindful auditing
        eco_savings = max(0.5, round(benchmark_co2 - estimated_co2, 2))

        # Item-level reward points contribution (10 pts per kg saved + 5 pts base per item)
        item_points = max(10, int(round(eco_savings * 10 + 5)))

        # Tailored care tip if not already provided
        tip = item.sustainability_tip or self._generate_care_tip(item)
        item_with_tip = item.model_copy(update={"sustainability_tip": tip})

        return ScoredClothingItem(
            item=item_with_tip,
            baseline_co2_kg=baseline,
            material_multiplier=mat_mult,
            condition_multiplier=cond_mult,
            estimated_co2_kg=estimated_co2,
            eco_savings_kg=eco_savings,
            item_reward_points=item_points,
        )

    def score_items(self, items: List[DetectedItem]) -> Tuple[List[ScoredClothingItem], float, float, float, EnvironmentalEquivalencies]:
        scored_items = [self.score_item(item) for item in items]
        
        total_carbon = round(sum(s.estimated_co2_kg for s in scored_items), 2)
        total_baseline = round(sum(s.baseline_co2_kg for s in scored_items), 2)
        total_savings = round(sum(s.eco_savings_kg for s in scored_items), 2)

        # Environmental equivalencies
        car_km = round(total_savings / self.KG_CO2_PER_CAR_KM, 1)
        charges = int(round(total_savings / self.KG_CO2_PER_SMARTPHONE_CHARGE))
        tree_days = round(total_savings / self.KG_CO2_PER_TREE_DAY, 1)

        equivalencies = EnvironmentalEquivalencies(
            car_km_avoided=car_km,
            smartphone_charges=charges,
            trees_days_absorption=tree_days,
        )

        return scored_items, total_carbon, total_baseline, total_savings, equivalencies

    def _generate_care_tip(self, item: DetectedItem) -> str:
        if item.material in [MaterialType.VIRGIN_POLYESTER, MaterialType.RECYCLED_POLYESTER, MaterialType.SYNTHETIC_BLEND]:
            return "Wash at 30°C inside a micro-waste filter bag to prevent microplastic shedding into waterways."
        elif item.material in [MaterialType.WOOL, MaterialType.SILK]:
            return "Air out between wears instead of frequent laundering; gentle spot cleaning protects natural protein fibers."
        elif item.category == ItemCategory.JEANS:
            return "Wash inside-out in cold water every 5-10 wears and hang dry to preserve indigo dye and stretch integrity."
        elif item.condition in [GarmentCondition.SECOND_HAND, GarmentCondition.VINTAGE]:
            return "Extending a pre-loved garment's active life by just 9 months reduces its overall carbon footprint by 30%."
        elif item.material == MaterialType.LEATHER:
            return "Condition with natural beeswax or plant oils annually to prevent cracking and ensure multi-decade durability."
        else:
            return "Line dry whenever possible—skipping the tumble dryer saves up to 1.3 kg CO2e per average laundry cycle."


carbon_service = CarbonService()
