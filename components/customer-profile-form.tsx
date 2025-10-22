"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Square } from "lucide-react"
import { CoverageAnalyzer } from "@/components/coverage-analyzer"
import type { CustomerProfile } from "@/lib/customer-profile"

interface CustomerProfileFormProps {
  onSubmit: (profile: CustomerProfile) => void
}

export function CustomerProfileForm({ onSubmit }: CustomerProfileFormProps) {
  const [location, setLocation] = useState("")
  const [age, setAge] = useState("")
  const [needs, setNeeds] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!location.trim()) newErrors.location = "Location is required"
    if (!age) newErrors.age = "Age is required"
    else if (Number.parseInt(age) < 18 || Number.parseInt(age) > 100) newErrors.age = "Age must be between 18 and 100"
    if (!needs.trim()) newErrors.needs = "Insurance needs are required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit({
        location: location.trim(),
        age,
        needs: needs
          .split(",")
          .map((need) => need.trim())
          .filter((need) => need.length > 0),
      })
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        await handleAudioSubmit(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handleAudioSubmit = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      // Convert audio to FormData
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // Send to transcription endpoint
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed')
      }

      const { text } = await transcribeResponse.json()
      console.log('[Audio Form] Transcribed:', text)

      // Parse the transcribed text to extract information
      // Simple parsing - look for patterns
      const lowerText = text.toLowerCase()
      
      // Extract location (look for ZIP codes, city names)
      const zipMatch = text.match(/\b\d{5}\b/)
      const cityStateMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+([A-Z]{2})\b/)
      
      // Extract age
      const ageMatch = text.match(/\b(?:age|i'm|im|i am)\s+(\d{2})\b/i)
      
      // Extract insurance needs
      const insuranceTypes = ['auto', 'home', 'life', 'renters', 'pet', 'health', 'disability', 'umbrella']
      const foundNeeds = insuranceTypes.filter(type => lowerText.includes(type))

      // Skip the form and go directly to chat with the full context
      onSubmit({
        location: zipMatch?.[0] || cityStateMatch?.[0] || text.match(/\b\d{5}(?:-\d{4})?\b/)?.[0] || location || 'Unknown',
        age: ageMatch?.[1] || age || '30',
        needs: foundNeeds.length > 0 ? foundNeeds : needs.split(',').map(n => n.trim()).filter(Boolean),
        initialMessage: `🎤 ${text}`, // Pass the full audio message as initial context
      } as CustomerProfile)

    } catch (error) {
      console.error('Error processing audio:', error)
      alert('Sorry, I had trouble processing your audio message. Please try again or use the form.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Insurance Research Agent</CardTitle>
          <CardDescription className="text-base">
            Provide your information to get personalized insurance research and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-2">
              <Label htmlFor="location">Your Location (City, State or ZIP)</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA or 94103"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-red-500 text-xs">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Your Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={errors.age ? "border-red-500" : ""}
              />
              {errors.age && <p className="text-red-500 text-xs">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="needs">What insurance are you looking for?</Label>
              <Textarea
                id="needs"
                placeholder="e.g., auto, home, life, renters, pet, health, disability, umbrella"
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                className={errors.needs ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground">Separate multiple needs with commas</p>
              {errors.needs && <p className="text-sm text-destructive">{errors.needs}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Start Research
            </Button>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or skip manual entry</span>
              </div>
            </div>

            {/* Audio Recording Option */}
            <div className="space-y-4">
              <div className="border rounded-lg p-6 bg-muted/30">
                <div className="flex items-start gap-3 mb-4">
                  <Mic className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Record Voice Message</h3>
                    <p className="text-xs text-muted-foreground">
                      Leave a voice message with your insurance needs, just like calling an insurance agent
                    </p>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="mr-2">⏳</span>
                      Processing your message...
                    </>
                  ) : isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>

                {isRecording && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-destructive animate-pulse">
                    <div className="w-2 h-2 bg-destructive rounded-full" />
                    Recording... Click "Stop Recording" when finished
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Example: "Hi, I'm John Smith from San Francisco, 94122. I'm 35 years old and looking for auto and home insurance."
                </p>
              </div>
            </div>

            {/* Coverage Analyzer */}
            <div className="pt-2">
              <CoverageAnalyzer
                customerProfile={{
                  location: location.trim() || 'Unknown',
                  state: location.split(',')[1]?.trim() || 'CA',  // Extract state from location
                  age: age || '30',
                  needs: needs.split(',').map(n => n.trim()).filter(Boolean),
                  insuranceType: 'auto'
                } as CustomerProfile}
                onAnalysisComplete={(coverage) => {
                  // Build comprehensive profile from extracted policy data
                  const profile: any = {}

                  // Personal Information
                  if (coverage.customerName) {
                    const nameParts = coverage.customerName.split(' ')
                    profile.firstName = nameParts[0]
                    profile.lastName = nameParts.slice(1).join(' ')
                  }
                  if (coverage.email) profile.email = coverage.email
                  if (coverage.phone) profile.phone = coverage.phone
                  if (coverage.dateOfBirth) profile.dateOfBirth = coverage.dateOfBirth

                  // Location
                  if (coverage.address) profile.address = coverage.address
                  if (coverage.city) profile.city = coverage.city
                  if (coverage.state) profile.state = coverage.state
                  if (coverage.zipCode) profile.zipCode = coverage.zipCode
                  profile.location = coverage.city && coverage.state ? `${coverage.city}, ${coverage.state}` : coverage.zipCode || 'Unknown'

                  // Insurance Details
                  profile.insuranceType = coverage.coverageType || 'auto'
                  profile.needs = [profile.insuranceType]
                  if (coverage.carrier) profile.currentInsurer = coverage.carrier
                  if (coverage.totalPremium) profile.currentPremium = coverage.totalPremium

                  // Auto Insurance: Vehicles
                  if (coverage.vehicles && coverage.vehicles.length > 0) {
                    profile.vehiclesCount = coverage.vehicles.length
                    profile.vehicles = coverage.vehicles.map((v: any) => ({
                      year: v.year,
                      make: v.make,
                      model: v.model,
                      vin: v.vin,
                      primaryUse: v.usage || v.primaryUse,
                      annualMileage: v.annualMileage,
                      // Include NHTSA enriched fields
                      bodyClass: v.bodyClass,
                      fuelType: v.fuelType,
                      doors: v.doors,
                      manufacturer: v.manufacturer,
                      plantCity: v.plantCity,
                      plantState: v.plantState,
                      vehicleType: v.vehicleType,
                      gvwr: v.gvwr,
                      abs: v.abs,
                      esc: v.esc,
                      enriched: v.enriched,
                      enrichmentSource: v.enrichmentSource
                    }))
                  }

                  // Auto Insurance: Drivers
                  if (coverage.drivers && coverage.drivers.length > 0) {
                    profile.driversCount = coverage.drivers.length
                    profile.drivers = coverage.drivers.map((d: any) => ({
                      name: d.name,
                      age: d.age || d.dateOfBirth,
                      yearsLicensed: d.yearsLicensed
                    }))
                  }

                  // Home Insurance
                  if (coverage.propertyType) profile.homeType = coverage.propertyType
                  if (coverage.yearBuilt) profile.yearBuilt = coverage.yearBuilt
                  if (coverage.squareFootage) profile.squareFootage = coverage.squareFootage
                  if (coverage.dwellingCoverage) profile.homeValue = coverage.dwellingCoverage

                  // Calculate age from date of birth if available
                  if (coverage.dateOfBirth && !profile.age) {
                    try {
                      const birthDate = new Date(coverage.dateOfBirth)
                      const age = new Date().getFullYear() - birthDate.getFullYear()
                      profile.age = age.toString()
                    } catch (e) {
                      profile.age = '30'
                    }
                  }

                  // 🔒 Transfer OpenCage address enrichment
                  if (coverage.addressEnrichment) {
                    profile.addressEnrichment = coverage.addressEnrichment
                    console.log('[Profile] ✓ OpenCage enrichment transferred:', coverage.addressEnrichment)
                  }

                  // 🌊 Transfer Risk Assessment (Proactive Agent)
                  if (coverage.riskAssessment) {
                    profile.riskAssessment = coverage.riskAssessment
                    console.log('[Profile] ✓ Risk assessment transferred:', coverage.riskAssessment)
                    if (coverage.riskAssessment.floodRisk) {
                      console.log('[Profile] 🌊 Flood risk:', coverage.riskAssessment.floodRisk.riskLevel)
                    }
                  }

                  console.log('[Profile] Auto-populated from policy:', profile)

                  // Submit with comprehensive extracted data
                  onSubmit(profile)
                }}
                insuranceType="auto"
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
