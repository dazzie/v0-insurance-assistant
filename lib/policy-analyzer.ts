/**
 * Autonomous Policy Analysis Engine
 * 
 * Analyzes insurance policies for:
 * - State compliance issues
 * - Coverage gaps vs industry recommendations
 * - Cost optimization opportunities
 * - Risk-based recommendations
 * 
 * Uses authoritative sources:
 * - State Departments of Insurance
 * - Consumer Reports
 * - Insurance Information Institute
 * - NHTSA vehicle data
 */

import type { CustomerProfile } from './customer-profile'
import { 
  stateMinimums, 
  industryRecommendations,
  parseLiabilityShorthand,
  formatLiabilityShorthand,
  getStateRequirement
} from './data/state-requirements'

export interface PolicyGap {
  id: string
  type: 'critical' | 'warning' | 'optimization'
  category: 'compliance' | 'protection' | 'cost'
  title: string
  message: string
  reasoning: string
  recommendation: string
  source: string
  sourceUrl?: string  // Clickable link to the source
  potentialSavings?: number
  potentialRisk?: string
  priority: number  // 1 = highest, 5 = lowest
}

export interface PolicyAnalysis {
  healthScore: number  // 0-100
  gaps: PolicyGap[]
  summary: string
  citations: string[]
  analyzedAt: string
}

/**
 * Main policy analysis function
 * Autonomously identifies gaps and generates recommendations
 */
export function analyzePolicy(
  coverage: any,  // ExtractedCoverage from policy scan
  profile: CustomerProfile
): PolicyAnalysis {
  const gaps: PolicyGap[] = []
  const citations = new Set<string>()

  console.log('[Policy Analyzer] ⚡ Starting fast analysis...')
  console.log('[Policy Analyzer] State:', profile.state)
  console.log('[Policy Analyzer] Coverage keys:', Object.keys(coverage))

  // Extract risk factors from profile
  const riskFactors = {
    crimeRisk: profile.riskAssessment?.crimeRisk?.crimeIndex ? profile.riskAssessment.crimeRisk.crimeIndex / 100 : 0,
    earthquakeRisk: profile.riskAssessment?.earthquakeRisk?.earthquakeRisk ? profile.riskAssessment.earthquakeRisk.earthquakeRisk / 10 : 0,
    wildfireRisk: profile.riskAssessment?.wildfireRisk?.wildfireRisk ? profile.riskAssessment.wildfireRisk.wildfireRisk / 10 : 0,
    floodRisk: profile.riskAssessment?.floodRisk?.floodFactor ? profile.riskAssessment.floodRisk.floodFactor / 10 : 0
  }

  console.log('[Policy Analyzer] Risk factors extracted:', riskFactors)

  // ⚡ FAST ANALYSIS - Only essential checks for speed
  console.log('[Policy Analyzer] ⚡ Running fast analysis...')
  
  // 1. Basic Coverage Gaps (fast)
  const basicGaps = checkBasicCoverage(coverage, profile, citations)
  gaps.push(...basicGaps)

  // 2. Uninsured Motorist Check (critical)
  const umGaps = checkUninsuredMotorist(coverage, profile, citations)
  gaps.push(...umGaps)

  // Calculate overall health score
  const healthScore = calculateHealthScore(gaps)

  // Generate simple summary
  const summary = generateSimpleSummary(gaps, healthScore)

  console.log(`[Policy Analyzer] ✓ Analysis complete: ${gaps.length} gaps found, health score: ${healthScore}/100`)

  return {
    healthScore,
    gaps: gaps.sort((a, b) => a.priority - b.priority), // Sort by priority
    summary,
    citations: Array.from(citations),
    analyzedAt: new Date().toISOString()
  }
}

/**
 * Enhanced Gap Analysis Logic
 * Analyzes policies against state requirements, risk factors, and life stage needs
 */
function analyzeGaps(policy: any, profile: CustomerProfile, stateRequirements: any, riskFactors: any): PolicyGap[] {
  const gaps: PolicyGap[] = []
  const citations = new Set<string>()

  // 1. State Compliance Check (CRITICAL)
  const complianceGaps = checkStateCompliance(policy, profile, citations)
  gaps.push(...complianceGaps)

  // 2. Risk-Based Recommendations
  const riskGaps = checkRiskBasedRecommendations(policy, profile, riskFactors, citations)
  gaps.push(...riskGaps)

  // 3. Life Stage Analysis
  const lifeStageGaps = checkLifeStageNeeds(policy, profile, citations)
  gaps.push(...lifeStageGaps)

  // 4. Financial Impact Analysis
  const financialGaps = analyzeFinancialImpact(policy, profile, citations)
  gaps.push(...financialGaps)

  return gaps.sort((a, b) => a.priority - b.priority)
}

