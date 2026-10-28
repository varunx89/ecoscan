import React from 'react'
import { X, BookOpen, Layers, Award, ShieldCheck, Scale } from 'lucide-react'

interface MethodologyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-emerald-500/30 p-6 sm:p-8 shadow-2xl my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Methodology & Carbon Footprint Assumptions
            </h3>
            <p className="text-xs text-slate-400">
              Scientific benchmarks, textile multipliers, and reward point algorithms.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
          {/* 1. Baseline Assumptions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <Scale className="w-4 h-4" />
              <h4>1. Apparel Baseline Emissions (Cradle-to-Grave Benchmark)</h4>
            </div>
            <p className="leading-relaxed text-slate-400">
              Carbon scores represent the estimated kilograms of CO₂ equivalent (kg CO₂e) generated across the full life cycle—from agricultural extraction and synthetic synthesis to dyeing, assembly, distribution, consumer care, and end-of-life disposal.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono">
                    <th className="p-2.5">Garment Item</th>
                    <th className="p-2.5">Benchmark Footprint</th>
                    <th className="p-2.5">Lifecycle Data Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr><td className="p-2.5 text-white font-sans">👕 T-shirt</td><td className="p-2.5 text-emerald-400 font-bold">5.0 kg CO₂e</td><td className="p-2.5 text-slate-400 font-sans">WRAP UK & Ellen MacArthur Foundation</td></tr>
                  <tr><td className="p-2.5 text-white font-sans">👖 Jeans</td><td className="p-2.5 text-emerald-400 font-bold">10.0 kg CO₂e</td><td className="p-2.5 text-slate-400 font-sans">Levi Strauss & Co. LCA Study</td></tr>
                  <tr><td className="p-2.5 text-white font-sans">🧥 Jacket</td><td className="p-2.5 text-emerald-400 font-bold">15.0 kg CO₂e</td><td className="p-2.5 text-slate-400 font-sans">European Environment Agency (EEA)</td></tr>
                  <tr><td className="p-2.5 text-white font-sans">👟 Shoes / Sneakers</td><td className="p-2.5 text-emerald-400 font-bold">8.0 kg CO₂e</td><td className="p-2.5 text-slate-400 font-sans">MIT Materials Systems Laboratory</td></tr>
                  <tr><td className="p-2.5 text-white font-sans">👗 Dress</td><td className="p-2.5 text-emerald-400 font-bold">11.5 kg CO₂e</td><td className="p-2.5 text-slate-400 font-sans">Quantis Apparel LCA Protocol</td></tr>
                  <tr><td className="p-2.5 text-white font-sans">🧶 Sweater</td><td className="p-2.5 text-emerald-400 font-bold">13.0 kg CO₂e</td><td className="p-2.5 text-slate-400 font-sans">Higg MSI (Materials Sustainability Index)</td></tr>
                  <tr><td className="p-2.5 text-white font-sans">🧥 Heavy Winter Coat</td><td className="p-2.5 text-emerald-400 font-bold">20.0 kg CO₂e</td><td className="p-2.5 text-slate-400 font-sans">Textile Exchange Carbon Benchmark</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Modifiers */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-teal-400">
              <Layers className="w-4 h-4" />
              <h4>2. Material & Circular Lifecycle Multipliers</h4>
            </div>
            <p className="leading-relaxed text-slate-400">
              Our dynamic calculation engine adjusts base scores by cross-referencing identified materials and garment lifecycle conditions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white">Material Multipliers</div>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                  <li>• Recycled Polyester: <strong>0.55x</strong> (-45%)</li>
                  <li>• Linen / Hemp: <strong>0.60x</strong> (-40%)</li>
                  <li>• Organic Cotton: <strong>0.70x</strong> (-30%)</li>
                  <li>• Conventional Cotton: <strong>1.00x</strong> (Baseline)</li>
                  <li>• Denim (Wash/Dye): <strong>1.15x</strong> (+15%)</li>
                  <li>• Virgin Synthetics: <strong>1.25x</strong> (+25%)</li>
                  <li>• Leather / Animal Hide: <strong>2.10x</strong> (+110%)</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white">Condition / Circularity Multipliers</div>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                  <li>• Second-Hand: <strong>0.15x</strong> (85% footprint avoided!)</li>
                  <li>• Vintage Discovery: <strong>0.20x</strong> (80% avoided)</li>
                  <li>• Repaired / Upcycled: <strong>0.25x</strong> (75% avoided)</li>
                  <li>• Sustainable Brand: <strong>0.65x</strong> (35% avoided)</li>
                  <li>• Standard New: <strong>1.00x</strong> (Standard baseline)</li>
                  <li>• Ultra Fast-Fashion: <strong>1.10x</strong> (+10% short life)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Rewards Formula */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Award className="w-4 h-4" />
              <h4>3. Eco-Savings to Reward Points Conversion Formula</h4>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 font-mono text-[11px] space-y-2 text-slate-300">
              <div className="text-amber-300 font-bold">Formula Specification:</div>
              <div>1. Net CO₂ = Baseline Category × Material Mult × Condition Mult</div>
              <div>2. Eco-Savings (kg) = max(0.5, Conventional Benchmark - Net CO₂)</div>
              <div>3. Scan Points = clamp(round(Savings × 10 + 15), 25, 500)</div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Users are rewarded 10 Eco-Reward Points for every full kilogram of carbon avoided, plus a 15-point conscious auditing bonus per scan, redeemable against partner vouchers, discounts, and tree restoration projects.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  )
}
