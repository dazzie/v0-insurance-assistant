/**
 * Competitive Pricing Intelligence System
 * Analyzes DOI data to suggest optimal pricing strategies
 */

interface PricingStrategy {
  recommendedPrice: number;
  confidence: 'high' | 'medium' | 'low';
  strategy: string;
  reasoning: string[];
  profitMargin: number;
  winProbability: number;
  competitiveAdvantage: string;
  coverageDetails: CoverageDetails;
  currentPolicyAnalysis?: CurrentPolicyAnalysis;
}

interface CurrentPolicyAnalysis {
  currentPremium: number;
  currentCarrier: string;
  currentCoverage: {
    liability: string;
    deductibles: string;
    additionalCoverages: string[];
  };
  competitiveAdvantage: {
    priceSavings: number;
    coverageImprovements: string[];
    additionalBenefits: string[];
  };
  renewalStrategy: {
    approach: string;
    keySellingPoints: string[];
    riskMitigation: string[];
  };
}

interface CoverageDetails {
  liability: {
    bodilyInjury: string;
    propertyDamage: string;
    uninsuredMotorist: string;
  };
  physicalDamage: {
    collision: string;
    comprehensive: string;
  };
  additionalCoverages: Array<{
    name: string;
    limit: string;
    premium: number;
    description: string;
  }>;
  deductibles: {
    collision: string;
    comprehensive: string;
  };
  discounts: Array<{
    name: string;
    amount: string;
    description: string;
  }>;
  coverageLevel: {
    name: string;
    description: string;
    features: string[];
    liabilityExplanation: string;
  };
}

interface MarketAnalysis {
  lowestCompetitor: number;
  highestCompetitor: number;
  averageMarket: number;
  marketSpread: number;
  yourPosition: 'aggressive' | 'competitive' | 'premium' | 'unknown';
}

export class CompetitivePricingEngine {
  
