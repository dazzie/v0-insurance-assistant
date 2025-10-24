"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerProfileForm } from "@/components/customer-profile-form"
import { ChatInterface } from "@/components/chat-interface"
import { CustomerProfileCard } from "@/components/customer-profile-card"
import { ProfileSummaryCard } from "@/components/profile-summary-card"
import { UserMenu } from "@/components/user-menu"
import { DataSyncIndicator } from "@/components/data-sync-indicator"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useAutoRestore } from "@/hooks/use-auto-restore"
import { profileManager, calculateProfileCompleteness } from "@/lib/customer-profile"
import type { CustomerProfile } from "@/lib/customer-profile"

type ViewType = "profile" | "chat"

export default function InsuranceAssistant() {
  const searchParams = useSearchParams()
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>("profile")
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichmentProgress, setEnrichmentProgress] = useState<string[]>([])
  
  // Initialize auto-save and auto-restore hooks
  const { triggerSave } = useAutoSave()
  const { isRestoring, restoredData } = useAutoRestore()

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

  // Listen for profile updates from the API and data restoration
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      setCustomerProfile(event.detail)
    }

    const handleProfileRestore = (event: CustomEvent) => {
      console.log('[Main] 🔄 Profile restored from server:', event.detail)
      setCustomerProfile(event.detail)
    }

    const handleDataRestore = (event: CustomEvent) => {
      console.log('[Main] 🎉 Data restoration complete:', event.detail)
      // Reload the profile from localStorage after restoration
      const loaded = profileManager.loadProfile()
      if (loaded) {
        setCustomerProfile(loaded)
        
        // If user came from login with restore=true, switch to chat view to show their data
        const shouldRestore = searchParams.get('restore') === 'true'
        const viewParam = searchParams.get('view')
        
        // Auto-switch to chat view for users with data or restoration request
        if (shouldRestore || (loaded.vehicles && loaded.vehicles.length > 0) || loaded.riskAssessment || loaded.policyAnalysis) {
          console.log('[Main] 🔄 Auto-switching to chat view with restored data')
          console.log('[Main] 📊 Restored data summary:', {
            hasVehicles: loaded.vehicles?.length || 0,
            hasRiskAssessment: !!loaded.riskAssessment,
            hasPolicyAnalysis: !!loaded.policyAnalysis,
            hasAddressEnrichment: !!loaded.addressEnrichment
          })
          
          setCurrentView("chat")
          
          // Set a flag to ensure quotes are displayed if they exist
          const hasQuotes = localStorage.getItem('savedQuotes')
          if (hasQuotes && shouldRestore) {
            localStorage.setItem('shouldShowRestoredQuotes', 'true')
            console.log('[Main] 📊 Flagged quotes for immediate display')
          }
          
          // Clear URL parameters after handling them
          if (shouldRestore) {
            window.history.replaceState({}, '', '/')
          }
        } else if (viewParam === 'profile' || shouldRestore) {
          // Force switch to chat view if restore was requested, even without data
          console.log('[Main] 🔄 Forcing switch to chat view due to restore request')
          setCurrentView("chat")
          
          if (shouldRestore) {
            window.history.replaceState({}, '', '/')
          }
        }
      }
    }

    const handleRestorationComplete = (event: CustomEvent) => {
      console.log('[Main] 🎯 Final restoration complete, ensuring chat view:', event.detail)
      const loaded = profileManager.loadProfile()
      if (loaded) {
        setCustomerProfile(loaded)
        
        // Ensure we're in chat view after complete restoration
        const shouldRestore = searchParams.get('restore') === 'true'
        if (shouldRestore) {
          setCurrentView("chat")
          console.log('[Main] ✅ Switched to Your Profile page after restoration')
        }
      }
    }

    window.addEventListener('profileUpdated' as any, handleProfileUpdate)
    window.addEventListener('profileRestored' as any, handleProfileRestore)
    window.addEventListener('dataRestored' as any, handleDataRestore)
    window.addEventListener('restorationComplete' as any, handleRestorationComplete)
    
    return () => {
      window.removeEventListener('profileUpdated' as any, handleProfileUpdate)
      window.removeEventListener('profileRestored' as any, handleProfileRestore)
      window.removeEventListener('dataRestored' as any, handleDataRestore)
      window.removeEventListener('restorationComplete' as any, handleRestorationComplete)
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

    // Trigger auto-save to server if user is authenticated
    triggerSave()

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
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <span className="text-primary-foreground font-bold text-lg">🎯</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Personal Insurance Coverage Coach</h1>
                <p className="text-sm text-muted-foreground">Your dedicated guide to optimal insurance protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DataSyncIndicator />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {currentView === "profile" && (
          <CustomerProfileForm 
            onSubmit={handleProfileSubmit}
            onEnrichmentStart={() => setIsEnriching(true)}
            onEnrichmentProgress={setEnrichmentProgress}
        onEnrichmentComplete={(enrichedData) => {
          console.log('[Main] 🔄 Enrichment completed, updating profile...', enrichedData)
          console.log('[Main] 🔍 Enriched data structure:', {
            hasVehicles: !!enrichedData.vehicles,
            hasRiskAssessment: !!enrichedData.riskAssessment,
            hasAddressEnrichment: !!enrichedData.addressEnrichment,
            riskAssessmentKeys: enrichedData.riskAssessment ? Object.keys(enrichedData.riskAssessment) : 'none'
          })
          setIsEnriching(false)
          
          // Update the customer profile with enriched data
          if (customerProfile && enrichedData) {
            console.log('[Main] 🔄 Updating profile with enriched data:', enrichedData)
            const updatedProfile = { ...customerProfile }
            
            // Update vehicles with enriched data
            if (enrichedData.vehicles) {
              updatedProfile.vehicles = enrichedData.vehicles
              console.log('[Main] 🚗 Updated vehicles:', enrichedData.vehicles)
            }
            
            // Update risk assessment (merge with existing)
            if (enrichedData.riskAssessment) {
              updatedProfile.riskAssessment = {
                ...updatedProfile.riskAssessment,
                ...enrichedData.riskAssessment
              }
              console.log('[Main] 🛡️ Updated risk assessment:', updatedProfile.riskAssessment)
            } else {
              console.log('[Main] ⚠️ No risk assessment data in enriched data')
            }
            
            // Update address enrichment
            if (enrichedData.addressEnrichment) {
              updatedProfile.addressEnrichment = enrichedData.addressEnrichment
              console.log('[Main] 🏠 Updated address enrichment:', enrichedData.addressEnrichment)
            }
            
            // Recalculate profile completion after all data is updated
            const completionPercentage = calculateProfileCompleteness(updatedProfile)
            updatedProfile.profileComplete = completionPercentage >= 70
            console.log('[Main] 📊 Profile completion recalculated:', completionPercentage + '%')
            
            // Save updated profile and trigger re-render
            profileManager.saveProfile(updatedProfile)
            setCustomerProfile(updatedProfile)
            console.log('[Main] ✅ Profile updated with enriched data:', updatedProfile)
            
            // Trigger auto-save to server if user is authenticated
            triggerSave()
            
            // Force multiple state updates to ensure chat interface gets the data
            setTimeout(() => {
              console.log('[Main] 🔄 Forcing profile re-render...')
              setCustomerProfile({...updatedProfile})
            }, 50)
            
            setTimeout(() => {
              console.log('[Main] 🔄 Second profile state update...')
              setCustomerProfile({...updatedProfile})
            }, 100)
            
            setTimeout(() => {
              console.log('[Main] 🔄 Final profile state update...')
              const finalProfile = profileManager.loadProfile()
              if (finalProfile) {
                setCustomerProfile(finalProfile)
                console.log('[Main] ✅ Final profile loaded from localStorage:', finalProfile)
              }
            }, 200)
            
            // Additional forced update to ensure chat interface gets enriched data
            setTimeout(() => {
              console.log('[Main] 🔄 Final forced update...')
              setCustomerProfile(prev => ({...prev, ...updatedProfile}))
            }, 300)
          }
        }}
          />
        )}

        {currentView === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Customer Profile Card & Your Profile - Left side on desktop */}
            <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
              <CustomerProfileCard />
              <ProfileSummaryCard 
                key={`${customerProfile?.vehicles?.length || 0}-${Object.keys(customerProfile?.riskAssessment || {}).length}`} // Force re-render when data changes
                profile={customerProfile!} 
                isEnriching={isEnriching}
                enrichmentProgress={enrichmentProgress}
              />
            </div>

            {/* Chat Interface - Right side on desktop */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <ChatInterface 
                key={`${customerProfile?.vehicles?.length || 0}-${Object.keys(customerProfile?.riskAssessment || {}).length}`}
                customerProfile={customerProfile!} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
