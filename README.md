# Personal Insurance Coverage Coach

*AI-powered insurance coaching, quote comparison, and local agent connection assistant*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/dazzie-7787s-projects/v0-insurance-assistant)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/4bZyCFmRYm9)

## Overview

A comprehensive insurance assistant that transforms how users approach insurance shopping. Unlike traditional quote forms, this app provides **personalized coaching**, **educational insights**, **carrier negotiation preparation**, and **local agent connections** through natural conversation.

**Current Coverage**: Auto, Home, Life, Renters, Pet Insurance (all types supported)  
**Latest Enhancements**: Local agent outreach system, enhanced carrier toolkit with coverage requirements, rating engine architecture

## ✨ What Makes This Different

- **🎯 Personal Coach**: Not just quotes - comprehensive insurance guidance
- **🤝 Local Agent Connection**: Find and connect with top-rated local agents
- **💼 Professional Toolkit**: Carrier conversation scripts and negotiation strategies
- **📊 Coverage Analysis**: Required vs. flexible coverage breakdown
- **🔄 Complete Journey**: From education to quotes to agent relationships

## Key Features

### 🤖 OpenAI GPT-4 Integration
- **Intelligent responses** using GPT-4 Turbo for personalized insurance coaching
- **Streaming support** for real-time conversational experience
- **Context awareness** maintains conversation history and customer profile
- **Fallback mode** automatically uses mock responses if OpenAI is unavailable

### 🚗 Auto Insurance Quote System
- **Progressive information gathering** - One question at a time, never overwhelming
- **Smart information extraction** - Recognizes details from natural language
- **No repeated questions** - Tracks what's collected, never asks twice
- **Customer profile integration** - Uses provided age/location automatically
- **Step-by-step with options** - Every question includes numbered choices for easy response
- **Instant premium estimates** - Shows monthly costs immediately after basic info collected
- **Memory persistence** - Never forgets information mentioned in conversation

### 📊 Quote Profile Management
- **Real-time progress tracking** - Visual progress bar (0-100% complete)
- **Section-by-section collection** - Organized flow: drivers → vehicles → coverage
- **Color-coded status indicators**:
  - ✅ Green - Information collected
  - 🟡 Yellow - Required field missing
  - ⚪ Gray - Optional field missing
- **Completeness scoring** - Know exactly when ready for quotes

### 💡 Enhanced User Experience
- **Predefined answer options** - Every question includes numbered choices (1, 2, 3, etc.)
- **Instant premium estimates** - Shows "$X-Y/month" immediately after basic info
- **Smart memory** - Remembers everything, never asks twice
- **Progress summaries** - "I have: X, Y, Z. Now I need: A"
- **Coverage tier comparison** - Shows minimum vs standard vs full coverage costs

### 📋 Enhanced Carrier Conversation Toolkit
Generated after information collection, includes:
- **Profile summary** - All information formatted for easy reference
- **REQUIRED vs FLEXIBLE Coverage Breakdown** - Critical negotiation guide
- **Smart questions** - What to ask each carrier
- **Negotiation strategies** - Scripts for better rates
- **Document checklist** - What you'll need ready
- **Strengths to emphasize** - Your rate-lowering advantages
- **Red flags** - Warning signs to watch for

### 🤝 Local Agent Outreach System
Connect with top-rated local insurance professionals:
- **Agent Discovery** - Find agents by location and specialization
- **Reputation Ranking** - Scored by ratings, experience, and response time
- **Professional Email Composition** - Personalized introduction emails
- **Agent Profile Analysis** - Why each agent is recommended
- **Direct Contact Options** - Call, email, or send introduction immediately

