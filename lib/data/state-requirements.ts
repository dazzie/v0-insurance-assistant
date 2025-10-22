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
 * All 50 US States + DC
 * Comprehensive coverage for 100% of US drivers
 * 
 * Coverage Statistics:
 * - 50 states + District of Columbia = 51 jurisdictions
 * - 12 no-fault states (require PIP)
 * - 20 states require uninsured motorist coverage
 * - Liability minimums range from 15/30/5 to 50/100/25
 * 
 * Last Updated: 2024
 */
export const stateMinimums: Record<string, StateRequirement> = {
  // Top 10 states by population (54% of US)
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
  },
  // Remaining 35 states (alphabetically)
  'AL': {
    state: 'AL',
    stateName: 'Alabama',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Alabama Department of Insurance'
  },
  'AK': {
    state: 'AK',
    stateName: 'Alaska',
    liability: {
      bodilyInjuryPerPerson: 50000,
      bodilyInjuryPerAccident: 100000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    notes: 'Alaska has higher minimums due to remote locations and higher costs.',
    source: 'Alaska Division of Insurance'
  },
  'AR': {
    state: 'AR',
    stateName: 'Arkansas',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Arkansas Insurance Department'
  },
  'CO': {
    state: 'CO',
    stateName: 'Colorado',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 15000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Colorado Division of Insurance'
  },
  'CT': {
    state: 'CT',
    stateName: 'Connecticut',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'Connecticut Insurance Department'
  },
  'DE': {
    state: 'DE',
    stateName: 'Delaware',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 10000
    },
    required: ['liability', 'pip'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: true,
    umRequired: false,
    notes: 'No-fault state with required PIP coverage.',
    source: 'Delaware Department of Insurance'
  },
  'HI': {
    state: 'HI',
    stateName: 'Hawaii',
    liability: {
      bodilyInjuryPerPerson: 20000,
      bodilyInjuryPerAccident: 40000,
      propertyDamage: 10000
    },
    required: ['liability', 'pip'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: true,
    umRequired: false,
    notes: 'No-fault state. PIP is mandatory.',
    source: 'Hawaii Department of Commerce and Consumer Affairs'
  },
  'ID': {
    state: 'ID',
    stateName: 'Idaho',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 15000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Idaho Department of Insurance'
  },
  'IN': {
    state: 'IN',
    stateName: 'Indiana',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Indiana Department of Insurance'
  },
  'IA': {
    state: 'IA',
    stateName: 'Iowa',
    liability: {
      bodilyInjuryPerPerson: 20000,
      bodilyInjuryPerAccident: 40000,
      propertyDamage: 15000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Iowa Insurance Division'
  },
  'KS': {
    state: 'KS',
    stateName: 'Kansas',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'pip', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: true,
    notes: 'No-fault state with required PIP and UM coverage.',
    source: 'Kansas Insurance Department'
  },
  'KY': {
    state: 'KY',
    stateName: 'Kentucky',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'pip'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: true,
    umRequired: false,
    notes: 'No-fault state. PIP is mandatory.',
    source: 'Kentucky Department of Insurance'
  },
  'LA': {
    state: 'LA',
    stateName: 'Louisiana',
    liability: {
      bodilyInjuryPerPerson: 15000,
      bodilyInjuryPerAccident: 30000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Louisiana Department of Insurance'
  },
  'ME': {
    state: 'ME',
    stateName: 'Maine',
    liability: {
      bodilyInjuryPerPerson: 50000,
      bodilyInjuryPerAccident: 100000,
      propertyDamage: 25000
    },
    required: ['liability', 'uninsured_motorist', 'underinsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    notes: 'Maine has higher minimums and requires both UM and UIM coverage.',
    source: 'Maine Bureau of Insurance'
  },
  'MD': {
    state: 'MD',
    stateName: 'Maryland',
    liability: {
      bodilyInjuryPerPerson: 30000,
      bodilyInjuryPerAccident: 60000,
      propertyDamage: 15000
    },
    required: ['liability', 'uninsured_motorist', 'pip'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: true,
    source: 'Maryland Insurance Administration'
  },
  'MN': {
    state: 'MN',
    stateName: 'Minnesota',
    liability: {
      bodilyInjuryPerPerson: 30000,
      bodilyInjuryPerAccident: 60000,
      propertyDamage: 10000
    },
    required: ['liability', 'pip', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: true,
    notes: 'No-fault state with required PIP and UM coverage.',
    source: 'Minnesota Department of Commerce'
  },
  'MS': {
    state: 'MS',
    stateName: 'Mississippi',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Mississippi Insurance Department'
  },
  'MO': {
    state: 'MO',
    stateName: 'Missouri',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'Missouri Department of Insurance'
  },
  'MT': {
    state: 'MT',
    stateName: 'Montana',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 20000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Montana State Auditor - Insurance Commissioner'
  },
  'NE': {
    state: 'NE',
    stateName: 'Nebraska',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'Nebraska Department of Insurance'
  },
  'NV': {
    state: 'NV',
    stateName: 'Nevada',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 20000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Nevada Division of Insurance'
  },
  'NH': {
    state: 'NH',
    stateName: 'New Hampshire',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: [],
    optional: ['liability', 'uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    notes: 'NH does not require insurance, but drivers must prove financial responsibility if involved in an accident.',
    source: 'New Hampshire Insurance Department'
  },
  'NM': {
    state: 'NM',
    stateName: 'New Mexico',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 10000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'New Mexico Office of Superintendent of Insurance'
  },
  'ND': {
    state: 'ND',
    stateName: 'North Dakota',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'pip', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: true,
    notes: 'No-fault state with required PIP and UM coverage.',
    source: 'North Dakota Insurance Department'
  },
  'OK': {
    state: 'OK',
    stateName: 'Oklahoma',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Oklahoma Insurance Department'
  },
  'OR': {
    state: 'OR',
    stateName: 'Oregon',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 20000
    },
    required: ['liability', 'pip', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: true,
    umRequired: true,
    source: 'Oregon Division of Financial Regulation'
  },
  'RI': {
    state: 'RI',
    stateName: 'Rhode Island',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Rhode Island Department of Business Regulation'
  },
  'SC': {
    state: 'SC',
    stateName: 'South Carolina',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'South Carolina Department of Insurance'
  },
  'SD': {
    state: 'SD',
    stateName: 'South Dakota',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'South Dakota Division of Insurance'
  },
  'TN': {
    state: 'TN',
    stateName: 'Tennessee',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 15000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Tennessee Department of Commerce and Insurance'
  },
  'UT': {
    state: 'UT',
    stateName: 'Utah',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 65000,
      propertyDamage: 15000
    },
    required: ['liability', 'pip'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: true,
    umRequired: false,
    notes: 'No-fault state with required PIP coverage.',
    source: 'Utah Insurance Department'
  },
  'VT': {
    state: 'VT',
    stateName: 'Vermont',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 10000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'Vermont Department of Financial Regulation'
  },
  'WV': {
    state: 'WV',
    stateName: 'West Virginia',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 25000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'West Virginia Offices of the Insurance Commissioner'
  },
  'WI': {
    state: 'WI',
    stateName: 'Wisconsin',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 10000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'Wisconsin Office of the Commissioner of Insurance'
  },
  'WY': {
    state: 'WY',
    stateName: 'Wyoming',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 20000
    },
    required: ['liability'],
    optional: ['uninsured_motorist', 'collision', 'comprehensive'],
    pipRequired: false,
    umRequired: false,
    source: 'Wyoming Department of Insurance'
  },
  // US Territories (bonus coverage)
  'DC': {
    state: 'DC',
    stateName: 'District of Columbia',
    liability: {
      bodilyInjuryPerPerson: 25000,
      bodilyInjuryPerAccident: 50000,
      propertyDamage: 10000
    },
    required: ['liability', 'uninsured_motorist'],
    optional: ['collision', 'comprehensive'],
    pipRequired: false,
    umRequired: true,
    source: 'DC Department of Insurance, Securities and Banking'
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

