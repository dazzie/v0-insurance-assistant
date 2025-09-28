#!/bin/bash

echo "🔍 Monitoring Vectorize.io logs..."
echo "📡 Make a request to see RAG system in action:"
echo "   curl -X POST http://localhost:3000/api/chat -H 'Content-Type: application/json' -d '{\"messages\":[{\"role\":\"user\",\"content\":\"What is auto insurance?\"}],\"customerProfile\":{\"location\":\"CA\",\"age\":\"30\",\"needs\":[\"auto\"]}}'"
echo ""
echo "📋 Watching for Vectorize.io logs..."
echo "   Look for: [VectorizeIOClient] and [RAG] messages"
echo ""

# Monitor the Next.js dev server logs
# You can also use: tail -f /dev/null to see all logs
echo "💡 To see all logs, run this in another terminal:"
echo "   tail -f /dev/null"
echo ""
echo "🎯 Or check the terminal where you ran 'npm run dev'"
echo "   The Vectorize.io logs will appear there when you make requests"
