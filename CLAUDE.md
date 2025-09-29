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
- **Potential Enhancement**: Rating engine with specific algorithms for accurate pricing

## Rating Engine Implementation

### Overview
A rating engine would provide actual insurance premium calculations using industry-standard algorithms, replacing estimate ranges with precise pricing based on collected data.

### Architecture Design

#### 1. Rating Engine Structure
```
/lib/rating-engine/
├── core/
│   ├── rating-engine.ts          # Main engine orchestrator
│   ├── risk-calculator.ts        # Risk assessment algorithms
│   └── base-rate-provider.ts     # Base rate management
├── algorithms/
│   ├── auto-rating.ts           # Auto insurance algorithms
│   ├── home-rating.ts           # Home insurance algorithms
│   ├── life-rating.ts           # Life insurance algorithms
│   └── shared-factors.ts        # Common rating factors
├── data/
│   ├── base-rates.ts            # Industry base rates by state/region
│   ├── risk-tables.ts           # Actuarial risk tables
│   └── carrier-adjustments.ts   # Carrier-specific adjustments
└── types/
    ├── rating-types.ts          # TypeScript interfaces
    └── algorithm-types.ts       # Algorithm-specific types
```

#### 2. Auto Insurance Rating Algorithm
```typescript
interface AutoRatingFactors {
  // Driver factors
  age: number
  yearsLicensed: number
  maritalStatus: 'single' | 'married' | 'divorced'
  creditScore?: number
  violations: ViolationType[]
  accidents: AccidentHistory[]
  
  // Vehicle factors
  year: number
  make: string
  model: string
  value: number
  safetyRating: number
  
  // Usage factors
  annualMileage: number
  primaryUse: 'commute' | 'pleasure' | 'business'
  garagedZip: string
  
  // Coverage selections
  liability: LiabilityLimits
  comprehensive: boolean
  collision: boolean
  deductibles: DeductibleAmounts
}

// Rating calculation flow
1. Base Rate (by state/zip): $800-2000
2. Driver Age Factor: 0.8-2.5x multiplier
3. Vehicle Factor: 0.9-1.8x multiplier
4. Usage Factor: 0.85-1.3x multiplier
5. Coverage Factor: 1.0-2.2x multiplier
6. Carrier Adjustment: 0.9-1.15x multiplier
```

#### 3. Home Insurance Rating Algorithm
```typescript
interface HomeRatingFactors {
  // Property factors
  dwellingValue: number
  yearBuilt: number
  squareFootage: number
  constructionType: ConstructionType
  roofAge: number
  
  // Location factors
  zipCode: string
  catastropheZone: CatZone
  crimeScore: number
  fireProtectionClass: number
  
  // Coverage factors
  dwellingCoverage: number
  personalProperty: number
  liability: number
  deductible: number
  
  // Risk mitigation
  securitySystem: boolean
  fireAlarm: boolean
  sprinklerSystem: boolean
  claimsHistory: ClaimHistory[]
}

// Rating calculation flow
1. Base Rate (dwelling value): $0.35-0.85 per $100
2. Construction Multiplier: 0.8-1.4x
3. Location Risk: 0.9-2.1x
4. Age Factor: 0.95-1.25x
5. Protection Discount: 0.85-1.0x
6. Claims Surcharge: 1.0-1.8x
```

#### 4. Life Insurance Rating Algorithm
```typescript
interface LifeRatingFactors {
  // Personal factors
  age: number
  gender: 'male' | 'female'
  smoker: boolean
  health: HealthClass
  
  // Lifestyle factors
  occupation: OccupationClass
  hobbies: RiskyActivity[]
  travelPatterns: TravelRisk
  
  // Policy factors
  coverageAmount: number
  policyType: 'term' | 'whole' | 'universal'
  termLength?: number
  
  // Medical factors
  height: number
  weight: number
  medicalHistory: MedicalCondition[]
  familyHistory: FamilyMedicalHistory
}

// Rating calculation flow (per $1000 coverage)
1. Base Mortality Rate: $0.50-15.00
2. Age Factor: 1.0-8.5x multiplier
3. Health Class: 0.75-3.0x multiplier
4. Smoker Factor: 1.0-2.8x multiplier
5. Occupation Risk: 1.0-2.5x multiplier
6. Policy Type Factor: 0.8-4.2x multiplier
```

### Implementation Steps

#### Phase 1: Core Infrastructure
1. **Create rating engine foundation**
   ```bash
   mkdir -p lib/rating-engine/{core,algorithms,data,types}
   ```

2. **Implement base rating engine**
   ```typescript
   // lib/rating-engine/core/rating-engine.ts
   export class RatingEngine {
     async calculatePremium(
       insuranceType: InsuranceType,
       ratingFactors: RatingFactors,
       coverageSelections: Coverage
     ): Promise<RatingResult>
   }
   ```

