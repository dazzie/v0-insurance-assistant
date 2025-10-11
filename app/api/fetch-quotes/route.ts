import { NextResponse } from 'next/server'

/**
 * API Route: /api/fetch-quotes
 * 
 * This route integrates with insurance aggregator APIs (like Insurify)
 * to fetch real-time insurance quotes from multiple carriers.
 * 
 * Flow:
 * 1. Receive customer profile from frontend
 * 2. Transform data to aggregator API format
 * 3. Call aggregator API (Insurify, SmartFinancial, etc.)
 * 4. Transform response back to our QuoteResults format
 * 5. Return quotes to frontend
 */

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

    // Check if API key is configured
    const apiKey = process.env.INSURIFY_API_KEY

    if (!apiKey) {
      console.log('[Fetch Quotes] API key not configured, using mock data')
      const mockQuotes = generateMockQuotes(request)
      return NextResponse.json({
        success: true,
        source: 'mock',
        quotes: mockQuotes,
        message: 'Using mock data (API key not configured)',
      })
    }

    // Transform request to Insurify format
    const insurifyPayload = transformToInsurifyFormat(request)
    console.log('[Fetch Quotes] Calling Insurify API...')

    try {
      // Call Insurify API
      const insurifyResponse = await fetchInsurifyQuotes(insurifyPayload)
      console.log('[Fetch Quotes] Insurify response received:', {
        quotesCount: insurifyResponse.quotes?.length || 0,
      })

      // Transform response
      const quotes = transformInsurifyResponse(insurifyResponse)

      return NextResponse.json({
        success: true,
        source: 'insurify',
        quotes,
        requestId: insurifyResponse.request_id,
        message: `Retrieved ${quotes.length} quotes from Insurify`,
      })

    } catch (apiError: any) {
      console.error('[Fetch Quotes] Insurify API failed:', apiError.message)
      
      // Fallback to mock data on API error
      const mockQuotes = generateMockQuotes(request)
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        quotes: mockQuotes,
        error: apiError.message,
        message: 'Using mock data (API call failed)',
      })
    }

  } catch (error: any) {
    console.error('[Fetch Quotes] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
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

