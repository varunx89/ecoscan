import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ScanResults } from '../components/ScanResults'
import { ScanResponse } from '../types'

describe('ScanResults Component', () => {
  const mockResults: ScanResponse = {
    scan_id: 'scan-test-123',
    timestamp: '2026-10-28T08:00:00Z',
    vision_source: 'mock_vision_heuristic',
    items: [
      {
        item: {
          id: 'item-1',
          name: 'Upcycled Heritage Indigo Jeans',
          category: 'jeans',
          color: 'Vintage Indigo Blue',
          material: 'denim',
          condition: 'second_hand',
          confidence: 0.95,
          sustainability_tip: 'Washing in cold water saves 80% water and keeps denim resilient.',
        },
        baseline_co2_kg: 10.0,
        material_multiplier: 1.15,
        condition_multiplier: 0.15,
        estimated_co2_kg: 1.72,
        eco_savings_kg: 8.78,
        item_reward_points: 93,
      },
    ],
    total_carbon_kg: 1.72,
    total_baseline_kg: 10.0,
    total_savings_kg: 8.78,
    total_reward_points: 103,
    equivalencies: {
      car_km_avoided: 51.6,
      smartphone_charges: 1463,
      trees_days_absorption: 146.3,
    },
    sustainability_summary: 'Identified 1 garment. Avoided 8.8 kg CO2e, earning +103 points!',
  }

  it('displays carbon breakdown, eco-reward points and equivalencies', () => {
    render(
      <ScanResults
        results={mockResults}
        onViewOffers={vi.fn()}
        onNewScan={vi.fn()}
      />
    )

    expect(screen.getByText('Environmental Impact Breakdown')).toBeInTheDocument()
    expect(screen.getByText('+103')).toBeInTheDocument()
    expect(screen.getAllByText('1.72').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('10.00')).toBeInTheDocument()
    expect(screen.getByText('8.78')).toBeInTheDocument()
    expect(screen.getByText('51.6 km')).toBeInTheDocument()
    expect(screen.getByText('1,463')).toBeInTheDocument()
    expect(screen.getByText('Upcycled Heritage Indigo Jeans')).toBeInTheDocument()
  })

  it('triggers view offers and new scan callbacks', () => {
    const onViewOffers = vi.fn()
    const onNewScan = vi.fn()

    render(
      <ScanResults
        results={mockResults}
        onViewOffers={onViewOffers}
        onNewScan={onNewScan}
      />
    )

    const offersBtn = screen.getByText(/Redeem Eco-Rewards/i)
    fireEvent.click(offersBtn)
    expect(onViewOffers).toHaveBeenCalledOnce()

    const scanAnotherBtn = screen.getByText('Scan Another Garment')
    fireEvent.click(scanAnotherBtn)
    expect(onNewScan).toHaveBeenCalledOnce()
  })
})
