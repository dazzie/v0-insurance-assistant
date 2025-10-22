# CA DOI Rate Collection - Complete Guide

## 🎯 Three Ways to Collect Official CA Insurance Rates

### **Method 1: Interactive Tool** (Recommended for First Time)
Step-by-step guided collection:

```bash
node scripts/collect-ca-doi-data.js
```

**Best for:**
- Learning the process
- Collecting 1-2 profiles manually
- Understanding the data structure

---

### **Method 2: Batch Collection with Sample Data** (Quick Testing)
Load 5 pre-configured profiles with example rates:

```bash
node scripts/batch-collect-ca-doi.js --yes
```

**Best for:**
- Quick testing and validation
- Understanding the system
- Development/demo purposes

**⚠️ Warning:** Uses EXAMPLE rates, not real CA DOI data!

---

### **Method 3: Batch Collection with Custom JSON** (Production)
Use your own collected rates from a JSON file:

```bash
node scripts/batch-collect-ca-doi.js --file my-rates.json
```

**Best for:**
- Production use with real data
- Bulk updates
- Automated workflows

---

## 📋 Step-by-Step: Method 3 (Recommended for Production)

### **Step 1: Copy the Template**
```bash
cp scripts/ca-doi-rates-template.json scripts/my-ca-doi-rates.json
```

### **Step 2: Get Official Rates from CA DOI**

Visit: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::

For each profile in the template:

#### Profile 1: Your Actual Policy (2015 Tesla Model S, SF)
```
Coverage Type:        Standard
Location:             San Francisco, CA (or 94122)
Years Licensed:       10+
Annual Mileage:       10,001-15,000
Driving Record:       Clean (no violations)
Vehicle Year:         2015
Vehicle Make:         Tesla
Vehicle Model:        Model S
```

**CA DOI will show:**
```
Carrier              Annual Premium
─────────────────────────────────────
Progressive          $1,650
GEICO                $1,720
State Farm           $1,890
Allstate             $2,100
Liberty Mutual       $1,950
```

### **Step 3: Update JSON File**

Edit `scripts/my-ca-doi-rates.json`:

```json
{
  "profiles": [
    {
      "id": "sf-tesla-2015-standard-clean",
      "name": "SF Standard Mid-Age Tesla (CURRENT PROFILE)",
      "location": "San Francisco, CA (94122)",
      "vehicle": "2015 Tesla Model S",
      "coverage": "Standard",
      "yearsLicensed": "10+",
      "mileage": "10,001-15,000 miles/year",
      "drivingRecord": "Clean (no violations)",
      "rates": {
        "Progressive": { "annual": 1650, "monthly": 138 },
        "GEICO": { "annual": 1720, "monthly": 143 },
        "State Farm": { "annual": 1890, "monthly": 158 },
        "Allstate": { "annual": 2100, "monthly": 175 },
        "Liberty Mutual": { "annual": 1950, "monthly": 163 }
      }
    }
  ]
}
```

**Monthly Calculation:** `Math.round(annual / 12)`

### **Step 4: Import Data**

```bash
node scripts/batch-collect-ca-doi.js --file scripts/my-ca-doi-rates.json
```

**Output:**
```
✅ Loaded 5 profiles from: scripts/my-ca-doi-rates.json

🎯 CA DOI Batch Rate Collection
================================================================

[1/5] SF Standard Mid-Age Tesla (CURRENT PROFILE)
✅ Added new profile
   Carriers: 5
   Avg Premium: $1862/year ($155/mo)
```

### **Step 5: Validate**

```bash
node scripts/validate-with-ca-doi.js
```

**Output:**
```
✅ Loaded CA DOI data from collected dataset

Carrier         CA DOI      Engine        Diff        Status
----------------------------------------------------------------
Progressive     $138/mo     $119/mo    -$19 (-13.8%)  ✅ Accurate
GEICO           $143/mo     $95/mo     -$48 (-33.6%)  ❌ Off Target
```

---

## 📊 Priority Profiles to Collect

### **Profile 1: Your Actual Policy** ⭐⭐⭐⭐⭐
- **2015 Tesla Model S, San Francisco**
- Validates against your real Progressive policy ($1,675/year)

### **Profile 2: Common Sedan** ⭐⭐⭐⭐
- **2018 Honda Civic, Los Angeles**
- High-volume market segment

### **Profile 3: Budget Coverage** ⭐⭐⭐
- **2020 Toyota Camry, San Diego, Basic coverage**
- Price-sensitive segment

### **Profile 4: Higher Risk** ⭐⭐⭐
- **2019 Ford F-150, Sacramento, 1 violation**
- Tests violation multipliers

