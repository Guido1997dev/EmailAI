#!/bin/bash
echo "Testing server..."
curl -s http://localhost:3001/ > /tmp/test.html 2>&1
if [ -s /tmp/test.html ]; then
  echo "✅ Server responds"
  head -5 /tmp/test.html
else
  echo "❌ No response"
fi
