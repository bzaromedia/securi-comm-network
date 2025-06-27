#!/bin/bash

# 🧪 SecuriComm Development Environment Test Script
# Tests all components of the local development setup

set -e

echo "🧪 Testing SecuriComm Development Environment"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Test 1: Check if frontend is accessible
print_test "Testing frontend accessibility (localhost:8081)..."
if curl -s --connect-timeout 5 http://localhost:8081 >/dev/null 2>&1; then
    print_pass "Frontend is accessible at http://localhost:8081"
else
    print_fail "Frontend is not accessible. Run 'npm run dev' first."
fi

# Test 2: Check if backend is running
print_test "Testing backend server (localhost:3000)..."
if curl -s --connect-timeout 5 http://localhost:3000/health >/dev/null 2>&1; then
    print_pass "Backend server is running at http://localhost:3000"
    
    # Test API endpoints
    print_test "Testing API endpoints..."
    
    # Health endpoint
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
    if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
        print_pass "Health endpoint working"
    else
        print_fail "Health endpoint not responding correctly"
    fi
    
    # API docs endpoint
    if curl -s http://localhost:3000/api/docs >/dev/null 2>&1; then
        print_pass "API documentation accessible"
    else
        print_fail "API documentation not accessible"
    fi
    
else
    print_fail "Backend server is not running. Start it with 'cd server && npm run dev'"
fi

# Test 3: Check WebSocket connection
print_test "Testing WebSocket server (localhost:3001)..."
if command -v wscat >/dev/null 2>&1; then
    if timeout 5 wscat -c ws://localhost:3001 --execute "ping" 2>/dev/null; then
        print_pass "WebSocket server is responding"
    else
        print_fail "WebSocket server not responding"
    fi
else
    print_info "wscat not installed. Install with: npm install -g wscat"
fi

# Test 4: Check environment variables
print_test "Testing environment configuration..."
if [ -f ".env" ]; then
    print_pass ".env file exists"
    
    # Check required variables
    if grep -q "EXPO_PUBLIC_API_URL" .env; then
        print_pass "API URL configured"
    else
        print_fail "EXPO_PUBLIC_API_URL not found in .env"
    fi
    
    if grep -q "EXPO_PUBLIC_API_KEY" .env; then
        print_pass "API key configured"
    else
        print_fail "EXPO_PUBLIC_API_KEY not found in .env"
    fi
else
    print_fail ".env file not found. Copy from .env.example"
fi

# Test 5: Check dependencies
print_test "Testing dependencies..."
if [ -d "node_modules" ]; then
    print_pass "Frontend dependencies installed"
else
    print_fail "Frontend dependencies missing. Run 'npm install'"
fi

if [ -d "server/node_modules" ]; then
    print_pass "Backend dependencies installed"
else
    print_fail "Backend dependencies missing. Run 'cd server && npm install'"
fi

# Test 6: Check ports
print_test "Testing port availability..."
if lsof -i:8081 >/dev/null 2>&1; then
    print_pass "Port 8081 is in use (frontend)"
else
    print_fail "Port 8081 is not in use. Frontend may not be running."
fi

if lsof -i:3000 >/dev/null 2>&1; then
    print_pass "Port 3000 is in use (backend)"
else
    print_fail "Port 3000 is not in use. Backend may not be running."
fi

# Test 7: Test API integration
print_test "Testing API integration..."
if curl -s http://localhost:3000/api/status >/dev/null 2>&1; then
    print_pass "API status endpoint accessible"
    
    # Test authentication endpoint
    AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/test \
        -H "Content-Type: application/json" \
        -d '{"test": true}' 2>/dev/null || echo "failed")
    
    if [ "$AUTH_RESPONSE" != "failed" ]; then
        print_pass "Authentication endpoint responding"
    else
        print_fail "Authentication endpoint not responding"
    fi
else
    print_fail "API endpoints not accessible"
fi

echo ""
echo "🎯 Test Summary"
echo "==============="
echo "✅ Run this script after starting both servers:"
echo "   Terminal 1: npm run dev"
echo "   Terminal 2: cd server && npm run dev"
echo ""
echo "🌐 Access Points:"
echo "   Frontend: http://localhost:8081"
echo "   Backend:  http://localhost:3000"
echo "   API Docs: http://localhost:3000/api/docs"
echo "   Health:   http://localhost:3000/health"
echo ""
echo "🔧 If tests fail, run: ./scripts/quick-fix.sh"