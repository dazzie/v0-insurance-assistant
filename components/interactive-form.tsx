"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FormField {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  required: boolean
  options?: string[]
  placeholder?: string
  value?: string
}

interface InteractiveFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, string>) => void
  onCancel: () => void
  title: string
  description?: string
}

export function InteractiveForm({ fields, onSubmit, onCancel, title, description }: InteractiveFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id]
    
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {field.type === 'select' && field.options ? (
          <Select 
            value={formData[field.id] || ''} 
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.id}
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )}
        
        {hasError && (
          <p className="text-sm text-red-500">{errors[field.id]}</p>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📋 {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(renderField)}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Continue with Quote
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Quick selection component for common options
interface QuickSelectProps {
  title: string
  options: Array<{ value: string; label: string; description?: string }>
  onSelect: (value: string) => void
  onCustom: () => void
}

export function QuickSelect({ title, options, onSelect, onCustom }: QuickSelectProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚡ {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose an option below or enter custom information
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => onSelect(option.value)}
            >
              <div className="font-medium">{option.label}</div>
              {option.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </div>
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onCustom} className="w-full">
            ✏️ Enter Custom Information
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Progress indicator for multi-step forms
interface FormProgressProps {
  currentStep: number
  totalSteps: number
  stepTitles: string[]
}

export function FormProgress({ currentStep, totalSteps, stepTitles }: FormProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
      <div className="mt-2">
        <Badge variant="secondary" className="text-xs">
          {stepTitles[currentStep - 1]}
        </Badge>
      </div>
    </div>
  )
}
