// Auto Insurance Quote Information Requirements
// This defines all the information needed to generate accurate insurance quotes

export interface AutoInsuranceNeeds {
  // Driver Information
  drivers: DriverInfo[]
  
  // Vehicle Information
  vehicles: VehicleInfo[]
  
  // Coverage Preferences
  coverage: CoveragePreferences
  
  // Driving History
  history: DrivingHistory
  
  // Current Insurance
  currentInsurance: CurrentInsurance | null
}

export interface DriverInfo {
  age: number
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  occupation?: string
  educationLevel?: 'high-school' | 'some-college' | 'bachelors' | 'masters' | 'doctorate'
  creditScore?: 'excellent' | 'good' | 'fair' | 'poor'
  yearsLicensed: number
  isPrimaryDriver: boolean
}

export interface VehicleInfo {
  year: number
  make: string
  model: string
  trim?: string
  vin?: string
  ownership: 'own' | 'lease' | 'finance'
  primaryUse: 'commute' | 'pleasure' | 'business'
  annualMileage: number
  garageZipCode: string
  parkingLocation: 'garage' | 'driveway' | 'street' | 'parking-lot'
  antiTheftDevices: string[]
  safetyFeatures: string[]
}

export interface CoveragePreferences {
  // Liability Coverage
  bodilyInjuryLiability: string // e.g., "100/300" means $100k per person, $300k per accident
  propertyDamageLiability: number // e.g., 50000 for $50k
  
  // Personal Protection
  uninsuredMotorist: string // e.g., "100/300"
  underinsuredMotorist: string // e.g., "100/300"
  medicalPayments?: number // e.g., 5000 for $5k
  personalInjuryProtection?: number // Required in some states
  
  // Vehicle Protection
  comprehensive: {
    included: boolean
    deductible?: 250 | 500 | 1000 | 1500 | 2000
  }
  collision: {
    included: boolean
    deductible?: 250 | 500 | 1000 | 1500 | 2000
  }
  
  // Additional Coverage
  roadsideAssistance: boolean
  rentalReimbursement: boolean
  gapInsurance: boolean
  customEquipmentCoverage?: number
}

export interface DrivingHistory {
  // Violations (last 5 years)
  movingViolations: {
    type: 'speeding' | 'reckless-driving' | 'dui' | 'at-fault-accident' | 'other'
    date: string
    description?: string
  }[]
  
  // Claims (last 5 years)
  claims: {
    type: 'collision' | 'comprehensive' | 'liability' | 'uninsured-motorist'
    date: string
    amount: number
    atFault: boolean
  }[]
  
  // License Status
  licenseStatus: 'valid' | 'suspended' | 'revoked' | 'expired'
  sr22Required: boolean
}

export interface CurrentInsurance {
  carrier: string
  policyStartDate: string
  currentPremium: number
  coverageLapses: boolean
  yearsWithCarrier: number
}

// Questions to ask for auto insurance needs analysis
export const AUTO_INSURANCE_QUESTIONS = {
  initial: [
    "How many drivers need to be covered?",
    "How many vehicles do you need to insure?",
    "What's your ZIP code where the vehicle(s) will be primarily kept?"
  ],
  
  driver: [
    "What's the driver's age?",
    "How many years have they been licensed?",
    "What's their marital status?",
    "Any moving violations or accidents in the past 5 years?",
    "What's their credit score range (this affects rates in most states)?"
  ],
  
  vehicle: [
    "What's the year, make, and model of the vehicle?",
    "Do you own, lease, or finance this vehicle?",
    "How many miles do you drive annually?",
    "What's the primary use (commute to work, pleasure, business)?",
    "Where do you typically park (garage, driveway, street)?"
  ],
  
  coverage: [
    "Do you want state minimum coverage or comprehensive protection?",
    "What deductible are you comfortable with ($250, $500, $1000)?",
    "Do you need rental car reimbursement?",
    "Do you want roadside assistance?",
    "Any special equipment or modifications to cover?"
  ],
  
  history: [
    "Do you currently have auto insurance?",
    "Have you had any coverage lapses in the past 6 months?",
    "Any claims filed in the past 5 years?",
    "Any tickets or violations in the past 5 years?",
    "Do you need SR-22 filing?"
  ]
}

// State-specific minimum coverage requirements
export const STATE_MINIMUM_COVERAGE: Record<string, any> = {
  CA: {
    bodilyInjuryLiability: "15/30",
    propertyDamageLiability: 5000,
    uninsuredMotorist: "15/30" // Optional but recommended
  },
  NY: {
    bodilyInjuryLiability: "25/50",
    propertyDamageLiability: 10000,
    personalInjuryProtection: 50000,
    uninsuredMotorist: "25/50"
  },
  TX: {
    bodilyInjuryLiability: "30/60",
    propertyDamageLiability: 25000
  },
  FL: {
    propertyDamageLiability: 10000,
    personalInjuryProtection: 10000
  }
  // Add more states as needed
}

