"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Square, Upload, Camera } from "lucide-react"
import { FormattedResponse } from "@/components/formatted-response"
import { SuggestedPrompts } from "@/components/suggested-prompts"
import { QuoteProfileDisplay } from "@/components/quote-profile-display"
import { QuoteInformationGatherer } from "@/components/quote-information-gatherer"
import { QuoteResults } from "@/components/quote-results"
import { PolicyHealthCard } from "@/components/policy-health-card"
import { analyzePolicy, type PolicyAnalysis } from "@/lib/policy-analyzer"
import { buildQuoteProfile } from "@/lib/quote-profile"
import type { CustomerProfile } from "@/lib/customer-profile"
import { profileManager, extractProfileFromConversation } from "@/lib/customer-profile"

interface ChatInterfaceProps {
  customerProfile: CustomerProfile
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

function RawDataView({ coverage, fieldsExtracted }: { coverage: any; fieldsExtracted: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const formatValue = (value: any): React.ReactNode => {
    if (value == null || value === '' || value === undefined) return null
    
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, idx) => (
            <div key={idx} className="pl-3 border-l-2 border-primary/30 space-y-1">
              {typeof item === 'object' ? (
                Object.entries(item).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-muted-foreground text-xs">{k}:</span>
                    <span className="text-foreground text-xs font-medium">{String(v)}</span>
                  </div>
                ))
              ) : (
                <span className="text-foreground text-xs">{String(item)}</span>
              )}
            </div>
          ))}
        </div>
      )
    }
    
    if (typeof value === 'object') {
      return (
        <div className="space-y-1 pl-3">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-muted-foreground text-xs">{k}:</span>
              <span className="text-foreground text-xs font-medium">{String(v)}</span>
            </div>
          ))}
        </div>
      )
    }
    
    return <span className="text-foreground break-words">{String(value)}</span>
  }
  
  return (
    <div className="bg-white border border-border shadow-sm text-foreground rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
          <span className="text-sm font-medium">
            🔍 View Raw Extracted Data ({fieldsExtracted} fields)
          </span>
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-3 pt-2 border-t border-border max-h-[400px] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3 text-xs">
            {Object.entries(coverage)
              .filter(([_, value]) => value != null && value !== '' && value !== undefined)
              .map(([key, value]) => (
                <div key={key} className="p-3 bg-muted/30 rounded space-y-1">
                  <div className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-sm">
                    {formatValue(value)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ChatInterface({ customerProfile }: ChatInterfaceProps) {
  const isAutoInsurance = customerProfile?.needs?.includes("auto") || false
  
  // Build a better greeting based on what profile data we have
  const getInitialGreeting = () => {
    const insuranceType = customerProfile?.needs?.[0] || 'insurance'
    const location = customerProfile?.location || 'your area'
    const age = customerProfile?.age || ''
    
    // Check if we already have rich profile data from a document scan
    const hasVehicleData = customerProfile?.vehicles && customerProfile.vehicles.length > 0
    const hasEnrichedVehicles = hasVehicleData && customerProfile.vehicles.some(v => v.enriched)
    const hasAddressEnrichment = customerProfile?.addressEnrichment?.enriched
    const hasRiskAssessment = customerProfile?.riskAssessment && 
      (customerProfile.riskAssessment.floodRisk || 
       customerProfile.riskAssessment.crimeRisk || 
       customerProfile.riskAssessment.earthquakeRisk ||
       customerProfile.riskAssessment.wildfireRisk)
    const hasCurrentPolicy = customerProfile?.carrier || customerProfile?.policyNumber
    const hasRequestedCoverages = customerProfile?.requestedCoverages && customerProfile.requestedCoverages.length > 0
    
    // If we have rich profile data, acknowledge it and move forward
    const hasRichData = (hasEnrichedVehicles || hasAddressEnrichment || hasRiskAssessment || hasCurrentPolicy)
    
    if (hasRichData) {
      // Build a summary of what we know
      let summary = "Perfect! I've analyzed your profile and here's what I have:\n\n"
      
      if (hasCurrentPolicy) {
        summary += `📄 **Current Policy:** ${customerProfile.carrier || 'Policy on file'}`
        if (customerProfile.policyNumber) summary += ` (${customerProfile.policyNumber})`
        summary += '\n'
      }
      
      if (hasVehicleData) {
        summary += `🚗 **Vehicles:** ${customerProfile.vehicles!.length} vehicle${customerProfile.vehicles!.length > 1 ? 's' : ''} `
        const firstVehicle = customerProfile.vehicles![0]
        if (firstVehicle.year && firstVehicle.make && firstVehicle.model) {
          summary += `(${firstVehicle.year} ${firstVehicle.make} ${firstVehicle.model}${customerProfile.vehicles!.length > 1 ? ', ...' : ''})`
        }
        summary += '\n'
      }
      
      if (hasAddressEnrichment) {
        summary += `📍 **Location:** ${customerProfile.addressEnrichment!.formattedAddress || location}\n`
      }
      
      if (hasRiskAssessment) {
        summary += `⚠️ **Risk Assessment:** Completed (flood, crime, earthquake, wildfire)\n`
      }
      
      if (hasRequestedCoverages) {
        summary += `✅ **Additional Coverages:** ${customerProfile.requestedCoverages!.length} coverage${customerProfile.requestedCoverages!.length > 1 ? 's' : ''} added to quote\n`
      }
      
      summary += `\n**Ready to get you personalized quotes!**\n\n**What would you like to do?**\n\n`
      summary += `1. 📊 **Get Comparison Quotes** - See rates from top carriers with your requested coverages\n`
      summary += `2. 💡 **Review Coverage Recommendations** - Discuss any gaps or optimizations\n`
      summary += `3. ✏️ **Update Details** - Make changes to your profile or add more information\n`
      summary += `4. ❓ **Ask Questions** - Get advice on coverage, carriers, or pricing\n\n`
      summary += `Just let me know how I can help!`
      
      return summary
    }
    
    // If no rich data, proceed with standard onboarding
    if (isAutoInsurance) {
      return `Great! I can get you accurate auto insurance quotes${location !== 'your area' ? ` in ${location}` : ''}.

**Fastest way to get started:**

📄 **OPTION 1 (30 seconds):** Do you have your current insurance policy or vehicle registration handy?
   • Take a photo and I'll extract all details automatically
   • Or upload your insurance card/registration
   
💬 **OPTION 2 (2 minutes):** Quick conversation:
   1. How many vehicles do you need to insure?
   2. Got the vehicle details? (year/make/model)

Which works better for you?`
    }
    
    // For renters, home, or other insurance
    if (insuranceType === 'renters' || insuranceType === 'home') {
      return `Perfect! Let's get you the best rates on ${insuranceType} insurance${location !== 'your area' ? ` for ${location}` : ''}.

**Two quick options:**

📄 **OPTION 1 (Fastest):** Upload a photo of your current policy or lease agreement, and I'll extract all details automatically.

💬 **OPTION 2 (Quick chat):** Answer a few questions about your property and I'll find you the best rates.

Which would you prefer?`
    }
    
    // Default for other insurance types
    return `Great! I can help you find the right ${insuranceType} coverage${age ? ` for someone ${age} years old` : ''}.

**Let me ask you a few quick questions to get accurate quotes:**

Do you currently have ${insuranceType} insurance? If yes, do you have your policy document handy? I can scan it to speed things up!`
  }
  
  const initialGreeting = getInitialGreeting()

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "1",
      role: "assistant",
      content: initialGreeting,
      createdAt: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showInformationGatherer, setShowInformationGatherer] = useState(false)
  const [gatheredInformation, setGatheredInformation] = useState<any>(null)
  const [showQuoteResults, setShowQuoteResults] = useState(false)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isUploadingDocument, setIsUploadingDocument] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const initialMessageSentRef = useRef(false)

  // Track live profile updates from conversation
  const [liveProfile, setLiveProfile] = useState(() => {
    // Use fresh profile from localStorage - don't merge with customerProfile prop
    // which might have stale data without enrichment
    return profileManager.loadProfile() || customerProfile || {}
  })

  // Update liveProfile when customerProfile prop changes (e.g., after policy scan)
  useEffect(() => {
    if (customerProfile && Object.keys(customerProfile).length > 0) {
      console.log('[ChatInterface] customerProfile prop changed:', JSON.stringify({
        vehicles: customerProfile.vehicles?.map(v => ({
          year: v.year, make: v.make, model: v.model, enriched: v.enriched, bodyClass: v.bodyClass
        }))
      }))
      
      // Just update local state - don't save to localStorage (parent already did that)
      setLiveProfile(customerProfile)
    }
  }, [customerProfile])

  // Send initial audio message if provided
  useEffect(() => {
    const initialMessage = (customerProfile as any)?.initialMessage
    if (initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true
      console.log('[ChatInterface] Sending initial audio message:', initialMessage)
      
      // Trigger AI response with the message
      setTimeout(() => {
        // Manually add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: initialMessage,
          createdAt: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        
        // Then fetch AI response
        const assistantMessageId = (Date.now() + 1).toString()
        setIsLoading(true)
        
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            customerProfile: liveProfile,
          }),
        })
          .then(async (response) => {
            if (!response.ok) throw new Error(`API Error: ${response.status}`)
            
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantContent = ""
            
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: "assistant",
              content: "",
              createdAt: new Date(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            
            if (reader) {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                const chunk = decoder.decode(value, { stream: true })
                assistantContent += chunk
                
                if (assistantContent.trim()) {
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: assistantContent } : msg))
                  )
                }
              }
              reader.releaseLock()
            }
          })
          .catch((error) => {
            console.error("[ChatInterface] Error:", error)
          })
          .finally(() => {
            setIsLoading(false)
          })
      }, 500) // Small delay to ensure UI is ready
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerProfile])

  // Build quote profile from messages for auto insurance
  const quoteProfile = useMemo(() => {
    if (!isAutoInsurance) return null
    return buildQuoteProfile(messages, customerProfile)
  }, [messages, customerProfile, isAutoInsurance])

  // Extract and update profile from messages in real-time
  useEffect(() => {
    const extractedProfile = extractProfileFromConversation(messages.map(m => ({
      role: m.role,
      content: m.content
    })))
    
    // 🔒 CRITICAL FIX: Only update profile if we have MEANINGFUL new data
    // Don't overwrite with empty or minimal extractions
    const hasMeaningfulData = 
      extractedProfile.vehicles?.length > 0 ||
      extractedProfile.driversCount ||
      extractedProfile.customerName ||
      extractedProfile.address ||
      extractedProfile.city ||
      extractedProfile.state ||
      extractedProfile.zipCode ||
      extractedProfile.email ||
      extractedProfile.needs?.length > 0
    
    if (hasMeaningfulData) {
      console.log('[ChatInterface] Updating profile with meaningful data:', extractedProfile)
      // Use smart merge to preserve enriched data
      profileManager.updateProfile(extractedProfile)
      const updatedProfile = profileManager.loadProfile() || {}
      // Don't merge with customerProfile - it might have stale data!
      // Just use the freshly loaded profile from localStorage
      setLiveProfile(updatedProfile)
    } else {
      console.log('[ChatInterface] Skipping profile update - no meaningful new data')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]) // Only run when messages change, not when customerProfile changes

  // Auto-scroll to bottom when new messages are added (but not on initial load)
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handlePromptClick = async (promptText: string) => {
    if (isLoading) return

    // Create and send the message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: promptText,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Check if user is asking for quotes/comparisons
    // Include "1" as a shortcut trigger since the AI prompts users to type "1" or "get quotes"
    const isQuoteRequest = promptText.trim() === '1' ||
                          promptText.toLowerCase().includes('quote') ||
                          promptText.toLowerCase().includes('compare') ||
                          promptText.toLowerCase().includes('price') ||
                          promptText.toLowerCase().includes('get insurance')

    if (isQuoteRequest) {
      // Determine insurance type from profile
      const insuranceType = liveProfile.needs?.[0] || liveProfile.insuranceType || 'auto'
      const insuranceTypeCapitalized = insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)

      // Check if we have enough information based on insurance type
      let hasEnoughInfo = false
      let profileWithDefaults = { ...liveProfile }

      const hasAddress = liveProfile.address || liveProfile.city || liveProfile.zipCode

      if (insuranceType === 'auto') {
        // Auto: need vehicles and address
        const hasVehicles = liveProfile.vehicles && liveProfile.vehicles.length > 0
        hasEnoughInfo = hasVehicles && hasAddress
        profileWithDefaults.driversCount = liveProfile.driversCount || 1
      } else if (insuranceType === 'renters' || insuranceType === 'home') {
        // Renters/Home: need address
        hasEnoughInfo = hasAddress
        profileWithDefaults.coverageAmount = liveProfile.coverageAmount || (insuranceType === 'home' ? '$300,000' : '$50,000')
      } else if (insuranceType === 'life' || insuranceType === 'disability') {
        // Life/Disability: need age and location
        const hasAge = liveProfile.age && parseInt(liveProfile.age) > 0
        hasEnoughInfo = hasAge && hasAddress
        profileWithDefaults.coverageAmount = liveProfile.coverageAmount || (insuranceType === 'life' ? '$500,000' : '$100,000')
      } else {
        // Other insurance types: just need location
        hasEnoughInfo = hasAddress
      }

      if (hasEnoughInfo) {
        // We have enough info, show quote results directly
        console.log('[ChatInterface] Triggering quote display for:', {
          insuranceType: insuranceTypeCapitalized,
          hasAddress,
          profile: {
            vehicles: profileWithDefaults.vehicles?.length,
            age: profileWithDefaults.age,
            location: profileWithDefaults.location || profileWithDefaults.city
          }
        })

        const quoteData = {
          insuranceType: insuranceTypeCapitalized,
          customerProfile: profileWithDefaults,
          coverageAmount: profileWithDefaults.coverageAmount || '$500,000',
          deductible: profileWithDefaults.deductible || '$1,000',
          requestId: `REQ-${Date.now()}`
        }
        setQuoteData(quoteData)
        setShowQuoteResults(true)
        return
      } else {
        // Need more information, show information gatherer
        console.log('[ChatInterface] Missing data for quotes:', {
          insuranceType: insuranceTypeCapitalized,
          hasAddress,
          profile: liveProfile
        })
        setShowInformationGatherer(true)
        return
      }
    }

    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          customerProfile,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API Error:", errorData)
        throw new Error(`API Error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            assistantContent += chunk

            if (assistantContent.trim()) {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: assistantContent } : msg)),
              )
            }
          }
        } catch (streamError) {
          console.error("[v0] Stream reading error:", streamError)
          throw streamError
        } finally {
          reader.releaseLock()
        }
      }

      // 🎯 SMART DETECTION: If AI is recommending carriers, trigger quote display
      const isCarrierRecommendation = 
        (assistantContent.toLowerCase().includes('state farm') ||
         assistantContent.toLowerCase().includes('geico') ||
         assistantContent.toLowerCase().includes('progressive') ||
         assistantContent.toLowerCase().includes('allstate')) &&
        (assistantContent.toLowerCase().includes('quote') ||
         assistantContent.toLowerCase().includes('carrier') ||
         assistantContent.toLowerCase().includes('contact') ||
         assistantContent.toLowerCase().includes('action plan'))

      // Check if we have enough profile data to show quotes
      const hasEnoughInfo = liveProfile.vehicles && liveProfile.vehicles.length > 0 &&
                           liveProfile.driversCount && liveProfile.driversCount > 0

      if (isCarrierRecommendation && hasEnoughInfo) {
        // Show "Fetching quotes..." message after a brief delay
        setTimeout(() => {
          const fetchingMessage: Message = {
            id: Date.now().toString() + '-fetching',
            role: "assistant",
            content: "🎯 **Perfect! Let me get you actual quotes from these carriers...**\n\n*Fetching live rates from State Farm, GEICO, Progressive, and Allstate...*\n\n⏳ *This will take just a moment...*",
            createdAt: new Date(),
          }
          setMessages(prev => [...prev, fetchingMessage])

          // Trigger quote results after slight delay to simulate API calls
          setTimeout(() => {
            const quoteData = {
              insuranceType: 'Auto',
              customerProfile: liveProfile,
              coverageAmount: liveProfile.coverageAmount || '$500,000',
              deductible: liveProfile.deductible || '$1,000',
              requestId: `REQ-${Date.now()}`
            }
            setQuoteData(quoteData)
            setShowQuoteResults(true)
          }, 3000) // 3 second delay to show "fetching" state
        }, 1500)
      }

    } catch (error) {
      console.error("[v0] Chat error:", error)
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))

      const fallbackMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: generateStructuredResponse(promptText, customerProfile),
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInformationGathering = () => {
    setShowInformationGatherer(true)
  }

  const handleInformationComplete = (information: any) => {
    setGatheredInformation(information)
    setShowInformationGatherer(false)
    
    // Create a message with the gathered information
    const informationMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `I've provided the following information: ${JSON.stringify(information, null, 2)}`,
      createdAt: new Date(),
    }
    
    setMessages(prev => [...prev, informationMessage])
    
    // Check if we have enough information for quotes
    const hasEnoughInfo = (information.vehicles && information.vehicles.length > 0 && 
                           information.driversCount && information.driversCount > 0) ||
                          (information.insuranceType && information.location)
    
    if (hasEnoughInfo) {
      // Add immediate "generating quotes" message
      const generatingMessage: Message = {
        id: Date.now().toString() + '-generating',
        role: "assistant",
        content: "🎯 **Great! I have all the information I need.**\n\nGenerating personalized quotes from top carriers...\n\n*This will just take a moment...*",
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, generatingMessage])
      
      // Automatically show quote results with slight delay for UX
      setTimeout(() => {
        const quoteData = {
          insuranceType: information.insuranceType || 'Auto',
          customerProfile: { ...customerProfile, ...information },
          coverageAmount: information.coverageAmount || '$500,000',
          deductible: information.deductible || '$1,000',
          requestId: `REQ-${Date.now()}`
        }
        setQuoteData(quoteData)
        setShowQuoteResults(true)
      }, 1500)
    } else {
      // Send to API for processing if more info needed
      handleSubmitWithInformation(information)
    }
  }

  const handleInformationCancel = () => {
    setShowInformationGatherer(false)
  }

  const handleBackToChat = () => {
    setShowQuoteResults(false)
    setQuoteData(null)
  }

  const handleNewQuote = () => {
    setShowQuoteResults(false)
    setQuoteData(null)
    setShowInformationGatherer(true)
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
    setIsLoading(true)

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

      // Add user message with transcribed text
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `🎤 ${text}`,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Send transcribed text to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          customerProfile: liveProfile,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            assistantContent += chunk

            if (assistantContent.trim()) {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg))
              )
            }
          }
        } finally {
          reader.releaseLock()
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble processing your audio message. Please try again or type your message.',
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsUploadingDocument(true)
    setShowFileUpload(false)

    // Add user message showing they uploaded a document
    const uploadMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `📄 Uploaded: ${file.name}`,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, uploadMessage])

    // Add "analyzing" message
    const analyzingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '🔍 Analyzing your document and enriching data...',
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, analyzingMessage])

    try {
      const formData = new FormData()
      formData.append('file', file)
      const insuranceType = customerProfile?.needs?.[0]
      if (insuranceType) {
        formData.append('insuranceType', insuranceType)
      }

      const response = await fetch('/api/analyze-coverage', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to analyze document')
      }

      const coverage = result.coverage

      // Run policy analysis
      let policyAnalysis: PolicyAnalysis | null = null
      if (coverage && liveProfile) {
        try {
          policyAnalysis = analyzePolicy(coverage, liveProfile)
        } catch (err) {
          console.error('[Chat] Policy analysis failed:', err)
        }
      }

      // Remove analyzing message
      setMessages((prev) => prev.filter((msg) => msg.id !== analyzingMessage.id))

      // Update profile with extracted data
      handleCoverageAnalysisComplete(coverage)

      // 1. Add completion summary message first
      const fieldsExtracted = Object.keys(coverage).filter(key => coverage[key] != null && coverage[key] !== '' && coverage[key] !== undefined).length
      const completionContent = `✅ **Policy Analysis Complete!**

Successfully extracted **${fieldsExtracted} fields** from your document and enriched with:
${result.enrichmentSummary ? `
- ${result.enrichmentSummary.vehiclesEnriched ? '✅' : '⏭️'} Vehicle data (NHTSA VIN decoder)
- ${result.enrichmentSummary.addressEnriched ? '✅' : '⏭️'} Address verification (OpenCage)
- ${result.enrichmentSummary.floodRiskAssessed ? '✅' : '⏭️'} Flood risk assessment
- ${result.enrichmentSummary.crimeRiskAssessed ? '✅' : '⏭️'} Crime risk assessment
- ${result.enrichmentSummary.earthquakeRiskAssessed ? '✅' : '⏭️'} Earthquake risk assessment
- ${result.enrichmentSummary.wildfireRiskAssessed ? '✅' : '⏭️'} Wildfire risk assessment
` : ''}
View the extracted data and policy health score below:`

      const completionMessage: Message = {
        id: Date.now().toString() + '-completion',
        role: 'assistant',
        content: completionContent,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, completionMessage])

      // 2. Add raw extracted data view (collapsible)
      const rawDataMessage: Message = {
        id: (Date.now() + 1).toString() + '-rawdata',
        role: 'assistant',
        content: JSON.stringify({ type: 'raw-data', data: { coverage, fieldsExtracted } }),
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, rawDataMessage])

      // 3. Add policy health card
      const healthCardMessage: Message = {
        id: (Date.now() + 2).toString() + '-health',
        role: 'assistant',
        content: JSON.stringify({ type: 'policy-health', data: { coverage, policyAnalysis, enrichmentSummary: result.enrichmentSummary } }),
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, healthCardMessage])

      // 4. Automatically trigger quote generation - no need to ask what they want
      const followUpContent = `Perfect! I have everything I need from your ${coverage.carrier || 'policy'}.

${policyAnalysis && policyAnalysis.gaps.length > 0 ? `I found **${policyAnalysis.gaps.length} coverage gap${policyAnalysis.gaps.length > 1 ? 's' : ''}** (visible above). You can add any recommended coverages by clicking "Add as Additional Coverage on New Policy" on each gap.

