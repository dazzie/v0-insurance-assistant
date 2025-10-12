#!/bin/bash

# Deployment script for Personal Insurance Coverage Coach

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed"

# Check if environment variables are set
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found"
    echo "   Make sure to set environment variables in your deployment platform"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run build
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Test the build
echo "🧪 Testing production build..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if server is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Production server test passed!"
else
    echo "❌ Production server test failed"
    kill $SERVER_PID
    exit 1
fi

# Kill test server
kill $SERVER_PID

echo ""
echo "✅ All checks passed! Ready to deploy."
echo ""
echo "📋 Deployment options:"
echo "   1. Vercel: vercel --prod"
echo "   2. Netlify: netlify deploy --prod"
echo "   3. Manual: Copy .next folder to your server"
echo ""
echo "🔐 Don't forget to set environment variables:"
echo "   - OPENAI_API_KEY"
echo "   - VECTORIZE_IO_API_KEY"
echo "   - VECTORIZE_IO_PIPELINE_ID"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

