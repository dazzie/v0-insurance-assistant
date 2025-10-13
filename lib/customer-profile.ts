// Customer Profile Management

export interface CustomerProfile {
  // Personal Information
  firstName?: string
  lastName?: string
  email?: string
  emailEnrichment?: {
    verified: boolean
    status?: string  // valid, invalid, accept_all, webmail, disposable, unknown
    result?: string  // deliverable, undeliverable, risky, unknown
    score?: number   // 0-100
    risk?: string    // low, medium, high, unknown
    disposable?: boolean
    webmail?: boolean
    enrichmentSource?: string
    enrichmentError?: string
  }
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
  addressEnrichment?: {
    formattedAddress?: string
    latitude?: number
    longitude?: number
    components?: any
    confidence?: number
    enriched: boolean
    enrichmentSource?: string
    enrichmentError?: string
  }

  // Risk Assessment (Proactive Agent)
  riskAssessment?: {
    floodRisk?: {
      floodFactor: number  // 1-10 scale
      riskLevel: string    // Minimal, Minor, Moderate, Major, Extreme
      floodInsuranceRequired: boolean
      climateChange30Year?: string
      description?: string
      enrichmentSource: 'First Street Foundation'
    }
    crimeRisk?: {
      crimeIndex: number   // 0-100 scale (100 = highest crime)
      riskLevel: string    // Low, Moderate, High, Very High
      violentCrime: number
      propertyCrime: number
      enrichmentSource: 'FBI Crime Data'
    }
    earthquakeRisk?: {
      earthquakeRisk: number    // 0-10 scale
      riskLevel: string         // Low, Moderate, High, Very High
      peakGroundAcceleration?: number  // PGA in g
      seismicZone: number       // 1-4
      description?: string
      enrichmentSource: 'USGS Earthquake Hazards Program'
    }
    wildfireRisk?: {
      wildfireRisk: number      // 0-10 scale
      riskLevel: string         // Low, Moderate, High, Very High
      wuiZone: string          // Wildland-Urban Interface zone
      fireDangerIndex: number   // 0-100
      description?: string
      enrichmentSource: 'USGS Wildfire Risk to Communities'
    }
    lastAssessed?: string
  }

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
    // NHTSA enriched fields
    bodyClass?: string
    fuelType?: string
    doors?: number
    manufacturer?: string
    plantCity?: string
    plantState?: string
    vehicleType?: string
    gvwr?: string
    abs?: boolean
    esc?: boolean
    enriched?: boolean
    enrichmentSource?: string
    enrichmentError?: string
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
  propertyAddress?: string  // Full property/insured address (may differ from mailing address)

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
    
    // 🔍 DEBUG: Log current profile state
    console.log('[Profile Update] Current profile from localStorage:', {
      hasVehicles: !!current.vehicles,
      vehiclesEnriched: current.vehicles?.some(v => v.enriched),
      hasAddressEnrichment: !!current.addressEnrichment,
      addressEnriched: current.addressEnrichment?.enriched,
      hasEmailEnrichment: !!current.emailEnrichment,
      emailVerified: current.emailEnrichment?.verified
    })
    console.log('[Profile Update] Incoming updates:', {
      hasVehicles: !!updates.vehicles,
      hasAddress: !!(updates.address || updates.city || updates.state || updates.zipCode),
      hasEmail: !!updates.email,
      driversCount: updates.driversCount
    })
    
    // Smart merge for vehicles - preserve enriched NHTSA data
    if (current.vehicles && current.vehicles.some(v => v.enriched)) {
      console.log('[Profile Update] ✓ Enriched vehicles detected, applying protection...')
      // If we have enriched vehicles, protect them
      if (updates.vehicles && updates.vehicles.length > 0) {
        console.log('[Profile Update] Merging vehicle updates...')
        // Merge with enriched data
        updates.vehicles = updates.vehicles.map((updatedVehicle, index) => {
          const currentVehicle = current.vehicles?.[index]
          
          // If vehicle was enriched, preserve all enriched fields
          if (currentVehicle?.enriched) {
            console.log(`[Profile Update] Vehicle ${index}: Preserving enriched data`)
            return {
              ...currentVehicle, // Keep all enriched data (locked)
              primaryUse: updatedVehicle.primaryUse ?? currentVehicle.primaryUse, // ✏️ Editable
              annualMileage: updatedVehicle.annualMileage ?? currentVehicle.annualMileage, // ✏️ Editable
            }
          }
          
          // Otherwise, use the new vehicle data as-is
          console.log(`[Profile Update] Vehicle ${index}: Using new data (not enriched)`)
          return updatedVehicle
        })
      } else {
        // 🔒 CRITICAL: Don't let empty updates wipe out enriched vehicles!
        // Explicitly preserve the existing enriched vehicles
        console.log('[Profile Update] ⚠️ No vehicles in update, preserving existing enriched vehicles')
        updates.vehicles = current.vehicles
      }
    } else {
      console.log('[Profile Update] No enriched vehicles, allowing update')
    }
    