// Helper function to generate quote readiness score
export function calculateQuoteReadiness(needs: Partial<AutoInsuranceNeeds>): {
  score: number
  missing: string[]
} {
  const required = []
  const missing = []
  
  // Check drivers
  if (!needs.drivers || needs.drivers.length === 0) {
    missing.push("Driver information")
  } else {
    needs.drivers.forEach((driver, index) => {
      if (!driver.age) missing.push(`Driver ${index + 1} age`)
      if (!driver.yearsLicensed) missing.push(`Driver ${index + 1} years licensed`)
      if (!driver.maritalStatus) missing.push(`Driver ${index + 1} marital status`)
    })
  }
  
  // Check vehicles
  if (!needs.vehicles || needs.vehicles.length === 0) {
    missing.push("Vehicle information")
  } else {
    needs.vehicles.forEach((vehicle, index) => {
      if (!vehicle.year) missing.push(`Vehicle ${index + 1} year`)
      if (!vehicle.make) missing.push(`Vehicle ${index + 1} make`)
      if (!vehicle.model) missing.push(`Vehicle ${index + 1} model`)
      if (!vehicle.garageZipCode) missing.push(`Vehicle ${index + 1} ZIP code`)
      if (!vehicle.annualMileage) missing.push(`Vehicle ${index + 1} annual mileage`)
    })
  }
  
  // Check coverage preferences
  if (!needs.coverage) {
    missing.push("Coverage preferences")
  }
  
  // Check driving history
  if (!needs.history) {
    missing.push("Driving history")
  }
  
  const totalFields = 15 // Approximate number of required fields
  const completedFields = totalFields - missing.length
  const score = Math.round((completedFields / totalFields) * 100)
  
  return { score, missing }
}

