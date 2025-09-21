"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CustomerProfile } from "@/app/page"

interface ChatInterfaceProps {
  customerProfile: CustomerProfile
  onRequestQuote?: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export function ChatInterface({ customerProfile, onRequestQuote }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your insurance research assistant. Based on your profile (${customerProfile.location}, age ${customerProfile.age}, interested in ${customerProfile.needs.join(", ")}), I can help you research insurance products, regulations, and carriers. What would you like to know?`,
      createdAt: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

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
    setIsLoading(true)

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
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        console.log("[v0] Starting to read stream")
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          console.log("[v0] Received chunk:", chunk)

          assistantContent += chunk

          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg)),
          )
        }
        console.log("[v0] Final content length:", assistantContent.length)
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: assistantContent || generateStructuredResponse(currentInput, customerProfile) }
            : msg,
        ),
      )
    } catch (error) {
      console.error("[v0] Chat error:", error)
      // Fallback to structured response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateStructuredResponse(currentInput, customerProfile),
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateStructuredResponse = (query: string, profile: CustomerProfile): string => {
    return `## Customer Profile
- Location: ${profile.location}
- Age: ${profile.age}
- Needs: ${profile.needs.join(", ")}

## Relevant Products
Based on your query "${query}" and profile, here are the top insurance product categories:

1. **${profile.needs[0] || "Primary Insurance"}** - Core coverage for your main need
2. **Comprehensive Coverage** - Enhanced protection options
3. **State-Specific Products** - ${profile.location} compliant policies

## Regulations & Local Considerations
- ${profile.location} state insurance requirements
- Age-specific regulations for ${profile.age}-year-olds
- Mandatory coverage minimums and optional add-ons

## Carriers / Market Players
- **Major National Carriers**: Established providers with strong ${profile.location} presence
- **Regional Specialists**: Local insurers with competitive rates
- **Digital-First Options**: Modern platforms with streamlined processes

## Recommendations
Based on your profile, I recommend:
1. Start with quotes from 3-5 carriers for comparison
2. Consider bundling multiple insurance types for discounts
3. Review coverage annually as your needs change
4. Take advantage of age-appropriate discounts

${onRequestQuote ? '\n**Ready to get quotes?** Click the "Get Quotes" button above to request personalized quotes from top carriers!' : ""}

*Note: This is a simulated response. The full AI research capabilities will be available once the integration is properly configured.*`
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        {onRequestQuote && (
          <div className="border-b border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Ready for quotes?</p>
                <p className="text-xs text-muted-foreground">Get personalized quotes from top carriers</p>
              </div>
              <Button onClick={onRequestQuote} size="sm">
                Get Quotes
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full flex-shrink-0">
                    <span className="text-primary-foreground text-xs font-bold">AI</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div
                    className={`text-sm leading-relaxed ${
                      message.role === "assistant"
                        ? "prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:text-muted-foreground"
                        : "whitespace-pre-wrap"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/## (.*)/g, '<h2 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h2>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                            .replace(/- (.*)/g, '<li class="ml-4">$1</li>')
                            .replace(
                              /(\d+)\. \*\*(.*?)\*\*: (.*)/g,
                              '<div class="mb-2"><strong class="text-foreground">$1. $2:</strong> $3</div>',
                            )
                            .replace(/\n\n/g, '</p><p class="mb-2">')
                            .replace(/^/, '<p class="mb-2">')
                            .replace(/$/, "</p>"),
                        }}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {message.createdAt?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex items-center justify-center w-8 h-8 bg-secondary rounded-full flex-shrink-0">
                    <span className="text-secondary-foreground text-xs font-bold">U</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full flex-shrink-0">
                  <span className="text-primary-foreground text-xs font-bold">AI</span>
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
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

        {/* Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about insurance products, regulations, or carriers..."
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
  )
}
