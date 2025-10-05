"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormattedResponse } from "@/components/formatted-response"
import { SuggestedPrompts } from "@/components/suggested-prompts"
import { QuoteProfileDisplay } from "@/components/quote-profile-display"
import { QuoteInformationGatherer } from "@/components/quote-information-gatherer"
import { QuoteResults } from "@/components/quote-results"
import { buildQuoteProfile } from "@/lib/quote-profile"
import type { CustomerProfile } from "@/app/page"
import { ProfileSummaryCard } from "@/components/profile-summary-card"
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

export function ChatInterface({ customerProfile }: ChatInterfaceProps) {
  const isAutoInsurance = customerProfile.needs.includes("auto")
  
  const initialGreeting = isAutoInsurance
    ? `Welcome! I'll help you get accurate auto insurance quotes quickly.

**Quick questions to get started:**
How many drivers will be on this policy?`
    : `Welcome! I'm your personal insurance coverage coach. I've reviewed your profile (${customerProfile.location}, age ${customerProfile.age}, focusing on ${customerProfile.needs.join(", ")}), and I'm here to guide you toward the optimal insurance strategy for your unique situation. 

Think of me as your trusted advisor who will help you navigate coverage options, understand what protection you truly need, and find the best value for your specific circumstances. What aspect of your insurance coverage would you like to explore first?`

  const [messages, setMessages] = useState<Message[]>([
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Track live profile updates from conversation
  const [liveProfile, setLiveProfile] = useState(() => {
    const saved = profileManager.loadProfile() || {}
    return { ...saved, ...customerProfile }
  })

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
    if (Object.keys(extractedProfile).length > 0) {
      const currentProfile = profileManager.loadProfile() || {}
      const updatedProfile = { ...currentProfile, ...customerProfile, ...extractedProfile }
      setLiveProfile(updatedProfile)
    }
  }, [messages, customerProfile])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handlePromptClick = (promptText: string) => {
    setInput(promptText)
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
    
    // Check if this is a quote request and show quote results
    if (information.insuranceType || information.needs?.some((need: string) => 
      need.toLowerCase().includes('quote') || 
      need.toLowerCase().includes('compare') ||
      need.toLowerCase().includes('price')
    )) {
      const quoteData = {
        insuranceType: information.insuranceType || 'Auto',
        customerProfile: { ...customerProfile, ...information },
        coverageAmount: information.coverageAmount || '$500,000',
        deductible: information.deductible || '$1,000',
        requestId: `REQ-${Date.now()}`
      }
      setQuoteData(quoteData)
      setShowQuoteResults(true)
    } else {
      // Check if we now have enough information to show quotes automatically
      const hasEnoughInfo = information.vehicles && information.vehicles.length > 0 && 
                           information.driversCount && information.driversCount > 0
      
      if (hasEnoughInfo) {
        // Automatically show quote results since we have enough info
        const quoteData = {
          insuranceType: 'Auto',
          customerProfile: { ...customerProfile, ...information },
          coverageAmount: information.coverageAmount || '$500,000',
          deductible: information.deductible || '$1,000',
          requestId: `REQ-${Date.now()}`
        }
        setQuoteData(quoteData)
        setShowQuoteResults(true)
      } else {
        // Send to API for processing
        handleSubmitWithInformation(information)
      }
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
    if (currentInput.toLowerCase().includes('quote') || 
        currentInput.toLowerCase().includes('compare') || 
        currentInput.toLowerCase().includes('price') || 
        currentInput.toLowerCase().includes('get insurance')) {
      
      // Check if we already have enough information to show quotes
      const hasEnoughInfo = liveProfile.vehicles && liveProfile.vehicles.length > 0 && 
                           liveProfile.driversCount && liveProfile.driversCount > 0
      
      if (hasEnoughInfo) {
        // We have enough info, show quote results directly
        const quoteData = {
          insuranceType: 'Auto',
          customerProfile: liveProfile,
          coverageAmount: liveProfile.coverageAmount || '$500,000',
          deductible: liveProfile.deductible || '$1,000',
          requestId: `REQ-${Date.now()}`
        }
        setQuoteData(quoteData)
        setShowQuoteResults(true)
        return
      } else {
        // Need more information, show information gatherer
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
      {/* Dynamic Profile Summary Card */}
      <ProfileSummaryCard profile={liveProfile} />

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
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-white border border-border shadow-sm text-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <FormattedResponse content={message.content} />
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  )}
                  <p className="text-xs opacity-70 mt-2">
                    {message.createdAt?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
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
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <span className="text-sm">→</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
