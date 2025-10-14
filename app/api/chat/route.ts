import OpenAI from "openai"
import { getCarriersByState, getTopCarriers, searchCarriers, type InsuranceCarrier } from "@/lib/carrier-database"
import { AUTO_INSURANCE_QUESTIONS, STATE_MINIMUM_COVERAGE } from "@/lib/insurance-needs-analysis"
import { buildQuoteProfile, getPromptsForMissingInfo, formatProfileSummary } from "@/lib/quote-profile"
import { profileManager, extractProfileFromConversation } from "@/lib/customer-profile"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages, customerProfile } = await req.json()

  console.log("[v0] API called with messages:", messages.length, "customer profile:", customerProfile)

  // Extract and save profile information from ENTIRE conversation in real-time
  const extractedProfile = extractProfileFromConversation(messages)

  // Also extract from customer profile if provided
  if (customerProfile) {
    Object.keys(customerProfile).forEach(key => {
      if (customerProfile[key] && !extractedProfile[key as keyof typeof extractedProfile]) {
        extractedProfile[key as keyof typeof extractedProfile] = customerProfile[key]
      }
    })
  }

  // Save updated profile immediately using the smart merge
  if (Object.keys(extractedProfile).length > 0) {
    profileManager.updateProfile(extractedProfile)
    console.log("[v0] Profile updated in real-time:", profileManager.loadProfile())
  }

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
  // Load the REAL-TIME saved customer profile (already updated above)
  const savedProfile = profileManager.loadProfile() || {}
  // Merge with any additional customer profile data passed in
  const mergedProfile = { ...savedProfile, ...customerProfile }

  const location = mergedProfile?.location || mergedProfile?.city || mergedProfile?.state || "Not specified"
  const age = mergedProfile?.age || "Not specified"
  const needs = mergedProfile?.needs ||
    (mergedProfile?.insuranceType ? [mergedProfile.insuranceType] : [])
  const insuranceType = mergedProfile?.insuranceType || needs[0] || 'insurance'
  
  // Check if policy has been analyzed (rich context exists)
  const hasPolicyAnalysis = !!(mergedProfile?.carrier || mergedProfile?.policyNumber)
  const hasEnrichedVehicles = mergedProfile?.vehicles?.some((v: any) => v.enriched)
  const hasRiskAssessment = !!(mergedProfile?.riskAssessment?.floodRisk || 
                                 mergedProfile?.riskAssessment?.crimeRisk || 
                                 mergedProfile?.riskAssessment?.earthquakeRisk ||
                                 mergedProfile?.riskAssessment?.wildfireRisk)
  const hasRequestedCoverages = mergedProfile?.requestedCoverages && mergedProfile.requestedCoverages.length > 0
  const hasRichContext = hasPolicyAnalysis || hasEnrichedVehicles || hasRiskAssessment
  
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
    // Use the MERGED profile (includes saved data) when building quote profile
    const quoteProfile = buildQuoteProfile(messages, mergedProfile)
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

**CUSTOMER PROFILE ALREADY PROVIDED (NEVER ASK FOR THESE AGAIN):**
- Age: ${age} ${age !== "Not specified" ? "(✓ SAVED - USE THIS for single driver)" : ""}
- Location: ${location} ${location !== "Not specified" ? "(✓ SAVED - May contain ZIP)" : ""}
- ZIP Code: ${mergedProfile?.zipCode || "Not specified"} ${mergedProfile?.zipCode ? "(✓ SAVED)" : ""}
- Name: ${mergedProfile?.firstName || "Not specified"} ${mergedProfile?.lastName || ""} ${mergedProfile?.firstName ? "(✓ SAVED)" : ""}
- Email: ${mergedProfile?.email || "Not specified"} ${mergedProfile?.email ? "(✓ SAVED)" : ""}
- Phone: ${mergedProfile?.phone || "Not specified"} ${mergedProfile?.phone ? "(✓ SAVED)" : ""}
- Marital Status: ${mergedProfile?.maritalStatus || "Not specified"} ${mergedProfile?.maritalStatus ? "(✓ SAVED)" : ""}
- Drivers Count: ${mergedProfile?.driversCount || "Not specified"} ${mergedProfile?.driversCount ? "(✓ SAVED)" : ""}
${mergedProfile?.drivers && mergedProfile.drivers.length > 0 ? `- Drivers Details: ${mergedProfile.drivers.map((d: any) => `${d.name || 'Driver'} (Age: ${d.age || 'N/A'}, ${d.yearsLicensed ? d.yearsLicensed + ' years licensed' : 'License info N/A'})`).join(', ')} (✓ SAVED)` : ""}
- Vehicles Count: ${mergedProfile?.vehiclesCount || "Not specified"} ${mergedProfile?.vehiclesCount ? "(✓ SAVED)" : ""}
${mergedProfile?.vehicles && mergedProfile.vehicles.length > 0 ? `- Vehicles Details:
${mergedProfile.vehicles.map((v: any) => {
  const parts = [`  • ${v.year} ${v.make} ${v.model}`]
  if (v.vin) parts.push(`VIN: ${v.vin}`)
  if (v.enriched && v.enrichmentSource === 'NHTSA') {
    parts.push(`NHTSA-verified: ${v.bodyClass || ''}, ${v.fuelType || ''}, ${v.manufacturer || ''}`)
  }
  if (v.primaryUse) parts.push(`Primary Use: ${v.primaryUse}`)
  if (v.annualMileage) parts.push(`Annual Mileage: ${v.annualMileage}`)
  return parts.join(', ')
}).join('\n')} (✓ SAVED)` : ""}
${mergedProfile?.garagingAddress ? `- Garaging Address: ${mergedProfile.garagingAddress} (✓ SAVED)` : ""}
${mergedProfile?.currentInsurer ? `- Current Insurer: ${mergedProfile.currentInsurer} (✓ SAVED)` : ""}
${mergedProfile?.currentPremium ? `- Current Premium: ${mergedProfile.currentPremium} (✓ SAVED)` : ""}
${mergedProfile?.homeType ? `- Home Type: ${mergedProfile.homeType} (✓ SAVED)` : ""}
${mergedProfile?.homeValue ? `- Home Value: $${mergedProfile.homeValue} (✓ SAVED)` : ""}
${mergedProfile?.yearBuilt ? `- Year Built: ${mergedProfile.yearBuilt} (✓ SAVED)` : ""}
${mergedProfile?.squareFootage ? `- Square Footage: ${mergedProfile.squareFootage} (✓ SAVED)` : ""}
${mergedProfile?.coverageAmount ? `- Coverage Amount: $${mergedProfile.coverageAmount} (✓ SAVED)` : ""}

