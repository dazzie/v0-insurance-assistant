import OpenAI from "openai"
import { getCarriersByState, getTopCarriers, searchCarriers, type InsuranceCarrier } from "@/lib/carrier-database"
import { AUTO_INSURANCE_QUESTIONS, STATE_MINIMUM_COVERAGE } from "@/lib/insurance-needs-analysis"
import { buildQuoteProfile, getPromptsForMissingInfo, formatProfileSummary } from "@/lib/quote-profile"

// Import RAG components
import { RAGQueryPipeline } from "@/lib/rag/core/query-pipeline"
import { VectorizeClient } from "@/lib/rag/core/vectorize-client"
import { EmbeddingService } from "@/lib/rag/services/embedding-service"
import type { ConversationContext } from "@/lib/rag/types"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize RAG components (singleton instances)
let ragPipeline: RAGQueryPipeline | null = null

function getRAGPipeline() {
  if (!ragPipeline) {
    const vectorizeClient = new VectorizeClient()
    const embeddingService = new EmbeddingService()
    ragPipeline = new RAGQueryPipeline(vectorizeClient, embeddingService)
  }
  return ragPipeline
}

export async function POST(req: Request) {
  const { messages, customerProfile } = await req.json()

  console.log("[v0 with RAG] API called with messages:", messages.length, "customer profile:", customerProfile)

  // Check if mock mode is enabled
  const useMock = process.env.USE_MOCK_RESPONSES === 'true' || !process.env.OPENAI_API_KEY

  try {
    if (useMock) {
      // Use existing mock response generator (code omitted for brevity)
      // ... [existing mock response code]
    }

    // Extract the last user message for RAG query
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()

    let ragContext = null
    let ragSources = null

    // Only use RAG if we have a user question and RAG is enabled
    if (lastUserMessage && process.env.ENABLE_RAG !== 'false') {
      try {
        console.log("[RAG] Querying for context on:", lastUserMessage.content)

        const pipeline = getRAGPipeline()

        // Build conversation context for RAG
        const conversationContext: Partial<ConversationContext> = {
          messages: messages.map((m: any) => ({
            role: m.role,
            content: m.content
          })),
          insuranceType: customerProfile?.insuranceType?.toLowerCase() as any,
          state: customerProfile?.location?.split(',')[1]?.trim()
        }

        // Query RAG pipeline
        const ragResponse = await pipeline.query(
          lastUserMessage.content,
          conversationContext,
          {
            topK: 5,
            insuranceType: customerProfile?.insuranceType?.toLowerCase() as any,
            state: customerProfile?.location?.split(',')[1]?.trim()
          }
        )

        ragContext = ragResponse.context
        ragSources = ragResponse.sources

        console.log(`[RAG] Found ${ragSources.length} relevant sources`)
      } catch (ragError) {
        console.error("[RAG] Error getting context:", ragError)
        // Continue without RAG context if there's an error
      }
    }

    // Enhanced system prompt with RAG context
    const systemPromptContent = buildSystemPrompt(customerProfile, ragContext)

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPromptContent },
        ...messages
      ],
      model: "gpt-4-turbo-preview",
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Create a stream that includes source citations if available
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the main response
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ""
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }

          // Append source citations if we used RAG
          if (ragSources && ragSources.length > 0) {
            const sourcesText = formatSourceCitations(ragSources)
            controller.enqueue(encoder.encode(sourcesText))
          }

          controller.close()
        } catch (error) {
          console.error("[Streaming] Error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    })

  } catch (error) {
    console.error("[Chat API] Error:", error)
    return new Response("An error occurred while processing your request.", {
      status: 500,
    })
  }
}

/**
 * Build system prompt with optional RAG context
 */
function buildSystemPrompt(customerProfile: any, ragContext: string | null): string {
  const basePrompt = `
You are a highly knowledgeable, friendly, and professional insurance assistant helping users understand and obtain insurance coverage.

${customerProfile ? `
Customer Profile:
- Age: ${customerProfile.age || 'Not specified'}
- Location: ${customerProfile.location || 'Not specified'}
- Insurance Type: ${customerProfile.insuranceType || 'Not specified'}
` : ''}

Your role is to:
1. Help users understand their insurance needs
2. Educate them about coverage options
3. Gather necessary information for accurate quotes
4. Provide personalized recommendations based on their situation
5. Prepare them for conversations with insurance carriers
`

  // Add RAG context if available
  if (ragContext) {
    return `${basePrompt}

IMPORTANT - Use the following verified insurance information to answer the user's question accurately:

${ragContext}

When using this information:
- Provide specific, accurate answers based on the context
- Cite sources when mentioning regulations or requirements
- If the context doesn't fully answer the question, acknowledge this and provide general guidance
- Always prioritize accuracy over assumptions

Continue with your helpful, professional tone while incorporating this information naturally into your response.`
  }

  return basePrompt
}

/**
 * Format source citations for display
 */
function formatSourceCitations(sources: Array<{ type: string; title: string; relevance: number }>): string {
  if (!sources || sources.length === 0) {
    return ""
  }

  // Filter and sort sources by relevance
  const relevantSources = sources
    .filter(s => s.relevance > 0.7) // Only show highly relevant sources
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3) // Show top 3 sources

  if (relevantSources.length === 0) {
    return ""
  }

  let citation = "\n\n---\n*Sources consulted:*\n"
  relevantSources.forEach((source, index) => {
    citation += `${index + 1}. ${source.title} (${source.type})\n`
  })

  return citation
}

// Mock response generator function (keeping existing mock functionality)
function generateMockInsuranceResponse(customerProfile: any, messages: any[]): string {
  // [Existing mock response code - omitted for brevity]
  return "This is a mock response for testing purposes."
}