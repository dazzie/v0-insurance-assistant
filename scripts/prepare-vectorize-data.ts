#!/usr/bin/env node

/**
 * Prepare data for Vectorize.io upload
 * Generates CSV/JSON files with embeddings that can be uploaded via the Vectorize.io dashboard
 * Run with: npx tsx scripts/prepare-vectorize-data.ts
 */

import { EmbeddingService } from '../lib/rag/services/embedding-service'
import * as fs from 'fs'
import * as path from 'path'

// Sample insurance knowledge data
const INSURANCE_KNOWLEDGE = [
  {
    id: 'ca_auto_min_2024',
    type: 'regulation',
    state: 'CA',
    insurance_type: 'auto',
    title: 'California Minimum Auto Insurance Requirements',
    content: 'California requires all drivers to carry minimum liability insurance: Bodily Injury $15,000 per person, $30,000 per accident; Property Damage $5,000 (15/30/5). Uninsured motorist coverage required unless waived. Proof of financial responsibility required.',
    source: 'California Department of Insurance',
    last_updated: '2024-01-01'
  },
  {
    id: 'tx_auto_min_2024',
    type: 'regulation',
    state: 'TX',
    insurance_type: 'auto',
    title: 'Texas Minimum Auto Insurance Requirements',
    content: 'Texas requires 30/60/25 coverage: $30,000 bodily injury per person, $60,000 per accident, $25,000 property damage. Personal Injury Protection (PIP) required unless rejected in writing. At-fault state for accidents.',
    source: 'Texas Department of Insurance',
    last_updated: '2024-01-01'
  },
  {
    id: 'fl_auto_min_2024',
    type: 'regulation',
    state: 'FL',
    insurance_type: 'auto',
    title: 'Florida Minimum Auto Insurance Requirements',
    content: 'Florida requires Personal Injury Protection (PIP) of $10,000 and Property Damage Liability of $10,000. Florida is a no-fault state. Bodily injury liability not required unless you have been in certain accidents.',
    source: 'Florida Department of Insurance',
    last_updated: '2024-01-01'
  },
  {
    id: 'ny_auto_min_2024',
    type: 'regulation',
    state: 'NY',
    insurance_type: 'auto',
    title: 'New York Minimum Auto Insurance Requirements',
    content: 'New York requires 25/50/10 liability coverage plus 50/100 uninsured motorist coverage. Personal Injury Protection (PIP) of $50,000 required. No-fault state with mandatory PIP coverage.',
    source: 'New York Department of Financial Services',
    last_updated: '2024-01-01'
  },
  {
    id: 'comprehensive_def',
    type: 'definition',
    insurance_type: 'auto',
    title: 'Comprehensive Coverage Definition',
    content: 'Comprehensive coverage pays for damage to your vehicle from non-collision events: theft, vandalism, fire, natural disasters, falling objects, animal strikes. Subject to deductible. Often required for financed vehicles.',
    source: 'Insurance Information Institute',
    last_updated: '2024-01-01'
  },
  {
    id: 'collision_def',
    type: 'definition',
    insurance_type: 'auto',
    title: 'Collision Coverage Definition',
    content: 'Collision coverage pays for damage to your vehicle from accidents with other vehicles or objects. Covers regardless of fault. Subject to deductible you choose. Required for leased/financed vehicles.',
    source: 'Insurance Information Institute',
    last_updated: '2024-01-01'
  },
  {
    id: 'liability_def',
    type: 'definition',
    insurance_type: 'auto',
    title: 'Liability Insurance Definition',
    content: 'Liability insurance covers damage and injuries you cause to others. Includes bodily injury liability (medical costs, lost wages, pain/suffering) and property damage liability (vehicle repair, property damage).',
    source: 'Insurance Information Institute',
    last_updated: '2024-01-01'
  },
  {
    id: 'deductible_faq',
    type: 'faq',
    insurance_type: 'auto',
    title: 'How Do Deductibles Work?',
    content: 'A deductible is what you pay before insurance covers a claim. With a $500 deductible and $3,000 damage, you pay $500, insurance pays $2,500. Higher deductibles mean lower premiums. Applies per claim.',
    source: 'Insurance Education Foundation',
    last_updated: '2024-01-01'
  },
  {
    id: 'sr22_faq',
    type: 'faq',
    insurance_type: 'auto',
    title: 'What is SR-22 Insurance?',
    content: 'SR-22 is not insurance but a certificate proving you have minimum liability coverage. Required after serious violations like DUI, driving uninsured, or multiple tickets. Typically required for 3 years.',
    source: 'Insurance Information Institute',
    last_updated: '2024-01-01'
  }
]

