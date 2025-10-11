import { carriers } from "@/lib/carrier-database"

export interface CarrierComparison {
  carrierName: string
  rating: number
  monthlyPremium: number
  annualPremium: number
  coverageAmount: string
  deductible: string
  features: string[]
  strengths: string[]
  nextSteps: {
    discountInquiries: string[]
    coverageDiscussion: string[]
    claimsProcess: string[]
    policyFlexibility: string[]
    actionItems: string[]
  }
  contactInfo: {
    phone: string
    website: string
    email?: string
  }
  savings?: number
  bestFor: string[]
}

export interface InsuranceTypeConfig {
  basePrice: number
  priceVariation: number
  coverageOptions: string[]
  features: string[]
  discountTypes: string[]
  claimsProcess: string[]
  policyFlexibility: string[]
}

const insuranceTypeConfigs: Record<string, InsuranceTypeConfig> = {
  "Auto": {
    basePrice: 120,
    priceVariation: 80,
    coverageOptions: ["$100,000", "$250,000", "$500,000", "$1,000,000"],
    features: [
      "24/7 Claims Support",
      "Roadside Assistance",
      "Rental Car Coverage",
      "Comprehensive Coverage",
      "Collision Coverage",
      "Uninsured Motorist Protection"
    ],
    discountTypes: [
      "Safe Driver Discount",
      "Multi-Vehicle Discount",
      "Good Student Discount",
      "Defensive Driving Course",
      "Anti-Theft Device Discount",
      "Low Mileage Discount"
    ],
    claimsProcess: [
      "Online Claims Filing",
      "Mobile App Claims",
      "Direct Repair Network",
      "Quick Settlement Process"
    ],
    policyFlexibility: [
      "Online Policy Management",
      "Easy Coverage Adjustments",
      "Flexible Payment Options",
      "Usage-Based Insurance Options"
    ]
  },
  "Home": {
    basePrice: 150,
    priceVariation: 100,
    coverageOptions: ["$200,000", "$300,000", "$500,000", "$750,000"],
    features: [
      "Dwelling Coverage",
      "Personal Property Protection",
      "Liability Coverage",
      "Additional Living Expenses",
      "Natural Disaster Coverage",
      "Home Systems Protection"
    ],
    discountTypes: [
      "New Home Discount",
      "Security System Discount",
      "Claims-Free Discount",
      "Multi-Policy Discount",
      "Renovation Discount",
      "Age of Home Discount"
    ],
    claimsProcess: [
      "24/7 Claims Hotline",
      "Online Claims Portal",
      "Emergency Response Team",
      "Preferred Contractor Network"
    ],
    policyFlexibility: [
      "Coverage Adjustments",
      "Deductible Options",
      "Payment Plans",
      "Policy Endorsements"
    ]
  },
  "Life": {
    basePrice: 50,
    priceVariation: 40,
    coverageOptions: ["$100,000", "$250,000", "$500,000", "$1,000,000"],
    features: [
      "Term Life Insurance",
      "Whole Life Options",
      "Accelerated Death Benefits",
      "Waiver of Premium",
      "Convertible Policies",
      "Family Coverage Options"
    ],
    discountTypes: [
      "Non-Smoker Discount",
      "Preferred Health Discount",
      "Multi-Policy Discount",
      "Annual Payment Discount",
      "Group Insurance Discount"
    ],
    claimsProcess: [
      "Simplified Claims Process",
      "Beneficiary Support",
      "Fast Payout Options",
      "Online Claims Filing"
    ],
    policyFlexibility: [
      "Coverage Amount Changes",
      "Beneficiary Updates",
      "Payment Frequency Options",
      "Policy Conversion Options"
    ]
  },
  "Health": {
    basePrice: 300,
    priceVariation: 200,
    coverageOptions: ["Bronze", "Silver", "Gold", "Platinum"],
    features: [
      "Preventive Care Coverage",
      "Prescription Drug Coverage",
      "Mental Health Services",
      "Emergency Care",
      "Specialist Visits",
      "Telemedicine Options"
    ],
    discountTypes: [
      "Wellness Program Discounts",
      "Non-Smoker Discounts",
      "Family Plan Discounts",
      "High Deductible Options",
      "HSA-Compatible Plans"
    ],
    claimsProcess: [
      "Online Claims Submission",
      "Mobile App Access",
      "Direct Provider Billing",
      "Claims Processing Timeline"
    ],
    policyFlexibility: [
      "Plan Changes During Open Enrollment",
      "Dependent Coverage Options",
      "Network Provider Access",
      "Coverage Tier Adjustments"
    ]
  },
  "Disability": {
    basePrice: 80,
    priceVariation: 50,
    coverageOptions: ["$1,000", "$2,000", "$3,000", "$5,000"],
    features: [
      "Short-Term Disability",
      "Long-Term Disability",
      "Own Occupation Coverage",
      "Partial Disability Benefits",
      "Rehabilitation Benefits",
      "Return to Work Incentives"
    ],
    discountTypes: [
      "Non-Smoker Discount",
      "Professional Association Discount",
      "Multi-Policy Discount",
      "Group Coverage Discount",
      "Health Screening Discount"
    ],
    claimsProcess: [
      "Medical Documentation Support",
      "Claims Specialist Assignment",
      "Benefit Calculation",
      "Appeal Process"
    ],
    policyFlexibility: [
      "Benefit Amount Adjustments",
      "Elimination Period Options",
      "Coverage Duration Changes",
      "Occupation Class Updates"
    ]
  }
}

