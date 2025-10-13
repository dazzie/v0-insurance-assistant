# Hunter.io MCP Server

MCP server for email verification and validation using the Hunter.io API.

## Features

- **Email Verification**: Validate email deliverability and authenticity
- **Deliverability Score**: Get a 0-100 score for email quality
- **Risk Assessment**: Detect disposable emails, gibberish, and risky addresses
- **SMTP Validation**: Check if email server accepts messages
- **Person Enrichment**: Get name, position, and company data (when available)

## Tools

### `verify_email`

Verify an email address for deliverability and validity.

**Input:**
```json
{
  "email": "john.doe@example.com"
}
```

**Output:**
```json
{
  "success": true,
  "email": "john.doe@example.com",
  "status": "valid",
  "result": "deliverable",
  "score": 85,
  "regexp": true,
  "gibberish": false,
  "disposable": false,
  "webmail": false,
  "mxRecords": true,
  "smtpServer": true,
  "smtpCheck": true,
  "acceptAll": false,
  "block": false,
  "sources": 3,
  "firstName": "John",
  "lastName": "Doe",
  "position": "Software Engineer",
  "company": "Example Corp",
  "risk": "low",
  "enrichmentSource": "Hunter.io"
}
```

## Setup

### 1. Install Dependencies

```bash
cd mcp-server/hunter-server
npm install
```

### 2. Get Hunter.io API Key

1. Sign up at https://hunter.io/
2. Navigate to Dashboard → API
3. Copy your API key
4. Free tier includes **25 verifications/month**

### 3. Configure API Key

Add to `.env.local` in the project root:

```bash
HUNTER_API_KEY=your_api_key_here
```

### 4. Test the Server

```bash
# Test email verification
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"verify_email","arguments":{"email":"test@gmail.com"}}}' | node index.js
```

## Configuration in Cursor

Add to your Cursor settings (`.cursor/settings.json` or user settings):

```json
{
  "mcpServers": {
    "hunter": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/hunter-server/index.js"],
      "env": {
        "HUNTER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Email Verification Results

### Status Values
- `valid` - Email is valid and deliverable
- `invalid` - Email is invalid
- `accept_all` - Server accepts all emails (can't verify specific address)
- `webmail` - Free webmail service (Gmail, Yahoo, etc.)
- `disposable` - Temporary/disposable email address
- `unknown` - Unable to verify

### Result Values
- `deliverable` - Email is deliverable (safe to send)
- `undeliverable` - Email will bounce
- `risky` - Email might be risky (accept_all, role-based, etc.)
- `unknown` - Unable to determine deliverability

### Risk Levels
- `low` - High score (70+), deliverable, not disposable
- `medium` - Accept-all, lower score, or risky
- `high` - Disposable, gibberish, or undeliverable
- `unknown` - Unable to assess risk

## Use Cases for Insurance

1. **Fraud Detection**: Identify disposable/temporary emails
2. **Lead Quality**: Filter out gibberish or fake emails
3. **Deliverability**: Ensure policy documents can be delivered
4. **Data Enrichment**: Get person's name and company (for commercial policies)
5. **Risk Scoring**: Assess customer legitimacy before quoting

## Example Integration

```javascript
// In your analyze-coverage API route
async function enrichEmailData(email) {
  const emailData = await callMCPServer(
    'mcp-server/hunter-server',
    'verify_email',
    { email }
  );

  if (emailData.success && emailData.risk === 'low' && emailData.score >= 70) {
    return {
      email: emailData.email,
      verified: true,
      deliverable: emailData.result === 'deliverable',
      score: emailData.score,
      risk: emailData.risk,
      enrichmentSource: 'Hunter.io',
    };
  }

  return {
    email,
    verified: false,
    risk: emailData.risk || 'unknown',
  };
}
```

## API Limits

### Free Tier
- **25 verifications/month**
- All features included
- No credit card required

### Paid Plans
- **Starter**: $49/month (500 verifications)
- **Growth**: $99/month (1,000 verifications)
- **Business**: $199/month (5,000 verifications)

## Privacy & Compliance

Hunter.io is GDPR compliant and only uses publicly available data. Email verification does not send emails to the address being verified - it uses SMTP server checks and DNS lookups.

## Error Handling

If API key is not configured:
```json
{
  "success": false,
  "error": "Hunter.io API key not configured. Set HUNTER_API_KEY in .env.local",
  "note": "Sign up at https://hunter.io/ for free tier (25 verifications/month)"
}
```

If email format is invalid:
```json
{
  "success": false,
  "error": "Invalid email format",
  "email": "invalid-email"
}
```

## Benefits vs Other Email Verification APIs

| Feature | Hunter.io | ZeroBounce | Kickbox | NeverBounce |
|---------|-----------|------------|---------|-------------|
| Free Tier | 25/month | 100 credits | 100 credits | None |
| Person Data | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Company Data | ✅ Yes | ❌ No | ❌ No | ❌ No |
| SMTP Check | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Risk Score | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Domain Search | ✅ Yes | ❌ No | ❌ No | ❌ No |

Hunter.io's advantage is the **person enrichment** data, which can help with commercial insurance quotes (getting business contact info).

## Troubleshooting

### API Key Issues
- Verify key is in `.env.local`
- Restart the dev server after adding the key
- Check Hunter.io dashboard for remaining credits

### Rate Limiting
- Free tier: 25 verifications/month
- Consider caching results for repeat queries
- Only verify emails at critical points (policy submission, not during browsing)

---

**Ready to Use!** 🎯

Test the server and integrate it into your coverage analyzer for enhanced email verification!

