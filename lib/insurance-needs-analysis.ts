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
  
  if (needs.drivers && needs.drivers.some(d => d.age && d.age < 25)) {
    recommendations.push("Consider higher liability limits due to young driver risk profile")
    recommendations.push("Look into good student discounts if applicable")
  }
  
  if (needs.vehicles && needs.vehicles.some(v => v.year && new Date().getFullYear() - v.year < 3)) {
    recommendations.push("Comprehensive and collision coverage recommended for newer vehicles")
    recommendations.push("Consider gap insurance if financing")
  }
  
  if (needs.vehicles && needs.vehicles.some(v => v.annualMileage && v.annualMileage > 15000)) {
    recommendations.push("High mileage may increase rates - consider usage-based insurance options")
  }
  
  if (needs.history && needs.history.movingViolations && needs.history.movingViolations.length > 0) {
    recommendations.push("Consider defensive driving courses to reduce rates")
    recommendations.push("Shop around - some carriers are more forgiving of violations")
  }
  
  return recommendations
}