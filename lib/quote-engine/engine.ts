import { ConfigCompiler } from './compiler'
import type { CompiledConfig, QuoteRequest, Quote, QuoteEngineResult, CarrierConfig } from './types'

export class QuoteEngine {
  private config: CompiledConfig

  constructor() {
    this.config = ConfigCompiler.compile()
  }

  /**
   * Generate quotes from all enabled carriers
   */
  generateQuotes(request: QuoteRequest): QuoteEngineResult {
    const startTime = performance.now()
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const quotes: Quote[] = []

    for (const [carrierId, carrier] of this.config.carriers) {
      if (!carrier.enabled) continue

      // Check eligibility
      if (carrier.eligibility?.requiresMilitary && !request.isMilitary) {
        continue // Skip USAA if not military
      }

      const monthlyPremium = this.calculate(request, carrier)
      
      quotes.push({
        carrierId,
        carrierName: carrier.displayName,
        logo: carrier.logo,
        rating: carrier.rating,
        monthlyPremium,
        annualPremium: monthlyPremium * 12,
        website: carrier.website || `https://www.${carrierId}.com`,
        phone: carrier.phone || '1-800-INSURANCE',
        discounts: this.calculateDiscounts(request, carrier),
        strengths: carrier.strengths,
        bestFor: carrier.bestFor,
      })
    }

    // Sort by price (lowest first)
    quotes.sort((a, b) => a.monthlyPremium - b.monthlyPremium)

    // Add savings indicator (compared to highest quote)
    if (quotes.length > 1) {
      const highestQuote = quotes[quotes.length - 1]
      quotes.forEach(quote => {
        quote.savings = Math.round((highestQuote.annualPremium - quote.annualPremium))
      })
    }

    const duration = performance.now() - startTime

    return {
      quotes,
      meta: {
        calculationTime: duration,
        requestId,
        carriersEvaluated: quotes.length,
      },
    }
  }

  /**
   * Calculate premium for a single carrier (ultra-fast, O(1) lookups)
   */
  private calculate(request: QuoteRequest, carrier: CarrierConfig): number {
    if (request.insuranceType === 'auto') {
      return this.calculateAuto(request, carrier)
    } else if (request.insuranceType === 'home') {
      return this.calculateHome(request, carrier)
    } else if (request.insuranceType === 'renters') {
      return this.calculateRenters(request, carrier)
    } else if (request.insuranceType === 'life') {
      return this.calculateLife(request, carrier)
    } else if (request.insuranceType === 'disability') {
      return this.calculateDisability(request, carrier)
    }

    return 0
  }

  /**
   * Auto insurance calculation
   */
  private calculateAuto(request: QuoteRequest, carrier: CarrierConfig): number {
    // Step 1: Base rate (O(1) Map lookup)
    let premium = this.config.baseRates.get(`auto-${request.state}`) || 1800

    // Step 2: Coverage level multiplier (O(1))
    const coverageLevel = request.coverageLevel || 'standard'
    premium *= this.config.coverageLevels.get(`auto-${coverageLevel}`) || 1.0

    // Step 3: Age factor (O(1) array access)
    if (request.age) {
      const ageIndex = Math.min(Math.max(request.age - 16, 0), 104)
      premium *= this.config.ageLookup[ageIndex] || 1.0
    }

    // Step 4: Credit tier (O(1))
    if (request.creditTier) {
      premium *= this.config.creditLookup.get(request.creditTier) || 1.0
    }

    // Step 5: Vehicle type (O(1))
    if (request.vehicleType) {
      premium *= this.config.vehicleTypeLookup.get(request.vehicleType) || 1.0
    }

    // Step 6: Vehicle age (O(1))
    if (request.vehicleYear) {
      const vehicleAge = new Date().getFullYear() - request.vehicleYear
      const ageBracket = vehicleAge <= 1 ? '0-1' : vehicleAge <= 5 ? '2-5' : vehicleAge <= 10 ? '6-10' : '11+'
      premium *= this.config.vehicleAgeLookup.get(ageBracket) || 1.0
    }

    // Step 7: Annual mileage (O(1))
    if (request.annualMileage) {
      const mileageBracket = this.getMileageBracket(request.annualMileage)
      premium *= this.config.mileageLookup.get(mileageBracket) || 1.0
    }

    // Step 8: Violations (O(1))
    if (request.violations !== undefined) {
      const violationKey = request.violations >= 3 ? '3+' : String(request.violations)
      premium *= this.config.violationLookup.get(violationKey) || 1.0
    }

    // Step 9: Deductible adjustment (O(1))
    if (request.deductible) {
      premium *= this.config.deductibles.get(String(request.deductible)) || 1.0
    }

    // Step 10: Carrier regional adjustment (O(1))
    const region = this.getRegion(request.state)
    premium *= carrier.adjustments.regions[region] || 1.0

    // Step 11: Profile type adjustment (O(1))
    const profileType = this.determineProfileType(request)
    premium *= carrier.adjustments.profileTypes[profileType] || 1.0

    // Step 12: Bundle discount
    if (request.bundleHome) {
      premium *= 0.88 // Average bundle discount
    }

    // Step 13: Variance (realistic market fluctuation)
    if (carrier.variance.enabled) {
      const variance = carrier.variance.range
      premium *= 1 + (Math.random() * variance * 2 - variance)
    }

    // Return monthly premium
    return Math.round(premium / 12)
  }

