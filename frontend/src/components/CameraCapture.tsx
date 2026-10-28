import React, { useRef, useState, useEffect } from 'react'
import { Camera, RefreshCw, Check, X, AlertCircle } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void
  onCancel: () => void
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)

  const startCamera = async () => {
    setCameraError(null)
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err: any) {
      console.error('Camera access error:', err)
      setCameraError(
        'Camera access was denied or is not supported by your browser. Please check camera permissions or use the File Upload tab.'
      )
    }
  }

  useEffect(() => {
    if (!capturedImage) {
      startCamera()
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Flash effect
    setFlash(true)
    setTimeout(() => setFlash(false), 200)

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedImage(dataUrl)

    // Stop streaming while reviewing
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const retake = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden glass-card border border-emerald-500/30 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-white">
            {capturedImage ? 'Review Snapshot' : 'Live Camera Scanner'}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 transition"
          aria-label="Close Camera"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {cameraError ? (
        <div className="p-6 text-center rounded-xl bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <p className="text-sm text-rose-300 mb-4">{cameraError}</p>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            Switch to File Upload
          </button>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-video flex items-center justify-center border border-slate-800">
          {/* Flash animation */}
          {flash && <div className="absolute inset-0 bg-white z-20 pointer-events-none opacity-80" />}

          {/* Live Video Preview */}
          {!capturedImage && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured clothing snapshot"
              className="w-full h-full object-contain"
            />
          )}

          {/* Target Overlay Guide */}
          {!capturedImage && (
            <div className="absolute inset-8 border-2 border-emerald-400/40 border-dashed rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-xs font-medium text-emerald-300/80 bg-slate-950/60 px-3 py-1 rounded-full backdrop-blur-sm">
                Position clothing within frame
              </span>
            </div>
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Controls */}
      {!cameraError && (
        <div className="mt-5 flex items-center justify-center gap-4">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                title="Flip Camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={takeSnapshot}
                className="px-6 py-3.5 rounded-full font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition transform active:scale-95"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 animate-ping" />
                Capture Photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={retake}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>

              <button
                type="button"
                onClick={confirmCapture}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Analyze Footprint
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