/**
 * Check if policy meets state minimum requirements
 */
function checkStateCompliance(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []
  const stateReq = getStateRequirement(profile.state || 'CA')

  if (!stateReq) {
    console.log('[Policy Analyzer] State not in database, skipping compliance check')
    return gaps
  }

  citations.add(stateReq.source)

  // Parse policy liability (e.g., "15/30/5" or extract from coverage object)
  let policyLiability = null
  
  if (coverage.liability) {
    if (typeof coverage.liability === 'string') {
      policyLiability = parseLiabilityShorthand(coverage.liability)
    } else if (coverage.liability.bodilyInjury && coverage.liability.propertyDamage) {
      // Extract from structured data
      const biMatch = coverage.liability.bodilyInjury.match(/\$?(\d+)k?/i)
      const pdMatch = coverage.liability.propertyDamage.match(/\$?(\d+)k?/i)
      if (biMatch && pdMatch) {
        const bi = parseInt(biMatch[1]) * 1000
        const pd = parseInt(pdMatch[1]) * 1000
        policyLiability = {
          bodilyInjuryPerPerson: bi,
          bodilyInjuryPerAccident: bi * 2, // Assume 2x for per-accident
          propertyDamage: pd
        }
      }
    }
  }

  if (!policyLiability) {
    console.log('[Policy Analyzer] Could not parse liability coverage')
    return gaps
  }

  // Check bodily injury per person
  if (policyLiability.bodilyInjuryPerPerson < stateReq.liability.bodilyInjuryPerPerson) {
    gaps.push({
      id: 'state_minimum_bi_person',
      type: 'critical',
      category: 'compliance',
      title: '🚨 Below State Minimum - Illegal Coverage',
      message: `Your bodily injury coverage ($${policyLiability.bodilyInjuryPerPerson / 1000}K per person) is below ${stateReq.stateName}'s minimum of $${stateReq.liability.bodilyInjuryPerPerson / 1000}K`,
      reasoning: 'Driving without minimum coverage is illegal and can result in fines, license suspension, vehicle impoundment, or jail time. You are also personally liable for damages.',
      recommendation: `Immediately increase liability to at least ${formatLiabilityShorthand(stateReq.liability)}`,
      source: stateReq.source,
      sourceUrl: `https://www.${profile.state?.toLowerCase() || 'state'}.gov/insurance`,
      potentialRisk: 'Fines up to $5,000, license suspension, personal liability for all damages',
      priority: 1
    })
  }

  // Check property damage
  if (policyLiability.propertyDamage < stateReq.liability.propertyDamage) {
    gaps.push({
      id: 'state_minimum_pd',
      type: 'critical',
      category: 'compliance',
      title: '🚨 Property Damage Below State Minimum',
      message: `Your property damage coverage ($${policyLiability.propertyDamage / 1000}K) is below ${stateReq.stateName}'s minimum of $${stateReq.liability.propertyDamage / 1000}K`,
      reasoning: 'Insufficient property damage coverage violates state law.',
      recommendation: `Increase property damage coverage to at least $${stateReq.liability.propertyDamage / 1000}K`,
      source: stateReq.source,
      sourceUrl: `https://www.${profile.state?.toLowerCase() || 'state'}.gov/insurance`,
      priority: 1
    })
  }

  // Check required coverage types
  if (stateReq.pipRequired && !coverage.personalInjuryProtection && !coverage.pip) {
    gaps.push({
      id: 'missing_required_pip',
      type: 'critical',
      category: 'compliance',
      title: '🚨 Missing Required PIP Coverage',
      message: `${stateReq.stateName} requires Personal Injury Protection (PIP) coverage`,
      reasoning: `${stateReq.stateName} is a no-fault state. PIP is mandatory and covers medical expenses regardless of who caused the accident.`,
      recommendation: 'Add PIP coverage immediately to comply with state law',
      source: stateReq.source,
      sourceUrl: `https://www.${profile.state?.toLowerCase() || 'state'}.gov/insurance`,
      priority: 1
    })
  }

  if (stateReq.umRequired && !coverage.uninsuredMotorist && !coverage.underinsuredMotorist) {
    gaps.push({
      id: 'missing_required_um',
      type: 'critical',
      category: 'compliance',
      title: '🚨 Missing Required UM/UIM Coverage',
      message: `${stateReq.stateName} requires Uninsured/Underinsured Motorist coverage`,
      reasoning: 'State law mandates UM/UIM protection.',
      recommendation: 'Add UM/UIM coverage to comply with state requirements',
      source: stateReq.source,
      sourceUrl: `https://www.${profile.state?.toLowerCase() || 'state'}.gov/insurance`,
      priority: 1
    })
  }

  return gaps
}

