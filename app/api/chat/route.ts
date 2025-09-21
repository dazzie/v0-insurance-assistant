export async function POST(req: Request) {
  const { messages, customerProfile } = await req.json()

  console.log("[v0] API called with messages:", messages.length, "customer profile:", customerProfile)

  try {
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

import { getCarriersByState, getTopCarriers, searchCarriers, type InsuranceCarrier } from "@/lib/carrier-database"

function generateMockInsuranceResponse(customerProfile: any, messages: any[]) {
  const location = customerProfile?.location || "Not specified"
  const age = customerProfile?.age || "Not specified"
  const needs = customerProfile?.needs || []

  const lastMessage = messages[messages.length - 1]?.content || ""

  const state = extractStateFromLocation(location)
  const relevantCarriers = state ? getCarriersByState(state) : getTopCarriers(6)

  // If it's a follow-up question, provide a relevant response
  if (messages.length > 1) {
    if (
      lastMessage.toLowerCase().includes("carrier") ||
      lastMessage.toLowerCase().includes("company") ||
      lastMessage.toLowerCase().includes("insurer")
    ) {
      const searchResults = searchCarriers(lastMessage)
      const carriersToShow = searchResults.length > 0 ? searchResults.slice(0, 3) : relevantCarriers.slice(0, 3)

      return generateCarrierResponse(carriersToShow, location, needs)
    }

    return `Based on your question about "${lastMessage}", here are some key insights:\n\nFor someone in ${location} at age ${age}, the current market offers several competitive options. Recent regulatory changes have improved consumer protections, and carriers are offering more flexible terms.\n\n**Key recommendations:**\n- Compare quotes from at least 3-4 major carriers\n- Consider bundling policies for potential discounts\n- Review coverage annually to ensure it meets your evolving needs\n- Take advantage of any available tax benefits\n\nWould you like me to research specific carriers or dive deeper into any particular aspect of your insurance needs?`
  }

  return generateInitialResearchResponse(location, age, needs, relevantCarriers)
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

function generateCarrierResponse(carriers: InsuranceCarrier[], location: string, needs: string[]): string {
  let response = `## Top Insurance Carriers for ${location}\n\nBased on your location and insurance needs, here are the recommended carriers:\n\n`

  carriers.forEach((carrier, index) => {
    response += `### ${index + 1}. ${carrier.name}\n`
    response += `- **Rating**: ${carrier.rating.amBest} (A.M. Best)\n`
    response += `- **Market Share**: ${carrier.marketShare}%\n`
    response += `- **Founded**: ${carrier.founded}\n`
    response += `- **Strengths**: ${carrier.strengths.join(", ")}\n`

    // Show relevant products based on customer needs
    const relevantProducts = needs.filter((need) =>
      carrier.types.includes(need.toLowerCase().replace(" insurance", "")),
    )

    if (relevantProducts.length > 0) {
      response += `- **Relevant Products**: ${relevantProducts.join(", ")}\n`
    }

    response += `- **Contact**: ${carrier.contact.phone} | ${carrier.contact.website}\n`
    response += `- **Local Agents**: ${carrier.contact.hasLocalAgents ? "Yes" : "No"}\n\n`
  })

  response += `## Next Steps\n`
  response += `1. **Get quotes** from at least 3 of these carriers\n`
  response += `2. **Compare coverage options** and deductibles\n`
  response += `3. **Ask about discounts** for bundling multiple policies\n`
  response += `4. **Check customer reviews** and claims satisfaction ratings\n\n`
  response += `Would you like detailed information about any specific carrier or insurance type?`

  return response
}

function generateInitialResearchResponse(
  location: string,
  age: string,
  needs: string[],
  carriers: InsuranceCarrier[],
): string {
  const topCarriers = carriers.slice(0, 4)

  return `## Customer Profile
- **Location**: ${location}
- **Age**: ${age}
- **Insurance Needs**: ${needs.join(", ") || "Not specified"}

## Relevant Products
Based on your profile, here are the top insurance products to consider:

1. **Life Insurance**: Term life policies offer affordable coverage, while whole life provides investment benefits
2. **Health Insurance**: Essential for medical coverage, with options for HSA-compatible high-deductible plans
3. **Auto Insurance**: Required in most states, with liability, collision, and comprehensive coverage options
4. **Disability Insurance**: Protects your income if you're unable to work due to illness or injury
5. **Homeowners/Renters Insurance**: Protects your property and personal belongings

## Regulations & Local Considerations
For ${location}:
- State insurance department oversees carrier licensing and consumer protections
- Minimum coverage requirements vary by insurance type
- Tax advantages available for certain insurance products
- Recent regulatory updates have strengthened consumer rights

## Top Carriers in Your Area

${topCarriers
  .map(
    (carrier, index) => `### ${index + 1}. ${carrier.name}
- **Rating**: ${carrier.rating.amBest} (A.M. Best) | **Market Share**: ${carrier.marketShare}%
- **Strengths**: ${carrier.strengths.slice(0, 2).join(", ")}
- **Products**: ${carrier.types.join(", ")}
- **Contact**: ${carrier.contact.phone} | ${carrier.contact.website}
- **Local Agents**: ${carrier.contact.hasLocalAgents ? "Available" : "Online/Phone only"}`,
  )
  .join("\n\n")}

## Recommendations
Based on your profile, I recommend:

1. **Start with the essentials**: Ensure you have adequate health and auto coverage first
2. **Consider term life insurance**: At age ${age}, term life offers excellent value for income protection
3. **Bundle policies**: Many carriers offer 10-25% discounts for multiple policies
4. **Get multiple quotes**: Compare rates from at least 3-4 carriers above
5. **Review annually**: Insurance needs change with life events and market conditions

**Next Steps**: Would you like detailed information about any specific carrier, or shall I help you compare coverage options for a particular type of insurance?`
}