### 🏗️ Future Enhancements
- **Rating Engine** - Real-time premium calculations with carrier algorithms
- **Carrier API Integration** - Automated quote requests to carrier APIs
- **Advanced Analytics** - Market trends and pricing insights

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (for AI responses)
- Vectorize.io account (for RAG features)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd v0-insurance-assistant
   npm install
   ```

2. **Configure environment**
   Create `.env.local`:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your-actual-api-key-here
   USE_MOCK_RESPONSES=false

   # Vectorize.io Configuration (for RAG)
   VECTORIZE_IO_API_KEY=your-vectorize-token
   VECTORIZE_IO_ORG_ID=your-org-id
   VECTORIZE_IO_PIPELINE_ID=your-pipeline-id
   TOKEN=your-vectorize-token  # Alternative env var name

   # RAG System
   ENABLE_RAG=true
   ```

3. **Test OpenAI connection**
   ```bash
   node test-openai.js
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```
   *Note: If port 3000 is in use, Next.js will automatically use port 3001*

5. **Access the app**
   Open `http://localhost:3000` (or `http://localhost:3001` if port 3000 is busy)

## How It Works

### Information Collection Flow

1. **Initial Setup**
   - User provides age and location
   - Selects insurance type (auto, home, life)
   - System uses saved profile data automatically

2. **Step-by-Step Collection with Options**
   ```
   Example Auto Insurance Flow:

   Q: "How many drivers will be on this policy?"
   1) Just me
   2) 2 drivers
   3) 3 drivers
   4) 4+ drivers

   Q: "What's your marital status?"
   1) Single
   2) Married
   3) Divorced
   4) Widowed

   Q: "Annual mileage for this vehicle?"
   1) Under 7,500 (low mileage discount)
   2) 7,500-12,000 (average)
   3) 12,000-15,000
   4) Over 15,000
   ```

3. **Smart Memory & Validation**
   - Never asks for information already provided
   - Remembers details mentioned in passing
   - Acknowledges what's already known
   - Shows progress: "I have: X, Y, Z. Now I need: A"

4. **Instant Premium Estimates**
   ```
   After basic info collected:

   ESTIMATED PREMIUM RANGE: $1,200-1,800/year ($100-150/month)
   - State minimum coverage: ~$75/month
   - Standard coverage: ~$125/month
   - Full coverage: ~$175/month

   Top carriers for your profile:
   - GEICO: $95-120/month
   - State Farm: $105-130/month
   - Progressive: $100-125/month
   ```

### Technical Architecture

#### Core Systems

**Information Tracking** (`lib/information-tracker.ts`)
- Extracts data from natural language
- Prioritizes collection order
- Prevents redundant questions
- Auto-fills from customer profile

**Quote Profile** (`lib/quote-profile.ts`)
- Builds comprehensive profile
- Calculates completeness
- Generates missing field prompts
- Tracks readiness for quotes

**Prompt Validation** (`lib/prompt-validator.ts`)
- Validates prompts match questions
- 75% confidence requirement
- Question-prompt mapping
- Fallback to no prompts

**Dynamic Prompts** (`lib/suggested-prompts.ts`)
- Context-aware generation
- Removes collected information
- Adapts to conversation state
- Post-quote action prompts

#### Key Components

- `components/chat-interface.tsx` - Main chat UI
- `components/quote-profile-display.tsx` - Progress visualization
- `components/suggested-prompts.tsx` - Dynamic prompt buttons
- `app/api/chat/route.ts` - OpenAI integration & prompting

### Information Extraction Examples (Enhanced Real-Time)

```javascript
// Basic Information
"I'm 35 years old" →
  age: 35 (✓ SAVED PERMANENTLY)

"My ZIP is 94105" →
  zipCode: 94105 (✓ SAVED)

// Vehicle Information
"I have a 2020 Toyota Camry" →
  vehicles: [{year: 2020, make: "Toyota", model: "Camry"}] (✓ SAVED)

// Driver Information
"Just me driving" →
  driversCount: 1, age: [from saved profile]

"I'm married with 2 drivers" →
  maritalStatus: "married", driversCount: 2 (✓ SAVED)

// Home Insurance
"I own a single family home worth $400k" →
  homeType: "single-family", homeValue: "400000", homeOwnership: "own" (✓ SAVED)

// Life Insurance
"I need $500k coverage, non-smoker" →
  coverageAmount: "500000", smoker: false (✓ SAVED)

// Contact Information
"Call me at 415-555-1234" →
  phone: "415-555-1234" (✓ SAVED)

"My email is john@example.com" →
  email: "john@example.com" (✓ SAVED)
```