3. **Add data sources**
   - State insurance department rate filings
   - Industry loss cost data (ISO, NCCI)
   - Actuarial tables and risk factors

#### Phase 2: Algorithm Implementation
1. **Auto insurance algorithms**
   - Implement GLM (Generalized Linear Model) approach
   - Territory rating by ZIP code
   - Vehicle symbol rating
   - Driver class rating

2. **Home insurance algorithms**
   - Catastrophe modeling integration
   - Construction cost calculators
   - Replacement cost estimators

3. **Life insurance algorithms**
   - Mortality table integration (CSO 2017)
   - Underwriting class determination
   - Premium calculation by age bands

#### Phase 3: Integration
1. **Update quote flow**
   ```typescript
   // After data collection completion
   const ratingResult = await ratingEngine.calculatePremium(
     insuranceType,
     collectedData,
     selectedCoverage
   )
   
   // Return actual premiums instead of estimates
   return {
     premium: ratingResult.premium,
     confidence: ratingResult.confidence,
     carrierQuotes: ratingResult.carrierBreakdown,
     ratingFactors: ratingResult.factorBreakdown
   }
   ```

2. **Enhance API responses**
   - Replace estimate ranges with calculated premiums
   - Provide factor breakdowns showing how premium was calculated
   - Include confidence scores based on data completeness

### Data Requirements

#### Essential Data Sources
- **State Rate Filings**: Base rates by state/territory
- **Loss Cost Data**: Industry standard loss costs
- **Actuarial Tables**: Mortality, morbidity, catastrophe data
- **Vehicle Data**: VIN decoding, safety ratings, theft rates
- **Geographic Data**: ZIP code risk factors, catastrophe zones

#### API Integrations
- **Vehicle Data**: NHTSA, IIHS safety ratings
- **Property Data**: Zillow/CoreLogic for home values
- **Credit Data**: LexisNexis for credit-based insurance scores
- **Weather Data**: NOAA for catastrophe risk assessment

### Benefits of Rating Engine

#### For Users
- **Accurate Pricing**: Real premiums instead of broad estimates
- **Transparent Factors**: See exactly how premium is calculated
- **Instant Quotes**: No waiting for carrier responses
- **Comparison Shopping**: Direct premium comparisons across carriers

#### For Business
- **Competitive Advantage**: More accurate than generic quote tools
- **Lead Quality**: Higher conversion with accurate pricing
- **Data Insights**: Understanding of rating factor impacts
- **Scalability**: Automated pricing without carrier API dependencies

### Technical Considerations

#### Performance
- **Caching**: Cache base rates and risk factors
- **Async Processing**: Handle complex calculations asynchronously
- **Database**: Store rating factors and calculation history

#### Accuracy
- **Regular Updates**: Update rating factors quarterly
- **Validation**: Compare results against actual carrier quotes
- **Confidence Scoring**: Indicate precision level of calculations

#### Compliance
- **State Regulations**: Ensure compliance with insurance regulations
- **Rate Filing Requirements**: Follow state-specific rating rules
- **Fair Credit Reporting**: Comply with FCRA for credit factors

## Carrier API Integration

### Overview
Automate the quote process by integrating directly with insurance carrier public APIs to get real-time pricing instead of manual quote processes. This replaces the manual "visit carrier websites" workflow with automated API calls.

### Architecture Design

#### 1. Carrier Integration Structure
```
/lib/carrier-integration/
├── core/
│   ├── carrier-manager.ts       # Orchestrates all carrier calls
│   ├── quote-aggregator.ts      # Combines and compares quotes
│   └── api-client.ts           # Base API client with common functionality
├── carriers/
│   ├── geico-api.ts            # GEICO integration
│   ├── progressive-api.ts       # Progressive integration
│   ├── state-farm-api.ts       # State Farm integration
│   ├── allstate-api.ts         # Allstate integration
│   ├── usaa-api.ts             # USAA integration
│   └── liberty-mutual-api.ts   # Liberty Mutual integration
├── mappers/
│   ├── data-mapper.ts          # Maps our data to carrier formats
│   ├── response-mapper.ts      # Maps carrier responses to our format
│   └── coverage-mapper.ts      # Standardizes coverage options
├── types/
│   ├── carrier-types.ts        # Carrier-specific interfaces
│   ├── quote-types.ts          # Standardized quote interfaces
│   └── api-types.ts            # API request/response types
└── utils/
    ├── rate-limiter.ts         # API rate limiting
    ├── retry-handler.ts        # API retry logic
    └── error-handler.ts        # Carrier-specific error handling
```

#### 2. Carrier API Specifications

