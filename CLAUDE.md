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

## Debug Tips
- Check browser console for API errors
- Verify `.env.local` has valid OpenAI key
- Use `USE_MOCK_RESPONSES=true` for testing without API
- Check Next.js terminal output for server-side errors