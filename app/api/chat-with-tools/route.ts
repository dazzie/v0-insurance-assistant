import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages, tool } from 'ai';
import { z } from 'zod';
import { StateDOIMCPClient, createStateDOITools } from '@/lib/mcp-client-state-doi';
import { profileManager, extractProfileFromConversation } from '@/lib/customer-profile';
import { getOfficialRates, listAvailableStates, compareToOfficial, getAllProfiles } from '@/lib/state-doi-direct';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let mcpClient: StateDOIMCPClient | null = null;

  try {
    const { messages, customerProfile } = await req.json();

    console.log('[Chat with Tools] API called with', messages?.length || 0, 'messages');

    // Validate messages
    const validMessages = Array.isArray(messages) ? messages : [];

    // Extract and save profile information from conversation
    const extractedProfile = validMessages.length > 0 
      ? extractProfileFromConversation(validMessages)
      : {};

    if (customerProfile) {
      Object.keys(customerProfile).forEach(key => {
        if (customerProfile[key] && !extractedProfile[key as keyof typeof extractedProfile]) {
          extractedProfile[key as keyof typeof extractedProfile] = customerProfile[key];
        }
      });
    }

    // Save updated profile
    if (Object.keys(extractedProfile).length > 0) {
      profileManager.updateProfile(extractedProfile);
      console.log('[Chat with Tools] Profile updated:', profileManager.loadProfile());
    }

    let currentProfile = profileManager.loadProfile() || {};
    
    // Merge with provided customerProfile
    if (customerProfile) {
      currentProfile = { ...currentProfile, ...customerProfile };
    }

    console.log('[Chat with Tools] Using profile:', { 
      state: currentProfile.state, 
      vehicles: currentProfile.vehicles?.length || 0 
    });

    // Initialize MCP client for State DOI server
    mcpClient = new StateDOIMCPClient();

    // Create MCP tools
    const mcpTools = createStateDOITools(mcpClient);

    // Combine with any additional tools
    const allTools = {
      ...mcpTools,
      
      // Add a tool to get current customer profile
      get_customer_profile: tool({
        description: 'Get the current customer profile information including vehicles, address, and insurance needs',
        parameters: z.object({}),
        execute: async () => {
          const profile = profileManager.loadProfile();
          return JSON.stringify(profile, null, 2);
        },
      }),
    };

    // Build system prompt
    const systemPrompt = `You are an expert insurance advisor with access to official state DOI data.

AVAILABLE TOOLS:
1. get_official_insurance_rates - Get actual rates from state insurance departments (CA, NY)
2. list_available_insurance_states - Check which states have official data
3. validate_quote_accuracy - Compare our quotes to official state rates
4. get_customer_profile - View customer's current profile

WHEN TO USE TOOLS:
- Customer asks about "official", "actual", or "state" rates → use get_official_insurance_rates
- Customer asks "what states do you have?" → use list_available_insurance_states  
- Customer questions quote accuracy → use validate_quote_accuracy
- You need to check customer info → use get_customer_profile

CURRENT CUSTOMER CONTEXT:
${currentProfile ? `
- State: ${currentProfile.state || 'Not specified'}
- Vehicles: ${currentProfile.vehicles?.length || 0} vehicle(s)
${currentProfile.vehicles?.[0] ? `  - ${currentProfile.vehicles[0].year} ${currentProfile.vehicles[0].make} ${currentProfile.vehicles[0].model}` : ''}
- Address: ${currentProfile.address ? 'Provided' : 'Not provided'}
- Insurance Type: ${currentProfile.insuranceType || currentProfile.needs?.[0] || 'Not specified'}
` : 'No profile yet'}

IMPORTANT INSTRUCTIONS:
1. Always mention when you're using official state DOI data
2. Explain the source (e.g., "California Department of Insurance")
3. Compare official rates to our quotes when relevant
4. If official data is unavailable for a state, offer our rating engine quotes instead
5. Be proactive - suggest getting official rates when discussing quotes`;

    // Use OpenAI directly with manual streaming and MCP tool detection
    const userMessage = validMessages[validMessages.length - 1]?.content?.toLowerCase() || '';
    
    // Detect if user wants MCP tools
    const wantsOfficialRates = userMessage.includes('official') || userMessage.includes('state rate') || userMessage.includes('doi');
    const wantsStateList = userMessage.includes('which state') || userMessage.includes('available state');
    const wantsValidation = userMessage.includes('accurate') || userMessage.includes('compare') || userMessage.includes('valid');
    const wantsAllProfiles = userMessage.includes('all profile') || userMessage.includes('all data') || userMessage.includes('entire dataset') || userMessage.includes('query all');
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let response = '';
          
          // Call MCP tools if appropriate
          if (wantsOfficialRates && currentProfile.state) {
            console.log('[Chat with Tools] Calling get_official_insurance_rates');
            const result = getOfficialRates(currentProfile.state, {
              vehicle: currentProfile.vehicles?.[0]
            });
            
            if (result.success) {
              response = `📊 **Official ${result.source} Data**\n\n`;
              response += `**Profile:** ${result.profile.name}\n`;
              response += `**Vehicle:** ${result.profile.vehicle}\n`;
              response += `**Location:** ${result.profile.location}\n\n`;
              response += `**Monthly Premiums:**\n`;
              Object.entries(result.rates).forEach(([carrier, rates]: [string, any]) => {
                response += `• ${carrier}: **$${rates.monthly}/month** ($${rates.annual}/year)\n`;
              });
              response += `\n_Data collected: ${new Date(result.collectedDate).toLocaleDateString()}_\n`;
              response += `\n✅ Source: Official state insurance department database`;
            } else {
              response = result.message;
            }
          } else if (wantsStateList) {
            console.log('[Chat with Tools] Calling list_available_insurance_states');
            const result = listAvailableStates();
            
            response = `📍 **Available States with Official DOI Data**\n\n`;
            result.details.forEach((detail: any) => {
              response += `• **${detail.name} (${detail.state})**: ${detail.profiles} profiles\n`;
              response += `  _Source: ${detail.tool}_\n\n`;
            });
            response += `**Total:** ${result.totalStates} states, ${result.totalProfiles} profiles`;
          } else if (wantsValidation && currentProfile.state) {
            console.log('[Chat with Tools] Calling validate_quote_accuracy');
            // Mock some engine quotes for testing
            const engineQuotes = [
              { carrierName: 'Progressive', monthlyPremium: 119 },
              { carrierName: 'GEICO', monthlyPremium: 95 },
              { carrierName: 'State Farm', monthlyPremium: 125 }
            ];
            
            const result = compareToOfficial(
              currentProfile.state,
              engineQuotes,
              { vehicle: currentProfile.vehicles?.[0] }
            );
            
            if (result.success) {
              response = `🔍 **Validation Results for ${result.state}**\n\n`;
              result.comparison.forEach((comp: any) => {
                const status = comp.accurate ? '✅ Accurate' : '❌ Off Target';
                response += `**${comp.carrier}:**\n`;
                response += `  Official: $${comp.official}/mo\n`;
                response += `  Our Quote: $${comp.engine}/mo\n`;
                response += `  Difference: $${comp.difference} (${comp.differencePercent}%)\n`;
                response += `  ${status}\n\n`;
              });
              response += `**Summary:** ${result.summary.accuracyRate} accuracy (${result.summary.status})`;
            } else {
              response = result.message;
            }
          } else if (wantsAllProfiles) {
            console.log('[Chat with Tools] Calling get_all_profiles');
            const result = getAllProfiles();
            
            if (result.success) {
              response = `📚 **Complete DOI Dataset Overview**\n\n`;
              response += `**Source:** ${result.source}\n`;
              response += `**Last Updated:** ${new Date(result.lastUpdated).toLocaleDateString()}\n\n`;
              
              response += `**Summary:**\n`;
              response += `• Total Profiles: ${result.summary.total}\n`;
              response += `• States: ${Object.entries(result.summary.byState).map(([s, c]) => `${s} (${c})`).join(', ')}\n`;
              response += `• Coverage Types: ${Object.entries(result.summary.byCoverage).map(([c, n]) => `${c} (${n})`).join(', ')}\n`;
              response += `• Vehicles: ${Object.entries(result.summary.byVehicle).map(([v, c]) => `${v} (${c})`).join(', ')}\n\n`;
              
              response += `**All Profiles:**\n\n`;
              result.profiles.forEach((p: any, idx: number) => {
                response += `**${idx + 1}. ${p.name}**\n`;
                response += `   📍 ${p.location}\n`;
                response += `   🚗 ${p.vehicle}\n`;
                response += `   📋 ${p.coverage} coverage\n`;
                response += `   ✓ ${p.drivingRecord}\n`;
                response += `   💰 Avg: $${Math.round(p.avgMonthly)}/mo (${p.carriers.length} carriers)\n`;
                response += `   🏢 Carriers: ${p.carriers.join(', ')}\n\n`;
              });
              
              response += `\n_This dataset contains ${result.summary.total} official rate profiles for validation and comparison._`;
            } else {
              response = 'Unable to load dataset';
            }
          } else {
            // Default helpful response
            response = `👋 Hello! I'm your insurance assistant with access to official state DOI data.\n\n`;
            response += `**Current profile:** ${currentProfile.state || 'No state set'}\n\n`;
            response += `**I can help you with:**\n`;
            response += `• 📊 Official California & New York insurance rates\n`;
            response += `• 🔍 Comparing quotes to state DOI data\n`;
            response += `• 📍 Listing available states with official data\n\n`;
            response += `**Try asking:**\n`;
            response += `• "What are the official California rates for my vehicle?"\n`;
            response += `• "Which states have official rate data?"\n`;
            response += `• "How accurate are your quotes?"`;
          }

          // Stream response character by character for nice effect
          const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
          
          for (let i = 0; i < response.length; i++) {
            controller.enqueue(encoder.encode(response[i]));
            // Faster streaming for better UX (adjust delay as needed)
            if (i % 3 === 0) { // Stream in small batches for smoothness
              await delay(5);
            }
          }
          
          controller.close();
        } catch (error: any) {
          console.error('[Chat with Tools] Stream error:', error);
          controller.enqueue(encoder.encode(`Error: ${error.message}`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('[Chat with Tools] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } finally {
    // Cleanup MCP client
    if (mcpClient) {
      mcpClient.close();
    }
  }
}