##### GEICO API Integration
```typescript
interface GeicoQuoteRequest {
  // Driver information
  drivers: Array<{
    age: number
    gender: 'M' | 'F'
    maritalStatus: 'S' | 'M' | 'D'
    licenseNumber: string
    yearsLicensed: number
    violations: ViolationRecord[]
    accidents: AccidentRecord[]
  }>
  
  // Vehicle information
  vehicles: Array<{
    year: number
    make: string
    model: string
    vin?: string
    annualMileage: number
    primaryUse: 'commute' | 'pleasure' | 'business'
    garagedZip: string
  }>
  
  // Coverage selections
  coverage: {
    bodilyInjuryLiability: string    // e.g., "100/300"
    propertyDamageLiability: number  // e.g., 100000
    comprehensive: {
      selected: boolean
      deductible: number             // e.g., 500
    }
    collision: {
      selected: boolean
      deductible: number             // e.g., 500
    }
    uninsuredMotorist: string        // e.g., "100/300"
    personalInjuryProtection?: number
  }
  
  // Policy information
  effectiveDate: string
  zipCode: string
}

// API Endpoint: https://api.geico.com/v2/auto/quote
// Method: POST
// Authentication: API Key + OAuth 2.0
```

##### Progressive API Integration
```typescript
interface ProgressiveQuoteRequest {
  quoteRequest: {
    // Personal information
    applicant: {
      firstName: string
      lastName: string
      dateOfBirth: string
      gender: 'M' | 'F'
      maritalStatus: 'Single' | 'Married' | 'Divorced'
      address: AddressInfo
    }
    
    // Drivers
    drivers: DriverInfo[]
    
    // Vehicles
    vehicles: Array<{
      year: number
      make: string
      model: string
      trim?: string
      vin?: string
      ownership: 'Own' | 'Lease' | 'Finance'
      primaryDriver: number        // Driver index
      annualMileage: number
      garagingAddress: AddressInfo
    }>
    
    // Coverage
    coverageSelections: {
      liabilityLimits: {
        bodilyInjury: string       // "25/50", "100/300", etc.
        propertyDamage: number
      }
      physicalDamage: {
        comprehensive: boolean
        comprehensiveDeductible?: number
        collision: boolean
        collisionDeductible?: number
      }
      uninsuredMotorist: boolean
      underinsuredMotorist: boolean
    }
  }
}

// API Endpoint: https://api.progressive.com/quote/auto
// Method: POST  
// Authentication: API Key + Client Certificate
```

##### State Farm API Integration
```typescript
interface StateFarmQuoteRequest {
  // Customer information
  customer: {
    personalInfo: PersonalInfo
    contactInfo: ContactInfo
    licenseInfo: LicenseInfo
  }
  
  // Policy details
  policy: {
    effectiveDate: string
    term: 6 | 12                   // months
    paymentPlan: 'monthly' | 'semiannual' | 'annual'
  }
  
  // Vehicles and drivers
  riskUnits: Array<{
    vehicle: VehicleInfo
    primaryDriver: DriverInfo
    additionalDrivers?: DriverInfo[]
  }>
  
  // Coverage options
  coverageOptions: {
    liability: LiabilityCoverage
    physicalDamage: PhysicalDamageCoverage
    medicalPayments?: number
    uninsuredMotorist: UninsuredMotoristCoverage
  }
}

// API Endpoint: https://developer.statefarm.com/auto-insurance/v1/quote
// Method: POST
// Authentication: OAuth 2.0 + API Key
```

#### 3. Implementation Flow

##### Quote Request Process
```typescript
// lib/carrier-integration/core/carrier-manager.ts
export class CarrierManager {
  async getQuotes(
    customerData: CollectedCustomerData,
    selectedCarriers: string[] = ['geico', 'progressive', 'statefarm', 'allstate']
  ): Promise<CarrierQuoteResults> {
    
    // 1. Map our data to carrier formats
    const mappedData = await this.dataMapper.mapToCarrierFormats(customerData)
    
    // 2. Make parallel API calls to selected carriers
    const quotePromises = selectedCarriers.map(carrier => 
      this.callCarrierAPI(carrier, mappedData[carrier])
    )
    
    // 3. Handle responses and errors
    const results = await Promise.allSettled(quotePromises)
    
    // 4. Process and standardize responses
    const processedQuotes = this.processCarrierResponses(results)
    
    // 5. Rank and return quotes
    return this.quoteAggregator.rankQuotes(processedQuotes)
  }
  
  private async callCarrierAPI(
    carrier: string, 
    requestData: any
  ): Promise<CarrierQuoteResponse> {
    const carrierClient = this.getCarrierClient(carrier)
    
    try {
      // Apply rate limiting
      await this.rateLimiter.waitForSlot(carrier)
      
      // Make API call with retry logic
      const response = await this.retryHandler.execute(
        () => carrierClient.getQuote(requestData),
        { maxRetries: 3, backoffMs: 1000 }
      )
      
      return response
    } catch (error) {
      return this.errorHandler.handleCarrierError(carrier, error)
    }
  }
}
```

