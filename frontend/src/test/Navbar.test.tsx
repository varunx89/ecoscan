import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Navbar } from '../components/Navbar'
import { WalletStatus } from '../types'

describe('Navbar Component', () => {
  const mockWallet: WalletStatus = {
    wallet: {
      user_id: 'test_user',
      balance_points: 175,
      total_earned_points: 220,
      total_saved_co2_kg: 12.4,
      redeemed_offer_ids: [],
    },
    tier: {
      name: 'Eco Sprout',
      badge: '🌿',
      perk: 'Free shipping on partner circular orders',
      progress_pct: 50,
      next_tier: 'Forest Guardian',
      points_to_next: 75,
    },
  }

  it('renders brand name and wallet point balance', () => {
    render(
      <Navbar
        walletStatus={mockWallet}
        onOpenMethodology={vi.fn()}
        onOpenSimulator={vi.fn()}
      />
    )

    expect(screen.getByText('Reewild')).toBeInTheDocument()
    expect(screen.getByText('EcoScan')).toBeInTheDocument()
    expect(screen.getByText('175')).toBeInTheDocument()
    expect(screen.getByText('Eco Sprout')).toBeInTheDocument()
  })

  it('triggers methodology and simulator callbacks on button click', () => {
    const onOpenMethodology = vi.fn()
    const onOpenSimulator = vi.fn()

    render(
      <Navbar
        walletStatus={mockWallet}
        onOpenMethodology={onOpenMethodology}
        onOpenSimulator={onOpenSimulator}
      />
    )

    const methodologyBtn = screen.getByTitle('View Carbon Footprint Methodology & Assumptions')
    fireEvent.click(methodologyBtn)
    expect(onOpenMethodology).toHaveBeenCalledOnce()

    const simulatorBtn = screen.getByTitle('Simulate any garment carbon footprint')
    fireEvent.click(simulatorBtn)
    expect(onOpenSimulator).toHaveBeenCalledOnce()
  })
})
