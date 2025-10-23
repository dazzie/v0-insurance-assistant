/**
 * Enhanced DOI Pricing Engine
 * Calculates realistic insurance costs including all additional charges beyond base premium
 */

export interface EnhancedPricingRequest {
  state: string
  zipCode: string
  vehicleYear: number
  vehicleMake: string
  vehicleModel: string
  driverAge: number
  creditTier: 'excellent' | 'good' | 'fair' | 'poor'
  drivingRecord: 'clean' | 'minor' | 'major' | 'high-risk'
  coverageLevel: 'minimum' | 'standard' | 'enhanced' | 'premium'
  paymentMethod: 'annual' | 'semi-annual' | 'quarterly' | 'monthly'
  addOns: string[]
}

export interface EnhancedPricingResult {
  basePremium: number
  additionalCharges: {
    policyFees: number
    stateTaxes: number
    localTaxes: number
    coverageAddOns: number
    riskSurcharges: number
    paymentFees: number
  }
  totalMonthlyPremium: number
  totalAnnualPremium: number
  breakdown: {
    basePremium: number
    policyFee: number
    stateTax: number
    localTax: number
    rentalReimbursement: number
    roadsideAssistance: number
    gapInsurance: number
    newCarReplacement: number
    accidentForgiveness: number
    highRiskSurcharge: number
    luxuryVehicleSurcharge: number
    installmentFee: number
    creditCardFee: number
  }
  savings: {
    annualPaymentDiscount: number
    multiPolicyDiscount: number
    safeDriverDiscount: number
    goodStudentDiscount: number
    antiTheftDiscount: number
    totalSavings: number
  }
}

export class EnhancedDOIPricingEngine {
  
  /**
   * Calculate realistic insurance pricing including all additional charges
   */
  static calculateEnhancedPricing(request: EnhancedPricingRequest): EnhancedPricingResult {
    // Start with DOI base premium
    const basePremium = this.getDOIBasePremium(request)
    
    // Calculate all additional charges
    const additionalCharges = this.calculateAdditionalCharges(request, basePremium)
    
    // Calculate discounts
    const savings = this.calculateSavings(request, basePremium)
    
    // Calculate totals
    const totalAdditionalCharges = Object.values(additionalCharges).reduce((sum, charge) => sum + charge, 0)
    const totalSavings = Object.values(savings).reduce((sum, saving) => sum + saving, 0)
    
    const adjustedPremium = basePremium + totalAdditionalCharges - totalSavings
    const monthlyPremium = this.calculateMonthlyPremium(adjustedPremium, request.paymentMethod)
    
    return {
      basePremium,
      additionalCharges,
      totalMonthlyPremium: monthlyPremium,
      totalAnnualPremium: adjustedPremium,
      breakdown: this.generateDetailedBreakdown(request, basePremium),
      savings
    }
  }
  
  /**
   * Get base premium from DOI data
   */
  private static getDOIBasePremium(request: EnhancedPricingRequest): number {
    // This would integrate with your existing DOI data
    // For now, using state averages from your config
    const stateAverages: Record<string, number> = {
      "CA": 2450, "NY": 2150, "TX": 1650, "FL": 2400, "IL": 1420,
      "PA": 1680, "OH": 1380, "GA": 1880, "NC": 1420, "MI": 2280
    }
    
    return stateAverages[request.state] || 1800
  }
  
  /**
   * Calculate all additional charges beyond base premium
   */
  private static calculateAdditionalCharges(request: EnhancedPricingRequest, basePremium: number) {
    return {
      // Policy fees (annual)
      policyFees: this.calculatePolicyFees(request),
      
      // State and local taxes
      stateTaxes: this.calculateStateTaxes(request, basePremium),
      localTaxes: this.calculateLocalTaxes(request, basePremium),
      
      // Coverage add-ons
      coverageAddOns: this.calculateCoverageAddOns(request),
      
      // Risk-based surcharges
      riskSurcharges: this.calculateRiskSurcharges(request, basePremium),
      
      // Payment method fees
      paymentFees: this.calculatePaymentFees(request, basePremium)
    }
  }
  