    // Smart merge for address - preserve OpenCage enriched address data
    if (current.addressEnrichment?.enriched) {
      console.log('[Profile Update] ✓ Enriched address detected, applying protection...')
      // 🔒 CRITICAL: Explicitly preserve enriched address fields
      // Don't allow ANY updates to overwrite OpenCage-verified address
      console.log('[Profile Update] ⚠️ Preserving OpenCage-verified address fields')
      updates.address = current.address
      updates.city = current.city
      updates.state = current.state
      updates.zipCode = current.zipCode
      // ALWAYS preserve the existing enrichment
      updates.addressEnrichment = current.addressEnrichment
    } else if (current.addressEnrichment && !updates.addressEnrichment) {
      // Even if not fully enriched, preserve any existing addressEnrichment data
      updates.addressEnrichment = current.addressEnrichment
    }
    
    // Smart merge for email - preserve Hunter.io enriched email data
    if (current.emailEnrichment?.verified) {
      console.log('[Profile Update] ✓ Enriched email detected, applying protection...')
      // 🔒 CRITICAL: Explicitly preserve Hunter.io-verified email
      console.log('[Profile Update] ⚠️ Preserving Hunter.io-verified email')
      updates.email = current.email
      // ALWAYS preserve the existing enrichment
      updates.emailEnrichment = current.emailEnrichment
    } else if (current.emailEnrichment && !updates.emailEnrichment) {
      // Preserve any existing emailEnrichment data
      updates.emailEnrichment = current.emailEnrichment
    }
    
    // Smart merge for drivers - preserve existing driver data, allow age/DOB updates
    if (current.drivers && current.drivers.length > 0) {
      if (updates.drivers && updates.drivers.length > 0) {
        // Merge driver updates
        updates.drivers = updates.drivers.map((updatedDriver, index) => {
          const currentDriver = current.drivers?.[index]
          
          if (currentDriver) {
            return {
              ...currentDriver, // Keep existing driver data
              age: updatedDriver.age ?? currentDriver.age, // ✏️ Editable
              dateOfBirth: updatedDriver.dateOfBirth ?? currentDriver.dateOfBirth, // ✏️ Editable
              yearsLicensed: updatedDriver.yearsLicensed ?? currentDriver.yearsLicensed, // ✏️ Editable
              violations: updatedDriver.violations ?? currentDriver.violations, // ✏️ Editable
              accidents: updatedDriver.accidents ?? currentDriver.accidents, // ✏️ Editable
            }
          }
          
          // New driver, use as-is
          return updatedDriver
        })
      } else {
        // Don't overwrite existing drivers with empty/undefined drivers
        delete updates.drivers
      }
    }
    
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
  
  // Load current profile once at the start to check for enriched data
  const currentProfile = profileManager.loadProfile()
  const hasEnrichedVehicles = currentProfile?.vehicles?.some(v => v.enriched)
  const hasExistingDrivers = currentProfile?.drivers && currentProfile.drivers.length > 0
  const hasEnrichedAddress = currentProfile?.addressEnrichment?.enriched
  const hasEnrichedEmail = currentProfile?.emailEnrichment?.verified

  messages.forEach(message => {
    const content = message.content || ''
    const contentLower = content.toLowerCase()

    // Extract age
    const ageMatch = content.match(/\b(\d{1,2})\s*(?:years?\s*old|yo)\b/i) ||
                     content.match(/(?:age|I'm|I am)\s*(\d{1,2})\b/i)
    if (ageMatch && !extracted.age) {
      extracted.age = ageMatch[1]
    }

    // Extract ZIP code - skip if address is already enriched by OpenCage
    const zipMatch = content.match(/\b(\d{5})\b/)
    if (zipMatch && !extracted.zipCode && !hasEnrichedAddress) {
      extracted.zipCode = zipMatch[1]
    }

    // Extract email - skip if already enriched by Hunter.io
    const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i)
    if (emailMatch && !extracted.email && !hasEnrichedEmail) {
      extracted.email = emailMatch[0]
      // Mark for verification (will be handled in chat API)
      extracted._emailNeedsVerification = true
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
    // NOTE: Skip extraction if vehicles are already enriched - we don't want to overwrite NHTSA data
    const vehicleMatch = content.match(/(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9\-]+)/i)
    if (vehicleMatch && !hasEnrichedVehicles) {
      // Only extract if no enriched vehicles exist
      if (!extracted.vehicles) {
        extracted.vehicles = []
      }
      const year = parseInt(vehicleMatch[1])
      const make = vehicleMatch[2]
      const model = vehicleMatch[3]

      // Check if this vehicle isn't already in the array (case-insensitive)
      const exists = extracted.vehicles.some(v =>
        v.year === year &&
        v.make?.toLowerCase() === make.toLowerCase() &&
        v.model?.toLowerCase() === model.toLowerCase()
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