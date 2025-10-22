import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { spawn } from 'child_process'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 60

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Call MCP server to enrich data
 */
async function callMCPServer(
  serverPath: string,
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  return new Promise((resolve, reject) => {
    const serverIndexPath = path.join(process.cwd(), serverPath, 'index.js')
    
    const child = spawn('node', [serverIndexPath], {
      cwd: path.join(process.cwd(), serverPath),
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`[MCP] Server exited with code ${code}`)
        console.error(`[MCP] stderr:`, stderr)
        reject(new Error(`MCP server failed with code ${code}`))
        return
      }

      try {
        // Parse the JSON-RPC response
        const lines = stdout.split('\n')
        const resultLine = lines.find((line) => line.includes('"result"'))
        
        if (resultLine) {
          const response = JSON.parse(resultLine)
          const content = response.result?.content?.[0]?.text
          
          if (content) {
            const result = JSON.parse(content)
            resolve(result)
          } else {
            reject(new Error('No content in MCP response'))
          }
        } else {
          reject(new Error('No result in MCP output'))
        }
      } catch (error) {
        console.error('[MCP] Failed to parse response:', error)
        reject(error)
      }
    })

    // Send the JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }

    child.stdin.write(JSON.stringify(request) + '\n')
    child.stdin.end()
  })
}

/**
 * Enrich address data using OpenCage geocoding
 */
async function enrichAddressData(address: string, city: string, state: string, zipCode: string): Promise<any> {
  if (!address || !city || !state || !zipCode) {
    console.log('[Coverage] Incomplete address, skipping OpenCage enrichment')
    return null
  }

  const fullAddress = `${address}, ${city}, ${state} ${zipCode}, USA`
  console.log('[Coverage] Enriching address with OpenCage geocoding:', fullAddress)

  try {
    const geocodeData = await callMCPServer(
      'mcp-server/opencage-server',
      'geocode_address',
      { address: fullAddress }
    )

    console.log('[Coverage] OpenCage response:', JSON.stringify(geocodeData, null, 2))

    if (geocodeData && geocodeData.formatted) {
      console.log(`[Coverage] ✓ Address verified: ${geocodeData.formatted}`)
      
      return {
        enriched: true,
        enrichmentSource: 'OpenCage',
        formattedAddress: geocodeData.formatted,
        latitude: geocodeData.latitude,
        longitude: geocodeData.longitude,
        confidence: geocodeData.confidence,
        components: geocodeData.components
      }
    } else {
      console.log('[Coverage] ⚠️  Address geocoding failed')
      return null
    }
  } catch (error) {
    console.error('[Coverage] Error enriching address:', error)
    return null
  }
}

/**
 * Assess flood risk using First Street Foundation API
 */
async function assessFloodRisk(latitude: number, longitude: number): Promise<any> {
  if (!latitude || !longitude) {
    console.log('[Coverage] Missing coordinates, skipping flood risk assessment')
    return null
  }

  console.log('[Coverage] Assessing flood risk for coordinates:', latitude, longitude)

  try {
    const floodData = await callMCPServer(
      'mcp-server/fema-server',
      'check_flood_zone',
      { latitude, longitude }
    )

    console.log('[Coverage] First Street response:', JSON.stringify(floodData, null, 2))

    if (floodData && floodData.success) {
      console.log(`[Coverage] ✓ Flood risk assessed: ${floodData.riskLevel} (Factor: ${floodData.floodFactor}/10)`)
      
      return {
        floodFactor: floodData.floodFactor,
        riskLevel: floodData.riskLevel,
        floodInsuranceRequired: floodData.floodInsuranceRequired,
        climateChange30Year: floodData.climateChange30Year,
        description: floodData.description || `${floodData.riskLevel} flood risk`,
        enrichmentSource: 'First Street Foundation'
      }
    } else {
      console.log('[Coverage] ⚠️  Flood risk assessment failed')
      return null
    }
  } catch (error) {
    console.error('[Coverage] Error assessing flood risk:', error)
    return null
  }
}

/**
 * Assess crime risk using FBI Crime Data
 */
