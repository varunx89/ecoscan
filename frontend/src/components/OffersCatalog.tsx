import React, { useState } from 'react'
import { Offer, OfferCategory } from '../types'
import {
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  Leaf,
  RefreshCw,
  Package,
  Footprints,
  ShieldCheck,
  Scissors,
  Trees,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

interface OffersCatalogProps {
  offers: Offer[]
  userPoints: number
  onRedeem: (offerId: string) => void
  onViewRedeemed: (offer: Offer) => void
  isRedeeming: boolean
}

const CATEGORIES: { label: string; value: OfferCategory | 'all' }[] = [
  { label: 'All Rewards', value: 'all' },
  { label: 'Circular Fashion', value: 'circular' },
  { label: 'Apparel', value: 'fashion' },
  { label: 'Footwear', value: 'footwear' },
  { label: 'Garment Care', value: 'care' },
  { label: 'Repair & Tailor', value: 'repair' },
  { label: 'Restoration', value: 'restoration' },
]

export const OffersCatalog: React.FC<OffersCatalogProps> = ({
  offers,
  userPoints,
  onRedeem,
  onViewRedeemed,
  isRedeeming,
}) => {
  const [activeTab, setActiveTab] = useState<OfferCategory | 'all'>('all')

  const filteredOffers = activeTab === 'all'
    ? offers
    : offers.filter((o) => o.category === activeTab)

  const redeemableCount = offers.filter((o) => o.is_redeemable && !o.is_redeemed).length

  return (
    <div className="space-y-6">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Eco-Rewards Store
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Redeemable Partner Offers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Use your accumulated eco-savings points with verified climate-positive brands.
          </p>
        </div>

        {/* Points Status */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Wallet Balance
            </div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {userPoints} pts
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Ready to Claim
            </div>
            <div className="text-lg font-black text-teal-300 font-mono">
              {redeemableCount} unlocked
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveTab(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === cat.value
                ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            userPoints={userPoints}
            onRedeem={onRedeem}
            onViewRedeemed={onViewRedeemed}
            isRedeeming={isRedeeming}
          />
        ))}
      </div>
    </div>
  )
}

function OfferCard({
  offer,
  userPoints,
  onRedeem,
  onViewRedeemed,
  isRedeeming,
}: {
  offer: Offer
  userPoints: number
  onRedeem: (id: string) => void
  onViewRedeemed: (offer: Offer) => void
  isRedeeming: boolean
}) {
  const {
    id,
    title,
    description,
    brand,
    required_points,
    discount_value,
    badge_text,
    icon_name,
    is_redeemable,
    points_needed,
    is_redeemed,
  } = offer

  const getCategoryIcon = () => {
    switch (icon_name) {
      case 'leaf': return <Leaf className="w-5 h-5" />
      case 'refresh-cw': return <RefreshCw className="w-5 h-5" />
      case 'package': return <Package className="w-5 h-5" />
      case 'footprints': return <Footprints className="w-5 h-5" />
      case 'shield-check': return <ShieldCheck className="w-5 h-5" />
      case 'scissors': return <Scissors className="w-5 h-5" />
      case 'trees': return <Trees className="w-5 h-5" />
      default: return <Award className="w-5 h-5" />
    }
  }

  return (
    <div
      className={`flex flex-col justify-between rounded-3xl p-6 transition-all glass-card border ${
        is_redeemed
          ? 'border-teal-500/30 bg-teal-950/20'
          : is_redeemable
          ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-950/50'
          : 'border-slate-800/80 opacity-80 hover:opacity-100'
      }`}
    >
      <div>
        {/* Header row: Brand & Status Pill */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {brand}
          </span>

          {is_redeemed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Redeemed
            </span>
          ) : is_redeemable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse-subtle">
              <Unlock className="w-3 h-3" />
              Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
        </div>

        {/* Offer Title & Discount Tag */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            {getCategoryIcon()}
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug mb-1">
              {title}
            </h3>
            <div className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-400/10 text-emerald-300 border border-emerald-400/25">
              {discount_value}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
          {description}
        </p>
      </div>

      {/* Bottom Action Section */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        {/* Progress or point requirement */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Requirement:</span>
          <span className="font-bold text-white">{required_points} pts</span>
        </div>

        {!is_redeemed && !is_redeemable && (
          <div className="space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (userPoints / required_points) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-amber-400/90 font-medium text-right">
              Need {points_needed} more points to unlock
            </div>
          </div>
        )}

        {/* Action Button */}
        {is_redeemed ? (
          <button
            type="button"
            onClick={() => onViewRedeemed(offer)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-teal-300 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/30 transition flex items-center justify-center gap-1.5"
          >
            <span>View Voucher Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRedeem(id)}
            disabled={!is_redeemable || isRedeeming}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              is_redeemable
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
                : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            {is_redeemable ? (
              <>
                <span>Redeem for {required_points} pts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock at {required_points} pts</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
