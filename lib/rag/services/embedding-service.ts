// Embedding Service using OpenAI

import { OpenAI } from 'openai'

export class EmbeddingService {
  private openai: OpenAI
  private model: string = 'text-embedding-3-small' // 1536 dimensions, good performance/cost ratio

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    })
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: this.preprocessText(text)
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('[EmbeddingService] Error generating embedding:', error)
      throw new Error('Failed to generate embedding')
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async batchEmbed(texts: string[]): Promise<number[][]> {
    try {
      // OpenAI has a limit of 2048 inputs per request
      const batchSize = 100
      const embeddings: number[][] = []

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize)
        const processedBatch = batch.map(text => this.preprocessText(text))

        const response = await this.openai.embeddings.create({
          model: this.model,
          input: processedBatch
        })

        embeddings.push(...response.data.map(d => d.embedding))
      }

      return embeddings
    } catch (error) {
      console.error('[EmbeddingService] Error in batch embedding:', error)
      throw new Error('Failed to generate batch embeddings')
    }
  }

  /**
   * Generate embedding with metadata for better context
   */
  async generateContextualEmbedding(
    text: string,
    metadata?: {
      insuranceType?: string
      state?: string
      category?: string
    }
  ): Promise<number[]> {
    // Enhance text with metadata for better semantic understanding
    let enhancedText = text

    if (metadata) {
      const contextParts: string[] = []

      if (metadata.insuranceType) {
        contextParts.push(`Insurance Type: ${metadata.insuranceType}`)
      }

      if (metadata.state) {
        contextParts.push(`State: ${metadata.state}`)
      }

      if (metadata.category) {
        contextParts.push(`Category: ${metadata.category}`)
      }

      if (contextParts.length > 0) {
        enhancedText = `${contextParts.join('. ')}. Content: ${text}`
      }
    }

    return this.generateEmbedding(enhancedText)
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }

    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)

    if (norm1 === 0 || norm2 === 0) {
      return 0
    }

    return dotProduct / (norm1 * norm2)
  }

  /**
   * Preprocess text before embedding
   */
  private preprocessText(text: string): string {
    // Remove excessive whitespace
    let processed = text.replace(/\s+/g, ' ').trim()

    // Truncate if too long (OpenAI has token limits)
    const maxLength = 8000 // Approximate character limit for safety
    if (processed.length > maxLength) {
      processed = processed.substring(0, maxLength) + '...'
    }

    return processed
  }

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token on average
    return Math.ceil(text.length / 4)
  }

  /**
   * Calculate embedding cost estimate
   */
  calculateCost(textCount: number): {
    tokens: number
    estimatedCost: number
  } {
    // text-embedding-3-small costs $0.00002 per 1K tokens
    const avgTokensPerText = 100 // Rough average
    const totalTokens = textCount * avgTokensPerText
    const costPer1KTokens = 0.00002

    return {
      tokens: totalTokens,
      estimatedCost: (totalTokens / 1000) * costPer1KTokens
    }
  }
}