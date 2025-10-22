import { NextResponse } from 'next/server'
import { QuoteEngine } from '@/lib/quote-engine/engine'
import type { QuoteRequest as EngineQuoteRequest } from '@/lib/quote-engine/types'

/**
 * API Route: /api/fetch-quotes
 * 
 * This route generates insurance quotes using our high-performance rating engine
 * with configurable carrier data and rating factors.
 * 
 * Flow:
 * 1. Receive customer profile from frontend
 * 2. Transform data to quote engine format
 * 3. Calculate quotes using rating engine (JSON config-based)
 * 4. Transform response to frontend format
 * 5. Return quotes
 */

// Initialize quote engine (singleton, stays in memory)
const quoteEngine = new QuoteEngine()

// Type definitions for better type safety
interface CustomerProfile {
  firstName?: string
  lastName?: string
  age?: string | number
  zipCode?: string
  location?: string
  email?: string
  phone?: string
  vehicles?: Array<{
    year: number
    make: string
    model: string
    vin?: string
    primaryUse?: string
    annualMileage?: number
  }>
  driversCount?: number
  drivers?: Array<{
    name: string
    age: string | number
    yearsLicensed?: string | number
  }>
  currentInsurer?: string
  currentPremium?: string
  maritalStatus?: string
  homeOwnership?: string
}

interface QuoteRequest {
  insuranceType: string
  customerProfile: CustomerProfile
  coveragePreferences?: {
    liability?: string
    comprehensiveDeductible?: number
    collisionDeductible?: number
  }
}

interface CarrierQuote {
  carrierName: string
  rating: number
  monthlyPremium: number
  annualPremium: number
  coverageAmount: string
  deductible: string
  features: string[]
  strengths: string[]
  contactInfo: {
    phone: string
    website: string
    email?: string
  }
  savings?: number
  bestFor: string[]
  nextSteps: {
    discountInquiries: string[]
    coverageDiscussion: string[]
    claimsProcess: string[]
    policyFlexibility: string[]
    actionItems: string[]
  }
}

/**
 * Transform customer profile to Insurify API format
 */
function transformToInsurifyFormat(request: QuoteRequest): any {
  const { customerProfile, insuranceType, coveragePreferences } = request

  // Extract age as number
  const age = typeof customerProfile.age === 'string' 
    ? parseInt(customerProfile.age) 
    : customerProfile.age || 25

  return {
    product_type: insuranceType.toLowerCase(),
    zip_code: customerProfile.zipCode || extractZipFromLocation(customerProfile.location),
    
    // Driver information
    drivers: [{
      first_name: customerProfile.firstName || 'Customer',
      last_name: customerProfile.lastName || 'Unknown',
      age: age,
      gender: 'male', // Would need to collect this
      marital_status: customerProfile.maritalStatus || 'single',
      license_status: 'valid',
      years_licensed: 5, // Would need to collect this
    }],
    
    // Vehicle information
    vehicles: customerProfile.vehicles?.map(v => ({
      year: v.year,
      make: v.make,
      model: v.model,
      vin: v.vin,
      ownership: 'owned',
      primary_use: transformPrimaryUse(v.primaryUse),
      annual_mileage: v.annualMileage || 12000,
    })) || [],
    
    // Current insurance
    current_insurance: {
      carrier: customerProfile.currentInsurer || 'Unknown',
      premium: parseFloat(customerProfile.currentPremium?.replace(/[$,]/g, '') || '0'),
      has_insurance: !!customerProfile.currentInsurer,
    },
    
    // Coverage preferences
    coverage_preferences: coveragePreferences || {
      liability: '100/300/100',
      comprehensive_deductible: 500,
      collision_deductible: 500,
    },
  }
}

/**
 * Transform Insurify response to our format
 */
