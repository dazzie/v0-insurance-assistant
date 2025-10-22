# CA DOI Rate Extraction Project Plan

## Objective
Extract comprehensive rate data from CA Department of Insurance to create a reference dataset for validation and calibration.

## Data Coverage

### Geographic Coverage
- **All California Cities/ZIP Codes** (varies by tool granularity)
- Major metro areas: LA, SF, SD, SAC, Oakland, San Jose, etc.
- Rural areas
- Coastal vs inland differences

### Coverage Types
From the CA DOI tool (https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::):
- **Liability Only**
- **Basic Coverage**
- **Standard Coverage**
- **Comprehensive Coverage**

### Profile Variables
- **Locations**: ~500 major cities/ZIPs
- **Vehicles**: ~200 common models (by year, make, model)
- **Driver Profiles**: 
  - Age brackets: 16-20, 21-24, 25-29, 30-49, 50-64, 65-74, 75+
  - Years licensed: 1-2, 3-5, 6-10, 10+
  - Driving records: Clean, 1 violation, 2+ violations
- **Mileage**: <5k, 5-10k, 10-15k, 15-20k, 20k+

### Estimated Dataset Size
```
500 locations × 
4 coverage types × 
50 vehicle types × 
7 age brackets × 
3 driving records × 
5 mileage brackets

= ~2,100,000 potential data points
```

**Practical Subset**: ~50,000 most common combinations

## Implementation Methods

### Method 1: Playwright/Puppeteer Web Scraper

```typescript
// scripts/scrape-ca-doi-comprehensive.ts
import { chromium } from 'playwright';

interface RateProfile {
  location: string;
  coverageType: string;
  yearsLicensed: string;
  mileage: string;
  drivingRecord: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
}

interface RateResult {
  profile: RateProfile;
  carriers: {
    [carrierName: string]: {
      annualPremium: number;
      monthlyPremium: number;
    }
  };
  extractedDate: string;
}

async function scrapeDOIRates(profile: RateProfile): Promise<RateResult> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // 1. Navigate to CA DOI tool
    await page.goto('https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::');
    
    // 2. Fill form fields
    await page.selectOption('#coverage-type', profile.coverageType);
    await page.fill('#location', profile.location);
    await page.selectOption('#years-licensed', profile.yearsLicensed);
    await page.selectOption('#mileage', profile.mileage);
    await page.selectOption('#driving-record', profile.drivingRecord);
    
    // Vehicle info
    await page.fill('#vehicle-year', profile.vehicleYear.toString());
    await page.fill('#vehicle-make', profile.vehicleMake);
    await page.fill('#vehicle-model', profile.vehicleModel);
    
    // 3. Submit and wait for results
    await page.click('button[type="submit"]');
    await page.waitForSelector('.rate-results');
    
    // 4. Extract carrier rates
    const carriers: { [key: string]: any } = {};
    const rows = await page.$$('.rate-results tr');
    
    for (const row of rows) {
      const carrierName = await row.$eval('.carrier-name', el => el.textContent);
      const annualPremium = await row.$eval('.annual-premium', el => 
        parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
      );
      
      carriers[carrierName] = {
        annualPremium,
        monthlyPremium: Math.round(annualPremium / 12)
      };
    }
    
    return {
      profile,
      carriers,
      extractedDate: new Date().toISOString()
    };
    
  } finally {
    await browser.close();
  }
}

// Batch scraping with rate limiting
async function scrapeAllProfiles() {
  const profiles = generateProfileCombinations();
  const results: RateResult[] = [];
  
  for (let i = 0; i < profiles.length; i++) {
    console.log(`Scraping ${i + 1}/${profiles.length}: ${JSON.stringify(profiles[i])}`);
    
    try {
      const result = await scrapeDOIRates(profiles[i]);
      results.push(result);
      
      // Save progress incrementally
      if (i % 100 === 0) {
        saveResults(results, `./data/ca-doi-rates-${i}.json`);
      }
      
      // Rate limiting: 1 request per 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Failed to scrape profile ${i}:`, error);
    }
  }
  
  return results;
}

