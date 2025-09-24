import OpenAI from "openai"
import { getCarriersByState, getTopCarriers, searchCarriers, type InsuranceCarrier } from "@/lib/carrier-database"
import { AUTO_INSURANCE_QUESTIONS, STATE_MINIMUM_COVERAGE } from "@/lib/insurance-needs-analysis"
import { buildQuoteProfile, getPromptsForMissingInfo, formatProfileSummary } from "@/lib/quote-profile"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages, customerProfile } = await req.json()

  console.log("[v0] API called with messages:", messages.length, "customer profile:", customerProfile)

  // Check if mock mode is enabled
  const useMock = process.env.USE_MOCK_RESPONSES === 'true' || !process.env.OPENAI_API_KEY

  try {
    if (useMock) {
      // Use existing mock response generator
      const mockResponse = generateMockInsuranceResponse(customerProfile, messages)
      
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // Simulate streaming by sending chunks
          const chunks = mockResponse.split(" ")
          let index = 0

          const sendChunk = () => {
            if (index < chunks.length) {
              controller.enqueue(encoder.encode(chunks[index] + " "))
              index++
              setTimeout(sendChunk, 50) // Simulate typing delay
            } else {
              controller.close()
            }
          }

          sendChunk()
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
        },
      })
    } else {
      // Use OpenAI for real responses
      const systemPrompt = generateSystemPrompt(customerProfile, messages)
      
      // Prepare messages for OpenAI
      const openAIMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }))
      ]

      // Create streaming response from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: openAIMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      })

      // Convert OpenAI stream to ReadableStream
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || ""
              if (content) {
                controller.enqueue(encoder.encode(content))
              }
            }
          } catch (error) {
            console.error("[v0] OpenAI streaming error:", error)
            controller.error(error)
          } finally {
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
        },
      })
    }
  } catch (error) {
    console.error("[v0] API Error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

function generateSystemPrompt(customerProfile: any, messages: any[] = []): string {
  const location = customerProfile?.location || "Not specified"
  const age = customerProfile?.age || "Not specified"
  const needs = customerProfile?.needs || []
  
  const state = extractStateFromLocation(location)
  const relevantCarriers = state ? getCarriersByState(state) : getTopCarriers(6)
  
  const carrierInfo = relevantCarriers
    .map(c => `- ${c.name}: ${c.rating.amBest} rating, ${c.marketShare}% market share, specializes in ${c.types.join(", ")}`)
    .join("\n")
  
  const stateMinimums = state && STATE_MINIMUM_COVERAGE[state] 
    ? `\nState Minimum Requirements for ${state}:
${JSON.stringify(STATE_MINIMUM_COVERAGE[state], null, 2)}`
    : ""

  // Build quote profile if this is for auto insurance
  let quoteProfileInfo = ""
  let nextPrompts: string[] = []
  
  if (needs.includes("auto") && messages.length > 0) {
    const quoteProfile = buildQuoteProfile(messages, customerProfile)
    nextPrompts = getPromptsForMissingInfo(quoteProfile)
    
    quoteProfileInfo = `

CURRENT QUOTE PROFILE STATUS:
${formatProfileSummary(quoteProfile)}

${nextPrompts.length > 0 ? `Next Information Needed:
${nextPrompts.map(p => `- ${p}`).join('\n')}` : 'All essential information collected! Ready to generate quotes and carrier toolkit.'}
`
  }

  const needsAnalysisPrompt = needs.includes("auto") ? `

CRITICAL RULES FOR AUTO INSURANCE QUOTES:

**CUSTOMER PROFILE ALREADY PROVIDED:**
- Age: ${age} (USE THIS for single driver - DON'T ASK AGAIN)
- Location: ${location}

**MINIMUM QUOTE REQUIREMENTS SUMMARY:**
Must collect ALL 5 items before providing ANY quotes:
1. Driver count → 2. Vehicle count → 3. ZIP code → 4. All driver ages → 5. All vehicle year/make/model

NO quotes, estimates, or summaries until ALL 5 requirements are met!

**PRIORITY: GET QUOTE INFORMATION AS QUICKLY AS POSSIBLE**
- Be DIRECT and TARGETED in initial responses
- Skip lengthy introductions or explanations unless asked
- Focus immediately on collecting the 5 required fields
- Minimize coaching/educational content during data collection
- Save detailed analysis for AFTER all required info is gathered

1. **ASK FOR ONE PIECE OF INFORMATION AT A TIME**
   - NEVER provide a long list of questions
   - Ask ONE specific question, wait for the answer
   - Move to the next question only after receiving a response
   - DO NOT provide any quotes, estimates, or summaries while collecting information
   
2. **TRACK WHAT'S BEEN COLLECTED**
   - The Quote Profile shows what you already have
   - NEVER ask for information that's already been provided
   - Check the profile status before asking anything

3. **BE EXTREMELY CONCISE AND TARGETED**
   - Keep responses under 2 sentences during data collection
   - Ask the specific question directly - NO fluff or pleasantries
   - Don't explain why you need the information unless specifically asked
   - Get straight to the required information gathering
   - Example: "How many drivers?" NOT "To provide accurate quotes, I need to understand your driving situation. How many drivers will be on this policy?"

4. **MINIMUM REQUIRED DETAILS FOR QUOTES** (Must collect ALL before providing any quotes):

   **ABSOLUTE MINIMUM REQUIREMENTS:**
   1. Number of drivers on the policy (exact count)
   2. Number of vehicles to insure (exact count)
   3. Primary ZIP code where vehicles are garaged
   4. Age of each driver (NOTE: If only 1 driver, use ${age} from profile - DON'T ASK AGAIN)
   5. For EACH vehicle:
      - Year (e.g., "2020")
      - Make (e.g., "Honda") 
      - Model (e.g., "Civic")
   
   **CRITICAL**: NO QUOTES, ESTIMATES, OR SUMMARIES until you have collected ALL 5 items above.

   **ENHANCED QUOTE ACCURACY** (Collect these AFTER minimum requirements):
   For each driver:
   - Years licensed (affects rates significantly)
   - Marital status (married = discount)
   - Violation/accident history in past 5 years
   
   For each vehicle:
   - Annual mileage (low mileage = discount)
   - Primary use (commute vs pleasure affects rates)
   - Ownership status (own/lease/finance affects coverage needs)

   **COLLECTION ORDER** (One question at a time):
   1. "How many drivers will be on this policy?"
   2. "How many vehicles do you need to insure?"
   3. "What's your ZIP code?"
   4. [If multiple drivers] "What are the ages of the other drivers?"
   5. For each vehicle: "What year is vehicle #1?" → "What make?" → "What model?"
   6. Then continue with enhanced details for better accuracy

5. **EXAMPLE TARGETED RESPONSES** (direct, no fluff):
   - "How many drivers?"
   - "How many vehicles?"
   - "What's your ZIP code?"
   - "What year is your vehicle?"
   - "What make?"
   - "What model?"
   - "How many years licensed?"
   - "Marital status?"
   - "Any violations or accidents in past 5 years?"
   - "Annual mileage?"
   
6. **QUOTE ELIGIBILITY CHECKPOINT**:
   
   **BEFORE PROVIDING ANY QUOTES, VERIFY YOU HAVE:**
   ✅ Driver count (exact number)
   ✅ Vehicle count (exact number)  
   ✅ ZIP code (5 digits)
   ✅ All driver ages (use ${age} for single driver from profile)
   ✅ ALL vehicle details (year, make, model for each vehicle)
   
   **IF MISSING ANY ITEM ABOVE**: Continue collecting, do NOT provide quotes
   **ONCE ALL 5 REQUIREMENTS MET**: You MAY provide basic quote estimates
   
   **FOR MOST ACCURATE QUOTES**: Also collect enhanced details:
   - Years licensed, marital status, driving record (per driver)
   - Annual mileage, primary use (per vehicle)
   
   **NEVER provide quotes with incomplete minimum requirements!**

Once ALL information is collected, THEN provide:
- Estimated premium ranges based on their profile
- Specific carrier recommendations with reasoning
- Coverage recommendations based on their situation
- Money-saving opportunities specific to their profile

IMPORTANT: Once you have collected all necessary information, offer to generate a "Carrier Conversation Toolkit" that includes:
1. A summary of their profile for easy reference when calling carriers
2. Smart questions to ask each carrier
3. Negotiation strategies specific to their situation
4. Documents they'll need ready
5. Their strengths to emphasize (clean record, continuous coverage, etc.)
6. Red flags to watch out for

Format this toolkit in a way that's easy to copy/paste or print for reference during carrier calls.` : ""

  return `You are an expert insurance coverage coach helping a customer optimize their insurance portfolio.${quoteProfileInfo} 
You provide personalized guidance that's educational, empowering, and focused on helping them make informed decisions.

Customer Profile:
- Location: ${location}
- Age: ${age}
- Insurance Needs: ${needs.join(", ") || "To be determined"}

Top Carriers in their area:
${carrierInfo}
${stateMinimums}
${needsAnalysisPrompt}

Your role is to:
1. Conduct thorough needs analysis for accurate quote estimates
2. Provide personalized insurance coaching and education
3. Recommend appropriate carriers based on their specific situation
4. Teach negotiation strategies and money-saving tactics
5. Help them understand coverage options and make informed decisions
6. Offer strategic guidance for building comprehensive protection

Key guidelines:
- Be conversational but professional
- Progressively gather information needed for accurate quotes
- Explain how each factor affects their insurance rates
- Focus on education and empowerment
- Provide specific, actionable advice
- Use the carrier information to make relevant recommendations
- Help them understand the "why" behind insurance decisions
- Offer negotiation tips and insider knowledge
- Structure responses with clear sections using markdown headers
- Include specific next steps they can take

Remember: You're their trusted coach, not a salesperson. Your goal is to help them get the best coverage at the best price while truly understanding their insurance needs. When gathering information for quotes, be transparent about why you're asking and how it impacts their rates.`
}

function extractStateFromLocation(location: string): string | null {
  const stateAbbreviations: { [key: string]: string } = {
    california: "CA",
    ca: "CA",
    "new york": "NY",
    ny: "NY",
    texas: "TX",
    tx: "TX",
    florida: "FL",
    fl: "FL",
    illinois: "IL",
    il: "IL",
    pennsylvania: "PA",
    pa: "PA",
    ohio: "OH",
    oh: "OH",
    georgia: "GA",
    ga: "GA",
    "north carolina": "NC",
    nc: "NC",
    michigan: "MI",
    mi: "MI",
    "new jersey": "NJ",
    nj: "NJ",
    virginia: "VA",
    va: "VA",
    washington: "WA",
    wa: "WA",
    arizona: "AZ",
    az: "AZ",
    massachusetts: "MA",
    ma: "MA",
    tennessee: "TN",
    tn: "TN",
    indiana: "IN",
    in: "IN",
    missouri: "MO",
    mo: "MO",
    maryland: "MD",
    md: "MD",
    wisconsin: "WI",
    wi: "WI",
    colorado: "CO",
    co: "CO",
    minnesota: "MN",
    mn: "MN",
    "south carolina": "SC",
    sc: "SC",
    alabama: "AL",
    al: "AL",
    louisiana: "LA",
    la: "LA",
    kentucky: "KY",
    ky: "KY",
    oregon: "OR",
    or: "OR",
    oklahoma: "OK",
    ok: "OK",
    connecticut: "CT",
    ct: "CT",
    utah: "UT",
    ut: "UT",
  }

  const locationLower = location.toLowerCase()
  for (const [state, abbr] of Object.entries(stateAbbreviations)) {
    if (locationLower.includes(state)) {
      return abbr
    }
  }
  return null
}

// Keep the existing mock response generator for fallback
function generateMockInsuranceResponse(customerProfile: any, messages: any[]) {
  const location = customerProfile?.location || "Not specified"
  const age = customerProfile?.age || "Not specified"
  const needs = customerProfile?.needs || []

  const lastMessage = messages[messages.length - 1]?.content || ""

  const state = extractStateFromLocation(location)
  const relevantCarriers = state ? getCarriersByState(state) : getTopCarriers(6)

  const conversationContext = analyzeConversationContext(messages, customerProfile)
  
  // Build quote profile if this is for auto insurance
  let quoteProfile = null
  let nextPrompts: string[] = []
  
  if (needs.includes("auto")) {
    quoteProfile = buildQuoteProfile(messages, customerProfile)
    nextPrompts = getPromptsForMissingInfo(quoteProfile)
    // Check if user is asking for the toolkit
    if (lastMessage.toLowerCase().includes("toolkit") || 
        lastMessage.toLowerCase().includes("summary") || 
        lastMessage.toLowerCase().includes("prepare") ||
        (lastMessage.toLowerCase().includes("ready") && lastMessage.toLowerCase().includes("call")) ||
        lastMessage.toLowerCase().includes("generate my")) {
      return generateCarrierConversationToolkit(customerProfile, conversationContext)
    }
    
    // Check if we have enough basic info to provide quotes
    const hasBasicInfo = conversationContext.hasDiscussedCarriers || 
                         (messages.length > 4 && 
                          messages.some(m => m.content.toLowerCase().includes("vehicle")) &&
                          messages.some(m => m.content.toLowerCase().includes("driver")))
    
    if (hasBasicInfo && !lastMessage.toLowerCase().includes("what") && !lastMessage.toLowerCase().includes("how")) {
      // User has provided info, give them options
      return generateQuoteReadyResponse(location, age, relevantCarriers)
    }
    
    // Continue needs analysis for early messages
    if (messages.length <= 6) {
      return generateAutoNeedsAnalysisResponse(lastMessage, location, age, messages.length)
    }
  }

  if (
    lastMessage.toLowerCase().includes("negotiate") ||
    lastMessage.toLowerCase().includes("better price") ||
    lastMessage.toLowerCase().includes("lower rate") ||
    lastMessage.toLowerCase().includes("discount")
  ) {
    return generateNegotiationCoachingResponse(location, age, relevantCarriers, conversationContext)
  }

  // If it's a follow-up question, provide a relevant response
  if (messages.length > 1) {
    if (
      lastMessage.toLowerCase().includes("carrier") ||
      lastMessage.toLowerCase().includes("company") ||
      lastMessage.toLowerCase().includes("insurer")
    ) {
      const searchResults = searchCarriers(lastMessage)
      const carriersToShow = searchResults.length > 0 ? searchResults.slice(0, 3) : relevantCarriers.slice(0, 3)

      return generateCarrierResponse(carriersToShow, location, needs, conversationContext)
    }

    return generateContextualResponse(lastMessage, location, age, conversationContext)
  }

  return generateInitialCoachingResponse(location, age, needs, relevantCarriers)
}

function analyzeConversationContext(messages: any[], customerProfile: any) {
  const context = {
    hasDiscussedCarriers: false,
    hasDiscussedPricing: false,
    hasDiscussedCoverage: false,
    hasDiscussedNegotiation: false,
    urgencyLevel: "normal",
    preferredChannel: "unknown",
    riskProfile: "standard",
    budgetConcerns: false,
    experienceLevel: "beginner",
  }

  const allMessages = messages.map((m) => m.content.toLowerCase()).join(" ")

  // Analyze conversation patterns
  if (allMessages.includes("carrier") || allMessages.includes("company") || allMessages.includes("insurer")) {
    context.hasDiscussedCarriers = true
  }

  if (
    allMessages.includes("price") ||
    allMessages.includes("cost") ||
    allMessages.includes("rate") ||
    allMessages.includes("premium")
  ) {
    context.hasDiscussedPricing = true
  }

  if (allMessages.includes("coverage") || allMessages.includes("policy") || allMessages.includes("protection")) {
    context.hasDiscussedCoverage = true
  }

  if (allMessages.includes("negotiate") || allMessages.includes("discount") || allMessages.includes("better deal")) {
    context.hasDiscussedNegotiation = true
  }

  // Determine urgency
  if (
    allMessages.includes("urgent") ||
    allMessages.includes("asap") ||
    allMessages.includes("immediately") ||
    allMessages.includes("expires")
  ) {
    context.urgencyLevel = "high"
  } else if (allMessages.includes("soon") || allMessages.includes("quickly")) {
    context.urgencyLevel = "medium"
  }

  // Determine preferred channel
  if (allMessages.includes("agent") || allMessages.includes("person") || allMessages.includes("face to face")) {
    context.preferredChannel = "agent"
  } else if (allMessages.includes("online") || allMessages.includes("website") || allMessages.includes("digital")) {
    context.preferredChannel = "digital"
  }

  // Assess budget concerns
  if (
    allMessages.includes("cheap") ||
    allMessages.includes("affordable") ||
    allMessages.includes("budget") ||
    allMessages.includes("save money")
  ) {
    context.budgetConcerns = true
  }

  // Assess experience level
  if (
    allMessages.includes("first time") ||
    allMessages.includes("new to") ||
    allMessages.includes("don't understand") ||
    allMessages.includes("confused")
  ) {
    context.experienceLevel = "beginner"
  } else if (
    allMessages.includes("experienced") ||
    allMessages.includes("know about") ||
    allMessages.includes("familiar with")
  ) {
    context.experienceLevel = "advanced"
  }

  return context
}

function generateContextualResponse(lastMessage: string, location: string, age: string, context: any): string {
  const nextSteps = generateDynamicNextSteps(context, location, age)

  return `## Coaching Insight: "${lastMessage}"

As your insurance coverage coach, here's my personalized guidance for someone in ${location} at age ${age}:

### Current Market Analysis
The insurance landscape is constantly evolving, and I'm seeing some positive trends that could benefit you. Recent regulatory improvements have strengthened consumer protections, and carriers are becoming more competitive with flexible coverage options.

### My Strategic Recommendations
Based on your question and profile, here's what I recommend:

**Immediate Actions:**
- **Comparison Shopping**: Get quotes from at least 3-4 carriers to ensure competitive pricing
- **Coverage Bundling**: Consider combining policies for potential 10-25% savings
- **Annual Reviews**: Schedule yearly check-ins to adjust coverage as your life changes
- **Tax Optimization**: Explore available tax advantages for certain insurance products
- **Price Negotiation**: Use my proven strategies to secure better rates from carriers

### Your Next Steps
I suggest we focus on building a comprehensive protection strategy that grows with you. This isn't just about finding the cheapest option - it's about finding the right balance of coverage, cost, and peace of mind.

${nextSteps}

*Remember: I'm here as your dedicated coach to guide you through every decision, ensuring you get the protection that's truly right for you.*`
}

function generateDynamicNextSteps(context: any, location: string, age: string): string {
  const steps = []

  // Prioritize based on what hasn't been discussed yet
  if (!context.hasDiscussedCarriers) {
    steps.push(
      "🏢 **Explore Top Carriers** - Let me show you the best-rated insurers in your area with personalized pros/cons",
    )
  }

  if (!context.hasDiscussedPricing && context.budgetConcerns) {
    steps.push(
      "💰 **Budget Optimization** - I'll find you maximum coverage at minimum cost with hidden discount strategies",
    )
  }

  if (!context.hasDiscussedNegotiation && context.hasDiscussedPricing) {
    steps.push("🎯 **Negotiation Masterclass** - Learn my proven scripts to cut 15-25% off any quote")
  }

  if (!context.hasDiscussedCoverage) {
    steps.push("🛡️ **Coverage Gap Analysis** - Let me identify what you're missing and what you're overpaying for")
  }

  // Add urgency-based options
  if (context.urgencyLevel === "high") {
    steps.unshift(
      "⚡ **Fast-Track Quote Process** - Get competitive quotes in under 24 hours with my streamlined approach",
    )
  }

  // Add channel-specific options
  if (context.preferredChannel === "agent") {
    steps.push("🤝 **Agent Matchmaking** - I'll connect you with top-rated local agents who specialize in your needs")
  } else if (context.preferredChannel === "digital") {
    steps.push("💻 **Digital Quote Strategy** - Master the online application process for maximum discounts")
  }

  // Add experience-level appropriate options
  if (context.experienceLevel === "beginner") {
    steps.push(
      "📚 **Insurance 101 Crash Course** - I'll explain everything in simple terms so you make confident decisions",
    )
  } else if (context.experienceLevel === "advanced") {
    steps.push("🎓 **Advanced Strategies** - Explore sophisticated coverage structures and tax-advantaged options")
  }

  // Add location-specific options
  if (location.toLowerCase().includes("california") || location.toLowerCase().includes("ca")) {
    steps.push(
      "🌎 **California-Specific Insights** - Navigate unique state requirements and earthquake coverage options",
    )
  }

  // Add age-specific options
  const ageNum = Number.parseInt(age)
  if (ageNum < 25) {
    steps.push("🚗 **Young Driver Strategies** - Unlock discounts and coverage options specifically for your age group")
  } else if (ageNum > 50) {
    steps.push("👥 **Mature Driver Benefits** - Explore senior discounts and retirement-focused coverage adjustments")
  }

  // Ensure we have at least 3-5 options
  if (steps.length < 3) {
    steps.push(
      "📊 **Personalized Quote Comparison** - I'll analyze multiple carriers side-by-side for your exact situation",
    )
    steps.push("🔄 **Policy Review & Optimization** - Let me audit your current coverage for savings opportunities")
    steps.push("📅 **Strategic Planning Session** - Create a 5-year insurance roadmap that adapts to your life changes")
  }

  // Limit to top 5 most relevant options
  const topSteps = steps.slice(0, 5)

  return `**What would you like to tackle next?**

${topSteps.map((step, index) => `${index + 1}. ${step}`).join("\n\n")}

**Or ask me anything specific** - I can dive deeper into carriers, coverage types, negotiation tactics, or help you prioritize based on your unique situation.`
}

function generateCarrierResponse(
  carriers: InsuranceCarrier[],
  location: string,
  needs: string[],
  context?: any,
): string {
  let response = `## Your Personalized Carrier Analysis for ${location}

As your insurance coach, I've researched the best carriers for your specific situation. Here's my professional assessment:

`

  carriers.forEach((carrier, index) => {
    response += `### ${index + 1}. ${carrier.name} - My Assessment\n`
    response += `**Financial Strength**: ${carrier.rating.amBest} (A.M. Best) - This indicates strong financial stability\n`
    response += `**Market Position**: ${carrier.marketShare}% market share - ${carrier.marketShare > 5 ? "Major player with extensive resources" : "Specialized focus with personalized service"}\n`
    response += `**Experience**: Founded ${carrier.founded} - ${new Date().getFullYear() - carrier.founded} years of industry experience\n`
    response += `**Key Strengths**: ${carrier.strengths.join(", ")}\n`

    // Show relevant products based on customer needs
    const relevantProducts = needs.filter((need) =>
      carrier.types.includes(need.toLowerCase().replace(" insurance", "")),
    )

    if (relevantProducts.length > 0) {
      response += `**Perfect Match For**: ${relevantProducts.join(", ")} - Aligns with your stated needs\n`
    }

    response += `**Contact Options**: ${carrier.contact.phone} | ${carrier.contact.website}\n`
    response += `**Service Model**: ${carrier.contact.hasLocalAgents ? "Local agents available for face-to-face service" : "Streamlined digital experience"}\n\n`
  })

  const nextSteps = generateDynamicNextSteps(context || {}, location, "")

  response += `## My Coaching Recommendations\n\n`
  response += `**Your Action Plan:**\n`
  response += `1. **Request Quotes**: Contact these top 3 carriers for personalized quotes\n`
  response += `2. **Compare Comprehensively**: Look beyond price - consider coverage limits, deductibles, and service quality\n`
  response += `3. **Leverage Discounts**: Ask each carrier about bundling, safe driver, and loyalty discounts\n`
  response += `4. **Check Reviews**: Research customer satisfaction and claims handling reputation\n\n`
  response += `**Why I Selected These Carriers:**\nThese aren't random recommendations - I chose them based on your location, age, and coverage goals. Each offers unique advantages that could benefit your specific situation.\n\n`

  if (context) {
    response += nextSteps
  } else {
    response += `**Ready for the next step?** I can help you prepare questions to ask each carrier or dive deeper into any specific company that interests you.`
  }

  return response
}

function generateNegotiationCoachingResponse(
  location: string,
  age: string,
  carriers: InsuranceCarrier[],
  context?: any,
): string {
  let response = `## Master Class: Insurance Price Negotiation Strategies

As your insurance coach, I'm going to teach you my proven negotiation techniques that have saved my clients thousands of dollars. Here's your complete playbook:

### 🎯 Pre-Negotiation Preparation (Critical Step!)

**Research Phase:**
- **Get 3-4 competing quotes** - This is your ammunition
- **Document your loyalty** - How long you've been with current carrier
- **List your qualifications** - Clean driving record, no claims, good credit
- **Know your value** - Calculate your lifetime customer value (annual premium × years)

### 💻 Website Negotiation Tactics

**Digital Strategy:**
- **Use online chat during business hours** - Agents have more flexibility than phone reps
- **Apply for quotes during month-end** - Sales quotas create urgency
- **Leverage competitor quotes** - Upload or reference specific competing offers
- **Ask for "retention department"** - They have special pricing authority

**Proven Website Scripts:**
- *"I've been quoted $X by [competitor]. Can you match or beat this rate?"*
- *"I'm ready to switch today if you can improve this offer"*
- *"What additional discounts am I missing that could lower this rate?"*

### 🤝 Agent Negotiation Mastery

**Face-to-Face Advantages:**
- **Build personal relationships** - Agents fight harder for people they like
- **Time your visit strategically** - End of month/quarter when they need sales
- **Bring documentation** - Competing quotes, loyalty history, clean records
- **Ask about unadvertised discounts** - Agents know hidden savings opportunities

**Agent Negotiation Framework:**
1. **Establish rapport** - "I really want to work with you, but I need your help on price"
2. **Present competition** - "Here's what [competitor] offered, can you help me stay?"
3. **Ask for their best effort** - "What's the absolute best rate you can offer?"
4. **Request manager review** - "Can your manager approve any additional discounts?"

### 🏆 Advanced Negotiation Techniques

**The Bundle Strategy:**
- Negotiate multiple policies together (auto + home + life)
- Ask: *"What's your best rate if I move all my insurance to you?"*

**The Loyalty Leverage:**
- For existing customers: *"I've been loyal for X years, what can you do to keep me?"*
- For new customers: *"I'm looking for a long-term relationship, not just a cheap first year"*

**The Timing Advantage:**
- **Best months**: March, June, September, December (quarter-ends)
- **Best days**: Thursdays and Fridays (week-end pressure)
- **Best times**: Late afternoon (daily quota pressure)

### 📊 Negotiation Success Metrics for ${location}

**Realistic Savings Targets:**
- **New customers**: 15-25% below initial quote
- **Existing customers**: 10-20% reduction on renewal
- **Bundle deals**: 20-35% combined savings
- **Loyalty discounts**: 5-15% additional reduction

### 🎯 Carrier-Specific Negotiation Intel

${carriers
  .slice(0, 3)
  .map(
    (carrier, index) => `**${carrier.name}:**
- **Best approach**: ${carrier.contact.hasLocalAgents ? "In-person agent meeting" : "Online chat with retention specialist"}
- **Negotiation window**: ${carrier.contact.hasLocalAgents ? "High flexibility with local agents" : "Moderate flexibility through digital channels"}
- **Key leverage**: ${carrier.strengths[0]} - emphasize why this matters to you`,
  )
  .join("\n\n")}

### 🚀 Your Negotiation Action Plan

**Week 1: Preparation**
- Gather 3-4 competing quotes
- Document your insurance history and qualifications
- Research each carrier's current promotions

**Week 2: Execute**
- Start with your preferred carrier (website or agent)
- Use competing quotes as leverage
- Ask for manager/supervisor review if needed

**Week 3: Finalize**
- Compare final offers including all fees
- Negotiate policy start dates for maximum savings
- Secure written confirmation of all discounts

### 💡 Pro Tips from Your Coach

**What Insurance Companies Don't Want You to Know:**
- They expect negotiation - initial quotes often have 20%+ markup
- Retention departments have special pricing authority
- Bundling discounts are often negotiable beyond advertised rates
- Annual payment discounts can sometimes be increased

**Red Flags to Avoid:**
- Don't accept first offer - always ask "Is that your best rate?"
- Don't negotiate coverage down just for price - maintain adequate protection
- Don't lie about competitor quotes - they can verify
- Don't rush - good deals need time to develop

### 🎯 Your Next Steps

**Ready to negotiate?** I recommend starting with ${carriers[0]?.name} since they're strong in ${location}.\n\n`

  if (context) {
    response += generateDynamicNextSteps(context, location, age) + "\n\n"
  }

  response += `**Need more specific guidance?** Ask me about:\n`
  response += `- Exact scripts for your situation\n`
  response += `- Carrier-specific negotiation strategies\n`
  response += `- How to handle objections\n`
  response += `- When to walk away vs. when to accept\n\n`
  response += `*Remember: Negotiation is a skill, and I'm here to coach you through every conversation. You have more power than you think - let's use it to get you the best possible rates!*`

  return response
}

function generateInitialCoachingResponse(
  location: string,
  age: string,
  needs: string[],
  carriers: InsuranceCarrier[],
): string {
  const topCarriers = carriers.slice(0, 4)

  return `## Welcome to Your Personal Insurance Coaching Session

I'm excited to work with you on optimizing your insurance coverage! Let me start by understanding your unique situation and creating a personalized strategy.

### Your Coverage Profile Analysis
**Location**: ${location} - I'll factor in your state's regulations and market conditions
**Life Stage**: Age ${age} - This significantly influences your coverage priorities and available options
**Coverage Goals**: ${needs.join(", ") || "Let's identify your priorities together"}

### My Initial Assessment & Coaching Plan

**Phase 1: Foundation Building**
Let's ensure you have the essential protections in place:
- **Health Insurance**: Your most critical coverage - protects against catastrophic medical costs
- **Auto Insurance**: Required by law and protects your financial assets
- **Disability Insurance**: Often overlooked but crucial - protects your income if you can't work

**Phase 2: Wealth Protection**
Once basics are covered, we'll explore:
- **Life Insurance**: Protects your family's financial future
- **Property Insurance**: Safeguards your home and belongings
- **Umbrella Coverage**: Additional liability protection for high-net-worth situations

### Top-Rated Carriers I Recommend for Your Area

${topCarriers
  .map(
    (carrier, index) => `**${index + 1}. ${carrier.name}** - ${carrier.rating.amBest} Rating
   *Why I recommend them*: ${carrier.strengths.slice(0, 2).join(" and ")}
   *Best for*: ${carrier.types.slice(0, 3).join(", ")}
   *Service style*: ${carrier.contact.hasLocalAgents ? "Personal agent support" : "Digital-first experience"}`,
  )
  .join("\n\n")}\n\n### Your Personalized Coaching Strategy

**My Approach with You:**
1. **Education First**: I'll explain options clearly so you can make informed decisions
2. **Customized Solutions**: No one-size-fits-all recommendations - everything tailored to your situation
3. **Long-term Partnership**: Insurance needs evolve - I'll help you adapt your coverage over time
4. **Value Optimization**: Finding the right balance between comprehensive protection and budget

**Immediate Next Steps:**
- Identify your highest priority coverage gaps
- Research carriers that best match your needs and preferences  
- Develop a timeline for implementing your insurance strategy
- Set up a system for regular coverage reviews

### Let's Get Started!

**What would you like to focus on first?** 
- Reviewing your current coverage for gaps?
- Exploring specific insurance types?
- Getting carrier recommendations for a particular need?
- Understanding how your age and location affect your options?

I'm here to guide you through every step of building the optimal insurance portfolio for your unique situation. Think of me as your dedicated advisor who's always looking out for your best interests!`
}

function generateCarrierConversationToolkit(profile: any, needs: any): string {
  return `## 📋 Your Carrier Conversation Toolkit

I've prepared everything you need for successful conversations with insurance carriers. Save or print this for reference!

### 🎯 Your Quick Profile Summary
**Location:** ${profile.location}  
**Age:** ${profile.age}  
**Vehicles:** Specify your vehicles here  
**Drivers:** Specify number of drivers  
**Current Insurance:** Yes/No - Current carrier and premium if applicable

### ❓ Essential Questions to Ask Each Carrier

**Pricing & Discounts:**
1. "What's your best rate for my coverage needs?"
2. "What discounts do I qualify for?" (multi-policy, safe driver, good student, etc.)
3. "Is there a discount for paying annually vs monthly?"
4. "Do you price-match competitors?"

**Coverage & Claims:**
5. "What's your claims satisfaction rate?"
6. "Do you offer accident forgiveness?"
7. "How quickly are claims typically processed?"
8. "Do you have 24/7 claims support?"

**Service & Features:**
9. "Do you have local agents or is everything online?"
10. "Can I manage my policy through a mobile app?"
11. "What happens at renewal - automatic or review?"
12. "How much notice for rate changes?"

### 💪 Your Negotiation Power Plays

1. **Open with:** "I'm shopping for the best value and have quotes from [X] other carriers"
2. **If price is high:** "Company X quoted me $[amount] for the same coverage. Can you beat that?"
3. **Create urgency:** "I'm making my decision today. What's the absolute best you can do?"
4. **Ask for supervisor:** "Can you check with your supervisor for any additional discounts?"
5. **Bundle leverage:** "If I bring my home/renters insurance too, what discount would apply?"

### 📄 Documents to Have Ready
□ Driver's licenses for all drivers  
□ Current insurance declaration page  
□ Vehicle VINs or registration  
□ Driving record (if you have violations to disclose)  

### ✅ Your Strengths to Emphasize
- Continuous coverage (if applicable)
- Clean driving record (if applicable)  
- Multiple policies to bundle
- Stable residence/employment
- Safety features in vehicles
- Good credit (if applicable)

### 🚩 Red Flags to Avoid
- Pressure to buy immediately
- Unclear coverage explanations
- No local presence/support
- Poor financial ratings (check AM Best)
- Hidden fees not in initial quote
- Extremely low quotes (coverage gaps?)

### 📝 Carrier Comparison Tracker
Use this to track quotes:

| Carrier | Monthly Premium | Deductible | Coverage Limits | Discounts Applied | Notes |
|---------|----------------|------------|-----------------|-------------------|-------|
| Carrier 1 | $ | $ | | | |
| Carrier 2 | $ | $ | | | |
| Carrier 3 | $ | $ | | | |

### 🎬 Your Action Plan
1. ✅ Gathered all my information
2. ⬜ Call/online quote from Carrier 1
3. ⬜ Call/online quote from Carrier 2  
4. ⬜ Call/online quote from Carrier 3
5. ⬜ Compare all options side-by-side
6. ⬜ Negotiate with top choice
7. ⬜ Secure best rate and coverage

**Pro Tip:** The best time to call is Tuesday-Thursday, late morning or mid-afternoon. Avoid Mondays and Fridays when agents are busiest.

💬 **Ready to succeed!** You're now equipped with everything needed for productive carrier conversations. Remember: You're the customer with options - use that power to get the best deal!`
}

function generateAutoNeedsAnalysisResponse(lastMessage: string, location: string, age: string, messageCount: number): string {
  const userInput = lastMessage.toLowerCase()
  
  // Parse user responses for vehicle and driver counts
  const vehicleMatch = userInput.match(/(\d+)\s*(?:car|vehicle|auto)/i)
  const driverMatch = userInput.match(/(\d+)\s*(?:driver|person|people)/i)
  
  if (messageCount === 2 && (vehicleMatch || driverMatch)) {
    const vehicles = vehicleMatch ? vehicleMatch[1] : "your"
    const drivers = driverMatch ? driverMatch[1] : "the"
    
    return `## Great! Let's Build Your Auto Insurance Profile

Perfect! ${vehicles} vehicle(s) and ${drivers} driver(s) - that's a great start.

Now let's get some details that will help me provide accurate quote estimates:

### Vehicle Information
For each of your vehicles, I'll need:
- **Year, Make, and Model** (e.g., "2015 Honda Civic")
- **Annual mileage** (average miles driven per year)
- **Primary use** (commuting to work, personal use, or business)

### Driver Details
For each driver:
- **Age and years of driving experience**
- **Any accidents or violations** in the past 5 years?

### Quick Example Response:
*"I have a 2020 Toyota Camry, drive about 12,000 miles/year for commuting. My spouse and I are both 35, licensed for 15+ years, with clean driving records."*

**Why this matters:** Vehicle value affects comprehensive/collision rates, while mileage and use impact your risk profile. Driver history is the biggest factor in pricing - clean records can save 20-40%!

Go ahead and share your vehicle and driver details, and I'll start calculating your options.`
  }
  
  // Handle vehicle details
  if (userInput.includes("toyota") || userInput.includes("honda") || userInput.includes("ford") || 
      userInput.includes("chevy") || userInput.includes("tesla") || userInput.match(/20\d{2}/)) {
    
    return `## Excellent Vehicle Information!

I've noted your vehicle details. This helps tremendously with accurate pricing.

### Now Let's Talk Coverage - The Most Important Part

**California Minimum Requirements:**
- Bodily Injury: $15,000 per person / $30,000 per accident
- Property Damage: $5,000
- Uninsured Motorist: $15,000 / $30,000 (optional but recommended)

**My Professional Recommendation for ${location}:**
Given your age (${age}) and vehicle, I typically recommend:
- **100/300/100 coverage** ($100k per person, $300k per accident, $100k property)
- **Comprehensive & Collision** with $500-1000 deductible
- **Uninsured Motorist** matching your liability limits

### Key Questions for Your Quote:
1. **Current insurance status?** (carrier and premium if you have one)
2. **Preferred deductible?** ($250, $500, $1000 - higher saves money)
3. **Need extras?** (rental car coverage, roadside assistance)

**Money-Saving Tip:** If you currently have insurance with no gaps, you'll qualify for "continuous coverage" discounts with most carriers - typically 5-15% off!

What's your current insurance situation, and what deductible would you be comfortable with?`
  }
  
  // Default progressive information gathering
  return `## Let's Get Your Personalized Quote Started

Thanks for that information! To provide accurate quote estimates, I need a few key details:

### Essential Information Needed:
1. **Vehicles**: Year, make, model for each vehicle
2. **Drivers**: Age and driving experience for each person
3. **Location**: ZIP code where vehicles are garaged (you mentioned ${location})
4. **History**: Current insurance status and claims history

### Why Each Factor Matters:
- **Vehicle details** determine replacement cost and theft risk (can affect rates by 20-50%)
- **Driver profiles** are the biggest factor - age and experience can double or halve your rate
- **ZIP code** affects rates by 10-40% based on local claims frequency
- **Insurance history** unlocks loyalty and continuous coverage discounts

Share any of these details you're comfortable with, and I'll start building your personalized quote comparison. What would you like to tell me first?`
}

function generateQuoteReadyResponse(location: string, age: string, carriers: InsuranceCarrier[]): string {
  return `## Excellent! I Have What I Need for Initial Quotes

Based on the information you've provided, I can now give you personalized guidance and quote estimates.

### 🎯 Your Quick Summary
- **Location:** ${location}
- **Age:** ${age}
- **Profile:** Based on what you've shared

### 📊 Estimated Premium Ranges
Based on similar profiles in your area:
- **State Minimum:** $80-120/month
- **Standard Coverage:** $150-250/month
- **Full Coverage:** $200-350/month

*Note: Actual rates depend on specific details like driving record, credit score, and exact vehicle models.*

### 🏆 Top Carriers for Your Profile

${carriers.slice(0, 3).map((carrier, i) => 
  `**${i + 1}. ${carrier.name}**
  - Strength: ${carrier.strengths[0]}
  - Best for: ${carrier.types.slice(0, 2).join(", ")}
  - Contact: ${carrier.contact.phone}`
).join("\n\n")}

### 💡 Your Next Steps

**Option 1: Get Your Carrier Toolkit** 📋
I can generate a complete conversation toolkit with:
- Your profile summary
- Questions to ask carriers
- Negotiation strategies
- Document checklist

**Option 2: Dive Deeper** 🔍
- Explore specific carriers
- Understand coverage options
- Learn negotiation tactics

**Option 3: Start Calling** 📞
- Use what we've discussed
- Reference the carriers above
- Ask for quotes based on your needs

What would you like to do next? I'm here to help you get the best coverage at the best price!`
}