import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { ImageUploader } from './components/ImageUploader'
import { CameraCapture } from './components/CameraCapture'
import { ScanResults } from './components/ScanResults'
import { OffersCatalog } from './components/OffersCatalog'
import { OfferRedemptionModal } from './components/OfferRedemptionModal'
import { MethodologyModal } from './components/MethodologyModal'
import { CustomSimulatorModal } from './components/CustomSimulatorModal'

import {
  scanClothingFile,
  scanClothingBase64,
  getOffers,
  redeemOffer,
  getWalletStatus,
} from './services/api'
import { ScanResponse, Offer, WalletStatus } from './types'
import { Camera, UploadCloud, Leaf, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'

export function App() {
  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload')
  const [isScanning, setIsScanning] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [scanResults, setScanResults] = useState<ScanResponse | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null)
  const [redeemedOffer, setRedeemedOffer] = useState<Offer | null>(null)
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Load initial wallet & offers
  const refreshData = async () => {
    try {
      const walletData = await getWalletStatus()
      setWalletStatus(walletData)
      const offersData = await getOffers(walletData.wallet.balance_points)
      setOffers(offersData)
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  // File scan trigger
  const handleFileScan = async (file: File) => {
    setIsScanning(true)
    try {
      const result = await scanClothingFile(file)
      setScanResults(result)
      showNotification('success', `Scanned ${result.items.length} item(s)! Earned +${result.total_reward_points} pts.`)
      await refreshData()
      window.scrollTo({ top: 400, behavior: 'smooth' })
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to analyze clothing image')
    } finally {
      setIsScanning(false)
    }
  }

  // Camera base64 scan trigger
  const handleBase64Scan = async (base64Data: string) => {
    setIsScanning(true)
    try {
      const result = await scanClothingBase64(base64Data)
      setScanResults(result)
      setScanMode('upload') // reset back to upload view
      showNotification('success', `Snapshot analyzed! +${result.total_reward_points} pts added to your wallet.`)
      await refreshData()
      window.scrollTo({ top: 400, behavior: 'smooth' })
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to analyze camera snapshot')
    } finally {
      setIsScanning(false)
    }
  }

  // Sample apparel quick test trigger
  const handleSampleScan = async (_sampleName: string, mockBase64: string) => {
    await handleBase64Scan(mockBase64)
  }

  // Redeem offer
  const handleRedeem = async (offerId: string) => {
    setIsRedeeming(true)
    try {
      const currentPoints = walletStatus?.wallet?.balance_points ?? 0
      const res = await redeemOffer(offerId, currentPoints)
      const targetOffer = offers.find((o) => o.id === offerId)
      if (targetOffer) {
        const updatedOffer: Offer = {
          ...targetOffer,
          is_redeemed: true,
          promo_code: res.promo_code,
        }
        setRedeemedOffer(updatedOffer)
      }
      showNotification('success', res.message)
      await refreshData()
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to redeem offer')
    } finally {
      setIsRedeeming(false)
    }
  }

  const userBalance = walletStatus?.wallet?.balance_points ?? 0

  return (
    <div className="min-h-screen flex flex-col bg-[#0b100b] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation Bar */}
      <Navbar
        walletStatus={walletStatus}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/50 shadow-rose-950/50'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Empowering Circular & Carbon-Conscious Fashion
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Scan your clothes.<br />
            <span className="eco-gradient-text">Measure carbon. Earn rewards.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Upload an image or take a quick photo with your camera. EcoScan leverages GPT-4 Vision to identify garments, calculate life-cycle carbon footprints in kg CO₂e, and award eco-points for sustainable choices.
          </p>

          {/* Scanner Mode Toggle Tabs */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1.5 rounded-2xl glass-panel border border-slate-800 flex items-center gap-1 shadow-lg">
              <button
                type="button"
                onClick={() => setScanMode('upload')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                  scanMode === 'upload'
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                Upload Image
              </button>

              <button
                type="button"
                onClick={() => setScanMode('camera')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                  scanMode === 'camera'
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                Live Camera
              </button>
            </div>
          </div>
        </section>

        {/* Scanner Component Area */}
        <section className="max-w-2xl mx-auto">
          {scanMode === 'camera' ? (
            <CameraCapture
              onCapture={handleBase64Scan}
              onCancel={() => setScanMode('upload')}
            />
          ) : (
            <ImageUploader
              onFileSelect={handleFileScan}
              onSampleSelect={handleSampleScan}
              isLoading={isScanning}
            />
          )}
        </section>

        {/* Results Section (When available) */}
        {scanResults && (
          <section id="results-section" className="pt-4">
            <ScanResults
              results={scanResults}
              onViewOffers={() => {
                const el = document.getElementById('offers-section')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              onNewScan={() => {
                setScanResults(null)
                window.scrollTo({ top: 100, behavior: 'smooth' })
              }}
            />
          </section>
        )}

        {/* Partner Offers Catalog Section */}
        <section id="offers-section" className="pt-6">
          <OffersCatalog
            offers={offers}
            userPoints={userBalance}
            onRedeem={handleRedeem}
            onViewRedeemed={(o) => setRedeemedOffer(o)}
            isRedeeming={isRedeeming}
          />
        </section>
      </main>

      {/* Modals */}
      <OfferRedemptionModal
        offer={redeemedOffer}
        isOpen={!!redeemedOffer}
        onClose={() => setRedeemedOffer(null)}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <CustomSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-emerald-500/15 glass-panel py-8 mt-16 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
          <Leaf className="w-4 h-4" />
          <span>Reewild EcoScan — Clothing Carbon Footprint Scanner</span>
        </div>
        <p>
          Life Cycle Assessment benchmarks derived from WRAP UK, MIT Materials Lab, & Ellen MacArthur Foundation data.
        </p>
        <p className="text-slate-600">
          Crafted with React, TypeScript, Vite & FastAPI for a greener future 🌱
        </p>
      </footer>
    </div>
  )
}

export default App
