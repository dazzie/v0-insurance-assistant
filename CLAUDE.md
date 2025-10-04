# Personal Insurance Coverage Coach - Project Context for Claude Code

## Project Overview
Comprehensive AI-powered insurance assistant built with Next.js, TypeScript, and OpenAI GPT-4. The app transforms insurance shopping by providing personalized coaching, local agent connections, and professional carrier negotiation tools through conversational AI.

**Current Status**: Week 2 Development - Enhanced with local agent outreach system, comprehensive carrier toolkit, support for all major insurance types (Auto, Home, Life, Renters, Pet), upgraded to Vercel AI SDK with useChat for improved streaming performance, RAG integration with Vectorize.io, and persistent customer profile management.

## Tech Stack
- **Framework**: Next.js 14.2.33 with TypeScript (recently updated for security)
- **UI Components**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS with custom theme (v3 configuration)
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4 Turbo (streaming support)
- **Streaming**: useChat hook for real-time chat responses
- **State Management**: React hooks and context
- **Form Handling**: react-hook-form with Zod validation
- **RAG System**: Vectorize.io with @vectorize-io/vectorize-client library
- **Data Persistence**: localStorage for customer profiles
- **Deployment**: Vercel (auto-deploy from main branch)
- **Development**: Currently on `week-2` branch for new features

## Critical Rules for useChat Implementation

### **NEVER EVER DO THIS:**
- ❌ `sendMessage("string")` - This DOES NOT work and causes runtime errors
- ❌ Accessing `message.content` directly - Messages use `parts` array structure
- ❌ Passing plain strings to sendMessage
- ❌ Manual stream handling when useChat is available

### **ALWAYS DO THIS:**
- ✅ `sendMessage({ text: "message content" })` - Only UIMessage-compatible objects work
- ✅ Access message content via `message.parts` array
- ✅ Read AI SDK docs before implementing any useChat functionality
- ✅ Use `handleSubmit`, `handleInputChange`, `input`, `messages`, `isLoading` from useChat
- ✅ Let useChat handle streaming automatically

### **Implementation Pattern:**
```typescript
// Correct useChat implementation
const {
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  setInput,
} = useChat({
  api: '/api/chat',
  body: { customerProfile },
  initialMessages: [{ id: '1', role: 'assistant', content: greeting }],
  onError: (error) => console.error('[Chat Error]:', error),
})

// Correct API route with AI SDK
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

const result = await streamText({
  model: openai('gpt-4-turbo-preview'),
  messages: [...],
  temperature: 0.7,
  maxTokens: 2000,
})

return result.toAIStreamResponse()
```

### **Required Dependencies:**
```bash
npm install ai @ai-sdk/openai
```

### **Message Structure:**
- useChat messages have: `{ id, role, content }`
- No `createdAt` field - handle timestamps manually if needed
- Content is plain string, not parts array in our implementation

## Key Commands
```bash
# Development
npm run dev          # Start development server on localhost:3000 (or :3001 if port busy)

# Quality checks (run these before committing)
npm run lint         # Run ESLint
npm run build        # Build for production (also type-checks)

# Production
npm start            # Run production build

# Testing
node test-openai.js  # Test OpenAI connection

# Git workflow (currently on week-2 branch)
git status           # Check current changes
git add .            # Stage changes
git commit -m "..."  # Commit with message
git push -u origin week-2  # Push to week-2 branch
```

## Project Structure
```
/app
  /api/chat         # OpenAI integration endpoint
  layout.tsx        # Root layout with theme provider
  page.tsx          # Main app page

/components
  chat-interface.tsx         # Main chat UI component
  quote-profile-display.tsx  # Progress tracking display
  suggested-prompts.tsx      # Dynamic prompt buttons
  /ui                       # Reusable UI components (shadcn)

/lib
  carrier-conversation-helper.ts  # Generates carrier prep toolkit
  carrier-database.ts            # Insurance carrier information
  customer-profile.ts            # Customer profile management with localStorage
  information-tracker.ts         # Extracts data from messages
  insurance-needs-analysis.ts    # Analyzes insurance needs
  prompt-validator.ts            # Validates prompt-question matches
  quote-profile.ts              # Manages quote profile data
  suggested-prompts.ts          # Generates context-aware prompts
  utils.ts                      # Utility functions
  /rag                           # RAG system components
    /core
      vectorize-io-client.ts     # Vectorize.io API client
```

