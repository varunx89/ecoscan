import React from 'react'
import { Leaf, Award, HelpCircle, Sliders, Sparkles } from 'lucide-react'
import { WalletStatus } from '../types'

interface NavbarProps {
  walletStatus: WalletStatus | null
  onOpenMethodology: () => void
  onOpenSimulator: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  walletStatus,
  onOpenMethodology,
  onOpenSimulator,
}) => {
  const balance = walletStatus?.wallet?.balance_points ?? 0
  const tier = walletStatus?.tier?.name ?? 'Eco Explorer'
  const badge = walletStatus?.tier?.badge ?? '🌱'

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 text-black font-bold">
            <Leaf className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Reewild <span className="eco-gradient-text">EcoScan</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Clothing Carbon Footprint Scanner & Rewards
            </p>
          </div>
        </div>

        {/* Right Actions & Eco-Wallet */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onOpenSimulator}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            title="Simulate any garment carbon footprint"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            Simulate
          </button>

          <button
            onClick={onOpenMethodology}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            title="View Carbon Footprint Methodology & Assumptions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Methodology</span>
          </button>

          {/* Eco Wallet Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900/80 border border-emerald-500/30 eco-glow">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {balance.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-emerald-200/70 uppercase">
                  pts
                </span>
              </div>
              <div className="text-[10px] text-slate-400 leading-none flex items-center gap-1">
                <span>{badge}</span>
                <span className="hidden sm:inline">{tier}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