// Generate personalized recommendations based on profile
export function generateCoverageRecommendations(needs: Partial<AutoInsuranceNeeds>): string[] {
  const recommendations = []
  
  // Young driver analysis
  if (needs.drivers && needs.drivers.some(d => d.age && d.age < 25)) {
    recommendations.push("🚨 **YOUNG DRIVER RISK PROFILE** - Consider higher liability limits ($500K+) due to statistically higher accident rates. Look into good student discounts (up to 15% savings) and defensive driving courses.")
  }
  
  // Vehicle-specific analysis
  if (needs.vehicles && needs.vehicles.length > 0) {
    needs.vehicles.forEach(vehicle => {
      if (vehicle.year && new Date().getFullYear() - vehicle.year < 3) {
        recommendations.push(`🚗 **NEW VEHICLE (${vehicle.year} ${vehicle.make} ${vehicle.model})** - Comprehensive and collision coverage essential. Consider gap insurance if financing (covers difference between loan balance and ACV).`)
      }
      
      // Tesla/Electric vehicle analysis
      if (vehicle.make?.toLowerCase().includes('tesla') || vehicle.fuelType?.toLowerCase().includes('electric')) {
        recommendations.push(`⚡ **ELECTRIC VEHICLE RISK** - Higher repair costs (3x traditional vehicles) require higher coverage limits. Consider $1,000+ deductibles to balance premium vs. repair costs. Specialized repair facilities may increase claims processing time.`)
      }
      
      // Luxury vehicle analysis
      if (vehicle.make?.toLowerCase().includes('bmw') || vehicle.make?.toLowerCase().includes('mercedes') || 
          vehicle.make?.toLowerCase().includes('audi') || vehicle.make?.toLowerCase().includes('lexus')) {
        recommendations.push(`💎 **LUXURY VEHICLE** - Higher replacement costs require comprehensive coverage. Consider agreed value coverage for classic/collector vehicles. Higher liability limits recommended due to increased lawsuit risk.`)
      }
      
      // High mileage analysis
      if (vehicle.annualMileage && vehicle.annualMileage > 15000) {
        recommendations.push(`🛣️ **HIGH MILEAGE DRIVER** - Consider usage-based insurance (UBI) programs for potential 10-30% savings. Telematics devices track driving behavior for personalized rates.`)
      }
    })
  }
  
  // Location-based analysis
  if (needs.location) {
    const location = needs.location.toLowerCase()
    
    if (location.includes('san francisco') || location.includes('los angeles') || location.includes('new york')) {
      recommendations.push(`🏙️ **HIGH-RISK URBAN AREA** - Dense traffic and high accident rates require higher liability limits ($500K+). Consider uninsured motorist coverage due to higher uninsured driver rates.`)
    }
    
    if (location.includes('florida') || location.includes('texas')) {
      recommendations.push(`🌪️ **NATURAL DISASTER RISK** - Consider comprehensive coverage for hurricane/flood damage. Higher deductibles may be cost-effective for weather-related claims.`)
    }
    
    if (location.includes('california')) {
      recommendations.push(`🌍 **EARTHQUAKE RISK** - Consider earthquake coverage for comprehensive policies. Higher liability limits recommended due to high property values and lawsuit risk.`)
    }
  }
  
  // Driving history analysis
  if (needs.history && needs.history.movingViolations && needs.history.movingViolations.length > 0) {
    recommendations.push(`⚠️ **DRIVING VIOLATIONS** - Consider defensive driving courses (up to 10% discount). Shop around - some carriers are more forgiving of violations. Consider higher deductibles to offset premium increases.`)
  }
  
  // Age-based analysis
  if (needs.drivers && needs.drivers.some(d => d.age && d.age > 65)) {
    recommendations.push(`👴 **MATURE DRIVER** - Consider higher liability limits due to increased lawsuit risk. Look into senior discounts and defensive driving courses for additional savings.`)
  }
  
  // Income-based analysis
  if (needs.income && needs.income > 100000) {
    recommendations.push(`💰 **HIGH INCOME HOUSEHOLD** - Consider umbrella insurance ($1M+) to protect assets. Higher liability limits ($500K+) recommended to match asset protection needs.`)
  }
  
  // Home Insurance Analysis
  if (needs.insuranceType === 'home' || needs.needs?.includes('home')) {
    if (needs.homeValue && needs.location) {
      const homeValue = parseInt(needs.homeValue.replace(/[$,]/g, ''))
      const location = needs.location.toLowerCase()
      
      // High-value home analysis
      if (homeValue > 750000) {
        recommendations.push(`🏠 **HIGH-VALUE HOME ($${homeValue.toLocaleString()})** - Consider guaranteed replacement cost coverage. Standard policies may not cover full rebuild costs in high-construction-cost areas. Expected premium: $2,000-4,000/year.`)
      }
      
      // Location-based home risk analysis
      if (location.includes('san francisco') || location.includes('los angeles') || location.includes('new york')) {
        recommendations.push(`🏙️ **URBAN HOME RISK** - Higher theft/vandalism rates require comprehensive coverage. Consider higher deductibles ($2,500+) to offset premium costs. Earthquake coverage essential in CA.`)
      }
      
      if (location.includes('florida') || location.includes('texas') || location.includes('louisiana')) {
        recommendations.push(`🌪️ **HURRICANE RISK AREA** - Wind/hail coverage essential. Consider flood insurance (separate policy). Higher deductibles for wind damage may be cost-effective.`)
      }
      
      if (location.includes('california')) {
        recommendations.push(`🌍 **EARTHQUAKE RISK** - Earthquake coverage recommended (separate policy). Consider higher deductibles (10-15% of home value) due to high earthquake deductibles.`)
      }
      
      if (location.includes('colorado') || location.includes('utah') || location.includes('arizona')) {
        recommendations.push(`🏔️ **WILDFIRE RISK** - Wildfire coverage essential. Consider defensible space discounts. Higher replacement cost coverage recommended due to construction cost increases.`)
      }
      
      // Age-based home analysis
      if (needs.yearBuilt && needs.yearBuilt < 1980) {
        recommendations.push(`🏚️ **OLDER HOME (${needs.yearBuilt})** - Higher risk for electrical/plumbing issues. Consider additional coverage for code upgrades. Premium may be 20-30% higher due to age.`)
      }
      
      // Square footage analysis
      if (needs.squareFootage && needs.squareFootage > 3000) {
        recommendations.push(`📏 **LARGE HOME (${needs.squareFootage} sq ft)** - Higher replacement costs require adequate dwelling coverage. Consider inflation protection to keep up with construction costs.`)
      }
    }
  }
  
  // Renters Insurance Analysis
  if (needs.insuranceType === 'renters' || needs.needs?.includes('renters')) {
    if (needs.location) {
      const location = needs.location.toLowerCase()
      
      // Location-based renters risk
      if (location.includes('san francisco') || location.includes('los angeles') || location.includes('new york')) {
        recommendations.push(`🏙️ **URBAN RENTERS RISK** - Higher theft rates require adequate personal property coverage. Consider $50K+ personal property coverage. Liability coverage essential due to high lawsuit risk.`)
      }
      
      if (location.includes('florida') || location.includes('texas')) {
        recommendations.push(`🌪️ **HURRICANE RISK RENTERS** - Wind damage to personal property covered. Consider flood insurance for belongings (separate policy). Higher deductibles may be cost-effective.`)
      }
      
      if (location.includes('california')) {
        recommendations.push(`🌍 **EARTHQUAKE RISK RENTERS** - Earthquake coverage for personal property recommended. Consider higher deductibles due to earthquake-specific deductibles.`)
      }
      
      // Income-based renters analysis
      if (needs.income && needs.income > 50000) {
        recommendations.push(`💰 **HIGH-INCOME RENTER** - Consider higher liability limits ($300K+) to protect assets. Personal property coverage should match asset value. Expected cost: $200-400/year.`)
      }
      
      // Lifestyle-based analysis
      if (needs.income && needs.income < 30000) {
        recommendations.push(`💡 **BUDGET-CONSCIOUS RENTER** - Basic coverage essential. Consider higher deductibles to reduce premium. Look for multi-policy discounts. Expected cost: $150-250/year.`)
      }
    }
  }
  
  return recommendations
}