## Core Business Logic

### Information Collection Flow
1. **Progressive Gathering**: One question at a time approach
2. **Smart Extraction**: Natural language understanding to extract structured data
3. **No Repeated Questions**: Tracks collected information to avoid redundancy
4. **Profile Integration**: Auto-fills from customer profile when applicable

### Enhanced Data Gathering with Quote Path Selection

#### 1. Quote Path Choice (MANDATORY for all insurance types)
After providing initial specific options, ALWAYS offer quote path selection:
```
"Would you like:
A) Quick quote (5 minutes) - Basic information for rough estimate  
B) Detailed quote (10-15 minutes) - Comprehensive info for accurate pricing"
```

#### 2. Quick Quote Path (Minimum Information)
**Purpose**: Fast estimates with basic information
- **Auto**: Driver count → Vehicle count → ZIP → Vehicle year/make/model → Driver ages
- **Home**: Property type → ZIP code → Home value → Year built → Coverage amount desired
- **Life**: Coverage amount desired → Health status → Smoking status → Term vs whole life preference
- **Renters**: ZIP code → Personal property value → Liability coverage desired → Previous claims
- **Pet**: Pet type/breed → Age → Coverage level desired → Pre-existing conditions

#### 3. Detailed Quote Path (Comprehensive Information)
**Purpose**: Accurate pricing with full information gathering
- **Auto**: All minimum fields PLUS years licensed, marital status, driving record, annual mileage, vehicle use, current coverage
- **Home**: All minimum fields PLUS construction details, safety features, claims history, additional coverage needs, mortgage information
- **Life**: All minimum fields PLUS detailed health questions, lifestyle factors, beneficiary information, existing coverage, financial details
- **Renters**: All minimum fields PLUS detailed inventory, additional living expenses, specific coverage needs
- **Pet**: All minimum fields PLUS detailed health history, vet information, specific conditions to cover

#### 4. Prompt-Type Flow Examples
```
Auto Insurance:
Question: "How many drivers?"
Prompts: ["Just me", "2 drivers", "3 drivers", "4+ drivers"]

Question: "What year is your vehicle?"  
Prompts: ["2020-2024", "2015-2019", "2010-2014", "2005-2009", "Older than 2005"]

Question: "Your driving record?"
Prompts: ["Clean record", "1 minor violation", "1 major violation", "Multiple violations"]

Home Insurance:
Question: "What's your home's construction type?"
Prompts: ["Brick", "Wood frame", "Stucco", "Concrete", "Other"]

Question: "Home security features?"
Prompts: ["Security system", "Smoke detectors only", "No security features", "Multiple features"]

Life Insurance:
Question: "How would you describe your health?"
Prompts: ["Excellent", "Good", "Fair", "Poor", "Prefer not to say"]

Question: "Do you smoke?"
Prompts: ["Never smoked", "Former smoker (quit 2+ years)", "Current smoker", "Occasional smoker"]
```

#### 5. Path Management & Progression
- **Track selected path**: Quick vs Detailed
- **Adjust collection depth**: Based on chosen path
- **Provide progress indicators**: "Step 2 of 5" for quick, "Step 4 of 12" for detailed
- **Allow path switching**: "Would you like to upgrade to detailed quote for better accuracy?"
- **Use guided prompts**: Provide clickable options for faster completion

#### 6. Quote Accuracy & Disclaimers
**Quick Quote Results:**
- Provide estimate ranges (e.g., "$800-1,200/year")
- Include accuracy disclaimer: "This is a rough estimate based on basic information"
- Offer upgrade option: "Get a detailed quote for more accurate pricing"
- Show what additional information would improve accuracy

**Detailed Quote Results:**
- Provide specific estimates with carrier comparisons
- Include confidence level: "Based on comprehensive information provided"
- Offer enhanced carrier conversation toolkit with coverage requirements breakdown
- Provide next steps for actual policy purchase

#### Enhanced Carrier Conversation Toolkit
The toolkit now includes comprehensive coverage analysis:

