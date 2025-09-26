#!/usr/bin/env node

/**
 * Test script for RAG pipeline
 * Run with: npx tsx scripts/test-rag.ts
 */

import { RAGQueryPipeline } from '../lib/rag/core/query-pipeline'
import { VectorizeClient } from '../lib/rag/core/vectorize-client'
import { EmbeddingService } from '../lib/rag/services/embedding-service'

const TEST_QUERIES = [
  {
    question: "What's the minimum auto insurance required in California?",
    context: { insuranceType: 'auto' as const, state: 'CA' }
  },
  {
    question: "What's the minimum auto insurance required in Texas?",
    context: { insuranceType: 'auto' as const, state: 'TX' }
  },
  {
    question: "What does comprehensive coverage include?",
    context: { insuranceType: 'auto' as const }
  },
  {
    question: "How do deductibles work?",
    context: { insuranceType: 'auto' as const }
  },
  {
    question: "Which carrier is best for young drivers?",
    context: { insuranceType: 'auto' as const }
  },
  {
    question: "Tell me about GEICO",
    context: { insuranceType: 'auto' as const }
  }
]

async function testRAG() {
  console.log('🧪 Testing RAG Pipeline\n')

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
    // Initialize RAG pipeline
    console.log('Initializing RAG pipeline...\n')
    const vectorizeClient = new VectorizeClient()
    const embeddingService = new EmbeddingService()
    const ragPipeline = new RAGQueryPipeline(vectorizeClient, embeddingService)

    // Test each query
    for (const test of TEST_QUERIES) {
      console.log('━'.repeat(60))
      console.log(`\n❓ Question: "${test.question}"`)
      console.log(`📍 Context: Insurance Type: ${test.context.insuranceType}${test.context.state ? `, State: ${test.context.state}` : ''}`)

      const startTime = Date.now()

      const result = await ragPipeline.query(
        test.question,
        {
          insuranceType: test.context.insuranceType,
          state: test.context.state
        },
        {
          topK: 3,
          insuranceType: test.context.insuranceType,
          state: test.context.state
        }
      )

      const queryTime = Date.now() - startTime

      console.log(`\n💡 Retrieved Context (${queryTime}ms):\n`)

      if (result.context) {
        // Display context in a formatted way
        const contextLines = result.context.split('\n')
        contextLines.forEach(line => {
          if (line.startsWith('[')) {
            console.log(`\n${line}`)
          } else if (line) {
            console.log(`  ${line}`)
          }
        })
      } else {
        console.log('  No relevant context found')
      }

      if (result.sources && result.sources.length > 0) {
        console.log('\n📚 Sources:')
        result.sources.forEach((source, index) => {
          console.log(`  ${index + 1}. ${source.title} (${source.type}) - Relevance: ${(source.relevance * 100).toFixed(1)}%`)
        })
      }

      console.log('')
    }

    console.log('━'.repeat(60))
    console.log('\n✅ RAG pipeline test complete!\n')

    // Show cost estimate
    const totalQueries = TEST_QUERIES.length
    const estimatedCost = embeddingService.calculateCost(totalQueries)
    console.log('💰 Cost Estimate:')
    console.log(`   - Queries tested: ${totalQueries}`)
    console.log(`   - Estimated tokens: ${estimatedCost.tokens}`)
    console.log(`   - Estimated cost: $${estimatedCost.estimatedCost.toFixed(4)}`)

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run test
testRAG().catch(console.error)