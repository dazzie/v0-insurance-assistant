'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useAutoRestore() {
  const { data: session, status } = useSession()
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoredData, setRestoredData] = useState<{
    profile: boolean
    quotes: boolean
  }>({ profile: false, quotes: false })

  const restoreUserData = async () => {
    if (!session?.user?.id || status === 'loading') return

    setIsRestoring(true)
    console.log('[AutoRestore] 🔄 Restoring user data...')

    try {
      // Load profile data
      const profileResponse = await fetch('/api/user/profile')
      const profileData = await profileResponse.json()

      // Load quotes data
      const quotesResponse = await fetch('/api/user/quotes')
      const quotesData = await quotesResponse.json()

      let restored = { profile: false, quotes: false }

      // Restore profile if available and not already in localStorage
      if (profileData.success && profileData.profile) {
        const existingProfile = localStorage.getItem('customerProfile')
        
        if (!existingProfile || existingProfile === '{}' || JSON.stringify(JSON.parse(existingProfile)) !== JSON.stringify(profileData.profile)) {
          localStorage.setItem('customerProfile', JSON.stringify(profileData.profile))
          restored.profile = true
          console.log('[AutoRestore] ✅ Profile restored:', {
            name: profileData.profile.name,
            email: profileData.profile.email,
            vehicles: profileData.profile.vehicles?.length || 0,
            hasRiskAssessment: !!profileData.profile.riskAssessment,
            hasAddressEnrichment: !!profileData.profile.addressEnrichment
          })

          // Trigger profile update event
          window.dispatchEvent(new CustomEvent('profileRestored', { 
            detail: profileData.profile 
          }))
        }
      }

      // Restore quotes if available
      if (quotesData.success && quotesData.quotes && quotesData.quotes.length > 0) {
        const latestQuotes = quotesData.quotes[quotesData.quotes.length - 1]
        if (latestQuotes.quotes) {
          localStorage.setItem('savedQuotes', JSON.stringify(latestQuotes.quotes))
          restored.quotes = true
          console.log('[AutoRestore] ✅ Quotes restored:', latestQuotes.quotes.length, 'quotes')

          // Also store in a format the chat interface can use
          const quotesForChat = {
            insuranceType: profileData.profile?.coverageType || profileData.profile?.needs?.[0] || 'auto',
            customerProfile: profileData.profile,
            quotes: latestQuotes.quotes,
            restoredAt: new Date().toISOString(),
            isRestored: true // Flag to indicate this is restored data
          }
          localStorage.setItem('restoredQuoteData', JSON.stringify(quotesForChat))
          
          // Also store a flag to trigger immediate quote display
          localStorage.setItem('shouldShowRestoredQuotes', 'true')

          // Trigger quotes update event
          window.dispatchEvent(new CustomEvent('quotesRestored', { 
            detail: latestQuotes.quotes 
          }))
        }
      }

      setRestoredData(restored)

      if (restored.profile || restored.quotes) {
        const restoredItems = []
        if (restored.profile) restoredItems.push('profile')
        if (restored.quotes) restoredItems.push('quotes')
        
        console.log(`[AutoRestore] 🎉 Successfully restored: ${restoredItems.join(' and ')}`)
        
        // Dispatch overall restoration complete event
        window.dispatchEvent(new CustomEvent('dataRestored', { 
          detail: { profile: restored.profile, quotes: restored.quotes }
        }))
        
        // Additional event to force UI refresh after restoration
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('restorationComplete', { 
            detail: { profile: restored.profile, quotes: restored.quotes }
          }))
        }, 500)
      }

    } catch (error) {
      console.error('[AutoRestore] ❌ Error restoring data:', error)
    } finally {
      setIsRestoring(false)
    }
  }

  useEffect(() => {
    // Only restore when user first logs in
    if (session?.user?.id && status === 'authenticated') {
      // Small delay to ensure session is fully established
      const timer = setTimeout(restoreUserData, 500)
      return () => clearTimeout(timer)
    }
  }, [session?.user?.id, status])

  return {
    isRestoring,
    restoredData,
    restoreNow: restoreUserData
  }
}