**REQUIRED COVERAGES SECTION (Non-negotiable):**
- State minimum liability requirements with specific dollar amounts
- Lender requirements for financed/leased vehicles or mortgaged properties
- Legal obligations and consequences of inadequate coverage
- Mandatory state-specific coverage (PIP in no-fault states, uninsured motorist, etc.)

**FLEXIBLE COVERAGES SECTION (Negotiation opportunities):**
- Optional coverage add-ons: comprehensive, collision, rental, roadside assistance
- Deductible options: $250/$500/$1000 with premium impact analysis
- Coverage limit choices above minimums and associated cost differences
- Available discounts and qualification requirements
- Payment plan options and any associated fees

**COVERAGE NEGOTIATION SCRIPTS:**
- "What's the premium difference between $500 and $1000 deductibles?"
- "What discounts am I eligible for and how much will they save me?"
- "Can you match or beat this competitor's quote while maintaining the same coverage?"
- "What optional coverages would you recommend for my specific situation and why?"
- "Are there any coverage gaps in my current policy that I should address?"

**INSURANCE-SPECIFIC COVERAGE EXAMPLES:**

*Auto Insurance:*
- **REQUIRED**: State liability minimums (e.g., CA: 15/30/5), lender comprehensive/collision
- **FLEXIBLE**: Higher liability limits, lower deductibles, rental coverage, roadside assistance
- **NEGOTIABLE**: Deductible amounts, coverage limits, multi-policy discounts

*Home Insurance:*
- **REQUIRED**: Mortgage lender dwelling coverage, basic liability
- **FLEXIBLE**: Personal property limits, additional living expenses, umbrella policy
- **NEGOTIABLE**: Deductible levels, replacement cost vs. actual cash value, bundling discounts

*Life Insurance:*
- **REQUIRED**: Employer/lender requirements (if applicable)
- **FLEXIBLE**: Term vs. whole life, coverage amount, riders (disability, accidental death)
- **NEGOTIABLE**: Premium payment frequency, policy conversion options, health exam requirements

### Real-Time Profile Technical Implementation

**Profile Persistence Flow:**
1. User sends message → `extractProfileFromConversation()` scans ALL messages
2. Extracts data using regex patterns (age, vehicles, marital status, phone, ZIP, home value)
3. Merges with existing profile from localStorage → Saves immediately
4. Profile auto-fills in system prompt for next response
5. UI updates via custom event listeners

**Key Extraction Examples:**
- "I'm 35" → age: 35 (✓ SAVED)
- "2020 Honda Civic" → vehicles: [{year: 2020, make: "Honda", model: "Civic"}]
- "$400k home" → homeValue: "400000"
- "married" → maritalStatus: "married"

### Implementation Details for Latest Features

### Data Collection Best Practices

**Core Principles:**
1. Check existing data FIRST - never ask for information already known
2. One question at a time with 3-4 numbered options
3. Progressive gathering - build profile step by step
4. Instant estimates after basic info collected (5 mandatory fields)
5. Smart memory - remember everything mentioned in conversation

**Collection Order (Auto Insurance):**
Drivers → Vehicles → ZIP → Ages → Vehicle Details → Coverage Preferences

**Premium Estimate Ranges:**
- **Auto**: $800-4,000/year based on driver age, record, vehicle type
- **Home**: $600-4,000/year based on home value and location
- **Life**: $25-400/month based on age, health, coverage amount

**Always show three tiers:** State minimum, Standard coverage, Full coverage

### Data Validation Rules
- **Confidence Threshold**: 75% confidence required for prompt suggestions
- **Universal Rule - ALL Insurance Types**: NEVER end initial responses with vague questions
  - ALWAYS provide specific numbered options: "I can help you: 1) ... 2) ... 3) ..."
  - Applies to auto, home, life, renters, pet, health, disability, umbrella insurance
  - Make options relevant to the specific insurance type and user profile
- **Auto Insurance Minimum Quote Requirements**: Exactly 5 mandatory fields must be collected:
  1. Number of drivers on policy
  2. Number of vehicles to insure  
  3. Primary ZIP code
  4. Age of each driver (auto-filled from profile for single driver)
  5. Vehicle details (year, make, model for each vehicle)