async function assessCrimeRisk(city: string, state: string): Promise<any> {
  if (!city || !state) {
    console.log('[Coverage] Missing city/state, skipping crime risk assessment')
    return null
  }

  console.log('[Coverage] Assessing crime risk for:', city, state)

  try {
    const crimeData = await callMCPServer(
      'mcp-server/fbi-crime-server',
      'assess_crime_risk',
      { city, state }
    )

    console.log('[Coverage] FBI Crime response:', JSON.stringify(crimeData, null, 2))

    if (crimeData && crimeData.success) {
      console.log(`[Coverage] ✓ Crime risk assessed: ${crimeData.riskLevel} (Index: ${crimeData.crimeIndex})`)
      
      return {
        crimeIndex: crimeData.crimeIndex,
        riskLevel: crimeData.riskLevel,
        violentCrime: crimeData.violentCrime,
        propertyCrime: crimeData.propertyCrime,
        description: crimeData.description,
        enrichmentSource: 'FBI Crime Data'
      }
    } else {
      console.log('[Coverage] ⚠️  Crime risk assessment failed')
      return null
    }
  } catch (error) {
    console.error('[Coverage] Error assessing crime risk:', error)
    return null
  }
}

/**
 * Assess earthquake risk using USGS data
 */
async function assessEarthquakeRisk(latitude: number, longitude: number, state: string): Promise<any> {
  if (!latitude || !longitude || !state) {
    console.log('[Coverage] Missing coordinates/state, skipping earthquake risk assessment')
    return null
  }

  console.log('[Coverage] Assessing earthquake risk for:', latitude, longitude, state)

  try {
    const earthquakeData = await callMCPServer(
      'mcp-server/usgs-earthquake-server',
      'assess_earthquake_risk',
      { latitude, longitude, state }
    )

    console.log('[Coverage] USGS Earthquake response:', JSON.stringify(earthquakeData, null, 2))

    if (earthquakeData && earthquakeData.success) {
      console.log(`[Coverage] ✓ Earthquake risk assessed: ${earthquakeData.riskLevel} (Score: ${earthquakeData.earthquakeRisk}/10)`)
      
      return {
        earthquakeRisk: earthquakeData.earthquakeRisk,
        riskLevel: earthquakeData.riskLevel,
        peakGroundAcceleration: earthquakeData.peakGroundAcceleration,
        seismicZone: earthquakeData.seismicZone,
        description: earthquakeData.description,
        enrichmentSource: 'USGS Earthquake Hazards Program'
      }
    } else {
      console.log('[Coverage] ⚠️  Earthquake risk assessment failed')
      return null
    }
  } catch (error) {
    console.error('[Coverage] Error assessing earthquake risk:', error)
    return null
  }
}

/**
 * Assess wildfire risk using USGS data
 */
async function assessWildfireRisk(latitude: number, longitude: number, state: string): Promise<any> {
  if (!latitude || !longitude || !state) {
    console.log('[Coverage] Missing coordinates/state, skipping wildfire risk assessment')
    return null
  }

  console.log('[Coverage] Assessing wildfire risk for:', latitude, longitude, state)

  try {
    const wildfireData = await callMCPServer(
      'mcp-server/usgs-wildfire-server',
      'assess_wildfire_risk',
      { latitude, longitude, state }
    )

    console.log('[Coverage] USGS Wildfire response:', JSON.stringify(wildfireData, null, 2))

    if (wildfireData && wildfireData.success) {
      console.log(`[Coverage] ✓ Wildfire risk assessed: ${wildfireData.riskLevel} (Score: ${wildfireData.wildfireRisk}/10)`)
      
      return {
        wildfireRisk: wildfireData.wildfireRisk,
        riskLevel: wildfireData.riskLevel,
        wuiZone: wildfireData.wuiZone,
        fireDangerIndex: wildfireData.fireDangerIndex,
        description: wildfireData.description,
        enrichmentSource: 'USGS Wildfire Risk to Communities'
      }
    } else {
      console.log('[Coverage] ⚠️  Wildfire risk assessment failed')
      return null
    }
  } catch (error) {
    console.error('[Coverage] Error assessing wildfire risk:', error)
    return null
  }
}

/**
 * Enrich vehicle data using NHTSA VIN decoder
 */
