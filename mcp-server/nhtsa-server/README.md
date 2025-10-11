# NHTSA MCP Server 🚗

VIN decoding using the free NHTSA Vehicle API.

## Features

- ✅ Decode 17-character VINs
- ✅ Get complete vehicle details
- ✅ Safety features (ABS, ESC, etc.)
- ✅ Free, no API key required
- ✅ Unlimited requests

## Usage

### Test the server

```bash
node index.js
```

### Example VIN

```
VIN: 5YJ3E1EA8JF000123
Result: 2018 Tesla Model 3
```

## API

### Tool: `decode_vin`

**Input:**
```json
{
  "vin": "5YJ3E1EA8JF000123"
}
```

**Output:**
```json
{
  "success": true,
  "vin": "5YJ3E1EA8JF000123",
  "year": 2018,
  "make": "TESLA",
  "model": "Model 3",
  "bodyClass": "Sedan/Saloon",
  "fuelType": "Electric",
  "doors": 4,
  "abs": true,
  "esc": true,
  "transmission": "Automatic"
}
```

## Integration

See `MCP_ENRICHMENT_PLAN.md` for integration into the coverage analyzer.