/**
 * Check risk-based recommendations based on location and profile
 */
function checkRiskBasedRecommendations(
  coverage: any,
  profile: CustomerProfile,
  riskFactors: any,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []

  // High crime area → Recommend higher liability limits
  if (riskFactors.crimeRisk && riskFactors.crimeRisk > 0.7) {
    gaps.push({
      id: 'high_crime_liability',
      type: 'warning',
      category: 'protection',
      title: '⚠️ High Crime Area - Consider Higher Liability',
      message: `Your area has elevated crime risk (${Math.round(riskFactors.crimeRisk * 100)}%). Consider increasing liability coverage.`,
      reasoning: 'Higher crime areas often correlate with increased accident risk and higher medical costs.',
      recommendation: 'Increase liability to 100/300/100 for better protection',
      source: 'FBI Crime Data',
      sourceUrl: 'https://www.fbi.gov/',
      potentialRisk: 'Higher medical costs in high-crime areas',
      priority: 3
    })
  }

  // Earthquake Zone 4 → Recommend earthquake coverage
  if (riskFactors.earthquakeRisk && riskFactors.earthquakeRisk > 0.8) {
    if (!coverage.earthquake && !coverage.earthquakeCoverage) {
      gaps.push({
        id: 'missing_earthquake_coverage',
        type: 'warning',
        category: 'protection',
        title: '🌍 Earthquake Zone - Missing Coverage',
        message: `You're in a high earthquake risk zone (${Math.round(riskFactors.earthquakeRisk * 100)}% risk). Standard homeowners insurance doesn't cover earthquake damage.`,
        reasoning: 'Earthquake damage is excluded from standard homeowners policies but is critical in high-risk zones.',
        recommendation: 'Add earthquake coverage or separate earthquake policy',
      source: 'USGS Earthquake Hazards Program',
      sourceUrl: 'https://www.usgs.gov/',
        potentialRisk: 'Complete loss of home and belongings in earthquake',
        priority: 2
      })
    }
  }

  // Wildfire risk → Recommend comprehensive coverage
  if (riskFactors.wildfireRisk && riskFactors.wildfireRisk > 0.6) {
    if (!coverage.comprehensive && !coverage.comprehensiveCoverage) {
      gaps.push({
        id: 'missing_wildfire_coverage',
        type: 'warning',
        category: 'protection',
        title: '🔥 Wildfire Risk - Missing Comprehensive Coverage',
        message: `Your area has wildfire risk (${Math.round(riskFactors.wildfireRisk * 100)}%). Comprehensive coverage protects against fire damage.`,
        reasoning: 'Wildfire damage requires comprehensive coverage, which is separate from standard homeowners insurance.',
        recommendation: 'Add comprehensive coverage with appropriate deductible',
      source: 'USGS Wildfire Risk to Communities',
      sourceUrl: 'https://www.usgs.gov/',
        potentialRisk: 'Total loss from wildfire without coverage',
        priority: 2
      })
    }
  }

  // Flood risk → Recommend flood insurance
  if (riskFactors.floodRisk && riskFactors.floodRisk > 0.5) {
    if (!coverage.flood && !coverage.floodInsurance) {
      gaps.push({
        id: 'missing_flood_coverage',
        type: 'warning',
        category: 'protection',
        title: '🌊 Flood Risk - Missing Flood Insurance',
        message: `Your area has flood risk (${Math.round(riskFactors.floodRisk * 100)}%). Standard homeowners insurance doesn't cover flood damage.`,
        reasoning: 'Flood damage is excluded from standard homeowners policies but is essential in flood-prone areas.',
        recommendation: 'Add flood insurance through NFIP or private carrier',
        source: 'First Street Foundation',
        sourceUrl: 'https://firststreet.org/',
        potentialRisk: 'Complete loss from flooding without coverage',
        priority: 2
      })
    }
  }

  return gaps
}

