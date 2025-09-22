// Quote Profile Management
// Tracks all collected information and identifies missing pieces

import { extractCollectedInfo, CollectedInfo } from './information-tracker'

export interface QuoteProfile {
  // Basic Information
  basics: {
    numberOfVehicles?: number
    numberOfDrivers?: number
    zipCode?: string
    state?: string
  }
  
  // Detailed Vehicle Information
  vehicles: VehicleProfile[]
  
  // Detailed Driver Information
  drivers: DriverProfile[]
  
  // Coverage Preferences
  coverage: CoverageProfile
  
  // Insurance History
  history: HistoryProfile
  
  // Metadata
  completeness: {
    score: number
    missingRequired: string[]
    missingOptional: string[]
    readyForQuote: boolean
  }
}

export interface VehicleProfile {
  id: number
  year?: number
  make?: string
  model?: string
  trim?: string
  vin?: string
  ownership?: 'own' | 'lease' | 'finance'
  primaryUse?: 'commute' | 'pleasure' | 'business'
  annualMileage?: number
  parkingLocation?: 'garage' | 'driveway' | 'street' | 'parking-lot'
  antiTheftDevices?: string[]
  safetyFeatures?: string[]
}

export interface DriverProfile {
  id: number
  age?: number
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'
  occupation?: string
  educationLevel?: 'high-school' | 'some-college' | 'bachelors' | 'masters' | 'doctorate'
  creditScore?: 'excellent' | 'good' | 'fair' | 'poor'
  yearsLicensed?: number
  violations?: {
    hasViolations: boolean
    details?: string[]
  }
}

export interface CoverageProfile {
  currentCarrier?: string
  currentPremium?: number
  desiredCoverage?: 'minimum' | 'standard' | 'full'
  bodilyInjuryLiability?: string
  propertyDamageLiability?: number
  comprehensiveDeductible?: number
  collisionDeductible?: number
  uninsuredMotorist?: string
  medicalPayments?: number
  roadsideAssistance?: boolean
  rentalReimbursement?: boolean
  gapInsurance?: boolean
}

export interface HistoryProfile {
  currentlyInsured?: boolean
  coverageLapses?: boolean
  yearsWithCurrentCarrier?: number
  claims?: {
    hasClaims: boolean
    details?: string[]
  }
  sr22Required?: boolean
}

// Build a complete quote profile from messages
export function buildQuoteProfile(
  messages: Array<{ role: string; content: string }>,
  customerProfile: any
): QuoteProfile {
  const collectedInfo = extractCollectedInfo(messages, customerProfile)
  
  // Initialize profile
  const profile: QuoteProfile = {
    basics: {
      numberOfVehicles: collectedInfo.numberOfVehicles,
      numberOfDrivers: collectedInfo.numberOfDrivers,
      zipCode: collectedInfo.location.zipCode,
      state: collectedInfo.location.state || extractStateFromLocation(customerProfile.location)
    },
    vehicles: [],
    drivers: [],
    coverage: collectedInfo.coverage || {},
    history: {},
    completeness: {
      score: 0,
      missingRequired: [],
      missingOptional: [],
      readyForQuote: false
    }
  }
  
  // Build vehicle profiles
  if (collectedInfo.numberOfVehicles) {
    for (let i = 0; i < collectedInfo.numberOfVehicles; i++) {
      const vehicleData = collectedInfo.vehicles[i] || {}
      profile.vehicles.push({
        id: i + 1,
        ...vehicleData
      })
    }
  }
  
  // Build driver profiles
  if (collectedInfo.numberOfDrivers) {
    for (let i = 0; i < collectedInfo.numberOfDrivers; i++) {
      const driverData = collectedInfo.drivers[i] || {}
      
      // For driver 1, use customer profile age if not explicitly collected
      const driverAge = (i === 0 && !driverData.age && customerProfile.age) 
        ? parseInt(customerProfile.age) 
        : driverData.age
      
      profile.drivers.push({
        id: i + 1,
        ...driverData,
        age: driverAge,
        violations: driverData.violations !== undefined ? {
          hasViolations: driverData.violations,
          details: driverData.violationDetails
        } : undefined
      })
    }
  }
  
  // Calculate completeness
  profile.completeness = calculateCompleteness(profile)
  
  return profile
}

