# Insurance Assistant - Project Context for Claude Code

## Project Overview
AI-powered insurance coaching and quote comparison assistant built with Next.js, TypeScript, and OpenAI GPT-4. The app helps users navigate insurance quotes through natural conversation, with an initial focus on auto insurance.

## Tech Stack
- **Framework**: Next.js 14.2.16 with TypeScript
- **UI Components**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-4 Turbo (streaming support)
- **State Management**: React hooks and context
- **Form Handling**: react-hook-form with Zod validation
- **Deployment**: Vercel

## Key Commands
```bash
# Development
npm run dev          # Start development server on localhost:3000

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
  information-tracker.ts         # Extracts data from messages
  insurance-needs-analysis.ts    # Analyzes insurance needs
  prompt-validator.ts            # Validates prompt-question matches
  quote-profile.ts              # Manages quote profile data
  suggested-prompts.ts          # Generates context-aware prompts
  utils.ts                      # Utility functions
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
- Offer carrier conversation toolkit
- Provide next steps for actual policy purchase

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
OPENAI_API_KEY=<required>      # OpenAI API key for GPT-4
USE_MOCK_RESPONSES=false       # Set to true for testing without API
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

## Debug Tips
- Check browser console for API errors
- Verify `.env.local` has valid OpenAI key
- Use `USE_MOCK_RESPONSES=true` for testing without API
- Check Next.js terminal output for server-side errors