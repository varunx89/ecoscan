import threading
from typing import Dict, List, Optional
from app.models.clothing import ItemCategory, MaterialType, GarmentCondition
from app.models.offer import Offer, OfferCategory, UserWallet


class MemoryStore:
    """
    Thread-safe in-memory store for baseline carbon scores, material modifiers,
    curated eco-offers, user wallets, and scan histories.
    """

    def __init__(self):
        self._lock = threading.Lock()

        # Baseline carbon scores per clothing category (kg CO2e)
        # Benchmarked from WRAP, Ellen MacArthur Foundation, and UK Carbon Trust datasets
        self.baseline_scores: Dict[str, float] = {
            ItemCategory.TSHIRT.value: 5.0,
            ItemCategory.JEANS.value: 10.0,
            ItemCategory.JACKET.value: 15.0,
            ItemCategory.SHOES.value: 8.0,
            ItemCategory.DRESS.value: 11.5,
            ItemCategory.SWEATER.value: 13.0,
            ItemCategory.HOODIE.value: 12.0,
            ItemCategory.SHORTS.value: 4.5,
            ItemCategory.SKIRT.value: 6.0,
            ItemCategory.PANTS.value: 8.5,
            ItemCategory.COAT.value: 20.0,
            ItemCategory.SHIRT.value: 6.5,
            ItemCategory.ACCESSORIES.value: 3.0,
            ItemCategory.OTHER.value: 7.0,
        }

        # Textile & Material life-cycle multipliers
        self.material_multipliers: Dict[str, float] = {
            MaterialType.ORGANIC_COTTON.value: 0.70,
            MaterialType.CONVENTIONAL_COTTON.value: 1.00,
            MaterialType.RECYCLED_POLYESTER.value: 0.55,
            MaterialType.VIRGIN_POLYESTER.value: 1.25,
            MaterialType.DENIM.value: 1.15,
            MaterialType.WOOL.value: 1.40,
            MaterialType.LINEN.value: 0.60,
            MaterialType.LEATHER.value: 2.10,
            MaterialType.SILK.value: 1.30,
            MaterialType.SYNTHETIC_BLEND.value: 1.10,
            MaterialType.UNKNOWN.value: 1.00,
        }

        # Garment Condition / Lifecycle status multipliers
        # Second-hand and repaired garments avoid 75-85% of manufacturing footprint
        self.condition_multipliers: Dict[str, float] = {
            GarmentCondition.NEW_FAST_FASHION.value: 1.10,
            GarmentCondition.NEW_STANDARD.value: 1.00,
            GarmentCondition.SUSTAINABLE_BRAND.value: 0.65,
            GarmentCondition.SECOND_HAND.value: 0.15,
            GarmentCondition.VINTAGE.value: 0.20,
            GarmentCondition.UPCYCLED_REPAIRED.value: 0.25,
        }

        # Curated catalog of green partner offers
        self.offers: Dict[str, Offer] = {
            "OFFER-REEWILD-15": Offer(
                id="OFFER-REEWILD-15",
                title="15% Off Carbon-Neutral Apparel",
                description="Enjoy 15% off certified climate-positive essentials from Reewild's seasonal range.",
                brand="Reewild Essentials",
                category=OfferCategory.FASHION,
                required_points=50,
                discount_value="15% OFF",
                badge_text="Reewild Official",
                icon_name="leaf",
                promo_code="REEWILD-GREEN15",
            ),
            "OFFER-PATAGONIA-20": Offer(
                id="OFFER-PATAGONIA-20",
                title="$20 Voucher on Patagonia Worn Wear",
                description="Redeem against certified pre-owned and repaired gear on the official Patagonia Worn Wear store.",
                brand="Patagonia",
                category=OfferCategory.CIRCULAR,
                required_points=100,
                discount_value="$20 VOUCHER",
                badge_text="B-Corp Partner",
                icon_name="refresh-cw",
                promo_code="PATAGONIA-WORN20",
            ),
            "OFFER-THRIFT-PLUS": Offer(
                id="OFFER-THRIFT-PLUS",
                title="Free Thrift+ Donation Bag & £10 Credit",
                description="Order a free Thrift+ bag to re-home clothes and receive £10 store credit for your next pre-loved discovery.",
                brand="Thrift+",
                category=OfferCategory.CIRCULAR,
                required_points=75,
                discount_value="FREE BAG + £10",
                badge_text="Circular Choice",
                icon_name="package",
                promo_code="THRIFT-CIRCULAR75",
            ),
            "OFFER-ALLBIRDS-TREE": Offer(
                id="OFFER-ALLBIRDS-TREE",
                title="20% Off Allbirds Natural Footwear",
                description="Step lightly with shoes crafted from eucalyptus tree fiber and regenerative sugarcane SweetFoam.",
                brand="Allbirds",
                category=OfferCategory.FOOTWEAR,
                required_points=140,
                discount_value="20% OFF",
                badge_text="Low Carbon",
                icon_name="footprints",
                promo_code="ALLBIRDS-TREE20",
            ),
            "OFFER-GUPPYFRIEND": Offer(
                id="OFFER-GUPPYFRIEND",
                title="Free Microfiber Filter Laundry Bag",
                description="Prevent microplastics from entering aquatic ecosystems with the world's leading laundry wash bag.",
                brand="Guppyfriend",
                category=OfferCategory.CARE,
                required_points=120,
                discount_value="100% OFF ITEM",
                badge_text="Ocean Positive",
                icon_name="shield-check",
                promo_code="GUPPY-OCEAN100",
            ),
            "OFFER-REPAIR-CAFE": Offer(
                id="OFFER-REPAIR-CAFE",
                title="Free Garment Hemming & Stitch Repair",
                description="Complimentary professional alteration or invisible mend voucher at participating local repair hubs.",
                brand="Community Repair Hub",
                category=OfferCategory.REPAIR,
                required_points=90,
                discount_value="FREE SERVICE",
                badge_text="Community",
                icon_name="scissors",
                promo_code="REPAIR-FREE-CARE",
            ),
            "OFFER-TREENATION-3": Offer(
                id="OFFER-TREENATION-3",
                title="Plant 3 Native Trees in Your Forest",
                description="Fund 3 certified native trees planted in agroforestry rewilding corridors with real-time satellite tracking.",
                brand="Tree-Nation",
                category=OfferCategory.RESTORATION,
                required_points=200,
                discount_value="3 TREES PLANTED",
                badge_text="Rewilding",
                icon_name="trees",
                promo_code="TREENATION-FOREST3",
            ),
        }

        # User wallets store
        self.user_wallets: Dict[str, UserWallet] = {}

        # Scan history
        self.scans: Dict[str, dict] = {}

    def get_baseline_score(self, category: str) -> float:
        with self._lock:
            return self.baseline_scores.get(category.lower(), self.baseline_scores[ItemCategory.OTHER.value])

    def update_baseline_score(self, category: str, score: float) -> None:
        with self._lock:
            self.baseline_scores[category.lower()] = max(0.1, round(score, 2))

    def get_material_multiplier(self, material: str) -> float:
        with self._lock:
            return self.material_multipliers.get(material.lower(), 1.0)

    def get_condition_multiplier(self, condition: str) -> float:
        with self._lock:
            return self.condition_multipliers.get(condition.lower(), 1.0)

    def get_user_wallet(self, user_id: str = "default_user") -> UserWallet:
        with self._lock:
            if user_id not in self.user_wallets:
                self.user_wallets[user_id] = UserWallet(user_id=user_id, balance_points=0)
            return self.user_wallets[user_id].model_copy(deep=True)

    def credit_user_wallet(self, points: int, saved_co2_kg: float, user_id: str = "default_user") -> UserWallet:
        with self._lock:
            if user_id not in self.user_wallets:
                self.user_wallets[user_id] = UserWallet(user_id=user_id, balance_points=0)
            wallet = self.user_wallets[user_id]
            wallet.balance_points += points
            wallet.total_earned_points += points
            wallet.total_saved_co2_kg = round(wallet.total_saved_co2_kg + saved_co2_kg, 2)
            return wallet.model_copy(deep=True)

    def sync_user_wallet_points(self, points: int, user_id: str = "default_user") -> UserWallet:
        with self._lock:
            if user_id not in self.user_wallets:
                self.user_wallets[user_id] = UserWallet(user_id=user_id, balance_points=0)
            wallet = self.user_wallets[user_id]
            wallet.balance_points = points
            if points > wallet.total_earned_points:
                wallet.total_earned_points = points
            return wallet.model_copy(deep=True)

    def redeem_offer(self, offer_id: str, user_id: str = "default_user") -> tuple[bool, Optional[Offer], Optional[str], int]:
        with self._lock:
            if offer_id not in self.offers:
                return False, None, "Offer not found", 0
            
            if user_id not in self.user_wallets:
                self.user_wallets[user_id] = UserWallet(user_id=user_id, balance_points=0)
            
            wallet = self.user_wallets[user_id]
            offer = self.offers[offer_id]

            if offer_id in wallet.redeemed_offer_ids:
                return True, offer, "Offer already redeemed; here is your saved code", wallet.balance_points

            if wallet.balance_points < offer.required_points:
                needed = offer.required_points - wallet.balance_points
                return False, offer, f"Insufficient points. You need {needed} more points to redeem this offer.", wallet.balance_points

            wallet.balance_points -= offer.required_points
            wallet.redeemed_offer_ids.append(offer_id)
            return True, offer, "Offer redeemed successfully!", wallet.balance_points

    def get_offers_for_user(self, user_points: Optional[int] = None, user_id: str = "default_user") -> List[Offer]:
        with self._lock:
            wallet = self.user_wallets.get(user_id, UserWallet(user_id=user_id, balance_points=0))
            effective_points = user_points if user_points is not None else wallet.balance_points
            result = []
            for offer in self.offers.values():
                is_redeemed = offer.id in wallet.redeemed_offer_ids
                is_redeemable = effective_points >= offer.required_points
                points_needed = max(0, offer.required_points - effective_points)
                
                # Only expose promo code if redeemed
                code = offer.promo_code if is_redeemed else None
                
                offer_item = offer.model_copy(update={
                    "is_redeemable": is_redeemable,
                    "points_needed": points_needed,
                    "is_redeemed": is_redeemed,
                    "promo_code": code,
                })
                result.append(offer_item)
            
            # Sort: redeemable first, then by required_points ascending
            return sorted(result, key=lambda o: (0 if o.is_redeemable else 1, o.required_points))

    def save_scan(self, scan_id: str, scan_data: dict) -> None:
        with self._lock:
            self.scans[scan_id] = scan_data

    def get_scan(self, scan_id: str) -> Optional[dict]:
        with self._lock:
            return self.scans.get(scan_id)


# Global singleton in-memory store
store = MemoryStore()