  /**
   * Policy fees and administrative charges
   */
  private static calculatePolicyFees(request: EnhancedPricingRequest): number {
    let fees = 0
    
    // Base policy fee
    fees += 35
    
    // Endorsement fees (if any changes)
    fees += 15
    
    // High-risk driver fee
    if (request.drivingRecord === 'high-risk') {
      fees += 100
    }
    
    return fees
  }
  
  /**
   * State insurance taxes
   */
  private static calculateStateTaxes(request: EnhancedPricingRequest, basePremium: number): number {
    const stateTaxRates: Record<string, number> = {
      "CA": 0.025, "NY": 0.02, "TX": 0.015, "FL": 0.03, "IL": 0.01,
      "PA": 0.02, "OH": 0.015, "GA": 0.025, "NC": 0.02, "MI": 0.02
    }
    
    const rate = stateTaxRates[request.state] || 0.02
    return basePremium * rate
  }
  
  /**
   * Local taxes and assessments
   */
  private static calculateLocalTaxes(request: EnhancedPricingRequest, basePremium: number): number {
    let localTax = 0
    
    // Fire department tax (some states)
    if (['CA', 'FL', 'TX'].includes(request.state)) {
      localTax += 12
    }
    
    // Catastrophe fund assessment (hurricane/flood prone areas)
    if (['FL', 'TX', 'LA', 'MS', 'AL', 'GA', 'SC', 'NC'].includes(request.state)) {
      localTax += basePremium * 0.02
    }
    
    return localTax
  }
  
  /**
   * Coverage add-ons and endorsements
   */
  private static calculateCoverageAddOns(request: EnhancedPricingRequest): number {
    let addOns = 0
    
    // Rental reimbursement
    if (request.addOns.includes('rental')) {
      addOns += request.coverageLevel === 'premium' ? 300 : 180
    }
    
    // Roadside assistance
    if (request.addOns.includes('roadside')) {
      addOns += 96
    }
    
    // Gap insurance
    if (request.addOns.includes('gap')) {
      addOns += this.isLuxuryVehicle(request) ? 300 : 144
    }
    
    // New car replacement
    if (request.addOns.includes('newCarReplacement')) {
      addOns += this.isLuxuryVehicle(request) ? 420 : 240
    }
    
    // Accident forgiveness
    if (request.addOns.includes('accidentForgiveness') && request.coverageLevel === 'premium') {
      addOns += 360
    }
    
    return addOns
  }
  
  /**
   * Risk-based surcharges
   */
  private static calculateRiskSurcharges(request: EnhancedPricingRequest, basePremium: number): number {
    let surcharges = 0
    
    // High-risk driver surcharge
    if (request.drivingRecord === 'high-risk') {
      surcharges += basePremium * 0.75 // 75% surcharge
    } else if (request.drivingRecord === 'major') {
      surcharges += basePremium * 0.35 // 35% surcharge
    }
    
    // New driver fee
    if (request.driverAge < 25) {
      surcharges += 150
    }
    
    // Luxury vehicle surcharge
    if (this.isLuxuryVehicle(request)) {
      surcharges += basePremium * 0.15 // 15% surcharge
    }
    
    // High-performance vehicle
    if (this.isHighPerformanceVehicle(request)) {
      surcharges += basePremium * 0.25 // 25% surcharge
    }
    
    return surcharges
  }
  
  /**
   * Payment method fees
   */
  private static calculatePaymentFees(request: EnhancedPricingRequest, basePremium: number): number {
    let fees = 0
    
    // Installment fees (monthly/quarterly payments)
    if (request.paymentMethod === 'monthly') {
      fees += 60 // $5/month * 12
    } else if (request.paymentMethod === 'quarterly') {
      fees += 20 // $5/quarter * 4
    }
    
    // Credit card processing fee
    if (request.paymentMethod !== 'annual') {
      fees += basePremium * 0.025 // 2.5% processing fee
    }
    
    return fees
  }
  
  /**
   * Calculate available discounts
   */
  private static calculateSavings(request: EnhancedPricingRequest, basePremium: number) {
    return {
      // Annual payment discount
      annualPaymentDiscount: request.paymentMethod === 'annual' ? basePremium * 0.05 : 0,
      
      // Multi-policy discount (if applicable)
      multiPolicyDiscount: 0, // Would need to check for other policies
      
      // Safe driver discount
      safeDriverDiscount: request.drivingRecord === 'clean' ? basePremium * 0.10 : 0,
      
      // Good student discount
      goodStudentDiscount: request.driverAge < 25 ? basePremium * 0.05 : 0,
      
      // Anti-theft device discount
      antiTheftDiscount: basePremium * 0.03, // Assume 3% discount
      
      // Total savings
      totalSavings: 0 // Will be calculated
    }
  }
  
