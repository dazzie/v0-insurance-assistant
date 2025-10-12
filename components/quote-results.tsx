"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
import { InsuranceSummaryComparison } from "@/components/insurance-summary-comparison"
import { generateInsuranceComparisons } from "@/lib/insurance-comparison-generator"
import { carriers } from "@/lib/carrier-database"

interface QuoteResultsProps {
  quoteData: any
  onBack: () => void
  onNewQuote: () => void
}

export function QuoteResults({ quoteData, onBack, onNewQuote }: QuoteResultsProps) {
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary')
  const [comparisons, setComparisons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quoteSource, setQuoteSource] = useState<'mock' | 'api' | 'error'>('mock')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch real quotes from aggregator API on mount
  useEffect(() => {
    fetchRealQuotes()
  }, [quoteData])

  async function fetchRealQuotes() {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log('[QuoteResults] Fetching quotes from API...')
      
      const response = await fetch('/api/fetch-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insuranceType: quoteData.insuranceType,
          customerProfile: quoteData.customerProfile,
          coveragePreferences: {
            liability: '100/300/100',
            comprehensiveDeductible: 500,
            collisionDeductible: 500,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[QuoteResults] API response:', data)

      if (data.success && data.quotes && data.quotes.length > 0) {
        setComparisons(data.quotes)
        setQuoteSource(data.source === 'insurify' ? 'api' : 'mock')
      } else {
        throw new Error('No quotes returned from API')
      }

    } catch (error: any) {
      console.error('[QuoteResults] Error fetching quotes:', error)
      setErrorMessage(error.message)
      setQuoteSource('error')
      
      // Fallback to mock data
      const mockComparisons = generateInsuranceComparisons(
        quoteData.insuranceType,
        quoteData.customerProfile,
        4
      )
      setComparisons(mockComparisons)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactCarrier = (carrier: any) => {
    // In a real app, this would integrate with carrier APIs or redirect to their quote pages
    window.open(carrier.contactInfo.website, "_blank")
  }

  const handleGetQuote = (carrier: any) => {
    // In a real app, this would integrate with carrier APIs or redirect to their quote pages
    window.open(carrier.contactInfo.website, "_blank")
  }

  // Show loading state while fetching quotes
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <div>
              <h1 className="text-2xl font-bold">Fetching Live Quotes...</h1>
              <p className="text-blue-100 text-sm mt-1">Comparing rates from major carriers</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Prominent Quote Ready Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎉</span>
              <h1 className="text-3xl font-bold">Your Quotes Are Ready!</h1>
            </div>
            <p className="text-blue-100 text-lg">
              We found {comparisons.length} competitive quotes from top-rated carriers
              {quoteSource === 'api' && <span className="ml-2 text-sm">✓ Live Pricing</span>}
              {quoteSource === 'mock' && <span className="ml-2 text-sm">(Demo Mode)</span>}
            </p>
            <p className="text-blue-200 text-sm mt-1">Based on your profile and needs</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className="bg-white text-blue-600 text-lg px-4 py-2">
              Potential Savings: ${comparisons[0]?.savings || 200}+/year
            </Badge>
            {quoteSource === 'api' && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                🔗 Live API Data
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compare {quoteData.insuranceType} Insurance Options</h2>
          <p className="text-muted-foreground mt-1">Review detailed comparisons and choose the best coverage for you</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'summary' ? 'default' : 'outline'}
            onClick={() => setViewMode('summary')}
            size="sm"
          >
            Summary View
          </Button>
          <Button 
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            onClick={() => setViewMode('detailed')}
            size="sm"
          >
            Detailed View
          </Button>
          <Button variant="outline" onClick={onBack}>
            ← Back to Research
          </Button>
          <Button onClick={onNewQuote}>New Quote Request</Button>
        </div>
      </div>

      {/* Quote Request Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quote Request Summary</CardTitle>
          <CardDescription>Request ID: {quoteData.requestId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Insurance Type</p>
              <p className="text-sm text-muted-foreground">{quoteData.insuranceType}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Coverage Amount</p>
              <p className="text-sm text-muted-foreground">{quoteData.coverageAmount || "Standard"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Deductible</p>
              <p className="text-sm text-muted-foreground">${quoteData.deductible || "1,000"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">{quoteData.customerProfile.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Summary or Detailed View */}
      {viewMode === 'summary' ? (
        <InsuranceSummaryComparison
          comparisons={comparisons}
          insuranceType={quoteData.insuranceType}
          customerProfile={quoteData.customerProfile}
          onContactCarrier={handleContactCarrier}
          onGetQuote={handleGetQuote}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comparisons.map((quote, index) => (
            <Card
              key={quote.carrierName}
              className={`relative ${index === 0 ? "ring-2 ring-blue-500" : ""}`}
            >
              {index === 0 && <Badge className="absolute -top-2 left-4 bg-blue-500">Best Value</Badge>}
              {quote.savings && (
                <Badge className="absolute -top-2 right-4 bg-green-500">Save ${quote.savings}/year</Badge>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{quote.carrierName}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{quote.rating}</span>
                      <span className="text-yellow-500 ml-1">★</span>
                    </div>
                  </div>
                </div>
                <CardDescription>{quoteData.insuranceType} Coverage</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-green-600">${quote.monthlyPremium}/mo</div>
                  <div className="text-sm text-muted-foreground">${quote.annualPremium} annually</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Coverage Amount:</span>
                    <span className="font-medium">{quote.coverageAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Deductible:</span>
                    <span className="font-medium">{quote.deductible}</span>
                  </div>
                </div>

                <hr className="border-border" />

                <div>
                  <p className="text-sm font-medium mb-2">Included Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {quote.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1" onClick={() => handleGetQuote(quote)}>
                    Get This Quote
                  </Button>
                  <Button variant="outline" onClick={() => handleContactCarrier(quote)}>
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {comparisons.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              No quotes available for your location and insurance type at this time. Please try a different insurance
              type or contact our support team.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">📞</div>
              <h3 className="font-medium">Contact Carriers</h3>
              <p className="text-sm text-muted-foreground">Call or visit carrier websites to finalize your quotes</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium">Compare Coverage</h3>
              <p className="text-sm text-muted-foreground">Review policy details and coverage limits carefully</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-medium">Purchase Policy</h3>
              <p className="text-sm text-muted-foreground">Complete your application with your chosen carrier</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