### Real-Time Profile Data Storage

The system automatically saves the following information as it's mentioned:

**Personal Information:**
- Name, age, email, phone
- Marital status, gender
- Occupation

**Location Data:**
- City, state, ZIP code
- Full address

**Auto Insurance:**
- Number of drivers and vehicles
- Vehicle details (year, make, model, mileage)
- Driver details (age, violations, accidents)

**Home Insurance:**
- Home type and value
- Year built, square footage
- Ownership status

**Life Insurance:**
- Coverage amount desired
- Health status, smoker status
- Insurance type preference

## Recent Major Updates (Week 2 - Latest)

### 🔄 Real-Time Profile Updates (NEW)
1. **Automatic Data Capture** - Extracts information from conversation in real-time
2. **Persistent Storage** - Profile saves after every message to localStorage
3. **Smart Recognition** - Detects age, vehicles, marital status, ZIP codes automatically
4. **Never Forgets** - Information mentioned once is saved forever
5. **Visual Confirmation** - Shows saved data with checkmarks (✓ SAVED)

### 💰 Premium Estimates & Monthly Costs
1. **Auto Insurance** - Shows state minimum, standard, and full coverage monthly costs
2. **Home Insurance** - Displays basic, standard, and premium coverage monthly rates
3. **Life Insurance** - Provides term (20yr, 30yr) and whole life monthly premiums
4. **Instant Estimates** - Premium ranges shown immediately after basic data collection
5. **Carrier-Specific** - Lists top carriers with their estimated monthly costs

### 🎯 Step-by-Step Needs Analysis
1. **One Question at a Time** - Never overwhelming users with multiple questions
2. **Numbered Options** - Every question includes choices (1, 2, 3, etc.) for quick response
3. **Smart Memory** - Never asks for information already provided or mentioned
4. **Progress Tracking** - Shows what's collected and what's still needed
5. **Milestone Summaries** - Provides summary with estimates at key collection points

## Recent Major Updates (Week 2)

### 🎯 Enhanced AI Rules & Data Collection
1. **Minimum Quote Requirements** - Clear 5-field mandatory collection
2. **Targeted Initial Responses** - Direct, actionable numbered options
3. **Specific Next Steps** - No more vague questions, always provide concrete choices
4. **Comprehensive Coverage Types** - Auto, Home, Life, Renters, Pet insurance support

### 🤝 Local Agent Outreach System  
1. **Agent Discovery** - Find top-rated local agents by location and specialization
2. **Professional Email Generation** - Personalized introduction emails with user specifics
3. **Reputation Scoring** - Rank agents by ratings, experience, and response time
4. **Direct Contact Integration** - Call, email, or send introduction immediately

### 📋 Enhanced Carrier Toolkit
1. **Coverage Requirements Analysis** - Required vs. flexible coverage breakdown
2. **Negotiation Scripts** - Professional conversation starters and questions
3. **Insurance-Specific Examples** - Tailored for Auto, Home, Life insurance
4. **State-Specific Requirements** - Minimum liability and mandatory coverage details

### 🔧 Technical Improvements
1. **UI Text Wrapping** - Fixed chat bubble overflow issues
2. **Security Updates** - Next.js updated to 14.2.33 (critical vulnerabilities resolved)
3. **Deployment Fixes** - Resolved pnpm/npm lockfile conflicts
4. **Branch Strategy** - Using `week-2` branch for new development
5. **Customer Profile System** - Persistent profile storage with localStorage
6. **RAG Integration** - Vectorize.io integration for knowledge retrieval

## Best Practices

