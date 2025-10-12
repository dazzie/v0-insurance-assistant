# OpenCage MCP Server 📍

Address standardization and geocoding using OpenCage Data API.

## Features

- ✅ Standardize US addresses
- ✅ Get lat/lng coordinates
- ✅ Extract city, state, county, zip
- ✅ Get timezone information
- ✅ Free tier: 2,500 requests/day
- ✅ Required for FEMA integration

## Setup

1. **Sign up for free API key:**
   - Visit: https://opencagedata.com/
   - Free tier: 2,500 requests/day
   - No credit card required

2. **Add to `.env.local`:**
   ```
   OPENCAGE_API_KEY=your_api_key_here
   ```

## Usage

### Example

```
Input: "1234 Market Street, San Francisco, CA 94102"
```

```json
{
  "success": true,
  "formatted": "1234 Market Street, San Francisco, CA 94102, USA",
  "street": "1234 Market Street",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94102",
  "county": "San Francisco County",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "timezone": "America/Los_Angeles",
  "confidence": 10
}
```

## Benefits for Insurance

- ✅ Clean address data for quotes
- ✅ Enable location-based pricing
- ✅ Feed coordinates to FEMA flood checker
- ✅ Validate customer addresses

