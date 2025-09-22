// Helper functions to prepare users for carrier conversations
// Generates summaries and questions based on collected information

import type { AutoInsuranceNeeds } from './insurance-needs-analysis'

export interface CarrierConversationPackage {
  summary: string
  questionsToAsk: string[]
  negotiationTips: string[]
  documentsNeeded: string[]
  keyPointsToMention: string[]
  redFlags: string[]
}

export function generateCarrierConversationPackage(
  needs: Partial<AutoInsuranceNeeds>,
  customerProfile: any
): CarrierConversationPackage {
  
  const summary = generateProfileSummary(needs, customerProfile)
  const questionsToAsk = generateCarrierQuestions(needs, customerProfile)
  const negotiationTips = generateNegotiationTips(needs, customerProfile)
  const documentsNeeded = generateDocumentsList(needs)
  const keyPointsToMention = generateKeyPoints(needs, customerProfile)
  const redFlags = generateRedFlags()
  
  return {
    summary,
    questionsToAsk,
    negotiationTips,
    documentsNeeded,
    keyPointsToMention,
    redFlags
  }
}

function generateProfileSummary(needs: Partial<AutoInsuranceNeeds>, profile: any): string {
  const parts = []
  
  // Basic info
  parts.push(`**Quote Request Summary**`)
  parts.push(`Location: ${profile.location || 'Not specified'}`)
  parts.push(`Primary Driver Age: ${profile.age || 'Not specified'}`)
  
  // Drivers
  if (needs.drivers && needs.drivers.length > 0) {
    parts.push(`\n**Drivers (${needs.drivers.length}):**`)
    needs.drivers.forEach((driver, index) => {
      parts.push(`- Driver ${index + 1}: Age ${driver.age}, ${driver.yearsLicensed} years licensed, ${driver.maritalStatus}`)
      if (driver.creditScore) {
        parts.push(`  Credit: ${driver.creditScore}`)
      }
    })
  }
  
  // Vehicles
  if (needs.vehicles && needs.vehicles.length > 0) {
    parts.push(`\n**Vehicles (${needs.vehicles.length}):**`)
    needs.vehicles.forEach((vehicle, index) => {
      parts.push(`- Vehicle ${index + 1}: ${vehicle.year} ${vehicle.make} ${vehicle.model}`)
      parts.push(`  ${vehicle.annualMileage} miles/year, ${vehicle.primaryUse} use`)
      parts.push(`  Parked: ${vehicle.parkingLocation}, ZIP: ${vehicle.garageZipCode}`)
    })
  }
  
  // Coverage preferences
  if (needs.coverage) {
    parts.push(`\n**Coverage Requested:**`)
    parts.push(`- Liability: ${needs.coverage.bodilyInjuryLiability} / $${needs.coverage.propertyDamageLiability}`)
    if (needs.coverage.comprehensive.included) {
      parts.push(`- Comprehensive: $${needs.coverage.comprehensive.deductible} deductible`)
    }
    if (needs.coverage.collision.included) {
      parts.push(`- Collision: $${needs.coverage.collision.deductible} deductible`)
    }
    if (needs.coverage.uninsuredMotorist) {
      parts.push(`- Uninsured Motorist: ${needs.coverage.uninsuredMotorist}`)
    }
  }
  
  // Driving history
  if (needs.history) {
    parts.push(`\n**Driving History:**`)
    if (needs.history.movingViolations.length === 0) {
      parts.push(`- Clean driving record (no violations in past 5 years)`)
    } else {
      parts.push(`- ${needs.history.movingViolations.length} violation(s) in past 5 years`)
    }
    if (needs.history.claims.length === 0) {
      parts.push(`- No claims in past 5 years`)
    } else {
      parts.push(`- ${needs.history.claims.length} claim(s) in past 5 years`)
    }
  }
  
  // Current insurance
  if (needs.currentInsurance) {
    parts.push(`\n**Current Insurance:**`)
    parts.push(`- Carrier: ${needs.currentInsurance.carrier}`)
    parts.push(`- Premium: $${needs.currentInsurance.currentPremium}/month`)
    parts.push(`- Customer for ${needs.currentInsurance.yearsWithCarrier} years`)
    parts.push(`- No coverage lapses: ${!needs.currentInsurance.coverageLapses}`)
  }
  
  return parts.join('\n')
}

function generateCarrierQuestions(needs: Partial<AutoInsuranceNeeds>, profile: any): string[] {
  const questions = [
    // Pricing questions
    "What's your best rate for the coverage I need?",
    "Are there any current promotions or discounts available?",
    "What discounts do I qualify for based on my profile?",
    "Is there a discount for paying annually vs monthly?",
    "Do you offer a multi-policy discount if I bundle home/renters insurance?",
    
    // Coverage questions
    "What exactly is covered under comprehensive and collision?",
    "Are there any coverage gaps I should be aware of?",
    "What's the claims process if I have an accident?",
    "How quickly are claims typically processed and paid?",
    "Do you offer accident forgiveness?",
    
    // Service questions
    "Do you have local agents or is everything online?",
    "Can I manage my policy through a mobile app?",
    "What's the process for adding or removing vehicles?",
    "How do rate changes work at renewal?",
    "What happens if I need to file a claim outside business hours?",
  ]
  
  // Add specific questions based on profile
  if (needs.drivers && needs.drivers.some(d => d.age && d.age < 25)) {
    questions.push("Do you have good student discounts?")
    questions.push("Are there any young driver programs to reduce rates?")
  }
  
  if (needs.vehicles && needs.vehicles.some(v => v.year && new Date().getFullYear() - v.year < 2)) {
    questions.push("Do you offer gap insurance for newer vehicles?")
    questions.push("What's covered under new car replacement?")
  }
  
  if (needs.vehicles && needs.vehicles.some(v => v.annualMileage && v.annualMileage < 7500)) {
    questions.push("Do you offer low-mileage discounts?")
    questions.push("Would a usage-based insurance program save me money?")
  }
  
  return questions
}

