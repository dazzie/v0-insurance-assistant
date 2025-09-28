// RAG Query Pipeline for Vectorize.io Platform

import { VectorizeIOClient } from './vectorize-io-client'
import { EmbeddingService } from '../services/embedding-service'
import {
  VectorIndexName,
  SearchResult,
  RAGContext,
  ConversationContext,
  InsuranceType
} from '../types'

interface QueryOptions {
  indexes?: VectorIndexName[]
  topK?: number
  insuranceType?: InsuranceType
  state?: string
  includeSourceDetails?: boolean
}

export class RAGQueryPipelineVectorizeIO {
  private vectorizeClient: VectorizeIOClient
  private embeddingService: EmbeddingService

  constructor(
    vectorizeClient?: VectorizeIOClient,
    embeddingService?: EmbeddingService
  ) {
    this.vectorizeClient = vectorizeClient || new VectorizeIOClient()
    this.embeddingService = embeddingService || new EmbeddingService()
  }

  /**
   * Main query method - searches across multiple indexes
   */
  async query(
    question: string,
    context: Partial<ConversationContext>,
    options: QueryOptions = {}
  ): Promise<RAGContext> {
    const {
      indexes = this.determineRelevantIndexes(question, context),
      topK = 5,
      insuranceType,
      state,
      includeSourceDetails = true
    } = options

    console.log(`[RAG] Querying Vectorize.io indexes: ${indexes.join(', ')}`)

    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.embeddingService.generateContextualEmbedding(
        question,
        {
          insuranceType,
          state,
          category: this.extractCategory(question)
        }
      )

      // 2. Search indexes (start with knowledge and carriers)
      const searchPromises = indexes.map(indexName =>
        this.vectorizeClient.search(
          indexName,
          queryEmbedding,
          {
            topK,
            includeMetadata: true,
            minScore: 0.7
          }
        )
      )

      const searchResults = await Promise.all(searchPromises)
      const allResults = searchResults.flat()

      // 3. Format results
      if (allResults.length === 0) {
        console.log('[RAG] No relevant results found')
        return { context: '', sources: [] }
      }

      // 4. Build context
      const contextParts: string[] = []
      const sources: Array<{ type: string; title: string; relevance: number }> = []

      allResults
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .forEach((result, index) => {
          contextParts.push(`[${index + 1}] ${result.content}`)

          if (result.metadata?.title) {
            sources.push({
              type: result.metadata.type || 'knowledge',
              title: result.metadata.title,
              relevance: result.score
            })
          }
        })

      return {
        context: contextParts.join('\n\n'),
        sources
      }
    } catch (error) {
      console.error('[RAG] Query error:', error)
      return { context: '', sources: [] }
    }
  }

  /**
   * Determine which indexes are most relevant
   */
  private determineRelevantIndexes(
    question: string,
    context: Partial<ConversationContext>
  ): VectorIndexName[] {
    const questionLower = question.toLowerCase()
    const indexes: VectorIndexName[] = []

    // Always search knowledge for factual questions
    if (
      questionLower.includes('what') ||
      questionLower.includes('require') ||
      questionLower.includes('minimum') ||
      questionLower.includes('coverage') ||
      questionLower.includes('deductible')
    ) {
      indexes.push('knowledge')
    }

    // Search carriers for company questions
    if (
      questionLower.includes('geico') ||
      questionLower.includes('progressive') ||
      questionLower.includes('state farm') ||
      questionLower.includes('carrier') ||
      questionLower.includes('company')
    ) {
      indexes.push('carriers')
    }

    // Default to knowledge if nothing specific
    if (indexes.length === 0) {
      indexes.push('knowledge')
    }

    return indexes
  }

  /**
   * Extract category from question
   */
  private extractCategory(question: string): string {
    const questionLower = question.toLowerCase()

    if (questionLower.includes('coverage') || questionLower.includes('deductible')) {
      return 'coverage'
    }
    if (questionLower.includes('require') || questionLower.includes('minimum')) {
      return 'regulations'
    }
    if (questionLower.includes('carrier') || questionLower.includes('company')) {
      return 'carriers'
    }

    return 'general'
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    return this.vectorizeClient.testConnection()
  }
}