// Content Ingestion Utilities for RAG

import { VectorizeClient } from '../core/vectorize-client'
import { EmbeddingService } from '../services/embedding-service'
import {
  VectorDocument,
  InsuranceKnowledge,
  CarrierIntelligence,
  QuoteHistory,
  VectorIndexName
} from '../types'

interface ChunkOptions {
  maxChunkSize?: number
  overlap?: number
  preserveSentences?: boolean
}

export class ContentIngestion {
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
   * Ingest insurance knowledge documents
   */
  async ingestKnowledge(documents: InsuranceKnowledge[]): Promise<void> {
    console.log(`[ContentIngestion] Ingesting ${documents.length} knowledge documents`)

    // Chunk large documents
    const chunkedDocs = documents.flatMap(doc =>
      this.chunkDocument(doc.content, {
        maxChunkSize: 1000,
        overlap: 200,
        preserveSentences: true
      }).map((chunk, index) => ({
        ...doc,
        id: `${doc.id}_chunk_${index}`,
        content: chunk
      }))
    )

    // Generate embeddings in batches
    const contents = chunkedDocs.map(doc => doc.content)
    const embeddings = await this.embeddingService.batchEmbed(contents)

    // Prepare vector documents
    const vectorDocs: VectorDocument[] = chunkedDocs.map((doc, index) => ({
      id: doc.id,
      content: doc.content,
      metadata: {
        type: doc.type,
        insuranceType: doc.insuranceType,
        state: doc.state,
        source: doc.metadata.source,
        title: doc.title,
        lastUpdated: doc.metadata.lastUpdated.toISOString(),
        relevanceScore: doc.metadata.relevanceScore
      },
      embedding: embeddings[index]
    }))

    // Upsert to Vectorize
    await this.vectorizeClient.upsert('knowledge', vectorDocs)
    console.log(`[ContentIngestion] Successfully ingested ${vectorDocs.length} knowledge chunks`)
  }

  /**
   * Ingest carrier intelligence data
   */
  async ingestCarrierData(carriers: CarrierIntelligence[]): Promise<void> {
    console.log(`[ContentIngestion] Ingesting ${carriers.length} carrier documents`)

    // Generate embeddings
    const contents = carriers.map(c =>
      `${c.carrier} - ${c.category}: ${c.content}`
    )
    const embeddings = await this.embeddingService.batchEmbed(contents)

    // Prepare vector documents
    const vectorDocs: VectorDocument[] = carriers.map((carrier, index) => ({
      id: carrier.id,
      content: carrier.content,
      metadata: {
        type: 'carrier',
        title: `${carrier.carrier} - ${carrier.category}`,
        source: carrier.carrier,
        relevanceScore: carrier.ratings.overallSatisfaction / 5
      },
      embedding: embeddings[index]
    }))

    await this.vectorizeClient.upsert('carriers', vectorDocs)
    console.log(`[ContentIngestion] Successfully ingested ${vectorDocs.length} carrier documents`)
  }

  /**
   * Chunk a document into smaller pieces
   */
  chunkDocument(text: string, options: ChunkOptions = {}): string[] {
    const {
      maxChunkSize = 1000,
      overlap = 200,
      preserveSentences = true
    } = options

    const chunks: string[] = []

    if (preserveSentences) {
      // Split by sentences
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
      let currentChunk = ''

      for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= maxChunkSize) {
          currentChunk += sentence + ' '
        } else {
          if (currentChunk) {
            chunks.push(currentChunk.trim())
          }
          currentChunk = sentence + ' '
        }
      }

      if (currentChunk) {
        chunks.push(currentChunk.trim())
      }

