export type ItemCategory =
  | 't-shirt'
  | 'jeans'
  | 'jacket'
  | 'shoes'
  | 'dress'
  | 'sweater'
  | 'hoodie'
  | 'shorts'
  | 'skirt'
  | 'pants'
  | 'coat'
  | 'shirt'
  | 'accessories'
  | 'other'

export type MaterialType =
  | 'organic_cotton'
  | 'conventional_cotton'
  | 'recycled_polyester'
  | 'virgin_polyester'
  | 'denim'
  | 'wool'
  | 'linen'
  | 'leather'
  | 'silk'
  | 'synthetic_blend'
  | 'unknown'

export type GarmentCondition =
  | 'new_fast_fashion'
  | 'new_standard'
  | 'sustainable_brand'
  | 'second_hand'
  | 'vintage'
  | 'upcycled_repaired'

export interface DetectedItem {
  id: string
  name: string
  category: ItemCategory
  color?: string
  material: MaterialType
  condition: GarmentCondition
  confidence: number
  sustainability_tip?: string
}

export interface ScoredClothingItem {
  item: DetectedItem
  baseline_co2_kg: number
  material_multiplier: number
  condition_multiplier: number
  estimated_co2_kg: number
  eco_savings_kg: number
  item_reward_points: number
}

export interface EnvironmentalEquivalencies {
  car_km_avoided: number
  smartphone_charges: number
  trees_days_absorption: number
}

export interface ScanResponse {
  scan_id: string
  timestamp: string
  vision_source: 'azure_gpt4_vision' | 'mock_vision_heuristic' | string
  items: ScoredClothingItem[]
  total_carbon_kg: number
  total_baseline_kg: number
  total_savings_kg: number
  total_reward_points: number
  equivalencies: EnvironmentalEquivalencies
  sustainability_summary: string
}

export type OfferCategory =
  | 'fashion'
  | 'circular'
  | 'footwear'
  | 'care'
  | 'restoration'
  | 'repair'

export interface Offer {
  id: string
  title: string
  description: string
  brand: string
  category: OfferCategory
  required_points: number
  discount_value: string
  badge_text: string
  icon_name: string
  is_redeemable: boolean
  points_needed: number
  is_redeemed: boolean
  promo_code?: string
}

export interface OfferRedeemResponse {
  success: boolean
  offer_id: string
  promo_code: string
  remaining_points: number
  title: string
  brand: string
  instructions: string
  message: string
}

export interface UserWallet {
  user_id: string
  balance_points: number
  total_earned_points: number
  total_saved_co2_kg: number
  redeemed_offer_ids: string[]
}

export interface UserTier {
  name: string
  badge: string
  perk: string
  progress_pct: number
  next_tier?: string | null
  points_to_next: number
}

export interface WalletStatus {
  wallet: UserWallet
  tier: UserTier
}

export interface CarbonScoresData {
  baseline_carbon_scores_kg: Record<string, number>
  material_lifecycle_multipliers: Record<string, number>
  condition_lifecycle_multipliers: Record<string, number>
  carbon_assumptions_metadata: {
    dataset_benchmark: string
    unit: string
    scope: string
    formula: string
    eco_savings_formula: string
    points_formula: string
  }
}
