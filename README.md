# insurance assistant

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/dazzie-7787s-projects/v0-insurance-assistant)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/4bZyCFmRYm9)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/dazzie-7787s-projects/v0-insurance-assistant](https://vercel.com/dazzie-7787s-projects/v0-insurance-assistant)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/4bZyCFmRYm9](https://v0.app/chat/projects/4bZyCFmRYm9)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## OpenAI Integration

This app now supports OpenAI for intelligent insurance coaching responses.

### Setup

1. **Get an OpenAI API key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) to create an API key

2. **Configure your API key**: Update `.env.local` with your key:
   ```
   OPENAI_API_KEY=your-actual-api-key-here
   USE_MOCK_RESPONSES=false
   ```

3. **Test the connection**: Run the test script to verify OpenAI is working:
   ```bash
   node test-openai.js
   ```

### Features

- **Intelligent Responses**: Uses GPT-4 Turbo for personalized insurance coaching
- **Streaming Support**: Real-time streaming responses for better UX
- **Fallback Mode**: Automatically uses mock responses if OpenAI is unavailable
- **Context Awareness**: Maintains conversation context and customer profile

### Configuration Options

- `OPENAI_API_KEY`: Your OpenAI API key (required for AI responses)
- `USE_MOCK_RESPONSES`: Set to `true` to use mock responses instead of OpenAI

### Running the App

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to use the insurance assistant with OpenAI integration.

## Auto Insurance Needs Analysis

The app now includes comprehensive auto insurance needs analysis, similar to quote comparison websites but with expert coaching throughout the process.

### Features

#### 🎯 Progressive Information Gathering
- **Natural conversation flow** - Not a rigid form, but guided discussion
- **Smart parsing** - Recognizes vehicle makes, driver counts, and other details from natural language
- **Educational approach** - Explains why each factor matters for your rates

#### 📊 Information Collected

**Driver Information:**
- Age and years licensed
- Marital status
- Credit score range (affects rates in most states)
- Violations or accidents in past 5 years

**Vehicle Details:**
- Year, make, model, and trim
- Ownership type (own, lease, finance)
- Annual mileage and primary use
- ZIP code where garaged
- Parking location (garage, street, etc.)

**Coverage Preferences:**
- Liability limits (state minimum vs higher)
- Comprehensive/collision with deductibles
- Additional coverage (rental, roadside, gap)

**Insurance History:**
- Current carrier and premium
- Coverage lapses
- Claims in past 5 years

#### 🏆 Smart Features

1. **State-Specific Guidance** - Includes minimum coverage requirements for each state
2. **Quote Readiness Tracking** - Progress indicator showing information completeness
3. **Personalized Recommendations** - Coverage suggestions based on your profile
4. **Rate Impact Education** - Learn how each factor affects your premium

#### 💡 How It Works

1. Select "auto" as your insurance need when starting
2. The assistant guides you through essential information gathering
3. Information is collected conversationally, not through forms
4. Each question includes context about why it matters
5. Once complete, receive personalized carrier recommendations and estimated quotes

### Example Conversation Flow

```
Assistant: "How many vehicles do you need to insure?"
You: "I have 2 cars and 2 drivers"

Assistant: "Perfect! Now let's get details about your vehicles..."
You: "2020 Toyota Camry and 2018 Honda CR-V, both around 10k miles/year"

Assistant: "Great! Now about coverage - let me explain your options..."
[Educational content about coverage levels and how they affect rates]

Assistant: "Based on your profile, I recommend 100/300/100 liability coverage..."
[Personalized recommendations with carrier options and estimated premiums]
```

### Technical Implementation

#### Files Added/Modified

- **`lib/insurance-needs-analysis.ts`** - Data structures and helpers for quote requirements
- **`app/api/chat/route.ts`** - Enhanced prompts for needs analysis
- **`components/chat-interface.tsx`** - Auto insurance-specific greeting
- **`components/formatted-response.tsx`** - Improved markdown formatting
- **`components/quote-progress.tsx`** - Quote readiness tracking component

### Benefits

- **Higher Conversion** - Users understand what's needed upfront
- **Better Quotes** - Complete information leads to accurate estimates  
- **Educational Value** - Users learn about coverage while shopping
- **Trust Building** - Transparency about why information is needed

## Carrier Conversation Toolkit

After completing the needs analysis, the app generates a comprehensive "Carrier Conversation Toolkit" to help users succeed when contacting insurance carriers.

### What's Included

#### 📋 Profile Summary
- Quick reference of all collected information
- Formatted for easy reading during calls
- Copy/paste ready for online forms

#### ❓ Smart Questions to Ask
- Essential pricing and discount questions
- Coverage and claims inquiries
- Service and features questions
- Personalized based on user profile

#### 💪 Negotiation Strategies
- Opening power plays
- Price matching tactics
- Urgency creation techniques
- Supervisor escalation scripts

#### 📄 Documents Checklist
- Required documents for quotes
- Optional helpful paperwork
- Interactive checklist format

#### ✅ Strengths to Emphasize
- Positive factors that lower rates
- Talking points for negotiations
- Profile advantages to highlight

#### 🚩 Red Flags to Watch For
- Warning signs of poor carriers
- Hidden fee indicators
- Coverage gap alerts
- High-pressure sales tactics

### Features

