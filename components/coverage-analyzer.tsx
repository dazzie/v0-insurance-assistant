"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Image, CheckCircle, AlertCircle, Loader2, X, Camera, RotateCcw } from "lucide-react"

interface ExtractedCoverage {
  carrier?: string
  policyNumber?: string
  effectiveDate?: string
  expirationDate?: string
  coverageType?: 'auto' | 'home' | 'life' | 'renters' | 'pet' | 'health' | 'disability' | 'umbrella'

  // Auto insurance specific
  vehicles?: Array<{
    year?: number
    make?: string
    model?: string
    vin?: string
  }>
  drivers?: Array<{
    name?: string
    age?: number
    relationship?: string
  }>

  // Home insurance specific
  propertyAddress?: string
  propertyType?: string
  dwellingCoverage?: string
  personalProperty?: string
  replacementCost?: string
  yearBuilt?: number
  squareFootage?: number

  // Life insurance specific
  beneficiaries?: Array<{
    name?: string
    relationship?: string
    percentage?: string
  }>
  coverageAmount?: string
  policyType?: 'term' | 'whole' | 'universal'
  termLength?: string
  cashValue?: string

  // Renters insurance specific
  personalPropertyLimit?: string
  liabilityLimit?: string
  additionalLivingExpenses?: string

  // Pet insurance specific
  petName?: string
  petType?: string
  petBreed?: string
  petAge?: number
  annualLimit?: string
  reimbursementRate?: string

  // Health insurance specific
  planType?: string
  deductible?: string
  outOfPocketMax?: string
  copay?: string
  coinsurance?: string

  // General coverages (applicable to all types)
  coverages?: Array<{
    type: string
    limit?: string
    deductible?: string
    premium?: string
  }>
  liability?: string

  // General policy info
  totalPremium?: string
  paymentFrequency?: string

  // Analysis
  gaps?: string[]
  recommendations?: string[]
}

interface CoverageAnalyzerProps {
  onAnalysisComplete?: (coverage: ExtractedCoverage) => void
  insuranceType?: 'auto' | 'home' | 'life' | 'renters' | 'pet' | 'health' | 'disability' | 'umbrella'
}

