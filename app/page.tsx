"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerProfileForm } from "@/components/customer-profile-form"
import { ChatInterface } from "@/components/chat-interface"

export interface CustomerProfile {
  location: string
  age: string
  needs: string[]
}

type ViewType = "profile" | "chat"

export default function InsuranceAssistant() {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>("profile")

  const handleProfileSubmit = (profile: CustomerProfile) => {
    setCustomerProfile(profile)
    setCurrentView("chat")
  }

  const handleEditProfile = () => {
    setCurrentView("profile")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <span className="text-primary-foreground font-bold text-lg">🎯</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Personal Insurance Coverage Coach</h1>
              <p className="text-sm text-muted-foreground">Your dedicated guide to optimal insurance protection</p>
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
                  <CardTitle className="text-lg">Your Coverage Profile</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleEditProfile}>
                    Update Profile
                  </Button>
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
                    <span className="text-muted-foreground">Coverage Goals:</span>
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
            <ChatInterface customerProfile={customerProfile!} />
          </div>
        )}
      </main>
    </div>
  )
}