- **Tabbed Interface** - Organized sections for easy navigation
- **Copy to Clipboard** - One-click copying of any section
- **Download Option** - Save complete toolkit as text file
- **Print Friendly** - Formatted for physical reference
- **Mobile Responsive** - Works on phones during calls

### How to Access

1. Complete the needs analysis by providing required information
2. When ready, ask for your "carrier conversation toolkit"
3. Review the comprehensive guide
4. Download or print for reference
5. Use during carrier conversations

### Example Usage

```
You: "I'm ready to call carriers. Can you prepare my toolkit?"
Assistant: [Generates comprehensive toolkit with all sections]
```

The toolkit transforms users from unprepared shoppers into informed negotiators ready to secure the best rates.

## Quote Profile System

The app now features a comprehensive Quote Profile System that tracks all collected information and ensures efficient, non-redundant information gathering.

### Key Features

#### 🎯 Intelligent Information Tracking
- **Real-time profile building** - Automatically extracts information from natural conversation
- **No repeated questions** - Once information is provided, it won't be asked again
- **Smart prompting** - Suggested prompts adapt based on what's already collected
- **Progress visualization** - See exactly how complete your quote profile is

#### 📊 Quote Profile Display
A visual component that shows:
- **Completeness percentage** - Progress bar showing profile completion (0-100%)
- **Information status** - Color-coded indicators for each field:
  - ✅ Green checkmark - Information collected
  - 🟡 Yellow circle - Required information missing
  - ⚪ Gray circle - Optional information missing
- **Section breakdown** - Organized view of vehicles, drivers, coverage, and history
- **Ready for quotes indicator** - Clear signal when sufficient information is gathered

#### 🔄 Dynamic Suggested Prompts
Context-aware prompt suggestions that:
- **Hide completed sections** - No prompts for already-collected information
- **Break down complex info** - Individual prompts for each vehicle/driver
- **Option-based choices** - Quick-select buttons for common responses
- **Priority ordering** - Most important missing info prompted first

### Information Categories

#### Basic Information
- Number of vehicles
- Number of drivers  
- ZIP code
- State

#### Vehicle Details (per vehicle)
- Year, make, model, trim
- Annual mileage
- Primary use (commute/pleasure/business)
- Parking location
- Safety features

#### Driver Details (per driver)
- Age
- Years licensed
- Marital status
- Driving record/violations
- Occupation
- Education level

#### Coverage Preferences
- Current carrier
- Current premium
- Desired coverage level
- Deductible preferences
- Additional coverage needs

#### Insurance History
- Currently insured status
- Coverage lapses
- Years with current carrier
- Claims history

### How It Works

1. **Information Extraction** - Natural language processing extracts details from conversation
2. **Profile Building** - Collected information is structured into a comprehensive profile
3. **Completeness Calculation** - System determines what's required vs optional
4. **Smart Prompting** - Next prompts generated based on missing information
5. **Visual Feedback** - Profile display shows progress and what's needed

### Technical Implementation

#### Core Files

- **`lib/quote-profile.ts`** - Quote profile management and completeness tracking
  - `buildQuoteProfile()` - Constructs profile from conversation
  - `calculateCompleteness()` - Determines readiness percentage
  - `getPromptsForMissingInfo()` - Generates targeted prompts
  
- **`lib/information-tracker.ts`** - Natural language information extraction
  - `extractCollectedInfo()` - Parses messages for insurance details
  - `getMissingInfo()` - Identifies gaps in collected data
  - `getNextInfoToCollect()` - Prioritizes collection order

- **`components/quote-profile-display.tsx`** - Visual profile component
  - Progress bar with completion percentage
  - Sectioned display of all collected information
  - Color-coded status indicators
  - Ready-for-quotes status

- **`lib/suggested-prompts.ts`** - Dynamic prompt generation
  - Context-aware suggestions
  - Removes prompts for collected info
  - Provides option-based choices

### Example Flow

```
Initial State:
- Profile: 0% complete
- Prompts: "1 vehicle", "2 vehicles", "3+ vehicles"

User: "I have 2 cars"
- Profile: 10% complete ✅ Number of vehicles: 2
- Prompts: "How many drivers?", "Just me", "2 drivers"

User: "Just me driving both"
- Profile: 20% complete ✅ Number of drivers: 1
- Prompts: "What year is vehicle 1?", "2024 (brand new)", "2020-2023"

User: "2020 Toyota Camry and 2018 Honda CR-V"
- Profile: 40% complete ✅ Vehicles identified
- Prompts: "How old are you?", "Annual mileage for Camry?"

[Continues until 100% complete]
```

### Benefits

#### For Users
- **No redundant questions** - Efficient information gathering
- **Clear progress tracking** - Know exactly what's needed
- **Faster quote process** - Get to quotes quicker
- **Better user experience** - Natural conversation flow

#### For Business
- **Higher completion rates** - Users see progress and continue
- **Better data quality** - Structured information collection
- **Reduced drop-off** - Clear path to completion
- **Improved conversions** - Users reach quote stage faster

### API Integration

The system integrates with the chat API to:
- Include profile status in system prompts
- Inform AI of collected information
- Focus responses on missing details
- Trigger toolkit generation when complete

This Quote Profile System ensures users have a smooth, efficient experience getting insurance quotes without answering the same questions multiple times.