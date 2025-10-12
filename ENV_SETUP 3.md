# Environment Variables Setup

## Quick Start

Create a `.env.local` file in the project root with the following content:

```bash
# Insurance Aggregator API Configuration
# Copy this and fill in your actual API keys

# ============================================
# Insurify API (Recommended)
# ============================================
# Sign up at: https://insurify.com/partners
# Docs: https://api.insurify.com/docs
INSURIFY_API_KEY=your_insurify_api_key_here
INSURIFY_PARTNER_ID=your_partner_id_here
INSURIFY_API_URL=https://api.insurify.com/v1

# ============================================
# OpenAI API Key (for chat and coverage analysis)
# ============================================
OPENAI_API_KEY=your_openai_api_key_here

# ============================================
# Vectorize.io API Key (for knowledge base)
# ============================================
VECTORIZE_IO_API_KEY=your_vectorize_api_key_here
VECTORIZE_IO_PIPELINE_ID=your_pipeline_id_here
```

---

## Running Without API Keys (Demo Mode)

**Good news!** The app works perfectly without any aggregator API keys:

- ✅ All features functional
- ✅ Realistic mock quote data
- ✅ Full UI testing
- ✅ Perfect for development

The app automatically detects missing API keys and falls back to high-quality mock data.

---

## Enabling Live Quotes

### Option 1: Insurify API (Recommended)

1. **Sign Up**: Visit https://insurify.com/partners
2. **Get API Key**: Request API access from their partner team
3. **Add to .env.local**:
   ```bash
   INSURIFY_API_KEY=your_actual_key_here
   INSURIFY_PARTNER_ID=your_id_here
   ```
4. **Restart Server**: `npm run dev`
5. **Verify**: Check console for "[Fetch Quotes] Calling Insurify API..."

### Option 2: SmartFinancial API

1. **Sign Up**: Visit https://smartfinancial.com/partners
2. **Get API Key**: Complete partner onboarding
3. **Add to .env.local**:
   ```bash
   SMARTFINANCIAL_API_KEY=your_key_here
   ```
4. **Update Code**: Modify `/api/fetch-quotes/route.ts` to use SmartFinancial format

### Option 3: Build Direct Carrier Integrations

See `AGGREGATOR_API_RESEARCH.md` for details on integrating directly with:
- State Farm API
- GEICO API
- Progressive API
- Allstate API

---

## API Mode Indicator

The quote results page shows the data source:

- **"✓ Live Pricing"** = Real API data
- **"(Demo Mode)"** = Mock data (no API key configured)
- **"🔗 Live API Data" badge** = Insurify API active

---

## Health Check

Test your API configuration:

```bash
curl http://localhost:3000/api/fetch-quotes
```

**Response:**
```json
{
  "status": "ok",
  "apiConfigured": false,
  "mode": "mock",
  "timestamp": "2025-01-06T..."
}
```

- `apiConfigured: true` = API key detected
- `mode: "live"` = Will use real API
- `mode: "mock"` = Will use demo data

---

## Security Best Practices

### ✅ Do:
- Store API keys in `.env.local`
- Add `.env.local` to `.gitignore`
- Use different keys for dev/staging/production
- Rotate keys regularly
- Monitor API usage
- Enable rate limiting

### ❌ Don't:
- Commit API keys to git
- Share keys in public channels
- Use production keys in development
- Expose keys in client-side code
- Skip error monitoring

---

## Troubleshooting

### Issue: "API key not configured"

**Solution**: 
1. Create `.env.local` file
2. Add `INSURIFY_API_KEY=...`
3. Restart dev server

### Issue: "Insurify API error: 401"

**Solution**: 
1. Verify API key is correct
2. Check if key has expired
3. Confirm partner account is active

### Issue: Quotes still showing mock data

**Solution**: 
1. Check browser console for "[Fetch Quotes] Calling Insurify API..."
2. If missing, API key not loaded
3. Restart dev server: `npm run dev`
4. Hard refresh browser (Cmd+Shift+R / Ctrl+F5)

### Issue: "Rate limit exceeded"

**Solution**: 
1. Implement caching in `/api/fetch-quotes`
2. Add rate limiting middleware
3. Contact Insurify for higher limits

---

## Cost Management

### Free Tier / Demo Mode:
- **Cost**: $0
- **Limitations**: Mock data only
- **Best For**: Development, testing, demos

### Insurify Pay-Per-Lead:
- **Cost**: $10-20 per qualified lead
- **When Charged**: Only when user contacts carrier
- **Best For**: Production, revenue generation

### Monthly Cost Estimates:

| Users/Month | Conversion | Leads | API Cost | Revenue* | Profit |
|-------------|------------|-------|----------|----------|--------|
| 100         | 20%        | 20    | $200     | $400     | $200   |
| 500         | 20%        | 100   | $1,000   | $2,000   | $1,000 |
| 1,000       | 20%        | 200   | $2,000   | $4,000   | $2,000 |
| 5,000       | 20%        | 1,000 | $10,000  | $20,000  | $10,000|

*Assumes $20 commission per lead

---

## Monitoring API Usage

### Console Logs:
```bash
[Fetch Quotes] Request received: { insuranceType: 'Auto', zip: '94102', ... }
[Fetch Quotes] Calling Insurify API...
[Fetch Quotes] Insurify response received: { quotesCount: 4 }
```

### Check API Health:
```bash
# Terminal
curl http://localhost:3000/api/fetch-quotes | jq

# Response
{
  "status": "ok",
  "apiConfigured": true,
  "mode": "live"
}
```

### Browser DevTools:
1. Open Network tab
2. Filter for "fetch-quotes"
3. Check request/response
4. Verify "source": "insurify" in response

---

## Production Checklist

Before deploying to production:

- [ ] API keys configured in hosting platform (Vercel, Netlify)
- [ ] Environment variables set correctly
- [ ] Rate limiting enabled
- [ ] Error monitoring active (Sentry)
- [ ] Analytics tracking configured
- [ ] Webhook endpoints secured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Load testing completed
- [ ] Cost alerts set up

---

## Support

### Insurify Support:
- Email: partners@insurify.com
- Docs: https://api.insurify.com/docs
- Status: https://status.insurify.com

### Your Support:
- Check `AGGREGATOR_API_RESEARCH.md` for integration details
- Review `/api/fetch-quotes/route.ts` for implementation
- See console logs for debugging

---

**Last Updated**: 2025-01-06  
**Status**: ✅ Ready for API Integration  
**Mode**: Works with or without API keys

