'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, User, MapPin, Car, Calendar, Shield } from "lucide-react"
import { CustomerProfile } from "@/lib/customer-profile"
import { useEffect, useState } from "react"

interface ProfileSummaryCardProps {
  profile: CustomerProfile
}

export function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Show card only if we have some data
  useEffect(() => {
    const hasData = Object.values(profile).some(value =>
      value !== undefined && value !== null && value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true)
    )
    setIsVisible(hasData)
  }, [profile])

  if (!isVisible) return null

  // Calculate completeness for auto insurance
  const calculateCompleteness = () => {
    const required = ['age', 'zipCode', 'driversCount', 'vehiclesCount']
    const optional = ['email', 'firstName', 'maritalStatus', 'homeOwnership']

    const requiredComplete = required.filter(key => profile[key as keyof CustomerProfile]).length
    const optionalComplete = optional.filter(key => profile[key as keyof CustomerProfile]).length

    const total = (requiredComplete / required.length) * 70 + (optionalComplete / optional.length) * 30
    return Math.round(total)
  }

  const completeness = calculateCompleteness()

  return (
    <div className="sticky top-4 z-10 mb-4">
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Your Profile
            </CardTitle>
            <Badge variant={completeness >= 70 ? "default" : "secondary"} className="text-xs">
              {completeness}% Complete
            </Badge>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Personal Info */}
            {(profile.firstName || profile.age) && (
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Personal"
                value={
                  <>
                    {profile.firstName && <span className="font-medium">{profile.firstName}</span>}
                    {profile.firstName && profile.age && <span className="mx-1">•</span>}
                    {profile.age && <span>{profile.age} years old</span>}
                  </>
                }
              />
            )}

            {/* Location */}
            {(profile.location || profile.zipCode) && (
              <InfoItem
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                value={
                  <>
                    {profile.location && <span>{profile.location}</span>}
                    {profile.location && profile.zipCode && <span className="mx-1">•</span>}
                    {profile.zipCode && <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{profile.zipCode}</span>}
                  </>
                }
              />
            )}

            {/* Contact */}
            {profile.email && (
              <InfoItem
                icon={<Check className="w-4 h-4" />}
                label="Email"
                value={<span className="text-sm">{profile.email}</span>}
              />
            )}

            {/* Insurance Type */}
            {profile.needs && profile.needs.length > 0 && (
              <InfoItem
                icon={<Shield className="w-4 h-4" />}
                label="Insurance"
                value={
                  <div className="flex gap-1">
                    {profile.needs.map((need) => (
                      <Badge key={need} variant="outline" className="text-xs capitalize">
                        {need}
                      </Badge>
                    ))}
                  </div>
                }
              />
            )}

            {/* Drivers & Vehicles */}
            {(profile.driversCount || profile.vehiclesCount) && (
              <InfoItem
                icon={<Car className="w-4 h-4" />}
                label="Coverage"
                value={
                  <div className="flex gap-2 text-sm">
                    {profile.driversCount && (
                      <span>
                        <span className="font-semibold">{profile.driversCount}</span> driver{profile.driversCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {profile.driversCount && profile.vehiclesCount && <span>•</span>}
                    {profile.vehiclesCount && (
                      <span>
                        <span className="font-semibold">{profile.vehiclesCount}</span> vehicle{profile.vehiclesCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                }
              />
            )}

            {/* Vehicle Details with Full NHTSA Registry Info */}
            {profile.vehicles && profile.vehicles.length > 0 && (
              <InfoItem
                icon={<Car className="w-4 h-4" />}
                label="Vehicles"
                value={
                  <div className="flex flex-col gap-3">
                    {profile.vehicles.map((vehicle, idx) => (
                      <div key={idx} className="text-sm space-y-1.5 pb-2 border-b border-border/50 last:border-0 last:pb-0">
                        {/* Primary Vehicle Info */}
                        <div className="font-semibold text-base">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        
                        {/* VIN with Registry Badge */}
                        {vehicle.vin && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              VIN: {vehicle.vin}
                            </span>
                            {vehicle.enriched && vehicle.enrichmentSource && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                                <Check className="w-2.5 h-2.5 mr-1" />
                                {vehicle.enrichmentSource} Registry
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Enriched Details */}
                        {vehicle.enriched && (
                          <div className="text-xs text-muted-foreground space-y-0.5 ml-0 mt-2">
                            <div className="font-medium text-foreground/80 mb-1">Vehicle Specifications:</div>
                            
                            {vehicle.bodyClass && (
                              <div className="flex items-start">
                                <span className="text-muted-foreground/60 mr-1">•</span>
                                <span><span className="font-medium">Type:</span> {vehicle.bodyClass}</span>
                              </div>
                            )}
                            
                            {vehicle.vehicleType && (
                              <div className="flex items-start">
                                <span className="text-muted-foreground/60 mr-1">•</span>
                                <span><span className="font-medium">Category:</span> {vehicle.vehicleType}</span>
                              </div>
                            )}
                            
                            {vehicle.fuelType && (
                              <div className="flex items-start">
                                <span className="text-muted-foreground/60 mr-1">•</span>
                                <span><span className="font-medium">Fuel:</span> {vehicle.fuelType}</span>
                              </div>
                            )}
                            
                            {vehicle.doors && (
                              <div className="flex items-start">
                                <span className="text-muted-foreground/60 mr-1">•</span>
                                <span><span className="font-medium">Doors:</span> {vehicle.doors}</span>
                              </div>
                            )}

                            {vehicle.gvwr && (
                              <div className="flex items-start">
                                <span className="text-muted-foreground/60 mr-1">•</span>
                                <span><span className="font-medium">GVWR:</span> {vehicle.gvwr}</span>
                              </div>
                            )}
                            
                            {vehicle.manufacturer && (
                              <div className="flex items-start mt-1.5">
                                <span className="text-muted-foreground/60 mr-1">•</span>
                                <span><span className="font-medium">Manufacturer:</span> {vehicle.manufacturer}</span>
                              </div>
                            )}
                            
                            {vehicle.plantCity && vehicle.plantState && (
                              <div className="flex items-start">
                                <span className="text-muted-foreground/60 mr-1">•</span>
                                <span><span className="font-medium">Built in:</span> {vehicle.plantCity}, {vehicle.plantState}</span>
                              </div>
                            )}

                            {/* Safety Features */}
                            {(vehicle.abs || vehicle.esc) && (
                              <div className="flex items-start mt-1.5">
                                <span className="text-muted-foreground/60 mr-1">•</span>
                                <span><span className="font-medium">Safety:</span> {[
                                  vehicle.abs && 'ABS',
                                  vehicle.esc && 'ESC'
                                ].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Usage Info */}
                        {(vehicle.primaryUse || vehicle.annualMileage) && (
                          <div className="text-xs text-muted-foreground mt-1.5">
                            {vehicle.primaryUse && (
                              <div>Usage: {vehicle.primaryUse}</div>
                            )}
                            {vehicle.annualMileage && (
                              <div>Annual Mileage: {vehicle.annualMileage.toLocaleString()} miles</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                }
              />
            )}

            {/* Marital Status */}
            {profile.maritalStatus && (
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Status"
                value={<span className="capitalize">{profile.maritalStatus}</span>}
              />
            )}

            {/* Home Ownership */}
            {profile.homeOwnership && (
              <InfoItem
                icon={<Check className="w-4 h-4" />}
                label="Home"
                value={<span className="capitalize">{profile.homeOwnership === 'own' ? 'Homeowner' : 'Renter'}</span>}
              />
            )}

          </div>

          {/* Missing Info Hint */}
          {completeness < 100 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                {completeness < 70
                  ? "Continue the conversation to complete your profile"
                  : "Almost there! A few more details for the best quotes"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        <div className="text-sm text-foreground truncate">{value}</div>
      </div>
    </div>
  )
}