- **Required vs Optional**: NO quotes provided until all 5 mandatory fields collected
- **Collection Order**: Drivers → Vehicles → ZIP → Ages → Vehicle Details → Optional enhancements

### Quote Profile States
- **0-40%**: Gathering basic information
- **40-70%**: Core details collected
- **70-90%**: Most required fields complete
- **90-100%**: Ready for accurate quotes

## Coding Conventions

### TypeScript Patterns
- Use type definitions from existing files (e.g., `QuoteProfile`, `InformationTracker`)
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values
- Strict null checks enabled

### Component Patterns
- Functional components with TypeScript
- Use existing UI components from `/components/ui`
- Props interfaces defined above components
- Consistent use of `cn()` utility for className merging

### File Naming
- Components: PascalCase (e.g., `ChatInterface.tsx`)
- Utilities/lib: kebab-case (e.g., `information-tracker.ts`)
- API routes: lowercase folders

### State Management
- React hooks for local state
- Context for theme/global state
- No external state management libraries

## Environment Variables
```env
# OpenAI Configuration
OPENAI_API_KEY=<required>      # OpenAI API key for GPT-4
USE_MOCK_RESPONSES=false       # Set to true for testing without API

# Vectorize.io Configuration (for RAG)
VECTORIZE_IO_API_KEY=<required>    # Vectorize.io API token
VECTORIZE_IO_ORG_ID=<required>     # Organization ID
VECTORIZE_IO_PIPELINE_ID=<required> # Pipeline ID
TOKEN=<required>                    # Alternative env var for API token

# RAG System
ENABLE_RAG=true                    # Enable RAG features
```

## Testing Approach
- Manual testing via development server
- OpenAI connection test: `node test-openai.js`
- Type checking: `npm run build`
- Linting: `npm run lint`

## Important Implementation Details

### OpenAI Integration
- Streaming enabled for real-time responses
- System prompts define assistant personality
- Fallback to mock responses if API unavailable
- Context maintains full conversation history

### Information Extraction
- Uses regex patterns and keyword matching
- Handles various input formats (e.g., "2020 Toyota Camry", "Tesla Model 3")
- Confidence scoring for data quality
- Automatic normalization (lowercase makes, proper case models)

### Prompt Validation
- Validates prompts match current question context
- Falls back to no prompts if uncertain
- Prevents showing incorrect options
- Dynamic adaptation based on collected data

## Common Tasks

### Universal Initial Response Format (ALL Insurance Types)
When implementing any insurance type, ensure initial responses follow this MANDATORY format:
1. **Acknowledge the insurance type** from user profile immediately
2. **Never ask vague questions** like "What would you like to explore?"
3. **Always end with**: "I can help you:" followed by 2-3 numbered, specific actions
4. **Make options relevant** to the insurance type and user's profile (age, location, etc.)
5. **ALWAYS offer quote path choice** after initial options: Quick vs Detailed quote

**Enhanced Template**: 
```
"I can help you: 1) [Specific action] 2) [Specific action] 3) [Specific action]

Would you like:
A) Quick quote (5 minutes) - Basic information for rough estimate
B) Detailed quote (10-15 minutes) - Comprehensive info for accurate pricing"
```

### Data Gathering Implementation Rules
1. **Quote Path Selection**: MANDATORY for all insurance types after initial options
2. **Prompt-Driven Collection**: Use specific prompts for each question to speed up data entry
3. **Progress Tracking**: Show users their progress through the collection process
4. **Path Switching**: Allow users to upgrade from quick to detailed quotes
5. **Guided Prompts**: Provide clickable options instead of free-form text when possible

### Adding New Insurance Types
1. Extend `information-tracker.ts` with new extraction patterns
2. Update `quote-profile.ts` with new profile structure
3. Add specific prompts in `suggested-prompts.ts`
4. Update system prompt in `/app/api/chat/route.ts` with:
   - Specific numbered options for the new type
   - Quick quote path requirements (minimum fields)
   - Detailed quote path requirements (comprehensive fields)
   - Prompt-type flows with clickable options
