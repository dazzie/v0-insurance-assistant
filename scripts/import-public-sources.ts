#!/usr/bin/env node

/**
 * Import public insurance data sources for RAG
 * Run with: npx tsx scripts/import-public-sources.ts
 */

import { EmbeddingService } from '../lib/rag/services/embedding-service'
import { ContentIngestion } from '../lib/rag/utils/content-ingestion'
import { VectorizeClient } from '../lib/rag/core/vectorize-client'
import type { InsuranceKnowledge, CarrierIntelligence } from '../lib/rag/types'
import * as fs from 'fs'
import * as path from 'path'

// Public API endpoints (no auth required)
const PUBLIC_APIS = {
  // NHTSA Vehicle Safety API
  nhtsa: {
    baseUrl: 'https://api.nhtsa.gov/SafetyRatings',
    endpoints: {
      modelYears: '/modelyear',
      makes: '/modelyear/{year}',
      models: '/modelyear/{year}/make/{make}',
      vehicles: '/modelyear/{year}/make/{make}/model/{model}',
      vehicleId: '/VehicleId/{id}'
    }
  },

  // FEMA Disaster & Flood Data
  fema: {
    baseUrl: 'https://www.fema.gov/api/open',
    endpoints: {
      disasters: '/v2/DisasterDeclarationsSummaries',
      flood: '/v1/FemaWebDisasterSummaries'
    }
  },

  // US Census API (requires free API key)
  census: {
    baseUrl: 'https://api.census.gov/data',
    endpoints: {
      population: '/2021/acs/acs5',
      income: '/2021/acs/acs5/subject'
    }
  }
}

// State insurance department websites with requirements
const STATE_REQUIREMENTS = [
  {
    state: 'CA',
    name: 'California',
    minimumAuto: '15/30/5',
    description: 'California requires $15,000 bodily injury per person, $30,000 per accident, $5,000 property damage',
    source: 'California Department of Insurance',
    url: 'https://www.insurance.ca.gov',
    additional: ['Uninsured motorist coverage required unless waived', 'Proof of financial responsibility required']
  },
  {
    state: 'TX',
    name: 'Texas',
    minimumAuto: '30/60/25',
    description: 'Texas requires $30,000 bodily injury per person, $60,000 per accident, $25,000 property damage',
    source: 'Texas Department of Insurance',
    url: 'https://www.tdi.texas.gov',
    additional: ['Personal Injury Protection (PIP) required unless rejected in writing', 'At-fault state']
  },
  {
    state: 'FL',
    name: 'Florida',
    minimumAuto: 'PIP $10,000/PDL $10,000',
    description: 'Florida requires $10,000 Personal Injury Protection and $10,000 Property Damage Liability',
    source: 'Florida Office of Insurance Regulation',
    url: 'https://www.floir.com',
    additional: ['No-fault state', 'Bodily injury liability not required unless certain violations']
  },
  {
    state: 'NY',
    name: 'New York',
    minimumAuto: '25/50/10',
    description: 'New York requires $25,000 bodily injury per person, $50,000 per accident, $10,000 property damage',
    source: 'New York Department of Financial Services',
    url: 'https://www.dfs.ny.gov',
    additional: ['$50,000 Personal Injury Protection required', 'Uninsured motorist 25/50 required', 'No-fault state']
  },
  {
    state: 'PA',
    name: 'Pennsylvania',
    minimumAuto: '15/30/5',
    description: 'Pennsylvania requires $15,000 bodily injury per person, $30,000 per accident, $5,000 property damage',
    source: 'Pennsylvania Insurance Department',
    url: 'https://www.insurance.pa.gov',
    additional: ['First party benefits (medical) $5,000 required', 'Choice of tort options']
  },
  {
    state: 'IL',
    name: 'Illinois',
    minimumAuto: '25/50/20',
    description: 'Illinois requires $25,000 bodily injury per person, $50,000 per accident, $20,000 property damage',
    source: 'Illinois Department of Insurance',
    url: 'https://insurance.illinois.gov',
    additional: ['Uninsured motorist coverage 25/50 required', 'At-fault state']
  },
  {
    state: 'OH',
    name: 'Ohio',
    minimumAuto: '25/50/25',
    description: 'Ohio requires $25,000 bodily injury per person, $50,000 per accident, $25,000 property damage',
    source: 'Ohio Department of Insurance',
    url: 'https://insurance.ohio.gov',
    additional: ['At-fault state', 'Proof of financial responsibility required']
  },
  {
    state: 'GA',
    name: 'Georgia',
    minimumAuto: '25/50/25',
    description: 'Georgia requires $25,000 bodily injury per person, $50,000 per accident, $25,000 property damage',
    source: 'Georgia Office of Insurance',
    url: 'https://oci.georgia.gov',
    additional: ['At-fault state', 'Uninsured motorist coverage offered but can be rejected']
  },
  {
    state: 'NC',
    name: 'North Carolina',
    minimumAuto: '30/60/25',
    description: 'North Carolina requires $30,000 bodily injury per person, $60,000 per accident, $25,000 property damage',
    source: 'North Carolina Department of Insurance',
    url: 'https://www.ncdoi.gov',
    additional: ['Uninsured motorist coverage required', 'At-fault state']
  },
  {
    state: 'MI',
    name: 'Michigan',
    minimumAuto: '50/100/10',
    description: 'Michigan requires $50,000 bodily injury per person, $100,000 per accident, $10,000 property damage',
    source: 'Michigan Department of Insurance',
    url: 'https://www.michigan.gov/difs',
    additional: ['No-fault state', 'Personal Injury Protection (PIP) required', 'Unique unlimited medical benefits option']
  }
]