### For Users
- Answer one question at a time
- Provide accurate information for better quotes
- Review the complete toolkit before calling carriers
- Use suggested prompts for faster input

### For Developers
- Always validate prompts against questions
- Maintain 75% confidence threshold
- Test information extraction thoroughly
- Keep collection order logical

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `USE_MOCK_RESPONSES` | Use mock responses instead of OpenAI | `false` |

## Testing

```bash
# Test OpenAI connection
node test-openai.js

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Deployment

The app auto-deploys to Vercel on push to main branch.

**Live URL**: [https://vercel.com/dazzie-7787s-projects/v0-insurance-assistant](https://vercel.com/dazzie-7787s-projects/v0-insurance-assistant)

### Development Workflow
- **Main Branch**: Production-ready code
- **Week-2 Branch**: Current development branch for new features
- **Local Development**: Runs on `localhost:3000` (or `:3001` if port busy)

## RAG System & Vectorize.io Integration

### Overview
The assistant uses Retrieval-Augmented Generation (RAG) with Vectorize.io for enhanced knowledge retrieval, providing more accurate and contextual insurance information.

### Vectorize.io Data Sets
The following datasets are available in `/data/vectorize-upload/` for upload to your Vectorize pipeline:

#### Core Knowledge Base (6 files)
1. **insurance-coverage-explanations.json** (23KB) - 20 detailed coverage type explanations
2. **insurance-terminology-glossary.json** (23KB) - 20 essential insurance terms
3. **state-insurance-requirements.json** (26KB) - State-by-state requirements for 20 major states
4. **insurance-discounts-guide.json** (29KB) - 20 discount types with qualification criteria
5. **insurance-faqs.json** (28KB) - 20 comprehensive Q&As
6. **negotiation-strategies.json** (30KB) - 20 negotiation tactics and scripts

#### Carrier & Market Intelligence (4 files)
7. **insurance-carrier-profiles.json** - 15 major carrier detailed profiles
8. **carrier-coverage-options.json** - 15 carrier-specific coverage options and features
9. **preferred-agents-directory.json** - 20 agent selection and evaluation guides
10. **insurance-claim-process.json** - 15 step-by-step claim process guides

#### Customer Guidance & Optimization (4 files)
11. **customer-scenarios-lifecycles.json** - 15 life events, age-based, and occupation scenarios
12. **risk-factors-pricing.json** - 15 pricing factors and regional market data
13. **insurance-troubleshooting.json** - 15 problem-solving guides and red flags
14. **insurance-money-saving-tips.json** - 15 comprehensive savings strategies

**Total: 14 files, 235+ entries, 356KB of structured insurance knowledge**

### Setting Up Vectorize.io
1. Create account at [platform.vectorize.io](https://platform.vectorize.io)
2. Create a new pipeline with:
   - Extractor: Vectorize Built-in
   - Chunker: Vectorize Built-in
   - Embedder: OpenAI v3 small (1536 dimensions)
3. Upload JSON files through the admin UI
4. Copy your credentials to `.env.local`
5. The pipeline will automatically chunk and vectorize content

### Customer Profile Management
The app includes a comprehensive customer profile system:
- **Persistent Storage**: Profiles saved to localStorage
- **Auto-extraction**: Profile data extracted from conversations
- **Profile Completeness**: Visual indicator showing profile completion percentage
- **Import/Export**: JSON import/export functionality
- **Profile Integration**: Automatically enriches chat context

### Profile Fields
- Personal: Name, email, phone, age, gender
- Location: Address, city, state, ZIP code
- Insurance: Type, current insurer, premium
- Demographics: Marital status, home ownership, occupation
- Additional: Credit range, driver/vehicle counts

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

[License information]

## Support

For issues or questions:
- GitHub Issues: [repository-issues-url]
- Documentation: This README
- v0.app Project: [https://v0.app/chat/projects/4bZyCFmRYm9](https://v0.app/chat/projects/4bZyCFmRYm9)