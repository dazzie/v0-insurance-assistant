"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerProfileForm } from "@/components/customer-profile-form"
import { ChatInterface } from "@/components/chat-interface"
import { CustomerProfileCard } from "@/components/customer-profile-card"
import { ProfileSummaryCard } from "@/components/profile-summary-card"
import { profileManager } from "@/lib/customer-profile"
import type { CustomerProfile } from "@/lib/customer-profile"

type ViewType = "profile" | "chat"

export default function InsuranceAssistant() {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>("profile")

  // Load profile from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loaded = profileManager.loadProfile()
    if (loaded) {
      setCustomerProfile(loaded)
      // Don't auto-switch to chat - let user stay on profile form
      // setCurrentView("chat")
    }
  }, [])

  // Listen for profile updates from the API
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      setCustomerProfile(event.detail)
    }

    window.addEventListener('profileUpdated' as any, handleProfileUpdate)
    return () => {
      window.removeEventListener('profileUpdated' as any, handleProfileUpdate)
    }
  }, [])

  const handleProfileSubmit = (profile: CustomerProfile) => {
    console.log('[Page] Profile submitted from form:', profile)
    console.log('[Page] Vehicle count:', profile.vehiclesCount)
    console.log('[Page] Vehicles array:', profile.vehicles)
    console.log('[Page] Drivers count:', profile.driversCount)
    console.log('[Page] Drivers array:', profile.drivers)
    
    // 🔒 CRITICAL: Check for enriched data before saving
    console.log('[Page] Checking for enrichments...')
    console.log('[Page] - Vehicles enriched?', profile.vehicles?.some(v => v.enriched))
    console.log('[Page] - Address enriched?', profile.addressEnrichment?.enriched)
    console.log('[Page] - Email enriched?', profile.emailEnrichment?.verified)

    // Save profile to localStorage IMMEDIATELY to preserve all enrichments
    profileManager.saveProfile(profile)
    console.log('[Page] ✅ Profile saved to localStorage with all enrichments')

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

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {currentView === "profile" && <CustomerProfileForm onSubmit={handleProfileSubmit} />}

        {currentView === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Customer Profile Card & Your Profile - Left side on desktop */}
            <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
              <CustomerProfileCard />
              <ProfileSummaryCard profile={customerProfile!} />
            </div>

            {/* Chat Interface - Right side on desktop */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <ChatInterface customerProfile={customerProfile!} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
