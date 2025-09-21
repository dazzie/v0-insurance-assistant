"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CustomerProfile } from "@/app/page"

interface CustomerProfileFormProps {
  onSubmit: (profile: CustomerProfile) => void
}

export function CustomerProfileForm({ onSubmit }: CustomerProfileFormProps) {
  const [location, setLocation] = useState("")
  const [age, setAge] = useState("")
  const [needs, setNeeds] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!location.trim()) newErrors.location = "Location is required"
    if (!age) newErrors.age = "Age is required"
    else if (Number.parseInt(age) < 18 || Number.parseInt(age) > 100) newErrors.age = "Age must be between 18 and 100"
    if (!needs.trim()) newErrors.needs = "Insurance needs are required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit({
        location: location.trim(),
        age,
        needs: needs
          .split(",")
          .map((need) => need.trim())
          .filter((need) => need.length > 0),
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Insurance Research Agent</CardTitle>
          <CardDescription className="text-base">
            Provide your information to get personalized insurance research and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. California, US"
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            {/* Age field matches config */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium">
                Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 42"
                className={errors.age ? "border-destructive" : ""}
              />
              {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="needs" className="text-sm font-medium">
                Insurance Needs <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="needs"
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                placeholder="e.g. life insurance, disability, auto"
                className={errors.needs ? "border-destructive" : ""}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Separate multiple needs with commas</p>
              {errors.needs && <p className="text-sm text-destructive">{errors.needs}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Start Research
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
