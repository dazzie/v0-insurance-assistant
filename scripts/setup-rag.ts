#!/usr/bin/env node

/**
 * Setup script for RAG infrastructure
 * Run with: npx tsx scripts/setup-rag.ts
 */

import { VectorizeClient } from '../lib/rag/core/vectorize-client'
import { ContentIngestion } from '../lib/rag/utils/content-ingestion'
import { EmbeddingService } from '../lib/rag/services/embedding-service'

async function setupRAG() {
  console.log('🚀 Setting up RAG infrastructure...\n')

  // Check for required environment variables
  const requiredEnvVars = ['OPENAI_API_KEY', 'CF_ACCOUNT_ID', 'CF_API_TOKEN']
  const missingVars = requiredEnvVars.filter(v => !process.env[v])

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(v => console.error(`   - ${v}`))
    console.log('\n📝 Please set these in your .env.local file')
    process.exit(1)
  }

  try {
    // 1. Initialize Vectorize client
    console.log('1️⃣ Initializing Vectorize client...')
    const vectorizeClient = new VectorizeClient()

    // 2. Create indexes
    console.log('2️⃣ Creating vector indexes...')
    await vectorizeClient.initializeIndexes()
    console.log('   ✅ Indexes created/verified')

    // 3. Initialize content ingestion
    console.log('3️⃣ Preparing content ingestion...')
    const embeddingService = new EmbeddingService()
    const ingestion = new ContentIngestion(vectorizeClient, embeddingService)

    // 4. Ingest sample knowledge
    console.log('4️⃣ Ingesting sample insurance knowledge...')
    await ingestion.ingestSampleKnowledge()
    console.log('   ✅ Sample knowledge ingested')

    // 5. Ingest sample carrier data
    console.log('5️⃣ Ingesting sample carrier intelligence...')
    await ingestion.ingestSampleCarriers()
    console.log('   ✅ Sample carrier data ingested')

    // 6. Verify setup
    console.log('6️⃣ Verifying RAG setup...')
    const stats = await vectorizeClient.getIndexStats('knowledge')
    console.log(`   ✅ Knowledge index ready with ${stats.vectorCount || 'unknown'} vectors`)

    console.log('\n✨ RAG setup complete!')
    console.log('\n📚 Next steps:')
    console.log('   1. Test the RAG pipeline with: npx tsx scripts/test-rag.ts')
    console.log('   2. Start using RAG in your chat API')
    console.log('   3. Ingest more domain-specific content as needed')

  } catch (error) {
    console.error('\n❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run setup
setupRAG().catch(console.error)