##### Data Mapping Examples
```typescript
// lib/carrier-integration/mappers/data-mapper.ts
export class DataMapper {
  mapToGeicoFormat(customerData: CollectedCustomerData): GeicoQuoteRequest {
    return {
      drivers: customerData.drivers.map(driver => ({
        age: driver.age,
        gender: driver.gender === 'male' ? 'M' : 'F',
        maritalStatus: this.mapMaritalStatus(driver.maritalStatus),
        licenseNumber: driver.licenseNumber || '',
        yearsLicensed: driver.yearsLicensed,
        violations: driver.violations || [],
        accidents: driver.accidents || []
      })),
      
      vehicles: customerData.vehicles.map(vehicle => ({
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        annualMileage: vehicle.annualMileage || 12000,
        primaryUse: vehicle.primaryUse || 'commute',
        garagedZip: customerData.zipCode
      })),
      
      coverage: {
        bodilyInjuryLiability: customerData.coverage.liability || "100/300",
        propertyDamageLiability: customerData.coverage.propertyDamage || 100000,
        comprehensive: {
          selected: customerData.coverage.comprehensive || true,
          deductible: customerData.coverage.comprehensiveDeductible || 500
        },
        collision: {
          selected: customerData.coverage.collision || true,
          deductible: customerData.coverage.collisionDeductible || 500
        },
        uninsuredMotorist: customerData.coverage.uninsuredMotorist || "100/300"
      },
      
      effectiveDate: customerData.effectiveDate || new Date().toISOString(),
      zipCode: customerData.zipCode
    }
  }
}
```

#### 4. Quote Aggregation & Comparison

```typescript
// lib/carrier-integration/core/quote-aggregator.ts
export class QuoteAggregator {
  rankQuotes(quotes: ProcessedQuote[]): QuoteComparisonResult {
    const validQuotes = quotes.filter(q => q.status === 'success')
    
    // Sort by annual premium (lowest first)
    const sortedQuotes = validQuotes.sort((a, b) => 
      a.annualPremium - b.annualPremium
    )
    
    return {
      quotes: sortedQuotes.map((quote, index) => ({
        ...quote,
        rank: index + 1,
        savings: index === 0 ? 0 : quote.annualPremium - sortedQuotes[0].annualPremium,
        percentageDifference: index === 0 ? 0 : 
          ((quote.annualPremium - sortedQuotes[0].annualPremium) / sortedQuotes[0].annualPremium) * 100
      })),
      
      summary: {
        totalQuotes: validQuotes.length,
        lowestPremium: sortedQuotes[0]?.annualPremium,
        highestPremium: sortedQuotes[sortedQuotes.length - 1]?.annualPremium,
        averagePremium: validQuotes.reduce((sum, q) => sum + q.annualPremium, 0) / validQuotes.length,
        potentialSavings: sortedQuotes[sortedQuotes.length - 1]?.annualPremium - sortedQuotes[0]?.annualPremium
      },
      
      errors: quotes.filter(q => q.status === 'error'),
      generatedAt: new Date().toISOString()
    }
  }
}
```

### Integration Steps

#### Phase 1: API Setup & Authentication
1. **Register with carrier developer programs**
   - GEICO Developer Portal
   - Progressive Partner API
   - State Farm Developer Platform
   - Allstate API Program
   - USAA Developer Access
   - Liberty Mutual API

2. **Obtain API credentials**
   ```env
   # .env.local
   GEICO_API_KEY=your_geico_api_key
   GEICO_CLIENT_SECRET=your_geico_secret
   
   PROGRESSIVE_API_KEY=your_progressive_key
   PROGRESSIVE_CLIENT_CERT=path_to_cert.pem
   
   STATEFARM_CLIENT_ID=your_statefarm_client_id
   STATEFARM_CLIENT_SECRET=your_statefarm_secret
   ```

3. **Implement authentication flows**
   - OAuth 2.0 token management
   - API key rotation
   - Certificate-based auth for some carriers

#### Phase 2: Core Integration
1. **Build carrier clients**
   ```typescript
   // Example: GEICO client
   export class GeicoClient extends BaseCarrierClient {
     async getQuote(request: GeicoQuoteRequest): Promise<GeicoQuoteResponse> {
       const response = await this.post('/v2/auto/quote', request, {
         headers: {
           'Authorization': `Bearer ${this.accessToken}`,
           'X-API-Key': this.apiKey,
           'Content-Type': 'application/json'
         }
       })
       
       return this.responseMapper.mapGeicoResponse(response.data)
     }
   }
   ```

