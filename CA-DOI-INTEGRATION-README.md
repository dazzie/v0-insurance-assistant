# CA DOI Reference Data Integration

## 🎯 Purpose
Extract official insurance rates from the California Department of Insurance (CA DOI) to validate and calibrate your quote engine for maximum accuracy.

## ⚡ Quick Start (5 Minutes)

### 1. Collect Official Rates
```bash
node scripts/collect-ca-doi-data.js
```

### 2. Validate Your Engine
```bash
node scripts/validate-with-ca-doi.js
```

## 🔗 CA DOI Rate Comparison Tool

**URL**: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::

This is the **official** California state tool for comparing auto insurance rates.

## 📋 How to Use CA DOI Tool

### Step 1: Access the Tool
Open https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO::: in your browser

### Step 2: Enter Profile Details

| Field | Value (for current profile) |
|-------|------------------------------|
| Coverage Type | Standard |
| Location | San Francisco, CA or 94122 |
| Insurance For | Single Driver |
| Years Licensed | 10+ |
| Annual Mileage | 10,001-15,000 |
| Driving Record | Clean (no violations) |
| Vehicle Year | 2015 |
| Vehicle Make | Tesla |
| Vehicle Model | Model S |

### Step 3: Get Results

The tool displays a comparison table:

```
Carrier              Annual Premium
─────────────────────────────────────
Progressive          $1,650
GEICO                $1,720
State Farm           $1,890
Allstate             $2,100
Liberty Mutual       $1,950
Farmers              $1,780
Nationwide           $1,920
Travelers            $2,050
```

### Step 4: Record in Collection Tool

Run `node scripts/collect-ca-doi-data.js` and enter these annual premiums when prompted.

## 📊 Data Storage

Collected data is saved to:
```
data/ca-doi-reference/index.json
```