async function enrichVehicleData(vehicles: any[]): Promise<any[]> {
  if (!vehicles || vehicles.length === 0) {
    return vehicles
  }

  console.log('[Coverage] Enriching vehicle data with NHTSA VIN decoder...')

  const enrichedVehicles = await Promise.all(
    vehicles.map(async (vehicle) => {
      if (!vehicle.vin) {
        console.log('[Coverage] Vehicle missing VIN, skipping enrichment')
        return vehicle
      }

      try {
        console.log(`[Coverage] Decoding VIN: ${vehicle.vin}`)
        const vinData = await callMCPServer(
          'mcp-server/nhtsa-server',
          'decode_vin',
          { vin: vehicle.vin }
        )

        if (vinData.success) {
          console.log(`[Coverage] ✓ VIN decoded: ${vinData.year} ${vinData.make} ${vinData.model}`)
          
          // Merge NHTSA data with existing vehicle data
          return {
            ...vehicle,
            // Use NHTSA data as authoritative source
            year: vinData.year || vehicle.year,
            make: vinData.make || vehicle.make,
            model: vinData.model || vehicle.model,
            // Add enriched data
            bodyClass: vinData.bodyClass,
            fuelType: vinData.fuelType,
            doors: vinData.doors,
            manufacturer: vinData.manufacturer,
            plantCity: vinData.plantCity,
            plantState: vinData.plantState,
            vehicleType: vinData.vehicleType,
            gvwr: vinData.gvwr,
            // Safety features
            abs: vinData.abs,
            esc: vinData.esc,
            // Mark as enriched
            enriched: true,
            enrichmentSource: 'NHTSA',
          }
        } else {
          console.log(`[Coverage] ⚠️  VIN decode failed: ${vinData.error}`)
          
          // Check if it's an NHTSA API issue
          const isNHTSADown = vinData.error?.includes('503') || 
                             vinData.error?.includes('temporarily unavailable') ||
                             vinData.error?.includes('NHTSA API')
          
          return {
            ...vehicle,
            enrichmentError: isNHTSADown 
              ? 'NHTSA Vehicle Database temporarily unavailable - VIN enrichment will be retried automatically'
              : vinData.error,
            enriched: false,
            enrichmentSource: isNHTSADown ? 'NHTSA (Down)' : 'NHTSA (Error)',
          }
        }
      } catch (error) {
        console.error(`[Coverage] Error enriching vehicle:`, error)
        
        // Check if it's an MCP server communication issue
        const isMCPServerError = error instanceof Error && 
          (error.message.includes('MCP server failed') || 
           error.message.includes('No result in MCP output') ||
           error.message.includes('Failed to parse response'))
        
        return {
          ...vehicle,
          enrichmentError: isMCPServerError 
            ? 'Vehicle enrichment service temporarily unavailable - will retry automatically'
            : (error instanceof Error ? error.message : 'Unknown error'),
          enriched: false,
          enrichmentSource: isMCPServerError ? 'MCP Server (Down)' : 'Error',
        }
      }
    })
  )

  const successCount = enrichedVehicles.filter((v) => v.enriched).length
  console.log(`[Coverage] ✓ Enriched ${successCount}/${vehicles.length} vehicles`)

  return enrichedVehicles
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const insuranceType = formData.get('insuranceType') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const fileType = file.type
    let extractedText = ''

    // Generate insurance-type-specific extraction prompt
    const getExtractionPrompt = (type: string | null) => {
      const baseFields = `
1. CUSTOMER INFORMATION: Full name, date of birth, INSURED'S MAILING ADDRESS (street, city, state, ZIP - NOT lienholder address), email, phone number
2. POLICY DETAILS: Carrier name, policy number, effective date, expiration date, agent name/contact
3. COVERAGE INFORMATION: Types of coverage, limits, deductibles, premiums (monthly/annual)
4. TOTAL PREMIUM: Total cost and payment frequency (monthly, semi-annual, annual)
5. COVERAGE GAPS: Identify any gaps or under-insured areas
6. RECOMMENDATIONS: Suggest improvements for better protection`

      const typeSpecificFields: Record<string, string> = {
        auto: `${baseFields}
7. VEHICLE DETAILS: For each vehicle - Year, make, model, VIN, usage (personal/business/commute), annual mileage
8. DRIVER INFORMATION: For each driver - Full name, date of birth, relationship to policyholder, license number, years licensed
9. GARAGING ADDRESS: Where vehicles are primarily kept (use INSURED'S address if not explicitly stated as different - DO NOT use lienholder address)
10. LIENHOLDER: If present, extract lienholder name and address separately (this is NOT the customer's address)
11. COVERAGE TYPES: Liability (bodily injury/property damage limits), Collision (deductible), Comprehensive (deductible), Uninsured/Underinsured Motorist, Personal Injury Protection, Medical Payments, Rental Reimbursement, Roadside Assistance
12. DISCOUNTS: Multi-car, good driver, safety features, bundling, etc.

IMPORTANT: The INSURED'S address (where the policyholder lives) is typically at the top of the policy. The LIENHOLDER address (bank/finance company) is a separate entity and should NOT be used as the customer's address or garaging address unless explicitly stated.`,

        home: `${baseFields}
7. PROPERTY DETAILS: Full property address, property type (single-family, condo, townhouse), year built, square footage, construction type
8. HOMEOWNER INFORMATION: Owner name(s), mortgage lender (if applicable), mortgage account number
9. COVERAGE AMOUNTS: Dwelling coverage, other structures, personal property, loss of use, personal liability, medical payments
10. REPLACEMENT COST: Estimated replacement cost, actual cash value vs replacement cost coverage
11. ADDITIONAL COVERAGES: Water backup, earthquake, flood, valuable items, identity theft
12. HOME FEATURES: Security system, fire alarm, sprinkler system, roof age, electrical/plumbing updates
13. DISCOUNTS: Multi-policy, security system, claims-free, age of home, etc.`,

        life: `${baseFields}
7. INSURED PERSON: Full name, date of birth, health status, smoker/non-smoker status
8. BENEFICIARY INFORMATION: Primary and contingent beneficiaries (names, relationships, percentages, contact info)
9. POLICY TYPE: Term, Whole, Universal, Variable - with specific details
10. COVERAGE AMOUNT: Death benefit amount, term length (if term life)
11. CASH VALUE: Current cash value, loan amount (if applicable)
12. RIDERS: Accidental death, waiver of premium, accelerated death benefit, etc.`,

        renters: `${baseFields}
7. RENTAL PROPERTY: Full address, landlord name/contact, lease start date
8. RENTER INFORMATION: Tenant name(s), number of occupants
9. PERSONAL PROPERTY: Coverage limit, contents valuation (actual cash value vs replacement cost)
10. LIABILITY COVERAGE: Personal liability limit, medical payments to others
11. ADDITIONAL LIVING EXPENSES: Coverage amount if rental becomes uninhabitable
12. VALUABLE ITEMS: Special coverage for jewelry, electronics, bikes, etc.`,

        pet: `${baseFields}
7. PET INFORMATION: Pet name, species, breed, date of birth/age, microchip number
8. OWNER INFORMATION: Owner name, relationship to pet
9. VETERINARIAN: Primary vet name, clinic, contact information
10. COVERAGE DETAILS: Annual coverage limit, reimbursement rate (70%, 80%, 90%), deductible
11. COVERED CONDITIONS: Accidents, illnesses, hereditary conditions, wellness coverage
12. PRE-EXISTING CONDITIONS: Any excluded conditions`,

        health: `${baseFields}
7. SUBSCRIBER INFORMATION: Primary subscriber name, date of birth, employee/member ID
8. DEPENDENTS: Names and dates of birth of covered family members
9. PLAN TYPE: HMO, PPO, EPO, POS - with network name
10. COVERAGE DETAILS: Deductible (individual/family), out-of-pocket maximum, copays, coinsurance
11. PRESCRIPTION COVERAGE: Formulary tier, copays for generic/brand/specialty drugs
12. NETWORK INFORMATION: In-network providers, preferred facilities
13. EFFECTIVE DATES: Coverage start and renewal dates`,

        disability: `${baseFields}
7. INSURED PERSON: Full name, date of birth, occupation, income
8. BENEFIT DETAILS: Monthly benefit amount, benefit period (2 years, 5 years, to age 65)
9. ELIMINATION PERIOD: Waiting period before benefits begin (30, 60, 90, 180 days)
10. DEFINITION OF DISABILITY: Own occupation, any occupation, modified own occupation
11. RIDERS: Cost of living adjustment, residual disability, future increase option
12. COORDINATION: How it coordinates with Social Security, workers' comp, other policies`,

        umbrella: `${baseFields}
7. UMBRELLA COVERAGE: Liability coverage limit (typically $1M-$5M)
8. UNDERLYING POLICIES: Required underlying auto and home liability limits
9. COVERED INCIDENTS: Personal liability, rental properties, worldwide coverage
10. EXCLUSIONS: Business activities, intentional acts, professional services
11. ADDITIONAL INSUREDS: Family members covered under the policy`
      }

      return typeSpecificFields[type || ''] || baseFields
    }

    // Handle different file types
    if (fileType.startsWith('image/')) {
      // Convert image to base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = buffer.toString('base64')
      const imageUrl = `data:${fileType};base64,${base64Image}`

      // Use GPT-4 Vision to analyze the image
      console.log('[Coverage] Starting OpenAI Vision analysis...')
      const visionStartTime = Date.now()

      try {
        // Add timeout to prevent hanging
        const visionPromise = openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an insurance document extraction agent. Extract ALL readable information from insurance policy documents and return ONLY valid JSON. Be thorough and precise with all customer info, policy details, coverage amounts, and dates.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this ${insuranceType || 'insurance'} policy document and extract all relevant information. Focus on:

${getExtractionPrompt(insuranceType)}

Return the information in a structured JSON format with ALL available fields:
{
  "customerName": "string",
  "dateOfBirth": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "email": "string",
  "phone": "string",
  "carrier": "string",
  "policyNumber": "string",
  "effectiveDate": "string",
  "expirationDate": "string",
  "agentName": "string",
  "agentContact": "string",
  "coverageType": "auto|home|life|renters|pet|health|disability|umbrella",
  "vehicles": [{"year": number, "make": "string", "model": "string", "vin": "string", "usage": "string", "annualMileage": number}],
  "drivers": [{"name": "string", "dateOfBirth": "string", "relationship": "string", "licenseNumber": "string", "yearsLicensed": number}],
  "garagingAddress": "string",
  "propertyAddress": "string",
  "propertyType": "string",
  "yearBuilt": number,
  "squareFootage": number,
  "mortgageLender": "string",
  "coverages": [{"type": "string", "limit": "string", "deductible": "string", "premium": "string"}],
  "dwellingCoverage": "string",
  "personalProperty": "string",
  "liability": "string",
  "totalPremium": "string",
  "paymentFrequency": "string",
  "discounts": ["string"],
  "gaps": ["string"],
  "recommendations": ["string"]
}

Be thorough and extract all visible information from the policy document.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 2000,
        })

        const response = await visionPromise

        const visionDuration = Date.now() - visionStartTime
        console.log(`[Coverage] ✅ OpenAI Vision analysis complete in ${visionDuration}ms`)
        extractedText = response.choices[0]?.message?.content || '{}'
        console.log('[Coverage] Raw extracted text:', extractedText.substring(0, 200))
      } catch (openaiError) {
        console.error('[Coverage] OpenAI API error:', openaiError)
        throw new Error(`OpenAI Vision API failed: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`)
      }
    } else if (fileType === 'application/pdf') {
      // PDF parsing is not supported - guide users to convert to images
      // This is the industry-standard approach for document analysis
      return NextResponse.json(
        {
          error: 'PDF format not supported',
          message: 'For best results, please convert your PDF to an image (JPG or PNG) or take a screenshot of your policy pages.',
          suggestion: 'Screenshots work great! Just press Cmd+Shift+4 (Mac) or Windows+Shift+S (Windows) to capture your policy document. GPT-4 Vision works best with clear images.',
        },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Parse the extracted JSON from GPT-4
    let coverage
    try {
      // Extract JSON from the response (GPT might wrap it in markdown)
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        coverage = JSON.parse(jsonMatch[0])
        console.log('[Coverage] Successfully parsed JSON. Fields found:', Object.keys(coverage).join(', '))
        console.log('[Coverage] Sample data:', JSON.stringify({
          carrier: coverage.carrier,
          policyNumber: coverage.policyNumber,
          customerName: coverage.customerName,
          totalPremium: coverage.totalPremium
        }))
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('[Coverage] Failed to parse GPT response:', parseError)
      console.log('[Coverage] Raw response:', extractedText)

      // Return a fallback response
      coverage = {
        carrier: 'Unable to extract',
        message: 'Document uploaded but automated analysis failed. Please review manually.',
        rawAnalysis: extractedText,
        gaps: ['Unable to perform automated analysis'],
        recommendations: ['Please review your policy manually or upload a clearer image'],
      }
    }

    // 🚀 SKIP ENRICHMENT FOR SPEED - Return basic extracted data immediately
    console.log('[Coverage] ⚡ Skipping enrichment for faster response...')
    
    // Set basic enrichment summary
    const enrichmentSummary = {
      vehiclesEnriched: false,
      addressEnriched: false,
      floodRiskAssessed: false,
      crimeRiskAssessed: false,
      earthquakeRiskAssessed: false,
      wildfireRiskAssessed: false,
      skipped: true,
      reason: 'Enrichment skipped for faster processing'
    }

    console.log('[Coverage] 📊 Basic analysis complete - enrichment skipped for speed')

    return NextResponse.json({
      success: true,
      coverage,
      enrichmentSummary,
      message: 'Document analyzed successfully (enrichment skipped for speed)',
    })
  } catch (error) {
    console.error('Coverage analysis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze coverage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