// Insurance carrier public information
const CARRIER_INFO = [
  {
    name: 'GEICO',
    marketShare: '13.76%',
    amBestRating: 'A++',
    customerSatisfaction: 4.2,
    strengths: ['Digital experience', '24/7 service', 'Competitive rates', 'Mobile claims'],
    weaknesses: ['Limited agent support', 'Less personalized service'],
    bestFor: ['Tech-savvy customers', 'Safe drivers', 'Good credit'],
    website: 'https://www.geico.com'
  },
  {
    name: 'State Farm',
    marketShare: '16.84%',
    amBestRating: 'A++',
    customerSatisfaction: 4.4,
    strengths: ['Large agent network', 'Personal service', 'Bundle discounts', 'Claims handling'],
    weaknesses: ['Higher prices for high-risk', 'Less online flexibility'],
    bestFor: ['Families', 'Bundle policies', 'Want agent relationship'],
    website: 'https://www.statefarm.com'
  },
  {
    name: 'Progressive',
    marketShare: '13.76%',
    amBestRating: 'A+',
    customerSatisfaction: 4.0,
    strengths: ['High-risk drivers', 'Usage-based insurance', 'Name Your Price', 'Online tools'],
    weaknesses: ['Customer service consistency', 'Rate increases'],
    bestFor: ['High-risk drivers', 'Young drivers', 'Custom coverage'],
    website: 'https://www.progressive.com'
  },
  {
    name: 'Allstate',
    marketShare: '10.69%',
    amBestRating: 'A+',
    customerSatisfaction: 4.1,
    strengths: ['Drivewise program', 'Local agents', 'Accident forgiveness', 'Bundle options'],
    weaknesses: ['Price for minimum coverage', 'Claim disputes'],
    bestFor: ['Families', 'Bundle needs', 'Want rewards programs'],
    website: 'https://www.allstate.com'
  },
  {
    name: 'USAA',
    marketShare: '6.52%',
    amBestRating: 'A++',
    customerSatisfaction: 4.8,
    strengths: ['Best customer service', 'Military expertise', 'Excellent claims', 'Competitive rates'],
    weaknesses: ['Military only', 'No local agents'],
    bestFor: ['Military members and families'],
    website: 'https://www.usaa.com'
  },
  {
    name: 'Liberty Mutual',
    marketShare: '6.05%',
    amBestRating: 'A',
    customerSatisfaction: 3.9,
    strengths: ['Customizable policies', 'New car replacement', 'Bundle discounts'],
    weaknesses: ['Mixed reviews', 'Rate increases'],
    bestFor: ['Custom coverage needs', 'New car owners'],
    website: 'https://www.libertymutual.com'
  },
  {
    name: 'Farmers',
    marketShare: '5.47%',
    amBestRating: 'A',
    customerSatisfaction: 3.8,
    strengths: ['Coverage options', 'Rideshare coverage', 'Local agents'],
    weaknesses: ['Price competitiveness', 'Claim times'],
    bestFor: ['Rideshare drivers', 'Need specialized coverage'],
    website: 'https://www.farmers.com'
  },
  {
    name: 'Nationwide',
    marketShare: '4.73%',
    amBestRating: 'A+',
    customerSatisfaction: 4.0,
    strengths: ['SmartRide program', 'Accident forgiveness', 'Bundle options'],
    weaknesses: ['Limited availability', 'Price for young drivers'],
    bestFor: ['Safe drivers', 'Bundle needs'],
    website: 'https://www.nationwide.com'
  }
]