      // Add overlapping content
      if (overlap > 0 && chunks.length > 1) {
        const overlappingChunks: string[] = []
        for (let i = 0; i < chunks.length; i++) {
          if (i === 0) {
            overlappingChunks.push(chunks[i])
          } else {
            const prevEnd = chunks[i - 1].slice(-overlap)
            overlappingChunks.push(prevEnd + ' ' + chunks[i])
          }
        }
        return overlappingChunks
      }
    } else {
      // Simple character-based chunking
      for (let i = 0; i < text.length; i += maxChunkSize - overlap) {
        chunks.push(text.slice(i, i + maxChunkSize))
      }
    }

    return chunks
  }

  /**
   * Ingest sample insurance knowledge base
   */
  async ingestSampleKnowledge(): Promise<void> {
    const sampleKnowledge: InsuranceKnowledge[] = [
      {
        id: 'ca_auto_min_2024',
        type: 'regulation',
        state: 'CA',
        insuranceType: 'auto',
        title: 'California Minimum Auto Insurance Requirements',
        content: 'California requires all drivers to carry minimum liability insurance with the following coverage limits: Bodily Injury Liability of $15,000 per person and $30,000 per accident, and Property Damage Liability of $5,000. This is often referred to as 15/30/5 coverage. Additionally, California law requires drivers to carry uninsured motorist coverage unless waived in writing. Drivers must show proof of financial responsibility, which can be satisfied through insurance, a surety bond, or a cash deposit with the DMV.',
        metadata: {
          lastUpdated: new Date('2024-01-01'),
          source: 'California Department of Insurance',
          relevanceScore: 1.0,
          tags: ['minimum coverage', 'liability', 'california', 'requirements']
        }
      },
      {
        id: 'tx_auto_min_2024',
        type: 'regulation',
        state: 'TX',
        insuranceType: 'auto',
        title: 'Texas Minimum Auto Insurance Requirements',
        content: 'Texas requires drivers to maintain minimum liability coverage of 30/60/25, which means: $30,000 for bodily injury per person, $60,000 for bodily injury per accident, and $25,000 for property damage. Texas is an at-fault state, meaning the driver who causes an accident is financially responsible for damages. Proof of financial responsibility must be carried at all times while driving. Texas also requires Personal Injury Protection (PIP) coverage unless rejected in writing.',
        metadata: {
          lastUpdated: new Date('2024-01-01'),
          source: 'Texas Department of Insurance',
          relevanceScore: 1.0,
          tags: ['minimum coverage', 'liability', 'texas', 'requirements', 'PIP']
        }
      },
      {
        id: 'comprehensive_coverage_def',
        type: 'definition',
        insuranceType: 'auto',
        title: 'What is Comprehensive Coverage?',
        content: 'Comprehensive coverage is optional auto insurance that helps pay to repair or replace your vehicle if it\'s damaged by something other than a collision. This includes damage from: theft, vandalism, fire, natural disasters (floods, hurricanes, earthquakes), falling objects (trees, hail), animal collisions (hitting a deer), civil disturbance (riots), and glass damage. Comprehensive coverage is subject to a deductible, which you choose when purchasing the policy. It\'s often required if you lease or finance your vehicle.',
        metadata: {
          lastUpdated: new Date('2024-01-01'),
          source: 'Insurance Information Institute',
          relevanceScore: 0.95,
          tags: ['comprehensive', 'coverage', 'optional', 'damage', 'theft']
        }
      },
      {
        id: 'collision_coverage_def',
        type: 'definition',
        insuranceType: 'auto',
        title: 'What is Collision Coverage?',
        content: 'Collision coverage helps pay to repair or replace your vehicle if it\'s damaged in an accident with another vehicle or object, such as a fence, guardrail, or tree. This coverage applies regardless of who is at fault. Collision coverage is subject to a deductible that you select (typically $250, $500, or $1,000). The higher your deductible, the lower your premium. Like comprehensive coverage, collision is often required if you lease or finance your vehicle. It covers accidents with other vehicles, single-car accidents, hit-and-run accidents, and accidents with stationary objects.',
        metadata: {
          lastUpdated: new Date('2024-01-01'),
          source: 'Insurance Information Institute',
          relevanceScore: 0.95,
          tags: ['collision', 'coverage', 'optional', 'accident', 'deductible']
        }
      },
      {
        id: 'deductible_explanation',
        type: 'faq',
        insuranceType: 'auto',
        title: 'How Do Deductibles Work?',
        content: 'A deductible is the amount you pay out of pocket before your insurance coverage kicks in. For example, if you have a $500 deductible and $3,000 in damage from a covered claim, you pay $500 and your insurance pays $2,500. Higher deductibles typically result in lower premiums because you\'re taking on more financial responsibility. Common deductible amounts are $250, $500, $1,000, and $2,500. You can often choose different deductibles for comprehensive and collision coverage. Your deductible applies per claim, not per year.',
        metadata: {
          lastUpdated: new Date('2024-01-01'),
          source: 'Insurance Education Foundation',
          relevanceScore: 0.9,
          tags: ['deductible', 'out-of-pocket', 'claims', 'premium']
        }
      }
    ]

    await this.ingestKnowledge(sampleKnowledge)
  }

  /**
   * Ingest sample carrier intelligence
   */
  async ingestSampleCarriers(): Promise<void> {
    const sampleCarriers: CarrierIntelligence[] = [
      {
        id: 'geico_profile_2024',
        carrier: 'GEICO',
        category: 'profile',
        content: 'GEICO (Government Employees Insurance Company) is the second-largest auto insurer in the US, known for competitive rates and strong digital experience. They excel with online quotes, mobile app functionality, and 24/7 customer service. GEICO typically offers lower rates for safe drivers with good credit. They have strong financial ratings (A++ from A.M. Best) and process claims quickly through their mobile app. Best for tech-savvy customers who prefer self-service options.',
        ratings: {
          overallSatisfaction: 4.2,
          claimsSatisfaction: 4.0,
          priceValue: 4.5
        },
        idealCustomer: {
          ageRange: [25, 65],
          riskProfile: ['low', 'medium'],
          coverageNeeds: ['basic', 'standard']
        }
      },
      {
        id: 'progressive_profile_2024',
        carrier: 'Progressive',
        category: 'profile',
        content: 'Progressive is the third-largest auto insurer in the US, pioneering usage-based insurance with their Snapshot program. They specialize in high-risk drivers and offer competitive rates for those with less-than-perfect driving records. Progressive excels in customization options and discounts, including multi-policy, multi-car, and continuous insurance discounts. Their Name Your Price tool helps customers find coverage within their budget. They have strong online and mobile capabilities.',
        ratings: {
          overallSatisfaction: 4.0,
          claimsSatisfaction: 3.9,
          priceValue: 4.3
        },
        idealCustomer: {
          ageRange: [18, 70],
          riskProfile: ['medium', 'high'],
          coverageNeeds: ['basic', 'standard', 'comprehensive']
        }
      },
      {
        id: 'statefarm_profile_2024',
        carrier: 'State Farm',
        category: 'profile',
        content: 'State Farm is the largest auto insurer in the US with the most extensive agent network. They excel in personalized service through local agents and have strong customer loyalty. State Farm offers excellent multi-policy discounts when bundling auto with home or life insurance. They have superior claims handling with a large network of approved repair shops. Their Drive Safe & Save program offers discounts for safe driving. Best for customers who value personal relationships and local agent support.',
        ratings: {
          overallSatisfaction: 4.4,
          claimsSatisfaction: 4.3,
          priceValue: 4.0
        },
        idealCustomer: {
          ageRange: [25, 75],
          riskProfile: ['low', 'medium'],
          coverageNeeds: ['standard', 'comprehensive', 'premium']
        }
      }
    ]

    await this.ingestCarrierData(sampleCarriers)
  }
}