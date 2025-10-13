# MCP Servers Overview

This project includes **4 MCP servers** for data enrichment and verification in the insurance assistant application.

## 🚗 Available MCP Servers

### 1. **NHTSA VIN Decoder** (Vehicle Enrichment)
**Status**: ✅ Integrated & Working  
**Cost**: FREE (unlimited)  
**Location**: `mcp-server/nhtsa-server/`

**Purpose**: Decode Vehicle Identification Numbers (VINs) to get detailed vehicle specifications

**Tool**: `decode_vin`

**Returns**:
- Year, make, model
- Body type, fuel type, doors
- Manufacturer details
- Plant location
- GVWR (weight rating)
- Safety features (ABS, ESC)

**Use Case**: Enrich vehicle data during policy scan for accurate underwriting

**Integration**: ✅ Integrated in `/api/analyze-coverage`

---

### 2. **OpenCage Geocoding** (Address Verification)
**Status**: ✅ Integrated & Working  
**Cost**: FREE (2,500 requests/day)  
**Location**: `mcp-server/opencage-server/`

**Purpose**: Geocode and standardize addresses for risk assessment

**Tool**: `geocode_address`

**Returns**:
- Formatted address
- Latitude/longitude
- Address components (street, city, state, ZIP)
- Confidence score (0-10)
- Timezone
- Bounding box

**Use Case**: Verify property address, standardize for rating, assess location-based risks

**Integration**: ✅ Integrated in `/api/analyze-coverage`

**Configuration**: Requires `OPENCAGE_API_KEY` in `.env.local`

---

### 3. **First Street Foundation** (Flood Risk Assessment)
**Status**: ⚠️  Requires API Key  
**Cost**: FREE (limited) / Paid (unlimited)  
**Location**: `mcp-server/fema-server/` (renamed from FEMA)

**Purpose**: Assess flood risk and climate hazards for property insurance

**Tool**: `get_flood_risk`

**Returns**:
- Flood risk score (1-10)
- Risk factor (minimal/minor/moderate/major/severe/extreme)
- Environmental risks
- Adaptation details
- Historical data

**Use Case**: Property insurance underwriting, flood coverage recommendations

**Integration**: ⚠️  Not yet integrated (requires API key signup)

**Configuration**: Requires `FIRST_STREET_API_KEY` in `.env.local`

**Sign up**: https://firststreet.org/api/

---

### 4. **Hunter.io** (Email Verification) ✨ NEW
**Status**: ✅ Ready to Use  
**Cost**: FREE (25 verifications/month)  
**Location**: `mcp-server/hunter-server/`

**Purpose**: Verify email deliverability and detect fraud

**Tool**: `verify_email`

**Returns**:
- Deliverability score (0-100)
- Status (valid/invalid/disposable/webmail)
- Risk assessment (low/medium/high)
- SMTP validation
- MX records check
- Disposable email detection
- Person enrichment (name, position, company)

**Use Case**: 
- Fraud detection (disposable emails)
- Lead quality scoring
- Ensure policy documents are deliverable
- Data enrichment for commercial insurance

**Integration**: ⚠️  Not yet integrated

**Configuration**: Requires `HUNTER_API_KEY` in `.env.local`

**Sign up**: https://hunter.io/ (free tier: 25 verifications/month)

---

## 📊 Integration Status

| Server | Status | API Key Required | Integrated | Cost |
|--------|--------|------------------|------------|------|
| **NHTSA** | ✅ Working | ❌ No | ✅ Yes | FREE |
| **OpenCage** | ✅ Working | ✅ Yes | ✅ Yes | FREE (2,500/day) |
| **First Street** | ⚠️  Pending | ✅ Yes | ❌ No | FREE (limited) |
| **Hunter.io** | ✅ Ready | ✅ Yes | ❌ No | FREE (25/month) |

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd mcp-server/nhtsa-server && npm install
cd ../opencage-server && npm install
cd ../hunter-server && npm install
cd ../fema-server && npm install
```

### 2. Configure API Keys

Add to `.env.local` in project root:

```bash
# OpenCage (required for address verification)
OPENCAGE_API_KEY=your_opencage_key

# Hunter.io (optional for email verification)
HUNTER_API_KEY=your_hunter_key

# First Street (optional for flood risk)
FIRST_STREET_API_KEY=your_firststreet_key
```

### 3. Test Servers

```bash
# Test NHTSA (no API key needed)
cd mcp-server/nhtsa-server && ./test.sh

# Test OpenCage (requires API key)
cd mcp-server/opencage-server && ./test.sh

# Test Hunter.io (requires API key)
cd mcp-server/hunter-server && ./test.sh

# Test First Street (requires API key)
cd mcp-server/fema-server && ./test.sh
```

---

## 🎯 Recommended Integration Priority

### Phase 1: Core Enrichment (DONE ✅)
1. ✅ NHTSA - Vehicle data enrichment
2. ✅ OpenCage - Address verification

### Phase 2: Fraud Prevention (NEXT 🎯)
3. **Hunter.io - Email verification**
   - Integrate into `/api/analyze-coverage`
   - Verify email during policy scan
   - Display verification badge in profile

### Phase 3: Risk Assessment (FUTURE 🔮)
4. First Street - Flood risk for property insurance
   - Integrate when adding home insurance quotes
   - Display risk scores in coverage recommendations

---

## 💰 Cost Analysis (for 1,000 quotes/month)

### Free Tier Usage:
| Service | Free Limit | Monthly Usage (est.) | Cost |
|---------|------------|---------------------|------|
| NHTSA | Unlimited | 1,000 | $0 |
| OpenCage | 2,500/day | 1,000 | $0 |
| Hunter.io | 25/month | 25 | $0 |
| **Total** | | | **$0** |

### Paid Tier (if needed):
| Service | Upgrade Cost | Monthly Usage | Cost |
|---------|--------------|---------------|------|
| OpenCage | $50/month | 1,000 | $0 (still free) |
| Hunter.io | $49/month | 500 | $49 |
| First Street | Contact | 100 | TBD |
| **Total** | | | **~$50-100/month** |

**ROI**: If conversion rate is 5%, that's 50 policies @ $100 commission each = $5,000 revenue.  
**Verification cost**: $50-100/month  
**Net profit**: $4,900-4,950/month 🎉

---

## 📖 Documentation

Each MCP server has its own detailed README:
- [NHTSA Server](./nhtsa-server/README.md)
- [OpenCage Server](./opencage-server/README.md)
- [Hunter.io Server](./hunter-server/README.md)
- [First Street Server](./fema-server/README.md)

---

## 🔧 Next Steps

### To Integrate Hunter.io Email Verification:

1. **Get API Key**: Sign up at https://hunter.io/
2. **Add to `.env.local`**: `HUNTER_API_KEY=your_key`
3. **Integrate in coverage analyzer**:
   - Add email enrichment function
   - Call Hunter.io MCP server
   - Display verification badge in profile
4. **Follow NHTSA/OpenCage pattern**:
   - Protect enriched email data from overwrites
   - Display "✓ Hunter.io Verified" badge
   - Show deliverability score

Would you like me to integrate Hunter.io into the coverage analyzer now? 🚀