2. **Implement data mappers**
   - Convert collected data to carrier-specific formats
   - Handle carrier-specific requirements and validations
   - Map coverage options to carrier terminology

3. **Add error handling**
   - Carrier-specific error codes
   - Rate limiting and retry logic
   - Fallback mechanisms

#### Phase 3: Integration with Existing Flow
1. **Update quote generation**
   ```typescript
   // In chat API route after data collection
   if (allRequiredDataCollected) {
     // Get real-time quotes from carriers
     const carrierQuotes = await carrierManager.getQuotes(
       collectedData,
       ['geico', 'progressive', 'statefarm', 'allstate']
     )
     
     // Return actual quotes instead of estimates
     return {
       quotes: carrierQuotes.quotes,
       summary: carrierQuotes.summary,
       nextSteps: generateCarrierToolkit(carrierQuotes),
       timestamp: new Date().toISOString()
     }
   }
   ```

2. **Enhance UI for quote results**
   - Display multiple carrier quotes side-by-side
   - Show coverage comparisons
   - Highlight best value options
   - Provide direct links to carrier websites for purchase

### Benefits of Carrier API Integration

#### For Users
- **Real-Time Quotes**: Actual prices from multiple carriers instantly
- **Comprehensive Comparison**: Side-by-side comparison with identical coverage
- **Time Savings**: No need to visit multiple carrier websites
- **Accuracy**: Quotes based on exact information provided
- **Best Price Discovery**: Automatically find the lowest rates

#### For Business
- **Lead Quality**: Users with real quotes are more likely to convert
- **Competitive Advantage**: Unique value proposition in the market
- **Revenue Opportunities**: Carrier partnership and referral programs
- **Data Insights**: Understanding of market pricing and trends
- **Scalability**: Automated quote process without manual intervention

### Technical Considerations

#### API Rate Limits
- **GEICO**: 100 requests/minute
- **Progressive**: 50 requests/minute  
- **State Farm**: 200 requests/hour
- **Allstate**: 75 requests/minute

Implement intelligent rate limiting and queuing to optimize throughput.

#### Error Handling
- Network timeouts and retries
- Carrier-specific error codes
- Partial failure handling (some carriers succeed, others fail)
- Graceful degradation to estimates if APIs unavailable

#### Data Privacy & Security
- Encrypt sensitive customer data in transit and at rest
- Comply with carrier data handling requirements
- Implement secure token storage and rotation
- Audit logs for all API interactions

#### Performance Optimization
- Parallel API calls to multiple carriers
- Caching of stable data (vehicle information, coverage options)
- Asynchronous processing for quote requests
- CDN for static carrier assets and logos

## Local Agent Outreach System

### Overview
After completing the automated quote process, offer users the option to connect with local, reputable insurance agents who can provide personalized service, competitive quotes, and ongoing support.

### Architecture Design

#### 1. Agent Directory Structure
```
/lib/agent-directory/
├── core/
│   ├── agent-finder.ts          # Locate agents by ZIP code/location
│   ├── agent-ranker.ts          # Rank agents by reputation/reviews
│   └── email-composer.ts        # Generate personalized emails
├── data/
│   ├── agent-database.ts        # Local agent directory
│   ├── agency-ratings.ts        # Agent ratings and reviews
│   └── specialization-data.ts   # Agent specializations
├── templates/
│   ├── email-templates.ts       # Professional email templates
│   ├── introduction-templates.ts # Agent introduction formats
│   └── quote-request-templates.ts # Quote request structures
└── types/
    ├── agent-types.ts           # Agent profile interfaces
    └── outreach-types.ts        # Email and contact types
```

#### 2. Agent Profile Structure
```typescript
interface LocalAgent {
  // Basic information
  id: string
  name: string
  title: string
  agency: string
  
  // Contact information
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  
  // Professional details
  licenses: string[]              // State licenses held
  certifications: string[]        // Professional certifications
  yearsExperience: number
  specializations: InsuranceType[] // auto, home, life, commercial
  
  // Reputation metrics
  ratings: {
    averageRating: number         // 1-5 stars
    totalReviews: number
    googleRating?: number
    bbbRating?: string           // A+, A, B+, etc.
  }
  
  // Service area
  serviceRadius: number           // Miles from office
  servesZipCodes: string[]
  
  // Business information
  website?: string
  linkedIn?: string
  businessHours: BusinessHours
  languages: string[]             // English, Spanish, etc.
  
  // Performance metrics
  responseTime: number            // Average hours to respond
  clientRetentionRate?: number    // Percentage
  lastUpdated: string
}
```

#### 3. Email Composition System