  /**
   * Generate detailed coverage information
   */
  private static generateCoverageDetails(
    customerProfile: any,
    coverageLevel: string,
    recommendedPrice: number
  ): CoverageDetails {
    const isTesla = customerProfile.vehicles?.[0]?.make?.toLowerCase() === 'tesla';
    const isLuxury = isTesla || customerProfile.vehicles?.[0]?.make?.toLowerCase().includes('bmw') || 
                     customerProfile.vehicles?.[0]?.make?.toLowerCase().includes('mercedes');
    
    // Enhanced coverage levels with detailed explanations
    const coverageLevels = {
      aggressive: {
        name: 'Basic Protection',
        description: 'Minimum required coverage for budget-conscious drivers',
        liability: { bi: '100/300', pd: '100', explanation: 'Covers $100K per person, $300K per accident' },
        um: '100/300',
        deductibles: { collision: '1000', comp: '1000' },
        features: ['Basic liability', 'State minimums', 'No frills']
      },
      competitive: {
        name: 'Standard Protection',
        description: 'Balanced coverage for most drivers with good protection',
        liability: { bi: '250/500', pd: '250', explanation: 'Covers $250K per person, $500K per accident' },
        um: '250/500',
        deductibles: { collision: '500', comp: '500' },
        features: ['Enhanced liability', 'Uninsured motorist', 'Rental reimbursement']
      },
      premium: {
        name: 'Comprehensive Protection',
        description: 'Maximum coverage for high-value assets and peace of mind',
        liability: { bi: '500/1000', pd: '500', explanation: 'Covers $500K per person, $1M per accident' },
        um: '500/1000',
        deductibles: { collision: '250', comp: '250' },
        features: ['Maximum liability', 'Full coverage', 'Premium services']
      }
    };

    // Use the passed coverage level directly
    const coverageLevelKey = coverageLevel as 'aggressive' | 'competitive' | 'premium';
    const selectedLevel = coverageLevels[coverageLevelKey] || coverageLevels.competitive;
    
    // Adjust for luxury vehicles
    if (isLuxury && coverageLevelKey !== 'premium') {
      selectedLevel.liability.bi = '500/1000';
      selectedLevel.liability.pd = '500';
      selectedLevel.um = '500/1000';
      selectedLevel.description += ' (Enhanced for luxury vehicle)';
    }

    return {
      liability: {
        bodilyInjury: selectedLevel.liability.bi,
        propertyDamage: selectedLevel.liability.pd,
        uninsuredMotorist: selectedLevel.um
      },
      physicalDamage: {
        collision: 'Actual Cash Value',
        comprehensive: 'Actual Cash Value'
      },
      additionalCoverages: [
        {
          name: 'Rental Reimbursement',
          limit: coverageLevelKey === 'premium' ? '$50/day, $1500 max' : '$30/day, $900 max',
          premium: coverageLevelKey === 'premium' ? 25 : 15,
          description: 'Covers rental car while your vehicle is being repaired'
        },
        {
          name: 'Roadside Assistance',
          limit: 'Unlimited',
          premium: 8,
          description: '24/7 towing, jump starts, lockout service'
        },
        {
          name: 'Gap Coverage',
          limit: 'Actual Cash Value',
          premium: isLuxury ? 25 : 12,
          description: 'Covers difference between loan balance and ACV'
        },
        {
          name: 'New Car Replacement',
          limit: '2 years/24k miles',
          premium: isLuxury ? 35 : 20,
          description: 'Replaces with new vehicle if totaled within 2 years'
        },
        ...(coverageLevelKey === 'premium' ? [{
          name: 'Accident Forgiveness',
          limit: '1 accident',
          premium: 30,
          description: 'First accident won\'t increase your rates'
        }] : []),
        ...(coverageLevelKey === 'premium' ? [{
          name: 'Vanishing Deductible',
          limit: '$100/year reduction',
          premium: 20,
          description: 'Deductible decreases $100 for each claim-free year'
        }] : [])
      ],
      deductibles: {
        collision: selectedLevel.deductibles.collision,
        comprehensive: selectedLevel.deductibles.comp
      },
      discounts: [
        {
          name: 'Multi-Policy Discount',
          amount: '15%',
          description: 'Bundle with home/renters insurance'
        },
        {
          name: 'Good Driver Discount',
          amount: '10%',
          description: 'No accidents or violations in 3 years'
        },
        {
          name: 'Safety Features',
          amount: '5%',
          description: 'Anti-lock brakes, airbags, anti-theft'
        },
        {
          name: 'Paperless Billing',
          amount: '3%',
          description: 'Receive bills and documents electronically'
        },
        ...(isLuxury ? [{
          name: 'Luxury Vehicle Discount',
          amount: '8%',
          description: 'Advanced safety features in luxury vehicles'
        }] : [])
      ],
      coverageLevel: {
        name: selectedLevel.name,
        description: selectedLevel.description,
        features: selectedLevel.features,
        liabilityExplanation: selectedLevel.liability.explanation
      }
    };
  }

  /**
   * Analyze current policy for competitive renewal pricing
   */
  private static analyzeCurrentPolicy(
    currentPolicy: any,
    recommendedPrice: number,
    coverageDetails: CoverageDetails
  ): CurrentPolicyAnalysis {
    const currentPremium = currentPolicy.monthlyPremium || currentPolicy.annualPremium / 12;
    const priceSavings = currentPremium - recommendedPrice;
    
    // Analyze coverage improvements
    const coverageImprovements = [];
    const additionalBenefits = [];
    
    // Compare liability coverage
    const currentLiability = currentPolicy.liability || '100/300';
    const recommendedLiability = coverageDetails.liability.bodilyInjury;
    
    if (this.isBetterCoverage(recommendedLiability, currentLiability)) {
      coverageImprovements.push(`Enhanced liability: ${currentLiability} → ${recommendedLiability}`);
    }
    
    // Compare deductibles
    const currentDeductible = currentPolicy.deductible || '1000';
    const recommendedDeductible = coverageDetails.deductibles.collision;
    
    if (parseInt(recommendedDeductible) < parseInt(currentDeductible)) {
      coverageImprovements.push(`Lower deductible: $${currentDeductible} → $${recommendedDeductible}`);
    }
    
    // Check for additional coverages not in current policy
    const currentAdditional = currentPolicy.additionalCoverages || [];
    coverageDetails.additionalCoverages.forEach(coverage => {
      if (!currentAdditional.some((c: any) => c.name === coverage.name)) {
        additionalBenefits.push(`${coverage.name}: ${coverage.description}`);
      }
    });
    
    // Determine renewal strategy
    let approach = 'Price-focused renewal';
    if (priceSavings > 50) {
      approach = 'Aggressive price undercut';
    } else if (priceSavings > 20) {
      approach = 'Competitive pricing with value-add';
    } else if (priceSavings > 0) {
      approach = 'Slight price advantage with enhanced coverage';
    } else {
      approach = 'Value-focused renewal with coverage improvements';
    }
    
    return {
      currentPremium,
      currentCarrier: currentPolicy.carrier || 'Current Carrier',
      currentCoverage: {
        liability: currentLiability,
        deductibles: currentDeductible,
        additionalCoverages: currentAdditional.map((c: any) => c.name)
      },
      competitiveAdvantage: {
        priceSavings,
        coverageImprovements,
        additionalBenefits
      },
      renewalStrategy: {
        approach,
        keySellingPoints: this.generateKeySellingPoints(priceSavings, coverageImprovements, additionalBenefits),
        riskMitigation: this.generateRiskMitigation(currentPolicy, coverageDetails)
      }
    };
  }

