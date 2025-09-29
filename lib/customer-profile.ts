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

// Extract profile from conversation
export function extractProfileFromConversation(messages: any[]): Partial<CustomerProfile> {
  const extracted: Partial<CustomerProfile> = {}

  messages.forEach(message => {
    const content = message.content?.toLowerCase() || ''

    // Extract age
    const ageMatch = content.match(/\b(\d{2})\s*(?:years?\s*old|yo)\b/)
    if (ageMatch && !extracted.age) {
      extracted.age = ageMatch[1]
    }

    // Extract ZIP code
    const zipMatch = content.match(/\b(\d{5})\b/)
    if (zipMatch && !extracted.zipCode) {
      extracted.zipCode = zipMatch[1]
    }

    // Extract email
    const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    if (emailMatch && !extracted.email) {
      extracted.email = emailMatch[0]
    }

    // Extract driver/vehicle counts for auto insurance
    const driversMatch = content.match(/(\d+)\s*drivers?/)
    if (driversMatch && !extracted.driversCount) {
      extracted.driversCount = parseInt(driversMatch[1])
    }

    const vehiclesMatch = content.match(/(\d+)\s*(?:vehicles?|cars?)/)
    if (vehiclesMatch && !extracted.vehiclesCount) {
      extracted.vehiclesCount = parseInt(vehiclesMatch[1])
    }
  })

  return extracted
}