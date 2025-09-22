"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import type { QuoteProfile } from "@/lib/quote-profile"

interface QuoteProfileDisplayProps {
  profile: QuoteProfile
}

export function QuoteProfileDisplay({ profile }: QuoteProfileDisplayProps) {
  const { completeness } = profile
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Quote Profile</CardTitle>
          <Badge variant={completeness.readyForQuote ? "success" : "secondary"}>
            {completeness.score}% Complete
          </Badge>
        </div>
        <Progress value={completeness.score} className="mt-2 h-2" />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Basics Section */}
        <div className="space-y-1">
          <h4 className="font-medium text-muted-foreground">Basic Information</h4>
          <div className="ml-4 space-y-1">
            <ProfileItem 
              label="Vehicles" 
              value={profile.basics.numberOfVehicles?.toString()} 
              required 
            />
            <ProfileItem 
              label="Drivers" 
              value={profile.basics.numberOfDrivers?.toString()} 
              required 
            />
            <ProfileItem 
              label="ZIP Code" 
              value={profile.basics.zipCode} 
              required 
            />
          </div>
        </div>

        {/* Vehicles Section */}
        {profile.vehicles.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Vehicles</h4>
            <div className="ml-4 space-y-2">
              {profile.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="space-y-1">
                  <div className="font-medium">Vehicle {vehicle.id}</div>
                  <div className="ml-4 space-y-0.5">
                    <ProfileItem 
                      label="Year/Make/Model" 
                      value={vehicle.year && vehicle.make && vehicle.model ? 
                        `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 
                        undefined} 
                      required 
                    />
                    <ProfileItem 
                      label="Annual Mileage" 
                      value={vehicle.annualMileage ? `${vehicle.annualMileage.toLocaleString()} miles` : undefined} 
                    />
                    <ProfileItem 
                      label="Primary Use" 
                      value={vehicle.primaryUse} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drivers Section */}
        {profile.drivers.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Drivers</h4>
            <div className="ml-4 space-y-2">
              {profile.drivers.map((driver) => (
                <div key={driver.id} className="space-y-1">
                  <div className="font-medium">Driver {driver.id}</div>
                  <div className="ml-4 space-y-0.5">
                    <ProfileItem 
                      label="Age" 
                      value={driver.age?.toString()} 
                      required 
                    />
                    <ProfileItem 
                      label="Years Licensed" 
                      value={driver.yearsLicensed?.toString()} 
                    />
                    <ProfileItem 
                      label="Driving Record" 
                      value={driver.violations ? 
                        (driver.violations.hasViolations ? "Has violations" : "Clean") : 
                        undefined} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coverage Section */}
        {Object.keys(profile.coverage).length > 0 && (
          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Coverage Preferences</h4>
            <div className="ml-4 space-y-0.5">
              <ProfileItem 
                label="Coverage Level" 
                value={profile.coverage.desiredCoverage} 
              />
              <ProfileItem 
                label="Deductible" 
                value={profile.coverage.collisionDeductible ? 
                  `$${profile.coverage.collisionDeductible}` : undefined} 
              />
              <ProfileItem 
                label="Current Carrier" 
                value={profile.coverage.currentCarrier} 
              />
            </div>
          </div>
        )}

        {/* Missing Information Alert */}
        {completeness.missingRequired.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-500">
                  Missing Required Information
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  I'll help you provide the remaining details needed for accurate quotes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ready for Quotes */}
        {completeness.readyForQuote && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-500">
                  Ready for Quotes!
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  You have all the required information for accurate quote estimates.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProfileItem({ 
  label, 
  value, 
  required = false 
}: { 
  label: string
  value?: string
  required?: boolean 
}) {
  const hasValue = value && value !== "undefined" && value !== "null"
  
  return (
    <div className="flex items-center gap-2 text-xs">
      {hasValue ? (
        <CheckCircle2 className="h-3 w-3 text-green-500" />
      ) : (
        <Circle className={`h-3 w-3 ${required ? 'text-amber-500' : 'text-muted-foreground'}`} />
      )}
      <span className="text-muted-foreground">{label}:</span>
      <span className={hasValue ? '' : 'text-muted-foreground/50'}>
        {hasValue ? value : (required ? 'Required' : 'Optional')}
      </span>
    </div>
  )
}