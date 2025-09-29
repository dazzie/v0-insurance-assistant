"use client"

import React, { useState } from "react"
import { InteractiveForm, QuickSelect, FormProgress } from "./interactive-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuoteInformation {
  // Driver Information
  driversCount?: string
  driverAges?: string[]
  driverNames?: string[]
  drivingExperience?: string[]
  
  // Vehicle Information
  vehiclesCount?: string
  vehicleYears?: string[]
  vehicleMakes?: string[]
  vehicleModels?: string[]
  vehicleVINs?: string[]
  
  // Location Information
  zipCode?: string
  address?: string
  city?: string
  state?: string
  
  // Insurance History
  currentInsurer?: string
  currentPremium?: string
  claimsHistory?: string
  coverageGaps?: string
  
  // Additional Information
  annualMileage?: string
  primaryUse?: string
  parkingLocation?: string
}

interface QuoteInformationGathererProps {
  insuranceType: string
  onComplete: (information: QuoteInformation) => void
  onCancel: () => void
}

export function QuoteInformationGatherer({ insuranceType, onComplete, onCancel }: QuoteInformationGathererProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [collectedData, setCollectedData] = useState<QuoteInformation>({})
  const [showCustomForm, setShowCustomForm] = useState(false)

  const steps = [
    "Driver Information",
    "Vehicle Information", 
    "Location Details",
    "Insurance History",
    "Additional Information"
  ]

  const totalSteps = steps.length

  // Step 1: Driver Information
  const driverFields = [
    {
      id: 'driversCount',
      label: 'Number of Drivers',
      type: 'select' as const,
      required: true,
      options: ['1', '2', '3', '4', '5+']
    },
    {
      id: 'primaryDriverAge',
      label: 'Primary Driver Age',
      type: 'number' as const,
      required: true,
      placeholder: 'Enter age'
    },
    {
      id: 'primaryDriverName',
      label: 'Primary Driver Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Full name'
    }
  ]

  // Step 2: Vehicle Information
  const vehicleFields = [
    {
      id: 'vehiclesCount',
      label: 'Number of Vehicles',
      type: 'select' as const,
      required: true,
      options: ['1', '2', '3', '4', '5+']
    },
    {
      id: 'vehicleYear',
      label: 'Vehicle Year',
      type: 'number' as const,
      required: true,
      placeholder: 'e.g., 2020'
    },
    {
      id: 'vehicleMake',
      label: 'Vehicle Make',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Toyota, Honda, Ford'
    },
    {
      id: 'vehicleModel',
      label: 'Vehicle Model',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Camry, Civic, F-150'
    }
  ]

  // Step 3: Location Information
  const locationFields = [
    {
      id: 'zipCode',
      label: 'ZIP Code',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., 90210'
    },
    {
      id: 'address',
      label: 'Street Address',
      type: 'text' as const,
      required: false,
      placeholder: 'Full address (optional)'
    }
  ]

  // Step 4: Insurance History
  const insuranceHistoryFields = [
    {
      id: 'currentInsurer',
      label: 'Current Insurance Company',
      type: 'text' as const,
      required: false,
      placeholder: 'e.g., State Farm, GEICO, Progressive'
    },
    {
      id: 'currentPremium',
      label: 'Current Monthly Premium',
      type: 'text' as const,
      required: false,
      placeholder: 'e.g., $150'
    },
    {
      id: 'claimsHistory',
      label: 'Claims in Last 5 Years',
      type: 'select' as const,
      required: true,
      options: ['None', '1 claim', '2-3 claims', '4+ claims']
    }
  ]

  // Step 5: Additional Information
  const additionalFields = [
    {
      id: 'annualMileage',
      label: 'Annual Mileage',
      type: 'select' as const,
      required: true,
      options: ['Under 5,000', '5,000-10,000', '10,000-15,000', '15,000-20,000', 'Over 20,000']
    },
    {
      id: 'primaryUse',
      label: 'Primary Use',
      type: 'select' as const,
      required: true,
      options: ['Commuting', 'Business', 'Pleasure', 'Farm/Ranch', 'Other']
    },
    {
      id: 'parkingLocation',
      label: 'Parking Location',
      type: 'select' as const,
      required: true,
      options: ['Garage', 'Driveway', 'Street', 'Parking Lot', 'Other']
    }
  ]

  const getCurrentFields = () => {
    switch (currentStep) {
      case 1: return driverFields
      case 2: return vehicleFields
      case 3: return locationFields
      case 4: return insuranceHistoryFields
      case 5: return additionalFields
      default: return []
    }
  }

  const handleStepSubmit = (data: Record<string, string>) => {
    setCollectedData(prev => ({ ...prev, ...data }))
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete(collectedData)
    }
  }

  const handleQuickSelect = (value: string) => {
    const fieldId = getCurrentFields()[0]?.id
    if (fieldId) {
      handleStepSubmit({ [fieldId]: value })
    }
  }

  const handleCustomEntry = () => {
    setShowCustomForm(true)
  }

  const getQuickSelectOptions = () => {
    switch (currentStep) {
      case 1:
        return [
          { value: '1', label: 'Just Me', description: 'Single driver policy' },
          { value: '2', label: 'Me + Spouse', description: 'Two drivers, typically married couple' },
          { value: '3', label: 'Family', description: 'Parents + 1 teen driver' },
          { value: '4', label: 'Large Family', description: 'Multiple drivers' }
        ]
      case 2:
        return [
          { value: '1', label: 'One Vehicle', description: 'Single car policy' },
          { value: '2', label: 'Two Vehicles', description: 'Couple with two cars' },
          { value: '3', label: 'Family Fleet', description: '3+ vehicles' }
        ]
      case 3:
        return [
          { value: '90210', label: 'Beverly Hills, CA', description: '90210' },
          { value: '10001', label: 'New York, NY', description: '10001' },
          { value: '60601', label: 'Chicago, IL', description: '60601' },
          { value: '33101', label: 'Miami, FL', description: '33101' }
        ]
      default:
        return []
    }
  }

  if (showCustomForm) {
    return (
      <div className="space-y-4">
        <FormProgress 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
          stepTitles={steps}
        />
        <InteractiveForm
          fields={getCurrentFields()}
          onSubmit={handleStepSubmit}
          onCancel={() => setShowCustomForm(false)}
          title={`${steps[currentStep - 1]} - Custom Entry`}
          description="Enter your information manually"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <FormProgress 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        stepTitles={steps}
      />
      
      {getQuickSelectOptions().length > 0 ? (
        <QuickSelect
          title={`${steps[currentStep - 1]} - Quick Selection`}
          options={getQuickSelectOptions()}
          onSelect={handleQuickSelect}
          onCustom={handleCustomEntry}
        />
      ) : (
        <InteractiveForm
          fields={getCurrentFields()}
          onSubmit={handleStepSubmit}
          onCancel={onCancel}
          title={steps[currentStep - 1]}
          description="Please provide the following information"
        />
      )}
    </div>
  )
}
