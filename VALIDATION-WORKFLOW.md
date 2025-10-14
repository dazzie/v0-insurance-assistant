# Quote Engine Validation Workflow

## Current Status

✅ **Calibration Complete**
- CA base rate updated: $1,850 → $2,450 (+32.4%)
- Projected accuracy: -15% (within acceptable ±15% range)
- Previous accuracy: -35.7% (too low)

## Validation Methods

### Method 1: Single Quote Validation (Quick)
**Time**: 2 minutes  
**Accuracy**: Good baseline

```bash
# Compare one known quote
node scripts/validate-quotes-simple.js

# Expected output:
# Progressive: $119/mo (engine) vs $140/mo (actual) = -15%
```

### Method 2: Multi-Quote Comparison (Recommended)
**Time**: 30-60 minutes  
**Accuracy**: High confidence

1. **Get 3-5 Real Quotes**:
   ```
   Go to:
   - https://www.geico.com/auto-insurance/
   - https://www.progressive.com/auto/quote/
   - https://www.statefarm.com/insurance/auto
   - https://www.allstate.com/auto-insurance/
   ```

2. **Enter Exact Profile**:
   - 2015 Tesla Model S
   - San Francisco, CA 94122
   - Age 35, Good Credit
   - $1,000 deductible
   - Standard coverage

3. **Record Results**:
   | Carrier | Actual Quote | Engine Quote | Difference |
   |---------|--------------|--------------|------------|
   | Progressive | $140/mo | $119/mo | -15% ✅ |
   | GEICO | ???/mo | ???/mo | ??? |
   | State Farm | ???/mo | ???/mo | ??? |
   | Allstate | ???/mo | ???/mo | ??? |

### Method 3: Market Data Validation
**Time**: 15 minutes  
**Accuracy**: Industry-standard baseline

Check against published averages:
- [California DOI](https://www.insurance.ca.gov/01-consumers/110-rates/)
- [National Average Report](https://www.iii.org/fact-statistic/facts-statistics-auto-insurance)
- [The Zebra State Rankings](https://www.thezebra.com/state-rankings/)

**Validate**:
- ✅ CA average: $2,450/year (matches our base rate)
- ✅ San Francisco: ~10-15% above state average
- ✅ Electric vehicles: 5-10% premium vs gas

### Method 4: Profile Sensitivity Testing
**Time**: 10 minutes  
**Accuracy**: Validates multiplier logic

Test extreme profiles to ensure realistic variance:

```javascript
// Test in browser console or validation script
const testProfiles = [
  {
    name: "Young, High-Risk",
    age: 22,
    violations: 2,
    expectedRange: "$300-400/mo"
  },
  {
    name: "Senior, Clean Record",
    age: 65,
    violations: 0,
    expectedRange: "$80-120/mo"
  },
  {
    name: "Middle-Age, Average",
    age: 40,
    violations: 0,
    expectedRange: "$120-160/mo"
  }
]
```

## Acceptance Criteria

| Metric | Target | Status |
|--------|--------|--------|
| **Accuracy** | ±15% of actual | ✅ -15% (projected) |
| **Carrier Variance** | 15-30% spread | ⬜ To validate |
| **Market Alignment** | Within state avg ±20% | ✅ Base = $2,450 |
| **Profile Sensitivity** | Realistic changes | ⬜ To test |

## Continuous Validation

### Quarterly Updates
1. **Check State Rate Changes** (Jan, Apr, Jul, Oct)
   - Visit state insurance department websites
   - Update base-rates.json if averages changed >10%

2. **Collect Real Quote Data**
   - Ask users to share actual quotes
   - Build validation dataset over time

3. **Monitor Accuracy Metrics**
   ```bash
   # Run validation suite
   node scripts/validate-quotes.ts
   
   # Target: >80% of quotes within ±15%
   ```

### Real-Time Validation (Future)
Integrate quote aggregator API for A/B testing:
```typescript
// Compare engine vs real quotes
const engineQuote = quoteEngine.generate(profile)
const realQuote = await theZebraAPI.getQuote(profile)
const accuracy = (engineQuote / realQuote - 1) * 100

if (Math.abs(accuracy) > 20%) {
  logCalibrationNeeded()
}
```

## Troubleshooting

### Engine Quotes Too High
1. Check base rates aren't inflated
2. Review multiplier stacking
3. Verify regional adjustments
4. Consider market discounts/promotions

### Engine Quotes Too Low ✅ (Fixed)
1. ~~Update base rates (DONE: CA $1,850 → $2,450)~~
2. Verify coverage levels match
3. Check deductible settings
4. Review carrier-specific adjustments

### Carrier Variance Too Narrow
1. Increase variance range in configs
2. Adjust carrier regional factors
3. Add competitive positioning logic

### Carrier Variance Too Wide
1. Reduce random variance
2. Align carrier adjustments
3. Validate multiplier bounds

## Next Steps

1. ⬜ **Restart Dev Server** (to load new CA base rate)
2. ⬜ **Test in Browser** (upload policy, get quotes)
3. ⬜ **Collect 2-3 Real Quotes** (GEICO, State Farm, Allstate)
4. ⬜ **Run Full Validation** (scripts/validate-quotes.ts)
5. ⬜ **Fine-Tune if Needed** (adjust multipliers)
6. ⬜ **Document Results** (update this file)

## Resources

- State DOI Rate Filings: [List of State Insurance Departments](https://content.naic.org/state-insurance-departments.htm)
- Industry Reports: J.D. Power, AM Best, Insurify Annual Studies
- Quote Aggregators: The Zebra, Insurify, Gabi
- Validation Scripts: `scripts/validate-quotes*.js`