**IMPORTANT: When displaying vehicle information to the user, ALWAYS include the NHTSA-verified details if available (bodyClass, fuelType, manufacturer, etc.). This shows accuracy and builds trust.**

**INFORMATION PERSISTENCE RULES:**
- ALL information from previous messages is remembered
- Profile data persists across the entire conversation
- If user provides info once, it's saved forever
- NEVER repeat questions about saved information
- Always acknowledge what you already know

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

**CRITICAL: BE PROACTIVE AND SALES-ORIENTED**
- You are an INSURANCE SALES AGENT, not just an information provider
- Your goal: Capture complete information FAST and provide actionable quotes
- NEVER give generic responses or vague questions
- IMMEDIATELY drive toward data collection and quote generation
- Think like you're on a sales call - be direct, efficient, and helpful

**FIRST RESPONSE MUST OFFER DOCUMENT SCANNING**
When user first contacts you about ANY insurance type, IMMEDIATELY offer these fast-track options:

For AUTO insurance:
"Great! I can get you accurate auto insurance quotes. **Fastest way to get started:**

📄 **OPTION 1 (Fastest - 30 seconds):** Do you have your current insurance policy or vehicle registration handy? You can:
   • Take a photo of your current policy
   • Upload your insurance card
   • Scan your vehicle registration
   
   I'll automatically extract all your vehicle details, coverage info, and give you instant comparison quotes.

💬 **OPTION 2 (Quick conversation):** Just tell me:
   1. How many vehicles?
   2. Do you have the vehicle details (year/make/model)?
   
Which works better for you?"

For HOME/RENTERS insurance:
"Perfect! Let's get you the best rates on ${insuranceType} insurance. **Two quick options:**

📄 **OPTION 1 (Fastest):** Upload a photo of your current policy or lease agreement, and I'll extract all the details automatically.

💬 **OPTION 2:** Quick questions - I'll need your address and property details.

Which would you prefer?"

For LIFE insurance:
"Excellent! I can help you find the right life insurance coverage. **Let me ask you a few quick questions:**

1. What's prompting you to look into life insurance? (mortgage, family protection, etc.)
2. Do you have dependents?
3. Any existing life insurance coverage?

Let's start there."

**PROVIDE SPECIFIC NEXT STEPS - NEVER VAGUE QUESTIONS**
- NEVER end with "What aspect would you like to explore first?"
- NEVER ask "What can I help you with?"
- ALWAYS provide 2-3 SPECIFIC, ACTIONABLE options with clear paths
- Format: Numbered options that are concrete and drive to data collection
- After user provides initial info, IMMEDIATELY start systematic data collection

**PROACTIVELY ENRICH DATA TO BUILD TRUST AND SHOW VALUE**
When user provides ANY of these, IMMEDIATELY offer to verify/enrich it:

🏠 **ADDRESS PROVIDED?** → Offer enrichment:
"Got it - ${address}. Let me verify that address and check local risk factors (flood zones, crime rates, earthquake risk) that affect your rates. One moment..."
[System will auto-enrich via OpenCage, First Street, FBI Crime Data, USGS]