function generateProfileCombinations(): RateProfile[] {
  // Generate smart combinations (most common profiles first)
  const locations = [
    'San Francisco, CA',
    'Los Angeles, CA',
    'San Diego, CA',
    'Sacramento, CA',
    // ... top 50 cities
  ];
  
  const vehicles = [
    { year: 2020, make: 'Toyota', model: 'Camry' },
    { year: 2019, make: 'Honda', model: 'Accord' },
    { year: 2018, make: 'Tesla', model: 'Model 3' },
    // ... top 50 vehicles
  ];
  
  // Smart sampling to avoid 2M combinations
  const profiles: RateProfile[] = [];
  
  // Generate combinations prioritizing common scenarios
  for (const location of locations) {
    for (const vehicle of vehicles.slice(0, 10)) {  // Top 10 vehicles per location
      profiles.push({
        location,
        coverageType: 'Standard',
        yearsLicensed: '10+',
        mileage: '10,001-15,000',
        drivingRecord: 'Clean',
        ...vehicle
      });
    }
  }
  
  return profiles;
}
```

### Method 2: Manual Batch Collection

For a smaller, high-quality dataset:

```typescript
// scripts/batch-collect-ca-doi.ts

// Focused on most valuable profiles
const criticalProfiles = [
  {
    name: "SF Standard Mid-Age Tesla",
    location: "San Francisco, CA",
    coverage: "Standard",
    yearsLicensed: "10+",
    mileage: "10,001-15,000",
    record: "Clean",
    vehicle: "2015 Tesla Model S"
  },
  {
    name: "LA Budget Young Honda",
    location: "Los Angeles, CA",
    coverage: "Basic",
    yearsLicensed: "3-5",
    mileage: "10,001-15,000",
    record: "Clean",
    vehicle: "2018 Honda Civic"
  },
  // ... 50-100 critical profiles
];

// Manual collection workflow with UI
async function collectCriticalProfiles() {
  console.log("🎯 CA DOI Data Collection Workflow\n");
  
  for (let i = 0; i < criticalProfiles.length; i++) {
    const profile = criticalProfiles[i];
    
    console.log(`\n[${ i + 1}/${criticalProfiles.length}] ${profile.name}`);
    console.log("=" .repeat(60));
    console.log(`Location: ${profile.location}`);
    console.log(`Vehicle: ${profile.vehicle}`);
    console.log(`Coverage: ${profile.coverage}`);
    console.log("\n🔗 Enter data in CA DOI tool:");
    console.log("https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::\n");
    
    // Pause for manual entry
    const carriers = await promptForRates();
    
    saveToDataset(profile, carriers);
  }
}

async function promptForRates() {
  // Interactive CLI to input rates
  console.log("Enter annual premiums (press Enter to skip carrier):");
  
  const carriers = ['Progressive', 'GEICO', 'State Farm', 'Allstate', 'Liberty Mutual'];
  const rates: { [key: string]: number } = {};
  
  for (const carrier of carriers) {
    const annual = await prompt(`${carrier}: $`);
    if (annual) {
      rates[carrier] = parseInt(annual);
    }
  }
  
  return rates;
}
```

## Legal & Ethical Considerations

### 1. Check Terms of Service
```bash
# Check robots.txt
curl https://interactive.web.insurance.ca.gov/robots.txt

# Expected: Public government data should be accessible
# But verify there are no scraping restrictions
```

### 2. Responsible Scraping Practices
- **Rate Limiting**: 1-2 seconds between requests
- **User Agent**: Identify yourself
- **Time Windows**: Scrape during off-peak hours
- **Attribution**: Credit CA DOI as data source
- **Purpose**: Non-commercial, research/validation

### 3. Alternative: Public Data Request
```
File a California Public Records Act (CPRA) request:

To: California Department of Insurance
Re: Public Records Request - Insurance Rate Comparison Data

Request: Rate comparison data from the public-facing 
rate comparison tool for calendar year 2025, in CSV/JSON format.

