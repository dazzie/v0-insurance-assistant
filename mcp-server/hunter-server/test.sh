#!/bin/bash

# Test Hunter.io Email Verification MCP Server

echo "🧪 Testing Hunter.io MCP Server"
echo "================================"
echo ""

# Test 1: Valid Gmail address
echo "Test 1: Verify valid Gmail address"
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"verify_email","arguments":{"email":"test@gmail.com"}}}' | node index.js 2>/dev/null | tail -n 1 | jq '.'
echo ""

# Test 2: Invalid email format
echo "Test 2: Invalid email format"
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"verify_email","arguments":{"email":"invalid-email"}}}' | node index.js 2>/dev/null | tail -n 1 | jq '.'
echo ""

# Test 3: Disposable email
echo "Test 3: Disposable email (10minutemail.com)"
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"verify_email","arguments":{"email":"test@10minutemail.com"}}}' | node index.js 2>/dev/null | tail -n 1 | jq '.'
echo ""

echo "✅ Tests complete!"
echo ""
echo "📝 Note: If you see 'API key not configured', add HUNTER_API_KEY to .env.local"
echo "   Sign up at https://hunter.io/ for free tier (25 verifications/month)"


