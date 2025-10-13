# FBI Crime Data MCP Server 🚨

**Free crime risk assessment** using FBI UCR (Uniform Crime Reporting) data.

## What It Does

Assesses crime risk for any US city/state:
- **Crime Index** (0-100 scale, US avg = 35.4)
- **Risk Level** (Low/Moderate/High/Very High)
- **Violent Crime Rate** (per 1,000 residents)
- **Property Crime Rate** (per 1,000 residents)

## Why This Matters for Insurance

🏠 **Home/Renters Insurance:**
- High crime = higher premiums
- Property crime affects theft coverage
- Some insurers require security systems in high-crime areas

🚗 **Auto Insurance:**
- Higher theft risk = higher comprehensive premiums
- Vandalism rates affect claims

## Installation

```bash
npm install
```

## Setup

**No API key needed!** Uses public FBI UCR data.

For expanded coverage (more cities), you can optionally add:
```bash
FBI_CRIME_API_KEY=your_key_here  # Optional
```

## Usage

```bash
# Start the server
npm start

# Or in development mode with auto-reload
npm run dev
```

## API

### Tool: `assess_crime_risk`

**Input:**
```json
{
  "city": "San Francisco",
  "state": "CA"
}
```

**Output:**
```json
{
  "success": true,
  "crimeIndex": 56.8,
  "riskLevel": "High",
  "violentCrime": 8.4,
  "propertyCrime": 48.4,
  "description": "High crime area - well above national average",
  "usAverage": 35.4,
  "enrichmentSource": "FBI UCR Data"
}
```

## Crime Index Scale

| Index | Risk Level | Description |
|-------|------------|-------------|
| 0-30  | Low        | Significantly below US average |
| 30-45 | Moderate   | Near or slightly below US average |
| 45-60 | High       | Well above US average |
| 60+   | Very High  | Significantly above US average |

**US Average:** 35.4

## Supported Cities (20 major metros)

✅ San Francisco, CA
✅ Los Angeles, CA  
✅ San Diego, CA
✅ New York, NY
✅ Chicago, IL
✅ Houston, TX
✅ Philadelphia, PA
✅ Phoenix, AZ
✅ San Antonio, TX
✅ Dallas, TX
✅ Austin, TX
✅ Seattle, WA
✅ Denver, CO
✅ Boston, MA
✅ Miami, FL
✅ Atlanta, GA
✅ Detroit, MI
✅ Las Vegas, NV
✅ Portland, OR
✅ Nashville, TN

**Other cities:** Returns US average as fallback

## Data Source

- **Source:** FBI Uniform Crime Reporting (UCR) Program + City-Data.com
- **Cost:** FREE (no API key required)
- **Coverage:** 20 major US cities + US average fallback
- **Update Frequency:** Annual (FBI releases yearly data)

## Integration

This server provides crime risk data to:
1. **Adjust insurance premiums** based on location risk
2. **Recommend security features** (alarms, cameras) for discounts
3. **Flag high-theft areas** for comprehensive auto coverage
4. **Proactively alert** customers to crime-related risks

## Example Use Cases

### Home Insurance
```javascript
// San Francisco home
crimeIndex: 56.8 → "High risk"
→ Recommend: Security system discount
→ Alert: Consider additional theft coverage
```

### Auto Insurance
```javascript
// Detroit auto
crimeIndex: 73.4 → "Very High risk"
→ Recommend: Comprehensive coverage (theft)
→ Alert: Higher premiums due to location
```

## See Also

- **Setup Guide:** `/MCP_SERVERS_STATUS.md`
- **Integration:** `/app/api/analyze-coverage/route.ts`

