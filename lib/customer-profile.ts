// Customer Profile Management

export interface CustomerProfile {
  // Personal Information
  firstName?: string
  lastName?: string
  email?: string
  phone?: string

  // Demographics
  age?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'

  // Location
  location?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string

  // Insurance Needs
  insuranceType?: 'auto' | 'home' | 'life' | 'renters' | 'pet' | 'health' | 'disability' | 'umbrella'
  needs?: string[]

  // Auto Insurance Specific
  driversCount?: number
  vehiclesCount?: number
  currentInsurer?: string
  currentPremium?: string
  vehicles?: Array<{
    year?: number
    make?: string
    model?: string
    vin?: string
    primaryUse?: string
    annualMileage?: number
  }>
  drivers?: Array<{
    age?: number
    name?: string
    yearsLicensed?: number
    violations?: boolean
    accidents?: boolean
  }>

  // Home Insurance Specific
  homeType?: 'single-family' | 'townhouse' | 'condo' | 'mobile' | 'other'
  homeValue?: string
  yearBuilt?: number
  squareFootage?: number

  // Life Insurance Specific
  lifeInsuranceType?: 'term' | 'whole' | 'universal' | 'not-sure'
  coverageAmount?: string
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor'
  smoker?: boolean

  // Additional Information
  occupation?: string
  homeOwnership?: 'own' | 'rent' | 'other'
  creditRange?: 'excellent' | 'good' | 'fair' | 'poor' | 'prefer-not-to-say'

  // Metadata
  createdAt?: string
  updatedAt?: string
  profileComplete?: boolean
}

// Storage key for localStorage
const PROFILE_STORAGE_KEY = 'insurance_customer_profile'

// Profile management functions
export const profileManager = {
  // Save profile to localStorage
  saveProfile: (profile: CustomerProfile): void => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString()
      }

      if (!updatedProfile.createdAt) {
        updatedProfile.createdAt = new Date().toISOString()
      }

      // Calculate profile completeness
      updatedProfile.profileComplete = calculateProfileCompleteness(updatedProfile) >= 70

      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile))

      // Dispatch custom event for profile updates
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedProfile }))
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  },

  // Load profile from localStorage
  loadProfile: (): CustomerProfile | null => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return null
      }
      
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
    return null
  },

  // Update specific fields in profile
  updateProfile: (updates: Partial<CustomerProfile>): void => {
    const current = profileManager.loadProfile() || {}
    const updated = { ...current, ...updates }
    profileManager.saveProfile(updated)
  },

  // Clear profile from storage
  clearProfile: (): void => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      localStorage.removeItem(PROFILE_STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('profileCleared'))
    } catch (error) {
      console.error('Error clearing profile:', error)
    }
  },

  // Export profile as JSON
  exportProfile: (): string => {
    const profile = profileManager.loadProfile()
    return JSON.stringify(profile, null, 2)
  },

  // Import profile from JSON
  importProfile: (jsonString: string): boolean => {
    try {
      const profile = JSON.parse(jsonString)
      profileManager.saveProfile(profile)
      return true
    } catch (error) {
      console.error('Error importing profile:', error)
      return false
    }
  }
}

// Calculate how complete the profile is (percentage)
export function calculateProfileCompleteness(profile: CustomerProfile): number {
  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'age',
    'location',
    'zipCode',
    'insuranceType'
  ]

  const optionalFields = [
    'phone',
    'gender',
    'maritalStatus',
    'address',
    'city',
    'state',
    'occupation',
    'homeOwnership',
    'creditRange'
  ]

  let filledRequired = 0
  let filledOptional = 0

  requiredFields.forEach(field => {
    if (profile[field as keyof CustomerProfile]) {
      filledRequired++
    }
  })

  optionalFields.forEach(field => {
    if (profile[field as keyof CustomerProfile]) {
      filledOptional++
    }
  })

  // Required fields are worth 70%, optional fields are worth 30%
  const requiredScore = (filledRequired / requiredFields.length) * 70
  const optionalScore = (filledOptional / optionalFields.length) * 30

  return Math.round(requiredScore + optionalScore)
}

// Get profile summary for display
export function getProfileSummary(profile: CustomerProfile): string {
  const parts: string[] = []

  if (profile.firstName && profile.lastName) {
    parts.push(`${profile.firstName} ${profile.lastName}`)
  }

  if (profile.age) {
    parts.push(`Age ${profile.age}`)
  }

  if (profile.location) {
    parts.push(profile.location)
  }

  if (profile.insuranceType) {
    parts.push(`Looking for ${profile.insuranceType} insurance`)
  }

  return parts.join(' • ') || 'No profile information'
}

