"use client"

import React, { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, FileText, CheckCircle, AlertCircle, RotateCcw } from "lucide-react"
import { extractTextFromImage } from "@/lib/text-extraction"

interface PolicyScannerProps {
  onPolicyDataExtracted: (data: any) => void
  onClose: () => void
}

interface ExtractedData {
  policyNumber?: string
  insurer?: string
  coverageAmount?: string
  deductible?: string
  premium?: string
  effectiveDate?: string
  expirationDate?: string
  vehicleInfo?: {
    year?: string
    make?: string
    model?: string
    vin?: string
  }
  driverInfo?: {
    name?: string
    licenseNumber?: string
  }
  rawText?: string
  fullCoverage?: any // Store the complete coverage data from API
}

export function PolicyScanner({ onPolicyDataExtracted, onClose }: PolicyScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check if device supports camera
  const hasCamera = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia

  const startCamera = useCallback(async () => {
    try {
      setIsScanning(true)
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.')
      setIsScanning(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob and create object URL
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob)
        setCapturedImage(imageUrl)
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }, [stopCamera])

  const processImage = async (imageFile: File | string) => {
    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 70))
      }, 300)

      // Convert to File object if needed
      let file: File
      
      if (typeof imageFile === 'string') {
        // Convert object URL to File
        const response = await fetch(imageFile)
        const blob = await response.blob()
        file = new File([blob], 'policy-scan.jpg', { type: 'image/jpeg' })
      } else {
        file = imageFile
      }

      setProgress(80)

      // Call the coverage analyzer API automatically
      const formData = new FormData()
      formData.append('file', file)
      formData.append('insuranceType', 'auto') // Default to auto, can be made dynamic

      const response = await fetch('/api/analyze-coverage', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const result = await response.json()
      setProgress(100)

      if (result.success && result.coverage) {
        // Store the full coverage data
        const coverage = result.coverage
        
        // Map the coverage data to our ExtractedData format for display
        setExtractedData({
          policyNumber: coverage.policyNumber,
          insurer: coverage.carrier,
          coverageAmount: coverage.liability || coverage.dwellingCoverage,
          deductible: coverage.coverages?.[0]?.deductible,
          premium: coverage.totalPremium,
          effectiveDate: coverage.effectiveDate,
          expirationDate: coverage.expirationDate,
          vehicleInfo: coverage.vehicles?.[0] ? {
            year: coverage.vehicles[0].year?.toString(),
            make: coverage.vehicles[0].make,
            model: coverage.vehicles[0].model,
            vin: coverage.vehicles[0].vin
          } : undefined,
          driverInfo: coverage.drivers?.[0] ? {
            name: coverage.drivers[0].name
          } : undefined,
          rawText: JSON.stringify(coverage, null, 2),
          // Store the full coverage data for onPolicyDataExtracted callback
          fullCoverage: coverage
        })
        
        // Automatically call onPolicyDataExtracted with the full coverage data
        // This will trigger the transition to chat, just like Coverage Analyzer
        onPolicyDataExtracted(coverage)
      } else {
        throw new Error('Failed to extract policy data')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.')
      console.error('Image processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const parsePolicyData = (text: string): Partial<ExtractedData> => {
    const data: Partial<ExtractedData> = {}

    // Extract policy number
    const policyMatch = text.match(/(?:policy\s*(?:number|#|no\.?)\s*:?\s*)([A-Z0-9\-]+)/i)
    if (policyMatch) data.policyNumber = policyMatch[1]

    // Extract insurer
    const insurerMatch = text.match(/(?:insured\s*by|insurance\s*company|carrier)\s*:?\s*([A-Za-z\s&]+)/i)
    if (insurerMatch) data.insurer = insurerMatch[1].trim()

    // Extract coverage amounts
    const coverageMatch = text.match(/(?:coverage|liability)\s*(?:amount|limit)?\s*:?\s*\$?([\d,]+)/i)
    if (coverageMatch) data.coverageAmount = `$${coverageMatch[1]}`

    // Extract deductible
    const deductibleMatch = text.match(/(?:deductible)\s*:?\s*\$?([\d,]+)/i)
    if (deductibleMatch) data.deductible = `$${deductibleMatch[1]}`

    // Extract premium
    const premiumMatch = text.match(/(?:premium|payment|cost)\s*:?\s*\$?([\d,]+\.?\d*)/i)
    if (premiumMatch) data.premium = `$${premiumMatch[1]}`

    // Extract dates
    const dateMatch = text.match(/(?:effective|start)\s*(?:date)?\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
    if (dateMatch) data.effectiveDate = dateMatch[1]

    const expMatch = text.match(/(?:expires?|end)\s*(?:date)?\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
    if (expMatch) data.expirationDate = expMatch[1]

    // Extract vehicle info
    const yearMatch = text.match(/(\d{4})\s*(?:year|model\s*year)/i)
    if (yearMatch) data.vehicleInfo = { ...data.vehicleInfo, year: yearMatch[1] }

    const makeModelMatch = text.match(/([A-Za-z]+)\s+([A-Za-z0-9\s]+)/i)
    if (makeModelMatch) {
      data.vehicleInfo = {
        ...data.vehicleInfo,
        make: makeModelMatch[1],
        model: makeModelMatch[2]
      }
    }

    const vinMatch = text.match(/(?:vin|vehicle\s*id)\s*:?\s*([A-Z0-9]{17})/i)
    if (vinMatch) data.vehicleInfo = { ...data.vehicleInfo, vin: vinMatch[1] }

    // Extract driver info
    const nameMatch = text.match(/(?:driver|insured)\s*(?:name)?\s*:?\s*([A-Za-z\s]+)/i)
    if (nameMatch) data.driverInfo = { ...data.driverInfo, name: nameMatch[1].trim() }

    return data
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setCapturedImage(imageUrl)
      processImage(file)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setExtractedData(null)
    setError(null)
    setProgress(0)
  }

  const handleUseData = () => {
    if (extractedData) {
      onPolicyDataExtracted(extractedData)
      onClose()
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Policy Scanner
          </CardTitle>
          <CardDescription>
            Take a photo of your insurance policy or upload an image to extract details automatically
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!capturedImage ? (
            <div className="space-y-4">
              {/* Camera Interface */}
              {isScanning ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-4">
                      <Button
                        onClick={capturePhoto}
                        size="lg"
                        className="rounded-full w-16 h-16"
                      >
                        <Camera className="w-8 h-8" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                    className="absolute top-4 right-4"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {hasCamera && (
                    <Button
                      onClick={startCamera}
                      className="h-24 sm:h-32 flex flex-col gap-2 text-sm sm:text-base"
                      variant="outline"
                    >
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
                      <span>Take Photo</span>
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 sm:h-32 flex flex-col gap-2 text-sm sm:text-base"
                    variant="outline"
                  >
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span>Upload Image</span>
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Captured Image */}
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured policy"
                  className="w-full h-64 object-contain rounded-lg border"
                />
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Processing image...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* Extracted Data */}
              {extractedData && !isProcessing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Data extracted successfully!</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {extractedData.policyNumber && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">Policy Number</label>
                        <p className="text-sm sm:text-base font-medium">{extractedData.policyNumber}</p>
                      </div>
                    )}
                    
                    {extractedData.insurer && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">Insurance Company</label>
                        <p className="text-sm sm:text-base font-medium">{extractedData.insurer}</p>
                      </div>
                    )}
                    
                    {extractedData.coverageAmount && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">Coverage Amount</label>
                        <p className="text-sm sm:text-base font-medium">{extractedData.coverageAmount}</p>
                      </div>
                    )}
                    
                    {extractedData.deductible && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">Deductible</label>
                        <p className="text-sm sm:text-base font-medium">{extractedData.deductible}</p>
                      </div>
                    )}
                    
                    {extractedData.premium && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">Premium</label>
                        <p className="text-sm sm:text-base font-medium">{extractedData.premium}</p>
                      </div>
                    )}
                    
                    {extractedData.effectiveDate && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">Effective Date</label>
                        <p className="text-sm sm:text-base font-medium">{extractedData.effectiveDate}</p>
                      </div>
                    )}
                  </div>

                  {extractedData.vehicleInfo && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle Information</label>
                      <div className="mt-1 space-y-1">
                        {extractedData.vehicleInfo.year && (
                          <Badge variant="secondary">{extractedData.vehicleInfo.year}</Badge>
                        )}
                        {extractedData.vehicleInfo.make && (
                          <Badge variant="secondary">{extractedData.vehicleInfo.make}</Badge>
                        )}
                        {extractedData.vehicleInfo.model && (
                          <Badge variant="secondary">{extractedData.vehicleInfo.model}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                {extractedData && (
                  <Button onClick={handleUseData} className="flex-1">
                    Use This Data
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
