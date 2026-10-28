import {
  ScanResponse,
  Offer,
  OfferRedeemResponse,
  WalletStatus,
  CarbonScoresData,
  ScoredClothingItem,
} from '../types'

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://ecoscan-api-vd49.onrender.com/api/v1'
    : '/api/v1')

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`)
  return res.json()
}

export async function scanClothingFile(
  file: File,
  userId: string = 'default_user'
): Promise<ScanResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)

  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Failed to scan image')
  }

  return res.json()
}

export async function scanClothingBase64(
  base64Image: string,
  contentType: string = 'image/jpeg',
  userId: string = 'default_user'
): Promise<ScanResponse> {
  const res = await fetch(`${API_BASE}/scan/base64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: base64Image,
      content_type: contentType,
      user_id: userId,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Failed to scan image')
  }

  return res.json()
}

export async function getOffers(
  userPoints?: number,
  userId: string = 'default_user',
  category?: string
): Promise<Offer[]> {
  const params = new URLSearchParams()
  params.set('user_id', userId)
  if (userPoints !== undefined) params.set('user_points', userPoints.toString())
  if (category) params.set('category', category)

  const res = await fetch(`${API_BASE}/offers?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to load offers')
  return res.json()
}

export async function redeemOffer(
  offerId: string,
  userPoints?: number,
  userId: string = 'default_user'
): Promise<OfferRedeemResponse> {
  const res = await fetch(`${API_BASE}/offers/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offer_id: offerId,
      user_id: userId,
      user_points: userPoints,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Redemption failed')
  }

  return res.json()
}

export async function getWalletStatus(userId: string = 'default_user'): Promise<WalletStatus> {
  const res = await fetch(`${API_BASE}/offers/wallet?user_id=${userId}`)
  if (!res.ok) throw new Error('Failed to fetch wallet status')
  return res.json()
}

export async function getCarbonScores(): Promise<CarbonScoresData> {
  const res = await fetch(`${API_BASE}/items/carbon-scores`)
  if (!res.ok) throw new Error('Failed to load carbon baseline assumptions')
  return res.json()
}

export async function simulateCustomItem(
  name: string,
  category: string,
  material: string,
  condition: string
): Promise<ScoredClothingItem> {
  const res = await fetch(`${API_BASE}/items/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category, material, condition }),
  })

  if (!res.ok) throw new Error('Failed to simulate item')
  return res.json()
}
