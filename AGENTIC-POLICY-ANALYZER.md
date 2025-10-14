# 🤖 Agentic Policy Analyzer

## Overview

The **Agentic Policy Analyzer** is an autonomous AI agent that analyzes insurance policies for compliance issues, coverage gaps, and cost optimization opportunities. It provides **reasoned recommendations** with citations from authoritative sources.

## 🎯 What Makes It "Agentic"?

This is a true **autonomous agent** that:

1. **Multi-step reasoning**: Analyzes policy → Identifies gaps → Generates recommendations → Cites sources
2. **Goal-driven**: Optimizes for compliance, protection, and cost efficiency
3. **Tool use**: Leverages NHTSA vehicle data, state requirements database, industry standards
4. **Autonomous decision-making**: Determines priority and severity without human input
5. **Contextual awareness**: Uses customer profile (location, vehicle, age) for personalized analysis

## 📊 Features

### 1. **State Compliance Check** (Critical)
- Verifies policy meets state minimum requirements
- Checks required coverage types (PIP, UM/UIM)
- Flags illegal coverage levels
- **Sources**: State Departments of Insurance

### 2. **Industry Best Practices** (Warning)
- Compares against Consumer Reports recommendations (100/300/100)
- Identifies underinsured liability coverage
- Recommends uninsured motorist protection
- **Sources**: Consumer Reports, Insurance Information Institute

### 3. **Vehicle-Specific Analysis** (Uses NHTSA Data)
- Estimates vehicle value based on age
- Recommends dropping collision/comprehensive for low-value vehicles
- Identifies missing coverage for high-value vehicles
- **Sources**: NHTSA VIN Decoder + depreciation models

### 4. **Uninsured Motorist Protection**
- Checks for UM/UIM coverage
- Cites 13% uninsured driver statistic
- **Sources**: Insurance Information Institute (2023)

### 5. **Deductible Optimization**
- Analyzes deductible choices
- Recommends $500 as optimal balance
- **Sources**: Industry standards

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Policy Scan (GPT-4 Vision)               │
│                  Extracts coverage details                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Autonomous Policy Analyzer Agent               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  1. State Compliance Check                          │  │
│  │     - Load state requirements from database         │  │
│  │     - Compare policy vs minimums                    │  │
│  │     - Flag critical violations                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  2. Industry Standards Check                        │  │
│  │     - Load Consumer Reports recommendations         │  │
│  │     - Compare policy vs best practices              │  │
│  │     - Generate warnings                             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  3. Vehicle Analysis (NHTSA Integration)            │  │
│  │     - Use enriched vehicle data (year, make, model) │  │
│  │     - Estimate value via depreciation model         │  │
│  │     - Recommend coverage adjustments                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  4. Risk Assessment                                 │  │
│  │     - Analyze location, vehicle, driver profile     │  │
│  │     - Calculate health score (0-100)                │  │
│  │     - Prioritize gaps (1-5)                         │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Policy Health Score Card                   │
│                                                             │
│  Score: 72/100 (Good)                                      │
│                                                             │
│  🚨 Critical (1): Below state minimum                      │
│  ⚠️  Warnings (2): Underinsured, missing UM               │
│  💡 Optimizations (1): Drop collision on old vehicle       │
│                                                             │
│  Sources: CA Dept of Insurance, Consumer Reports, NHTSA   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
lib/
├── data/
│   └── state-requirements.ts      # State minimums + industry standards
├── policy-analyzer.ts             # Main autonomous agent logic
└── customer-profile.ts            # Customer profile types

components/
├── policy-health-card.tsx         # UI for displaying analysis
├── coverage-analyzer.tsx          # Policy scanner (calls analyzer)
└── customer-profile-form.tsx      # Entry point (passes profile)
```

## 🔍 Data Sources

### State Requirements (Free)
- **Insurance Information Institute**: https://www.iii.org/state-insurance-requirements
- **State Departments of Insurance**: Official government sources
- **Coverage**: Top 15 states (covers ~65% of US population)

### Industry Standards
- **Consumer Reports** (2024): "How Much Car Insurance Do You Need?"
  - Recommends 100/300/100 liability
- **Insurance Information Institute** (2023): "Facts + Statistics: Auto Insurance"
  - 13% of drivers are uninsured
- **Financial Advisors Consensus**: Umbrella insurance for $500K+ net worth

### Vehicle Data
- **NHTSA VIN Decoder**: Already integrated ✅
- **Depreciation Model**: 15% annual for first 5 years, 10% thereafter
- **Threshold**: Drop collision/comprehensive if vehicle < $5,000

## 🎨 UI Components

### Policy Health Card
- **Health Score**: 0-100 scale with color coding
  - 90-100: Green (Excellent)
  - 70-89: Blue (Good)
  - 50-69: Yellow (Fair)
  - 0-49: Red (Needs Attention)

- **Gap Cards**: Each gap shows:
  - Icon (🚨 critical, ⚠️ warning, 💡 optimization)
  - Title and message
  - Reasoning (why it matters)
  - Recommendation (what to do)
  - Source (citation)
  - Risk/Savings (financial impact)
  - Action button ("Get Quotes to Fix This")

- **Statistics**: Count of critical, warning, and optimization gaps

- **Citations**: List of all authoritative sources used

## 🚀 Usage

### 1. Scan Policy
```typescript
// User uploads policy document
// GPT-4 Vision extracts coverage details
const coverage = await analyzeCoverageAPI(policyDocument)
```

### 2. Autonomous Analysis
```typescript
import { analyzePolicy } from '@/lib/policy-analyzer'