// Calculate profile completeness
function calculateCompleteness(profile: QuoteProfile): {
  score: number
  missingRequired: string[]
  missingOptional: string[]
  readyForQuote: boolean
} {
  const missingRequired: string[] = []
  const missingOptional: string[] = []
  
  // Check required basics
  if (!profile.basics.numberOfVehicles) {
    missingRequired.push('Number of vehicles')
  }
  if (!profile.basics.numberOfDrivers) {
    missingRequired.push('Number of drivers')
  }
  if (!profile.basics.zipCode) {
    missingRequired.push('ZIP code')
  }
  
  // Check vehicle details (required)
  profile.vehicles.forEach((vehicle, index) => {
    if (!vehicle.year) missingRequired.push(`Vehicle ${index + 1} year`)
    if (!vehicle.make) missingRequired.push(`Vehicle ${index + 1} make`)
    if (!vehicle.model) missingRequired.push(`Vehicle ${index + 1} model`)
    if (!vehicle.annualMileage) missingOptional.push(`Vehicle ${index + 1} annual mileage`)
    if (!vehicle.primaryUse) missingOptional.push(`Vehicle ${index + 1} primary use`)
  })
  
  // Check driver details (required)
  profile.drivers.forEach((driver, index) => {
    if (!driver.age) missingRequired.push(`Driver ${index + 1} age`)
    if (!driver.yearsLicensed) missingOptional.push(`Driver ${index + 1} years licensed`)
    if (!driver.maritalStatus) missingOptional.push(`Driver ${index + 1} marital status`)
    if (driver.violations === undefined) missingOptional.push(`Driver ${index + 1} violation history`)
  })
  
  // Check coverage preferences (optional)
  if (!profile.coverage.desiredCoverage) {
    missingOptional.push('Coverage level preference')
  }
  if (!profile.coverage.collisionDeductible) {
    missingOptional.push('Deductible preference')
  }
  
  // Calculate score
  const totalFields = 20 // Approximate total fields
  const requiredFields = 10 // Approximate required fields
  const collectedRequired = requiredFields - missingRequired.length
  const collectedOptional = (totalFields - requiredFields) - missingOptional.length
  
  const score = Math.round(
    ((collectedRequired / requiredFields) * 70) + 
    ((collectedOptional / (totalFields - requiredFields)) * 30)
  )
  
  const readyForQuote = missingRequired.length === 0
  
  return {
    score,
    missingRequired,
    missingOptional,
    readyForQuote
  }
}

// Generate prompts for missing information
export function getPromptsForMissingInfo(profile: QuoteProfile): string[] {
  const prompts: string[] = []
  const { missingRequired, missingOptional } = profile.completeness
  
  // Separate missing info by category
  const allMissing = [...missingRequired, ...missingOptional]
  const vehicleMissing = allMissing.filter(m => m.includes('Vehicle'))
  const driverMissing = allMissing.filter(m => m.includes('Driver') || m.includes('driver'))
  
  // Check if we're still collecting vehicle info
  const hasVehicleRequiredMissing = missingRequired.some(m => m.includes('Vehicle') || m.includes('vehicle'))
  const hasDriverRequiredMissing = missingRequired.some(m => m.includes('Driver') || m.includes('driver'))
  
  // Priority: Complete sections in order (Drivers -> Vehicles -> Coverage)
  
  // 1. Basic info first
  if (missingRequired.includes('Number of drivers')) {
    prompts.push('How many drivers will be on the policy?')
    return prompts
  }
  if (missingRequired.includes('Number of vehicles')) {
    prompts.push('How many vehicles need coverage?')
    return prompts
  }
  if (missingRequired.includes('ZIP code')) {
    prompts.push('What ZIP code will the vehicles be garaged in?')
    return prompts
  }
  
  // 2. Complete ALL driver info first (about the people)
  if (driverMissing.length > 0) {
    const firstDriverMissing = driverMissing[0]
    
    if (firstDriverMissing.includes('age')) {
      const driverNum = firstDriverMissing.match(/Driver (\d+)/)?.[1]
      prompts.push(`How old is driver ${driverNum}?`)
    } else if (firstDriverMissing.includes('years licensed')) {
      const driverNum = firstDriverMissing.match(/Driver (\d+)/)?.[1]
      prompts.push(`How many years has driver ${driverNum} been licensed?`)
    } else if (firstDriverMissing.includes('marital status')) {
      const driverNum = firstDriverMissing.match(/Driver (\d+)/)?.[1]
      prompts.push(`What is driver ${driverNum}'s marital status?`)
    } else if (firstDriverMissing.includes('violation history')) {
      const driverNum = firstDriverMissing.match(/Driver (\d+)/)?.[1]
      prompts.push(`Does driver ${driverNum} have a clean driving record?`)
    }
    return prompts
  }
  
  // 3. Then complete ALL vehicle info (after drivers)
  if (vehicleMissing.length > 0) {
    const firstVehicleMissing = vehicleMissing[0]
    
    if (firstVehicleMissing.includes('year')) {
      const vehicleNum = firstVehicleMissing.match(/Vehicle (\d+)/)?.[1]
      prompts.push(`What year is vehicle ${vehicleNum}?`)
    } else if (firstVehicleMissing.includes('make')) {
      const vehicleNum = firstVehicleMissing.match(/Vehicle (\d+)/)?.[1]
      prompts.push(`What make is vehicle ${vehicleNum}? (Toyota, Honda, Ford, etc.)`)
    } else if (firstVehicleMissing.includes('model')) {
      const vehicleNum = firstVehicleMissing.match(/Vehicle (\d+)/)?.[1]
      prompts.push(`What model is vehicle ${vehicleNum}?`)
    } else if (firstVehicleMissing.includes('annual mileage')) {
      const vehicleNum = firstVehicleMissing.match(/Vehicle (\d+)/)?.[1]
      prompts.push(`How many miles per year for vehicle ${vehicleNum}?`)
    } else if (firstVehicleMissing.includes('primary use')) {
      const vehicleNum = firstVehicleMissing.match(/Vehicle (\d+)/)?.[1]
      prompts.push(`Is vehicle ${vehicleNum} for commuting, pleasure, or business?`)
    }
    return prompts
  }
  
  // 4. Finally, coverage preferences
  if (missingOptional.includes('Coverage level preference')) {
    prompts.push('What level of coverage are you looking for?')
  } else if (missingOptional.includes('Deductible preference')) {
    prompts.push('What deductible amount would you prefer?')
  }
  
  return prompts
}

