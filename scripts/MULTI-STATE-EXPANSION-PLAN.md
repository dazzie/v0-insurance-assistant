# Multi-State DOI Data Collection - Expansion Plan

## 🎯 Goal
Expand CA DOI validation system to all 50 states for comprehensive quote engine validation.

## 📊 State-by-State Assessment

### **Tier 1: Excellent Online Tools** (Easy - 1-2 days each)

| State | Population | Market % | DOI Tool | Status |
|-------|-----------|----------|----------|--------|
| **California** | 39M | 12% | ✅ Interactive | ✅ **COMPLETE** |
| **New York** | 19M | 6% | ✅ Interactive | 🔄 Next |
| **Illinois** | 13M | 4% | ✅ Web-based | 🔄 Queue |

**Tools:**
- CA: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::
- NY: https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison
- IL: https://insurance.illinois.gov/cb/autorate.html

**Estimated Time**: 1 week for all 3 states (CA done)

---

### **Tier 2: Good Online Tools** (Medium - 2-3 days each)

| State | Population | Market % | DOI Tool | Difficulty |
|-------|-----------|----------|----------|------------|
| **Texas** | 30M | 9% | ✅ Account req'd | 🟡 Medium |
| **Florida** | 22M | 7% | ✅ PDF-based | 🟡 Medium |
| **Pennsylvania** | 13M | 4% | ✅ Available | 🟡 Medium |
| **Ohio** | 12M | 4% | ✅ Available | 🟡 Medium |

**Tools:**
- TX: https://www.tdi.texas.gov/consumer/cpmautoquote.html
- FL: https://www.floir.com/sections/pandc/AutoComparison.aspx
- PA: https://www.insurance.pa.gov/
- OH: https://insurance.ohio.gov/

**Estimated Time**: 2 weeks for all 4 states

---

### **Tier 3: Limited/Manual Data** (Hard - 3-5 days each)

| State | Population | Market % | Data Availability | Difficulty |
|-------|-----------|----------|-------------------|------------|
| **All Others** | Varies | Varies | ❓ Research needed | 🔴 Hard |

**Approach**: Manual data collection, industry reports, carrier filings

**Estimated Time**: 3-4 months for remaining 43 states

---

## 🚀 Implementation Strategy

### **Option 1: Manual Collection** (Fastest)

**Process:**
1. Visit state DOI website
2. Enter profile details
3. Record rates in JSON
4. Import with batch tool

**Pros:**
- ✅ Works for any state
- ✅ No automation needed
- ✅ Quick setup (hours, not days)

**Cons:**
- ❌ Time-consuming (4 hours per state)
- ❌ Not repeatable
- ❌ Quarterly updates require manual work

**Best for**: 1-5 states, initial testing

---

### **Option 2: Semi-Automated** (Recommended)

**Process:**
1. Create state-specific collection scripts
2. Manual data entry from DOI sites
3. Automated validation and import
4. Quarterly manual updates

**Pros:**
- ✅ Faster than pure manual
- ✅ Repeatable process
- ✅ Easy to update

**Cons:**
- ⚠️ Still requires manual data collection
- ⚠️ 2-3 hours setup per state

**Best for**: 5-20 states, production use

---

### **Option 3: Full Automation** (Most Scalable)

**Process:**
1. Build Playwright scrapers for each state
2. Automated data extraction
3. Scheduled updates (monthly/quarterly)
4. Auto-validation

**Pros:**
- ✅ Fully automated
- ✅ Scalable to 50 states
- ✅ Easy quarterly updates
- ✅ Production-ready

**Cons:**
- ❌ High initial development (20-40 hours)
- ❌ Maintenance for site changes
- ❌ May need proxies/rate limiting

**Best for**: 20+ states, long-term production

---

## 📋 Recommended Rollout

### **Week 1-2: Add New York** (Proof of Concept)

```bash
# 1. Create NY template
cp scripts/ca-doi-rates-template.json scripts/ny-doi-rates-template.json

# 2. Update with NY profiles
# Edit: Change "San Francisco, CA" → "New York, NY"
# Update rates from NY DOI tool

# 3. Collect data
node scripts/batch-collect-ca-doi.js --file scripts/ny-rates.json

# 4. Update validation script to handle multiple states
# Modify: scripts/validate-with-ca-doi.js
```

**Deliverable**: NY validation working alongside CA

---

### **Week 3-4: Add Texas & Florida**

Same process for TX and FL

**Deliverable**: 4 states (CA, NY, TX, FL) = 34% market coverage

---

### **Month 2: Add Top 10 States**

Add: IL, PA, OH, GA, NC, MI

