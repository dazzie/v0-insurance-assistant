// RAG Type Definitions

export type InsuranceType = 'auto' | 'home' | 'life' | 'renters' | 'pet' | 'health' | 'disability' | 'umbrella'

export type VectorIndexName = 'knowledge' | 'quotes' | 'carriers' | 'conversation' | 'market'

export interface VectorDocument {
  id: string
  content: string
  metadata: DocumentMetadata
  embedding?: number[]
}

export interface DocumentMetadata {
  type: string
  insuranceType?: InsuranceType
  state?: string
  source?: string
  title?: string
  lastUpdated?: string
  relevanceScore?: number
}

export interface SearchResult {
  id: string
  score: number
  content: string
  metadata: DocumentMetadata
}

export interface RAGContext {
  context: string
  sources: Array<{
    type: string
    title: string
    relevance: number
  }>
}

export interface VectorizeConfig {
  accountId: string
  apiToken: string
  indexes: Map<VectorIndexName, VectorIndexConfig>
}

export interface VectorIndexConfig {
  name: string
  dimensions: number
  metric: 'cosine' | 'euclidean' | 'dot-product'
}

// Knowledge Base Types
export interface InsuranceKnowledge {
  id: string
  type: 'regulation' | 'definition' | 'policy' | 'claim' | 'faq' | 'coverage'
  state?: string
  insuranceType: InsuranceType
  title: string
  content: string
  metadata: {
    lastUpdated: Date
    source: string
    relevanceScore: number
    tags?: string[]
  }
  embedding?: number[]
}

// Quote History Types
export interface QuoteHistory {
  id: string
  userProfile: {
    age: number
    location: string
    insuranceType: string
    riskProfile: string
  }
  quoteData: {
    carriers: Array<{
      name: string
      premium: number
      coverage: any
    }>
    selectedCoverage: any
    finalPrice: number
  }
  outcome: {
    purchased: boolean
    satisfaction?: number
  }
  embedding?: number[]
}

// Carrier Intelligence Types
export interface CarrierIntelligence {
  id: string
  carrier: string
  category: 'profile' | 'coverage' | 'reviews' | 'claims' | 'discounts'
  content: string
  ratings: {
    overallSatisfaction: number
    claimsSatisfaction: number
    priceValue: number
  }
  idealCustomer: {
    ageRange: [number, number]
    riskProfile: string[]
    coverageNeeds: string[]
  }
  embedding?: number[]
}

// Conversation Context Types
export interface ConversationContext {
  sessionId: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  extractedIntents: string[]
  userPriorities: {
    price: number // 0-1 importance
    coverage: number
    service: number
    convenience: number
  }
  knowledgeGaps: string[]
  insuranceType?: InsuranceType
  state?: string
  embedding?: number[]
}

// Local Market Types
export interface LocalMarketData {
  id: string
  zipCode: string
  state: string
  dataType: 'risk' | 'pricing' | 'agents' | 'programs' | 'events'
  metrics: {
    avgPremium: number
    riskScore: number
    claimFrequency: number
  }
  insights: string
  embedding?: number[]
}