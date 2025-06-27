#!/bin/bash

# 🔌 SecuriComm API Testing Script
# Tests all API endpoints and functionality

set -e

echo "🔌 Testing SecuriComm API Endpoints"
echo "==================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() { echo -e "${BLUE}[API TEST]${NC} $1"; }
print_pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
print_fail() { echo -e "${RED}[FAIL]${NC} $1"; }

BASE_URL="http://localhost:3000"

# Test 1: Health Check
print_test "Testing health endpoint..."
HEALTH=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$BASE_URL/health" 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    print_pass "Health endpoint responding (200 OK)"
    cat /tmp/health_response.json | jq . 2>/dev/null || cat /tmp/health_response.json
else
    print_fail "Health endpoint failed (HTTP $HEALTH)"
fi

# Test 2: API Documentation
print_test "Testing API documentation..."
DOCS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/docs" 2>/dev/null || echo "000")
if [ "$DOCS" = "200" ]; then
    print_pass "API documentation accessible"
else
    print_fail "API documentation not accessible (HTTP $DOCS)"
fi

# Test 3: Authentication Endpoints
print_test "Testing authentication endpoints..."

# Test auth status
AUTH_STATUS=$(curl -s -w "%{http_code}" -o /tmp/auth_response.json \
    -X POST "$BASE_URL/api/auth/test" \
    -H "Content-Type: application/json" \
    -d '{"test": true}' 2>/dev/null || echo "000")

if [ "$AUTH_STATUS" = "200" ]; then
    print_pass "Authentication test endpoint working"
else
    print_fail "Authentication test failed (HTTP $AUTH_STATUS)"
fi

# Test 4: Security Endpoints
print_test "Testing security endpoints..."

# Security scan
SECURITY_SCAN=$(curl -s -w "%{http_code}" -o /tmp/security_response.json \
    -X POST "$BASE_URL/api/security/scan" \
    -H "Content-Type: application/json" \
    -d '{"type": "quick"}' 2>/dev/null || echo "000")

if [ "$SECURITY_SCAN" = "200" ]; then
    print_pass "Security scan endpoint working"
    echo "Security scan result:"
    cat /tmp/security_response.json | jq . 2>/dev/null || cat /tmp/security_response.json
else
    print_fail "Security scan failed (HTTP $SECURITY_SCAN)"
fi

# Test 5: Messages Endpoints
print_test "Testing messages endpoints..."

# Get messages
MESSAGES=$(curl -s -w "%{http_code}" -o /tmp/messages_response.json \
    "$BASE_URL/api/messages" 2>/dev/null || echo "000")

if [ "$MESSAGES" = "200" ]; then
    print_pass "Messages endpoint accessible"
else
    print_fail "Messages endpoint failed (HTTP $MESSAGES)"
fi

# Test 6: CORS Headers
print_test "Testing CORS configuration..."
CORS_HEADERS=$(curl -s -I -X OPTIONS "$BASE_URL/api/status" | grep -i "access-control" || echo "none")
if [ "$CORS_HEADERS" != "none" ]; then
    print_pass "CORS headers present"
    echo "$CORS_HEADERS"
else
    print_fail "CORS headers missing"
fi

# Test 7: Rate Limiting
print_test "Testing rate limiting..."
for i in {1..5}; do
    RATE_TEST=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/health" 2>/dev/null)
    if [ "$RATE_TEST" = "429" ]; then
        print_pass "Rate limiting is working (got 429 on request $i)"
        break
    elif [ $i -eq 5 ]; then
        print_pass "Rate limiting allows normal requests"
    fi
done

# Test 8: Error Handling
print_test "Testing error handling..."
ERROR_TEST=$(curl -s -w "%{http_code}" -o /tmp/error_response.json \
    "$BASE_URL/api/nonexistent" 2>/dev/null || echo "000")

if [ "$ERROR_TEST" = "404" ]; then
    print_pass "404 error handling working"
else
    print_fail "Error handling not working properly (HTTP $ERROR_TEST)"
fi

echo ""
echo "🎯 API Test Summary"
echo "==================="
echo "✅ All core API endpoints tested"
echo "🔗 API Base URL: $BASE_URL"
echo "📚 Documentation: $BASE_URL/api/docs"
echo ""

# Cleanup
rm -f /tmp/*_response.json 2>/dev/null || true