// Agent autonomously analyzes policy
const analysis = analyzePolicy(coverage, customerProfile)

// Returns:
// {
//   healthScore: 72,
//   gaps: [
//     {
//       id: 'state_minimum_bi_person',
//       type: 'critical',
//       category: 'compliance',
//       title: '🚨 Below State Minimum - Illegal Coverage',
//       message: 'Your bodily injury coverage ($15K) is below CA minimum',
//       reasoning: 'Driving without minimum coverage is illegal...',
//       recommendation: 'Increase to at least 15/30/5',
//       source: 'California Department of Insurance',
//       potentialRisk: 'Fines up to $5,000, license suspension',
//       priority: 1
//     }
//   ],
//   summary: 'Your policy needs attention. 3 issues found.',
//   citations: ['CA Dept of Insurance', 'Consumer Reports (2024)'],
//   analyzedAt: '2024-01-15T10:30:00Z'
// }
```

### 3. Display Results
```typescript
<PolicyHealthCard 
  analysis={analysis}
  onFixGap={(gapId) => {
    // Trigger quote flow to address this specific gap
    fetchQuotesToFixGap(gapId)
  }}
/>
```

## 📈 Health Score Calculation

```typescript
function calculateHealthScore(gaps: PolicyGap[]): number {
  let score = 100
  
  gaps.forEach(gap => {
    if (gap.type === 'critical') score -= 30  // Illegal/dangerous
    if (gap.type === 'warning') score -= 15   // Risky but legal
    if (gap.type === 'optimization') score -= 5  // Cost savings
  })
  
  return Math.max(0, Math.min(100, score))
}
```

**Examples:**
- 0 gaps = 100 (Excellent)
- 1 critical = 70 (Fair)
- 2 warnings = 70 (Fair)
- 1 critical + 2 warnings = 40 (Needs Attention)

## 🔮 Future Enhancements

### Phase 2: Location-Based Risk
- Integrate FBI Crime Data API (theft risk)
- Add FEMA Flood Maps (flood risk)
- Use First Street Foundation (climate risk)
- Recommend coverage based on ZIP code risks

### Phase 3: Real-Time Quote Integration
- "Fix This Gap" button triggers quote API
- Fetches quotes that address specific gap
- Shows before/after comparison

### Phase 4: Proactive Monitoring
- Track policy renewal dates
- Re-analyze 30 days before renewal
- Alert user to premium increases
- Autonomously shop for better rates

### Phase 5: Claims Guidance
- Help user file claims step-by-step
- Validate required documents
- Submit to carrier API
- Track claim status

## 🎯 Business Impact

### User Value
- ✅ **Compliance**: Avoids fines, license suspension
- ✅ **Protection**: Identifies underinsured areas
- ✅ **Savings**: Finds unnecessary coverage
- ✅ **Trust**: Cites authoritative sources

### Business Value
- 📈 **Higher conversions**: Users see gaps → buy more coverage
- 📈 **Differentiation**: Competitors just show quotes
- 📈 **Trust**: Evidence-based recommendations
- 📈 **Upsell**: Identifies upgrade opportunities

## 📚 References

1. **Insurance Information Institute**: "State Auto Insurance Requirements" (2024)
2. **Consumer Reports**: "How Much Car Insurance Do You Need?" (2024)
3. **NHTSA**: VIN Decoder Database
4. **State Departments of Insurance**: Official minimum requirements
5. **Financial Planning Association**: Umbrella insurance guidelines

## 🧪 Testing

### Test with Sample Policy
1. Upload the test policy (Kenneth Crann, SF)
2. Verify state compliance check (CA minimums)
3. Check vehicle analysis (2019 Tesla Model 3)
4. Confirm health score calculation
5. Validate citations

### Expected Results
- **State**: CA
- **Vehicle**: 2019 Tesla Model 3 (~$25K value)
- **Gaps**: Likely 1-2 warnings (liability below 100/300/100)
- **Health Score**: 70-85 (Good)
- **Citations**: CA Dept of Insurance, Consumer Reports, NHTSA

## 🎓 Key Takeaways

This is **true agentic AI** because it:
1. **Autonomously reasons** through multi-step analysis
2. **Uses tools** (state database, NHTSA data, industry standards)
3. **Makes decisions** (priority, severity, recommendations)
4. **Cites sources** (builds trust with evidence)
5. **Optimizes for goals** (compliance, protection, cost)

It's not just extracting data or answering questions—it's **actively analyzing, reasoning, and recommending** like a human insurance agent would.