function generateNegotiationTips(needs: Partial<AutoInsuranceNeeds>, profile: any): string[] {
  const tips = [
    "Mention you're getting quotes from multiple carriers (creates urgency)",
    "Ask if they can match or beat your lowest quote",
    "Inquire about unadvertised discounts - there are often hidden ones",
    "If you're a current customer elsewhere, emphasize your loyalty history",
    "Ask to speak with a supervisor if the initial quote seems high",
    "Get quotes for different deductible amounts to see the price difference",
    "Ask about discounts for safety features your car might have"
  ]
  
  // Add specific tips based on profile
  if (needs.currentInsurance && needs.currentInsurance.yearsWithCarrier > 3) {
    tips.unshift("Emphasize your loyalty - you've been with your current carrier for " + needs.currentInsurance.yearsWithCarrier + " years")
  }
  
  if (needs.history && needs.history.movingViolations.length === 0) {
    tips.unshift("Highlight your clean driving record - this is a major selling point")
  }
  
  if (needs.drivers && needs.drivers.some(d => d.creditScore === 'excellent')) {
    tips.push("Mention your excellent credit - this can significantly lower rates")
  }
  
  return tips
}

function generateDocumentsList(needs: Partial<AutoInsuranceNeeds>): string[] {
  const documents = [
    "Current driver's license for all drivers",
    "Vehicle registration or VIN numbers",
    "Current insurance declaration page (if you have insurance)",
  ]
  
  if (needs.vehicles && needs.vehicles.some(v => v.ownership === 'lease' || v.ownership === 'finance')) {
    documents.push("Lease or loan information (lienholder details)")
  }
  
  if (needs.history && needs.history.movingViolations.length > 0) {
    documents.push("Dates of any violations or accidents")
  }
  
  documents.push("List of safety features for each vehicle")
  documents.push("Odometer readings for accurate mileage")
  
  return documents
}

function generateKeyPoints(needs: Partial<AutoInsuranceNeeds>, profile: any): string[] {
  const points = []
  
  // Highlight positive factors
  if (needs.history && needs.history.movingViolations.length === 0) {
    points.push("Clean driving record with no violations")
  }
  
  if (needs.currentInsurance && !needs.currentInsurance.coverageLapses) {
    points.push("Continuous coverage with no lapses")
  }
  
  if (needs.drivers && needs.drivers.some(d => d.maritalStatus === 'married')) {
    points.push("Married (statistically lower risk)")
  }
  
  if (needs.vehicles && needs.vehicles.some(v => v.parkingLocation === 'garage')) {
    points.push("Vehicles garaged (lower theft/damage risk)")
  }
  
  if (needs.vehicles && needs.vehicles.some(v => v.annualMileage < 10000)) {
    points.push("Low annual mileage (reduced exposure)")
  }
  
  // Add professional/education status if applicable
  if (needs.drivers && needs.drivers.some(d => d.educationLevel === 'bachelors' || d.educationLevel === 'masters' || d.educationLevel === 'doctorate')) {
    points.push("College-educated (often qualifies for discounts)")
  }
  
  return points
}

function generateRedFlags(): string[] {
  return [
    "🚩 Extremely low quotes that seem too good to be true",
    "🚩 Pressure to buy immediately without time to review",
    "🚩 Unclear about what's covered and what's excluded",
    "🚩 No local agents or customer service availability",
    "🚩 Poor ratings on AM Best or consumer review sites",
    "🚩 Hidden fees not included in the initial quote",
    "🚩 Requiring full payment upfront with no monthly option",
    "🚩 Vague language about claims processing",
    "🚩 No clear cancellation or refund policy"
  ]
}

// Format the complete package for easy copying/sharing
export function formatConversationPackage(pkg: CarrierConversationPackage): string {
  let output = '# Your Insurance Shopping Toolkit\n\n'
  
  output += '## Quick Reference Summary\n'
  output += pkg.summary + '\n\n'
  
  output += '## Questions to Ask Every Carrier\n'
  pkg.questionsToAsk.forEach((q, i) => {
    output += `${i + 1}. ${q}\n`
  })
  output += '\n'
  
  output += '## Negotiation Strategies\n'
  pkg.negotiationTips.forEach(tip => {
    output += `• ${tip}\n`
  })
  output += '\n'
  
  output += '## Documents to Have Ready\n'
  pkg.documentsNeeded.forEach(doc => {
    output += `☐ ${doc}\n`
  })
  output += '\n'
  
  output += '## Your Strengths (Mention These!)\n'
  pkg.keyPointsToMention.forEach(point => {
    output += `✓ ${point}\n`
  })
  output += '\n'
  
  output += '## Warning Signs to Watch For\n'
  pkg.redFlags.forEach(flag => {
    output += `${flag}\n`
  })
  
  return output
}