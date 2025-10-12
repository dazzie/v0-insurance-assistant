# First Street Foundation Flood Risk MCP Server 🌊

**Upgraded from FEMA!** Now using First Street Foundation API for better accuracy and climate projections.

## What It Does

Checks First Street Foundation flood data to determine:
- **Flood Factor** (1-10 scale - easy to understand!)
- Risk level (Minimal/Minor/Moderate/Major/Extreme)
- Whether flood insurance is required
- **Climate projections (30-year)** 🌍
- Property-level flood risk
- FEMA zone equivalent

## Why First Street > FEMA

✅ **More Accurate** - Property-level precision  
✅ **Climate Data** - 30-year projections included  
✅ **Easier Scale** - Simple 1-10 Flood Factor  
✅ **Better API** - Stable, reliable endpoints  
✅ **Graceful Fallback** - Works without API key  

## Installation

```bash
npm install
```

## Setup

1. Sign up at: **https://firststreet.org/**
2. Get free API key (1,000 lookups/month)
3. Add to `.env.local`:
   ```bash
   FIRST_STREET_API_KEY=your_key_here
   ```

**Note:** Server works WITHOUT API key (returns safe defaults), but you get much better data WITH the key!

## Usage

```bash
# Start the server
npm start

# Or in development mode with auto-reload
npm run dev
```

## API

### Tool: `check_flood_zone`

**Input:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Output (With API Key):**
```json
{
  "success": true,
  "floodFactor": 1,
  "riskLevel": "Minimal",
  "floodInsuranceRequired": false,
  "climateChange30Year": "Low",
  "description": "Minimal flood risk - Very low probability of flooding",
  "cumulativeRisk": 0.05,
  "femaFloodZone": "X",
  "source": "First Street Foundation"
}
```

**Output (Without API Key - Fallback):**
```json
{
  "success": true,
  "floodFactor": 1,
  "riskLevel": "Minimal",
  "floodInsuranceRequired": false,
  "climateChange30Year": "Low",
  "message": "Using default low-risk values. Configure FIRST_STREET_API_KEY for accurate data."
}
```

## Data Source

- **API:** First Street Foundation (https://firststreet.org/)
- **Cost:** Free tier (1,000 lookups/month)
- **Paid:** $0.05-$0.10 per lookup (optional)
- **Coverage:** United States (all 50 states)
- **Accuracy:** Property-level

## Flood Factor Scale

| Factor | Risk Level | Insurance | Description |
|--------|------------|-----------|-------------|
| 1-2    | Minimal    | Optional  | Very low probability |
| 2-4    | Minor      | Optional  | Low probability |
| 4-6    | Moderate   | Consider  | Moderate risk |
| 6-8    | Major      | Required  | High risk |
| 8-10   | Extreme    | Required  | Significant exposure |

## Integration

This server provides flood data to your insurance quote system to:
1. Determine if flood insurance is required
2. Adjust homeowners insurance premiums based on risk
3. Recommend appropriate coverage levels
4. **Show climate change impact on long-term risk**

## See Also

- **Setup Guide:** `/FIRST_STREET_SETUP.md`
- **Status Document:** `/MCP_SERVERS_STATUS.md`
