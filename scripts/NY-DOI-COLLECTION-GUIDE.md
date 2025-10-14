# New York DFS Auto Insurance Rate Collection Guide

## 🗽 New York Department of Financial Services (DFS)

### **Official Rate Comparison Tool**
**URL**: https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison

**Alternative URL** (if first doesn't work):
- https://myportal.dfs.ny.gov/web/guest-applications
- https://www.dfs.ny.gov/consumers/auto_insurance

## 🚀 Quick Start

### **Option 1: Sample Data (Testing)**
```bash
node scripts/batch-collect-ny-doi.js --yes
```
✅ 5 NY profiles with example rates (for demo)

### **Option 2: Real Data (Production)**
```bash
# 1. Copy template
cp scripts/ny-doi-rates-template.json scripts/my-ny-rates.json

# 2. Get real rates from NY DFS (see instructions below)

# 3. Update JSON with actual rates

# 4. Import
node scripts/batch-collect-ny-doi.js --file scripts/my-ny-rates.json
```

## 📋 How to Use NY DFS Tool

### **Step 1: Access the Tool**
Go to: https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison

### **Step 2: Enter Profile Details**

| Field | Example Value | Notes |
|-------|---------------|-------|
| **Coverage Type** | Standard | Basic, Standard, or Premium |
| **Location** | New York, NY | Or use ZIP code (10001) |
| **Driver Type** | Individual | Single driver |
| **Years Licensed** | 10+ | Select from dropdown |
| **Annual Mileage** | 10,001-15,000 | Miles per year |
| **Driving Record** | Clean | No violations/accidents |
| **Age** | 30-49 | Age bracket |
| **Gender** | Male/Female | Required in NY |
| **Vehicle Year** | 2015 | |
| **Vehicle Make** | Tesla | |
| **Vehicle Model** | Model S | |

### **Step 3: View Results**

NY DFS will display a comparison table:

```
Carrier              6-Month Premium    Annual Premium
──────────────────────────────────────────────────────
Progressive          $925               $1,850
GEICO                $960               $1,920
State Farm           $1,050             $2,100
Allstate             $1,175             $2,350
Liberty Mutual       $1,090             $2,180
```

### **Step 4: Record in JSON**

Update `scripts/my-ny-rates.json`:

```json
{
  "profiles": [
    {
      "id": "ny-tesla-2015-standard-clean",
      "name": "NYC Standard Mid-Age Tesla",
      "location": "New York, NY",
      "state": "NY",
      "vehicle": "2015 Tesla Model S",
      "rates": {
        "Progressive": { 
          "annual": 1850, 
          "monthly": 154 
        },
        "GEICO": { 
          "annual": 1920, 
          "monthly": 160 
        }
      }
    }
  ]
}
```

**Monthly Calculation**: `Math.round(annual / 12)`

## 🎯 Priority Profiles for New York

### **Profile 1: NYC Tesla (High Priority)** ⭐⭐⭐⭐⭐
```
Location: New York, NY (10001)
Vehicle: 2015 Tesla Model S
Coverage: Standard
Years Licensed: 10+
Mileage: 10,001-15,000
Record: Clean
Age: 30-49
```
**Why**: High-cost market, matches CA profile

### **Profile 2: NYC Honda (Common)** ⭐⭐⭐⭐
```
Location: New York, NY
Vehicle: 2018 Honda Civic
Coverage: Standard
Years Licensed: 3-5
Mileage: 10,001-15,000
Record: Clean
Age: 21-29
```
**Why**: Popular vehicle, young driver

### **Profile 3: Buffalo Toyota (Regional)** ⭐⭐⭐
```
Location: Buffalo, NY
Vehicle: 2020 Toyota Camry
Coverage: Basic
Years Licensed: 10+
Mileage: 5,001-10,000
Record: Clean
Age: 30-49
```
**Why**: Lower-cost upstate market

### **Profile 4: Albany Truck (Risk)** ⭐⭐⭐
```
Location: Albany, NY
Vehicle: 2019 Ford F-150
Coverage: Standard
Years Licensed: 10+
Mileage: 15,001-20,000
Record: 1 violation
Age: 30-49
```
**Why**: Tests violation multipliers

### **Profile 5: NYC Premium Tesla (High-End)** ⭐⭐
```
Location: New York, NY
Vehicle: 2021 Tesla Model 3
Coverage: Premium
Years Licensed: 3-5
Mileage: 5,001-10,000
Record: Clean
Age: 21-29
```
**Why**: Premium coverage segment

## 📊 NY vs CA Comparison

| Aspect | California | New York | Difference |
|--------|-----------|----------|------------|
| **Avg Premium** | $1,850/year | $2,150/year | +16% higher |
| **Tool Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | Similar |
| **Data Format** | Annual premium | 6-month + Annual | Easy conversion |
| **Registration** | None | None | Both free |
| **Ease of Use** | Very Easy | Easy | CA slightly better |

## 🔄 Complete Workflow

```
┌─────────────────────────────────────┐
│ 1. Access NY DFS Tool               │
│ https://myportal.dfs.ny.gov/...     │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 2. Enter Profile Details            │
│ - Location: New York, NY            │
│ - Vehicle: 2015 Tesla Model S       │
│ - Coverage: Standard                │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 3. View Official Rates              │
│ Progressive: $1,850/year            │
│ GEICO: $1,920/year                  │
│ State Farm: $2,100/year             │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 4. Update JSON Template             │
│ scripts/my-ny-rates.json            │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 5. Run Collection Script            │
│ $ node batch-collect-ny-doi.js      │
│   --file my-ny-rates.json           │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 6. Data Merged with CA Data         │
│ data/ca-doi-reference/index.json    │
│ (now contains CA + NY)              │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 7. Run Validation                   │
│ $ node validate-with-ca-doi.js      │
│ (validates both CA and NY)          │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ 8. Review Multi-State Results       │
│ ✅ CA: Progressive 86% accurate     │
│ ✅ NY: Progressive 82% accurate     │
└─────────────────────────────────────┘
```

## 🎯 Quick Commands

### **Test with Sample NY Data**
```bash
node scripts/batch-collect-ny-doi.js --yes
```

### **Production Collection**
```bash
# Copy template
cp scripts/ny-doi-rates-template.json scripts/my-ny-rates.json

# Fill with real NY DFS data
# ...

# Import
node scripts/batch-collect-ny-doi.js --file scripts/my-ny-rates.json

# Validate all states
node scripts/validate-with-ca-doi.js
```

### **View Current Data**
```bash
# Count profiles by state
node -e "const d=require('./data/ca-doi-reference/index.json'); console.log('CA:', d.profiles.filter(p=>p.state==='CA').length); console.log('NY:', d.profiles.filter(p=>p.state==='NY').length)"
```

## 🔧 Troubleshooting

### **NY DFS Tool Issues**

**"Tool not loading"**
- ✅ Try alternative URL: https://www.dfs.ny.gov/consumers/auto_insurance
- ✅ Clear browser cache
- ✅ Try different browser

**"Different results than expected"**
- ✅ Ensure you selected correct coverage level
- ✅ Verify ZIP code (NYC vs upstate = big difference)
- ✅ Check age bracket selection

**"Some carriers not shown"**
- ✅ Normal - not all carriers serve all areas
- ✅ Focus on top 5 carriers
- ✅ Skip carriers with no data

### **Data Format Notes**

**NY DFS shows 6-month premiums**:
- Annual = 6-month × 2
- Monthly = Annual ÷ 12

**Example**:
```
NY DFS shows: $925 (6-month)
Calculate:
  Annual = $925 × 2 = $1,850
  Monthly = $1,850 ÷ 12 = $154
```

## 📈 Expected NY Rates (2025)

Based on market data:

| Location | Vehicle Type | Avg Annual Premium |
|----------|--------------|-------------------|
| **NYC** | Sedan | $2,100 - $2,800 |
| **NYC** | SUV/Truck | $2,400 - $3,200 |
| **NYC** | Luxury/Electric | $2,600 - $3,500 |
| **Buffalo** | Sedan | $1,200 - $1,800 |
| **Buffalo** | SUV/Truck | $1,400 - $2,000 |
| **Albany** | Sedan | $1,400 - $2,000 |
| **Albany** | SUV/Truck | $1,600 - $2,200 |

**NYC is 40-60% more expensive than upstate NY**

## ✅ Success Checklist

- [ ] Accessed NY DFS tool successfully
- [ ] Collected Profile 1 (NYC Tesla)
- [ ] Collected Profile 2 (NYC Honda)
- [ ] Collected Profile 3 (Buffalo Toyota)
- [ ] Updated JSON with real rates
- [ ] Ran batch collection script
- [ ] Data saved to shared index.json
- [ ] Ran multi-state validation
- [ ] Reviewed NY accuracy results

## 🚀 Next Steps

After NY is complete:

1. **Validate Both States**:
   ```bash
   node scripts/validate-with-ca-doi.js
   ```

2. **Add More States**:
   - Texas (next)
   - Florida
   - Illinois

3. **Multi-State Coverage**:
   - CA + NY = 18% of US market
   - Add TX, FL = 34% of US market
   - Add 6 more = 50% of US market

---

**Start Collecting NY Data**: `node scripts/batch-collect-ny-doi.js --yes` 🗽