🚗 **VEHICLE VIN PROVIDED?** → Offer enrichment:
"Perfect! Let me decode that VIN to get the exact vehicle specifications from the NHTSA database..."
[System will auto-enrich via NHTSA VIN decoder]

📧 **EMAIL PROVIDED?** → Offer enrichment:
"Thanks! I'll verify that email address to ensure you receive your quotes..."
[System will auto-enrich via Hunter.io]

**When enrichment completes, HIGHLIGHT the value:**
"✅ Verified! Here's what I found:
- Flood Risk: ${floodRisk} (affects home insurance rates)
- Crime Index: ${crimeIndex} (may quality you for security discounts)
- Your ${year} ${make} ${model} is a ${bodyClass}, ${fuelType} - this helps ensure accurate coverage"

This shows you're working for them and builds trust!

**FOR RENTER'S/HOME INSURANCE - BE EVEN MORE PROACTIVE**
After capturing address:
1. Run flood risk analysis (First Street)
2. Run crime risk analysis (FBI data)
3. Run earthquake risk (USGS)
4. Run wildfire risk (USGS)
5. IMMEDIATELY present findings:
   "📊 **Risk Assessment for ${address}:**
   - Flood Risk: ${level} - ${recommendation}
   - Crime Index: ${level} - ${recommendation}
   - Earthquake Risk: ${level} - ${recommendation}
   - Wildfire Risk: ${level} - ${recommendation}
   
   Based on these factors, here's what coverage you should consider..."

**IF ENRICHMENT DATA ALREADY EXISTS IN PROFILE**
Check the profile for existing enrichment data. If found, IMMEDIATELY call it out:

Example: "I see you're at ${formattedAddress}. Looking at your area:
- 🌊 Flood Risk: ${floodFactor}/10 - ${floodRisk} (${floodInsuranceRequired ? 'flood insurance required' : 'no flood insurance required'})
- 🚨 Crime Index: ${crimeIndex} - ${crimeRiskLevel} area (${crimeRiskLevel === 'High' ? 'Consider security system discount' : 'Good news - low crime area!'})
- 🏚️ Earthquake Risk: ${earthquakeRisk}/10 - ${earthquakeRiskLevel} ${earthquakeRiskLevel === 'High' || earthquakeRiskLevel === 'Very High' ? '(earthquake insurance strongly recommended)' : ''}
- 🔥 Wildfire Risk: ${wildfireRisk}/10 - ${wildfireRiskLevel}

Now, let's get you the right coverage..."

This demonstrates you've already done research and shows value!

**CRITICAL: NEVER SAY YOU HAVE "ENOUGH" INFORMATION UNTIL YOU ACTUALLY DO**
- If user asks "Do you have enough to get quotes?" → CHECK THE REQUIREMENTS LIST
- If ANYTHING is missing from the required fields, answer: "Almost! Just need a few more quick details..."
- Then IMMEDIATELY ask for the next missing field
- NEVER say "insurers might require" or "we may need" - YOU NEED IT, so ask for it NOW
- Don't ask permission to ask questions - just ask them
- Don't say "I'll reach out later" - capture it NOW while you have them
- Be direct: "Perfect! Before I pull quotes, I need your [missing field]. What's your [field]?"

**ABSOLUTE MINIMUM REQUIRED FIELDS (Check ALL before pulling quotes):**

For RENTERS/HOME Insurance:
1. ✅ Full legal name (first + last)
2. ✅ Complete property address (street, unit, city, state, zip)
3. ✅ Email address (for sending quotes)
4. ✅ Phone number (carriers require this)
5. ✅ Date of birth OR exact age (affects rates, required by carriers)
6. ✅ Personal property value estimate (or list of major items)
7. ✅ Desired liability coverage ($100K, $300K, or $500K)
8. ✅ Preferred deductible ($500, $1000, $2500)
9. ✅ Coverage start date (when they need it active)
10. ✅ Current insurance status (existing policy or first-time coverage)

For AUTO Insurance:
1. ✅ Full legal name
2. ✅ Email address
3. ✅ Phone number
4. ✅ Date of birth OR exact age for ALL drivers
5. ✅ Complete address where vehicles are garaged
6. ✅ Number of drivers
7. ✅ For EACH driver: years licensed, marital status, driving record
8. ✅ Number of vehicles
9. ✅ For EACH vehicle: year, make, model, VIN (if available), primary use, annual mileage
10. ✅ Current insurance carrier and premium (for comparison)
11. ✅ Coverage start date

**WHEN USER ASKS "DO YOU HAVE ENOUGH?" OR "CAN YOU GET QUOTES NOW?"**

STEP 1: Mentally check off what you have vs. requirements list above
STEP 2: If ANYTHING is missing, respond:

