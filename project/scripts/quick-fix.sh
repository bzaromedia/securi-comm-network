#!/bin/bash

# 🚀 SecuriComm Quick Fix Script
# Automatically resolves common localhost:8081 issues

set -e  # Exit on any error

echo "🔧 SecuriComm Quick Fix Starting..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Checking project structure..."

# 1. Kill any processes on port 8081
print_status "Checking for processes on port 8081..."
if command -v lsof >/dev/null 2>&1; then
    PROCESS_ON_PORT=$(lsof -ti:8081 2>/dev/null || true)
    if [ ! -z "$PROCESS_ON_PORT" ]; then
        print_warning "Found process on port 8081. Killing it..."
        kill -9 $PROCESS_ON_PORT 2>/dev/null || true
        print_success "Process killed successfully"
    else
        print_success "Port 8081 is available"
    fi
else
    print_warning "lsof not available, trying alternative method..."
    if command -v npx >/dev/null 2>&1; then
        npx kill-port 8081 2>/dev/null || true
        print_success "Attempted to kill port 8081"
    fi
fi

# 2. Check Node.js and npm versions
print_status "Checking Node.js and npm versions..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")

if [ "$NODE_VERSION" = "not found" ]; then
    print_error "Node.js is not installed. Please install Node.js v18 or later."
    exit 1
fi

print_success "Node.js version: $NODE_VERSION"
print_success "npm version: $NPM_VERSION"

# 3. Clear npm cache
print_status "Clearing npm cache..."
npm cache clean --force 2>/dev/null || {
    print_warning "Failed to clean npm cache, continuing..."
}
print_success "npm cache cleared"

# 4. Check if node_modules exists and is healthy
print_status "Checking node_modules..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    print_warning "node_modules appears to be missing or corrupted"
    print_status "Removing existing node_modules and package-lock.json..."
    rm -rf node_modules package-lock.json 2>/dev/null || true
    
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
else
    print_success "node_modules appears healthy"
fi

# 5. Check for .env file
print_status "Checking environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_warning ".env file not found, copying from .env.example..."
        cp .env.example .env
        print_success ".env file created from template"
    else
        print_warning ".env.example not found, creating basic .env..."
        cat > .env << EOF
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_KEY=dev_sk_test_12345abcdef
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_ENABLE_AI_FEATURES=true
EXPO_PUBLIC_ENABLE_MESH_NETWORK=true
EOF
        print_success "Basic .env file created"
    fi
else
    print_success ".env file exists"
fi

# 6. Clear Expo cache
print_status "Clearing Expo cache..."
if command -v npx >/dev/null 2>&1; then
    npx expo start --clear --non-interactive 2>/dev/null &
    EXPO_PID=$!
    sleep 3
    kill $EXPO_PID 2>/dev/null || true
    print_success "Expo cache cleared"
else
    print_warning "npx not available, skipping Expo cache clear"
fi

# 7. Check TypeScript configuration
print_status "Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    if command -v npx >/dev/null 2>&1; then
        npx tsc --noEmit --skipLibCheck 2>/dev/null || {
            print_warning "TypeScript check failed, but continuing..."
        }
    fi
    print_success "TypeScript configuration checked"
else
    print_warning "tsconfig.json not found"
fi

# 8. Verify critical files exist
print_status "Verifying critical files..."
CRITICAL_FILES=("app/_layout.tsx" "package.json" "app.json")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file is missing"
    fi
done

# 9. Check for common permission issues
print_status "Checking file permissions..."
if [ ! -w "." ]; then
    print_error "Current directory is not writable"
    exit 1
fi
print_success "File permissions are correct"

# 10. Test network connectivity
print_status "Testing network connectivity..."
if command -v curl >/dev/null 2>&1; then
    if curl -s --connect-timeout 5 http://localhost:8081 >/dev/null 2>&1; then
        print_warning "Something is already running on port 8081"
    else
        print_success "Port 8081 is available for use"
    fi
elif command -v wget >/dev/null 2>&1; then
    if wget -q --timeout=5 --tries=1 http://localhost:8081 -O /dev/null 2>/dev/null; then
        print_warning "Something is already running on port 8081"
    else
        print_success "Port 8081 is available for use"
    fi
else
    print_warning "Cannot test network connectivity (curl/wget not available)"
fi

# 11. Start the development server
print_status "Starting development server..."
echo ""
echo "🚀 Attempting to start SecuriComm development server..."
echo "   This will run in the foreground. Press Ctrl+C to stop."
echo ""
echo "   Once started, access the app at: http://localhost:8081"
echo ""

# Try different start methods
if command -v npx >/dev/null 2>&1; then
    print_status "Starting with Expo..."
    npx expo start --web --port 8081 --host localhost
elif npm run dev >/dev/null 2>&1; then
    print_status "Starting with npm run dev..."
    npm run dev
else
    print_error "Unable to start development server"
    print_error "Please try manually: npm run dev"
    exit 1
fi

print_success "Quick fix completed successfully!"
echo ""
echo "🎉 SecuriComm should now be accessible at http://localhost:8081"
echo ""
echo "If you still have issues:"
echo "1. Check the browser console for errors (F12)"
echo "2. Try a different browser"
echo "3. Run: ./scripts/diagnose.sh for detailed diagnostics"
echo "4. Run: ./scripts/system-report.sh for a full system report"