# Insurance Carrier API Landscape in the US

## 📊 Current State of Carrier APIs (2024)

### The Reality: Very Limited Public APIs

**Publicly Available Carrier APIs: ~5-10** (for direct quotes)
**Private/Partner APIs: ~50-100** (restricted access)
**Total US Insurance Carriers: ~6,000** (only top 100 matter for 90% of market)

## 🔓 Public/Semi-Public Carrier APIs

### 1. **Direct-to-Consumer APIs** (Very Rare)

| Carrier | API Type | Access | What's Available |
|---------|----------|--------|------------------|
| **Progressive** | Semi-public | Partner program | Name Your Price®, Snapshot® data |
| **GEICO** | Limited | Partner only | Quote comparison (via aggregators) |
| **Esurance (Allstate)** | Deprecated | Was public | Discontinued public API |
| **Root Insurance** | Developer API | Application required | Telematics-based quotes |
| **Metromile** | Limited API | Partners | Pay-per-mile quotes |

### 2. **Through Aggregator Platforms**

These platforms have agreements with multiple carriers:

| Platform | Carriers | Access Type | Cost |
|----------|----------|-------------|------|
| **Applied Systems** | 200+ carriers | Partner/Broker only | Enterprise pricing |
| **EZLynx** | 200+ carriers | Agents only | $200-500/month |
| **Vertafore** | 150+ carriers | Agencies only | Enterprise |
| **Bold Penguin** | 30+ commercial | Broker platform | Revenue share |
| **Cover Genius** | 20+ carriers | B2B2C | Partnership |

## 🔐 Private Carrier APIs (Agency/Broker Only)

### Major Carriers with Agent APIs

| Carrier | Market Share | API Availability | Access Requirements |
|---------|--------------|------------------|---------------------|
| **State Farm** | 17% | Agent portal API | Licensed agents only |
| **Berkshire Hathaway (GEICO)** | 14% | Limited partner API | Strategic partners |
| **Progressive** | 14% | Agency API | Appointed agents |
| **Allstate** | 10% | Ivantage platform | Exclusive agents |
| **USAA** | 6.5% | No external API | Internal only |
| **Liberty Mutual** | 6% | Partner API | Appointed agents |
| **Farmers** | 5.5% | Agency Gateway | Exclusive agents |
| **Nationwide** | 5% | Partner platform | Appointed agents |
| **Travelers** | 4% | Agency API | Independent agents |
| **American Family** | 3% | Agent portal | Exclusive agents |

## 🛠️ Available Integration Methods

### 1. **Comparative Raters** (Multi-Carrier Access)

```javascript
// These services provide access to multiple carriers
const COMPARATIVE_RATERS = {
  "TurboRater": {
    carriers: 50,
    type: "Agency tool",
    cost: "$100-300/month",
    api: "REST API available"
  },
  "Insurance Technologies Corporation (ITC)": {
    carriers: 175,
    type: "Agency platform",
    cost: "Enterprise pricing",
    api: "SOAP/REST APIs"
  },
  "QuoteRush": {
    carriers: 12,
    type: "Consumer/Agent",
    cost: "Per-quote pricing",
    api: "REST API"
  },
  "Quotit": {
    carriers: 100,
    type: "Health/Life focus",
    cost: "$50-200/month",
    api: "Limited API"
  }
}
```

### 2. **Embedded Insurance Platforms**

New platforms offering API-first insurance:

| Platform | Type | Carriers | Developer Access |
|----------|------|----------|------------------|
| **Boost Insurance** | API-first | Multiple | Full API docs |
| **Qover** | Embedded insurance | 10+ | REST API |
| **Setoo** | On-demand insurance | Various | Developer portal |
| **Sure** | Digital insurance | 20+ | Partner API |
| **Matic** | Mortgage insurance | 15+ | B2B API |

### 3. **InsurTech APIs** (Modern Carriers)

Newer carriers with developer-friendly APIs:

```typescript
const INSURTECH_APIS = {
  "Lemonade": {
    publicAPI: false,
    type: "Internal only",
    notes: "No partner program yet"
  },
  "Root Insurance": {
    publicAPI: true,
    type: "Developer program",
    access: "Application required",
    features: ["Telematics quotes", "Fair pricing"]
  },
  "Clearcover": {
    publicAPI: false,
    type: "Partner only",
    notes: "API for strategic partners"
  },
  "Next Insurance": {
    publicAPI: false,
    type: "Small business focus",
    access: "Partner program"
  },
  "Hippo": {
    publicAPI: false,
    type: "Home insurance",
    access: "Broker partners only"
  }
}
```