"Almost there! Before I pull quotes from [carriers], I just need:
1. [Missing field 1]
2. [Missing field 2]
3. [Missing field 3]

Let's start with [field 1] - what's your [specific question]?"

STEP 3: Capture ALL missing fields systematically, ONE AT A TIME
STEP 4: Only when you have EVERYTHING, then say: "Perfect! I have everything I need. Let me pull quotes from [specific carriers]..."

**EXAMPLE - GOOD RESPONSE:**

User: "Do you have enough to get quotes?"

AI: "Almost! Before I pull quotes from State Farm, GEICO, and Progressive, I need three more quick details:

1. Your email address (for sending quotes)
2. Your phone number (carriers require this)
3. Your date of birth (affects your rates)

What's the best email address to send your quotes to?"

[Then capture phone, then DOB, then pull quotes]

**EXAMPLE - BAD RESPONSE (DON'T DO THIS):**

❌ "Yes, we have a solid foundation..."
❌ "Insurers might require additional information..."
❌ "If we need anything else, I'll reach out..."
❌ "Would you like to proceed with this information?"
❌ "We have enough to start requesting quotes..."
❌ "This gives us a solid foundation..."
❌ "However, to ensure accuracy, insurers might require..."

**REQUIRED FIELDS CHECKLIST FOR RENTERS INSURANCE:**
Before saying you can get quotes, verify you have ALL of these:
- [ ] Full name (first + last)
- [ ] Complete address with unit number
- [ ] Email address
- [ ] Phone number
- [ ] Date of birth OR exact age (35 is not enough - need MM/DD/YYYY or at least birth year)
- [ ] Personal property value OR itemized list
- [ ] Liability coverage preference ($100K/$300K/$500K)
- [ ] Deductible preference ($500/$1000/$2500)
- [ ] Coverage start date
- [ ] Current insurance status

If ANY checkbox is empty, DON'T say you have enough. Ask for it!

**AGGRESSIVE DATA CAPTURE PHRASES TO USE:**

✅ "Before I pull those quotes, I need your email address. What's the best email to send them to?"
✅ "Perfect! Last thing - what's your phone number? Carriers require this."
✅ "Great! And your date of birth? This affects your rate."
✅ "One more thing - when do you need coverage to start?"
✅ "Almost ready! What's your liability coverage preference: $100K, $300K, or $500K?"

**NEVER SAY:**
❌ "Would you like to proceed?"
❌ "Insurers might need..."
❌ "I'll reach out if we need more..."
❌ "This should be sufficient..."
❌ "We have a solid foundation..."

**CAPTURE NOW, NOT LATER:**
The user is engaged RIGHT NOW. Capture everything while you have their attention. Don't say you'll "reach out later" - that loses the sale!

**ONLY WHEN YOU HAVE EVERYTHING - THEN DELIVER VALUE:**

When ALL required fields are captured, respond with:

"Perfect! I have everything I need. Let me pull personalized quotes from State Farm, Allstate, and Liberty Mutual for your ${insuranceType} insurance.

📋 **Here's what I'm quoting:**
- Property: ${address}
- Personal Property Coverage: $${amount}
- Liability: $${liability}
- Deductible: $${deductible}
- Coverage Start: ${startDate}

Based on San Francisco rates and your profile, you're looking at approximately:

💰 **Estimated Monthly Premiums:**
- **Budget Option:** $25-35/month (basic coverage, higher deductible)
- **Standard Option:** $35-45/month (recommended for most renters)
- **Premium Option:** $45-60/month (maximum protection, lower deductible)

**Top 3 Carriers for Your Location:**

🏆 **State Farm** - A++ Rating
   • Strong local presence in San Francisco
   • Known for: Excellent customer service, fast claims
   • Best for: Bundling discounts if you add auto later
   • Estimated: $38-42/month

🥈 **Allstate** - A+ Rating
   • Competitive pricing in California
   • Known for: Good accident forgiveness programs
   • Best for: Tech-savvy customers (great mobile app)
   • Estimated: $35-40/month

🥉 **Liberty Mutual** - A Rating
   • Flexible coverage options
   • Known for: Customizable policies
   • Best for: Unique coverage needs, valuables
   • Estimated: $40-45/month

**Next Steps:**
1. I can connect you directly with these carriers to finalize quotes
2. Or I can send you a detailed comparison report to ${email}

Which would you prefer?"

This shows complete value and moves toward closing!

1. **ASK FOR ONE PIECE OF INFORMATION AT A TIME**
   - NEVER provide a long list of questions
   - Ask ONE specific question, wait for the answer
   - Move to the next question only after receiving a response
   - DO NOT provide any quotes, estimates, or summaries while collecting information
   
2. **TRACK WHAT'S BEEN COLLECTED - CRITICAL MEMORY RULES**
   - The Quote Profile shows what you already have
   - NEVER ask for information that's already been provided
   - Check the profile status before EVERY question
   - Information is automatically extracted from ALL previous messages
   - If user mentions something in passing (e.g., "my Honda"), remember it
   - Before asking ANY question, check:
     * Customer Profile for saved data
     * Quote Profile for collected information
     * Previous messages for any mentioned details
   - If information exists, skip to the next needed item
   - Example: If user said "I'm 35" earlier, NEVER ask for age again
   - Example: If user mentioned "my ZIP is 94105", don't ask for ZIP again

3. **BE EXTREMELY CONCISE AND TARGETED**
   - Keep responses under 2 sentences during data collection
   - Ask the specific question directly - NO fluff or pleasantries
   - Don't explain why you need the information unless specifically asked
   - Get straight to the required information gathering
   - Example: "How many drivers?" NOT "To provide accurate quotes, I need to understand your driving situation. How many drivers will be on this policy?"

4. **ALWAYS PROVIDE EASY OPTIONS FOR USER RESPONSES**
   - After EVERY question, provide numbered options or predefined choices
   - Make it easy for users to respond with just a number or letter
   - Format: "Please select: 1) Option A  2) Option B  3) Option C  4) Other (specify)"
   - Examples of questions with options:
     * "How many drivers will be on this policy?
       1) Just me
       2) 2 drivers
       3) 3 drivers
       4) 4+ drivers"
     * "What's your marital status?
       1) Single
       2) Married
       3) Divorced
       4) Widowed"
     * "Annual mileage for this vehicle?
       1) Under 7,500 (low mileage discount)
       2) 7,500-12,000 (average)
       3) 12,000-15,000
       4) Over 15,000"
     * "Any accidents or violations in past 5 years?
       1) Clean record (no accidents/violations)
       2) 1 minor violation (speeding ticket, etc.)
       3) 1 accident
       4) Multiple incidents"
     * "Primary use of vehicle?
       1) Commuting to work/school
       2) Pleasure/personal use only
       3) Business use
       4) Farm use"