// Insurance terms and definitions
const INSURANCE_TERMS = [
  {
    term: 'Deductible',
    definition: 'The amount you pay out of pocket before insurance coverage kicks in. Higher deductibles typically mean lower premiums.',
    example: 'With a $500 deductible and $3,000 in damage, you pay $500 and insurance covers $2,500.'
  },
  {
    term: 'Premium',
    definition: 'The amount you pay for your insurance policy, typically monthly, semi-annually, or annually.',
    example: 'A $150/month premium means you pay $1,800/year for coverage.'
  },
  {
    term: 'Liability Coverage',
    definition: 'Covers damage and injuries you cause to others. Includes bodily injury and property damage liability.',
    example: '25/50/25 means $25k per person injury, $50k per accident injury, $25k property damage.'
  },
  {
    term: 'Comprehensive Coverage',
    definition: 'Covers non-collision damage: theft, vandalism, weather, fire, animals, falling objects.',
    example: 'If a tree falls on your car or it\'s stolen, comprehensive coverage pays for repairs/replacement.'
  },
  {
    term: 'Collision Coverage',
    definition: 'Covers damage to your vehicle from accidents with other vehicles or objects.',
    example: 'If you hit another car or a guardrail, collision coverage pays for your car\'s repairs.'
  },
  {
    term: 'Uninsured/Underinsured Motorist',
    definition: 'Protects you if hit by a driver with no insurance or insufficient insurance.',
    example: 'If an uninsured driver hits you, this coverage pays for your injuries and damages.'
  },
  {
    term: 'Personal Injury Protection (PIP)',
    definition: 'No-fault coverage paying for medical expenses, lost wages, and other benefits regardless of fault.',
    example: 'In no-fault states, PIP covers your medical bills immediately after an accident.'
  },
  {
    term: 'Gap Insurance',
    definition: 'Covers the difference between what you owe on a car loan and the car\'s actual cash value if totaled.',
    example: 'You owe $20k on your loan but car is worth $15k when totaled - gap insurance pays the $5k difference.'
  },
  {
    term: 'SR-22',
    definition: 'Certificate of financial responsibility proving you have minimum liability coverage, required after serious violations.',
    example: 'After a DUI, you may need an SR-22 for 3 years to maintain your license.'
  },
  {
    term: 'Actual Cash Value (ACV)',
    definition: 'The value of your vehicle accounting for depreciation - what it\'s worth at time of loss.',
    example: 'Your 5-year-old car that cost $30k new might have an ACV of only $15k.'
  }
]

