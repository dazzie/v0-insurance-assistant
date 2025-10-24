'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck, Save, X } from 'lucide-react'
import type { CustomerProfile } from '@/lib/customer-profile'

interface PostQuoteSignupProps {
  customerProfile: CustomerProfile
  quotes: any[]
  onSave?: () => void
  onSkip?: () => void
}

export function PostQuoteSignup({ customerProfile, quotes, onSave, onSkip }: PostQuoteSignupProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: customerProfile.email || '',
    password: '',
    confirmPassword: '',
    name: customerProfile.name || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        setIsLoading(false)
        return
      }

      // Create account
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      })

      const signupData = await signupResponse.json()

      if (!signupResponse.ok) {
        setError(signupData.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Auto-login after signup
      const loginResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (loginResult?.error) {
        setError('Account created but login failed. Please try signing in manually.')
        setIsLoading(false)
        return
      }

      // Save profile data
      const profileResponse = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile: {
            ...customerProfile,
            email: formData.email,
            name: formData.name
          }
        })
      })

      if (!profileResponse.ok) {
        console.warn('Failed to save profile, but account was created')
      }

      // Save quotes if any
      if (quotes && quotes.length > 0) {
        const quotesResponse = await fetch('/api/user/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quote: { quotes, savedAt: new Date().toISOString() } })
        })

        if (!quotesResponse.ok) {
          console.warn('Failed to save quotes, but account was created')
        }
      }

      setSuccess(true)
      
      // Call success callback
      if (onSave) {
        onSave()
      }

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.refresh()
      }, 2000)

    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-green-900">Account Created!</CardTitle>
          <CardDescription>
            Your profile and quotes have been saved. You're now signed in!
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Save className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Save Your Results</CardTitle>
              <CardDescription className="text-sm">
                Create an account to save your profile and quotes
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              We'll use this to send you your saved quotes and profile
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Create Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 6 characters
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account & Save Data
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:underline"
              disabled={isLoading}
            >
              Skip for now
            </button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            By creating an account, you can access your saved quotes and profile from any device
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