  /**
   * Home insurance calculation
   */
  private calculateHome(request: QuoteRequest, carrier: CarrierConfig): number {
    let premium = this.config.baseRates.get(`home-${request.state}`) || 1250

    const coverageLevel = request.coverageLevel || 'standard'
    premium *= this.config.coverageLevels.get(`home-${coverageLevel}`) || 1.0

    if (request.creditTier) {
      premium *= this.config.creditLookup.get(request.creditTier) || 1.0
    }

    const region = this.getRegion(request.state)
    premium *= carrier.adjustments.regions[region] || 1.0

    if (carrier.variance.enabled) {
      premium *= 1 + (Math.random() * carrier.variance.range * 2 - carrier.variance.range)
    }

    return Math.round(premium / 12)
  }

  /**
   * Renters insurance calculation
   */
  private calculateRenters(request: QuoteRequest, carrier: CarrierConfig): number {
    let premium = this.config.baseRates.get(`renters-${request.state}`) || 180

    if (request.creditTier) {
      premium *= this.config.creditLookup.get(request.creditTier) || 1.0
    }

    const region = this.getRegion(request.state)
    premium *= carrier.adjustments.regions[region] || 1.0

    if (carrier.variance.enabled) {
      premium *= 1 + (Math.random() * carrier.variance.range * 2 - carrier.variance.range)
    }

    return Math.round(premium / 12)
  }

  /**
   * Life insurance calculation
   */
  private calculateLife(request: QuoteRequest, carrier: CarrierConfig): number {
    const lifeType = request.lifeInsuranceType || 'term-20'
    let baseMonthly = 45 // term-20 default
    
    if (lifeType === 'term-30') baseMonthly = 65
    if (lifeType === 'whole') baseMonthly = 220

    // Age multiplier (older = more expensive)
    if (request.age) {
      if (request.age < 30) baseMonthly *= 0.70
      else if (request.age < 40) baseMonthly *= 0.85
      else if (request.age < 50) baseMonthly *= 1.00
      else if (request.age < 60) baseMonthly *= 1.50
      else if (request.age < 70) baseMonthly *= 2.50
      else baseMonthly *= 4.50
    }

    if (carrier.variance.enabled) {
      baseMonthly *= 1 + (Math.random() * carrier.variance.range * 2 - carrier.variance.range)
    }

    return Math.round(baseMonthly)
  }

  /**
   * Disability insurance calculation
   */
  private calculateDisability(request: QuoteRequest, carrier: CarrierConfig): number {
    let premium = 95 // base monthly

    if (request.age) {
      if (request.age < 30) premium *= 0.85
      else if (request.age < 50) premium *= 1.00
      else if (request.age < 60) premium *= 1.35
      else premium *= 1.80
    }

    if (carrier.variance.enabled) {
      premium *= 1 + (Math.random() * carrier.variance.range * 2 - carrier.variance.range)
    }

    return Math.round(premium)
  }

  /**
   * Calculate applicable discounts
   */
  private calculateDiscounts(request: QuoteRequest, carrier: CarrierConfig): Array<{ name: string; amount: number }> {
    const applied: Array<{ name: string; amount: number }> = []

    for (const discount of carrier.discounts) {
      if (!discount.applies.includes(request.insuranceType)) {
        continue
      }

      // Simple discount eligibility logic
      let eligible = false

      if (discount.type === 'multiPolicy' && request.bundleHome) {
        eligible = true
      } else if (discount.type === 'militaryDiscount' && request.isMilitary) {
        eligible = true
      } else if (discount.type === 'goodDriver' && (request.violations === 0 || request.violations === undefined)) {
        eligible = true
      } else if (discount.type === 'homeownerDiscount' && request.isHomeowner) {
        eligible = true
      } else {
        // Random eligibility for other discounts (could be expanded)
        eligible = Math.random() > 0.6
      }

      if (eligible) {
        applied.push({
          name: discount.description,
          amount: discount.value,
        })
      }
    }

    return applied
  }

  /**
   * Helper: Determine mileage bracket
   */
  private getMileageBracket(mileage: number): string {
    if (mileage <= 5000) return '0-5000'
    if (mileage <= 10000) return '5001-10000'
    if (mileage <= 15000) return '10001-15000'
    if (mileage <= 20000) return '15001-20000'
    return '20000+'
  }

  /**
   * Helper: Determine profile type
   */
  private determineProfileType(request: QuoteRequest): string {
    if (request.age && request.age < 25) return 'youngDriver'
    if (request.age && request.age > 65) return 'seniorDriver'
    if (request.creditTier === 'excellent') return 'goodCredit'
    if (request.bundleHome) return 'bundled'
    if (request.violations === 0) return 'cleanRecord'
    return 'standard'
  }

  /**
   * Helper: Get region from state
   */
  private getRegion(state: string): string {
    const regions: Record<string, string[]> = {
      midwest: ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
      south: ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'SC', 'TN', 'TX', 'VA', 'WV'],
      west: ['AK', 'AZ', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'NM', 'OR', 'UT', 'WA', 'WY'],
      northeast: ['CT', 'DE', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'],
    }

    for (const [region, states] of Object.entries(regions)) {
      if (states.includes(state)) return region
    }

    return 'south'
  }

  /**
   * Reload configuration (for development hot-reload)
   */
  reload() {
    this.config = ConfigCompiler.reload()
  }
}

