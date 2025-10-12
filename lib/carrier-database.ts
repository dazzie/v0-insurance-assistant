export interface InsuranceCarrier {
  id: string
  name: string
  types: string[]
  rating: {
    amBest: string
    moodys?: string
    sp?: string
  }
  marketShare: number
  strengths: string[]
  coverage: {
    states: string[]
    nationwide: boolean
  }
  products: {
    auto?: {
      features: string[]
      discounts: string[]
    }
    home?: {
      features: string[]
      discounts: string[]
    }
    life?: {
      features: string[]
      types: string[]
    }
    health?: {
      features: string[]
      networks: string[]
    }
    disability?: {
      features: string[]
      benefits: string[]
    }
  }
  contact: {
    phone: string
    website: string
    hasLocalAgents: boolean
  }
  founded: number
  headquarters: string
}

export const INSURANCE_CARRIERS: InsuranceCarrier[] = [
  {
    id: "state-farm",
    name: "State Farm",
    types: ["auto", "home", "life", "health", "disability"],
    rating: {
      amBest: "A++",
      moodys: "Aa3",
      sp: "AA",
    },
    marketShare: 18.5,
    strengths: ["Largest agent network", "Strong customer service", "Bundling discounts", "Local presence"],
    coverage: {
      states: ["ALL"],
      nationwide: true,
    },
    products: {
      auto: {
        features: ["Accident forgiveness", "Drive Safe & Save", "Rideshare coverage"],
        discounts: ["Good driver", "Multi-car", "Student", "Anti-theft"],
      },
      home: {
        features: ["Replacement cost coverage", "Personal property protection", "Liability coverage"],
        discounts: ["Multi-policy", "Home security", "Claims-free"],
      },
      life: {
        features: ["No medical exam options", "Accelerated death benefit", "Conversion options"],
        types: ["Term", "Whole", "Universal"],
      },
    },
    contact: {
      phone: "1-800-STATE-FARM",
      website: "statefarm.com",
      hasLocalAgents: true,
    },
    founded: 1922,
    headquarters: "Bloomington, IL",
  },
  {
    id: "geico",
    name: "GEICO",
    types: ["auto", "home", "life", "disability"],
    rating: {
      amBest: "A++",
      sp: "AA+",
    },
    marketShare: 14.2,
    strengths: ["Low rates", "Digital experience", "24/7 service", "Fast claims"],
    coverage: {
      states: ["ALL"],
      nationwide: true,
    },
    products: {
      auto: {
        features: ["DriveEasy app", "Emergency roadside service", "Mechanical breakdown coverage"],
        discounts: ["Federal employee", "Military", "Good student", "Multi-policy"],
      },
      home: {
        features: ["Guaranteed replacement cost", "Personal property coverage", "Additional living expenses"],
        discounts: ["Multi-policy", "Protective devices", "Claims-free"],
      },
      life: {
        features: ["No medical exam up to $300k", "Accelerated underwriting", "Online application"],
        types: ["Term", "Whole"],
      },
    },
    contact: {
      phone: "1-800-GEICO",
      website: "geico.com",
      hasLocalAgents: false,
    },
    founded: 1936,
    headquarters: "Chevy Chase, MD",
  },
  {
    id: "progressive",
    name: "Progressive",
    types: ["auto", "home", "life", "disability"],
    rating: {
      amBest: "A+",
      sp: "AA-",
    },
    marketShare: 13.8,
    strengths: ["Usage-based insurance", "Comparison shopping", "Innovation", "Snapshot program"],
    coverage: {
      states: ["ALL"],
      nationwide: true,
    },
    products: {
      auto: {
        features: ["Snapshot telematics", "Name Your Price tool", "Pet injury coverage"],
        discounts: ["Snapshot", "Multi-policy", "Online quote", "Continuous coverage"],
      },
      home: {
        features: ["HomeQuote Explorer", "Personal property coverage", "Loss of use coverage"],
        discounts: ["Multi-policy", "Protective devices", "Claims-free"],
      },
    },
    contact: {
      phone: "1-800-PROGRESSIVE",
      website: "progressive.com",
      hasLocalAgents: true,
    },
    founded: 1937,
    headquarters: "Mayfield Village, OH",
  },
  {
    id: "allstate",
    name: "Allstate",
    types: ["auto", "home", "life", "disability"],
    rating: {
      amBest: "A+",
      moodys: "A2",
      sp: "A+",
    },
    marketShare: 10.1,
    strengths: ["Drivewise program", "Claim satisfaction", "Local agents", "Bundling options"],
    coverage: {
      states: ["ALL"],
      nationwide: true,
    },
    products: {
      auto: {
        features: ["Drivewise safe driving program", "Accident forgiveness", "New car replacement"],
        discounts: ["Safe driving", "Multi-policy", "Anti-theft", "Good student"],
      },
      home: {
        features: ["Claim RateGuard", "Green improvement discount", "Identity theft coverage"],
        discounts: ["Multi-policy", "Protective devices", "Loyalty"],
      },
      life: {
        features: ["Accelerated underwriting", "Living benefits", "Flexible premiums"],
        types: ["Term", "Whole", "Universal"],
      },
    },
    contact: {
      phone: "1-800-ALLSTATE",
      website: "allstate.com",
      hasLocalAgents: true,
    },
    founded: 1931,
    headquarters: "Northfield Township, IL",
  },
  {
    id: "usaa",
    name: "USAA",
    types: ["auto", "home", "life", "health", "disability"],
    rating: {
      amBest: "A++",
      moodys: "Aa2",
      sp: "AA+",
    },
    marketShare: 6.2,
    strengths: ["Military focus", "Customer satisfaction", "Comprehensive coverage", "Digital tools"],
    coverage: {
      states: ["ALL"],
      nationwide: true,
    },
    products: {
      auto: {
        features: ["SafePilot program", "Accident forgiveness", "Military deployment discount"],
        discounts: ["Military", "Safe driving", "Multi-vehicle", "Loyalty"],
      },
      home: {
        features: ["Guaranteed replacement cost", "Personal property coverage", "Military clause"],
        discounts: ["Multi-policy", "Protective devices", "Military"],
      },
      life: {
        features: ["No medical exam options", "Military benefits", "Accelerated death benefit"],
        types: ["Term", "Whole", "Universal"],
      },
    },
    contact: {
      phone: "1-800-USAA",
      website: "usaa.com",
      hasLocalAgents: false,
    },
    founded: 1922,
    headquarters: "San Antonio, TX",
  },
  {
    id: "liberty-mutual",
    name: "Liberty Mutual",
    types: ["auto", "home", "life", "disability"],
    rating: {
      amBest: "A",
      moodys: "A3",
      sp: "A",
    },
    marketShare: 5.8,
    strengths: ["Customizable coverage", "Accident forgiveness", "New car replacement", "RightTrack program"],
    coverage: {
      states: ["ALL"],
      nationwide: true,
    },
    products: {
      auto: {
        features: ["RightTrack safe driving program", "Accident forgiveness", "New car replacement"],
        discounts: ["Multi-policy", "Good student", "Hybrid vehicle", "Anti-theft"],
      },
      home: {
        features: ["Replacement cost coverage", "Personal property protection", "Water backup coverage"],
        discounts: ["Multi-policy", "Protective devices", "Claims-free"],
      },
    },
    contact: {
      phone: "1-800-LIBERTY",
      website: "libertymutual.com",
      hasLocalAgents: true,
    },
    founded: 1912,
    headquarters: "Boston, MA",
  },
  {
    id: "farmers",
    name: "Farmers Insurance",
    types: ["auto", "home", "life", "disability"],
    rating: {
      amBest: "A",
      sp: "A+",
    },
    marketShare: 4.9,
    strengths: ["Local agents", "Claims handling", "Bundling discounts", "Signal app"],
    coverage: {
      states: ["ALL"],
      nationwide: true,
    },
    products: {
      auto: {
        features: ["Signal safe driving app", "Accident forgiveness", "Rideshare coverage"],
        discounts: ["Multi-policy", "Good driver", "Student", "Anti-theft"],
      },
      home: {
        features: ["Guaranteed replacement cost", "Personal property coverage", "Identity theft coverage"],
        discounts: ["Multi-policy", "Protective devices", "Claims-free"],
      },
    },
    contact: {
      phone: "1-800-FARMERS",
      website: "farmers.com",
      hasLocalAgents: true,
    },
    founded: 1928,
    headquarters: "Woodland Hills, CA",
  },
  {
    id: "nationwide",
    name: "Nationwide",
    types: ["auto", "home", "life", "health", "disability"],
    rating: {
      amBest: "A+",
      moodys: "A2",
      sp: "A+",
    },
    marketShare: 4.1,
    strengths: ["SmartRide program", "Vanishing deductible", "On Your Side service", "Pet insurance"],
    coverage: {
      states: ["ALL"],
      nationwide: true,
    },
    products: {
      auto: {
        features: ["SmartRide telematics", "Accident forgiveness", "Gap coverage"],
        discounts: ["Multi-policy", "Good student", "Anti-theft", "Defensive driving"],
      },
      home: {
        features: ["Brand New Belongings", "Vanishing deductible", "Personal property coverage"],
        discounts: ["Multi-policy", "Protective devices", "Claims-free"],
      },
      life: {
        features: ["No medical exam options", "Accelerated death benefit", "Flexible premiums"],
        types: ["Term", "Whole", "Universal"],
      },
    },
    contact: {
      phone: "1-800-NATIONWIDE",
      website: "nationwide.com",
      hasLocalAgents: true,
    },
    founded: 1926,
    headquarters: "Columbus, OH",
  },
]

