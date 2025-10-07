"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { User, MapPin, Mail, Phone, Car, Home, Shield, Edit, Save, X, Download, Upload, Trash2 } from 'lucide-react'
import {
  CustomerProfile,
  profileManager,
  calculateProfileCompleteness,
  getProfileSummary
} from '@/lib/customer-profile'

export function CustomerProfileCard() {
  const [profile, setProfile] = useState<CustomerProfile>({})
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<CustomerProfile>({})
  const [completeness, setCompleteness] = useState(0)

  // Load profile on component mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loaded = profileManager.loadProfile()
    if (loaded) {
      setProfile(loaded)
      setEditedProfile(loaded)
      setCompleteness(calculateProfileCompleteness(loaded))
    }

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      setProfile(event.detail)
      setCompleteness(calculateProfileCompleteness(event.detail))
    }

    window.addEventListener('profileUpdated' as any, handleProfileUpdate)
    return () => {
      window.removeEventListener('profileUpdated' as any, handleProfileUpdate)
    }
  }, [])

  const handleSave = () => {
    profileManager.saveProfile(editedProfile)
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your profile?')) {
      profileManager.clearProfile()
      setProfile({})
      setEditedProfile({})
      setCompleteness(0)
    }
  }

  const handleExport = () => {
    const json = profileManager.exportProfile()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `insurance-profile-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const json = e.target?.result as string
        if (profileManager.importProfile(json)) {
          const loaded = profileManager.loadProfile()
          if (loaded) {
            setProfile(loaded)
            setEditedProfile(loaded)
            setCompleteness(calculateProfileCompleteness(loaded))
          }
        }
      }
      reader.readAsText(file)
    }
  }

  const insuranceTypeIcons = {
    auto: <Car className="h-4 w-4" />,
    home: <Home className="h-4 w-4" />,
    life: <Shield className="h-4 w-4" />,
    renters: <Home className="h-4 w-4" />,
    pet: <Shield className="h-4 w-4" />,
    health: <Shield className="h-4 w-4" />,
    disability: <Shield className="h-4 w-4" />,
    umbrella: <Shield className="h-4 w-4" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>Customer Profile</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage Profile</DialogTitle>
                      <DialogDescription>
                        Export or import your profile data
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Button onClick={handleExport} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export Profile
                      </Button>
                      <div>
                        <Label htmlFor="import">Import Profile</Label>
                        <Input
                          id="import"
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                        />
                      </div>
                      <Button onClick={handleClear} variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Profile
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                <Button onClick={handleSave} size="sm" variant="default">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleCancel} size="sm" variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
        <CardDescription>{getProfileSummary(profile)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Profile Completeness */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completeness</span>
              <span className="font-medium">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2" />
            {completeness < 70 && (
              <p className="text-xs text-muted-foreground">
                Complete your profile for more accurate insurance quotes
              </p>
            )}
          </div>

          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editedProfile.firstName || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editedProfile.lastName || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editedProfile.phone || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={editedProfile.age || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, age: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={editedProfile.gender || ''}
                    onValueChange={(value) => setEditedProfile({ ...editedProfile, gender: value as any })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editedProfile.city || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={editedProfile.state || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={editedProfile.zipCode || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, zipCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceType">Insurance Type</Label>
                  <Select
                    value={editedProfile.insuranceType || ''}
                    onValueChange={(value) => setEditedProfile({ ...editedProfile, insuranceType: value as any })}
                  >
                    <SelectTrigger id="insuranceType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="life">Life</SelectItem>
                      <SelectItem value="renters">Renters</SelectItem>
                      <SelectItem value="pet">Pet</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="disability">Disability</SelectItem>
                      <SelectItem value="umbrella">Umbrella</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={editedProfile.maritalStatus || ''}
                    onValueChange={(value) => setEditedProfile({ ...editedProfile, maritalStatus: value as any })}
                  >
                    <SelectTrigger id="maritalStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="homeOwnership">Home Ownership</Label>
                  <Select
                    value={editedProfile.homeOwnership || ''}
                    onValueChange={(value) => setEditedProfile({ ...editedProfile, homeOwnership: value as any })}
                  >
                    <SelectTrigger id="homeOwnership">
                      <SelectValue placeholder="Select ownership" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">Own</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            // Display Mode
            <div className="space-y-3">
              {profile.firstName && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {profile.firstName} {profile.lastName}
                    {profile.age && ` • Age ${profile.age}`}
                    {profile.gender && profile.gender !== 'prefer-not-to-say' && ` • ${profile.gender}`}
                  </span>
                </div>
              )}

              {profile.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.email}</span>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}

              {(profile.city || profile.state || profile.zipCode) && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {[profile.city, profile.state, profile.zipCode].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {profile.insuranceType && (
                <div className="flex items-center space-x-2">
                  {insuranceTypeIcons[profile.insuranceType]}
                  <Badge variant="secondary" className="text-xs">
                    {profile.insuranceType} insurance
                  </Badge>
                </div>
              )}

              {profile.maritalStatus && (
                <div className="text-sm text-muted-foreground">
                  Marital Status: {profile.maritalStatus}
                </div>
              )}

              {profile.homeOwnership && (
                <div className="text-sm text-muted-foreground">
                  Home: {profile.homeOwnership === 'own' ? 'Owner' : profile.homeOwnership === 'rent' ? 'Renter' : 'Other'}
                </div>
              )}

              {!profile.firstName && !profile.email && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No profile information yet. Click Edit to add your details.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}