/**
 * Check life stage specific needs
 */
function checkLifeStageNeeds(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []

  // Young drivers (under 25) → Recommend higher UM/UIM
  if (profile.age && typeof profile.age === 'number' && profile.age < 25) {
    if (!coverage.uninsuredMotorist && !coverage.underinsuredMotorist) {
      gaps.push({
        id: 'young_driver_um',
        type: 'warning',
        category: 'protection',
        title: '👨‍🎓 Young Driver - Missing UM/UIM Coverage',
        message: 'Young drivers are at higher risk of accidents and more likely to encounter uninsured drivers.',
        reasoning: 'Statistics show 13% of drivers are uninsured, and young drivers are more likely to be involved in accidents.',
        recommendation: 'Add Uninsured/Underinsured Motorist coverage',
        source: 'Insurance Information Institute',
        sourceUrl: 'https://www.iii.org/',
        potentialRisk: 'No coverage if hit by uninsured driver',
        priority: 3
      })
    }
  }

  // Homeowners → Recommend umbrella policy
  if (profile.homeValue && !coverage.umbrella) {
    gaps.push({
      id: 'homeowner_umbrella',
      type: 'optimization',
      category: 'protection',
      title: '🏠 Homeowner - Consider Umbrella Policy',
      message: 'As a homeowner, you have more assets to protect. An umbrella policy provides additional liability coverage.',
      reasoning: 'Homeowners have more assets at risk and should consider umbrella coverage for additional protection.',
      recommendation: 'Consider $1M umbrella policy for additional liability protection',
      source: 'Consumer Reports',
      sourceUrl: 'https://www.consumerreports.org/',
      potentialRisk: 'Personal assets at risk in lawsuit',
      priority: 4
    })
  }

  // High net worth → Recommend higher limits (based on home value)
  if (profile.homeValue && parseInt(profile.homeValue.replace(/[$,]/g, '')) > 500000) {
    const currentLiability = coverage.liability
    if (currentLiability && typeof currentLiability === 'string') {
      const liability = parseLiabilityShorthand(currentLiability)
      if (liability && liability.bodilyInjuryPerPerson < 100000) {
        gaps.push({
          id: 'high_income_liability',
          type: 'optimization',
          category: 'protection',
          title: '💰 High Income - Consider Higher Liability Limits',
          message: 'Your income suggests you have assets to protect. Consider higher liability limits.',
          reasoning: 'Higher income individuals have more assets at risk and should carry higher liability coverage.',
          recommendation: 'Increase liability to 250/500/250 or higher',
      source: 'Consumer Reports',
      sourceUrl: 'https://www.consumerreports.org/',
          potentialRisk: 'Personal assets at risk in lawsuit',
          priority: 4
        })
      }
    }
  }

  return gaps
}

/**
 * Analyze financial impact of coverage gaps
 */
function analyzeFinancialImpact(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []

  // Calculate potential savings from coverage optimization
  const currentPremium = parseFloat(coverage.totalPremium?.replace(/[$,]/g, '') || '0')
  
  if (currentPremium > 0) {
    // Estimate potential savings (10-30% is typical)
    const potentialSavings = Math.round(currentPremium * 0.2) // 20% average savings
    
    gaps.push({
      id: 'potential_savings',
      type: 'optimization',
      category: 'cost',
      title: '💵 Potential Savings Opportunity',
      message: `Based on your current premium of $${currentPremium.toLocaleString()}, you could potentially save $${potentialSavings.toLocaleString()} annually.`,
      reasoning: 'Market analysis shows most customers can find better rates by shopping around.',
      recommendation: 'Get quotes from multiple carriers to compare rates',
      source: 'Insurance Market Analysis',
      sourceUrl: 'https://www.iii.org/fact-statistic/facts-statistics-auto-insurance',
      potentialSavings: potentialSavings,
      priority: 3
    })
  }

  return gaps
}

/**
 * Check against industry best practices
 */