  /**
   * Generate detailed breakdown for transparency
   */
  private static generateDetailedBreakdown(request: EnhancedPricingRequest, basePremium: number) {
    return {
      basePremium,
      policyFee: 35,
      stateTax: this.calculateStateTaxes(request, basePremium),
      localTax: this.calculateLocalTaxes(request, basePremium),
      rentalReimbursement: request.addOns.includes('rental') ? (request.coverageLevel === 'premium' ? 300 : 180) : 0,
      roadsideAssistance: request.addOns.includes('roadside') ? 96 : 0,
      gapInsurance: request.addOns.includes('gap') ? (this.isLuxuryVehicle(request) ? 300 : 144) : 0,
      newCarReplacement: request.addOns.includes('newCarReplacement') ? (this.isLuxuryVehicle(request) ? 420 : 240) : 0,
      accidentForgiveness: request.addOns.includes('accidentForgiveness') && request.coverageLevel === 'premium' ? 360 : 0,
      highRiskSurcharge: request.drivingRecord === 'high-risk' ? basePremium * 0.75 : 0,
      luxuryVehicleSurcharge: this.isLuxuryVehicle(request) ? basePremium * 0.15 : 0,
      installmentFee: request.paymentMethod === 'monthly' ? 60 : (request.paymentMethod === 'quarterly' ? 20 : 0),
      creditCardFee: request.paymentMethod !== 'annual' ? basePremium * 0.025 : 0
    }
  }
  
  /**
   * Calculate monthly premium based on payment method
   */
  private static calculateMonthlyPremium(annualPremium: number, paymentMethod: string): number {
    switch (paymentMethod) {
      case 'annual':
        return annualPremium / 12
      case 'semi-annual':
        return annualPremium / 6
      case 'quarterly':
        return annualPremium / 3
      case 'monthly':
        return annualPremium / 12
      default:
        return annualPremium / 12
    }
  }
  
  /**
   * Check if vehicle is luxury
   */
  private static isLuxuryVehicle(request: EnhancedPricingRequest): boolean {
    const luxuryMakes = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Tesla', 'Jaguar', 'Land Rover']
    return luxuryMakes.includes(request.vehicleMake)
  }
  
  /**
   * Check if vehicle is high-performance
   */
  private static isHighPerformanceVehicle(request: EnhancedPricingRequest): boolean {
    const highPerformanceModels = [
      'Corvette', 'Mustang GT', 'Camaro SS', 'Challenger', 'Charger',
      'M3', 'M5', 'AMG', 'RS', 'GT-R', '911', 'Cayman', 'Boxster'
    ]
    
    return highPerformanceModels.some(model => 
      request.vehicleModel.includes(model)
    )
  }
}

/**
 * Integration with existing DOI data
 */
export class DOIEnhancedIntegration {
  
  /**
   * Enhance DOI base rates with realistic additional charges
   */
  static enhanceDOIData(doiBaseRate: number, customerProfile: any): EnhancedPricingResult {
    const request: EnhancedPricingRequest = {
      state: customerProfile.state || 'CA',
      zipCode: customerProfile.zipCode || '90210',
      vehicleYear: customerProfile.vehicles?.[0]?.year || 2020,
      vehicleMake: customerProfile.vehicles?.[0]?.make || 'Honda',
      vehicleModel: customerProfile.vehicles?.[0]?.model || 'Civic',
      driverAge: parseInt(customerProfile.age) || 30,
      creditTier: customerProfile.creditRange || 'good',
      drivingRecord: 'clean', // Would need to be determined from profile
      coverageLevel: 'standard',
      paymentMethod: 'monthly',
      addOns: ['rental', 'roadside'] // Default add-ons
    }
    
    // Override base premium with DOI data
    const result = EnhancedDOIPricingEngine.calculateEnhancedPricing(request)
    result.basePremium = doiBaseRate
    
    return result
  }
}
