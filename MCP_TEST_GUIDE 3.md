# MCP Server Test Guide 🧪

Quick guide to test NHTSA and FEMA MCP servers.

## 🚗 Test #1: NHTSA VIN Decoder (WORKING)

### Good Test Queries

**Query 1: Pattern-based VIN (will decode make/model/year)**

```bash
cd mcp-server/nhtsa-server

echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "decode_vin",
    "arguments": {
      "vin": "5YJSA1E14HF123456"
    }
  }
}' | node index.js
```

**Expected Output:**
- Make: TESLA
- Model: Model S
- Year: 2017
- Body Class: Sedan/Saloon
- Fuel Type: Electric

---

**Query 2: Ford F-150**

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "decode_vin",
    "arguments": {
      "vin": "1FTFW1ET5BFA12345"
    }
  }
}' | node index.js
```

**Expected:**
- Make: FORD
- Model: F-150
- Year: 2011
- Body Class: Pickup

---

**Query 3: Honda Civic**

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "decode_vin",
    "arguments": {
      "vin": "2HGFC2F53HH123456"
    }
  }
}' | node index.js
```

**Expected:**
- Make: HONDA
- Model: Civic
- Year: 2017
- Body Class: Sedan/Saloon

---

### What to Look For

The server will return JSON with:
```json
{
  "success": true,  // or false if check digit invalid
  "vin": "...",
  "year": 2017,
  "make": "TESLA",
  "model": "Model S",
  "trim": "...",
  "bodyClass": "Sedan/Saloon",
  "fuelType": "Electric",
  "doors": 4,
  "abs": true,
  "esc": true,
  "transmission": "Automatic"
}
```

**Note:** NHTSA validates the VIN check digit (9th position). Sample VINs may show `success: false` with an error message, but will still return partial vehicle data based on the VIN pattern.

---

## 🌊 Test #3: FEMA Flood Zone Checker (API ENDPOINT ISSUE)

### Current Status

The FEMA NFHL API endpoint has changed/requires authentication. The server includes graceful fallback logic.

### Test Queries (will show "Not Available" currently)

**Query 1: San Francisco (Low Risk)**

```bash
cd ../fema-server

echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "check_flood_zone",
    "arguments": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}' | node index.js
```

**Expected (when API working):**
```json
{
  "success": true,
  "floodZone": "X",
  "riskLevel": "Minimal",
  "sfhaStatus": false,
  "floodInsuranceRequired": false,
  "description": "Minimal flood risk - Outside 500-year flood zone"
}
```

---

**Query 2: New Orleans (High Risk)**

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "check_flood_zone",
    "arguments": {
      "latitude": 29.9511,
      "longitude": -90.0715
    }
  }
}' | node index.js
```

**Expected (when API working):**
- Flood Zone: A or AE
- Risk Level: High
- Insurance Required: true

---

**Query 3: Miami Beach (Coastal High Risk)**

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "check_flood_zone",
    "arguments": {
      "latitude": 25.7907,
      "longitude": -80.1300
    }
  }
}' | node index.js
```

**Expected (when API working):**
- Flood Zone: V or VE
- Risk Level: High (Coastal)
- Insurance Required: true

---

### FEMA API Alternatives

Since the FEMA NFHL REST API endpoint has changed, here are alternatives:

1. **FEMA Map Service Center API**
   - Requires registration
   - More stable endpoint
   - Documentation: https://msc.fema.gov/portal/

2. **FloodSmart.gov Partner API**
   - Free for partners
   - Requires application

3. **State-Level Flood Databases**
   - California: https://myhazards.caloes.ca.gov/
   - Florida: https://www.floridadisaster.org/

4. **Commercial APIs**
   - ATTOM Data Solutions
   - CoreLogic
   - First Street Foundation

---

## 🎯 Quick Test Script

Save as `test-mcp.sh`:

```bash
#!/bin/bash
cd /Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 MCP SERVERS QUICK TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚗 Test 1: NHTSA VIN Decoder (Tesla Model S)"
cd mcp-server/nhtsa-server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"decode_vin","arguments":{"vin":"5YJSA1E14HF123456"}}}' | \
  node index.js 2>&1 | grep '"make"' | head -1
echo ""

echo "🌊 Test 2: FEMA Flood Zone (San Francisco)"
cd ../fema-server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_flood_zone","arguments":{"latitude":37.7749,"longitude":-122.4194}}}' | \
  node index.js 2>&1 | grep -E '"success"|"floodZone"' | head -2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

Run with: `bash test-mcp.sh`

---

## 📊 Interpreting Results

### NHTSA Success
- ✅ Returns vehicle details
- ⚠️  May show `success: false` if check digit invalid, but still returns data

### NHTSA Failure
- ❌ "Invalid VIN format" - VIN is not 17 characters or contains I, O, or Q

### FEMA Success (when API working)
- ✅ Returns flood zone and risk assessment

### FEMA Failure (current state)
- ⚠️  "Not Available" or API error - Endpoint changed/requires auth
- Solution: Use alternative flood data sources listed above

---

## 💡 Pro Tips

1. **NHTSA works great** - Use it liberally for VIN decoding
2. **FEMA needs updating** - Current endpoint unreliable
3. **For production** - Consider paid flood data APIs
4. **Test thoroughly** - Some VINs may have invalid check digits
5. **Cache results** - Avoid redundant API calls

---

## 🔧 Need Help?

- **NHTSA Issues?** → Check VIN format (17 chars, no I/O/Q)
- **FEMA Issues?** → Use alternative flood data source (see above)
- **Integration Help?** → See `MCP_ENRICHMENT_INTEGRATION.md`