Purpose: Non-commercial insurance research and validation
```

## Data Storage Structure

```json
// data/ca-doi-reference/index.json
{
  "source": "California Department of Insurance",
  "sourceUrl": "https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::",
  "extractedDate": "2025-01-15",
  "coverage": {
    "locations": 500,
    "profiles": 50000,
    "carriers": 25
  },
  "files": [
    "san-francisco.json",
    "los-angeles.json",
    "..."`
  ]
}

// data/ca-doi-reference/san-francisco.json
{
  "location": "San Francisco, CA",
  "zipCodes": ["94102", "94103", "..."],
  "profiles": [
    {
      "id": "sf-tesla-2015-standard-clean",
      "vehicle": {
        "year": 2015,
        "make": "Tesla",
        "model": "Model S"
      },
      "coverage": "Standard",
      "driver": {
        "yearsLicensed": "10+",
        "mileage": "10,001-15,000",
        "record": "Clean"
      },
      "rates": {
        "Progressive": { "annual": 1650, "monthly": 137 },
        "GEICO": { "annual": 1720, "monthly": 143 },
        "State Farm": { "annual": 1890, "monthly": 157 },
        "Allstate": { "annual": 2100, "monthly": 175 }
      },
      "lastUpdated": "2025-01-15"
    }
  ]
}
```

## Usage: Validation Engine

```typescript
// lib/validation/ca-doi-validator.ts
import caDOIData from '@/data/ca-doi-reference/index.json';

export class CADOIValidator {
  private dataset: Map<string, any>;
  
  constructor() {
    this.loadDataset();
  }
  
  findClosestMatch(profile: QuoteRequest): ReferenceRate | null {
    // Find closest matching profile in CA DOI dataset
    const key = this.generateProfileKey(profile);
    return this.dataset.get(key);
  }
  
  validate(engineQuote: Quote, profile: QuoteRequest): ValidationResult {
    const reference = this.findClosestMatch(profile);
    
    if (!reference) {
      return { validated: false, reason: 'No matching reference data' };
    }
    
    const referenceRate = reference.rates[engineQuote.carrierName];
    const accuracy = (engineQuote.monthlyPremium - referenceRate.monthly) / referenceRate.monthly;
    
    return {
      validated: true,
      accuracy: accuracy * 100,
      withinTolerance: Math.abs(accuracy) <= 0.15,
      reference: referenceRate,
      engine: engineQuote.monthlyPremium
    };
  }
}
```

## Implementation Timeline

### Phase 1: Proof of Concept (1-2 days)
- [ ] Manual collection of 10 critical profiles
- [ ] Validate scraping approach
- [ ] Build data structure

### Phase 2: Automated Scraper (3-5 days)
- [ ] Build Playwright scraper
- [ ] Test with 100 profiles
- [ ] Implement rate limiting
- [ ] Error handling

### Phase 3: Comprehensive Collection (2-4 weeks)
- [ ] Scrape 50,000+ profiles
- [ ] Validate data quality
- [ ] Build lookup system
- [ ] Integrate with quote engine

### Phase 4: Maintenance (Ongoing)
- [ ] Quarterly updates
- [ ] Monitor CA DOI changes
- [ ] Expand coverage

## Benefits

1. **✅ 100% Accurate Baseline** - Official state data
2. **✅ Comprehensive Coverage** - All California scenarios
3. **✅ Continuous Validation** - Always know engine accuracy
4. **✅ Competitive Intelligence** - See carrier pricing patterns
5. **✅ Better Calibration** - Fine-tune engine with real data

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **Large Dataset** | Smart sampling, prioritize common profiles |
| **Scraping Time** | Distributed scraping, caching |
| **Site Changes** | Monitor for changes, automated tests |
| **Rate Limits** | Respectful delays, off-peak scraping |
| **Data Storage** | Compressed JSON, indexed lookups |

## Alternative: Use Existing Data Sources

If scraping proves difficult:

1. **Insurance.com API** - Commercial rates API
2. **The Zebra Data** - Aggregator data (paid)
3. **Direct Carrier APIs** - Where available
4. **Industry Reports** - J.D. Power, Insurify annual studies

## Next Steps

1. **Immediate**: Test manual collection with 5-10 profiles
2. **Short-term**: Build simple scraper for top 100 profiles
3. **Medium-term**: Expand to 1,000+ profiles
4. **Long-term**: Full California coverage (50k+ profiles)

## Estimated ROI

**Investment**: 40-80 hours of development
**Return**: 
- 100% validated quote engine
- Competitive market intelligence
- Foundation for multi-state expansion
- Continuous accuracy monitoring

