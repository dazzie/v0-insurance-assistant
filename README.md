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

### 📊 Quote Profile Management
- **Real-time progress tracking** - Visual progress bar (0-100% complete)
- **Section-by-section collection** - Organized flow: drivers → vehicles → coverage
- **Color-coded status indicators**:
  - ✅ Green - Information collected
  - 🟡 Yellow - Required field missing
  - ⚪ Gray - Optional field missing
- **Completeness scoring** - Know exactly when ready for quotes

### 💡 Dynamic Suggested Prompts
- **Context-aware suggestions** - Prompts match the current question exactly
- **Confidence-based validation** - Only shows prompts when 75%+ confident
- **No wrong options** - Validates prompts match questions before displaying
- **Automatic cleanup** - Hides prompts for already-collected information

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
   OPENAI_API_KEY=your-actual-api-key-here
   USE_MOCK_RESPONSES=false
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
   - Selects "auto" insurance need
   - System uses profile for single drivers

2. **Progressive Gathering**
   ```
   Required Information (collected first):
   - Number of drivers/vehicles
   - ZIP code  
   - Vehicle year, make, model
   - Driver ages (auto-filled for single driver)
   
   Optional Information (improves quotes):
   - Years licensed
   - Marital status
   - Driving record
   - Annual mileage
   - Primary use
   ```

3. **Smart Validation**
   - Prompts validated against current question
   - 75% confidence threshold required
   - Falls back to no prompts if uncertain

4. **Quote Generation**
   - Only after all required fields collected
   - Plus 2-3 optional fields for accuracy
   - Comprehensive analysis with carrier recommendations

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

### Information Extraction Examples

```javascript
"I have a 2020 Toyota Camry" → 
  year: 2020, make: toyota, model: Camry

"Just me driving" → 
  numberOfDrivers: 1, age: [from profile]

"Tesla Model 3" → 
  make: tesla, model: Model 3

"About 10,000 miles per year" → 
  annualMileage: 10000
```

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