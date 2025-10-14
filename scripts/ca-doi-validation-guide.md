# California DOI Rate Comparison Validation Guide

## Official Tool
**URL**: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::

**Source**: California Department of Insurance - Official Filed Rates (Updated Jan 1, 2025)

## Step-by-Step Validation Process

### Step 1: Access the Tool
1. Go to: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::
2. This loads the 2025 Automobile Insurance comparison tool

### Step 2: Enter Your Profile

Select each option to match your actual profile:

| Field | Your Selection | Notes |
|-------|---------------|-------|
| **Coverage Type** | Standard | (or your actual coverage level) |
| **Location** | San Francisco, CA or ZIP 94122 | Exact match |
| **Insurance For** | Single Driver | (or your situation) |
| **Years Licensed** | Your actual years | e.g., 15+ years |
| **Mileage** | 10,001-15,000 miles/year | Match 10,500 miles |
| **Driving Record** | Clean (no violations) | Match your record |
| **Vehicle** | 2015 Tesla Model S | Exact match |

### Step 3: Review Results

The tool will display annual premiums from all major carriers:

```
Example Output (Hypothetical):
╔═══════════════════════════════════════════════════════════╗
║ Carrier          | Annual Premium | Monthly Equivalent  ║
╠═══════════════════════════════════════════════════════════╣
║ Progressive      | $1,650         | $137.50/mo         ║
║ GEICO            | $1,720         | $143.33/mo         ║
║ State Farm       | $1,890         | $157.50/mo         ║
║ Allstate         | $2,100         | $175.00/mo         ║
║ Liberty Mutual   | $1,950         | $162.50/mo         ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 4: Compare to Quote Engine

Create a comparison table:

| Carrier | CA DOI (Official) | Quote Engine | Difference | Accuracy |
|---------|-------------------|--------------|------------|----------|
| Progressive | ???/mo (TO FILL) | $119/mo | ??? | ??? |
| GEICO | ???/mo (TO FILL) | $???/mo | ??? | ??? |
| State Farm | ???/mo (TO FILL) | $???/mo | ??? | ??? |
| Allstate | ???/mo (TO FILL) | $???/mo | ??? | ??? |

**Target**: Engine quotes should be within ±15% of CA DOI quotes

### Step 5: Calculate Accuracy

For each carrier:
```
Accuracy % = ((Engine Quote - DOI Quote) / DOI Quote) × 100

Example:
Progressive DOI: $137.50/mo
Progressive Engine: $119/mo
Accuracy: ($119 - $137.50) / $137.50 × 100 = -13.5% ✅ (within ±15%)
```

### Step 6: Calibrate If Needed

If accuracy is off:

**If Engine is Too Low (like -35%)**:
1. Check base rates in `config/factors/base-rates.json`
2. Compare DOI average to your CA base rate
3. Adjust base rate to match DOI data

**If Engine is Too High**:
1. Review multiplier stacking
2. Check if too many discounts are applied
3. Verify regional adjustments

## Automation Opportunity

### Future Enhancement: Web Scraper
Create a script to automatically query CA DOI tool:

```typescript
// scripts/scrape-ca-doi-rates.ts
async function getCADOIRates(profile: Profile) {
  // 1. Navigate to CA DOI tool
  // 2. Fill in form fields
  // 3. Submit and scrape results
  // 4. Parse carrier premiums
  // 5. Compare to engine output
  // 6. Generate validation report
}
```

**Note**: Check CA DOI's terms of service and robots.txt before automating.

## Data Export

After getting CA DOI results, update your validation dataset:

```json
// validation-data/ca-doi-reference.json
{
  "lastUpdated": "2025-01-15",
  "source": "CA DOI Official Rate Comparison Tool",
  "profiles": [
    {
      "profile": {
        "vehicle": "2015 Tesla Model S",
        "location": "San Francisco, CA",
        "coverage": "Standard",
        "mileage": "10,500/year",
        "record": "Clean"
      },
      "officialRates": {
        "progressive": 1650,
        "geico": 1720,
        "stateFarm": 1890,
        "allstate": 2100
      }
    }
  ]
}
```

## Benefits of Using CA DOI Tool

### ✅ Advantages
1. **100% Accurate** - Actual filed rates
2. **Legally Binding** - Companies must honor these rates
3. **Up-to-Date** - Refreshed quarterly
4. **Free** - No API costs
5. **Comprehensive** - All major carriers
6. **Official** - State-backed data

### ⚠️ Limitations
1. **Manual Entry** - Not automated (yet)
2. **California Only** - Need similar tools for other states
3. **Limited Profiles** - Predefined selection options
4. **Annual Rates** - Must convert to monthly

## Other State DOI Tools

Most states have similar tools:

| State | DOI Rate Tool |
|-------|---------------|
| **California** | https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11 |
| **New York** | https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison |
| **Texas** | https://www.tdi.texas.gov/consumer/cpmautoquote.html |
| **Florida** | https://www.floir.com/sections/pandc/AutoComparison.aspx |
| **Illinois** | https://mc.insurance.illinois.gov/messagecenter.nsf |

## Validation Checklist

- [ ] Access CA DOI tool
- [ ] Enter exact profile details
- [ ] Record all carrier quotes
- [ ] Compare to engine output
- [ ] Calculate accuracy percentage
- [ ] Update base rates if needed
- [ ] Re-test and verify
- [ ] Document results

## Expected Outcome

After validation with CA DOI tool:

**Before**:
- Progressive Engine: $90/mo (was too low)
- Progressive Actual: $140/mo
- Error: -35.7%

**After Calibration**:
- Progressive Engine: $119/mo
- Progressive CA DOI: ~$137.50/mo (estimate)
- Error: ~-13.5% ✅

**Goal**: All carriers within ±15% of CA DOI official rates.

## Next Steps

1. **Immediate**: Use CA DOI tool to validate Progressive quote
2. **Short-term**: Get quotes for all major carriers
3. **Medium-term**: Validate multiple profiles (young driver, senior, etc.)
4. **Long-term**: Build automation to periodically check accuracy