Format:
```json
{
  "source": "California Department of Insurance",
  "sourceUrl": "https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::",
  "lastUpdated": "2025-01-15T10:30:00.000Z",
  "profiles": [
    {
      "id": "sf-tesla-2015-standard-clean",
      "name": "SF Standard Mid-Age Tesla (CURRENT PROFILE)",
      "location": "San Francisco, CA (94122)",
      "vehicle": "2015 Tesla Model S",
      "coverage": "Standard",
      "rates": {
        "Progressive": { "annual": 1650, "monthly": 138 },
        "GEICO": { "annual": 1720, "monthly": 143 }
      },
      "collectedDate": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🔄 Complete Workflow

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. Open CA DOI Tool                               │
│     https://interactive.web.insurance.ca.gov/...   │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  2. Enter Profile                                  │
│     - Location: San Francisco                      │
│     - Vehicle: 2015 Tesla Model S                  │
│     - Coverage: Standard                           │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  3. View Official Rates                            │
│     Progressive:  $1,650/year                      │
│     GEICO:        $1,720/year                      │
│     State Farm:   $1,890/year                      │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  4. Run Collection Tool                            │
│     $ node scripts/collect-ca-doi-data.js          │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  5. Enter Rates Interactively                      │
│     Progressive: 1650                              │
│     GEICO: 1720                                    │
│     (etc.)                                         │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  6. Data Saved                                     │
│     ✅ data/ca-doi-reference/index.json            │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  7. Run Validation                                 │
│     $ node scripts/validate-with-ca-doi.js         │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  8. View Accuracy Report                           │
│     ✅ Progressive: 86% accurate                   │
│     ❌ GEICO: 65% accurate (needs calibration)     │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  9. Calibrate (if needed)                          │
│     Edit: config/factors/base-rates.json           │
│     Restart: npm run dev                           │
│                                                     │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  10. Re-validate                                   │
│      $ node scripts/validate-with-ca-doi.js        │
│      ✅ All carriers now >85% accurate             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🎯 Priority Profiles to Collect

### **Profile 1: Your Actual Policy** ⭐⭐⭐⭐⭐
- **Location**: San Francisco, CA (94122)
- **Vehicle**: 2015 Tesla Model S
- **Coverage**: Standard
- **Years Licensed**: 10+
- **Mileage**: 10,001-15,000
- **Record**: Clean
- **Why**: Validates against your real policy

### **Profile 2: Common Sedan, LA** ⭐⭐⭐⭐
- **Location**: Los Angeles, CA
- **Vehicle**: 2018 Honda Civic
- **Coverage**: Basic
- **Years Licensed**: 3-5
- **Why**: High volume market segment

### **Profile 3: SUV, San Diego** ⭐⭐⭐
- **Location**: San Diego, CA
- **Vehicle**: 2020 Toyota RAV4
- **Coverage**: Standard
- **Why**: Popular vehicle type

### **Profile 4: Truck, Sacramento** ⭐⭐⭐
- **Location**: Sacramento, CA
- **Vehicle**: 2019 Ford F-150
- **Coverage**: Standard
- **Why**: Different vehicle class

### **Profile 5: Luxury, SF** ⭐⭐
- **Location**: San Francisco, CA
- **Vehicle**: 2021 BMW 3 Series
- **Coverage**: Premium
- **Why**: High-value segment

## 📈 Building Your Dataset

### **Goals**
- **Minimum**: 1 profile (your actual policy)
- **Good**: 5 profiles (major variations)
- **Great**: 20+ profiles (comprehensive)

### **Coverage Strategy**
1. **Geographic**: SF, LA, SD, Sacramento, Fresno
2. **Vehicle Types**: Sedan, SUV, Truck, Luxury, Electric
3. **Coverage Levels**: Basic, Standard, Premium
4. **Driver Profiles**: Young, Mid-age, Senior
5. **Records**: Clean, 1 violation, 2+ violations

## 🔧 Troubleshooting

### CA DOI Tool Issues

**"No results found"**
- ✅ Try ZIP code instead of city name
- ✅ Simplify vehicle (just make/model, not trim)
- ✅ Check if tool is online (government sites have downtime)

**"Rates seem wrong"**
- ✅ Ensure you selected correct coverage level
- ✅ Double-check years licensed
- ✅ Verify mileage bracket
- ✅ Confirm driving record

### Collection Tool Issues

**"Cannot find data directory"**
- ✅ Run: `mkdir -p data/ca-doi-reference`
- ✅ Check file permissions

**"Validation shows 'NOT SET'"**
- ✅ You haven't collected data yet
- ✅ Run `node scripts/collect-ca-doi-data.js` first

## 📊 Validation Metrics

### **Accuracy Targets**

| Carrier | Target | How to Achieve |
|---------|--------|---------------|
| **All Carriers** | ±15% average | Update base rates |
| **Progressive** | ±10% | Fine-tune Progressive config |
| **GEICO** | ±10% | Adjust GEICO regional factors |
| **State Farm** | ±15% | Update State Farm discounts |

### **Calibration Process**

If validation shows >15% difference:

1. **Check Base Rate**
   ```json
   // config/factors/base-rates.json
   {
     "auto": {
       "stateAverages": {
         "CA": 2450  // Adjust this
       }
     }
   }
   ```

2. **Adjust Carrier Factor**
   ```json
   // config/carriers/progressive.json
   {
     "adjustments": {
       "regions": {
         "west": 1.00  // Adjust this
       }
     }
   }
   ```

3. **Test Again**
   ```bash
   # Restart server to reload configs
   npm run dev
   
   # Re-run validation
   node scripts/validate-with-ca-doi.js
   ```

## 🚀 Future Enhancements

### **Automated Scraping** (Phase 2)
See: `scripts/scrape-ca-doi-rates-plan.md`
- Playwright automation
- Scheduled updates
- Multi-profile batch collection

### **Multi-State Expansion** (Phase 3)
- New York: https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison
- Texas: https://www.tdi.texas.gov/consumer/cpmautoquote.html
- Florida: https://www.floir.com/sections/pandc/AutoComparison.aspx

### **API Integration** (Phase 4)
- Real-time rate checking
- Automated calibration
- Confidence intervals

## ✅ Success Checklist

- [ ] Accessed CA DOI tool successfully
- [ ] Collected first profile (your actual policy)
- [ ] Saved to `data/ca-doi-reference/index.json`
- [ ] Ran validation script
- [ ] Accuracy within ±20% (acceptable start)
- [ ] Collected 5+ profiles (recommended)
- [ ] Calibrated engine (if needed)
- [ ] Accuracy within ±15% (production ready)

## 📚 Related Documentation

- `QUOTE-ENGINE-COMPLETE-SUMMARY.md` - Full engine overview
- `QUOTE-VALIDATION-QUICKSTART.md` - Quick start guide
- `scripts/scrape-ca-doi-rates-plan.md` - Automation plan
- `lib/quote-engine/README.md` - Technical docs

---

**Start now**: `node scripts/collect-ca-doi-data.js` 🚀