##### Professional Email Template
```typescript
interface EmailComposition {
  subject: string
  body: string
  attachments?: string[]
  priority: 'normal' | 'high'
  followUpReminder?: number       // Days
}

// Email template generation
export class EmailComposer {
  composeAgentOutreach(
    customerData: CollectedCustomerData,
    quoteResults: CarrierQuoteResults,
    selectedAgent: LocalAgent
  ): EmailComposition {
    
    const subject = `Insurance Quote Request - ${customerData.insuranceType} - ${customerData.location}`
    
    const body = `
Dear ${selectedAgent.name},

I hope this email finds you well. I am currently shopping for ${customerData.insuranceType.toLowerCase()} insurance and am seeking competitive quotes from reputable local agents in the ${customerData.location} area.

CUSTOMER PROFILE:
• Location: ${customerData.location}
• Age: ${customerData.age}
• Insurance Type: ${customerData.insuranceType}
• Coverage Effective Date: ${customerData.effectiveDate || 'ASAP'}

${this.generateInsuranceSpecificDetails(customerData)}

CURRENT MARKET RESEARCH:
I have obtained preliminary quotes through online research:
${this.formatQuoteComparison(quoteResults)}

WHY I'M REACHING OUT TO YOU:
• Your agency has excellent ratings (${selectedAgent.ratings.averageRating}/5 stars)
• ${selectedAgent.yearsExperience} years of experience in the industry
• Specialization in ${selectedAgent.specializations.join(', ')} insurance
• Strong local presence in ${selectedAgent.address.city}, ${selectedAgent.address.state}

WHAT I'M LOOKING FOR:
• Competitive pricing that can beat or match current quotes
• Personalized service and local expertise
• Long-term relationship with a trusted advisor
• Comprehensive coverage review and recommendations

NEXT STEPS:
I would appreciate the opportunity to discuss my insurance needs with you. I am available for a phone consultation at your convenience and can provide additional details as needed.

Please let me know:
1. If you can provide competitive quotes for my situation
2. Your availability for a brief consultation
3. Any additional information you need from me

Thank you for your time and consideration. I look forward to potentially working with you.

Best regards,
[Customer Name]
[Customer Phone]
[Customer Email]

P.S. I am actively comparing quotes and plan to make a decision within the next [timeframe]. I appreciate prompt responses.
    `
    
    return {
      subject,
      body: body.trim(),
      priority: 'normal',
      followUpReminder: 3 // Follow up in 3 days if no response
    }
  }
}
```

##### Insurance-Specific Details Generation
```typescript
private generateInsuranceSpecificDetails(data: CollectedCustomerData): string {
  switch (data.insuranceType.toLowerCase()) {
    case 'auto':
      return `
AUTO INSURANCE DETAILS:
• Drivers: ${data.drivers?.length || 1}
• Vehicles: ${data.vehicles?.map(v => `${v.year} ${v.make} ${v.model}`).join(', ')}
• Current Coverage: ${data.currentCoverage || 'Standard coverage desired'}
• Annual Mileage: ${data.totalMileage || 'Standard commuting'}
• Driving Record: ${data.drivingRecord || 'Clean record'}
• Desired Coverage: Comprehensive protection with competitive rates`

    case 'home':
      return `
HOME INSURANCE DETAILS:
• Property Type: ${data.propertyType || 'Single family home'}
• Home Value: ${data.homeValue || 'To be assessed'}
• Year Built: ${data.yearBuilt || 'To be determined'}
• Square Footage: ${data.squareFootage || 'Standard size'}
• Current Coverage: ${data.currentCoverage || 'Full replacement cost desired'}
• Special Features: ${data.specialFeatures || 'Standard home features'}`

    case 'life':
      return `
LIFE INSURANCE DETAILS:
• Coverage Amount: ${data.coverageAmount || 'To be determined based on needs analysis'}
• Policy Type: ${data.policyType || 'Term life preferred, open to whole life'}
• Health Status: ${data.healthStatus || 'Good health'}
• Beneficiaries: ${data.beneficiaries || 'Family members'}
• Current Coverage: ${data.currentCoverage || 'Limited or no current coverage'}
• Purpose: ${data.purpose || 'Family protection and financial security'}`

    default:
      return `
INSURANCE DETAILS:
• Coverage Type: ${data.insuranceType}
• Specific Needs: ${data.specificNeeds || 'Comprehensive coverage'}
• Current Situation: ${data.currentSituation || 'Seeking new coverage'}
• Budget Considerations: ${data.budget || 'Competitive rates important'}`
  }
}
```

#### 4. Agent Discovery & Ranking

