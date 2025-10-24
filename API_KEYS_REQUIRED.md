# 🔑 API Keys Required for Insurance Assistant

## 📍 **Environment File Location**
```
/Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant/.env.local
```

## 🚨 **REQUIRED API Keys**

### **1. NextAuth Secret (REQUIRED)**
```bash
NEXTAUTH_SECRET=oo4+c7+gxq/gYCeq1idgQFw/K+yzSEOzQ9xJiz58q0k=
NEXTAUTH_URL=http://localhost:3000
```
- ✅ **Status**: Already configured
- 🎯 **Purpose**: JWT session signing for authentication
- ⚠️ **Critical**: Without this, login fails with 401 errors

### **2. OpenAI API Key (REQUIRED for AI features)**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```
- ❌ **Status**: MISSING - needs to be added
- 🎯 **Purpose**: Chat interface, document analysis, policy analysis
- 📝 **Get from**: https://platform.openai.com/api-keys
- 💰 **Cost**: Pay-per-use (GPT-4 Vision for document analysis)
- ⚠️ **Critical**: Without this, chat and document analysis fail

## 🔧 **OPTIONAL API Keys (Enhanced Features)**

### **3. OpenCage Geocoding API (Optional)**
```bash
OPENCAGE_API_KEY=your_opencage_api_key_here
```
- 🎯 **Purpose**: Address standardization and geocoding
- 📝 **Get from**: https://opencagedata.com/
- 💰 **Cost**: FREE (2,500 requests/day)
- 🔄 **Fallback**: Works without key (limited functionality)

### **4. First Street API (Optional)**
```bash
FIRST_STREET_API_KEY=your_first_street_api_key_here
```
- 🎯 **Purpose**: Accurate flood risk assessment
- 📝 **Get from**: https://firststreet.org/
- 💰 **Cost**: FREE (1,000 lookups/month)
- 🔄 **Fallback**: Returns safe default values without key

### **5. Hunter.io API (Optional)**
```bash
HUNTER_API_KEY=your_hunter_api_key_here
```
- 🎯 **Purpose**: Email verification and validation
- 📝 **Get from**: https://hunter.io/
- 💰 **Cost**: FREE (25 verifications/month)
- 🔄 **Fallback**: Basic email validation without API

### **6. Vectorize.io API (Optional - RAG)**
```bash
VECTORIZE_IO_API_KEY=your_vectorize_io_api_key
VECTORIZE_IO_ORG_ID=your_org_id
VECTORIZE_IO_PIPELINE_ID=your_pipeline_id
```
- 🎯 **Purpose**: RAG (Retrieval-Augmented Generation) for enhanced chat
- 📝 **Get from**: https://vectorize.io/
- 💰 **Cost**: Varies by plan
- 🔄 **Fallback**: Standard chat without RAG enhancement

## 🎯 **Current Status**

### **✅ Working (No API Key Required):**
- ✅ **Authentication**: NextAuth with JWT sessions
- ✅ **User Management**: Profile and quote saving/loading
- ✅ **VIN Decoding**: NHTSA API (free, no key needed)
- ✅ **Crime Risk**: FBI data (free, no key needed)
- ✅ **Earthquake Risk**: USGS data (free, no key needed)
- ✅ **Wildfire Risk**: USGS data (free, no key needed)

### **❌ Missing (Needs API Key):**
- ❌ **Chat Interface**: Requires OpenAI API key
- ❌ **Document Analysis**: Requires OpenAI API key for GPT-4 Vision
- ⚠️ **Address Enrichment**: Limited without OpenCage API key
- ⚠️ **Flood Risk**: Safe defaults without First Street API key

## 🛠 **How to Add API Keys**

### **1. Edit the .env.local file:**
```bash
nano .env.local
# or
code .env.local
```

### **2. Add your OpenAI API key:**
```bash
# Replace this line:
OPENAI_API_KEY=your_openai_api_key_here

# With your actual key:
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### **3. Restart the server:**
```bash
# Kill current process
pkill -f "next dev"

# Restart
npm run dev
```

## 🎯 **Priority Order**

### **High Priority (Core Functionality):**
1. **OpenAI API Key** - Required for chat and document analysis
2. **NextAuth Secret** - ✅ Already configured

### **Medium Priority (Enhanced Features):**
3. **OpenCage API Key** - Better address enrichment
4. **First Street API Key** - Accurate flood risk data

### **Low Priority (Nice-to-Have):**
5. **Hunter.io API Key** - Email verification
6. **Vectorize.io Keys** - RAG enhancement

## 🚀 **Quick Setup for Testing**

### **Minimum Required Setup:**
```bash
# Edit .env.local and add:
OPENAI_API_KEY=sk-your-openai-key-here
```

### **Full Featured Setup:**
```bash
# Add all keys to .env.local:
OPENAI_API_KEY=sk-your-openai-key-here
OPENCAGE_API_KEY=your-opencage-key-here
FIRST_STREET_API_KEY=your-first-street-key-here
```

## 📊 **Current .env.local Contents**

Your current file has:
- ✅ **NEXTAUTH_SECRET** (working)
- ✅ **NEXTAUTH_URL** (working)
- ❌ **OPENAI_API_KEY** (commented out - needs real key)
- ❌ **Other API keys** (commented out - optional)

## 🎯 **Next Steps**

1. **Get OpenAI API Key** from https://platform.openai.com/api-keys
2. **Add to .env.local** (uncomment and replace placeholder)
3. **Restart server** to load new environment variables
4. **Test complete functionality** including chat and document analysis

**The authentication system is working perfectly - you just need the OpenAI API key for full functionality!** 🎉
