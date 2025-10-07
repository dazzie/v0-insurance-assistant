"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, ExternalLink, Phone, Globe } from "lucide-react"

interface CarrierComparison {
  carrierName: string
  rating: number
  monthlyPremium: number
  annualPremium: number
  coverageAmount: string
  deductible: string
  features: string[]
  strengths: string[]
  nextSteps: {
    discountInquiries: string[]
    coverageDiscussion: string[]
    claimsProcess: string[]
    policyFlexibility: string[]
    actionItems: string[]
  }
  contactInfo: {
    phone: string
    website: string
    email?: string
  }
  savings?: number
  bestFor: string[]
}

interface InsuranceSummaryComparisonProps {
  comparisons: CarrierComparison[]
  insuranceType: string
  customerProfile: {
    location: string
    age: number
    needs: string[]
  }
  onContactCarrier?: (carrier: CarrierComparison) => void
  onGetQuote?: (carrier: CarrierComparison) => void
}

export function InsuranceSummaryComparison({
  comparisons,
  insuranceType,
  customerProfile,
  onContactCarrier,
  onGetQuote
}: InsuranceSummaryComparisonProps) {
  const [expandedCarriers, setExpandedCarriers] = useState<Set<string>>(new Set())
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null)

  const toggleCarrierExpansion = (carrierName: string) => {
    const newExpanded = new Set(expandedCarriers)
    if (newExpanded.has(carrierName)) {
      newExpanded.delete(carrierName)
    } else {
      newExpanded.add(carrierName)
    }
    setExpandedCarriers(newExpanded)
  }

  const handleContactCarrier = (carrier: CarrierComparison) => {
    if (onContactCarrier) {
      onContactCarrier(carrier)
    } else {
      window.open(carrier.contactInfo.website, "_blank")
    }
  }

  const handleGetQuote = (carrier: CarrierComparison) => {
    if (onGetQuote) {
      onGetQuote(carrier)
    } else {
      window.open(carrier.contactInfo.website, "_blank")
    }
  }

  const getBestValueCarrier = () => {
    if (comparisons.length === 0) return null
    return comparisons.reduce((best, current) =>
      current.monthlyPremium < best.monthlyPremium ? current : best
    )
  }

  const getHighestRatedCarrier = () => {
    if (comparisons.length === 0) return null
    return comparisons.reduce((best, current) =>
      current.rating > best.rating ? current : best
    )
  }

  const bestValue = getBestValueCarrier()
  const highestRated = getHighestRatedCarrier()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          {insuranceType} Insurance Comparison
        </h1>
        <p className="text-lg text-muted-foreground">
          Side-by-side comparison of top carriers for your {insuranceType.toLowerCase()} needs
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span>📍 {customerProfile.location}</span>
          <span>👤 Age {customerProfile.age}</span>
          <span>🎯 {customerProfile.needs.join(", ")}</span>
        </div>
      </div>

      {/* Quick Stats */}
      {comparisons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bestValue && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">${bestValue.monthlyPremium}/mo</div>
                <div className="text-sm text-muted-foreground">Best Value: {bestValue.carrierName}</div>
              </CardContent>
            </Card>
          )}
          {highestRated && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{highestRated.rating}★</div>
                <div className="text-sm text-muted-foreground">Highest Rated: {highestRated.carrierName}</div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{comparisons.length}</div>
              <div className="text-sm text-muted-foreground">Carriers Compared</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Carrier Comparison Overview</CardTitle>
          <CardDescription>Quick comparison of key metrics across all carriers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Carrier</th>
                  <th className="text-left p-3 font-semibold">Monthly Premium</th>
                  <th className="text-left p-3 font-semibold">Rating</th>
                  <th className="text-left p-3 font-semibold">Best For</th>
                  <th className="text-left p-3 font-semibold">Savings</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((carrier, index) => (
                  <tr key={carrier.carrierName} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{carrier.carrierName}</span>
                        {index === 0 && <Badge variant="secondary">Best Value</Badge>}
                        {carrier.rating >= 4.5 && <Badge variant="outline">Top Rated</Badge>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-green-600">${carrier.monthlyPremium}/mo</div>
                      <div className="text-sm text-muted-foreground">${carrier.annualPremium}/year</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{carrier.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-muted-foreground">
                        {carrier.bestFor.slice(0, 2).join(", ")}
                      </div>
                    </td>
                    <td className="p-3">
                      {carrier.savings ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Save ${carrier.savings}/year
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleGetQuote(carrier)}
                          className="text-xs"
                        >
                          Get Quote
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleCarrierExpansion(carrier.carrierName)}
                          className="text-xs"
                        >
                          {expandedCarriers.has(carrier.carrierName) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Carrier Information */}
      {comparisons.map((carrier) => (
        <Card key={carrier.carrierName} className={selectedCarrier === carrier.carrierName ? "ring-2 ring-blue-500" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-xl">{carrier.carrierName}</CardTitle>
                  <CardDescription>{insuranceType} Coverage</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="font-medium">{carrier.rating}</span>
                    <span className="text-yellow-500 ml-1">★</span>
                  </div>
                  {carrier.savings && (
                    <Badge className="bg-green-100 text-green-800">
                      Save ${carrier.savings}/year
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCarrierExpansion(carrier.carrierName)}
              >
                {expandedCarriers.has(carrier.carrierName) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Pricing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">${carrier.monthlyPremium}/mo</div>
                <div className="text-sm text-muted-foreground">Monthly Premium</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-semibold">{carrier.coverageAmount}</div>
                <div className="text-sm text-muted-foreground">Coverage Amount</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-semibold">${carrier.deductible}</div>
                <div className="text-sm text-muted-foreground">Deductible</div>
              </div>
            </div>

            {/* Key Features */}
            <div>
              <h4 className="font-semibold mb-2">Key Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {carrier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-semibold mb-2">Why Choose {carrier.carrierName}</h4>
              <div className="flex flex-wrap gap-2">
                {carrier.strengths.map((strength, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Next Steps - Detailed */}
            {expandedCarriers.has(carrier.carrierName) && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-lg">Next Steps with {carrier.carrierName}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-2 text-blue-600">Discount Inquiries</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {carrier.nextSteps.discountInquiries.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2 text-green-600">Coverage Discussion</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {carrier.nextSteps.coverageDiscussion.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2 text-orange-600">Claims Process</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {carrier.nextSteps.claimsProcess.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2 text-purple-600">Policy Flexibility</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {carrier.nextSteps.policyFlexibility.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <h5 className="font-medium mb-2 text-red-600">Action Items</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {carrier.nextSteps.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => handleContactCarrier(carrier)}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact {carrier.carrierName}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleGetQuote(carrier)}
                className="flex-1"
              >
                <Globe className="h-4 w-4 mr-2" />
                Get Quote Online
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Final Considerations */}
      <Card>
        <CardHeader>
          <CardTitle>Final Considerations</CardTitle>
          <CardDescription>Key factors to consider when making your decision</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-600">Customer Service vs. Price</h4>
              <p className="text-sm text-muted-foreground">
                Weigh the importance of personalized service against competitive pricing. 
                Consider your comfort level with online vs. in-person interactions.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-green-600">Technology Integration</h4>
              <p className="text-sm text-muted-foreground">
                Consider each carrier's digital tools for policy management, claims processing, 
                and customer service that align with your preferences.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 text-purple-600">Review and Decide</h4>
              <p className="text-sm text-muted-foreground">
                Review all options based on coverage, cost, customer service, and ease of claims 
                to make an informed decision for your {insuranceType.toLowerCase()} insurance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


