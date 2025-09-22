# Insurance Assistant

*AI-powered insurance coaching and quote comparison assistant*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/dazzie-7787s-projects/v0-insurance-assistant)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/4bZyCFmRYm9)

## Overview

An intelligent insurance assistant that helps users navigate auto insurance quotes through natural conversation. Unlike traditional quote forms, this app provides personalized coaching, educational insights, and prepares users for successful carrier negotiations.

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

### 📋 Carrier Conversation Toolkit
Generated after information collection, includes:
- **Profile summary** - All information formatted for easy reference
- **Smart questions** - What to ask each carrier
- **Negotiation strategies** - Scripts for better rates
- **Document checklist** - What you'll need ready
- **Strengths to emphasize** - Your rate-lowering advantages
- **Red flags** - Warning signs to watch for

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

5. **Access the app**
   Open `http://localhost:3000`

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

## Key Improvements

### Recent Updates

1. **Fixed prompt-question mismatches**
   - Years licensed now shows correct options
   - Vehicle year shows years, not ages
   - Model prompts adapt to selected make

2. **Enhanced collection order**
   - Drivers → Vehicles → Coverage
   - Required fields before optional
   - Logical progression

3. **Confidence-based prompting**
   - No prompts when uncertain
   - Validation before display
   - Better than wrong suggestions

4. **Profile age integration**
   - Single drivers use profile age
   - No redundant age questions
   - Automatic field population

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