  /**
   * Check if recommended coverage is better than current
   */
  private static isBetterCoverage(recommended: string, current: string): boolean {
    const recParts = recommended.split('/');
    const curParts = current.split('/');
    
    if (recParts.length === 2 && curParts.length === 2) {
      const recPerPerson = parseInt(recParts[0]);
      const recPerAccident = parseInt(recParts[1]);
      const curPerPerson = parseInt(curParts[0]);
      const curPerAccident = parseInt(curParts[1]);
      
      return recPerPerson > curPerPerson || recPerAccident > curPerAccident;
    }
    
    return recommended !== current;
  }

  /**
   * Generate key selling points for renewal
   */
  private static generateKeySellingPoints(
    priceSavings: number,
    coverageImprovements: string[],
    additionalBenefits: string[]
  ): string[] {
    const points = [];
    
    if (priceSavings > 0) {
      points.push(`Save $${priceSavings.toFixed(0)}/month ($${(priceSavings * 12).toFixed(0)}/year)`);
    }
    
    if (coverageImprovements.length > 0) {
      points.push(`Enhanced coverage: ${coverageImprovements.join(', ')}`);
    }
    
    if (additionalBenefits.length > 0) {
      points.push(`Additional benefits: ${additionalBenefits.slice(0, 2).join(', ')}`);
    }
    
    points.push('Same or better coverage at a competitive price');
    points.push('Personalized service and local support');
    
    return points;
  }

  /**
   * Generate risk mitigation strategies
   */
  private static generateRiskMitigation(currentPolicy: any, coverageDetails: CoverageDetails): string[] {
    const strategies = [];
    
    strategies.push('Maintain or improve current coverage levels');
    strategies.push('Ensure seamless transition with no coverage gaps');
    strategies.push('Provide detailed coverage comparison and explanation');
    strategies.push('Offer additional risk management services');
    
    if (currentPolicy.claimsHistory && currentPolicy.claimsHistory.length > 0) {
      strategies.push('Address any previous claims and demonstrate improved risk profile');
    }
    
    return strategies;
  }

  /**
   * Analyze DOI data and suggest optimal pricing strategy
   */
  static analyzePricing(
    customerProfile: any,
    yourQuote: number,
    targetCarrier: string = 'Progressive',
    coverageLevel: string = 'competitive',
    currentPolicy?: any
  ): PricingStrategy {
    
    // Get official rates for this profile
    const officialRates = this.getOfficialRatesForProfile(customerProfile);
    
    if (!officialRates) {
      return this.getFallbackStrategy(yourQuote);
    }
    
    // Analyze market position
    const marketAnalysis = this.analyzeMarketPosition(officialRates, targetCarrier);
    
    // Calculate optimal pricing
    const optimalPrice = this.calculateOptimalPrice(
      officialRates,
      marketAnalysis,
      yourQuote,
      targetCarrier
    );
    
    // Determine strategy and reasoning
    const strategy = this.determineStrategy(optimalPrice, marketAnalysis, yourQuote);
    
    // Generate detailed coverage information
    const coverageDetails = this.generateCoverageDetails(customerProfile, coverageLevel, optimalPrice);
    
    // Analyze current policy if provided
    let currentPolicyAnalysis;
    if (currentPolicy) {
      currentPolicyAnalysis = this.analyzeCurrentPolicy(currentPolicy, optimalPrice, coverageDetails);
    }
    
    return {
      recommendedPrice: optimalPrice,
      confidence: this.calculateConfidence(marketAnalysis),
      strategy: strategy.name,
      reasoning: strategy.reasoning,
      profitMargin: this.calculateProfitMargin(optimalPrice, yourQuote),
      winProbability: this.calculateWinProbability(optimalPrice, marketAnalysis),
      competitiveAdvantage: strategy.advantage,
      coverageDetails,
      currentPolicyAnalysis
    };
  }
  
