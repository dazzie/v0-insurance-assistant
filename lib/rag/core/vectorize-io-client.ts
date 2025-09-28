// Vectorize.io Client using Official Library

import { Configuration, PipelinesApi } from '@vectorize-io/vectorize-client'
import {
  SearchResult,
  DocumentMetadata
} from '../types'

interface VectorizeIOConfig {
  accessToken?: string
  orgId?: string
  pipelineId?: string
}

/**
 * Vectorize.io Client using the official @vectorize-io/vectorize-client library
 */
export class VectorizeIOClient {
  private accessToken: string
  private orgId: string
  private pipelineId: string
  private configuration: Configuration
  private pipelinesApi: PipelinesApi

  constructor(config?: VectorizeIOConfig) {
    this.accessToken = config?.accessToken || process.env.TOKEN || process.env.VECTORIZE_IO_API_KEY || ''
    this.orgId = config?.orgId || process.env.VECTORIZE_IO_ORG_ID || ''
    this.pipelineId = config?.pipelineId || process.env.VECTORIZE_IO_PIPELINE_ID || ''
    
    this.configuration = new Configuration({
      accessToken: this.accessToken,
      basePath: "https://api.vectorize.io/v1",
    })
    this.pipelinesApi = new PipelinesApi(this.configuration)
  }

  /**
   * Search using the pipeline retrieval endpoint with official library
   */
  async search(query: string, options: { topK?: number } = {}): Promise<SearchResult[]> {
    const { topK = 5 } = options
    
    try {
      console.log(`🔍 [VectorizeIOClient] Searching with query: "${query}"`)
      console.log(`📡 [VectorizeIOClient] Organization: ${this.orgId}`)
      console.log(`🔗 [VectorizeIOClient] Pipeline: ${this.pipelineId}`)
      
      const response = await this.pipelinesApi.retrieveDocuments({
        organizationId: this.orgId,
        pipelineId: this.pipelineId,
        retrieveDocumentsRequest: {
          question: query,
          numResults: topK,
        }
      })

      console.log(`📄 [VectorizeIOClient] Found ${response.documents?.length || 0} documents`)
      
      if (response.documents && response.documents.length > 0) {
        console.log(`📋 [VectorizeIOClient] Sample document preview:`)
        console.log(`   ID: ${response.documents[0].id}`)
        console.log(`   Content: ${response.documents[0].content?.substring(0, 100)}...`)
        console.log(`   Score: ${response.documents[0].score}`)
      }
      
      if (!response.documents) {
        return []
      }

      return response.documents.map((doc, index) => ({
        id: doc.id || `result_${index}`,
        content: doc.content || '',
        score: doc.score || 0,
        metadata: doc.metadata || {}
      }))
    } catch (error) {
      console.error('[VectorizeIOClient] Search error:', error)
      if (error?.response) {
        console.error('Response error:', error.response)
      }
      throw error
    }
  }

  /**
   * Test connection to Vectorize.io using official library
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('[VectorizeIOClient] Testing connection...')
      const result = await this.search('test', { topK: 1 })
      console.log('[VectorizeIOClient] Connection test successful')
      return true
    } catch (error) {
      console.error('[VectorizeIOClient] Connection test failed:', error)
      return false
    }
  }
}