// Extract profile from conversation with enhanced insurance data capture
export function extractProfileFromConversation(messages: any[]): Partial<CustomerProfile> {
  const extracted: Partial<CustomerProfile> = {}

  messages.forEach(message => {
    const content = message.content || ''
    const contentLower = content.toLowerCase()

    // Extract age
    const ageMatch = content.match(/\b(\d{1,2})\s*(?:years?\s*old|yo)\b/i) ||
                     content.match(/(?:age|I'm|I am)\s*(\d{1,2})\b/i)
    if (ageMatch && !extracted.age) {
      extracted.age = ageMatch[1]
    }

    // Extract ZIP code
    const zipMatch = content.match(/\b(\d{5})\b/)
    if (zipMatch && !extracted.zipCode) {
      extracted.zipCode = zipMatch[1]
    }

    // Extract email
    const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i)
    if (emailMatch && !extracted.email) {
      extracted.email = emailMatch[0]
    }

    // Extract phone
    const phoneMatch = content.match(/\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/)
    if (phoneMatch && !extracted.phone) {
      extracted.phone = phoneMatch[1]
    }

    // Extract marital status
    if (contentLower.includes('married') && !extracted.maritalStatus) {
      extracted.maritalStatus = 'married'
    } else if (contentLower.includes('single') && !extracted.maritalStatus) {
      extracted.maritalStatus = 'single'
    } else if (contentLower.includes('divorced') && !extracted.maritalStatus) {
      extracted.maritalStatus = 'divorced'
    } else if (contentLower.includes('widowed') && !extracted.maritalStatus) {
      extracted.maritalStatus = 'widowed'
    }

    // Extract driver/vehicle counts for auto insurance
    const driversMatch = content.match(/(\d+)\s*(?:drivers?|people)/i) ||
                        content.match(/just\s*me/i)
    if (driversMatch) {
      if (contentLower.includes('just me')) {
        extracted.driversCount = 1
      } else if (!extracted.driversCount) {
        extracted.driversCount = parseInt(driversMatch[1])
      }
    }

    const vehiclesMatch = content.match(/(\d+)\s*(?:vehicles?|cars?)/i)
    if (vehiclesMatch && !extracted.vehiclesCount) {
      extracted.vehiclesCount = parseInt(vehiclesMatch[1])
    }

    // Extract vehicle information
    const vehicleMatch = content.match(/(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9\-]+)/i)
    if (vehicleMatch) {
      if (!extracted.vehicles) {
        extracted.vehicles = []
      }
      const year = parseInt(vehicleMatch[1])
      const make = vehicleMatch[2]
      const model = vehicleMatch[3]

      // Check if this vehicle isn't already in the array
      const exists = extracted.vehicles.some(v =>
        v.year === year && v.make === make && v.model === model
      )

      if (!exists && year > 1990 && year <= new Date().getFullYear() + 1) {
        extracted.vehicles.push({ year, make, model })
      }
    }

    // Extract home type
    if (contentLower.includes('single family') && !extracted.homeType) {
      extracted.homeType = 'single-family'
    } else if (contentLower.includes('townhouse') && !extracted.homeType) {
      extracted.homeType = 'townhouse'
    } else if (contentLower.includes('condo') && !extracted.homeType) {
      extracted.homeType = 'condo'
    }

    // Extract home value
    const homeValueMatch = content.match(/\$?([\d,]+)k|\$?([\d,]+),?000/i)
    if (homeValueMatch && !extracted.homeValue) {
      const value = homeValueMatch[1] || homeValueMatch[2]
      extracted.homeValue = value.replace(/,/g, '') + '000'
    }

    // Extract life insurance coverage amount
    const coverageMatch = content.match(/\$?([\d,]+)k|\$?([\d,]+),?000/i)
    if (coverageMatch && contentLower.includes('coverage') && !extracted.coverageAmount) {
      const value = coverageMatch[1] || coverageMatch[2]
      extracted.coverageAmount = value.replace(/,/g, '') + '000'
    }

    // Extract health status
    if (contentLower.includes('excellent health') && !extracted.healthStatus) {
      extracted.healthStatus = 'excellent'
    } else if (contentLower.includes('good health') && !extracted.healthStatus) {
      extracted.healthStatus = 'good'
    }

    // Extract smoker status
    if (contentLower.includes('non-smoker') || contentLower.includes('don\'t smoke')) {
      extracted.smoker = false
    } else if (contentLower.includes('smoker') || contentLower.includes('smoke')) {
      extracted.smoker = true
    }

    // Extract home ownership
    if (contentLower.includes('own') && (contentLower.includes('home') || contentLower.includes('house'))) {
      extracted.homeOwnership = 'own'
    } else if (contentLower.includes('rent')) {
      extracted.homeOwnership = 'rent'
    }

    // Extract occupation
    const occupationMatch = content.match(/(?:work as|I'm a|I am a|occupation:?\s*)\s*([A-Za-z\s]+)/i)
    if (occupationMatch && !extracted.occupation) {
      extracted.occupation = occupationMatch[1].trim()
    }
  })

  return extracted
}