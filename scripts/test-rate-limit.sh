#!/bin/bash

# Rate Limiting Test Script
# This script tests your rate limiting by making multiple requests

echo "🧪 Testing Rate Limiting..."
echo ""
echo "Making 105 requests to /api/fines (limit is 100/minute)..."
echo ""

# Count successful and rate-limited responses
success=0
rate_limited=0

for i in {1..105}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/fines)
  
  if [ "$response" = "200" ]; then
    success=$((success + 1))
    echo -n "."
  elif [ "$response" = "429" ]; then
    rate_limited=$((rate_limited + 1))
    echo -n "X"
  else
    echo -n "?"
  fi
done

echo ""
echo ""
echo "✅ Results:"
echo "   Successful (200): $success"
echo "   Rate Limited (429): $rate_limited"
echo ""
echo "Expected: ~100 successful, ~5 rate limited"
echo ""

# Test with headers to see rate limit info
echo "📊 Checking rate limit headers on a successful request:"
echo ""
curl -s -I http://localhost:3000/api/fines | grep -i "x-ratelimit"
echo ""