**Deliverable**: 10 states = 52% market coverage

---

### **Month 3-4: Automation Layer**

Build Playwright scrapers for automated collection

**Deliverable**: Automated updates for top 10 states

---

### **Month 5-6: Remaining States**

Manual collection + industry data for remaining 40 states

**Deliverable**: All 50 states covered

---

## 🛠️ Technical Implementation

### **Multi-State Data Structure**

Already compatible! Current structure works:

```json
{
  "source": "State Insurance Departments",
  "states": {
    "CA": {
      "sourceUrl": "https://interactive.web.insurance.ca.gov/...",
      "lastUpdated": "2025-01-15",
      "profiles": [ ... ]
    },
    "NY": {
      "sourceUrl": "https://myportal.dfs.ny.gov/...",
      "lastUpdated": "2025-01-20",
      "profiles": [ ... ]
    }
  }
}
```

---

### **State-Specific Collection Scripts**

```javascript
// scripts/collect-ny-doi-data.js
const NY_DOI_URL = 'https://myportal.dfs.ny.gov/...'

const nyProfiles = [
  {
    id: 'ny-tesla-2015-standard-clean',
    name: 'NYC Standard Mid-Age Tesla',
    location: 'New York, NY',
    state: 'NY',
    // ... same structure as CA
  }
]

// Rest identical to CA version
```

---

### **Updated Validation Script**

```javascript
// scripts/validate-multi-state.js
function validateByState(state) {
  const stateData = loadStateData(state)
  const engineQuotes = generateQuotes({ state, ... })
  
  compareAndValidate(stateData, engineQuotes)
}

// Run for all states
['CA', 'NY', 'TX', 'FL'].forEach(validateByState)
```

---

## 📊 Market Coverage Analysis

| Phase | States | Population | Market % | Time |
|-------|--------|------------|----------|------|
| **Current** | CA | 39M | 12% | ✅ Done |
| **Phase 1** | +NY, TX, FL | 110M | 34% | 2 weeks |
| **Phase 2** | +10 more | 170M | 52% | 1 month |
| **Phase 3** | All 50 | 330M | 100% | 3 months |

---

## 💰 Cost-Benefit Analysis

### **Manual Collection**
- **Time**: 4 hours/state × 50 states = 200 hours
- **Cost**: $10,000 (at $50/hour)
- **Updates**: 200 hours/year (quarterly)

### **Semi-Automated**
- **Setup**: 40 hours development
- **Collection**: 2 hours/state × 50 = 100 hours
- **Cost**: $7,000 initial
- **Updates**: 100 hours/year

### **Full Automation**
- **Setup**: 120 hours development
- **Maintenance**: 20 hours/year
- **Cost**: $6,000 initial, $1,000/year
- **ROI**: Break-even in 6 months

**Recommendation**: Start semi-automated, move to full automation after 10 states

---

## ✅ Success Criteria

### **Phase 1 Complete** (2 weeks)
- [ ] NY data collected
- [ ] TX data collected
- [ ] FL data collected
- [ ] Multi-state validation working
- [ ] 34% market coverage

### **Phase 2 Complete** (1 month)
- [ ] 10 states total
- [ ] 52% market coverage
- [ ] Documented process for each state

### **Phase 3 Complete** (3 months)
- [ ] All 50 states
- [ ] 100% market coverage
- [ ] Quarterly update process
- [ ] Automation for top 20 states

---

## 🎯 Quick Start: Add Your Second State (NY)

1. **Copy template**:
   ```bash
   cp scripts/ca-doi-rates-template.json scripts/ny-rates.json
   ```

2. **Update profiles** (change CA → NY):
   ```json
   {
     "location": "New York, NY",
     "vehicle": "2015 Tesla Model S",
     "rates": { ... }
   }
   ```

3. **Visit NY DOI**:
   https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison

4. **Collect rates**, update JSON

5. **Import**:
   ```bash
   node scripts/batch-collect-ca-doi.js --file scripts/ny-rates.json
   ```

6. **Validate**:
   ```bash
   node scripts/validate-with-ca-doi.js
   ```

**Done!** You now have 2 states.

---

## 📚 Resources

### **State DOI Links**
- [National Association of Insurance Commissioners](https://content.naic.org/state-insurance-departments)
- [State DOI Directory](https://www.naic.org/state_web_map.htm)

### **Industry Data Sources**
- [NAIC Database](https://www.naic.org/prod_serv/consumer_information_resources.htm)
- [Insurance Information Institute](https://www.iii.org/facts-statistics)
- [AM Best](https://www.ambest.com/)

---

**Next Step**: Add New York (2 days) → Proof of concept for multi-state 🚀

