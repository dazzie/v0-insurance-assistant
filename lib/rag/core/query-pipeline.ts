// RAG Query Pipeline

import { VectorizeClient } from './vectorize-client'
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

interface RankedResult extends SearchResult {
  indexSource: VectorIndexName
  adjustedScore: number
}

export class RAGQueryPipeline {
  private vectorizeClient: VectorizeClient
  private embeddingService: EmbeddingService

  constructor(
    vectorizeClient?: VectorizeClient,
    embeddingService?: EmbeddingService
  ) {
    this.vectorizeClient = vectorizeClient || new VectorizeClient()
    this.embeddingService = embeddingService || new EmbeddingService()
  }

  /**
   * Main query method - searches across multiple indexes and returns combined context
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

    console.log(`[RAGQueryPipeline] Querying indexes: ${indexes.join(', ')}`)

    // 1. Generate query embedding
    const queryEmbedding = await this.embeddingService.generateContextualEmbedding(
      question,
      {
        insuranceType,
        state,
        category: this.extractCategory(question)
      }
    )

    // 2. Search multiple indexes in parallel
    const searchPromises = indexes.map(indexName =>
      this.searchIndex(indexName, queryEmbedding, {
        topK,
        insuranceType,
        state
      })
    )

    const searchResults = await Promise.all(searchPromises)

    // 3. Combine and rank results across all indexes
    const combinedResults = this.combineAndRankResults(
      searchResults.flat(),
      question
    )

    // 4. Format context for LLM
    const formattedContext = this.formatContext(
      combinedResults.slice(0, topK),
      includeSourceDetails
    )

    return formattedContext
  }

  /**
   * Search a specific index
   */
  private async searchIndex(
    indexName: VectorIndexName,
    queryEmbedding: number[],
    filters: {
      topK?: number
      insuranceType?: InsuranceType
      state?: string
    }
  ): Promise<RankedResult[]> {
    const { topK = 5, insuranceType, state } = filters

    // Build filter object based on index type and provided filters
    const filter = this.buildIndexFilter(indexName, { insuranceType, state })

    const results = await this.vectorizeClient.search(
      indexName,
      queryEmbedding,
      {
        topK,
        filter,
        includeMetadata: true
      }
    )

    // Add index source and adjust scores based on index relevance
    return results.map(result => ({
      ...result,
      indexSource: indexName,
      adjustedScore: this.adjustScore(result.score, indexName)
    }))
  }

  /**
   * Determine which indexes are most relevant for the query
   */
  private determineRelevantIndexes(
    question: string,
    context: Partial<ConversationContext>
  ): VectorIndexName[] {
    const questionLower = question.toLowerCase()
    const indexes: VectorIndexName[] = []

    // Always include knowledge base for factual questions
    if (
      questionLower.includes('what') ||
      questionLower.includes('how') ||
      questionLower.includes('require') ||
      questionLower.includes('coverage') ||
      questionLower.includes('deductible')
    ) {
      indexes.push('knowledge')
    }

    // Include carrier intelligence for carrier-specific questions
    if (
      questionLower.includes('geico') ||
      questionLower.includes('progressive') ||
      questionLower.includes('state farm') ||
      questionLower.includes('carrier') ||
      questionLower.includes('company') ||
      questionLower.includes('which insurer')
    ) {
      indexes.push('carriers')
    }

    // Include quote history for comparison questions
    if (
      questionLower.includes('average') ||
      questionLower.includes('typical') ||
      questionLower.includes('people like me') ||
      questionLower.includes('similar') ||
      questionLower.includes('compare')
    ) {
      indexes.push('quotes')
    }

    // Include market data for local questions
    if (
      questionLower.includes('local') ||
      questionLower.includes('area') ||
      questionLower.includes('zip') ||
      questionLower.includes('neighborhood') ||
      context.state
    ) {
      indexes.push('market')
    }

    // Include conversation context if we have an ongoing conversation
    if (context.messages && context.messages.length > 2) {
      indexes.push('conversation')
    }

    // Default to knowledge and carriers if no specific indexes identified
    if (indexes.length === 0) {
      return ['knowledge', 'carriers']
    }

    return [...new Set(indexes)] // Remove duplicates
  }

