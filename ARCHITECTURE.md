# 🏗️ Application Architecture

## Overview
This is an **AI-powered insurance assistant** built with Next.js 14, featuring autonomous agents, MCP (Model Context Protocol) enrichment servers, and real-time policy analysis.

---

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 14)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Landing    │  │   Coverage   │  │     Chat     │          │
│  │     Page     │→ │   Analyzer   │→ │  Interface   │          │
│  │  (app/page)  │  │  (Camera/    │  │ (Conversational│        │
│  │              │  │   Upload)    │  │    Agent)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                  ↓                  ↓                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         Customer Profile Manager (localStorage)       │       │
│  │  - Vehicle data (NHTSA enriched)                     │       │
│  │  - Address data (OpenCage enriched)                  │       │
│  │  - Email data (Hunter.io enriched)                   │       │
│  │  - Policy data (GPT-4o Vision extracted)             │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ /api/chat    │  │ /api/analyze │  │ /api/fetch   │          │
│  │              │  │  -coverage   │  │  -quotes     │          │
│  │ GPT-4o       │  │              │  │              │          │
│  │ Conversation │  │ GPT-4o Vision│  │ Insurify API │          │
│  │ + Agents     │  │ + MCP        │  │ (Mock)       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                  ↓                                     │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              AGENTIC LAYER                            │       │
│  │  ┌────────────────────────────────────────────┐      │       │
│  │  │  Policy Analyzer Agent (Autonomous)        │      │       │
│  │  │  - State requirements validation           │      │       │
│  │  │  - Gap detection (50 states + DC)          │      │       │
│  │  │  - Health score calculation                │      │       │
│  │  │  - Evidence-based recommendations          │      │       │
│  │  └────────────────────────────────────────────┘      │       │
│  │  ┌────────────────────────────────────────────┐      │       │
│  │  │  Conversation Agent (GPT-4o)               │      │       │
│  │  │  - Information extraction                  │      │       │
│  │  │  - Context-aware questioning               │      │       │
│  │  │  - Profile building                        │      │       │
│  │  └────────────────────────────────────────────┘      │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MCP ENRICHMENT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   NHTSA      │  │  OpenCage    │  │  Hunter.io   │          │
│  │ VIN Decoder  │  │  Geocoding   │  │    Email     │          │
│  │              │  │              │  │ Verification │          │
│  │ (Free API)   │  │ (Free tier)  │  │ (Free tier)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                  ↓                  ↓                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         MCP Server Process Manager                    │       │
│  │  - Spawns child processes for each MCP server        │       │
│  │  - JSON-RPC communication                            │       │
│  │  - Error handling & retries                          │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA & KNOWLEDGE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐       │
│  │  State Requirements Database (51 jurisdictions)       │       │
│  │  - All 50 US states + DC                             │       │
│  │  - Liability minimums                                │       │
│  │  - PIP/UM requirements                               │       │
│  │  - Official government sources                       │       │
│  └──────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Carrier Database (Mock - 8 carriers)                │       │
│  │  - Coverage types                                    │       │
│  │  - Pricing models                                    │       │
│  │  - Ratings (A.M. Best, Moody's, S&P)                │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Core Components

### 1. **Frontend Components** (`/components`)

#### **Main Pages:**
- **`app/page.tsx`** - Landing page with form and coverage analyzer
- **`chat-interface.tsx`** - Conversational AI interface
- **`coverage-analyzer.tsx`** - Policy upload/scan with camera support

#### **Profile Management:**
- **`customer-profile-form.tsx`** - Profile data entry
- **`profile-summary-card.tsx`** - Display enriched profile with badges
- **`customer-profile-card.tsx`** - Compact profile view

#### **Policy Analysis:**
- **`policy-health-card.tsx`** - Autonomous policy health score display
- **`quote-results.tsx`** - Insurance quote comparison
- **`insurance-summary-comparison.tsx`** - Carrier comparison table

#### **UI Components** (`/components/ui`):
- Radix UI primitives: Button, Card, Input, Textarea, Badge, Dialog, Alert, Tabs, ScrollArea, Select, Progress

---

### 2. **API Routes** (`/app/api`)

#### **`/api/chat` (POST)**
**Purpose**: Main conversational AI endpoint  
**Features**:
- GPT-4o powered conversation
- Real-time profile extraction
- Context-aware questioning
- Hunter.io email verification trigger
- Information tracking

**Flow**:
```
User Message → GPT-4o → Extract Profile Data → 
Update localStorage → Check for Email → Verify with Hunter.io → 
Return AI Response
```

**Key Functions**:
- `generateSystemPrompt()` - Dynamic prompt based on profile state
- `extractProfileFromConversation()` - Parse user responses
- `verifyEmail()` - Trigger Hunter.io MCP server

---

#### **`/api/analyze-coverage` (POST)**
**Purpose**: Extract and enrich policy data from images/PDFs  
**Features**:
- GPT-4o Vision for OCR
- NHTSA VIN decoding
- OpenCage address geocoding
- Autonomous policy analysis

**Flow**:
```
Upload Image/PDF → GPT-4o Vision (Extract Text) → 
Parse JSON → Enrich Vehicles (NHTSA) → 
Enrich Address (OpenCage) → Run Policy Analyzer → 
Return Coverage + Analysis
```

**Key Functions**:
- `enrichVehicleData()` - Call NHTSA MCP server
- `enrichAddressData()` - Call OpenCage MCP server
- `analyzePolicy()` - Run autonomous policy analyzer

---

#### **`/api/fetch-quotes` (POST)**
**Purpose**: Fetch insurance quotes from carriers  
**Status**: Mock implementation (Insurify API integration pending)

**Flow**:
```
Profile Data → Generate Mock Quotes → 
Calculate Premiums → Return Carrier Comparisons
```

---

### 3. **MCP Servers** (`/mcp-server`)

MCP (Model Context Protocol) servers are **standalone Node.js processes** that provide data enrichment services via JSON-RPC.

#### **NHTSA VIN Decoder** (`/mcp-server/nhtsa-server`)
**Purpose**: Decode Vehicle Identification Numbers  
**API**: NHTSA vPIC API (Free, no key required)  
**Tool**: `decode_vin`

**Input**:
```json
{
  "vin": "5YJSA1E14FF087599"
}
```

**Output**:
```json
{
  "success": true,
  "year": 2015,
  "make": "TESLA",
  "model": "Model S",
  "bodyClass": "Hatchback/Liftback/Notchback",
  "fuelType": "Electric",
  "doors": 5,
  "manufacturer": "TESLA, INC.",
  "plantCity": "FREMONT",
  "plantState": "CALIFORNIA",
  "vehicleType": "PASSENGER CAR"
}
```

**Usage in App**:
- Triggered during policy scan
- Enriches vehicle data with official NHTSA records
- Displays "✓ NHTSA Verified" badge in profile

---

#### **OpenCage Geocoding** (`/mcp-server/opencage-server`)
**Purpose**: Validate and standardize addresses  
**API**: OpenCage Geocoding API (Free tier: 2,500 requests/day)  
**Tool**: `geocode_address`

**Input**:
```json
{
  "address": "1847 14th Avenue, Apt 3, San Francisco, CA 94122-3045, USA"
}
```

**Output**:
```json
{
  "success": true,
  "formatted": "1847 14th Avenue, San Francisco, CA 94122, United States of America",
  "street": "1847 14th Avenue",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94122",
  "latitude": 37.7534856,
  "longitude": -122.4713827,
  "confidence": 10
}
```

**Usage in App**:
- Triggered during policy scan
- Validates and standardizes customer address
- Displays "✓ OpenCage Verified" badge in profile
- Provides lat/long for risk assessment (future)

---

#### **Hunter.io Email Verification** (`/mcp-server/hunter-server`)
**Purpose**: Verify email addresses  
**API**: Hunter.io Email Verifier API (Free tier: 50 requests/month)  
**Tool**: `verify_email`

**Input**:
```json
{
  "email": "kenneth.crann@example.com"
}
```

**Output**:
```json
{
  "success": true,
  "status": "valid",
  "score": 85,
  "risk": "low",
  "disposable": false,
  "acceptAll": false
}
```

**Usage in App**:
- Triggered when email is extracted from conversation
- Verifies email deliverability
- Displays color-coded "✓ Hunter.io Verified" badge (green/yellow/red)

---

#### **First Street Foundation (Flood Risk)** (`/mcp-server/firststreet-server`)
**Purpose**: Assess flood risk for property addresses  
**API**: First Street Foundation API (Free tier available)  
**Tool**: `assess_flood_risk`  
**Status**: Implemented but not yet integrated into UI

---

### 4. **Agentic Layer** (`/lib`)

#### **Policy Analyzer Agent** (`/lib/policy-analyzer.ts`)
**Type**: Autonomous Agent  
**Purpose**: Analyze insurance policies for gaps and compliance issues

**Capabilities**:
1. **Autonomous Multi-Step Reasoning**:
   - Compares policy against state minimums
   - Checks industry recommendations
   - Evaluates vehicle value vs. deductibles
   - Calculates health score (0-100)

2. **Tool Use**:
   - Accesses state requirements database (51 jurisdictions)
   - Uses NHTSA vehicle data for value estimation
   - Applies depreciation models

3. **Goal-Driven Optimization**:
   - Prioritizes critical gaps (below state minimums)
   - Suggests cost-effective improvements
   - Estimates potential savings

4. **Evidence-Based Reasoning**:
   - Cites official state sources
   - References industry standards (Consumer Reports, III)
   - Provides risk assessments

**Output**:
```typescript
{
  healthScore: 85,
  gaps: [
    {
      id: 'recommended_liability',
      type: 'warning',
      category: 'protection',
      title: 'Below Recommended Liability Coverage',
      message: 'Your liability is 25/50/25, experts recommend 100/300/100',
      reasoning: 'Medical costs can easily exceed state minimums...',
      recommendation: 'Increase to 100/300/100 (+$15-30/month)',
      source: 'Consumer Reports (2024)'
    }
  ],
  summary: 'Good coverage with 1 recommendations for improvement.',
  citations: ['Consumer Reports (2024)', 'California DOI'],
  analyzedAt: '2025-10-13T06:11:58.564Z'
}
```

---

#### **Conversation Agent** (`/app/api/chat/route.ts`)
**Type**: Conversational Agent (GPT-4o)  
**Purpose**: Guide users through insurance research process

**Capabilities**:
1. **Information Extraction**:
   - Parses user responses for profile data
   - Extracts vehicles, drivers, coverage needs
   - Identifies addresses, emails, phone numbers

2. **Context-Aware Questioning**:
   - Adapts questions based on collected data
   - Skips redundant questions (e.g., year if VIN decoded)
   - Prioritizes missing critical information

3. **Profile Building**:
   - Incrementally builds customer profile
   - Preserves enriched data (NHTSA, OpenCage, Hunter.io)
   - Validates completeness before quote generation

4. **Smart Merge Logic**:
   - Protects enriched fields from being overwritten
   - Allows editable fields (mileage, primary use)
   - Maintains data integrity across conversation

**System Prompt Highlights**:
```
You are an insurance research assistant...

CRITICAL: The following data is LOCKED and verified:
- Vehicles: [enriched by NHTSA]
- Address: [enriched by OpenCage]

DO NOT ask for:
- Vehicle year/make/model (already have VIN data)
- Full address (already verified)

DO ask for:
- Primary vehicle use
- Annual mileage
- Driver details (age, violations)
```

---

### 5. **Data Management** (`/lib`)

#### **Customer Profile Manager** (`/lib/customer-profile.ts`)
**Purpose**: Centralized profile state management

**Key Features**:
- **localStorage persistence** (session-based)
- **Smart merge logic** (protects enriched data)
- **Completeness calculation** (70% threshold)
- **Event-driven updates** (CustomEvent API)

**Profile Structure**:
```typescript
interface CustomerProfile {
  // Basic Info
  customerName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  
  // Address (OpenCage enriched)
  address?: string
  city?: string
  state?: string
  zipCode?: string
  location?: string
  addressEnrichment?: {
    enriched: boolean
    enrichmentSource: 'OpenCage'
    formattedAddress: string
    latitude: number
    longitude: number
    confidence: number
  }
  
  // Vehicles (NHTSA enriched)
  vehiclesCount?: number
  vehicles?: Array<{
    year: number
    make: string
    model: string
    vin?: string
    primaryUse?: string
    annualMileage?: number
    // NHTSA enriched fields
    bodyClass?: string
    fuelType?: string
    doors?: number
    manufacturer?: string
    plantCity?: string
    plantState?: string
    vehicleType?: string
    enriched?: boolean
    enrichmentSource?: 'NHTSA'
  }>
  
  // Drivers
  driversCount?: number
  drivers?: Array<{
    name: string
    age?: string
    dateOfBirth?: string
    yearsLicensed?: number
    violations?: number
    accidents?: number
  }>
  
  // Email (Hunter.io enriched)
  emailEnrichment?: {
    verified: boolean
    status: string
    score: number
    risk: string
  }
  
  // Insurance
  insuranceType?: string
  currentInsurer?: string
  currentPremium?: string
  needs?: string[]
  
  // Metadata
  profileComplete?: boolean
  createdAt?: string
  updatedAt?: string
}
```

**Key Methods**:
```typescript
profileManager.saveProfile(profile)      // Save to localStorage
profileManager.loadProfile()             // Load from localStorage
profileManager.updateProfile(updates)    // Smart merge with protection
profileManager.clearProfile()            // Clear session
```

---

#### **State Requirements Database** (`/lib/data/state-requirements.ts`)
**Purpose**: Comprehensive database of state insurance requirements

**Coverage**:
- **51 jurisdictions** (50 states + DC)
- **12 no-fault states** (PIP required)
- **20 states** with mandatory UM/UIM
- **Official sources** for each state

**Data Structure**:
```typescript
interface StateRequirement {
  state: string                    // 'CA'
  stateName: string                // 'California'
  liability: {
    bodilyInjuryPerPerson: number  // 15000
    bodilyInjuryPerAccident: number // 30000
    propertyDamage: number          // 5000
  }
  required: string[]               // ['liability']
  optional: string[]               // ['uninsured_motorist', 'collision']
  pipRequired: boolean             // false
  umRequired: boolean              // false
  notes?: string                   // State-specific notes
  source: string                   // 'California Department of Insurance'
}
```

**Helper Functions**:
```typescript
getStateRequirement('CA')           // Get state data
isStateCovered('CA')                // Check if state is in DB
getCoveredStates()                  // Get all state codes
formatLiabilityShorthand(liability) // Convert to '25/50/25'
parseLiabilityShorthand('25/50/25') // Parse to object
```

---

#### **Information Tracker** (`/lib/information-tracker.ts`)
**Purpose**: Track collected information during conversation

**Key Features**:
- Extracts collected info from messages
- Identifies missing required fields
- Prevents redundant questions
- Integrates with enriched data (NHTSA vehicles)

---

#### **Carrier Database** (`/lib/carrier-database.ts`)
**Purpose**: Mock carrier data for quote generation

**Carriers** (8 total):
- State Farm, GEICO, Progressive, Allstate, USAA, Liberty Mutual, Farmers, Nationwide

**Data**:
- Coverage types
- State availability
- Ratings (A.M. Best, Moody's, S&P)
- Pricing models (mock)

---

## 🔄 Data Flow Examples

### **Example 1: Policy Upload & Enrichment**

```
1. User uploads policy image
   ↓
2. /api/analyze-coverage receives file
   ↓
3. GPT-4o Vision extracts text → JSON
   {
     customerName: "Kenneth Crann",
     address: "1847 14th Avenue, Apt 3",
     city: "San Francisco",
     state: "CA",
     zipCode: "94122-3045",
     vehicles: [{ vin: "5YJSA1E14FF087599" }]
   }
   ↓
4. NHTSA MCP Server called
   → Returns: { year: 2015, make: "TESLA", model: "Model S", ... }
   ↓
5. OpenCage MCP Server called
   → Returns: { formatted: "1847 14th Avenue, SF, CA 94122, USA", lat: 37.75, lng: -122.47, ... }
   ↓
6. Policy Analyzer runs
   → Checks CA state minimums (15/30/5)
   → Compares to policy coverage
   → Generates health score & gaps
   ↓
7. Return enriched coverage + analysis
   ↓
8. UI displays:
   - Profile with ✓ NHTSA badge
   - Profile with ✓ OpenCage badge
   - Policy Health Score card
```

---

### **Example 2: Conversational Flow**

```
1. User: "I need auto insurance"
   ↓
2. /api/chat → GPT-4o
   → Extract: { needs: ['auto'] }
   → Update profile
   ↓
3. AI: "What's your location?"
   ↓
4. User: "San Francisco, CA"
   ↓
5. /api/chat → GPT-4o
   → Extract: { city: 'San Francisco', state: 'CA' }
   → Update profile
   ↓
6. AI: "How many vehicles?"
   ↓
7. User: "One, a 2015 Tesla Model S"
   ↓
8. /api/chat → GPT-4o
   → Extract: { vehiclesCount: 1, vehicles: [{ year: 2015, make: 'TESLA', model: 'Model S' }] }
   → Update profile
   ↓
9. AI: "What's the VIN?" (if available)
   ↓
10. User: "5YJSA1E14FF087599"
    ↓
11. /api/chat → NHTSA MCP Server
    → Enrich vehicle data
    → Update profile with enriched: true
    ↓
12. AI: "Great! I've verified your vehicle. What's the primary use?"
    (Skips asking for year/make/model since VIN decoded)
    ↓
... continues until profile complete ...
    ↓
13. AI: "Let me fetch quotes for you..."
    → /api/fetch-quotes
    → Display carrier comparisons
```

---

## 🤖 Agentic Capabilities Summary

### **1. Policy Analyzer Agent**
- **Autonomy**: Runs without human intervention
- **Multi-step reasoning**: State minimums → Industry standards → Vehicle value
- **Tool use**: State DB, NHTSA data, depreciation models
- **Goal-driven**: Optimize coverage, minimize risk, reduce cost
- **Evidence-based**: Cites official sources

### **2. Conversation Agent (GPT-4o)**
- **Context-aware**: Adapts to collected data
- **Information extraction**: Parses natural language
- **Profile building**: Incremental data collection
- **Smart questioning**: Avoids redundancy

### **3. MCP Enrichment Agents**
- **NHTSA**: Autonomous VIN decoding
- **OpenCage**: Autonomous address validation
- **Hunter.io**: Autonomous email verification

---

## 🔐 Security & Privacy

### **Data Storage**:
- **localStorage** (client-side only)
- No server-side persistence
- Session-based (clears on tab close)

### **API Keys**:
- Stored in `.env.local` (never committed)
- Server-side only (not exposed to client)
- Vercel environment variables for production

### **MCP Servers**:
- Run as child processes (isolated)
- No direct internet access from client
- API rate limiting (free tiers)

---

## 🚀 Deployment Architecture

### **Vercel (Recommended)**:
```
Frontend (Next.js) → Vercel Edge Network
API Routes → Vercel Serverless Functions
MCP Servers → ⚠️ Not supported (need external hosting)
```

### **MCP Server Deployment Options**:
1. **Convert to API routes** (recommended)
2. **Deploy to Railway/Render/Fly.io** (call via HTTP)
3. **Disable for production** (app works without enrichment)

---

## 📊 Technology Stack

### **Frontend**:
- Next.js 14.2.33 (App Router)
- React 18
- TypeScript
- Tailwind CSS v4
- Radix UI (components)
- Geist Font

### **Backend**:
- Next.js API Routes
- OpenAI GPT-4o & GPT-4o Vision
- Node.js 18+

### **MCP Servers**:
- Node.js
- `@modelcontextprotocol/sdk`
- `node-fetch`, `dotenv`

### **APIs**:
- OpenAI API (GPT-4o, GPT-4o Vision)
- NHTSA vPIC API (free)
- OpenCage Geocoding API (free tier)
- Hunter.io Email Verifier (free tier)
- First Street Foundation API (free tier)

---

## 📈 Performance Metrics

### **API Response Times** (typical):
- `/api/chat`: 2-5 seconds (GPT-4o)
- `/api/analyze-coverage`: 15-25 seconds (Vision + MCP enrichment)
- `/api/fetch-quotes`: <500ms (mock data)

### **MCP Server Response Times**:
- NHTSA: 1-3 seconds
- OpenCage: 500ms-2 seconds
- Hunter.io: 1-2 seconds

### **Bundle Size**:
- First Load JS: ~175 KB
- Page-specific: ~87 KB

---

## 🔮 Future Enhancements

### **Planned Agentic Features**:
1. **Multi-Carrier Quote Orchestration Agent**
   - Parallel API calls to real carriers
   - Intelligent retry logic
   - Price optimization

2. **Proactive Risk Assessment Agent**
   - Flood risk (First Street API)
   - Crime data integration
   - Weather patterns

3. **Autonomous Policy Comparison Agent**
   - Side-by-side analysis
   - Gap identification
   - Switching recommendations

4. **Savings Calculator Agent**
   - Discount eligibility
   - Bundle opportunities
   - Payment optimization

---

## 📚 Key Files Reference

### **Core Application**:
- `app/page.tsx` - Main landing page
- `app/api/chat/route.ts` - Conversation endpoint
- `app/api/analyze-coverage/route.ts` - Policy analysis endpoint

### **Agentic Layer**:
- `lib/policy-analyzer.ts` - Autonomous policy analyzer
- `lib/data/state-requirements.ts` - 51-state database

### **Profile Management**:
- `lib/customer-profile.ts` - Profile state management
- `lib/information-tracker.ts` - Conversation tracking

### **MCP Servers**:
- `mcp-server/nhtsa-server/` - VIN decoder
- `mcp-server/opencage-server/` - Geocoding
- `mcp-server/hunter-server/` - Email verification
- `mcp-server/firststreet-server/` - Flood risk

### **UI Components**:
- `components/chat-interface.tsx` - Chat UI
- `components/coverage-analyzer.tsx` - Policy upload
- `components/policy-health-card.tsx` - Health score display
- `components/profile-summary-card.tsx` - Profile display

---

## 🎯 Summary

This application combines:
- **3 MCP enrichment servers** (NHTSA, OpenCage, Hunter.io)
- **2 autonomous agents** (Policy Analyzer, Conversation Agent)
- **51-state knowledge base** (100% US coverage)
- **GPT-4o + Vision** (conversation + OCR)
- **Real-time profile management** (smart merge, data protection)
- **Modern Next.js architecture** (App Router, Server Components)

The result is a **truly agentic insurance assistant** that autonomously enriches data, analyzes policies, and guides users through the insurance research process with minimal human intervention. 🚀


