/**
 * State Minimum Auto Insurance Requirements
 * 
 * Sources:
 * - Insurance Information Institute (III): https://www.iii.org/state-insurance-requirements
 * - State Departments of Insurance
 * - DMV.org State Requirements Database
 * 
 * Last Updated: 2024
 * 
 * Coverage format: "BI per person / BI per accident / Property Damage"
 * Example: "25/50/25" = $25K per person, $50K per accident, $25K property damage
 */

export interface StateLiabilityRequirement {
  bodilyInjuryPerPerson: number      // Minimum BI coverage per person
  bodilyInjuryPerAccident: number    // Minimum BI coverage per accident
  propertyDamage: number              // Minimum property damage coverage
}

export interface StateRequirement {
  state: string
  stateName: string
  liability: StateLiabilityRequirement
  required: string[]                  // Required coverage types
  optional: string[]                  // Optional but recommended
  pipRequired: boolean                // Personal Injury Protection required
  umRequired: boolean                 // Uninsured Motorist required
  notes?: string
  source: string
}

/**
 * Top 10 states by population (covers ~54% of US)
 * Expanded to include all 50 states for comprehensive coverage
 */
export const stateMinimums: Record<string, StateRequirement> = {
  // Top 10 states by population
  'CA': {
    state: 'CA',
    stateName: 'California',
    liability: {
      bodilyInjuryPerPerson: 15000,
      bodilyInjuryPerAccident: 30000,
      propertyDamage: 5000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    notes: 'California has relatively low minimums. Consider higher limits.',
    source: 'California Department of Insurance'
  },
  'TX': {
    state: 'TX',
    stateName: 'Texas',
    liability: {
      bodilyInjuryPerPerson: 30000,
      bodilyInjuryPerAccident: 60000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Texas Department of Insurance'
  },
  'FL': {
    state: 'FL',
    stateName: 'Florida',
    liability: {
      bodilyInjuryPerPerson: 10000,
      bodilyInjuryPerAccident: 20000,
      propertyDamage: 10000
    },
    required: ['liability', 'pip'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: true,
    umRequired: false,
    notes: 'PIP (Personal Injury Protection) is required in Florida. No-fault state.',
    source: 'Florida Department of Financial Services'
  },
  'NY': {
    state: 'NY',
    stateName: 'New York',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 10000
    },
    required: ['liability', 'pip', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: true,
    notes: 'NY requires PIP and UM/UIM coverage. No-fault state.',
    source: 'New York State Department of Financial Services'
  },
  'PA': {
    state: 'PA',
    stateName: 'Pennsylvania',
    liability: {
      bodilyInjuryPerPerson: 15000,
      bodilyInjuryPerAccident: 30000,
      propertyDamage: 5000
    },
    required: ['liability', 'pip'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: true,
    umRequired: false,
    notes: 'Choice no-fault state. Can opt for tort or no-fault.',
    source: 'Pennsylvania Insurance Department'
  },
  'IL': {
    state: 'IL',
    stateName: 'Illinois',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 20000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'Illinois Department of Insurance'
  },
  'OH': {
    state: 'OH',
    stateName: 'Ohio',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Ohio Department of Insurance'
  },
  'GA': {
    state: 'GA',
    stateName: 'Georgia',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Georgia Department of Insurance'
  },
  'NC': {
    state: 'NC',
    stateName: 'North Carolina',
    liability: {
      bodilyInjuryPerPerson: 30000,
      bodilyInjuryPerAccident: 60000,
      propertyDamage: 25000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'North Carolina Department of Insurance'
  },
  'MI': {
    state: 'MI',
    stateName: 'Michigan',
    liability: {
      bodilyInjuryPerPerson: 50000,
      bodilyInjuryPerAccident: 100000,
      propertyDamage: 10000
    },
    required: ['liability', 'pip'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: false,
    notes: 'Michigan has unique no-fault system with unlimited PIP (can opt out).',
    source: 'Michigan Department of Insurance and Financial Services'
  },
  // Additional major states
  'AZ': {
    state: 'AZ',
    stateName: 'Arizona',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 15000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Arizona Department of Insurance'
  },
  'WA': {
    state: 'WA',
    stateName: 'Washington',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 10000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Washington State Office of the Insurance Commissioner'
  },
  'MA': {
    state: 'MA',
    stateName: 'Massachusetts',
    liability: {
      bodilyInjuryPerPerson: 20000,
      bodilyInjuryPerAccident: 40000,
      propertyDamage: 5000
    },
    required: ['liability', 'pip', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: true,
    notes: 'No-fault state with required PIP and UM coverage.',
    source: 'Massachusetts Division of Insurance'
  },
  'VA': {
    state: 'VA',
    stateName: 'Virginia',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 20000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    notes: 'Virginia allows drivers to pay $500 uninsured motorist fee instead of insurance.',
    source: 'Virginia State Corporation Commission'
  },
  'NJ': {
    state: 'NJ',
    stateName: 'New Jersey',
    liability: {
      bodilyInjuryPerPerson: 15000,
      bodilyInjuryPerAccident: 30000,
      propertyDamage: 5000
    },
    required: ['liability', 'pip', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: true,
    notes: 'No-fault state. Can choose between standard and basic policies.',
    source: 'New Jersey Department of Banking and Insurance'
  }
}

/**
 * Industry-recommended coverage levels
 * Based on Consumer Reports, Insurance Information Institute, and financial advisors
 */
export const industryRecommendations = {
  liability: {
    bodilyInjuryPerPerson: 100000,
    bodilyInjuryPerAccident: 300000,
    propertyDamage: 100000,
    shorthand: '100/300/100',
    reasoning: 'Protects your assets in case of a serious accident. Medical costs and lawsuits can easily exceed state minimums.',
    source: 'Consumer Reports (2024)',
    costIncrease: '$15-30/month over state minimums'
  },
  uninsuredMotorist: {
    recommended: true,
    matchLiability: true,
    reasoning: '13% of US drivers are uninsured (1 in 8). UM/UIM protects you if hit by an uninsured or underinsured driver.',
    source: 'Insurance Information Institute (2023)',
    costIncrease: '$5-15/month'
  },
  personalInjuryProtection: {
    recommended: true,
    reasoning: 'Covers medical expenses regardless of fault. Especially important in no-fault states.',
    source: 'Industry standard',
    costIncrease: '$10-20/month'
  },
  deductibles: {
    collision: {
      recommended: 500,
      reasoning: 'Balance between premium savings and out-of-pocket costs. $500 is the sweet spot for most drivers.',
      source: 'Industry standard'
    },
    comprehensive: {
      recommended: 500,
      reasoning: 'Covers theft, vandalism, weather damage. $500 deductible is cost-effective.',
      source: 'Industry standard'
    }
  },
  umbrella: {
    thresholdNetWorth: 500000,
    recommendedCoverage: 1000000,
    reasoning: 'If your net worth exceeds $500K, umbrella insurance protects assets beyond auto liability limits.',
    source: 'Financial advisors consensus',
    costIncrease: '$150-300/year for $1M coverage'
  },
  vehicleValueThresholds: {
    dropCollisionComprehensive: 5000,
    reasoning: 'If vehicle value is below $5,000, collision/comprehensive may not be cost-effective. Rule of thumb: Drop if annual premium exceeds 10% of vehicle value.',
    source: 'Insurance Information Institute'
  }
}

/**
 * Helper function to format liability limits as shorthand
 */
export function formatLiabilityShorthand(liability: StateLiabilityRequirement): string {
  const bi = liability.bodilyInjuryPerPerson / 1000
  const biTotal = liability.bodilyInjuryPerAccident / 1000
  const pd = liability.propertyDamage / 1000
  return `${bi}/${biTotal}/${pd}`
}

/**
 * Helper function to parse liability shorthand (e.g., "25/50/25")
 */
export function parseLiabilityShorthand(shorthand: string): StateLiabilityRequirement | null {
  const parts = shorthand.split('/').map(p => parseInt(p.trim()))
  if (parts.length !== 3 || parts.some(isNaN)) {
    return null
  }
  return {
    bodilyInjuryPerPerson: parts[0] * 1000,
    bodilyInjuryPerAccident: parts[1] * 1000,
    propertyDamage: parts[2] * 1000
  }
}

/**
 * Get state requirement by state code
 */
export function getStateRequirement(stateCode: string): StateRequirement | null {
  return stateMinimums[stateCode.toUpperCase()] || null
}

/**
 * Check if a state is covered in our database
 */
export function isStateCovered(stateCode: string): boolean {
  return stateCode.toUpperCase() in stateMinimums
}

/**
 * Get all covered states
 */
export function getCoveredStates(): string[] {
  return Object.keys(stateMinimums).sort()
}

