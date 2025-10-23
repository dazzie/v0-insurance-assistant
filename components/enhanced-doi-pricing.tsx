'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Calculator, DollarSign, TrendingUp, Info } from 'lucide-react'

interface EnhancedPricingProps {
  customerProfile: any
  doiBaseRate?: number
}

export function EnhancedDOIPricing({ customerProfile, doiBaseRate }: EnhancedPricingProps) {
  const [enhancedPricing, setEnhancedPricing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(['rental', 'roadside'])
  const [error, setError] = useState<string | null>(null)

  const addOnOptions = [
    { id: 'rental', name: 'Rental Reimbursement', description: 'Covers rental car while vehicle is being repaired' },
    { id: 'roadside', name: 'Roadside Assistance', description: '24/7 towing, jump starts, lockout service' },
    { id: 'gap', name: 'Gap Insurance', description: 'Covers difference between loan balance and ACV' },
    { id: 'newCarReplacement', name: 'New Car Replacement', description: 'Replaces with new vehicle if totaled within 2 years' },
    { id: 'accidentForgiveness', name: 'Accident Forgiveness', description: 'First accident won\'t increase your rates' }
  ]

  const calculateEnhancedPricing = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/enhanced-doi-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerProfile,
          doiBaseRate,
          addOns: selectedAddOns
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate enhanced pricing')
      }

      setEnhancedPricing(data.enhancedPricing)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (customerProfile) {
      calculateEnhancedPricing()
    }
  }, [customerProfile, selectedAddOns])

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    )
  }

  if (!customerProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Customer profile required for enhanced pricing</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add-Ons Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Coverage Add-Ons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {addOnOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedAddOns.includes(option.id)}
                  onCheckedChange={() => toggleAddOn(option.id)}
                />
                <div className="flex-1">
                  <label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                    {option.name}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Pricing Results */}
      {loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Calculating enhanced pricing...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600 text-sm">
              <Info className="w-4 h-4 inline mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {enhancedPricing && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Enhanced DOI Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    ${enhancedPricing.totalMonthlyPremium.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Monthly Premium</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${enhancedPricing.totalAnnualPremium.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Annual Premium</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    +{((enhancedPricing.totalAnnualPremium - enhancedPricing.basePremium) / enhancedPricing.basePremium * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Above Base Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    ${enhancedPricing.basePremium.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">DOI Base Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Detailed Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Base Premium */}
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">DOI Base Premium</span>
                  <span className="font-mono">${enhancedPricing.basePremium.toFixed(0)}</span>
                </div>

                {/* Additional Charges */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Additional Charges</h4>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Policy Fees</span>
                    <span className="font-mono text-sm">${enhancedPricing.breakdown.policyFee}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">State Tax</span>
                    <span className="font-mono text-sm">${enhancedPricing.breakdown.stateTax.toFixed(0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Local Tax</span>
                    <span className="font-mono text-sm">${enhancedPricing.breakdown.localTax.toFixed(0)}</span>
                  </div>

                  {enhancedPricing.breakdown.rentalReimbursement > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Rental Reimbursement</span>
                      <span className="font-mono text-sm">${enhancedPricing.breakdown.rentalReimbursement}</span>
                    </div>
                  )}

                  {enhancedPricing.breakdown.roadsideAssistance > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Roadside Assistance</span>
                      <span className="font-mono text-sm">${enhancedPricing.breakdown.roadsideAssistance}</span>
                    </div>
                  )}

                  {enhancedPricing.breakdown.gapInsurance > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Gap Insurance</span>
                      <span className="font-mono text-sm">${enhancedPricing.breakdown.gapInsurance}</span>
                    </div>
                  )}

                  {enhancedPricing.breakdown.newCarReplacement > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">New Car Replacement</span>
                      <span className="font-mono text-sm">${enhancedPricing.breakdown.newCarReplacement}</span>
                    </div>
                  )}

                  {enhancedPricing.breakdown.accidentForgiveness > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Accident Forgiveness</span>
                      <span className="font-mono text-sm">${enhancedPricing.breakdown.accidentForgiveness}</span>
                    </div>
                  )}

                  {enhancedPricing.breakdown.highRiskSurcharge > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">High Risk Surcharge</span>
                      <span className="font-mono text-sm text-red-600">${enhancedPricing.breakdown.highRiskSurcharge.toFixed(0)}</span>
                    </div>
                  )}

                  {enhancedPricing.breakdown.luxuryVehicleSurcharge > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Luxury Vehicle Surcharge</span>
                      <span className="font-mono text-sm text-red-600">${enhancedPricing.breakdown.luxuryVehicleSurcharge.toFixed(0)}</span>
                    </div>
                  )}

                  {enhancedPricing.breakdown.installmentFee > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Installment Fee</span>
                      <span className="font-mono text-sm">${enhancedPricing.breakdown.installmentFee}</span>
                    </div>
                  )}

                  {enhancedPricing.breakdown.creditCardFee > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Credit Card Fee</span>
                      <span className="font-mono text-sm">${enhancedPricing.breakdown.creditCardFee.toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {/* Savings */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Available Discounts</h4>
                  
                  {enhancedPricing.savings.annualPaymentDiscount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Annual Payment Discount</span>
                      <span className="font-mono text-sm text-green-600">-${enhancedPricing.savings.annualPaymentDiscount.toFixed(0)}</span>
                    </div>
                  )}

                  {enhancedPricing.savings.safeDriverDiscount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Safe Driver Discount</span>
                      <span className="font-mono text-sm text-green-600">-${enhancedPricing.savings.safeDriverDiscount.toFixed(0)}</span>
                    </div>
                  )}

                  {enhancedPricing.savings.goodStudentDiscount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Good Student Discount</span>
                      <span className="font-mono text-sm text-green-600">-${enhancedPricing.savings.goodStudentDiscount.toFixed(0)}</span>
                    </div>
                  )}

                  {enhancedPricing.savings.antiTheftDiscount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm">Anti-Theft Discount</span>
                      <span className="font-mono text-sm text-green-600">-${enhancedPricing.savings.antiTheftDiscount.toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-3 border-t-2 border-primary">
                  <span className="font-bold text-lg">Total Annual Premium</span>
                  <span className="font-mono text-xl font-bold text-primary">
                    ${enhancedPricing.totalAnnualPremium.toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pricing Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Base DOI Rate:</strong> ${enhancedPricing.basePremium.toFixed(0)} 
                  <span className="text-muted-foreground ml-2">
                    (Official state insurance department rate)
                  </span>
                </p>
                <p>
                  <strong>Additional Charges:</strong> ${Object.values(enhancedPricing.additionalCharges).reduce((sum, charge) => sum + charge, 0).toFixed(0)}
                  <span className="text-muted-foreground ml-2">
                    (Policy fees, taxes, add-ons, surcharges)
                  </span>
                </p>
                <p>
                  <strong>Available Discounts:</strong> ${Object.values(enhancedPricing.savings).reduce((sum, saving) => sum + saving, 0).toFixed(0)}
                  <span className="text-muted-foreground ml-2">
                    (Safe driver, annual payment, etc.)
                  </span>
                </p>
                <p className="pt-2 border-t">
                  <strong>Final Premium:</strong> ${enhancedPricing.totalAnnualPremium.toFixed(0)}/year
                  <span className="text-muted-foreground ml-2">
                    (${enhancedPricing.totalMonthlyPremium.toFixed(0)}/month)
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
