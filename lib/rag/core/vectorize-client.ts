// Cloudflare Vectorize Client

import {
  VectorIndexName,
  VectorDocument,
  SearchResult,
  DocumentMetadata,
  VectorizeConfig,
  VectorIndexConfig
} from '../types'

interface VectorizeSearchOptions {
  topK?: number
  filter?: Record<string, any>
  includeMetadata?: boolean
}

interface VectorizeUpsertRequest {
  id: string
  values: number[]
  metadata?: Record<string, any>
}

export class VectorizeClient {
  private accountId: string
  private apiToken: string
  private baseUrl: string
  private indexes: Map<VectorIndexName, VectorIndexConfig>

  constructor(config?: Partial<VectorizeConfig>) {
    this.accountId = config?.accountId || process.env.CF_ACCOUNT_ID || ''
    this.apiToken = config?.apiToken || process.env.CF_API_TOKEN || ''
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/vectorize/indexes`

    // Initialize index configurations
    this.indexes = config?.indexes || this.getDefaultIndexes()
  }

  private getDefaultIndexes(): Map<VectorIndexName, VectorIndexConfig> {
    const indexes = new Map<VectorIndexName, VectorIndexConfig>()

    // All using text-embedding-3-small (1536 dimensions)
    indexes.set('knowledge', {
      name: 'insurance-knowledge',
      dimensions: 1536,
      metric: 'cosine'
    })

    indexes.set('quotes', {
      name: 'quote-history',
      dimensions: 1536,
      metric: 'cosine'
    })

    indexes.set('carriers', {
      name: 'carrier-intelligence',
      dimensions: 1536,
      metric: 'cosine'
    })

    indexes.set('conversation', {
      name: 'conversation-context',
      dimensions: 1536,
      metric: 'cosine'
    })

    indexes.set('market', {
      name: 'local-market',
      dimensions: 1536,
      metric: 'cosine'
    })

    return indexes
  }

  /**
   * Create a new vector index
   */
  async createIndex(indexName: VectorIndexName): Promise<void> {
    const config = this.indexes.get(indexName)
    if (!config) {
      throw new Error(`Index configuration not found for: ${indexName}`)
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.name,
          config: {
            dimensions: config.dimensions,
            metric: config.metric
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create index: ${error}`)
      }

      console.log(`[VectorizeClient] Created index: ${config.name}`)
    } catch (error) {
      console.error(`[VectorizeClient] Error creating index ${indexName}:`, error)
      throw error
    }
  }

  /**
   * Initialize all indexes
   */
  async initializeIndexes(): Promise<void> {
    console.log('[VectorizeClient] Initializing all indexes...')

    for (const [indexName, _] of this.indexes) {
      try {
        await this.createIndex(indexName)
      } catch (error: any) {
        // Index might already exist, which is fine
        if (!error.message.includes('already exists')) {
          console.error(`Failed to create index ${indexName}:`, error)
        }
      }
    }

    console.log('[VectorizeClient] All indexes initialized')
  }

  /**
   * Upsert vectors into an index
   */
  async upsert(
    indexName: VectorIndexName,
    documents: VectorDocument[]
  ): Promise<void> {
    const config = this.indexes.get(indexName)
    if (!config) {
      throw new Error(`Index configuration not found for: ${indexName}`)
    }

    if (documents.length === 0) {
      return
    }

    // Prepare vectors for upsert
    const vectors: VectorizeUpsertRequest[] = documents.map(doc => ({
      id: doc.id,
      values: doc.embedding || [],
      metadata: {
        content: doc.content,
        ...doc.metadata
      }
    }))

    // Batch upsert (Vectorize typically handles up to 100 vectors per request)
    const batchSize = 100
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize)

      try {
        const response = await fetch(`${this.baseUrl}/${config.name}/upsert`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vectors: batch })
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Failed to upsert vectors: ${error}`)
        }

        console.log(`[VectorizeClient] Upserted ${batch.length} vectors to ${config.name}`)
      } catch (error) {
        console.error(`[VectorizeClient] Error upserting to ${indexName}:`, error)
        throw error
      }
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    indexName: VectorIndexName,
    queryVector: number[],
    options: VectorizeSearchOptions = {}
  ): Promise<SearchResult[]> {
    const config = this.indexes.get(indexName)
    if (!config) {
      throw new Error(`Index configuration not found for: ${indexName}`)
    }

    const { topK = 5, filter, includeMetadata = true } = options

    try {
      const response = await fetch(`${this.baseUrl}/${config.name}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vector: queryVector,
          topK,
          filter,
          includeMetadata
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to search vectors: ${error}`)
      }

      const data = await response.json()

      // Map response to SearchResult format
      return data.matches.map((match: any) => ({
        id: match.id,
        score: match.score,
        content: match.metadata?.content || '',
        metadata: match.metadata || {}
      }))
    } catch (error) {
      console.error(`[VectorizeClient] Error searching ${indexName}:`, error)
      return [] // Return empty results on error
    }
  }

  /**
   * Delete vectors by IDs
   */
  async deleteVectors(
    indexName: VectorIndexName,
    ids: string[]
  ): Promise<void> {
    const config = this.indexes.get(indexName)
    if (!config) {
      throw new Error(`Index configuration not found for: ${indexName}`)
    }

    if (ids.length === 0) {
      return
    }

    try {
      const response = await fetch(`${this.baseUrl}/${config.name}/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to delete vectors: ${error}`)
      }

      console.log(`[VectorizeClient] Deleted ${ids.length} vectors from ${config.name}`)
    } catch (error) {
      console.error(`[VectorizeClient] Error deleting from ${indexName}:`, error)
      throw error
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(indexName: VectorIndexName): Promise<any> {
    const config = this.indexes.get(indexName)
    if (!config) {
      throw new Error(`Index configuration not found for: ${indexName}`)
    }

    try {
      const response = await fetch(`${this.baseUrl}/${config.name}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to get index stats: ${error}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`[VectorizeClient] Error getting stats for ${indexName}:`, error)
      throw error
    }
  }
}