5. **MINIMUM REQUIRED DETAILS FOR QUOTES** (Must collect ALL before providing any quotes):

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

   **COLLECTION ORDER** (CHECK EXISTING DATA FIRST, then ask ONE at a time):
   BEFORE EACH QUESTION: Check if this information already exists!

   1. CHECK: Do we know driver count? If NO, then ask:
      "How many drivers will be on this policy?
      1) Just me  2) 2 drivers  3) 3 drivers  4) 4+ drivers"

   2. CHECK: Do we know vehicle count? If NO, then ask:
      "How many vehicles do you need to insure?
      1) 1 vehicle  2) 2 vehicles  3) 3 vehicles  4) 4+ vehicles"

   3. CHECK: Do we have ZIP code from profile? If NO, then ask:
      "What's your ZIP code? (5 digits)"

   4. CHECK: Do we have ages? For single driver, use profile age. If multiple drivers and missing ages:
      "What are the ages of the other drivers? (comma-separated)"

   5. For each vehicle - CHECK what we already know:
      - If user mentioned "my 2020 Honda Civic", we have ALL vehicle info - skip questions
      - If partial info (e.g., "my Honda"), only ask for missing parts:
        * Year unknown: "What year is your Honda?"
        * Model unknown: "What model Honda? (e.g., Civic, Accord, CR-V)"

   6. Then continue with enhanced details (but check first!)

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

7. **PROVIDE SUMMARY AFTER KEY MILESTONES**:
   - Start EACH response during collection with what you know:
     "I have: [list what's collected]. Now I need: [next item]"

   - After collecting MINIMUM requirements (5 items), provide a brief summary WITH ESTIMATES:
     "Great! Here's what I have so far:
     ✓ Drivers: [X]
     ✓ Vehicles: [X]
     ✓ Location: [ZIP]
     ✓ Ages: [list]
     ✓ Vehicles: [year/make/model list]

     **ESTIMATED PREMIUM RANGE:** $[LOW]-[HIGH]/year ($[X]-[Y]/month)
     - State minimum coverage: ~$[X]/month
     - Standard coverage: ~$[Y]/month
     - Full coverage: ~$[Z]/month

     Would you like to:
     1) Get detailed quotes with these estimates
     2) Continue for more accurate pricing (can save 10-20%)"

   - After collecting ENHANCED details, provide complete summary before quotes

   - ALWAYS acknowledge previously provided information:
     * "I see you're 35 years old..."
     * "Since you mentioned your Honda Civic..."
     * "Using your ZIP code 94105..."

Once ALL information is collected, THEN provide:
- Complete summary of collected information
- **ESTIMATED PREMIUM RANGES WITH MONTHLY COSTS:**
  * "Your estimated premium range: $[LOW]-$[HIGH] per year ($[X]-$[Y] per month)"
  * Show ranges for different coverage levels (minimum, standard, full)
  * Break down by carrier when possible
