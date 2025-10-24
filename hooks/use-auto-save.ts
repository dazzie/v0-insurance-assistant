'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

export function useAutoSave() {
  const { data: session } = useSession()
  const lastSaveRef = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  const saveProfileData = async () => {
    if (!session?.user?.id) return

    try {
      const profileData = localStorage.getItem('customerProfile')
      if (!profileData) return

      const profile = JSON.parse(profileData)
      const profileString = JSON.stringify(profile)

      // Only save if data has changed
      if (profileString === lastSaveRef.current) return

      console.log('[AutoSave] Saving profile data...')
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      if (response.ok) {
        lastSaveRef.current = profileString
        console.log('[AutoSave] ✅ Profile saved successfully')
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('profileAutoSaved', { 
          detail: { timestamp: new Date().toISOString() } 
        }))
      } else {
        console.warn('[AutoSave] ⚠️ Failed to save profile')
      }
    } catch (error) {
      console.error('[AutoSave] ❌ Error saving profile:', error)
    }
  }

  const saveQuotesData = async () => {
    if (!session?.user?.id) return

    try {
      const quotesData = localStorage.getItem('savedQuotes')
      if (!quotesData) return

      const quotes = JSON.parse(quotesData)
      console.log('[AutoSave] Saving quotes data...')

      const response = await fetch('/api/user/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quote: { 
            quotes: Array.isArray(quotes) ? quotes : [quotes], 
            savedAt: new Date().toISOString() 
          } 
        })
      })

      if (response.ok) {
        console.log('[AutoSave] ✅ Quotes saved successfully')
      } else {
        console.warn('[AutoSave] ⚠️ Failed to save quotes')
      }
    } catch (error) {
      console.error('[AutoSave] ❌ Error saving quotes:', error)
    }
  }

  const debouncedSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveProfileData()
      saveQuotesData()
    }, 2000) // Save 2 seconds after last change
  }

  useEffect(() => {
    if (!session?.user?.id) return

    // Set up storage event listener for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customerProfile' || e.key === 'savedQuotes') {
        console.log('[AutoSave] 📝 Data changed, scheduling save...')
        debouncedSave()
      }
    }

    // Set up custom event listener for manual triggers
    const handleManualSave = () => {
      console.log('[AutoSave] 🔄 Manual save triggered...')
      debouncedSave()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('triggerAutoSave', handleManualSave)

    // Initial save check
    debouncedSave()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('triggerAutoSave', handleManualSave)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [session?.user?.id])

  return {
    saveNow: () => {
      saveProfileData()
      saveQuotesData()
    },
    triggerSave: debouncedSave
  }
}
