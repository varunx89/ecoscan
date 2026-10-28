import React from 'react'
import {
  ScanResponse,
  ScoredClothingItem,
} from '../types'
import {
  Leaf,
  Sparkles,
  Car,
  Smartphone,
  Trees,
  Award,
  ArrowDownRight,
  Tag,
  Info,
  CheckCircle2,
  Cpu,
} from 'lucide-react'

interface ScanResultsProps {
  results: ScanResponse
  onViewOffers: () => void
  onNewScan: () => void
}

export const ScanResults: React.FC<ScanResultsProps> = ({
  results,
  onViewOffers,
  onNewScan,
}) => {
  const {
    items,
    total_carbon_kg,
    total_baseline_kg,
    total_savings_kg,
    total_reward_points,
    equivalencies,
    vision_source,
    sustainability_summary,
  } = results

  // Calculate percentage of emissions avoided compared to baseline
  const savingsPct = total_baseline_kg > 0
    ? Math.min(95, Math.round((total_savings_kg / total_baseline_kg) * 100))
    : 0

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Summary Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-emerald-500/30 p-6 sm:p-8 eco-glow">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Scan Assessment Complete
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-teal-400" />
                {vision_source === 'azure_gpt4_vision' ? 'Azure GPT-4 Vision' : 'EcoScan Heuristic Engine'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Environmental Impact Breakdown
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {sustainability_summary}
            </p>
          </div>

          {/* Points Highlight Pill */}
          <div className="w-full sm:w-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 text-center sm:text-right shadow-xl">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-end gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              Earned Eco-Rewards
            </div>
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 font-mono">
              +{total_reward_points}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Available immediately for partner redemption
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-emerald-500/15">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Actual Garment Footprint</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {total_carbon_kg.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-400">kg CO₂e</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Based on textile composition & condition
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Conventional New Baseline</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-400 font-mono line-through opacity-75">
                {total_baseline_kg.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Standard fast-fashion manufacturing
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/25">
            <div className="text-xs text-emerald-400 font-semibold mb-1 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Avoided Carbon Footprint
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {total_savings_kg.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-300">kg CO₂e</span>
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                -{savingsPct}%
              </span>
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">
              Emissions prevented by conscious choice
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Equivalencies */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Real-World Climate Equivalencies
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white font-mono">
                {equivalencies.car_km_avoided} km
              </div>
              <div className="text-xs text-slate-400">
                Car travel emissions avoided
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white font-mono">
                {equivalencies.smartphone_charges.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                Full smartphone battery recharges
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white font-mono">
                {equivalencies.trees_days_absorption} days
              </div>
              <div className="text-xs text-slate-400">
                Urban tree carbon absorption
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Identified Garments List */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Detected Garments & Life-Cycle Analysis ({items.length})
        </h3>
        <div className="space-y-4">
          {items.map((scored, idx) => (
            <ItemCard key={scored.item.id || idx} scored={scored} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onNewScan}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-sm"
        >
          Scan Another Garment
        </button>

        <button
          type="button"
          onClick={onViewOffers}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-500/25 transition text-sm flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          <span>Redeem Eco-Rewards ({total_reward_points} pts)</span>
        </button>
      </div>
    </div>
  )
}

function ItemCard({ scored }: { scored: ScoredClothingItem }) {
  const { item, baseline_co2_kg, estimated_co2_kg, eco_savings_kg, item_reward_points } = scored

  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-card border border-emerald-500/20 hover:border-emerald-500/40 transition">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {item.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {item.material.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              {item.condition.replace(/_/g, ' ')}
            </span>
          </div>
          <h4 className="text-lg font-bold text-white">{item.name}</h4>
          {item.color && (
            <p className="text-xs text-slate-400 mt-0.5">Primary Color: {item.color}</p>
          )}
        </div>

        {/* Item Score Pill */}
        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
          <div>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {estimated_co2_kg.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">kg CO₂e</span>
          </div>
          <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20 mt-1">
            +{item_reward_points} pts
          </div>
        </div>
      </div>

      {/* Comparison progress bar */}
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>Footprint vs Baseline</span>
          <span>
            {estimated_co2_kg.toFixed(1)} kg / {baseline_co2_kg.toFixed(1)} kg baseline
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(10, (estimated_co2_kg / Math.max(1, baseline_co2_kg)) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* Circularity & Care Tip */}
      {item.sustainability_tip && (
        <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{item.sustainability_tip}</p>
        </div>
      )}
    </div>
  )
}