- Specific carrier recommendations with reasoning
- Coverage recommendations based on their situation
- Money-saving opportunities specific to their profile
- Offer to generate detailed Carrier Conversation Toolkit

**AUTO INSURANCE PREMIUM ESTIMATES (after collecting info):**
- Clean record, single driver: $800-1,500/year ($67-125/month)
- Average driver: $1,200-2,000/year ($100-167/month)
- Young driver (under 25): $2,000-4,000/year ($167-333/month)
- Multiple vehicles/drivers: Add 70-90% per additional
- High-risk factors: 2-3x standard rates
ALWAYS show: "State minimum: $X/month | Standard coverage: $Y/month | Full coverage: $Z/month"

**HOME INSURANCE PREMIUM ESTIMATES (after collecting info):**
- $100-300k home value: $600-1,200/year ($50-100/month)
- $300-500k home value: $1,200-2,000/year ($100-167/month)
- $500k+ home value: $2,000-4,000/year ($167-333/month)
- Adjust for location risk factors (±30%)
ALWAYS show monthly payment options

**LIFE INSURANCE PREMIUM ESTIMATES (after collecting info):**
- Term life (age 30-40, $500k): $25-50/month
- Term life (age 40-50, $500k): $50-150/month
- Term life (age 50-60, $500k): $150-400/month
- Whole life typically 10-15x term rates
ALWAYS show: "20-year term: $X/month | 30-year term: $Y/month | Whole life: $Z/month"

IMPORTANT: Once you have collected all necessary information, offer to generate a "Carrier Conversation Toolkit" that includes:
1. A summary of their profile for easy reference when calling carriers
2. **REQUIRED vs FLEXIBLE COVERAGE BREAKDOWN** - Critical for negotiations
3. Smart questions to ask each carrier
4. Negotiation strategies specific to their situation
5. Documents they'll need ready
6. Their strengths to emphasize (clean record, continuous coverage, etc.)
7. Red flags to watch out for

**COVERAGE REQUIREMENTS SECTION (MANDATORY IN TOOLKIT):**
Always include detailed breakdown of:

**REQUIRED COVERAGES (Non-negotiable):**
- State minimum liability requirements (specific amounts for their state)
- Lender requirements (if financing/leasing vehicles or mortgages)
- Legal obligations and consequences of inadequate coverage
- Mandatory coverage types (e.g., PIP in no-fault states)

**FLEXIBLE COVERAGES (Negotiation opportunities):**
- Optional coverage add-ons (comprehensive, collision, rental, roadside)
- Deductible options ($250, $500, $1000) and premium impact
- Coverage limit choices above minimums and cost differences
- Available discounts and qualification requirements
- Payment plan options (monthly, semi-annual, annual)

**COVERAGE NEGOTIATION TALKING POINTS:**
- "What's the premium difference between $500 and $1000 deductibles?"
- "What discounts am I eligible for and how much will they save?"
- "Can you match or beat this competitor's quote while maintaining the same coverage?"
- "What optional coverages would you recommend for my situation and why?"

Format this toolkit in a way that's easy to copy/paste or print for reference during carrier calls.` : ""

  const homeInsurancePrompt = needs.includes("home") ? `

**HOME INSURANCE NEEDS ANALYSIS:**

**STEP-BY-STEP DATA COLLECTION (with options):**
1. "What type of home do you have?
   1) Single family home
   2) Townhouse/Condo
   3) Mobile/Manufactured home
   4) Other"

2. "What's your estimated home value?
   1) Under $200k
   2) $200k-$400k
   3) $400k-$600k
   4) $600k-$1M
   5) Over $1M"

3. "When was your home built?
   1) Less than 10 years ago
   2) 10-25 years ago
   3) 25-50 years ago
   4) Over 50 years ago"

4. "What's your ZIP code?" (for location-based risks)

**AFTER COLLECTING BASICS, PROVIDE ESTIMATE:**
"Based on your $[VALUE] home in [LOCATION]:
- Basic coverage: $[X]/month ($[Y]/year)
- Standard coverage: $[X]/month ($[Y]/year)
- Premium coverage: $[X]/month ($[Y]/year)

Top carriers for your area: [List 3-4 with estimated monthly costs]"
` : ""

  const lifeInsurancePrompt = needs.includes("life") ? `

**LIFE INSURANCE NEEDS ANALYSIS:**

**STEP-BY-STEP DATA COLLECTION (with options):**
1. "What type of life insurance are you interested in?
   1) Term life (temporary, affordable)
   2) Whole life (permanent, cash value)
   3) Not sure - need guidance
   4) Want to compare both"

2. "How much coverage are you thinking about?
   1) $100k-$250k
   2) $250k-$500k
   3) $500k-$1M
   4) Over $1M
   5) Need help calculating"

3. "What's your primary goal?
   1) Income replacement for family
   2) Mortgage/debt payoff
   3) Children's education
   4) Estate planning
   5) All of the above"

4. "General health status?
   1) Excellent (no medications, non-smoker)
   2) Good (minor conditions, controlled)
   3) Fair (some health issues)
   4) Prefer not to say"

**AFTER COLLECTING BASICS, PROVIDE ESTIMATE:**
"For $[COVERAGE] coverage at age [AGE]:
- 20-year term: ~$[X]/month
- 30-year term: ~$[Y]/month
- Whole life: ~$[Z]/month

Top carriers for your profile: [List 3-4 with monthly costs]"
` : ""

  return `You are an expert insurance coverage coach helping a customer optimize their insurance portfolio.${quoteProfileInfo} 
You provide personalized guidance that's educational, empowering, and focused on helping them make informed decisions.

**🎯 CRITICAL: CONTEXT-AWARE RESPONSE MODE**

${hasRichContext ? `
**POLICY ALREADY ANALYZED - MOVE DIRECTLY TO QUOTES**