##### Agent Finder Implementation
```typescript
export class AgentFinder {
  async findLocalAgents(
    zipCode: string,
    insuranceType: InsuranceType,
    radius: number = 25
  ): Promise<LocalAgent[]> {
    
    // 1. Query agent database by location
    const nearbyAgents = await this.agentDatabase.findByLocation(zipCode, radius)
    
    // 2. Filter by insurance type specialization
    const specializedAgents = nearbyAgents.filter(agent => 
      agent.specializations.includes(insuranceType) ||
      agent.specializations.includes('all')
    )
    
    // 3. Rank by reputation and performance
    const rankedAgents = await this.agentRanker.rankAgents(
      specializedAgents,
      {
        prioritizeRating: true,
        prioritizeExperience: true,
        prioritizeResponseTime: true,
        prioritizeReviews: true
      }
    )
    
    return rankedAgents.slice(0, 5) // Return top 5 agents
  }
}

export class AgentRanker {
  rankAgents(agents: LocalAgent[], criteria: RankingCriteria): LocalAgent[] {
    return agents
      .map(agent => ({
        ...agent,
        score: this.calculateScore(agent, criteria)
      }))
      .sort((a, b) => b.score - a.score)
  }
  
  private calculateScore(agent: LocalAgent, criteria: RankingCriteria): number {
    let score = 0
    
    // Rating score (40% weight)
    score += (agent.ratings.averageRating / 5) * 40
    
    // Experience score (25% weight)
    score += Math.min(agent.yearsExperience / 20, 1) * 25
    
    // Review count score (20% weight)
    score += Math.min(agent.ratings.totalReviews / 100, 1) * 20
    
    // Response time score (15% weight)
    score += Math.max(0, (48 - agent.responseTime) / 48) * 15
    
    return score
  }
}
```

#### 5. Integration with Quote Flow

##### Final Step Implementation
```typescript
// After quote results are generated
export async function generateAgentOutreach(
  customerData: CollectedCustomerData,
  quoteResults: CarrierQuoteResults
): Promise<AgentOutreachResult> {
  
  // 1. Find local agents
  const localAgents = await agentFinder.findLocalAgents(
    customerData.zipCode,
    customerData.insuranceType
  )
  
  // 2. Select top agent
  const recommendedAgent = localAgents[0]
  
  if (!recommendedAgent) {
    return {
      success: false,
      message: "No local agents found in your area"
    }
  }
  
  // 3. Compose professional email
  const emailComposition = emailComposer.composeAgentOutreach(
    customerData,
    quoteResults,
    recommendedAgent
  )
  
  // 4. Generate agent profile summary
  const agentSummary = {
    name: recommendedAgent.name,
    agency: recommendedAgent.agency,
    rating: recommendedAgent.ratings.averageRating,
    experience: recommendedAgent.yearsExperience,
    specializations: recommendedAgent.specializations,
    contact: {
      phone: recommendedAgent.phone,
      email: recommendedAgent.email,
      address: `${recommendedAgent.address.city}, ${recommendedAgent.address.state}`
    },
    whyRecommended: [
      `${recommendedAgent.ratings.averageRating}/5 star rating with ${recommendedAgent.ratings.totalReviews} reviews`,
      `${recommendedAgent.yearsExperience} years of experience`,
      `Specializes in ${customerData.insuranceType} insurance`,
      `Local presence in ${recommendedAgent.address.city}`,
      `Average response time: ${recommendedAgent.responseTime} hours`
    ]
  }
  
  return {
    success: true,
    recommendedAgent: agentSummary,
    emailComposition,
    alternativeAgents: localAgents.slice(1, 4).map(agent => ({
      name: agent.name,
      agency: agent.agency,
      rating: agent.ratings.averageRating,
      phone: agent.phone,
      email: agent.email
    }))
  }
}
```

### User Interface Integration

#### Final Step UI Component
```typescript
// After quote results display
export function AgentOutreachSection({ 
  customerData, 
  quoteResults 
}: AgentOutreachProps) {
  const [agentOutreach, setAgentOutreach] = useState<AgentOutreachResult | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Connect with a Local Agent
        </CardTitle>
        <CardDescription>
          Get personalized service from a highly-rated local insurance professional
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {agentOutreach?.success && (
          <div className="space-y-4">
            {/* Recommended Agent Profile */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{agentOutreach.recommendedAgent.name}</h4>
                  <p className="text-sm text-muted-foreground">{agentOutreach.recommendedAgent.agency}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < agentOutreach.recommendedAgent.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm">{agentOutreach.recommendedAgent.rating}/5</span>
                    <span className="text-sm text-muted-foreground">
                      • {agentOutreach.recommendedAgent.experience} years experience
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{agentOutreach.recommendedAgent.contact.phone}</p>
                  <p className="text-muted-foreground">{agentOutreach.recommendedAgent.contact.address}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Why we recommend this agent:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {agentOutreach.recommendedAgent.whyRecommended.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Email Preview */}
            <div className="space-y-3">
              <h5 className="font-medium">Personalized Introduction Email:</h5>
              <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-sm space-y-2">
                  <p><strong>To:</strong> {agentOutreach.recommendedAgent.contact.email}</p>
                  <p><strong>Subject:</strong> {agentOutreach.emailComposition.subject}</p>
                  <hr className="my-3" />
                  <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {agentOutreach.emailComposition.body}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => handleSendEmail(agentOutreach.emailComposition)}
                className="flex-1"
                disabled={emailSent}
              >
                {emailSent ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Email Sent
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email to Agent
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(agentOutreach.emailComposition.body)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Email
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.open(`tel:${agentOutreach.recommendedAgent.contact.phone}`)}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
            
            {/* Alternative Agents */}
            {agentOutreach.alternativeAgents && agentOutreach.alternativeAgents.length > 0 && (
              <div className="mt-6">
                <h5 className="font-medium mb-3">Other Recommended Agents:</h5>
                <div className="grid gap-3">
                  {agentOutreach.alternativeAgents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.agency}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{agent.rating}/5</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(`tel:${agent.phone}`)}>
                          Call
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${agent.email}`)}>
                          Email
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <Button 
          onClick={() => generateAgentOutreach(customerData, quoteResults)}
          className="w-full"
          disabled={!!agentOutreach}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Find Local Agent & Generate Introduction
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Benefits of Local Agent Outreach

