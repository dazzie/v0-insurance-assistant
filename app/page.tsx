"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerProfileForm } from "@/components/customer-profile-form"
import { ChatInterface } from "@/components/chat-interface"
import { QuoteRequestForm } from "@/components/quote-request-form"
import { QuoteResults } from "@/components/quote-results"

export interface CustomerProfile {
  location: string
  age: string
  needs: string[]
}

type ViewType = "profile" | "chat" | "quote-request" | "quote-results"

export default function InsuranceAssistant() {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>("profile")
  const [quoteData, setQuoteData] = useState<any>(null)

  const handleProfileSubmit = (profile: CustomerProfile) => {
    setCustomerProfile(profile)
    setCurrentView("chat")
  }

  const handleEditProfile = () => {
    setCurrentView("profile")
  }

  const handleRequestQuote = () => {
    setCurrentView("quote-request")
  }

  const handleQuoteRequest = (data: any) => {
    setQuoteData(data)
    setCurrentView("quote-results")
  }

  const handleBackToChat = () => {
    setCurrentView("chat")
  }

  const handleNewQuote = () => {
    setCurrentView("quote-request")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <span className="text-primary-foreground font-bold text-lg">🛡️</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Insurance Research Assistant</h1>
              <p className="text-sm text-muted-foreground">Your trusted partner in insurance research</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === "profile" && <CustomerProfileForm onSubmit={handleProfileSubmit} />}

        {currentView === "chat" && (
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Customer Profile</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleRequestQuote}>Request Quote</Button>
                    <Button variant="outline" size="sm" onClick={handleEditProfile}>
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Location:</span>
                    <Badge variant="secondary">{customerProfile?.location}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Age:</span>
                    <Badge variant="secondary">{customerProfile?.age}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Needs:</span>
                    <div className="flex gap-1">
                      {customerProfile?.needs.map((need) => (
                        <Badge key={need} variant="outline">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <ChatInterface customerProfile={customerProfile!} onRequestQuote={handleRequestQuote} />
          </div>
        )}

        {currentView === "quote-request" && customerProfile && (
          <QuoteRequestForm
            customerProfile={{
              location: customerProfile.location,
              age: customerProfile.age,
              insuranceNeeds: customerProfile.needs,
            }}
            onQuoteRequest={handleQuoteRequest}
            onBack={handleBackToChat}
          />
        )}

        {currentView === "quote-results" && quoteData && (
          <QuoteResults quoteData={quoteData} onBack={handleBackToChat} onNewQuote={handleNewQuote} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2024 Insurance Research Assistant. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
