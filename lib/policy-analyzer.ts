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

  console.log('[Policy Analyzer] Starting autonomous analysis...')
  console.log('[Policy Analyzer] State:', profile.state)
  console.log('[Policy Analyzer] Coverage:', coverage)

  // 1. State Compliance Check (CRITICAL)
  const complianceGaps = checkStateCompliance(coverage, profile, citations)
  gaps.push(...complianceGaps)

  // 2. Industry Best Practices Check (WARNING)
  const protectionGaps = checkIndustryRecommendations(coverage, profile, citations)
  gaps.push(...protectionGaps)

  // 3. Vehicle-Specific Analysis (uses NHTSA data)
  const vehicleGaps = analyzeVehicleCoverage(coverage, profile, citations)
  gaps.push(...vehicleGaps)

  // 4. Uninsured Motorist Check
  const umGaps = checkUninsuredMotorist(coverage, profile, citations)
  gaps.push(...umGaps)

  // 5. Deductible Optimization
  const deductibleGaps = analyzeDeductibles(coverage, profile, citations)
  gaps.push(...deductibleGaps)

  // Calculate overall health score
  const healthScore = calculateHealthScore(gaps)

  // Generate summary
  const summary = generateSummary(gaps, healthScore)

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
      priority: 1
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
    gaps.push({
      id: 'recommended_liability',
      type: 'warning',
      category: 'protection',
      title: '⚠️ Below Recommended Coverage Levels',
      message: `Your liability (${currentCoverage}) is below the industry-recommended ${industryRecommendations.liability.shorthand}`,
      reasoning: industryRecommendations.liability.reasoning,
      recommendation: `Increase to ${industryRecommendations.liability.shorthand} for better asset protection (${industryRecommendations.liability.costIncrease})`,
      source: industryRecommendations.liability.source,
      potentialRisk: 'Could be personally liable for $100K+ in a serious accident',
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
    const vehicleAge = currentYear - vehicle.year
    const estimatedValue = estimateVehicleValue(vehicle.year, vehicleAge)

    console.log(`[Policy Analyzer] Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}, Age: ${vehicleAge}, Est. Value: $${estimatedValue}`)

    // Check if collision/comprehensive is cost-effective
    if (estimatedValue < industryRecommendations.vehicleValueThresholds.dropCollisionComprehensive) {
      if (coverage.collision || coverage.comprehensive) {
        gaps.push({
          id: 'drop_collision_comprehensive',
          type: 'optimization',
          category: 'cost',
          title: '💰 Consider Dropping Collision/Comprehensive',
          message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is worth approximately $${estimatedValue}`,
          reasoning: industryRecommendations.vehicleValueThresholds.reasoning,
          recommendation: `Consider dropping collision/comprehensive coverage to save $300-600/year`,
          source: industryRecommendations.vehicleValueThresholds.source,
          potentialSavings: 450,
          priority: 4
        })
      }
    } else {
      // Vehicle is valuable, ensure adequate coverage
      if (!coverage.collision) {
        gaps.push({
          id: 'missing_collision',
          type: 'warning',
          category: 'protection',
          title: '⚠️ Missing Collision Coverage',
          message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is worth approximately $${estimatedValue} but has no collision coverage`,
          reasoning: 'Collision coverage protects your investment if you cause an accident or hit an object.',
          recommendation: 'Add collision coverage with $500 deductible',
          source: 'NHTSA vehicle data + industry standards',
          potentialRisk: `Could lose $${estimatedValue} if vehicle is totaled in an at-fault accident`,
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
function generateSummary(gaps: PolicyGap[], healthScore: number): string {
  const criticalCount = gaps.filter(g => g.type === 'critical').length
  const warningCount = gaps.filter(g => g.type === 'warning').length
  const optimizationCount = gaps.filter(g => g.type === 'optimization').length

  if (healthScore >= 90) {
    return `Excellent! Your policy meets all requirements and follows industry best practices.`
  } else if (healthScore >= 70) {
    return `Good coverage with ${warningCount} recommendations for improvement.`
  } else if (healthScore >= 50) {
    return `Your policy needs attention. ${criticalCount + warningCount} issues found.`
  } else {
    return `⚠️ Critical issues detected. Your policy may not meet legal requirements.`
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