### **Profile 5: Premium Coverage** ⭐⭐
- **2021 Tesla Model 3, San Francisco, Premium**
- High-value segment

---

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────┐
│ Choose Collection Method            │
├─────────────────────────────────────┤
│ 1. Interactive (first time)         │
│ 2. Batch Sample (testing)           │
│ 3. Batch JSON (production)          │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Access CA DOI Tool (browser)        │
│ https://interactive.web...          │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ For Each Profile:                   │
│ 1. Enter details in CA DOI          │
│ 2. Get official rates               │
│ 3. Record in JSON                   │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Run Batch Collection                │
│ $ node batch-collect-ca-doi.js      │
│   --file my-rates.json              │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Data Saved                          │
│ data/ca-doi-reference/index.json    │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Run Validation                      │
│ $ node validate-with-ca-doi.js      │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Review Results                      │
│ ✅ Progressive: 86% accurate        │
│ ❌ GEICO: needs calibration         │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Calibrate Engine (if needed)        │
│ Edit config/factors/base-rates.json │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Re-validate                         │
│ ✅ All carriers >85% accurate       │
└─────────────────────────────────────┘
```

---

## 📚 Available Tools

### **Collection Tools**
1. `collect-ca-doi-data.js` - Interactive, step-by-step
2. `batch-collect-ca-doi.js` - Batch import from JSON
3. `ca-doi-rates-template.json` - Empty template to fill

### **Validation Tools**
1. `validate-with-ca-doi.js` - Auto-loads collected data
2. `validate-quotes-simple.js` - Quick engine check

### **Templates & Guides**
1. `ca-doi-rates-template.json` - Profile template
2. `ca-doi-validation-guide.md` - Detailed instructions
3. `scrape-ca-doi-rates-plan.md` - Future automation

---

## 🎯 Quick Commands

### **Start Fresh with Sample Data**
```bash
# Collect 5 sample profiles (for testing)
node scripts/batch-collect-ca-doi.js --yes

# Validate
node scripts/validate-with-ca-doi.js
```

### **Production Collection**
```bash
# Copy template
cp scripts/ca-doi-rates-template.json scripts/production-rates.json

# Edit with real CA DOI data
# ... (get rates from CA DOI website)

# Import
node scripts/batch-collect-ca-doi.js --file scripts/production-rates.json

# Validate
node scripts/validate-with-ca-doi.js
```

### **Update Existing Profile**
```bash
# Edit your JSON file with new rates
# ... 

# Re-import (will update existing profiles)
node scripts/batch-collect-ca-doi.js --file scripts/production-rates.json
```

---

## 🔧 Troubleshooting

### **"No data found" in CA DOI**
- Use ZIP code instead of city name
- Simplify vehicle (just make/model)
- Check if CA DOI site is available

### **"File not found" error**
- Ensure JSON file exists
- Use correct path (relative or absolute)
- Check JSON syntax is valid

### **Validation shows "NOT SET"**
- No data collected yet
- Run batch collection first
- Check `data/ca-doi-reference/index.json` exists

### **All carriers "Off Target"**
- Base rate may be incorrect
- Check `config/factors/base-rates.json`
- Verify CA DOI rates are current (not outdated)

---

## ✅ Success Checklist

- [ ] Copied template: `ca-doi-rates-template.json`
- [ ] Accessed CA DOI tool
- [ ] Collected rates for Profile 1 (your actual policy)
- [ ] Updated JSON with real rates
- [ ] Ran batch collection successfully
- [ ] Data saved to `data/ca-doi-reference/index.json`
- [ ] Ran validation script
- [ ] Reviewed accuracy results
- [ ] Calibrated if needed (>15% variance)
- [ ] Re-validated (now <15% variance)

---

## 📈 Accuracy Goals

| Metric | Target | Action if Not Met |
|--------|--------|-------------------|
| **Overall Accuracy** | ±15% avg | Update base rates |
| **Progressive** | ±10% | Fine-tune Progressive config |
| **Profile Coverage** | 5+ profiles | Collect more profiles |
| **Data Freshness** | <30 days | Re-collect quarterly |

---

## 🚀 Next Steps

1. **Immediate** (today):
   - Collect Profile 1 (your actual policy)
   - Run validation
   - Check accuracy

2. **Short-term** (this week):
   - Collect all 5 priority profiles
   - Calibrate engine if needed
   - Document results

3. **Long-term** (this month):
   - Collect 20+ profiles
   - Set up quarterly update schedule
   - Monitor accuracy trends

---

**Quick Start:** `node scripts/batch-collect-ca-doi.js --yes` 🚀