function transformInsurifyResponse(insurifyResponse: any): CarrierQuote[] {
  return insurifyResponse.quotes?.map((quote: any, index: number) => ({
    carrierName: quote.carrier_name,
    rating: quote.carrier_rating || 4.5,
    monthlyPremium: Math.round(quote.monthly_premium),
    annualPremium: Math.round(quote.annual_premium),
    coverageAmount: quote.coverage_amount || '$500,000',
    deductible: `$${quote.deductible || 1000}`,
    features: quote.features || [
      'Liability Coverage',
      'Collision Coverage',
      'Comprehensive Coverage',
      '24/7 Roadside Assistance',
    ],
    strengths: quote.strengths || [
      'Competitive pricing',
      'Good customer service',
      'Easy claims process',
    ],
    contactInfo: {
      phone: quote.contact_phone || '1-800-INSURANCE',
      website: quote.website || getCarrierWebsite(quote.carrier_name),
      email: quote.contact_email,
    },
    savings: index === 0 ? quote.estimated_savings : undefined,
    bestFor: quote.best_for || ['General Coverage'],
    nextSteps: {
      discountInquiries: quote.available_discounts || [
        'Ask about multi-policy discount',
        'Inquire about safe driver discount',
      ],
      coverageDiscussion: [
        'Discuss liability limits',
        'Review deductible options',
      ],
      claimsProcess: [
        'Understand claims filing process',
        'Ask about claims response time',
      ],
      policyFlexibility: [
        'Discuss payment options',
        'Ask about policy modification process',
      ],
      actionItems: [
        `Contact ${quote.carrier_name} at ${quote.contact_phone || '1-800-INSURANCE'}`,
        'Request detailed policy information',
        'Schedule consultation with agent',
      ],
    },
  })) || []
}

/**
 * Helper: Extract ZIP code from location string
 */
function extractZipFromLocation(location?: string): string {
  if (!location) return '00000'
  const zipMatch = location.match(/\d{5}/)
  return zipMatch ? zipMatch[0] : '00000'
}

/**
 * Helper: Transform primary use to API format
 */
function transformPrimaryUse(use?: string): string {
  if (!use) return 'commute'
  const lowerUse = use.toLowerCase()
  if (lowerUse.includes('commute') || lowerUse.includes('work')) return 'commute'
  if (lowerUse.includes('business')) return 'business'
  if (lowerUse.includes('pleasure') || lowerUse.includes('personal')) return 'pleasure'
  return 'commute'
}

/**
 * Helper: Get carrier website
 */
function getCarrierWebsite(carrierName: string): string {
  const websites: { [key: string]: string } = {
    'State Farm': 'https://www.statefarm.com',
    'GEICO': 'https://www.geico.com',
    'Progressive': 'https://www.progressive.com',
    'Allstate': 'https://www.allstate.com',
    'USAA': 'https://www.usaa.com',
    'Liberty Mutual': 'https://www.libertymutual.com',
    'Farmers': 'https://www.farmers.com',
    'Nationwide': 'https://www.nationwide.com',
  }
  return websites[carrierName] || 'https://www.insurance.com'
}

/**
 * Helper: Get carrier phone number
 */
function getCarrierPhone(carrierId: string): string {
  const phones: { [key: string]: string } = {
    'state-farm': '1-800-STATE-FARM',
    'geico': '1-800-861-8380',
    'progressive': '1-800-PROGRESSIVE',
    'allstate': '1-800-ALLSTATE',
    'usaa': '1-800-531-USAA',
    'liberty-mutual': '1-800-837-5254',
    'farmers': '1-800-FARMERS',
    'nationwide': '1-800-421-3535',
    'travelers': '1-800-252-4633',
    'american-family': '1-800-692-6326',
  }
  return phones[carrierId] || '1-800-INSURANCE'
}

/**
 * Call Insurify API
 */