  /**
   * Build filter object for specific index
   */
  private buildIndexFilter(
    indexName: VectorIndexName,
    filters: {
      insuranceType?: InsuranceType
      state?: string
    }
  ): Record<string, any> {
    const filter: Record<string, any> = {}

    // Add filters based on index type
    switch (indexName) {
      case 'knowledge':
        if (filters.insuranceType) {
          filter.insuranceType = filters.insuranceType
        }
        if (filters.state) {
          filter.state = filters.state
        }
        break

      case 'carriers':
        if (filters.insuranceType) {
          filter.insuranceType = filters.insuranceType
        }
        break

      case 'market':
        if (filters.state) {
          filter.state = filters.state
        }
        break

      case 'quotes':
        if (filters.insuranceType) {
          filter['userProfile.insuranceType'] = filters.insuranceType
        }
        if (filters.state) {
          filter['userProfile.location'] = filters.state
        }
        break
    }

    return filter
  }

  /**
   * Adjust score based on index relevance
   */
  private adjustScore(baseScore: number, indexName: VectorIndexName): number {
    // Weight different indexes based on general reliability
    const indexWeights: Record<VectorIndexName, number> = {
      knowledge: 1.2,    // Boost factual knowledge
      carriers: 1.1,     // Slightly boost carrier info
      quotes: 1.0,       // Normal weight for historical data
      market: 1.0,       // Normal weight for market data
      conversation: 0.9  // Slightly lower for conversation context
    }

    return baseScore * (indexWeights[indexName] || 1.0)
  }

  /**
   * Combine and rank results from multiple indexes
   */
  private combineAndRankResults(
    results: RankedResult[],
    question: string
  ): RankedResult[] {
    // Sort by adjusted score
    const sorted = results.sort((a, b) => b.adjustedScore - a.adjustedScore)

    // Apply additional ranking based on content relevance
    return sorted.map(result => {
      let relevanceBoost = 0

      // Boost if content directly mentions key terms from question
      const questionTerms = question.toLowerCase().split(' ')
      const contentLower = result.content.toLowerCase()

      questionTerms.forEach(term => {
        if (term.length > 3 && contentLower.includes(term)) {
          relevanceBoost += 0.05
        }
      })

      return {
        ...result,
        adjustedScore: result.adjustedScore + relevanceBoost
      }
    })
  }

  /**
   * Format context for LLM consumption
   */
  private formatContext(
    results: RankedResult[],
    includeSourceDetails: boolean
  ): RAGContext {
    if (results.length === 0) {
      return {
        context: '',
        sources: []
      }
    }

    // Group results by index source for better organization
    const groupedResults = this.groupResultsBySource(results)

    // Format context string
    let contextParts: string[] = []

    for (const [source, sourceResults] of Object.entries(groupedResults)) {
      if (sourceResults.length > 0) {
        contextParts.push(`[${source.toUpperCase()} INFORMATION]`)

        sourceResults.forEach((result, index) => {
          const metadata = result.metadata
          let contextEntry = result.content

          if (includeSourceDetails && metadata) {
            if (metadata.title) {
              contextEntry = `${metadata.title}: ${contextEntry}`
            }
            if (metadata.source) {
              contextEntry += ` [Source: ${metadata.source}]`
            }
          }

          contextParts.push(`${index + 1}. ${contextEntry}`)
        })

        contextParts.push('') // Add blank line between sections
      }
    }

    // Prepare sources array
    const sources = results.map(result => ({
      type: result.indexSource,
      title: result.metadata?.title || 'Untitled',
      relevance: result.adjustedScore
    }))

    return {
      context: contextParts.join('\n').trim(),
      sources
    }
  }

  /**
   * Group results by their source index
   */
  private groupResultsBySource(
    results: RankedResult[]
  ): Record<string, RankedResult[]> {
    const grouped: Record<string, RankedResult[]> = {}

    results.forEach(result => {
      if (!grouped[result.indexSource]) {
        grouped[result.indexSource] = []
      }
      grouped[result.indexSource].push(result)
    })

    return grouped
  }

  /**
   * Extract category from question for better embedding context
   */
  private extractCategory(question: string): string {
    const questionLower = question.toLowerCase()

    if (questionLower.includes('coverage') || questionLower.includes('deductible')) {
      return 'coverage'
    }
    if (questionLower.includes('claim')) {
      return 'claims'
    }
    if (questionLower.includes('price') || questionLower.includes('cost') || questionLower.includes('quote')) {
      return 'pricing'
    }
    if (questionLower.includes('require') || questionLower.includes('minimum') || questionLower.includes('law')) {
      return 'regulations'
    }
    if (questionLower.includes('discount')) {
      return 'discounts'
    }

    return 'general'
  }

  /**
   * Quick search for simple queries (single index)
   */
  async quickSearch(
    question: string,
    indexName: VectorIndexName,
    topK: number = 3
  ): Promise<SearchResult[]> {
    const embedding = await this.embeddingService.generateEmbedding(question)
    return this.vectorizeClient.search(indexName, embedding, { topK })
  }
}