export function generateInsuranceComparisons(
  insuranceType: string,
  customerProfile: {
    location: string
    age: number
    needs: string[]
  },
  count: number = 3
): CarrierComparison[] {
  const config = insuranceTypeConfigs[insuranceType] || insuranceTypeConfigs["Auto"]
  
  // Filter carriers that serve the location and offer the insurance type
  const relevantCarriers = carriers
    .filter(carrier => 
      carrier.states.includes(customerProfile.location.split(",")[0].trim()) &&
      carrier.products.some(product => 
        product.toLowerCase().includes(insuranceType.toLowerCase().split(" ")[0])
      )
    )
    .slice(0, count)

  return relevantCarriers.map((carrier, index) => {
    const basePrice = config.basePrice + (index * 20) + Math.random() * config.priceVariation
    const monthlyPremium = Math.round(basePrice)
    const annualPremium = Math.round(monthlyPremium * 12)
    const savings = index === 0 ? Math.round(basePrice * 0.15) : undefined

    // Generate carrier-specific content
    const generateDiscountInquiries = () => {
      const discounts = config.discountTypes.slice(0, 3)
      return discounts.map(discount => 
        `Ask about ${discount.toLowerCase()} and eligibility requirements`
      )
    }

    const generateCoverageDiscussion = () => {
      return [
        `Discuss ${insuranceType.toLowerCase()} coverage options and limits`,
        `Verify coverage for your specific needs: ${customerProfile.needs.join(", ")}`,
        `Understand policy exclusions and limitations`
      ]
    }

    const generateClaimsProcess = () => {
      return config.claimsProcess.map(process => 
        `Inquire about ${process.toLowerCase()} and response times`
      )
    }

    const generatePolicyFlexibility = () => {
      return config.policyFlexibility.map(flexibility => 
        `Ask about ${flexibility.toLowerCase()} and any restrictions`
      )
    }

    const generateActionItems = () => {
      return [
        `Gather required documents for ${insuranceType.toLowerCase()} application`,
        `Schedule a consultation with ${carrier.name} representative`,
        `Compare final quotes and coverage details before deciding`
      ]
    }

    return {
      carrierName: carrier.name,
      rating: carrier.rating,
      monthlyPremium,
      annualPremium,
      coverageAmount: config.coverageOptions[Math.floor(Math.random() * config.coverageOptions.length)],
      deductible: insuranceType === "Health" ? "$500-$2,000" : "$1,000",
      features: config.features.slice(0, 4),
      strengths: [
        carrier.rating >= 4.5 ? "Excellent Customer Service" : "Competitive Pricing",
        "Digital Tools & Mobile App",
        "Fast Claims Processing",
        "Flexible Payment Options"
      ],
      nextSteps: {
        discountInquiries: generateDiscountInquiries(),
        coverageDiscussion: generateCoverageDiscussion(),
        claimsProcess: generateClaimsProcess(),
        policyFlexibility: generatePolicyFlexibility(),
        actionItems: generateActionItems()
      },
      contactInfo: {
        phone: carrier.phone,
        website: carrier.website,
        email: `support@${carrier.name.toLowerCase().replace(/\s+/g, '')}.com`
      },
      savings,
      bestFor: [
        insuranceType === "Auto" ? "Safe Drivers" : 
        insuranceType === "Home" ? "Homeowners" :
        insuranceType === "Life" ? "Young Professionals" :
        insuranceType === "Health" ? "Families" : "Working Professionals",
        "Tech-Savvy Users",
        "Cost-Conscious Consumers"
      ]
    }
  })
}

export function getInsuranceTypeConfig(insuranceType: string): InsuranceTypeConfig {
  return insuranceTypeConfigs[insuranceType] || insuranceTypeConfigs["Auto"]
}

export function getAllInsuranceTypes(): string[] {
  return Object.keys(insuranceTypeConfigs)
}
<<<<<<< Updated upstream
=======




<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