#### For Users
- **Personal Touch**: Local agents provide face-to-face service and relationship building
- **Expert Guidance**: Professional advice tailored to local market conditions
- **Competitive Quotes**: Agents often have access to exclusive rates and discounts
- **Ongoing Support**: Claims assistance and policy management over time
- **Professional Email**: Well-crafted introduction that gets agent attention

#### For Business
- **Value-Added Service**: Differentiates from generic quote sites
- **Agent Partnerships**: Potential revenue sharing with referring agents
- **Lead Quality**: Users who contact agents are serious buyers
- **Local Market Penetration**: Builds relationships in local insurance markets
- **Customer Satisfaction**: Provides human element to digital process

### Implementation Considerations

#### Data Sources
- **Agent Directories**: Insurance department licensee databases
- **Review Platforms**: Google Reviews, Yelp, Better Business Bureau
- **Professional Networks**: LinkedIn, industry associations
- **Carrier Networks**: Agent finder tools from major carriers

#### Compliance & Quality
- **License Verification**: Ensure agents are properly licensed
- **Review Authenticity**: Verify rating sources and review legitimacy
- **Regular Updates**: Keep agent information current
- **Performance Tracking**: Monitor response rates and customer feedback

## Recent Updates (Week 2 - Latest)

### 🌐 **RAG System & Vectorize.io Integration**
- **Vector Database**: Integrated Vectorize.io for knowledge retrieval
- **Knowledge Datasets**: 6 comprehensive JSON datasets with 120+ entries
- **Official Client**: Using @vectorize-io/vectorize-client library
- **Secure Configuration**: Environment variables for API credentials
- **Data Coverage**: Insurance explanations, terminology, state requirements, discounts, FAQs, negotiation strategies

### 👥 **Customer Profile Management**
- **Persistent Storage**: Profiles saved to localStorage with browser checks
- **Profile UI**: CustomerProfileCard component with edit/view modes
- **Auto-extraction**: extractProfileFromConversation() pulls data from chat
- **Import/Export**: JSON import/export functionality for profiles
- **Profile Completeness**: Visual progress indicator (70% threshold)
- **Chat Integration**: Profiles automatically enrich AI context

### 🚀 **Streaming Chat Implementation**
- **Upgraded to Vercel AI SDK**: Replaced manual OpenAI streaming with `useChat` hook
- **Improved Performance**: Better streaming performance and error handling
- **Cleaner Architecture**: Simplified chat logic with built-in state management
- **Dependencies Added**: `ai` and `@ai-sdk/openai` packages
- **API Route Simplified**: Using `streamText()` and `result.toAIStreamResponse()`

### 🤝 **Local Agent Outreach System**
- Agent discovery and ranking by location and specialization
- Professional email composition with user profile integration
- Direct contact integration (call, email, send introduction)
- Agent profile analysis and reputation scoring

### 📋 **Enhanced Carrier Toolkit**
- Required vs. flexible coverage breakdown
- Professional negotiation scripts and talking points
- Insurance-specific examples (Auto, Home, Life)
- State-specific requirements and mandatory coverage details

### 🎯 **Enhanced AI Rules & Data Collection**
- Minimum quote requirements (5 mandatory fields)
- Targeted initial responses with actionable options
- Comprehensive coverage types support
- Specific next steps instead of vague questions

### 🔧 **Technical Improvements**
- Next.js updated to 14.2.33 (security fixes)
- UI text wrapping fixes for chat bubbles
- Deployment fixes (pnpm/npm lockfile conflicts resolved)
- Branch strategy: `week-2` for new development

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