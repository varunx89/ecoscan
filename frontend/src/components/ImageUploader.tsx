import React, { useRef, useState } from 'react'
import { UploadCloud, Image as ImageIcon, Sparkles, X, CheckCircle, ArrowRight } from 'lucide-react'

interface ImageUploaderProps {
  onFileSelect: (file: File) => void
  onSampleSelect: (sampleName: string, base64: string) => void
  isLoading: boolean
}

// High-quality SVG-based sample outfit assets so users can test immediately
const SAMPLES = [
  {
    id: 'sample-jeans',
    title: 'Vintage Denim Jeans',
    badge: 'Second-Hand (85% Saved)',
    icon: '👖',
    color: 'from-blue-600 to-indigo-900',
    // 1x1 colored png encoded for quick instant mock
    mockBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==',
  },
  {
    id: 'sample-tee',
    title: 'Organic Cotton T-Shirt',
    badge: 'Certified Organic',
    icon: '👕',
    color: 'from-emerald-600 to-teal-900',
    mockBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  },
  {
    id: 'sample-jacket',
    title: 'Recycled Bomber Jacket',
    badge: 'rPET Circular Fiber',
    icon: '🧥',
    color: 'from-slate-700 to-slate-900',
    mockBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  },
  {
    id: 'sample-shoes',
    title: 'Sugarcane Eco Runners',
    badge: 'Low-Carbon Soles',
    icon: '👟',
    color: 'from-amber-700 to-stone-900',
    mockBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  },
]

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  onSampleSelect,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFile = (file: File) => {
    setErrorMsg(null)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a standard image (JPEG, PNG, or WEBP)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 10 MB')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const clearSelected = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const triggerScan = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Upload / Drag Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative rounded-3xl p-6 sm:p-10 transition-all text-center glass-card border-2 ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-950/30 scale-[1.01]'
            : 'border-dashed border-emerald-500/20 hover:border-emerald-500/40 hover:bg-slate-900/60'
        } ${!previewUrl ? 'cursor-pointer' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0])
            }
          }}
        />

        {!previewUrl ? (
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition shadow-inner">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Upload clothing photo
            </h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Drag & drop your apparel photo here, or browse files from your phone or desktop.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Supports JPEG, PNG, WEBP</span>
              <span>•</span>
              <span>Max 10 MB</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl">
              <img
                src={previewUrl}
                alt="Selected garment preview"
                className="w-full max-h-72 object-contain bg-slate-950"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  clearSelected()
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-900 text-white transition"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{selectedFile?.name}</span>
              <span className="text-slate-500">
                ({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={triggerScan}
                disabled={isLoading}
                className="w-full max-w-sm mx-auto px-8 py-3.5 rounded-2xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Calculating Carbon Footprint...
                  </>
                ) : (
                  <>
                    <span>Analyze Carbon Footprint</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 text-xs font-medium text-rose-400 bg-rose-500/10 py-2 px-3 rounded-lg border border-rose-500/20">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Quick Test Demo Samples */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Or test instantly with sample apparel
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSampleSelect(sample.title, sample.mockBase64)}
              disabled={isLoading}
              className="p-3 rounded-2xl glass-card border border-emerald-500/15 hover:border-emerald-400/40 text-left transition transform hover:-translate-y-0.5 active:translate-y-0 group disabled:opacity-50"
            >
              <div className="text-2xl mb-1.5">{sample.icon}</div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">
                {sample.title}
              </div>
              <div className="text-[10px] text-emerald-300/80 truncate">
                {sample.badge}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
