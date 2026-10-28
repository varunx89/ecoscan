import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OffersCatalog } from '../components/OffersCatalog'
import { Offer } from '../types'

describe('OffersCatalog Component', () => {
  const mockOffers: Offer[] = [
    {
      id: 'OFFER-1',
      title: '15% Off Carbon-Neutral Apparel',
      description: 'Test description for Reewild offer.',
      brand: 'Reewild Essentials',
      category: 'fashion',
      required_points: 50,
      discount_value: '15% OFF',
      badge_text: 'Eco Partner',
      icon_name: 'leaf',
      is_redeemable: true,
      points_needed: 0,
      is_redeemed: false,
    },
    {
      id: 'OFFER-2',
      title: '$20 Voucher on Patagonia Worn Wear',
      description: 'Test description for Patagonia.',
      brand: 'Patagonia',
      category: 'circular',
      required_points: 100,
      discount_value: '$20 VOUCHER',
      badge_text: 'B-Corp Partner',
      icon_name: 'refresh-cw',
      is_redeemable: false,
      points_needed: 30,
      is_redeemed: false,
    },
  ]

  it('renders available offers and locks offers exceeding point balance', () => {
    render(
      <OffersCatalog
        offers={mockOffers}
        userPoints={70}
        onRedeem={vi.fn()}
        onViewRedeemed={vi.fn()}
        isRedeeming={false}
      />
    )

    expect(screen.getByText('15% Off Carbon-Neutral Apparel')).toBeInTheDocument()
    expect(screen.getByText('$20 Voucher on Patagonia Worn Wear')).toBeInTheDocument()
    expect(screen.getByText('Unlocked')).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
    expect(screen.getByText(/Need 30 more points to unlock/i)).toBeInTheDocument()
  })

  it('allows clicking redeem button for unlocked offers', () => {
    const onRedeem = vi.fn()

    render(
      <OffersCatalog
        offers={mockOffers}
        userPoints={70}
        onRedeem={onRedeem}
        onViewRedeemed={vi.fn()}
        isRedeeming={false}
      />
    )

    const redeemBtn = screen.getByText('Redeem for 50 pts')
    fireEvent.click(redeemBtn)
    expect(onRedeem).toHaveBeenCalledWith('OFFER-1')
  })
})
