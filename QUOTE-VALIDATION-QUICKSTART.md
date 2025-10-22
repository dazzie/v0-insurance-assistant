# Quote Engine Validation - Quick Start Guide

## 🎯 Goal
Build a reference dataset of official CA insurance rates to validate your quote engine.

## ⚡ Quick Start (15 minutes)

### Step 1: Collect Your First Official Rate (5 min)

```bash
node scripts/collect-ca-doi-data.js
```

This interactive tool will:
1. Show you the CA DOI URL
2. Tell you exactly what to enter
3. Collect the official rates
4. Save to `data/ca-doi-reference/index.json`

**First Profile to Collect** (matches your actual policy):
- Location: San Francisco, CA (94122)
- Vehicle: 2015 Tesla Model S
- Coverage: Standard
- Years Licensed: 10+
- Mileage: 10,001-15,000 miles/year
- Driving Record: Clean

### Step 2: Validate Your Engine (2 min)

```bash
node scripts/validate-with-ca-doi.js
```

This will:
- Load your collected CA DOI rates
- Compare to quote engine output
- Show accuracy percentage
- Tell you if calibration is needed

### Step 3: Fix If Needed (5 min)

If accuracy is off:
1. Update `config/factors/base-rates.json`
2. Restart dev server
3. Re-run validation

## 📊 CA DOI Tool Instructions

### Access the Tool
🔗 https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::

### Fill the Form

| Field | What to Enter | Example |
|-------|---------------|---------|
| **Coverage Type** | Select from dropdown | "Standard" |
| **Location** | City, State or ZIP | "San Francisco, CA" or "94122" |
| **Insurance For** | Type of insurance | "Single Driver" |
| **Years Licensed** | Select range | "10+" |
| **Mileage** | Annual miles | "10,001-15,000" |
| **Driving Record** | Violations | "Clean (no violations)" |
| **Vehicle Year** | Year | "2015" |
| **Vehicle Make** | Manufacturer | "Tesla" |
| **Vehicle Model** | Model | "Model S" |

### Read the Results

The tool will show a table like:

```
Carrier          | Annual Premium
---------------------------------
Progressive      | $1,650
GEICO            | $1,720
State Farm       | $1,890
Allstate         | $2,100
Liberty Mutual   | $1,950
```

Enter these annual premiums into the collection tool.

## 📁 Data Structure

After collection, your data looks like:

```json
{
  "source": "California Department of Insurance",
  "sourceUrl": "https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::",
  "lastUpdated": "2025-01-15T10:30:00.000Z",
  "profiles": [
    {
      "id": "sf-tesla-2015-standard-clean",
      "name": "SF Standard Mid-Age Tesla",
      "vehicle": "2015 Tesla Model S",
      "location": "San Francisco, CA (94122)",
      "rates": {
        "Progressive": { "annual": 1650, "monthly": 137 },
        "GEICO": { "annual": 1720, "monthly": 143 },
        "State Farm": { "annual": 1890, "monthly": 157 }
      },
      "collectedDate": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🔄 Workflow

```
┌─────────────────────────┐
│ 1. Access CA DOI Tool   │
│ (browser)               │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 2. Enter Profile        │
│ - Location, Vehicle     │
│ - Coverage, Record      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 3. Get Official Rates   │
│ - Progressive: $1,650   │
│ - GEICO: $1,720         │
│ - State Farm: $1,890    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 4. Run Collection Tool  │
│ node collect-ca-doi.js  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 5. Data Saved           │
│ data/ca-doi-reference/  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 6. Validate Engine      │
│ node validate-ca-doi.js │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 7. See Results          │
│ ✅ 85% accurate         │
│ or ❌ needs calibration │
└─────────────────────────┘
```

## 📈 Building Your Dataset

### Priority Order (collect in this order)

1. **Your Actual Profile** (most important!)
   - 2015 Tesla Model S, SF, Standard coverage
   - Validates your real quote

2. **Common Profiles** (high value)
   - 2018 Honda Civic, LA, Basic coverage
   - 2020 Toyota Camry, SD, Standard coverage

3. **Edge Cases** (comprehensive coverage)
   - Young driver (age 21-24)
   - Senior driver (age 65+)
   - Multiple violations
   - High-value vehicles

### Goal
- **Minimum**: 5 profiles
- **Good**: 20 profiles
- **Excellent**: 50+ profiles

## 🎯 Validation Targets

| Metric | Target | Status |
|--------|--------|--------|
| **Accuracy** | ±15% of CA DOI | Check with validation |
| **Coverage** | 5+ profiles | Run collection tool |
| **Carriers** | 4+ per profile | Enter all shown rates |
| **Freshness** | <30 days old | Quarterly updates |

## 🛠️ Troubleshooting

### "No data found" in CA DOI tool
- Try different location (use ZIP code instead of city)
- Simplify vehicle (just make/model, not trim)
- Check if site is available (government sites sometimes down)

### Collection tool errors
- Make sure `data/ca-doi-reference/` directory exists
- Check file permissions
- Run: `mkdir -p data/ca-doi-reference`

### Validation shows "NOT SET"
- You haven't collected CA DOI data yet
- Run `node scripts/collect-ca-doi-data.js` first
- Or manually update `caDoiRates` in validation script

## 📚 Advanced Usage

### Automated Scraping (Future)
See `scripts/scrape-ca-doi-rates-plan.md` for Playwright automation.

### Multi-State Expansion
Collect data from other state DOI tools:
- New York: https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison
- Texas: https://www.tdi.texas.gov/consumer/cpmautoquote.html
- Florida: https://www.floir.com/sections/pandc/AutoComparison.aspx

### API Integration
Use collected data to:
- Auto-calibrate quote engine
- A/B test accuracy improvements
- Generate validation reports

## ✅ Success Criteria

You'll know your quote engine is validated when:

1. **✅ At least 1 profile collected** from CA DOI
2. **✅ Validation shows ±15% accuracy** or better
3. **✅ Engine quotes match real-world** rates
4. **✅ Confidence in displaying quotes** to users

## 🚀 Next Steps After Validation

1. **Expand Coverage**
   - Collect 5-10 more profiles
   - Cover different cities, vehicles, drivers

2. **Calibrate Engine**
   - Adjust base rates based on CA DOI data
   - Fine-tune carrier multipliers

3. **Monitor Accuracy**
   - Re-run validation monthly
   - Update when CA DOI refreshes (quarterly)

4. **Production Ready**
   - Document accuracy metrics
   - Set up automated monitoring
   - Build confidence intervals

---

**Start now:** `node scripts/collect-ca-doi-data.js` 🚀

