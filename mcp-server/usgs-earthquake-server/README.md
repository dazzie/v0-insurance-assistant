# USGS Earthquake Risk MCP Server 🏚️

**FREE earthquake risk assessment** using USGS Earthquake Hazards Program data.

## What It Does

Assesses earthquake/seismic risk for any US location:
- **Earthquake Risk Score** (0-10 scale)
- **Risk Level** (Low/Moderate/High/Very High)
- **Peak Ground Acceleration (PGA)** - actual seismic measurement
- **Seismic Zone** (1-4, where 4 = highest risk)

## Why This Matters for Insurance

🏠 **Home/Renters Insurance:**
- High seismic risk = earthquake coverage recommended
- Standard policies **exclude** earthquake damage
- Earthquake insurance is a separate policy
- Can save $10K-100K+ in repairs

🏢 **Commercial Property:**
- Building code requirements in high-risk zones
- Retrofit requirements
- Higher premiums without earthquake coverage

## Installation

```bash
npm install
```

## Setup

**No API key needed!** Uses FREE USGS public API.

## Usage

```bash
# Start the server
npm start

# Or in development mode with auto-reload
npm run dev
```

## API

### Tool: `assess_earthquake_risk`

**Input:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "state": "CA"
}
```

**Output (with USGS API):**
```json
{
  "success": true,
  "earthquakeRisk": 9,
  "riskLevel": "Very High",
  "peakGroundAcceleration": 0.45,
  "seismicZone": 4,
  "description": "Very High earthquake risk - Major earthquakes likely - earthquake insurance strongly recommended",
  "usgsData": true,
  "enrichmentSource": "USGS Earthquake Hazards Program"
}
```

**Output (fallback - state-based):**
```json
{
  "success": true,
  "earthquakeRisk": 8,
  "riskLevel": "Very High",
  "peakGroundAcceleration": null,
  "seismicZone": 4,
  "description": "Very High earthquake risk - Major earthquakes likely - earthquake insurance strongly recommended",
  "usgsData": false,
  "message": "Using state-based seismic zone data",
  "enrichmentSource": "USGS National Seismic Hazard Model"
}
```

## Risk Levels

### By PGA (Peak Ground Acceleration)
| PGA | Risk Score | Risk Level | Description |
|-----|------------|------------|-------------|
| > 0.4g | 9-10 | Very High | Major earthquakes likely |
| 0.2-0.4g | 6-8 | High | Significant earthquake risk |
| 0.1-0.2g | 3-5 | Moderate | Moderate earthquake activity |
| < 0.1g | 1-2 | Low | Low earthquake probability |

### By Seismic Zone
| Zone | States | Risk Level |
|------|--------|------------|
| 4 | CA, AK | Very High |
| 3 | WA, OR, NV, ID, UT, HI | High |
| 2 | MT, WY, SC, MO, AR, TN, KY | Moderate |
| 1 | Most other states | Low |

## High-Risk States

**Very High (Zone 4):**
- 🌉 California - San Andreas Fault
- 🏔️ Alaska - Ring of Fire

**High (Zone 3):**
- 🌲 Washington - Cascadia Subduction Zone
- 🌲 Oregon - Cascadia Subduction Zone
- 🎰 Nevada - Basin and Range
- 🏔️ Idaho - Intermountain Seismic Belt
- ⛰️ Utah - Wasatch Fault
- 🌺 Hawaii - Volcanic activity

**Moderate (Zone 2):**
- 📍 Missouri/Arkansas/Tennessee - New Madrid Seismic Zone
- 🏛️ South Carolina - Charleston Seismic Zone

## Data Source

- **Primary:** USGS Earthquake Hazards Program (ASCE 7-16 API)
- **Fallback:** USGS National Seismic Hazard Model (state zones)
- **Cost:** FREE (no API key required)
- **Coverage:** Entire United States
- **Update:** Real-time seismic data

## Insurance Recommendations

### Very High Risk (CA, AK)
- ✅ Earthquake insurance **essential**
- ✅ Building retrofit may be required
- ✅ Higher deductibles (10-25% of dwelling)
- 💰 Annual premium: 1-3% of home value

### High Risk (WA, OR, NV, etc.)
- ✅ Earthquake insurance **recommended**
- ✅ Consider retrofitting older homes
- 💰 Annual premium: 0.5-2% of home value

### Moderate Risk
- ⚠️ Consider earthquake coverage
- 💰 Annual premium: 0.2-0.8% of home value

### Low Risk
- ℹ️ Standard policy may be sufficient
- ℹ️ Earthquake coverage optional

## Integration

This server provides earthquake risk data to:
1. **Flag high-risk properties** for earthquake insurance
2. **Calculate appropriate coverage** based on seismic zone
3. **Recommend building retrofits** for older structures
4. **Adjust premiums** based on location risk

## Example Use Cases

### California Home
```javascript
earthquakeRisk: 9 → "Very High"
PGA: 0.45g
→ Recommend: Earthquake insurance (separate policy)
→ Alert: Consider seismic retrofit
→ Premium: ~$2,000-3,000/year for $400K home
```

### Washington Home
```javascript
earthquakeRisk: 7 → "High"  
PGA: 0.25g
→ Recommend: Earthquake insurance
→ Premium: ~$800-1,500/year for $400K home
```

### Texas Home
```javascript
earthquakeRisk: 1 → "Low"
→ Standard coverage sufficient
→ Earthquake insurance optional
```

## See Also

- **USGS Earthquake Hazards:** https://earthquake.usgs.gov/
- **Setup Guide:** `/MCP_SERVERS_STATUS.md`
- **Integration:** `/app/api/analyze-coverage/route.ts`

