"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface CustomerProfile {
  location: string
  age: string
  insuranceNeeds: string[]
}

interface QuoteRequestFormProps {
  customerProfile: CustomerProfile
  onQuoteRequest: (quoteData: any) => void
  onBack: () => void
}

export function QuoteRequestForm({ customerProfile, onQuoteRequest, onBack }: QuoteRequestFormProps) {
  const [formData, setFormData] = useState({
    insuranceType: "",
    coverageAmount: "",
    deductible: "",
    currentInsurance: "",
    claims: "",
    additionalInfo: "",
    contactPreference: "email",
    urgency: "standard",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate quote processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const quoteData = {
      ...formData,
      customerProfile,
      requestId: `QR-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    onQuoteRequest(quoteData)
    setIsSubmitting(false)
  }

  const insuranceTypes = [
    "Auto Insurance",
    "Home Insurance",
    "Life Insurance",
    "Health Insurance",
    "Disability Insurance",
    "Umbrella Insurance",
    "Renters Insurance",
    "Business Insurance",
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Request Insurance Quote</h1>
          <p className="text-muted-foreground mt-2">Get personalized quotes from top insurance carriers</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← Back to Research
        </Button>
      </div>

      {/* Customer Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <p className="text-sm text-muted-foreground">{customerProfile.location}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Age</Label>
              <p className="text-sm text-muted-foreground">{customerProfile.age}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Insurance Needs</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {customerProfile.insuranceNeeds.map((need, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Request Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
            <CardDescription>Provide specific information to get accurate quotes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceType">Insurance Type *</Label>
                <Select
                  value={formData.insuranceType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, insuranceType: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageAmount">Desired Coverage Amount</Label>
                <Input
                  id="coverageAmount"
                  placeholder="e.g., $500,000"
                  value={formData.coverageAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, coverageAmount: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deductible">Preferred Deductible</Label>
                <Select
                  value={formData.deductible}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, deductible: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deductible" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="250">$250</SelectItem>
                    <SelectItem value="500">$500</SelectItem>
                    <SelectItem value="1000">$1,000</SelectItem>
                    <SelectItem value="2500">$2,500</SelectItem>
                    <SelectItem value="5000">$5,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentInsurance">Current Insurance Provider</Label>
                <Input
                  id="currentInsurance"
                  placeholder="e.g., State Farm, GEICO, None"
                  value={formData.currentInsurance}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentInsurance: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="claims">Recent Claims History</Label>
              <Textarea
                id="claims"
                placeholder="Describe any claims in the past 5 years (optional)"
                value={formData.claims}
                onChange={(e) => setFormData((prev) => ({ ...prev, claims: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any specific requirements, questions, or details that might affect your quote"
                value={formData.additionalInfo}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPreference">Preferred Contact Method</Label>
                <Select
                  value={formData.contactPreference}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, contactPreference: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                    <SelectItem value="any">Any Method</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Quote Urgency</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (24 hours)</SelectItem>
                    <SelectItem value="standard">Standard (2-3 days)</SelectItem>
                    <SelectItem value="flexible">Flexible (1 week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !formData.insuranceType}>
            {isSubmitting ? "Processing..." : "Request Quotes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