// Sample carrier intelligence data
const CARRIER_INTELLIGENCE = [
  {
    id: 'geico_profile_2024',
    carrier: 'GEICO',
    category: 'profile',
    content: 'GEICO is the 2nd largest auto insurer. Known for competitive rates, strong digital experience, 24/7 service. Best for safe drivers with good credit. Mobile app for claims. A++ rating from A.M. Best.',
    overall_rating: 4.2,
    claims_rating: 4.0,
    price_rating: 4.5,
    ideal_age_min: 25,
    ideal_age_max: 65
  },
  {
    id: 'progressive_profile_2024',
    carrier: 'Progressive',
    category: 'profile',
    content: 'Progressive is 3rd largest insurer. Specializes in high-risk drivers. Snapshot usage-based program. Name Your Price tool. Good for drivers with violations. Strong online tools.',
    overall_rating: 4.0,
    claims_rating: 3.9,
    price_rating: 4.3,
    ideal_age_min: 18,
    ideal_age_max: 70
  },
  {
    id: 'statefarm_profile_2024',
    carrier: 'State Farm',
    category: 'profile',
    content: 'State Farm is largest US auto insurer. Extensive agent network for personal service. Excellent bundling discounts. Drive Safe & Save program. Best for those who want agent relationships.',
    overall_rating: 4.4,
    claims_rating: 4.3,
    price_rating: 4.0,
    ideal_age_min: 25,
    ideal_age_max: 75
  },
  {
    id: 'allstate_profile_2024',
    carrier: 'Allstate',
    category: 'profile',
    content: 'Allstate offers Drivewise program for safe driver discounts. Strong local agent network. Good bundling options. Accident forgiveness available. Best for families wanting comprehensive coverage.',
    overall_rating: 4.1,
    claims_rating: 4.0,
    price_rating: 3.8,
    ideal_age_min: 30,
    ideal_age_max: 70
  },
  {
    id: 'usaa_profile_2024',
    carrier: 'USAA',
    category: 'profile',
    content: 'USAA exclusively serves military members and families. Consistently highest customer satisfaction. Excellent claims handling. Competitive rates. Best-in-class service for eligible members.',
    overall_rating: 4.8,
    claims_rating: 4.9,
    price_rating: 4.5,
    ideal_age_min: 18,
    ideal_age_max: 80
  }
]