function checkIndustryRecommendations(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []
  citations.add(industryRecommendations.liability.source)

  // Parse policy liability
  let policyLiability = null
  if (coverage.liability) {
    if (typeof coverage.liability === 'string') {
      policyLiability = parseLiabilityShorthand(coverage.liability)
    } else if (coverage.liability.bodilyInjury) {
      const biMatch = coverage.liability.bodilyInjury.match(/\$?(\d+)k?/i)
      if (biMatch) {
        const bi = parseInt(biMatch[1]) * 1000
        policyLiability = {
          bodilyInjuryPerPerson: bi,
          bodilyInjuryPerAccident: bi * 2,
          propertyDamage: 0
        }
      }
    }
  }

  if (policyLiability && policyLiability.bodilyInjuryPerPerson < industryRecommendations.liability.bodilyInjuryPerPerson) {
    const currentCoverage = formatLiabilityShorthand(policyLiability)
    const currentBI = policyLiability.bodilyInjuryPerPerson
    const recommendedBI = industryRecommendations.liability.bodilyInjuryPerPerson
    const shortfall = recommendedBI - currentBI
    
    // Calculate realistic cost increase based on coverage amount
    const costIncrease = Math.round((shortfall / 100000) * 150) // ~$150 per $100K increase
    
    gaps.push({
      id: 'recommended_liability',
      type: 'warning',
      category: 'protection',
      title: '⚠️ Below Recommended Coverage Levels',
      message: `Your liability (${currentCoverage}) is below the industry-recommended ${industryRecommendations.liability.shorthand}`,
      reasoning: `Medical costs have increased 40% in the past decade. A serious accident can easily exceed $100K in medical bills alone. Your current coverage leaves you vulnerable to personal liability.`,
      recommendation: `Increase to ${industryRecommendations.liability.shorthand} for better asset protection. Expected cost increase: ~$${costIncrease}/year (small price for significant protection)`,
      source: industryRecommendations.liability.source,
      potentialRisk: `Could be personally liable for $${shortfall.toLocaleString()}+ in a serious accident`,
      potentialSavings: -costIncrease, // Negative because it's a cost increase
      priority: 2
    })
  }

  return gaps
}

/**
 * Analyze vehicle-specific coverage using NHTSA data
 */