// Format profile for display
export function formatProfileSummary(profile: QuoteProfile): string {
  let summary = '## Your Quote Profile\n\n'
  
  // Basics
  const basicsComplete = !!(profile.basics.numberOfVehicles && profile.basics.numberOfDrivers && profile.basics.zipCode)
  summary += `### Basic Information ${basicsComplete ? '✅' : '🔄'}\n`
  summary += `- **Vehicles:** ${profile.basics.numberOfVehicles || 'Not specified'}\n`
  summary += `- **Drivers:** ${profile.basics.numberOfDrivers || 'Not specified'}\n`
  summary += `- **Location:** ${profile.basics.zipCode || profile.basics.state || 'Not specified'}\n\n`
  
  // Vehicles
  if (profile.vehicles.length > 0) {
    const allVehiclesComplete = profile.vehicles.every(v => v.year && v.make && v.model)
    summary += `### Vehicles ${allVehiclesComplete ? '✅' : '🔄'}\n`
    profile.vehicles.forEach((vehicle, index) => {
      const vehicleComplete = !!(vehicle.year && vehicle.make && vehicle.model)
      summary += `**Vehicle ${index + 1}** ${vehicleComplete ? '✅' : '⏳'}:\n`
      if (vehicle.year || vehicle.make || vehicle.model) {
        summary += `- ${vehicle.year || '____'} ${vehicle.make || '____'} ${vehicle.model || '____'}\n`
      }
      if (vehicle.annualMileage) {
        summary += `- ${vehicle.annualMileage} miles/year\n`
      }
      if (vehicle.primaryUse) {
        summary += `- Used for ${vehicle.primaryUse}\n`
      }
      summary += '\n'
    })
  }
  
  // Drivers
  if (profile.drivers.length > 0) {
    const allDriversComplete = profile.drivers.every(d => d.age)
    summary += `### Drivers ${allDriversComplete ? '✅' : '🔄'}\n`
    profile.drivers.forEach((driver, index) => {
      const driverComplete = !!driver.age
      summary += `**Driver ${index + 1}** ${driverComplete ? '✅' : '⏳'}:\n`
      if (driver.age) {
        summary += `- Age ${driver.age}`
        if (driver.yearsLicensed) {
          summary += `, ${driver.yearsLicensed} years licensed`
        }
        summary += '\n'
      }
      if (driver.maritalStatus) {
        summary += `- ${driver.maritalStatus}\n`
      }
      if (driver.violations) {
        summary += `- ${driver.violations.hasViolations ? 'Has violations' : 'Clean record'}\n`
      }
      summary += '\n'
    })
  }
  
  // Coverage
  if (Object.keys(profile.coverage).length > 0) {
    summary += '### Coverage Preferences\n'
    if (profile.coverage.currentCarrier) {
      summary += `- Current carrier: ${profile.coverage.currentCarrier}\n`
    }
    if (profile.coverage.desiredCoverage) {
      summary += `- Coverage level: ${profile.coverage.desiredCoverage}\n`
    }
    if (profile.coverage.collisionDeductible) {
      summary += `- Deductible: $${profile.coverage.collisionDeductible}\n`
    }
    summary += '\n'
  }
  
  // Completeness
  summary += '### Profile Completeness\n'
  summary += `- **Score:** ${profile.completeness.score}%\n`
  summary += `- **Ready for quotes:** ${profile.completeness.readyForQuote ? '✅ Yes' : '❌ No'}\n`
  
  if (profile.completeness.missingRequired.length > 0) {
    summary += `- **Missing required:** ${profile.completeness.missingRequired.length} items\n`
  }
  if (profile.completeness.missingOptional.length > 0) {
    summary += `- **Missing optional:** ${profile.completeness.missingOptional.length} items\n`
  }
  
  return summary
}

// Helper to extract state from location string
function extractStateFromLocation(location: string): string | undefined {
  const stateMatch = location.match(/\b([A-Z]{2})\b/)
  return stateMatch ? stateMatch[1] : undefined
}