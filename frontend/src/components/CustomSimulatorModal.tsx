import React, { useState } from 'react'
import { X, Sliders, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { simulateCustomItem } from '../services/api'
import { ScoredClothingItem } from '../types'

interface CustomSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CustomSimulatorModal: React.FC<CustomSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('My Custom Garment')
  const [category, setCategory] = useState('t-shirt')
  const [material, setMaterial] = useState('organic_cotton')
  const [condition, setCondition] = useState('second_hand')
  const [loading, setLoading] = useState(false)
  const [simResult, setSimResult] = useState<ScoredClothingItem | null>(null)

  if (!isOpen) return null

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await simulateCustomItem(name, category, material, condition)
      setSimResult(result)
    } catch (err) {
      console.error('Simulation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Garment Impact Simulator</h3>
            <p className="text-xs text-slate-400">Preview footprint & rewards before shopping</p>
          </div>
        </div>

        <form onSubmit={handleSimulate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Garment Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="t-shirt">T-shirt (5.0 kg)</option>
                <option value="jeans">Jeans (10.0 kg)</option>
                <option value="jacket">Jacket (15.0 kg)</option>
                <option value="shoes">Shoes (8.0 kg)</option>
                <option value="dress">Dress (11.5 kg)</option>
                <option value="sweater">Sweater (13.0 kg)</option>
                <option value="coat">Coat (20.0 kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Textile</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="organic_cotton">Organic Cotton (-30%)</option>
                <option value="recycled_polyester">Recycled Poly (-45%)</option>
                <option value="linen">Linen / Hemp (-40%)</option>
                <option value="conventional_cotton">Conventional Cotton (1.0x)</option>
                <option value="denim">Denim Wash (1.15x)</option>
                <option value="virgin_polyester">Virgin Poly (1.25x)</option>
                <option value="wool">Wool (1.4x)</option>
                <option value="leather">Leather (2.1x)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="second_hand">Second-Hand (-85%)</option>
                <option value="vintage">Vintage Discovery (-80%)</option>
                <option value="upcycled_repaired">Upcycled (-75%)</option>
                <option value="sustainable_brand">Eco Brand (-35%)</option>
                <option value="new_standard">Standard New (1.0x)</option>
                <option value="new_fast_fashion">Fast Fashion (+10%)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Calculating...' : 'Calculate Footprint'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Results Area */}
        {simResult && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                Estimated Footprint
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {simResult.estimated_co2_kg.toFixed(2)} kg CO₂e
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400">Avoided vs Conventional</span>
              <span className="font-bold text-teal-300 font-mono">
                {simResult.eco_savings_kg.toFixed(2)} kg CO₂e
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400">Reward Points Generated</span>
              <span className="font-bold text-emerald-400 font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                +{simResult.item_reward_points} pts
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