  /**
   * Get official rates for a specific profile
   */
  private static getOfficialRatesForProfile(profile: any) {
    // This would integrate with your DOI data
    // For now, return mock data based on profile characteristics
    const baseRates = {
      'CA': {
        'Tesla': { Progressive: 138, GEICO: 143, StateFarm: 158, Allstate: 175 },
        'Honda': { Progressive: 132, GEICO: 138, StateFarm: 152, Allstate: 168 },
        'Toyota': { Progressive: 82, GEICO: 85, StateFarm: 96, Allstate: 107 }
      },
      'NY': {
        'Tesla': { Progressive: 154, GEICO: 160, StateFarm: 175, Allstate: 196 },
        'Honda': { Progressive: 183, GEICO: 190, StateFarm: 204, Allstate: 223 },
        'Toyota': { Progressive: 82, GEICO: 88, StateFarm: 98, Allstate: 107 }
      }
    };
    
    const state = profile.state || 'CA';
    const vehicle = profile.vehicle?.make || 'Tesla';
    
    return baseRates[state]?.[vehicle] || baseRates['CA']['Tesla'];
  }
  
  /**
   * Analyze market position relative to competitors
   */
  private static analyzeMarketPosition(rates: any, targetCarrier: string): MarketAnalysis {
    const rateValues = Object.values(rates) as number[];
    const targetRate = rates[targetCarrier] || rateValues[0];
    
    return {
      lowestCompetitor: Math.min(...rateValues),
      highestCompetitor: Math.max(...rateValues),
      averageMarket: rateValues.reduce((a, b) => a + b, 0) / rateValues.length,
      marketSpread: Math.max(...rateValues) - Math.min(...rateValues),
      yourPosition: this.determinePosition(targetRate, rateValues)
    };
  }
  
  /**
   * Calculate optimal price for maximum profit while staying competitive
   */
  private static calculateOptimalPrice(
    rates: any,
    market: MarketAnalysis,
    yourQuote: number,
    targetCarrier: string
  ): number {
    
    // Strategy 1: Beat the lowest competitor by 2-5%
    const aggressivePrice = market.lowestCompetitor * 0.95;
    
    // Strategy 2: Position between lowest and average
    const competitivePrice = market.lowestCompetitor + (market.averageMarket - market.lowestCompetitor) * 0.3;
    
    // Strategy 3: Premium positioning (if market allows)
    const premiumPrice = market.averageMarket * 1.05;
    
    // Strategy 4: Your current quote (if already competitive)
    const currentPrice = yourQuote;
    
    // Choose best strategy based on market conditions
    if (market.marketSpread > 30) {
      // High spread = room for competitive pricing
      return Math.max(aggressivePrice, competitivePrice);
    } else if (market.marketSpread < 15) {
      // Tight market = premium positioning
      return Math.min(premiumPrice, yourQuote * 1.02);
    } else {
      // Balanced market = competitive positioning
      return competitivePrice;
    }
  }
  
  /**
   * Determine pricing strategy and reasoning
   */
  private static determineStrategy(
    optimalPrice: number,
    market: MarketAnalysis,
    yourQuote: number
  ): { name: string; reasoning: string[]; advantage: string } {
    
    const priceDiff = optimalPrice - yourQuote;
    const marketPosition = this.determinePosition(optimalPrice, Object.values(market));
    
    if (priceDiff < -10) {
      return {
        name: 'Aggressive Pricing',
        reasoning: [
          `Beat lowest competitor by $${Math.abs(priceDiff).toFixed(0)}`,
          'High win probability with thin margins',
          'Good for volume-based business'
        ],
        advantage: 'Price leadership in market'
      };
    } else if (priceDiff > 10) {
      return {
        name: 'Premium Positioning',
        reasoning: [
          `Position $${priceDiff.toFixed(0)} above current quote`,
          'Focus on value proposition over price',
          'Target quality-conscious customers'
        ],
        advantage: 'Higher margins with selective wins'
      };
    } else {
      return {
        name: 'Competitive Pricing',
        reasoning: [
          'Positioned within market range',
          'Balanced approach to price vs. margin',
          'Good win probability with decent margins'
        ],
        advantage: 'Balanced competitive position'
      };
    }
  }
  
