// Configuration Types
export interface AgeBracket {
  min: number
  max: number
  multiplier: number
  description?: string
}

export interface CreditTier {
  multiplier: number
  range: string
  description: string
}

export interface Discount {
  type: string
  value: number
  description: string
  applies: string[]
  requirements?: string[]
}

export interface CarrierConfig {
  id: string
  name: string
  displayName: string
  logo: string
  marketShare: number
  rating: string
  enabled: boolean
  website: string
  phone: string
  adjustments: {
    profileTypes: Record<string, number>
    regions: Record<string, number>
  }
  discounts: Discount[]
  variance: {
    enabled: boolean
    range: number
  }
  eligibility?: {
    requiresMilitary?: boolean
    description?: string
  }
  strengths: string[]
  bestFor: string[]
}

export interface BaseRatesConfig {
  auto: {
    stateAverages: Record<string, number>
    coverageLevels: Record<string, number>
    deductibles: Record<string, number>
  }
  home: {
    stateAverages: Record<string, number>
    coverageLevels: Record<string, number>
  }
  renters: {
    stateAverages: Record<string, number>
  }
  life: {
    baseMonthly: Record<string, number>
  }
  disability: {
    baseMonthly: number
  }
  lastUpdated: string
  source: string
}

export interface VehicleFactors {
  vehicleTypes: Record<string, number>
  vehicleAge: Record<string, number>
  safetyRating: Record<string, number>
  theftRating: Record<string, number>
  annualMileage: Record<string, number>
  violations: Record<string, number>
}

// Compiled Configuration (optimized for runtime)
export interface CompiledConfig {
  baseRates: Map<string, number>
  ageLookup: Float32Array  // Pre-computed for ages 16-120
  creditLookup: Map<string, number>
  vehicleTypeLookup: Map<string, number>
  vehicleAgeLookup: Map<string, number>
  mileageLookup: Map<string, number>
  violationLookup: Map<string, number>
  carriers: Map<string, CarrierConfig>
  coverageLevels: Map<string, number>
  deductibles: Map<string, number>
}

// Quote Request & Response
export interface QuoteRequest {
  // Required
  state: string
  insuranceType: 'auto' | 'home' | 'renters' | 'life' | 'disability'
  
  // Auto-specific
  age?: number
  creditTier?: string
  vehicleType?: string
  vehicleYear?: number
  coverageLevel?: string
  deductible?: number
  violations?: number
  annualMileage?: number
  zipCode?: string
  
  // Home/Renters-specific
  homeValue?: number
  yearBuilt?: number
  squareFootage?: number
  
  // Life-specific
  healthStatus?: string
  lifeInsuranceType?: 'term-20' | 'term-30' | 'whole'
  
  // Disability-specific
  occupation?: string
  annualIncome?: number
  
  // Profile flags
  isMilitary?: boolean
  isHomeowner?: boolean
  bundleHome?: boolean
}

export interface Quote {
  carrierId: string
  carrierName: string
  logo: string
  rating: string
  monthlyPremium: number
  annualPremium: number
  website: string
  phone: string
  discounts: Array<{
    name: string
    amount: number
  }>
  coverages?: Array<{
    name: string
    limit: string
    deductible?: string
  }>
  strengths: string[]
  bestFor: string[]
  savings?: number
}

export interface QuoteEngineResult {
  quotes: Quote[]
  meta: {
    calculationTime: number
    requestId: string
    carriersEvaluated: number
  }
}