export const carriers = INSURANCE_CARRIERS

export function getCarriersByType(insuranceType: string): InsuranceCarrier[] {
  return INSURANCE_CARRIERS.filter((carrier) => carrier.types.includes(insuranceType.toLowerCase()))
}

export function getCarriersByState(state: string): InsuranceCarrier[] {
  return INSURANCE_CARRIERS.filter(
    (carrier) =>
      carrier.coverage.nationwide ||
      (carrier.coverage.states && carrier.coverage.states.includes("ALL")) ||
      (carrier.coverage.states && carrier.coverage.states.includes(state.toUpperCase())),
  )
}

export function getTopCarriers(limit = 5): InsuranceCarrier[] {
  return INSURANCE_CARRIERS.sort((a, b) => b.marketShare - a.marketShare).slice(0, limit)
}

export function searchCarriers(query: string): InsuranceCarrier[] {
  const searchTerm = query.toLowerCase()
  return INSURANCE_CARRIERS.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(searchTerm) ||
      carrier.types.some((type) => type.includes(searchTerm)) ||
      carrier.strengths.some((strength) => strength.toLowerCase().includes(searchTerm)),
  )
}

export function getCarrierById(id: string): InsuranceCarrier | undefined {
  return INSURANCE_CARRIERS.find((carrier) => carrier.id === id)
}