async function fetchInsurifyQuotes(payload: any): Promise<any> {
  const apiKey = process.env.INSURIFY_API_KEY
  const apiUrl = process.env.INSURIFY_API_URL || 'https://api.insurify.com/v1'

  if (!apiKey) {
    throw new Error('INSURIFY_API_KEY not configured')
  }

  const response = await fetch(`${apiUrl}/quotes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.error('[Insurify API Error]:', error)
    throw new Error(`Insurify API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Generate mock quotes as fallback
 * (Used when API key is not configured or API fails)
 */
function generateMockQuotes(request: QuoteRequest): CarrierQuote[] {
  const { generateInsuranceComparisons } = require('@/lib/insurance-comparison-generator')
  return generateInsuranceComparisons(
    request.insuranceType,
    request.customerProfile,
    4
  )
}

/**
 * POST /api/fetch-quotes
 * Main API endpoint
 */
export async function POST(req: Request) {
  try {
    const request: QuoteRequest = await req.json()

    console.log('[Fetch Quotes] Request received:', {
      insuranceType: request.insuranceType,
      zip: request.customerProfile.zipCode,
      vehicles: request.customerProfile.vehicles?.length || 0,
    })

    // Validate request
    if (!request.insuranceType || !request.customerProfile) {
      return NextResponse.json(
        { error: 'Invalid request: missing insuranceType or customerProfile' },
        { status: 400 }
      )
    }

    // Transform to quote engine format
    const engineRequest: EngineQuoteRequest = transformToEngineFormat(request)
    
    console.log('[Fetch Quotes] Generating quotes with rating engine...')
    const result = quoteEngine.generateQuotes(engineRequest)
    
    console.log(`[Fetch Quotes] ✅ Generated ${result.quotes.length} quotes in ${result.meta.calculationTime.toFixed(2)}ms`)
    console.log('[Fetch Quotes] Sample quote from engine:', result.quotes[0])

    // Transform to frontend format
    const quotes = result.quotes.map((quote, index) => ({
      carrierName: quote.carrierName,
      rating: parseFloat(quote.rating.replace(/\+/g, '')),
      monthlyPremium: quote.monthlyPremium,
      annualPremium: quote.annualPremium,
      coverageAmount: request.customerProfile.vehicles?.[0] 
        ? 'Actual Cash Value' 
        : request.insuranceType === 'home' ? '$500,000' : '$50,000',
      deductible: engineRequest.deductible?.toString() || '1000',
      features: generateFeatures(request.insuranceType),
      strengths: quote.strengths,
      contactInfo: {
        phone: quote.phone,
        website: quote.website,
      },
      savings: quote.savings,
      bestFor: quote.bestFor,
      nextSteps: generateNextSteps(quote.carrierName),
    }))

    console.log('[Fetch Quotes] Sample transformed quote:', quotes[0])

    return NextResponse.json({
      success: true,
      source: 'rating_engine',
      quotes,
      requestId: result.meta.requestId,
      message: `Generated ${quotes.length} quotes using rating engine`,
      meta: {
        calculationTime: result.meta.calculationTime,
        carriersEvaluated: result.meta.carriersEvaluated,
      },
    })

  } catch (error: any) {
    console.error('[Fetch Quotes] Error:', error)
    
    // Fallback to mock data on error
    try {
      const mockQuotes = generateMockQuotes(request)
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        quotes: mockQuotes,
        error: error.message,
        message: 'Using mock data (rating engine failed)',
      })
    } catch {
      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: error.message,
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Transform frontend request to quote engine format
 */
function transformToEngineFormat(request: QuoteRequest): EngineQuoteRequest {
  const { customerProfile, insuranceType } = request
  
  const age = typeof customerProfile.age === 'string' 
    ? parseInt(customerProfile.age) 
    : customerProfile.age || 30

  // Extract state from ZIP or location
  let state = customerProfile.zipCode?.substring(0, 2) || 'CA'
  if (customerProfile.location?.includes(',')) {
    const parts = customerProfile.location.split(',')
    if (parts.length >= 2) {
      const stateAbbr = parts[parts.length - 1].trim().split(' ')
      if (stateAbbr.length > 0) {
        state = stateAbbr[0].substring(0, 2).toUpperCase()
      }
    }
  }

  const engineRequest: EngineQuoteRequest = {
    state,
    insuranceType: insuranceType.toLowerCase() as any,
    age,
    zipCode: customerProfile.zipCode || '00000',
  }

  // Auto insurance specific
  if (insuranceType.toLowerCase() === 'auto' && customerProfile.vehicles?.length) {
    const vehicle = customerProfile.vehicles[0]
    engineRequest.vehicleYear = vehicle.year
    engineRequest.vehicleType = determineVehicleType(vehicle.make, vehicle.model)
    engineRequest.annualMileage = vehicle.annualMileage || 12000
    engineRequest.coverageLevel = 'standard'
    engineRequest.deductible = 1000
    engineRequest.violations = 0
    engineRequest.creditTier = 'good'
  }

  // Home insurance specific
  if (insuranceType.toLowerCase() === 'home') {
    engineRequest.coverageLevel = 'standard'
    engineRequest.creditTier = 'good'
  }

  // Renters insurance specific
  if (insuranceType.toLowerCase() === 'renters') {
    engineRequest.creditTier = 'good'
  }

  // Determine if military (for USAA eligibility)
  engineRequest.isMilitary = false

  // Bundle discount
  engineRequest.bundleHome = customerProfile.homeOwnership === 'own'
  engineRequest.isHomeowner = customerProfile.homeOwnership === 'own'

  return engineRequest
}

/**
 * Determine vehicle type from make/model
 */
function determineVehicleType(make?: string, model?: string): string {
  if (!make || !model) return 'sedan'
  
  const combined = `${make} ${model}`.toLowerCase()
  
  if (combined.includes('suv') || combined.includes('explorer') || combined.includes('pilot')) return 'suv'
  if (combined.includes('truck') || combined.includes('f-150') || combined.includes('silverado')) return 'truck'
  if (combined.includes('corvette') || combined.includes('mustang') || combined.includes('911')) return 'sports'
  if (combined.includes('bmw') || combined.includes('mercedes') || combined.includes('audi') || combined.includes('lexus')) return 'luxury'
  if (combined.includes('tesla') || combined.includes('leaf') || combined.includes('bolt')) return 'electric'
  if (combined.includes('prius') || combined.includes('hybrid')) return 'hybrid'
  if (combined.includes('odyssey') || combined.includes('caravan')) return 'minivan'
  
  return 'sedan'
}

/**
 * Generate features based on insurance type
 */
function generateFeatures(insuranceType: string): string[] {
  const baseFeatures = [
    '24/7 Claims Support',
    'Online Policy Management',
    'Mobile App',
    'Flexible Payment Options',
  ]
  
  if (insuranceType.toLowerCase() === 'auto') {
    return [
      ...baseFeatures,
      'Roadside Assistance',
      'Rental Car Coverage',
      'Comprehensive Coverage',
      'Collision Coverage',
    ]
  }
  
  return baseFeatures
}

/**
 * Generate next steps for carrier
 */
function generateNextSteps(carrierName: string) {
  return {
    discountInquiries: [
      'Ask about multi-policy discount',
      'Inquire about safe driver discount',
      'Check for loyalty discounts',
    ],
    coverageDiscussion: [
      'Discuss liability limits',
      'Review deductible options',
      'Consider additional coverage',
    ],
    claimsProcess: [
      'Understand claims filing process',
      'Ask about claims response time',
      'Verify repair shop network',
    ],
    policyFlexibility: [
      'Discuss payment options',
      'Ask about policy modification process',
      'Understand cancellation terms',
    ],
    actionItems: [
      `Contact ${carrierName} for final quote`,
      'Request detailed policy information',
      'Schedule consultation with agent',
    ],
  }
}

/**
 * GET /api/fetch-quotes
 * Health check endpoint
 */
export async function GET() {
  const hasApiKey = !!process.env.INSURIFY_API_KEY
  
  return NextResponse.json({
    status: 'ok',
    apiConfigured: hasApiKey,
    mode: hasApiKey ? 'live' : 'mock',
    timestamp: new Date().toISOString(),
  })
}