async function importPublicSources() {
  console.log('🌐 Importing Public Insurance Data Sources\n')

  try {
    const embeddingService = new EmbeddingService()
    const vectorizeClient = new VectorizeClient()
    const contentIngestion = new ContentIngestion(vectorizeClient, embeddingService)

    // Prepare knowledge base documents
    const knowledgeDocuments: InsuranceKnowledge[] = []

    // 1. Add state requirements
    console.log('1️⃣ Processing state insurance requirements...')
    for (const state of STATE_REQUIREMENTS) {
      const content = `${state.description}. ${state.additional.join('. ')}.
        Minimum coverage: ${state.minimumAuto}.
        Source: ${state.source} (${state.url})`

      knowledgeDocuments.push({
        id: `${state.state.toLowerCase()}_auto_requirements`,
        type: 'regulation',
        state: state.state,
        insuranceType: 'auto',
        title: `${state.name} Auto Insurance Requirements`,
        content,
        metadata: {
          lastUpdated: new Date(),
          source: state.source,
          relevanceScore: 1.0,
          tags: ['requirements', 'minimum coverage', state.state, 'auto']
        }
      })
    }

    // 2. Add insurance terms
    console.log('2️⃣ Processing insurance terminology...')
    for (const item of INSURANCE_TERMS) {
      knowledgeDocuments.push({
        id: `term_${item.term.toLowerCase().replace(/\s+/g, '_')}`,
        type: 'definition',
        insuranceType: 'auto',
        title: item.term,
        content: `${item.definition} Example: ${item.example}`,
        metadata: {
          lastUpdated: new Date(),
          source: 'Insurance Information Institute',
          relevanceScore: 0.9,
          tags: ['definition', 'terminology', item.term.toLowerCase()]
        }
      })
    }

    // 3. Process carrier information
    console.log('3️⃣ Processing carrier intelligence...')
    const carrierDocuments: CarrierIntelligence[] = []

    for (const carrier of CARRIER_INFO) {
      const content = `${carrier.name} has ${carrier.marketShare} market share with an AM Best rating of ${carrier.amBestRating}.
        Strengths: ${carrier.strengths.join(', ')}.
        Best for: ${carrier.bestFor.join(', ')}.
        Customer satisfaction: ${carrier.customerSatisfaction}/5.`

      carrierDocuments.push({
        id: `${carrier.name.toLowerCase().replace(/\s+/g, '_')}_profile`,
        carrier: carrier.name,
        category: 'profile',
        content,
        ratings: {
          overallSatisfaction: carrier.customerSatisfaction,
          claimsSatisfaction: carrier.customerSatisfaction - 0.2, // Approximate
          priceValue: carrier.customerSatisfaction - 0.1 // Approximate
        },
        idealCustomer: {
          ageRange: [18, 80], // Default range
          riskProfile: ['low', 'medium', 'high'],
          coverageNeeds: ['basic', 'standard', 'comprehensive']
        }
      })
    }

    // 4. Fetch NHTSA vehicle safety data (sample)
    console.log('4️⃣ Fetching vehicle safety data from NHTSA...')
    try {
      const vehicleSafetyData = await fetchVehicleSafetyData()
      knowledgeDocuments.push(...vehicleSafetyData)
    } catch (error) {
      console.log('   ⚠️ Could not fetch NHTSA data (may need API key or connection issue)')
    }

    // 5. Ingest all documents
    console.log('5️⃣ Ingesting documents into vector database...')
    await contentIngestion.ingestKnowledge(knowledgeDocuments)
    await contentIngestion.ingestCarrierData(carrierDocuments)

    // 6. Save to files for Vectorize.io upload
    const outputDir = path.join(process.cwd(), 'public-insurance-data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    console.log('6️⃣ Saving data files for Vectorize.io...')

    // Save knowledge documents
    fs.writeFileSync(
      path.join(outputDir, 'insurance-knowledge.json'),
      JSON.stringify(knowledgeDocuments, null, 2)
    )

    // Save carrier documents
    fs.writeFileSync(
      path.join(outputDir, 'carrier-intelligence.json'),
      JSON.stringify(carrierDocuments, null, 2)
    )

    console.log('\n✅ Import complete!')
    console.log(`📁 Data saved to: ${outputDir}`)
    console.log(`📊 Total documents processed:`)
    console.log(`   - Knowledge base: ${knowledgeDocuments.length} documents`)
    console.log(`   - Carrier intelligence: ${carrierDocuments.length} documents`)
    console.log('\n📤 You can now upload these files to Vectorize.io dashboard')

  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Fetch vehicle safety data from NHTSA (example)
async function fetchVehicleSafetyData(): Promise<InsuranceKnowledge[]> {
  const documents: InsuranceKnowledge[] = []

  // Sample popular vehicles (in production, fetch more comprehensively)
  const popularVehicles = [
    { year: 2024, make: 'TOYOTA', model: 'Camry' },
    { year: 2024, make: 'HONDA', model: 'Accord' },
    { year: 2024, make: 'TESLA', model: 'Model 3' },
    { year: 2024, make: 'FORD', model: 'F-150' }
  ]

  for (const vehicle of popularVehicles) {
    try {
      const url = `${PUBLIC_APIS.nhtsa.baseUrl}/modelyear/${vehicle.year}/make/${vehicle.make}/model/${vehicle.model}`
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()

        if (data.Results && data.Results.length > 0) {
          const result = data.Results[0]
          const content = `${vehicle.year} ${vehicle.make} ${vehicle.model} has a ${result.OverallRating || 'N/A'} star safety rating.
            Frontal crash: ${result.OverallFrontCrashRating || 'N/A'} stars.
            Side crash: ${result.OverallSideCrashRating || 'N/A'} stars.
            Rollover: ${result.RolloverRating || 'N/A'} stars.`

          documents.push({
            id: `safety_${vehicle.year}_${vehicle.make}_${vehicle.model}`.toLowerCase().replace(/\s+/g, '_'),
            type: 'policy',
            insuranceType: 'auto',
            title: `${vehicle.year} ${vehicle.make} ${vehicle.model} Safety Rating`,
            content,
            metadata: {
              lastUpdated: new Date(),
              source: 'NHTSA',
              relevanceScore: 0.85,
              tags: ['safety', 'vehicle', vehicle.make.toLowerCase(), vehicle.model.toLowerCase()]
            }
          })
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Could not fetch data for ${vehicle.make} ${vehicle.model}`)
    }
  }

  return documents
}

// Run import
importPublicSources().catch(console.error)