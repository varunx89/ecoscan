import React, { useState } from 'react'
import { X, Check, Copy, Sparkles, ExternalLink } from 'lucide-react'
import { Offer } from '../types'

interface OfferRedemptionModalProps {
  offer: Offer | null
  isOpen: boolean
  onClose: () => void
}

export const OfferRedemptionModal: React.FC<OfferRedemptionModalProps> = ({
  offer,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !offer) return null

  const copyToClipboard = () => {
    if (offer.promo_code) {
      navigator.clipboard.writeText(offer.promo_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-emerald-500/40 p-6 sm:p-8 eco-glow shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-4 text-slate-950 shadow-xl shadow-emerald-500/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            Reward Claimed!
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {offer.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Partner: {offer.brand}</p>
        </div>

        {/* Code Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center mb-5">
          <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">
            Your Exclusive Voucher Code
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-widest text-emerald-400 font-mono select-all">
              {offer.promo_code || 'ECOSCAN-VERIFIED'}
            </span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition ml-2 border border-slate-700 active:scale-95"
              title="Copy promo code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          {copied && (
            <div className="text-[11px] font-semibold text-emerald-400 mt-1.5 animate-fadeIn">
              ✓ Code copied to clipboard!
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-2 mb-6 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="font-bold text-white">How to redeem:</div>
          <p className="leading-relaxed">
            1. Copy your exclusive code above.<br />
            2. Visit {offer.brand}'s store checkout.<br />
            3. Apply coupon code to unlock your <strong>{offer.discount_value}</strong> benefit.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition text-sm shadow-lg shadow-emerald-500/20"
        >
          Done
        </button>
      </div>
    </div>
  )
}