async function prepareVectorizeData() {
  console.log('📦 Preparing data for Vectorize.io upload\n')

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY in environment variables')
    console.log('Please set it in your .env.local file')
    process.exit(1)
  }

  try {
    const embeddingService = new EmbeddingService()
    const outputDir = path.join(process.cwd(), 'vectorize-data')

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Process Insurance Knowledge
    console.log('1️⃣ Processing insurance knowledge data...')
    const knowledgeWithEmbeddings = await processDataWithEmbeddings(
      INSURANCE_KNOWLEDGE,
      embeddingService,
      'knowledge'
    )

    // Process Carrier Intelligence
    console.log('2️⃣ Processing carrier intelligence data...')
    const carriersWithEmbeddings = await processDataWithEmbeddings(
      CARRIER_INTELLIGENCE,
      embeddingService,
      'carriers'
    )

    // Save as CSV files
    console.log('3️⃣ Saving CSV files...')
    await saveAsCSV(knowledgeWithEmbeddings, path.join(outputDir, 'insurance-knowledge.csv'), [
      'id', 'content', 'type', 'insurance_type', 'state', 'title', 'source', 'last_updated', 'embedding'
    ])

    await saveAsCSV(carriersWithEmbeddings, path.join(outputDir, 'carrier-intelligence.csv'), [
      'id', 'content', 'carrier', 'category', 'overall_rating', 'claims_rating', 'price_rating',
      'ideal_age_min', 'ideal_age_max', 'embedding'
    ])

    // Save as JSON files (Vectorize format)
    console.log('4️⃣ Saving JSON files (Vectorize format)...')
    await saveAsVectorizeJSON(
      knowledgeWithEmbeddings,
      path.join(outputDir, 'insurance-knowledge-vectorize.json'),
      'knowledge'
    )

    await saveAsVectorizeJSON(
      carriersWithEmbeddings,
      path.join(outputDir, 'carrier-intelligence-vectorize.json'),
      'carriers'
    )

    // Create upload instructions
    const instructions = `
# Vectorize.io Upload Instructions

## Files Generated
- insurance-knowledge.csv - Insurance regulations, definitions, FAQs
- carrier-intelligence.csv - Carrier profiles and ratings
- insurance-knowledge-vectorize.json - Vectorize-formatted JSON for knowledge
- carrier-intelligence-vectorize.json - Vectorize-formatted JSON for carriers

## Upload Steps

### Option 1: CSV Upload
1. Go to Vectorize.io dashboard
2. Select your index (insurance-knowledge or carrier-intelligence)
3. Click "Import Data" → "CSV"
4. Upload the corresponding CSV file
5. Map columns:
   - id → ID field
   - embedding → Vector field
   - All others → Metadata fields

### Option 2: JSON Upload (Recommended)
1. Go to Vectorize.io dashboard
2. Select your index
3. Click "Import Data" → "JSON"
4. Upload the corresponding -vectorize.json file
5. Confirm the import

### Option 3: API Upload
Use the Vectorize API playground with the JSON files

## Index Configuration
Ensure your indexes are configured with:
- Dimensions: 1536
- Metric: cosine
- Names:
  - insurance-knowledge
  - carrier-intelligence

## Verification
After upload, test with queries like:
- "What's the minimum auto insurance in California?"
- "Tell me about GEICO"
`

    fs.writeFileSync(path.join(outputDir, 'UPLOAD-INSTRUCTIONS.md'), instructions)

    console.log('\n✅ Data preparation complete!')
    console.log(`📁 Files saved to: ${outputDir}`)
    console.log('\n📋 Next steps:')
    console.log('   1. Review generated files in vectorize-data/ directory')
    console.log('   2. Follow instructions in UPLOAD-INSTRUCTIONS.md')
    console.log('   3. Upload to Vectorize.io dashboard')

    // Show cost estimate
    const totalTexts = INSURANCE_KNOWLEDGE.length + CARRIER_INTELLIGENCE.length
    const cost = embeddingService.calculateCost(totalTexts)
    console.log('\n💰 Embedding generation cost:')
    console.log(`   - Total items: ${totalTexts}`)
    console.log(`   - Estimated tokens: ${cost.tokens}`)
    console.log(`   - Estimated cost: $${cost.estimatedCost.toFixed(4)}`)

  } catch (error) {
    console.error('❌ Error preparing data:', error)
    process.exit(1)
  }
}

async function processDataWithEmbeddings(
  data: any[],
  embeddingService: EmbeddingService,
  type: string
): Promise<any[]> {
  const contents = data.map(item => item.content)
  console.log(`   Generating embeddings for ${contents.length} items...`)

  const embeddings = await embeddingService.batchEmbed(contents)

  return data.map((item, index) => ({
    ...item,
    embedding: embeddings[index]
  }))
}

async function saveAsCSV(data: any[], filepath: string, columns: string[]) {
  const rows = [columns.join(',')] // Header row

  data.forEach(item => {
    const values = columns.map(col => {
      const value = item[col]
      if (col === 'embedding' && Array.isArray(value)) {
        // Convert embedding array to string format
        return `"[${value.join(',')}]"`
      }
      // Escape quotes and wrap in quotes if contains comma
      const strValue = String(value || '')
      if (strValue.includes(',') || strValue.includes('"')) {
        return `"${strValue.replace(/"/g, '""')}"`
      }
      return strValue
    })
    rows.push(values.join(','))
  })

  fs.writeFileSync(filepath, rows.join('\n'))
  console.log(`   ✓ Saved: ${path.basename(filepath)}`)
}

async function saveAsVectorizeJSON(data: any[], filepath: string, indexType: string) {
  const vectors = data.map(item => {
    const { embedding, ...metadata } = item

    return {
      id: item.id,
      values: embedding,
      metadata: {
        content: item.content,
        ...metadata
      }
    }
  })

  const vectorizeFormat = {
    vectors,
    namespace: indexType,
    dimension: 1536
  }

  fs.writeFileSync(filepath, JSON.stringify(vectorizeFormat, null, 2))
  console.log(`   ✓ Saved: ${path.basename(filepath)}`)
}

// Run the script
prepareVectorizeData().catch(console.error)