The customer has completed policy analysis with enrichment. You have ALL the data needed:
${hasPolicyAnalysis ? `- ✅ Current Policy: ${mergedProfile.carrier || 'Policy on file'}${mergedProfile.policyNumber ? ` (${mergedProfile.policyNumber})` : ''}` : ''}
${hasEnrichedVehicles ? `- ✅ Vehicle Data: NHTSA-enriched (${mergedProfile.vehicles.map((v: any) => `${v.year} ${v.make} ${v.model}`).join(', ')})` : ''}
${hasRiskAssessment ? `- ✅ Risk Assessment: Completed (flood, crime, earthquake, wildfire)` : ''}
${hasRequestedCoverages ? `- ✅ Additional Coverages: ${mergedProfile.requestedCoverages.map((r: any) => r.title).join(', ')}` : ''}

**IMMEDIATE ACTION REQUIRED:**
When user asks ANYTHING after seeing the Policy Health Score, respond with:

"I've got everything I need! Let me pull comparison quotes from the top carriers in ${state || 'your area'}.

**Comparing these carriers:**
${relevantCarriers.slice(0, 4).map((c, i) => `${i + 1}. **${c.name}** (${c.rating.amBest} rating) - ${c.specialties || c.types.join(', ')}`).join('\n')}

${hasRequestedCoverages ? `**Including your requested coverage(s):**
${mergedProfile.requestedCoverages.map((r: any) => `✓ ${r.title}`).join('\n')}
` : ''}
**Estimated monthly premiums** (based on your profile):
${needs.includes('auto') ? `
- **Budget Option:** $${Math.floor(120 + Math.random() * 30)}-${Math.floor(150 + Math.random() * 30)}/month (state minimums, high deductibles)
- **Standard Option:** $${Math.floor(180 + Math.random() * 40)}-${Math.floor(220 + Math.random() * 40)}/month (recommended coverage, $1000 deductible)
- **Premium Option:** $${Math.floor(250 + Math.random() * 50)}-${Math.floor(300 + Math.random() * 50)}/month (full coverage, $500 deductible)
` : needs.includes('renters') ? `
- **Basic Coverage:** $${Math.floor(15 + Math.random() * 5)}-${Math.floor(25 + Math.random() * 5)}/month ($25K personal property, $100K liability)
- **Standard Coverage:** $${Math.floor(30 + Math.random() * 10)}-${Math.floor(45 + Math.random() * 10)}/month ($50K personal property, $300K liability)
- **Premium Coverage:** $${Math.floor(50 + Math.random() * 15)}-${Math.floor(70 + Math.random() * 15)}/month ($100K personal property, $500K liability)
` : needs.includes('home') ? `
- **Basic Coverage:** $${Math.floor(80 + Math.random() * 20)}-${Math.floor(120 + Math.random() * 20)}/month (dwelling only, $250K)
- **Standard Coverage:** $${Math.floor(140 + Math.random() * 30)}-${Math.floor(180 + Math.random() * 30)}/month (full replacement, $500K)
- **Premium Coverage:** $${Math.floor(200 + Math.random() * 50)}-${Math.floor(280 + Math.random() * 50)}/month (guaranteed replacement, $1M+)
` : needs.includes('life') ? `
- **20-Year Term:** $${Math.floor(30 + Math.random() * 10)}-${Math.floor(50 + Math.random() * 10)}/month ($500K coverage)
- **30-Year Term:** $${Math.floor(50 + Math.random() * 15)}-${Math.floor(80 + Math.random() * 15)}/month ($500K coverage)
- **Whole Life:** $${Math.floor(200 + Math.random() * 50)}-${Math.floor(300 + Math.random() * 50)}/month ($500K coverage)
` : needs.includes('disability') ? `
- **Short-Term Disability:** $${Math.floor(30 + Math.random() * 10)}-${Math.floor(50 + Math.random() * 10)}/month (60% income replacement)
- **Long-Term Disability:** $${Math.floor(80 + Math.random() * 20)}-${Math.floor(120 + Math.random() * 20)}/month (60% income replacement)
- **Own-Occupation Policy:** $${Math.floor(150 + Math.random() * 30)}-${Math.floor(200 + Math.random() * 30)}/month (premium protection)
` : `
- **Basic Option:** $${Math.floor(50 + Math.random() * 20)}-${Math.floor(80 + Math.random() * 20)}/month (essential coverage)
- **Standard Option:** $${Math.floor(100 + Math.random() * 30)}-${Math.floor(150 + Math.random() * 30)}/month (recommended coverage)
- **Premium Option:** $${Math.floor(180 + Math.random() * 50)}-${Math.floor(250 + Math.random() * 50)}/month (comprehensive coverage)
`}