` : ''}Let me pull comparison quotes from top carriers now. Just type "get quotes" or "1" when you're ready!`

      const followUpMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: followUpContent,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, followUpMessage])

    } catch (error) {
      console.error('[Chat] Document upload error:', error)
      
      // Remove analyzing message
      setMessages((prev) => prev.filter((msg) => msg.id !== analyzingMessage.id))

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Sorry, I had trouble analyzing that document. ${error instanceof Error ? error.message : 'Please try again or upload a clearer image.'}`,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsUploadingDocument(false)
    }
  }

  const handleCoverageAnalysisComplete = (coverage: any) => {
    // Update profile with extracted coverage information
    const profileUpdates: Partial<CustomerProfile> = {}

    if (coverage.vehicles && coverage.vehicles.length > 0) {
      profileUpdates.vehicles = coverage.vehicles
      profileUpdates.vehiclesCount = coverage.vehicles.length
    }

    if (coverage.coverageType) {
      profileUpdates.needs = [coverage.coverageType]
    }

    // Save to profile
    profileManager.updateProfile(profileUpdates)

    // Format coverages for display
    let coverageDisplay = ''
    if (coverage.coverages && coverage.coverages.length > 0) {
      coverageDisplay = coverage.coverages.map((c: any, idx: number) => {
        let line = `${idx + 1}. **${c.type}**`
        if (c.limit) line += `\n   • Limit: ${c.limit}`
        if (c.deductible) line += `\n   • Deductible: ${c.deductible}`
        if (c.premium) line += `\n   • Premium: ${c.premium}`
        return line
      }).join('\n\n')
    } else {
      coverageDisplay = '_Coverage details not fully extracted_'
    }

    // Add a message to the chat about the analyzed coverage
    const analysisMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `✅ **Policy Analysis Complete!**

I've analyzed your current ${coverage.coverageType || 'insurance'} policy with **${coverage.carrier || 'your carrier'}**.

**Your Current Coverages:**

${coverageDisplay}

${coverage.totalPremium ? `\n💰 **Total Premium:** ${coverage.totalPremium}${coverage.paymentFrequency ? ` (${coverage.paymentFrequency})` : ''}` : ''}

${coverage.gaps && coverage.gaps.length > 0 ? `\n\n⚠️ **Coverage Gaps I've Identified:**\n${coverage.gaps.map((g: string) => `• ${g}`).join('\n')}` : ''}

${coverage.recommendations && coverage.recommendations.length > 0 ? `\n\n💡 **My Recommendations:**\n${coverage.recommendations.map((r: string) => `• ${r}`).join('\n')}` : ''}

---

📋 **Would you like to:**

1) **Keep the same coverages** - I'll find you better rates with identical protection
2) **Increase coverage** - Get better protection (recommended if you have gaps)
3) **Adjust specific coverages** - Tell me what you'd like to change
4) **Get minimum required coverage** - Lower cost, state minimum protection

