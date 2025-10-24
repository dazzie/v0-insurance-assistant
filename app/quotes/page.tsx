'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, DollarSign, Building, ExternalLink } from 'lucide-react'

interface SavedQuote {
  id: string
  quotes: any[]
  savedAt: string
  createdAt: string
}

export default function SavedQuotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quotes, setQuotes] = useState<SavedQuote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?callbackUrl=/quotes')
      return
    }

    loadQuotes()
  }, [session, status])

  const loadQuotes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/quotes')
      const data = await response.json()

      if (data.success) {
        setQuotes(data.quotes || [])
      } else {
        setError('Failed to load quotes')
      }
    } catch (err) {
      setError('Failed to load quotes')
      console.error('Error loading quotes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleContactCarrier = (carrierWebsite: string) => {
    window.open(carrierWebsite, '_blank')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your saved quotes...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Your Saved Quotes</h1>
              <p className="text-sm text-muted-foreground">
                View and manage your insurance quotes
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {quotes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Saved Quotes</CardTitle>
              <CardDescription>
                You haven't saved any quotes yet. Get started by requesting quotes on the main page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/')}>
                Get Your First Quote
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {quotes.length} Quote Session{quotes.length !== 1 ? 's' : ''}
              </h2>
              <Badge variant="outline">
                {quotes.reduce((total, session) => total + session.quotes.length, 0)} Total Quotes
              </Badge>
            </div>

            {quotes.map((quoteSession) => (
              <Card key={quoteSession.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {formatDate(quoteSession.savedAt || quoteSession.createdAt)}
                    </CardTitle>
                    <Badge variant="secondary">
                      {quoteSession.quotes.length} Quote{quoteSession.quotes.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quoteSession.quotes.map((quote, index) => (
                      <Card key={index} className="relative">
                        {index === 0 && (
                          <Badge className="absolute -top-2 left-4 bg-blue-500">
                            Best Value
                          </Badge>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{quote.carrierName}</CardTitle>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">{quote.rating}</span>
                              <span className="text-yellow-500">★</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-center py-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              ${quote.monthlyPremium}/mo
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${quote.annualPremium} annually
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Coverage:</span>
                              <span className="font-medium">{quote.coverageAmount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Deductible:</span>
                              <span className="font-medium">{quote.deductible}</span>
                            </div>
                          </div>

                          {quote.features && (
                            <div>
                              <p className="text-sm font-medium mb-2">Features:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {quote.features.slice(0, 3).map((feature: string, idx: number) => (
                                  <li key={idx} className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    {feature}
                                  </li>
                                ))}
                                {quote.features.length > 3 && (
                                  <li className="text-muted-foreground">
                                    +{quote.features.length - 3} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          <div className="pt-3 border-t">
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleContactCarrier(quote.contactInfo?.website || '#')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Contact {quote.carrierName}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