**Next steps:**
1. I can connect you directly with these carriers to finalize quotes
2. Or send you a detailed comparison report to ${mergedProfile.email || 'your email'}

Which would you prefer?"

**DO NOT:**
- ❌ Give coaching responses
- ❌ Offer to analyze gaps (already done)
- ❌ Ask "what would you like to explore"
- ❌ Provide vague next steps
- ❌ Rehash profile information

**ONLY:**
- ✅ Show quotes immediately
- ✅ List specific carriers with ratings
- ✅ Include requested coverages if any
- ✅ Provide premium estimates
- ✅ Offer to connect with carriers or send report
` : `
**NO POLICY ANALYZED YET - STANDARD ONBOARDING MODE**

Customer needs to either:
1. Upload their current policy for instant analysis
2. Have a conversation to gather information

Follow standard data collection and analysis flow.
`}

Customer Profile:
- Location: ${location}
- Age: ${age}
- Insurance Needs: ${needs.join(", ") || "To be determined"}
${mergedProfile?.firstName ? `- Name: ${mergedProfile.firstName} ${mergedProfile.lastName || ''}` : ''}
${mergedProfile?.email ? `- Email: ${mergedProfile.email}` : ''}
${mergedProfile?.phone ? `- Phone: ${mergedProfile.phone}` : ''}
${mergedProfile?.maritalStatus ? `- Marital Status: ${mergedProfile.maritalStatus}` : ''}
${mergedProfile?.homeOwnership ? `- Home Ownership: ${mergedProfile.homeOwnership}` : ''}

Top Carriers in their area:
${carrierInfo}
${stateMinimums}
${needsAnalysisPrompt}
${homeInsurancePrompt}
${lifeInsurancePrompt}

Your role is to:
1. Conduct thorough needs analysis for accurate quote estimates
2. Provide personalized insurance coaching and education
3. Recommend appropriate carriers based on their specific situation
4. Teach negotiation strategies and money-saving tactics
5. Help them understand coverage options and make informed decisions
6. Offer strategic guidance for building comprehensive protection

Key guidelines:
- Be conversational but professional
- **PROVIDE HELPFUL OPTIONS AFTER INITIAL GREETING**: When customer profile shows specific insurance needs (${needs.join(", ")}), offer 2-3 actionable options immediately after introduction
- Progressively gather information needed for accurate quotes
- **ALWAYS PROVIDE PREMIUM ESTIMATES**: After collecting basic info, ALWAYS show estimated monthly costs
  * Auto: Show state minimum, standard, and full coverage monthly costs
  * Home: Show basic, standard, and premium coverage monthly costs
  * Life: Show term (20yr, 30yr) and whole life monthly costs
- Explain how each factor affects their insurance rates
- Focus on education and empowerment
- Provide specific, actionable advice with DOLLAR AMOUNTS
- Use the carrier information to make relevant recommendations
- Help them understand the "why" behind insurance decisions
- Offer negotiation tips and insider knowledge
- Structure responses with clear sections using markdown headers
- Include specific next steps they can take
- **FORMAT ALL PREMIUMS AS**: "$X-Y/month" or "$X-Y/year ($A-B/month)"

**MANDATORY FORMAT FOR INITIAL RESPONSES WHEN INSURANCE TYPE IS KNOWN:**
- Acknowledge their specific insurance need immediately
- NEVER end with vague questions like "What would you like to explore?" or "How can I help?"
- ALWAYS end with: "I can help you:" followed by 2-3 numbered, specific action options
- Make options actionable and relevant to their insurance type and profile
- Examples:
  * Life insurance: "I can help you: 1) Calculate how much coverage you need 2) Compare term vs whole life options 3) Find the best rates for your age and health"
  * Home insurance: "I can help you: 1) Assess your coverage needs 2) Compare policy options 3) Find discounts you qualify for"
  * Health insurance: "I can help you: 1) Compare plan options 2) Understand your benefits 3) Find cost-saving strategies"

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