## 🔄 Alternative Data Sources

### Screen Scraping Services (Gray Area)

| Service | What They Do | Legality | Cost |
|---------|-------------|----------|------|
| **Plaid (Insurance)** | Connects to carrier portals | User-consented | Per-connection |
| **Yodlee** | Account aggregation | User-consented | Enterprise |
| **MX** | Insurance data aggregation | User-consented | Enterprise |

### Quote Comparison APIs

```javascript
// Services that aggregate quotes (not direct carrier APIs)
const COMPARISON_APIS = {
  "The Zebra API": {
    type: "Lead generation",
    carriers: "Multiple via partnerships",
    access: "B2B partnerships",
    model: "Revenue share"
  },
  "Insurify": {
    type: "Comparison platform",
    carriers: "20+",
    access: "No public API",
    model: "Lead generation"
  },
  "Compare.com": {
    type: "Marketplace",
    carriers: "Multiple",
    access: "Partner API",
    model: "Referral fees"
  },
  "Gabi": {
    type: "Comparison + switching",
    carriers: "40+",
    access: "No public API",
    model: "Commission-based"
  }
}
```

## 📈 Market Reality Check

### Why So Few Public APIs?

1. **Regulatory Complexity** - 50 state regulations
2. **Competitive Advantage** - Carriers protect pricing models
3. **Channel Conflict** - Don't want to bypass agents
4. **Risk Management** - Control who sells their products
5. **Legacy Systems** - Many carriers use 30+ year old systems
6. **Licensing Requirements** - Must be licensed to sell insurance

### The Numbers:

- **Top 10 carriers** = 70% of market
- **Top 25 carriers** = 85% of market
- **Top 100 carriers** = 95% of market
- **Remaining 5,900** = 5% of market

**APIs Available:**
- **True public APIs**: < 5
- **Partner/agent APIs**: ~50-100
- **Through aggregators**: 200+ carriers
- **Total directly accessible**: ~10-20 (with proper licensing)

## 🚀 Best Integration Strategies

### For Your Insurance Assistant:

#### Option 1: Partner with Aggregator
```typescript
// Best for quick market access
const aggregatorIntegration = {
  pros: [
    "Access to 50-200 carriers",
    "Single integration point",
    "Handles compliance"
  ],
  cons: [
    "Higher costs",
    "Less control",
    "Generic experience"
  ],
  bestFor: "Quick launch, broad coverage"
}
```

#### Option 2: Build Affiliate Network
```typescript
// Revenue sharing model
const affiliateModel = {
  partners: [
    "The Zebra",
    "Insurify",
    "Compare.com",
    "PolicyGenius"
  ],
  integration: "Referral links or lead API",
  revenue: "CPA or revenue share",
  bestFor: "No licensing required"
}
```

#### Option 3: Become Licensed Agency
```typescript
// Maximum control and access
const agencyModel = {
  requirements: [
    "Insurance licenses (all states)",
    "E&O insurance",
    "Carrier appointments"
  ],
  access: "Direct carrier APIs",
  revenue: "Commissions (10-20%)",
  bestFor: "Long-term, full control"
}
```

#### Option 4: Hybrid Approach
```typescript
// Recommended for most startups
const hybridApproach = {
  phase1: "Affiliate/referral model",
  phase2: "Partner with aggregator",
  phase3: "Get licensed, direct APIs",
  phase4: "Build own carrier network"
}
```

## 📊 Realistic Implementation Plan

### Year 1: Education & Referral
- Use public data for estimates
- Refer to comparison sites
- Generate revenue via affiliates

### Year 2: Aggregator Partnership
- Integrate 1-2 aggregator APIs
- Provide real quotes
- Maintain referral options

### Year 3: Direct Integrations
- Get licensed as agency
- Integrate top 5-10 carriers directly
- Build proprietary pricing models

## 🎯 Key Takeaways

1. **Very few true public carrier APIs exist** (~5)
2. **Most access requires licensing/partnerships**
3. **Aggregators provide best coverage** (50-200 carriers)
4. **Top 25 carriers cover 85% of market**
5. **InsurTechs more API-friendly** but smaller market share
6. **Hybrid approach most practical** for startups

## 💡 Recommendation for Your App

Start with:
1. **Public data** for estimates (what you're building now)
2. **Affiliate partnerships** for revenue
3. **One aggregator partnership** for real quotes
4. **Focus on top 10 carriers** (70% of market)

This gives you coverage without the complexity of managing hundreds of carrier relationships!