5. **Define data collection paths**:
   - Quick path: 3-5 essential fields for basic estimate
   - Detailed path: 8-15 fields for accurate pricing
6. **Create prompt examples** for each question with 3-4 clickable options
7. **Add progress tracking** indicators for both paths

### Modifying Information Collection
1. Update required/optional fields in `quote-profile.ts`
2. Adjust collection order in `information-tracker.ts`
3. Update validation rules in `prompt-validator.ts`
4. Test extraction patterns thoroughly

### UI Component Updates
1. Use existing Radix UI components from `/components/ui`
2. Follow established patterns in `chat-interface.tsx`
3. Maintain consistent styling with Tailwind classes
4. Test responsive behavior

## Deployment Notes
- Auto-deploys to Vercel on push to main branch
- Environment variables set in Vercel dashboard
- Build checks must pass for successful deployment
- Preview deployments for pull requests

## Recent Updates (Week 2)

### Quote Requirements Enhancement
Updated system rules with strict minimum requirements for auto insurance quotes:
- **5 Mandatory Fields**: Driver count, vehicle count, ZIP code, driver ages, vehicle details (year/make/model)
- **No quotes until ALL 5 collected**: Prevents premature estimates
- **Enhanced accuracy fields**: Years licensed, marital status, driving record, mileage
- **Clear checkpoint system**: ✅ checklist approach in system prompts
- **TARGETED COLLECTION**: Prioritize getting required info ASAP with direct, concise questions
  - Skip lengthy introductions during data collection
  - Ask direct questions: "How many drivers?" not "To provide accurate quotes..."
  - Save coaching/educational content for AFTER all required info is gathered
- **MANDATORY SPECIFIC NEXT STEPS**: When user profile indicates specific insurance type, provide numbered options
  - Acknowledge their insurance need immediately (auto, life, home, etc.)
  - NEVER end with vague questions like "What would you like to explore first?"
  - ALWAYS end with: "I can help you:" followed by 2-3 numbered, specific actions
  - Make options actionable and relevant to their profile
  
  **Examples by Insurance Type:**
  - **Auto Insurance**: "I can help you: 1) Get accurate quotes in minutes 2) Compare your current coverage 3) Find money-saving opportunities"
  - **Life Insurance**: "I can help you: 1) Calculate how much coverage you need 2) Compare term vs whole life options 3) Find the best rates for your age and health"
  - **Home Insurance**: "I can help you: 1) Assess your coverage needs 2) Compare policy options and deductibles 3) Find discounts you qualify for"
  - **Renters Insurance**: "I can help you: 1) Determine how much coverage you need 2) Compare affordable policy options 3) Understand what's covered vs not covered"
  - **Pet Insurance**: "I can help you: 1) Compare coverage options for your pet 2) Understand what conditions are covered 3) Find the best value plans"
  - **Health Insurance**: "I can help you: 1) Compare plan options in your area 2) Understand your benefits and costs 3) Find cost-saving strategies"
  - **Disability Insurance**: "I can help you: 1) Calculate how much income protection you need 2) Compare short-term vs long-term options 3) Find group vs individual policies"
  - **Umbrella Insurance**: "I can help you: 1) Assess if you need extra liability protection 2) Determine coverage amounts 3) Find affordable umbrella policies"

### UI/UX Improvements
- **Fixed chat bubble overflow**: Replaced semi-transparent backgrounds with solid white
- **Better text containment**: Proper text wrapping within chat bubbles
- **Improved readability**: Enhanced contrast and visual hierarchy
- **Responsive design**: Better mobile experience for insurance customers

### Development Workflow
- **Branch Strategy**: Using `week-2` branch for new development
- **Git Workflow**: Clean commits with descriptive messages
- **Testing**: Continuous verification of app functionality

## Current Focus Areas
- **Primary**: Auto insurance (fully implemented with enhanced rules)
- **Future**: Home, Life, Health insurance modules
- **Active Development**: Quote accuracy optimization and user experience refinement

## Recent Updates (Week 2)

### 🔄 Real-Time Profile Updates
- Automatic data capture using regex patterns (age, vehicles, marital status, ZIP, home value)
- Persistent localStorage with auto-fill in system prompts
- Visual confirmation with checkmarks (✓ SAVED - USE THIS)

