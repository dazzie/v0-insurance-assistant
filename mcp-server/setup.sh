#!/bin/bash

# Vectorize MCP Server Setup Script
# This script sets up the MCP server for Claude Code integration

set -e

echo "🚀 Vectorize MCP Server Setup"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the mcp-server directory."
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Check for environment variables
echo "🔍 Checking environment variables..."
ENV_FILE="../.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Warning: ../.env.local not found"
    echo "   Please create .env.local with your Vectorize.io credentials:"
    echo ""
    echo "   VECTORIZE_IO_API_KEY=your_api_key"
    echo "   VECTORIZE_IO_ORG_ID=your_org_id"
    echo "   VECTORIZE_IO_PIPELINE_ID=your_pipeline_id"
    echo ""
else
    # Check if required variables exist
    if grep -q "VECTORIZE_IO_API_KEY" "$ENV_FILE" && \
       grep -q "VECTORIZE_IO_ORG_ID" "$ENV_FILE" && \
       grep -q "VECTORIZE_IO_PIPELINE_ID" "$ENV_FILE"; then
        echo "✅ Environment variables found in ../.env.local"
    else
        echo "⚠️  Warning: Some Vectorize.io environment variables are missing from .env.local"
        echo "   Required: VECTORIZE_IO_API_KEY, VECTORIZE_IO_ORG_ID, VECTORIZE_IO_PIPELINE_ID"
    fi
fi

echo ""

# Make index.js executable
chmod +x index.js
echo "✅ Made index.js executable"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Ensure your Vectorize.io credentials are in ../.env.local"
echo "   2. Add MCP server configuration to Claude Code settings:"
echo ""
echo "      {"
echo "        \"mcpServers\": {"
echo "          \"vectorize-insurance\": {"
echo "            \"command\": \"node\","
echo "            \"args\": [\"$(pwd)/index.js\"]"
echo "          }"
echo "        }"
echo "      }"
echo ""
echo "   3. Restart Claude Code"
echo "   4. Test with: 'Use search_insurance_knowledge to find comprehensive coverage'"
echo ""
echo "📚 See README.md for detailed instructions"
