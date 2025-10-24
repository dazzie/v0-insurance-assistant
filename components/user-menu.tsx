'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Save, FileText, Settings } from 'lucide-react'

export function UserMenu() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // Get current profile from localStorage
      const profileData = localStorage.getItem('customerProfile')
      if (!profileData) {
        alert('No profile data to save')
        return
      }

      const profile = JSON.parse(profileData)

      // Save profile to server
      const profileResponse = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      // Also save any quotes in localStorage
      const quotesData = localStorage.getItem('savedQuotes')
      if (quotesData) {
        try {
          const quotes = JSON.parse(quotesData)
          await fetch('/api/user/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              quote: { 
                quotes: Array.isArray(quotes) ? quotes : [quotes], 
                savedAt: new Date().toISOString() 
              } 
            })
          })
        } catch (quoteError) {
          console.warn('Failed to save quotes:', quoteError)
        }
      }

      if (profileResponse.ok) {
        alert('Profile and data saved successfully!')
      } else {
        alert('Failed to save profile')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadProfile = async () => {
    try {
      // Load profile data
      const profileResponse = await fetch('/api/user/profile')
      const profileData = await profileResponse.json()

      // Load quotes data
      const quotesResponse = await fetch('/api/user/quotes')
      const quotesData = await quotesResponse.json()

      let loadedItems = []

      if (profileData.success && profileData.profile) {
        localStorage.setItem('customerProfile', JSON.stringify(profileData.profile))
        loadedItems.push('profile')
        console.log('[UserMenu] Profile loaded:', profileData.profile)
      }

      if (quotesData.success && quotesData.quotes && quotesData.quotes.length > 0) {
        // Store the most recent quotes
        const latestQuotes = quotesData.quotes[quotesData.quotes.length - 1]
        if (latestQuotes.quotes) {
          localStorage.setItem('savedQuotes', JSON.stringify(latestQuotes.quotes))
          loadedItems.push('quotes')
          console.log('[UserMenu] Quotes loaded:', latestQuotes.quotes.length, 'quotes')
        }
      }

      if (loadedItems.length > 0) {
        alert(`${loadedItems.join(' and ')} loaded successfully! Switching to Your Profile...`)
        // Navigate to chat view with restored data
        window.location.href = '/?view=profile&restore=true'
      } else {
        alert('No saved data found')
      }
    } catch (error) {
      console.error('Load error:', error)
      alert('Failed to load data')
    }
  }

  const handleViewQuotes = () => {
    router.push('/quotes')
  }

  const handleViewAdmin = () => {
    router.push('/agent-dashboard')
  }

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/login')}
        >
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{session.user?.name || session.user?.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSaveProfile} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLoadProfile}>
          <FileText className="mr-2 h-4 w-4" />
          Load Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewQuotes}>
          <FileText className="mr-2 h-4 w-4" />
          View Saved Quotes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewAdmin}>
          <Settings className="mr-2 h-4 w-4" />
          Agent Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