  /**
   * Calculate confidence level in recommendation
   */
  private static calculateConfidence(market: MarketAnalysis): 'high' | 'medium' | 'low' {
    if (market.marketSpread > 25) return 'high';
    if (market.marketSpread > 15) return 'medium';
    return 'low';
  }
  
  /**
   * Calculate profit margin
   */
  private static calculateProfitMargin(optimalPrice: number, yourQuote: number): number {
    return ((optimalPrice - yourQuote) / yourQuote) * 100;
  }
  
  /**
   * Calculate win probability based on pricing
   */
  private static calculateWinProbability(price: number, market: MarketAnalysis): number {
    if (price < market.lowestCompetitor) return 0.9;
    if (price < market.averageMarket) return 0.7;
    if (price < market.highestCompetitor) return 0.5;
    return 0.3;
  }
  
  /**
   * Determine market position
   */
  private static determinePosition(price: number, marketRates: number[]): 'aggressive' | 'competitive' | 'premium' | 'unknown' {
    const sorted = [...marketRates].sort((a, b) => a - b);
    const percentile = sorted.findIndex(rate => rate >= price) / sorted.length;
    
    if (percentile < 0.25) return 'aggressive';
    if (percentile < 0.75) return 'competitive';
    return 'premium';
  }
  
  /**
   * Fallback strategy when no DOI data available
   */
  private static getFallbackStrategy(yourQuote: number): PricingStrategy {
    return {
      recommendedPrice: yourQuote * 0.95,
      confidence: 'low',
      strategy: 'Conservative Pricing',
      reasoning: [
        'No official data available',
        'Conservative 5% discount recommended',
        'Focus on relationship building'
      ],
      profitMargin: -5,
      winProbability: 0.6,
      competitiveAdvantage: 'Relationship-based selling'
    };
  }
  
  /**
   * Generate pricing insights for multiple scenarios
   */
  static generatePricingScenarios(customerProfile: any, yourQuote: number) {
    const scenarios = [];
    
    // Scenario 1: Beat Progressive
    scenarios.push(this.analyzePricing(customerProfile, yourQuote, 'Progressive'));
    
    // Scenario 2: Beat GEICO
    scenarios.push(this.analyzePricing(customerProfile, yourQuote, 'GEICO'));
    
    // Scenario 3: Beat State Farm
    scenarios.push(this.analyzePricing(customerProfile, yourQuote, 'State Farm'));
    
    return scenarios;
  }
  
  /**
   * Get market intelligence summary
   */
  static getMarketIntelligence(customerProfile: any) {
    const rates = this.getOfficialRatesForProfile(customerProfile);
    if (!rates) return null;
    
    const rateValues = Object.values(rates) as number[];
    const carriers = Object.keys(rates);
    
    return {
      marketLeader: carriers[rateValues.indexOf(Math.min(...rateValues))],
      marketLaggard: carriers[rateValues.indexOf(Math.max(...rateValues))],
      priceSpread: Math.max(...rateValues) - Math.min(...rateValues),
      averageRate: rateValues.reduce((a, b) => a + b, 0) / rateValues.length,
      opportunity: this.findOpportunity(rates),
      recommendation: this.getMarketRecommendation(rates)
    };
  }
  
  private static findOpportunity(rates: any): string {
    const rateValues = Object.values(rates) as number[];
    const spread = Math.max(...rateValues) - Math.min(...rateValues);
    
    if (spread > 30) return 'High opportunity - significant price variation';
    if (spread > 15) return 'Medium opportunity - moderate price variation';
    return 'Low opportunity - tight market pricing';
  }
  
  private static getMarketRecommendation(rates: any): string {
    const rateValues = Object.values(rates) as number[];
    const average = rateValues.reduce((a, b) => a + b, 0) / rateValues.length;
    const lowest = Math.min(...rateValues);
    
    if (average - lowest > 20) {
      return 'Position between lowest and average for optimal win rate';
    } else {
      return 'Market is tight - focus on value proposition';
    }
  }
}