### 💰 Premium Estimates & Monthly Costs
- **Auto**: $800-4,000/year ($67-333/month) based on driver profile
- **Home**: $600-4,000/year ($50-333/month) based on property value
- **Life**: $25-400/month based on age and health
- Three-tier display: state minimum, standard, full coverage

### 🎯 Step-by-Step Data Collection
- One question at a time with 3-4 numbered options
- Smart memory - never asks twice for same information
- Progress tracking: "I have: X, Y, Z. Now I need: A"
- Instant estimates after 5 mandatory fields collected

### 🤝 Local Agent Outreach
- Agent discovery by ZIP code and specialization
- Reputation scoring: ratings (40%), experience (25%), reviews (20%), response time (15%)
- Professional email composition with profile integration
- Direct contact: call, email, or send introduction

### 📋 Enhanced Carrier Toolkit
- Required vs flexible coverage breakdown
- Negotiation scripts: deductible comparison, discount eligibility, competitor matching
- State-specific minimums (e.g., CA: 15/30/5 liability)
- Document checklist for carrier calls

### 🔧 Technical Improvements
- Vercel AI SDK with `useChat` hook for streaming
- Next.js 14.2.33 (security CVE fixes)
- RAG integration: Vectorize.io with 14 datasets (235+ entries, 356KB)
- Customer profile system with localStorage persistence
- UI fixes: chat bubble text wrapping, solid backgrounds

## Vectorize.io Data Management

### Complete Knowledge Base Datasets
Ready for upload in `/data/vectorize-upload/` (14 files, 356KB total):

#### Core Insurance Knowledge
1. **insurance-coverage-explanations.json** - 20 coverage types with examples
2. **insurance-terminology-glossary.json** - 20 key terms with definitions
3. **state-insurance-requirements.json** - 20 states with requirements
4. **insurance-discounts-guide.json** - 20 discount types with criteria
5. **insurance-faqs.json** - 20 comprehensive Q&As
6. **negotiation-strategies.json** - 20 tactics and scripts

#### Carrier Intelligence & Claims
7. **insurance-carrier-profiles.json** - 15 major carriers (GEICO, State Farm, Progressive, etc.)
8. **carrier-coverage-options.json** - 15 carrier-specific features, discounts, and programs
9. **preferred-agents-directory.json** - 20 agent selection guides and quality indicators
10. **insurance-claim-process.json** - 15 claim types with step-by-step processes

#### Customer Scenarios & Optimization
11. **customer-scenarios-lifecycles.json** - 15 life events (marriage, home purchase, retirement)
12. **risk-factors-pricing.json** - 15 pricing factors (credit, location, vehicle type)
13. **insurance-troubleshooting.json** - 15 common problems and solutions
14. **insurance-money-saving-tips.json** - 15 savings strategies (bundling, deductibles)

### Dataset Statistics
- **Total Entries**: 235+ comprehensive insurance knowledge entries
- **Coverage Areas**: All 6 originally requested categories fully covered
- **File Format**: Consistent JSON structure with id, category, title, content, metadata
- **Vectorization Ready**: Optimized for Vectorize.io pipeline processing

### Upload Process
1. Navigate to platform.vectorize.io
2. Access your pipeline (ID in .env.local)
3. Upload all 14 JSON files through admin UI
4. Pipeline auto-chunks and vectorizes content
5. ~1000+ vectors available for RAG queries with comprehensive coverage:
   - Insurance fundamentals and terminology
   - Carrier-specific information and options
   - State regulations and requirements
   - Claims processes and troubleshooting
   - Life events and customer scenarios
   - Money-saving strategies and optimizations
   - Agent selection and evaluation
   - Risk factors and pricing models

## Debug Tips
- Check browser console for API errors
- Verify `.env.local` has valid OpenAI key
- Use `USE_MOCK_RESPONSES=true` for testing without API
- Check Next.js terminal output for server-side errors
- **Streaming Issues**: Verify AI SDK dependencies are installed correctly
- **useChat Errors**: Check message structure and API route implementation
- **RAG Issues**: Check Vectorize.io credentials and pipeline status
- **Profile Issues**: Check localStorage availability and browser permissions