Please select an option (1-4) or tell me what you'd like to change!`,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, analysisMessage])
    setShowCoverageAnalyzer(false)
  }
  const handleSubmitWithInformation = async (information: any) => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, {
            role: "user",
            content: `I've provided detailed information: ${JSON.stringify(information)}`
          }].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          customerProfile: { ...customerProfile, ...information },
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            assistantContent += chunk

            if (assistantContent.trim()) {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg)),
              )
            }
          }
        } finally {
          reader.releaseLock()
        }
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    
    // Check if user is asking for quotes/comparisons
    // Include "1" as a shortcut trigger since the AI prompts users to type "1" or "get quotes"
    const isQuoteRequest = currentInput.trim() === '1' ||
                          currentInput.toLowerCase().includes('quote') ||
                          currentInput.toLowerCase().includes('compare') ||
                          currentInput.toLowerCase().includes('price') ||
                          currentInput.toLowerCase().includes('get insurance')

    if (isQuoteRequest) {
      // Determine insurance type from profile
      const insuranceType = liveProfile.needs?.[0] || liveProfile.insuranceType || 'auto'
      const insuranceTypeCapitalized = insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)

      // Check if we have enough information based on insurance type
      let hasEnoughInfo = false
      let profileWithDefaults = { ...liveProfile }

      const hasAddress = liveProfile.address || liveProfile.city || liveProfile.zipCode

      if (insuranceType === 'auto') {
        // Auto: need vehicles and address
        const hasVehicles = liveProfile.vehicles && liveProfile.vehicles.length > 0
        hasEnoughInfo = hasVehicles && hasAddress
        profileWithDefaults.driversCount = liveProfile.driversCount || 1
      } else if (insuranceType === 'renters' || insuranceType === 'home') {
        // Renters/Home: need address
        hasEnoughInfo = hasAddress
        profileWithDefaults.coverageAmount = liveProfile.coverageAmount || (insuranceType === 'home' ? '$300,000' : '$50,000')
      } else if (insuranceType === 'life' || insuranceType === 'disability') {
        // Life/Disability: need age and location
        const hasAge = liveProfile.age && parseInt(liveProfile.age) > 0
        hasEnoughInfo = hasAge && hasAddress
        profileWithDefaults.coverageAmount = liveProfile.coverageAmount || (insuranceType === 'life' ? '$500,000' : '$100,000')
      } else {
        // Other insurance types: just need location
        hasEnoughInfo = hasAddress
      }

      if (hasEnoughInfo) {
        // We have enough info, show quote results directly
        console.log('[ChatInterface] Triggering quote display from input for:', {
          insuranceType: insuranceTypeCapitalized,
          hasAddress,
          profile: {
            vehicles: profileWithDefaults.vehicles?.length,
            age: profileWithDefaults.age,
            location: profileWithDefaults.location || profileWithDefaults.city
          }
        })

        const quoteData = {
          insuranceType: insuranceTypeCapitalized,
          customerProfile: profileWithDefaults,
          coverageAmount: profileWithDefaults.coverageAmount || '$500,000',
          deductible: profileWithDefaults.deductible || '$1,000',
          requestId: `REQ-${Date.now()}`
        }
        setQuoteData(quoteData)
        setShowQuoteResults(true)
        return
      } else {
        // Need more information, show information gatherer
        console.log('[ChatInterface] Missing data for quotes:', {
          insuranceType: insuranceTypeCapitalized,
          hasAddress,
          profile: liveProfile
        })
        setShowInformationGatherer(true)
        return
      }
    }
    
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()

    try {
      console.log("[v0] Sending request to API")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          customerProfile,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API Error:", errorData)
        throw new Error(`API Error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        console.log("[v0] Starting to read stream")
        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              console.log("[v0] Stream completed, final content length:", assistantContent.length)
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            console.log("[v0] Received chunk:", chunk)

            assistantContent += chunk

            if (assistantContent.trim()) {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: assistantContent } : msg)),
              )
            }
          }
        } catch (streamError) {
          console.error("[v0] Stream reading error:", streamError)
          throw streamError
        } finally {
          reader.releaseLock()
        }
      }

      // 🎯 SMART DETECTION: If AI is recommending carriers, trigger quote display
      const isCarrierRecommendation = 
        (assistantContent.toLowerCase().includes('state farm') ||
         assistantContent.toLowerCase().includes('geico') ||
         assistantContent.toLowerCase().includes('progressive') ||
         assistantContent.toLowerCase().includes('allstate')) &&
        (assistantContent.toLowerCase().includes('quote') ||
         assistantContent.toLowerCase().includes('carrier') ||
         assistantContent.toLowerCase().includes('contact') ||
         assistantContent.toLowerCase().includes('action plan'))

      // Check if we have enough profile data to show quotes
      const hasEnoughInfo = liveProfile.vehicles && liveProfile.vehicles.length > 0 &&
                           liveProfile.driversCount && liveProfile.driversCount > 0

      if (isCarrierRecommendation && hasEnoughInfo) {
        // Show "Fetching quotes..." message after a brief delay
        setTimeout(() => {
          const fetchingMessage: Message = {
            id: Date.now().toString() + '-fetching',
            role: "assistant",
            content: "🎯 **Perfect! Let me get you actual quotes from these carriers...**\n\n*Fetching live rates from State Farm, GEICO, Progressive, and Allstate...*\n\n⏳ *This will take just a moment...*",
            createdAt: new Date(),
          }
          setMessages(prev => [...prev, fetchingMessage])

          // Trigger quote results after slight delay to simulate API calls
          setTimeout(() => {
            const quoteData = {
              insuranceType: 'Auto',
              customerProfile: liveProfile,
              coverageAmount: liveProfile.coverageAmount || '$500,000',
              deductible: liveProfile.deductible || '$1,000',
              requestId: `REQ-${Date.now()}`
            }
            setQuoteData(quoteData)
            setShowQuoteResults(true)
          }, 3000) // 3 second delay to show "fetching" state
        }, 1500)
      }

    } catch (error) {
      console.error("[v0] Chat error:", error)
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))

      const fallbackMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: generateStructuredResponse(currentInput, customerProfile),
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateStructuredResponse = (query: string, profile: CustomerProfile): string => {
    // Sanitize query to prevent formatting issues
    const sanitizedQuery = query.replace(/"/g, "'").substring(0, 100)
    
    return `## Your Coverage Assessment

Based on your question about ${sanitizedQuery}, here's my coaching guidance:

### Your Current Situation
- **Location**: ${profile.location} - I'll factor in your state's requirements and market conditions
- **Life Stage**: Age ${profile.age} - This influences your coverage priorities and available options  
- **Coverage Goals**: ${profile.needs.join(", ")} - Let's align your protection with these objectives

### My Coaching Recommendations

**Immediate Focus Areas:**
1. **Gap Analysis** - Let's identify where your current coverage might fall short
2. **Priority Setting** - I'll help you rank your insurance needs by importance and urgency
3. **Budget Optimization** - We'll find the sweet spot between adequate protection and affordability

**Next Steps in Your Journey:**
1. **Coverage Review** - I'll guide you through evaluating your current policies
2. **Market Research** - Together we'll explore the best carriers for your specific needs
3. **Strategy Development** - We'll create a personalized insurance roadmap

### Why This Coaching Approach Works
Unlike generic insurance advice, I provide personalized guidance based on your unique circumstances. I'm here to educate, not just sell - helping you make informed decisions that protect what matters most to you.

**Ready to dive deeper?** Ask me about any specific coverage area, and I'll provide tailored coaching based on your profile and goals.

*This is your personal insurance coach - I'm here to guide you every step of the way toward optimal coverage.*`
  }



  // Show information gatherer if needed
  if (showInformationGatherer) {
    return (
      <div className="space-y-4">
        <QuoteInformationGatherer
          insuranceType={customerProfile.needs[0] || 'auto'}
          onComplete={handleInformationComplete}
          onCancel={handleInformationCancel}
        />
      </div>
    )
  }

  // Show quote results if available
  if (showQuoteResults && quoteData) {
    return (
      <QuoteResults
        quoteData={quoteData}
        onBack={handleBackToChat}
        onNewQuote={handleNewQuote}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Quote Profile Display - Only for Auto Insurance */}
      {isAutoInsurance && quoteProfile && messages.length > 1 && (
        <QuoteProfileDisplay profile={quoteProfile} />
      )}
      
      <Card className={`h-[calc(100vh-16rem)] flex flex-col`}>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full flex-shrink-0">
                    <span className="text-primary-foreground text-xs font-bold">🎯</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg ${
                    message.role === "user" ? "bg-primary text-primary-foreground px-4 py-3" : ""
                  }`}
                >
                  {message.role === "assistant" ? (
                    (() => {
                      // Check if this is a special message type
                      try {
                        const parsed = JSON.parse(message.content)
                        
                        // Raw extracted data view
                        if (parsed.type === 'raw-data' && parsed.data) {
                          return (
                            <RawDataView 
                              coverage={parsed.data.coverage} 
                              fieldsExtracted={parsed.data.fieldsExtracted} 
                            />
                          )
                        }
                        
                        // Policy health card view
                        if (parsed.type === 'policy-health' && parsed.data) {
                          return parsed.data.policyAnalysis ? (
                            <PolicyHealthCard
                              analysis={parsed.data.policyAnalysis}
                              requestedCoverages={liveProfile.requestedCoverages || []}
                              onFixGap={(gapId) => {
                                // Find the gap details
                                const gap = parsed.data.policyAnalysis.gaps.find((g: any) => g.id === gapId)
                                if (!gap) return
                                
                                // Add to requested coverages
                                const requestedCoverage = {
                                  gapId,
                                  coverageType: gap.category,
                                  title: gap.title,
                                  requestedAt: new Date().toISOString()
                                }
                                
                                const currentProfile = profileManager.loadProfile() || {}
                                const existingRequests = currentProfile.requestedCoverages || []
                                
                                // Check if already requested
                                if (!existingRequests.some(r => r.gapId === gapId)) {
                                  profileManager.updateProfile({
                                    requestedCoverages: [...existingRequests, requestedCoverage]
                                  })
                                  
                                  // Update local state
                                  setLiveProfile(prev => ({
                                    ...prev,
                                    requestedCoverages: [...existingRequests, requestedCoverage]
                                  }))
                                  
                                  // Add a confirmation message
                                  const confirmMessage: Message = {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: `✅ **Added to your new policy request!**\n\nI've added **${gap.title}** to your list of additional coverages. When I generate quotes, I'll include this coverage in all policy options.\n\nWould you like to add any other coverages, or shall we proceed to get quotes?`,
                                    createdAt: new Date(),
                                  }
                                  setMessages((prev) => [...prev, confirmMessage])
                                }
                              }}
                            />
                          ) : null
                        }
                      } catch (e) {
                        // Not a special message, render normally
                      }
                      return (
                        <div className="bg-white border border-border shadow-sm text-foreground px-4 py-3 rounded-lg">
                          <FormattedResponse content={message.content} />
                          <p className="text-xs opacity-70 mt-2">
                            {message.createdAt?.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )
                    })()
                  ) : (
                    <>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                      <p className="text-xs opacity-70 mt-2">
                        {message.createdAt?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex items-center justify-center w-8 h-8 bg-secondary rounded-full flex-shrink-0">
                    <span className="text-secondary-foreground text-xs font-bold">👤</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full flex-shrink-0">
                  <span className="text-primary-foreground text-xs font-bold">🎯</span>
                </div>
                <div className="bg-muted/50 border border-border rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Document Upload Option - Show after initial greeting */}
        {messages.length <= 3 && !isLoading && !isUploadingDocument && (
          <div className="px-4 py-3 border-t border-border bg-muted/20">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingDocument}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isUploadingDocument}
                title="Take photo"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            {/* File upload input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file)
                  e.target.value = '' // Reset input
                }
              }}
            />
            {/* Camera capture input */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file)
                  e.target.value = '' // Reset input
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Upload your insurance policy, card, or vehicle registration
            </p>
          </div>
        )}

        {/* Suggested Prompts */}
        <SuggestedPrompts
          messages={messages}
          customerProfile={customerProfile}
          onPromptClick={handlePromptClick}
          onStartInformationGathering={handleStartInformationGathering}
          isLoading={isLoading}
        />

        {/* Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coverage coach about insurance strategies, options, or recommendations..."
              className="flex-1"
              disabled={isLoading || isRecording}
            />
            <Button 
              type="button"
              size="icon" 
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading || isRecording}>
              <span className="text-sm">→</span>
            </Button>
          </form>
          {isRecording && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive animate-pulse">
              <div className="w-2 h-2 bg-destructive rounded-full" />
              Recording... Click stop when finished
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