export function CoverageAnalyzer({ onAnalysisComplete, insuranceType }: CoverageAnalyzerProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedCoverage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Fix hydration error by only rendering camera button on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getInsuranceTypeLabel = () => {
    if (!insuranceType) return 'insurance'
    const labels: Record<string, string> = {
      auto: 'Auto Insurance',
      home: 'Home Insurance',
      life: 'Life Insurance',
      renters: 'Renters Insurance',
      pet: 'Pet Insurance',
      health: 'Health Insurance',
      disability: 'Disability Insurance',
      umbrella: 'Umbrella Insurance'
    }
    return labels[insuranceType] || 'insurance'
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG) or PDF file')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError(null)
    setUploadedFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const analyzeDocument = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      if (insuranceType) {
        formData.append('insuranceType', insuranceType)
      }

      const response = await fetch('/api/analyze-coverage', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      console.log('[Client] API Response:', result)
      console.log('[Client] Coverage data:', result.coverage)

      if (!response.ok) {
        // Show the helpful message from the API
        const errorMessage = result.message || result.error || result.details || 'Failed to analyze document'
        const suggestion = result.suggestion ? `\n\n${result.suggestion}` : ''
        throw new Error(errorMessage + suggestion)
      }

      console.log('[Client] Setting extracted data...', result.coverage)
      setExtractedData(result.coverage)
      console.log('[Client] Extracted data set successfully')

      // Show success confirmation
      const fieldsExtracted = Object.keys(result.coverage).filter(key => result.coverage[key] != null).length
      console.log(`✅ Policy analyzed successfully! ${fieldsExtracted} fields extracted.`)

      // Optional: Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Policy Analysis Complete!', {
          body: `Successfully extracted ${fieldsExtracted} fields from your policy document.`,
          icon: '/icon.png'
        })
      }

      // Don't auto-submit - let user review and click "Use This Coverage"
      // if (onAnalysisComplete) {
      //   onAnalysisComplete(result.coverage)
      // }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to analyze document'
      setError(errorMsg)
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setExtractedData(null)
    setError(null)
    setShowCamera(false)
    stopCamera()
  }

  const startCamera = useCallback(async () => {
    try {
      setIsScanning(true)
      setShowCamera(true)
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
      setError('Camera access denied. Please allow camera permissions or use file upload instead.')
      setIsScanning(false)
      setShowCamera(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    setShowCamera(false)
  }, [])

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'policy-photo.jpg', { type: 'image/jpeg' })
            setUploadedFile(file)
            const imageUrl = URL.createObjectURL(blob)
            setPreviewUrl(imageUrl)
            stopCamera()
            
            // Automatically analyze the captured photo
            setIsAnalyzing(true)
            try {
              const formData = new FormData()
              formData.append('file', file)
              if (insuranceType) {
                formData.append('insuranceType', insuranceType)
              }

              const response = await fetch('/api/analyze-coverage', {
                method: 'POST',
                body: formData,
              })

              const result = await response.json()

              if (!response.ok) {
                const errorMessage = result.message || result.error || result.details || 'Failed to analyze document'
                const suggestion = result.suggestion ? `\n\n${result.suggestion}` : ''
                throw new Error(errorMessage + suggestion)
              }

              setExtractedData(result.coverage)
              
              // Don't auto-submit - let user review and click "Use This Coverage"
              // if (onAnalysisComplete) {
              //   onAnalysisComplete(result.coverage)
              // }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : 'Failed to analyze document'
              setError(errorMsg)
              console.error('Analysis error:', err)
            } finally {
              setIsAnalyzing(false)
            }
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }, [insuranceType, onAnalysisComplete, stopCamera])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Upload Current {getInsuranceTypeLabel()} Policy
        </CardTitle>
        <CardDescription>
          Take a photo or upload your current {getInsuranceTypeLabel().toLowerCase()} policy document and we'll analyze your coverage to identify gaps and opportunities
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Camera View */}
        {showCamera && !uploadedFile && (
          <div className="relative w-full rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto max-h-[400px] object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="rounded-full w-16 h-16 p-0 bg-white hover:bg-gray-100"
              >
                <Camera className="w-6 h-6 text-black" />
              </Button>
              <Button
                onClick={stopCamera}
                size="lg"
                variant="secondary"
                className="rounded-full w-16 h-16 p-0"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Upload/Camera Section */}
        {!uploadedFile && !showCamera && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Camera Button */}
              {isMounted && typeof navigator !== 'undefined' && navigator.mediaDevices && (
                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="h-32 flex flex-col gap-2"
                >
                  <Camera className="w-8 h-8" />
                  <span className="font-medium">Take Photo</span>
                  <span className="text-xs text-muted-foreground">Use camera</span>
                </Button>
              )}
              
              {/* Upload Button */}
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted rounded-lg hover:bg-muted/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="font-medium">Upload File</span>
                  <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}

        {/* Preview and Analysis Section */}
        {uploadedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {uploadedFile.type.startsWith('image/') ? (
                  <Image className="w-5 h-5 text-blue-500" />
                ) : (
                  <FileText className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearUpload}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Policy preview"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            )}

            {/* Analyze Button */}
            {!extractedData && (
              <Button
                onClick={analyzeDocument}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Analyze Coverage
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-bold text-green-900">
                  ✅ Policy Analysis Complete!
                </p>
              </div>
              <p className="text-xs text-green-700 ml-7">
                Successfully extracted {Object.keys(extractedData).filter(key => extractedData[key] != null && extractedData[key] !== '').length} fields from your policy document
                {extractedData.carrier && ` (${extractedData.carrier})`}
                {extractedData.policyNumber && ` - Policy #${extractedData.policyNumber}`}
              </p>
            </div>

            {/* Raw Data Display (Debug) */}
            <details className="border rounded-lg p-4 bg-gray-50">
              <summary className="cursor-pointer font-medium text-sm">
                🔍 View Raw Extracted Data ({Object.keys(extractedData).length} fields)
              </summary>
              <pre className="mt-3 p-3 bg-white rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </details>

            {/* Policy Summary Card */}
            <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {extractedData.carrier || 'Insurance Policy'} Analysis
                  </h3>
                  {extractedData.customerName && (
                    <p className="text-sm text-gray-600 mt-1">
                      Policyholder: {extractedData.customerName}
                    </p>
                  )}
                </div>
                {extractedData.totalPremium && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Premium</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {extractedData.totalPremium}
                    </p>
                    {extractedData.paymentFrequency && (
                      <p className="text-xs text-gray-500 mt-1">
                        {extractedData.paymentFrequency}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {extractedData.policyNumber && (
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Policy Number</p>
                    <p className="font-semibold text-sm mt-1">{extractedData.policyNumber}</p>
                  </div>
                )}
                {extractedData.effectiveDate && (
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Effective Date</p>
                    <p className="font-semibold text-sm mt-1">{extractedData.effectiveDate}</p>
                  </div>
                )}
                {extractedData.expirationDate && (
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Expiration Date</p>
                    <p className="font-semibold text-sm mt-1">{extractedData.expirationDate}</p>
                  </div>
                )}
                {extractedData.vehicles && extractedData.vehicles.length > 0 && (
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Vehicles</p>
                    <p className="font-semibold text-sm mt-1">
                      {extractedData.vehicles.length} vehicle{extractedData.vehicles.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {extractedData.drivers && extractedData.drivers.length > 0 && (
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Drivers</p>
                    <p className="font-semibold text-sm mt-1">
                      {extractedData.drivers.length} driver{extractedData.drivers.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {extractedData.coverages && extractedData.coverages.length > 0 && (
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Coverages</p>
                    <p className="font-semibold text-sm mt-1">
                      {extractedData.coverages.length} coverage{extractedData.coverages.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Contact Info */}
              {(extractedData.email || extractedData.phone || extractedData.address) && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Contact Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    {extractedData.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📧</span>
                        <span>{extractedData.email}</span>
                      </div>
                    )}
                    {extractedData.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📱</span>
                        <span>{extractedData.phone}</span>
                      </div>
                    )}
                    {extractedData.address && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📍</span>
                        <span className="text-xs">{extractedData.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Tabs defaultValue="coverage" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
                <TabsTrigger value="gaps">Coverage Gaps</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="coverage" className="space-y-4 mt-4">
                {/* Policy Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Policy Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {extractedData.carrier && (
                      <InfoItem label="Carrier" value={extractedData.carrier} />
                    )}
                    {extractedData.policyNumber && (
                      <InfoItem label="Policy Number" value={extractedData.policyNumber} />
                    )}
                    {extractedData.effectiveDate && (
                      <InfoItem label="Effective Date" value={extractedData.effectiveDate} />
                    )}
                    {extractedData.expirationDate && (
                      <InfoItem label="Expiration Date" value={extractedData.expirationDate} />
                    )}
                    {extractedData.totalPremium && (
                      <InfoItem label="Total Premium" value={extractedData.totalPremium} />
                    )}
                    {extractedData.paymentFrequency && (
                      <InfoItem label="Payment" value={extractedData.paymentFrequency} />
                    )}
                  </div>
                </div>

                {/* Coverages */}
                {extractedData.coverages && extractedData.coverages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Coverage Details</h4>
                    <div className="space-y-2">
                      {extractedData.coverages.map((coverage, idx) => (
                        <div key={idx} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{coverage.type}</p>
                            {coverage.premium && (
                              <Badge variant="secondary">{coverage.premium}</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {coverage.limit && (
                              <p>Limit: <span className="font-medium text-foreground">{coverage.limit}</span></p>
                            )}
                            {coverage.deductible && (
                              <p>Deductible: <span className="font-medium text-foreground">{coverage.deductible}</span></p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auto Insurance: Vehicles */}
                {extractedData.vehicles && extractedData.vehicles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Insured Vehicles</h4>
                    <div className="space-y-2">
                      {extractedData.vehicles.map((vehicle, idx) => (
                        <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                          <p className="font-medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          {vehicle.vin && (
                            <p className="text-xs text-muted-foreground mt-1">VIN: {vehicle.vin}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auto Insurance: Drivers */}
                {extractedData.drivers && extractedData.drivers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Listed Drivers</h4>
                    <div className="space-y-2">
                      {extractedData.drivers.map((driver, idx) => (
                        <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                          <p className="font-medium">{driver.name || `Driver ${idx + 1}`}</p>
                          <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                            {driver.age && <span>Age: {driver.age}</span>}
                            {driver.relationship && <span>• {driver.relationship}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Home Insurance: Property Details */}
                {(extractedData.propertyAddress || extractedData.propertyType || extractedData.yearBuilt) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Property Information</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {extractedData.propertyAddress && (
                        <InfoItem label="Property Address" value={extractedData.propertyAddress} />
                      )}
                      {extractedData.propertyType && (
                        <InfoItem label="Property Type" value={extractedData.propertyType} />
                      )}
                      {extractedData.yearBuilt && (
                        <InfoItem label="Year Built" value={extractedData.yearBuilt.toString()} />
                      )}
                      {extractedData.squareFootage && (
                        <InfoItem label="Square Footage" value={`${extractedData.squareFootage} sq ft`} />
                      )}
                      {extractedData.replacementCost && (
                        <InfoItem label="Replacement Cost" value={extractedData.replacementCost} />
                      )}
                    </div>
                  </div>
                )}

                {/* Life Insurance: Beneficiaries */}
                {extractedData.beneficiaries && extractedData.beneficiaries.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Beneficiaries</h4>
                    <div className="space-y-2">
                      {extractedData.beneficiaries.map((ben, idx) => (
                        <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                          <p className="font-medium">{ben.name}</p>
                          <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                            {ben.relationship && <span>{ben.relationship}</span>}
                            {ben.percentage && <span>• {ben.percentage}%</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Life Insurance: Policy Details */}
                {(extractedData.policyType || extractedData.termLength || extractedData.cashValue) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Policy Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {extractedData.policyType && (
                        <InfoItem label="Policy Type" value={extractedData.policyType.charAt(0).toUpperCase() + extractedData.policyType.slice(1)} />
                      )}
                      {extractedData.termLength && (
                        <InfoItem label="Term Length" value={extractedData.termLength} />
                      )}
                      {extractedData.cashValue && (
                        <InfoItem label="Cash Value" value={extractedData.cashValue} />
                      )}
                    </div>
                  </div>
                )}

                {/* Pet Insurance: Pet Details */}
                {(extractedData.petName || extractedData.petType || extractedData.petBreed) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Pet Information</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {extractedData.petName && (
                        <InfoItem label="Pet Name" value={extractedData.petName} />
                      )}
                      {extractedData.petType && (
                        <InfoItem label="Type" value={extractedData.petType} />
                      )}
                      {extractedData.petBreed && (
                        <InfoItem label="Breed" value={extractedData.petBreed} />
                      )}
                      {extractedData.petAge && (
                        <InfoItem label="Age" value={`${extractedData.petAge} years`} />
                      )}
                      {extractedData.annualLimit && (
                        <InfoItem label="Annual Limit" value={extractedData.annualLimit} />
                      )}
                      {extractedData.reimbursementRate && (
                        <InfoItem label="Reimbursement" value={extractedData.reimbursementRate} />
                      )}
                    </div>
                  </div>
                )}

                {/* Health Insurance: Plan Details */}
                {(extractedData.planType || extractedData.deductible || extractedData.outOfPocketMax) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Health Plan Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {extractedData.planType && (
                        <InfoItem label="Plan Type" value={extractedData.planType} />
                      )}
                      {extractedData.deductible && (
                        <InfoItem label="Deductible" value={extractedData.deductible} />
                      )}
                      {extractedData.outOfPocketMax && (
                        <InfoItem label="Out-of-Pocket Max" value={extractedData.outOfPocketMax} />
                      )}
                      {extractedData.copay && (
                        <InfoItem label="Copay" value={extractedData.copay} />
                      )}
                      {extractedData.coinsurance && (
                        <InfoItem label="Coinsurance" value={extractedData.coinsurance} />
                      )}
                    </div>
                  </div>
                )}

                {/* Renters Insurance: Coverage Limits */}
                {(extractedData.personalPropertyLimit || extractedData.liabilityLimit || extractedData.additionalLivingExpenses) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Renters Coverage</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {extractedData.personalPropertyLimit && (
                        <InfoItem label="Personal Property" value={extractedData.personalPropertyLimit} />
                      )}
                      {extractedData.liabilityLimit && (
                        <InfoItem label="Liability" value={extractedData.liabilityLimit} />
                      )}
                      {extractedData.additionalLivingExpenses && (
                        <InfoItem label="Additional Living Expenses" value={extractedData.additionalLivingExpenses} />
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gaps" className="space-y-4 mt-4">
                {extractedData.gaps && extractedData.gaps.length > 0 ? (
                  <div className="space-y-3">
                    {extractedData.gaps.map((gap, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-900">{gap}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="text-sm">No coverage gaps detected</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4 mt-4">
                {extractedData.recommendations && extractedData.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {extractedData.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-900">{rec}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No recommendations available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={clearUpload} variant="outline" className="flex-1">
                Upload New Document
              </Button>
              <Button
                onClick={() => onAnalysisComplete?.(extractedData)}
                className="flex-1"
              >
                Use This Coverage
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 bg-muted/50 rounded">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}