function analyzeVehicleCoverage(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []

  if (!profile.vehicles || profile.vehicles.length === 0) {
    return gaps
  }

  const vehicle = profile.vehicles[0]
  
  // If vehicle is enriched with NHTSA data, we can make better recommendations
  if (vehicle.enriched) {
    citations.add('NHTSA VIN Decoder Database')
    
    // Estimate vehicle value based on age
    const currentYear = new Date().getFullYear()
    const vehicleAge = vehicle.year ? currentYear - vehicle.year : 0
    const estimatedValue = vehicle.year ? estimateVehicleValue(vehicle.year, vehicleAge) : 0

    console.log(`[Policy Analyzer] Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}, Age: ${vehicleAge}, Est. Value: $${estimatedValue}`)

    // Check if collision/comprehensive is cost-effective
    if (estimatedValue < industryRecommendations.vehicleValueThresholds.dropCollisionComprehensive) {
      if (coverage.collision || coverage.comprehensive) {
        const annualSavings = Math.round(estimatedValue * 0.08) // ~8% of vehicle value annually
        gaps.push({
          id: 'drop_collision_comprehensive',
          type: 'optimization',
          category: 'cost',
          title: '💰 Consider Dropping Collision/Comprehensive',
          message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is worth approximately $${estimatedValue.toLocaleString()} (${vehicleAge} years old)`,
          reasoning: `Vehicles worth less than $5,000 often cost more to insure than their actual value. Premiums + deductible may exceed vehicle value in a total loss.`,
          recommendation: `Consider dropping collision/comprehensive coverage to save ~$${annualSavings}/year. Use savings to build emergency fund.`,
          source: industryRecommendations.vehicleValueThresholds.source,
          potentialSavings: annualSavings,
          priority: 4
        })
      }
    } else {
      // Vehicle is valuable, ensure adequate coverage
      if (!coverage.collision) {
        const collisionCost = Math.round(estimatedValue * 0.06) // ~6% of vehicle value
        gaps.push({
          id: 'missing_collision',
          type: 'warning',
          category: 'protection',
          title: '⚠️ Missing Collision Coverage',
          message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is worth approximately $${estimatedValue.toLocaleString()} but has no collision coverage`,
          reasoning: `Collision coverage protects your $${estimatedValue.toLocaleString()} investment if you cause an accident. Without it, you'd pay out-of-pocket for repairs or replacement.`,
          recommendation: `Add collision coverage with $500 deductible. Expected cost: ~$${collisionCost}/year (small price for $${estimatedValue.toLocaleString()} protection)`,
          source: 'NHTSA vehicle data + industry standards',
          potentialRisk: `Could lose $${estimatedValue.toLocaleString()} if vehicle is totaled in an at-fault accident`,
          potentialSavings: -collisionCost, // Negative because it's a cost increase
          priority: 3
        })
      }

      if (!coverage.comprehensive) {
        gaps.push({
          id: 'missing_comprehensive',
          type: 'warning',
          category: 'protection',
          title: '⚠️ Missing Comprehensive Coverage',
          message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is worth approximately $${estimatedValue} but has no comprehensive coverage`,
          reasoning: 'Comprehensive covers theft, vandalism, weather damage, and other non-collision incidents.',
          recommendation: 'Add comprehensive coverage with $500 deductible',
          source: 'NHTSA vehicle data + industry standards',
          potentialRisk: `Could lose $${estimatedValue} to theft or weather damage`,
          priority: 3
        })
      }
    }
  }

  return gaps
}

/**
 * Check uninsured motorist coverage
 */
function checkUninsuredMotorist(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []

  if (!coverage.uninsuredMotorist && !coverage.underinsuredMotorist) {
    citations.add(industryRecommendations.uninsuredMotorist.source)
    
    gaps.push({
      id: 'missing_um_uim',
      type: 'warning',
      category: 'protection',
      title: '⚠️ No Uninsured Motorist Protection',
      message: 'You have no protection if hit by an uninsured or underinsured driver',
      reasoning: industryRecommendations.uninsuredMotorist.reasoning,
      recommendation: `Add UM/UIM coverage matching your liability limits (${industryRecommendations.uninsuredMotorist.costIncrease})`,
      source: industryRecommendations.uninsuredMotorist.source,
      potentialRisk: 'Could pay $50K+ out of pocket for injuries from an uninsured driver',
      priority: 2
    })
  }

  return gaps
}

/**
 * Analyze deductible choices
 */
function analyzeDeductibles(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []

  // Check collision deductible
  if (coverage.collision && coverage.collision.deductible) {
    const deductible = parseInt(coverage.collision.deductible.replace(/\D/g, ''))
    const recommended = industryRecommendations.deductibles.collision.recommended

    if (deductible > recommended * 2) {
      gaps.push({
        id: 'high_collision_deductible',
        type: 'optimization',
        category: 'cost',
        title: '💡 High Collision Deductible',
        message: `Your $${deductible} collision deductible is higher than the recommended $${recommended}`,
        reasoning: 'High deductibles save on premiums but increase out-of-pocket costs after an accident.',
        recommendation: `Consider lowering to $${recommended} if you can't afford $${deductible} out of pocket`,
        source: 'Industry standard',
        priority: 5
      })
    }
  }

  // Check comprehensive deductible
  if (coverage.comprehensive && coverage.comprehensive.deductible) {
    const deductible = parseInt(coverage.comprehensive.deductible.replace(/\D/g, ''))
    const recommended = industryRecommendations.deductibles.comprehensive.recommended

    if (deductible > recommended * 2) {
      gaps.push({
        id: 'high_comprehensive_deductible',
        type: 'optimization',
        category: 'cost',
        title: '💡 High Comprehensive Deductible',
        message: `Your $${deductible} comprehensive deductible is higher than the recommended $${recommended}`,
        reasoning: industryRecommendations.deductibles.comprehensive.reasoning,
        recommendation: `Consider lowering to $${recommended}`,
        source: 'Industry standard',
        priority: 5
      })
    }
  }

  return gaps
}

/**
 * Calculate overall policy health score (0-100)
 */
function calculateHealthScore(gaps: PolicyGap[]): number {
  let score = 100

  gaps.forEach(gap => {
    switch (gap.type) {
      case 'critical':
        score -= 30
        break
      case 'warning':
        score -= 15
        break
      case 'optimization':
        score -= 5
        break
    }
  })

  return Math.max(0, Math.min(100, score))
}

/**
 * Generate human-readable summary
 */
function generateSimpleSummary(gaps: PolicyGap[], healthScore: number): string {
  const criticalCount = gaps.filter(g => g.type === 'critical').length
  const warningCount = gaps.filter(g => g.type === 'warning').length

  if (healthScore >= 80) {
    return `Good coverage! ${warningCount} recommendations for improvement.`
  } else if (healthScore >= 50) {
    return `Policy needs attention. ${criticalCount + warningCount} issues found.`
  } else {
    return `Critical issues detected. ${criticalCount} urgent problems found.`
  }
}

/**
 * Estimate vehicle value based on age (simplified depreciation model)
 */
function estimateVehicleValue(year: number, age: number): number {
  // Simplified depreciation: 15% per year for first 5 years, 10% thereafter
  // Assumes average new car price of $40,000
  const baseValue = 40000
  let value = baseValue

  for (let i = 0; i < age; i++) {
    const depreciationRate = i < 5 ? 0.15 : 0.10
    value *= (1 - depreciationRate)
  }

  return Math.round(value)
}

/**
 * ⚡ Fast basic coverage check - only essential gaps
 */
function checkBasicCoverage(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []
  
  // Check for missing liability coverage
  if (!coverage.liability) {
    gaps.push({
      id: 'missing_liability',
      type: 'critical',
      category: 'compliance',
      title: '🚨 Missing Liability Coverage',
      message: 'No liability coverage found - this is required by law',
      reasoning: 'Liability coverage is mandatory in all states',
      recommendation: 'Add liability coverage immediately',
      source: 'State insurance requirements',
      potentialRisk: 'Legal penalties and personal liability',
      priority: 1
    })
  }
  
  // Check for very low liability limits
  if (coverage.liability && typeof coverage.liability === 'string') {
    const liability = parseLiabilityShorthand(coverage.liability)
    if (liability && liability.bodilyInjuryPerPerson < 25000) {
      gaps.push({
        id: 'low_liability',
        type: 'warning',
        category: 'protection',
        title: '⚠️ Low Liability Limits',
        message: `Your liability coverage (${coverage.liability}) is very low`,
        reasoning: 'Medical costs can easily exceed $25K in an accident',
        recommendation: 'Consider increasing to at least 100/300/100',
        source: 'Industry recommendations',
        potentialRisk: 'Out-of-pocket costs for damages exceeding coverage',
        priority: 2
      })
    }
  }
  
  return gaps
}

/**
 * Analyze home insurance coverage gaps
 */
function analyzeHomeInsurance(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []
  
  if (!profile.homeValue || !profile.location) {
    return gaps
  }
  
  const homeValue = parseInt(profile.homeValue.replace(/[$,]/g, ''))
  const location = profile.location.toLowerCase()
  
  // Check dwelling coverage adequacy
  if (coverage.dwelling && coverage.dwelling < homeValue * 0.8) {
    const shortfall = homeValue - coverage.dwelling
    gaps.push({
      id: 'insufficient_dwelling_coverage',
      type: 'warning',
      category: 'protection',
      title: '🏠 Insufficient Dwelling Coverage',
      message: `Your dwelling coverage ($${coverage.dwelling.toLocaleString()}) is below 80% of home value ($${homeValue.toLocaleString()})`,
      reasoning: `Most policies require 80% of home value to avoid coinsurance penalties. Underinsured homes face reduced claim payouts.`,
      recommendation: `Increase dwelling coverage to at least $${Math.round(homeValue * 0.8).toLocaleString()}. Expected cost increase: ~$${Math.round(shortfall * 0.003)}/year`,
      source: 'Industry standard (80% rule)',
      potentialRisk: `Could face coinsurance penalties and reduced claim payouts`,
      potentialSavings: -Math.round(shortfall * 0.003),
      priority: 2
    })
  }
  
  // Location-specific risks
  if (location.includes('california') && !coverage.earthquake) {
    const earthquakeCost = Math.round(homeValue * 0.002) // ~0.2% of home value
    gaps.push({
      id: 'missing_earthquake_coverage',
      type: 'warning',
      category: 'protection',
      title: '🌍 Missing Earthquake Coverage',
      message: `California earthquake risk requires separate earthquake coverage`,
      reasoning: `Standard home insurance excludes earthquake damage. CA has high earthquake risk with potential for catastrophic losses.`,
      recommendation: `Add earthquake coverage. Expected cost: ~$${earthquakeCost}/year with 10-15% deductible`,
      source: 'California Earthquake Authority',
      potentialRisk: `Could lose entire home value in earthquake without coverage`,
      potentialSavings: -earthquakeCost,
      priority: 3
    })
  }
  
  if (location.includes('florida') && !coverage.flood) {
    const floodCost = Math.round(homeValue * 0.001) // ~0.1% of home value
    gaps.push({
      id: 'missing_flood_coverage',
      type: 'warning',
      category: 'protection',
      title: '🌪️ Missing Flood Coverage',
      message: `Florida hurricane risk requires flood insurance`,
      reasoning: `Standard home insurance excludes flood damage. FL has high hurricane/flood risk.`,
      recommendation: `Add flood coverage through NFIP. Expected cost: ~$${floodCost}/year`,
      source: 'National Flood Insurance Program',
      potentialRisk: `Could lose home and belongings in flood without coverage`,
      potentialSavings: -floodCost,
      priority: 3
    })
  }
  
  // High-value home analysis
  if (homeValue > 1000000 && !coverage.guaranteedReplacement) {
    gaps.push({
      id: 'missing_guaranteed_replacement',
      type: 'warning',
      category: 'protection',
      title: '💎 Missing Guaranteed Replacement Cost',
      message: `High-value home ($${homeValue.toLocaleString()}) should have guaranteed replacement cost coverage`,
      reasoning: `Standard policies may not cover full rebuild costs in high-construction-cost areas. Guaranteed replacement ensures full coverage regardless of cost increases.`,
      recommendation: `Add guaranteed replacement cost coverage. Expected cost increase: ~$${Math.round(homeValue * 0.001)}/year`,
      source: 'High-value home insurance standards',
      potentialRisk: `Could face coverage shortfall if rebuild costs exceed policy limits`,
      potentialSavings: -Math.round(homeValue * 0.001),
      priority: 2
    })
  }
  
  return gaps
}

/**
 * Analyze renters insurance coverage gaps
 */
function analyzeRentersInsurance(
  coverage: any,
  profile: CustomerProfile,
  citations: Set<string>
): PolicyGap[] {
  const gaps: PolicyGap[] = []
  
  if (!profile.location) {
    return gaps
  }
  
  const location = profile.location.toLowerCase()
  
  // Check personal property coverage adequacy
  if (coverage.personalProperty && coverage.personalProperty < 30000) {
    gaps.push({
      id: 'insufficient_personal_property',
      type: 'warning',
      category: 'protection',
      title: '📦 Insufficient Personal Property Coverage',
      message: `Your personal property coverage ($${coverage.personalProperty.toLocaleString()}) may be too low`,
      reasoning: `Average renter has $30K+ in personal belongings. Electronics, furniture, and clothing add up quickly.`,
      recommendation: `Increase personal property coverage to $50K+. Expected cost increase: ~$50-100/year`,
      source: 'Renters insurance industry standards',
      potentialRisk: `Could face coverage shortfall if belongings exceed policy limits`,
      potentialSavings: -75,
      priority: 3
    })
  }
  
  // Check liability coverage adequacy
  if (coverage.liability && coverage.liability < 100000) {
    gaps.push({
      id: 'insufficient_liability_coverage',
      type: 'warning',
      category: 'protection',
      title: '⚠️ Insufficient Liability Coverage',
      message: `Your liability coverage ($${coverage.liability.toLocaleString()}) may be too low`,
      reasoning: `Liability claims can easily exceed $100K. Higher coverage protects your assets and future earnings.`,
      recommendation: `Increase liability coverage to $300K+. Expected cost increase: ~$25-50/year`,
      source: 'Renters insurance industry standards',
      potentialRisk: `Could face personal liability for damages exceeding coverage`,
      potentialSavings: -37,
      priority: 2
    })
  }
  
  // Location-specific renters risks
  if (location.includes('san francisco') || location.includes('los angeles')) {
    if (!coverage.earthquake) {
      gaps.push({
        id: 'missing_renters_earthquake',
        type: 'warning',
        category: 'protection',
        title: '🌍 Missing Earthquake Coverage for Belongings',
        message: `California earthquake risk requires earthquake coverage for personal property`,
        reasoning: `Standard renters insurance excludes earthquake damage to belongings. CA has high earthquake risk.`,
        recommendation: `Add earthquake coverage for personal property. Expected cost: ~$50-100/year`,
        source: 'California Earthquake Authority',
        potentialRisk: `Could lose all belongings in earthquake without coverage`,
        potentialSavings: -75,
        priority: 3
      })
    }
  }
  
  return gaps
}


