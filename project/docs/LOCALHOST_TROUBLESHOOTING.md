# 🔧 SecuriComm Localhost:8081 Troubleshooting Guide

## 📋 Quick Diagnostic Checklist

Before diving into detailed troubleshooting, run through this quick checklist:

- [ ] Development server is running (`npm run dev`)
- [ ] Port 8081 is not blocked by firewall
- [ ] No other applications using port 8081
- [ ] Browser allows localhost connections
- [ ] Node.js and npm are properly installed

## 🚨 Common Error Messages & Solutions

### 1. "This site can't be reached" / "Connection refused"

**Symptoms:**
- Browser shows "This site can't be reached"
- "localhost refused to connect"
- ERR_CONNECTION_REFUSED

**Causes & Solutions:**

#### A. Development Server Not Running
```bash
# Check if server is running
ps aux | grep expo
ps aux | grep node

# Start the development server
npm run dev
# or
npx expo start --web
```

#### B. Wrong Port
```bash
# Check what port Expo is actually using
npx expo start --web --port 8081

# If port is different, access the correct one
# Look for output like: "Web server started on http://localhost:XXXX"
```

#### C. Port Already in Use
```bash
# Check what's using port 8081
lsof -i :8081
# or on Windows
netstat -ano | findstr :8081

# Kill the process using the port
npx kill-port 8081
# or manually kill the process ID
kill -9 <PID>
```

### 2. "Loading..." or Blank White Screen

**Symptoms:**
- Page loads but shows only "Loading..."
- Blank white screen
- Spinner that never stops

**Solutions:**

#### A. Clear Cache and Restart
```bash
# Clear Expo cache
npx expo start --clear

# Clear browser cache
# Chrome: Ctrl+Shift+R (hard refresh)
# Firefox: Ctrl+F5
```

#### B. Check Browser Console
```javascript
// Open browser dev tools (F12) and check for errors
// Common errors to look for:
// - JavaScript errors
// - Network request failures
// - CORS issues
```

#### C. Verify Dependencies
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for peer dependency warnings
npm ls
```

### 3. "Network Error" / "Failed to fetch"

**Symptoms:**
- API calls failing
- Network tab shows failed requests
- Console shows fetch errors

**Solutions:**

#### A. Check Environment Variables
```bash
# Verify .env file exists and is properly configured
cat .env

# Ensure API URLs are correct
echo $EXPO_PUBLIC_API_URL
```

#### B. CORS Issues
```javascript
// If making API calls to external services, check CORS headers
// Add to your API server:
// Access-Control-Allow-Origin: http://localhost:8081
```

### 4. "Module not found" Errors

**Symptoms:**
- Import errors in console
- "Cannot resolve module" messages
- TypeScript errors

**Solutions:**

#### A. Check Import Paths
```typescript
// Ensure correct import paths
import { Component } from '@/components/Component'; // ✅ Correct
import { Component } from '../components/Component'; // ✅ Also correct
import { Component } from 'components/Component'; // ❌ Incorrect
```

#### B. Verify TypeScript Configuration
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify tsconfig.json paths
cat tsconfig.json
```

## 🔍 Step-by-Step Debugging Process

### Step 1: Environment Verification

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check Expo CLI
npx expo --version

# Verify project structure
ls -la app/
ls -la components/
```

### Step 2: Port and Process Investigation

```bash
# Check if port 8081 is available
telnet localhost 8081

# List all Node.js processes
ps aux | grep node

# Check network connections
netstat -tulpn | grep :8081
```

### Step 3: Development Server Diagnostics

```bash
# Start with verbose logging
DEBUG=* npm run dev

# Start with specific port
npx expo start --web --port 8081 --host localhost

# Check server logs for errors
tail -f ~/.expo/logs/expo-cli.log
```

### Step 4: Browser-Specific Checks

#### Chrome Diagnostics
```bash
# Open Chrome with disabled security (for testing only)
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev"

# Check Chrome flags
chrome://flags/#block-insecure-private-network-requests
```

#### Firefox Diagnostics
```bash
# Check Firefox network settings
about:config
# Look for: network.dns.disableIPv6
```

### Step 5: Network Configuration

```bash
# Check hosts file
cat /etc/hosts
# Should contain: 127.0.0.1 localhost

# Test localhost resolution
ping localhost
nslookup localhost
```

## 🛠 Advanced Troubleshooting

### Firewall Issues

#### macOS
```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Allow Node.js through firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

#### Windows
```powershell
# Check Windows Firewall
netsh advfirewall show allprofiles

# Add firewall rule for Node.js
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe"
```

#### Linux
```bash
# Check iptables
sudo iptables -L

# Allow port 8081
sudo ufw allow 8081
```

### Antivirus Software

Common antivirus programs that may block localhost:
- Norton
- McAfee
- Avast
- Windows Defender

**Solution:** Add Node.js and your project directory to antivirus exclusions.

### VPN/Proxy Issues

```bash
# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Disable proxy temporarily
unset HTTP_PROXY
unset HTTPS_PROXY
```

## 🔧 Automated Diagnostic Script

Run this script to automatically diagnose common issues:

```bash
# Make the diagnostic script executable
chmod +x scripts/diagnose.sh

# Run diagnostics
./scripts/diagnose.sh
```

## 📊 System Requirements Check

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Performance Optimization

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable Node.js performance monitoring
node --inspect npm run dev
```

## 🚀 Alternative Access Methods

### 1. Different Port
```bash
# Try different ports
npx expo start --web --port 3000
npx expo start --web --port 8080
npx expo start --web --port 19006
```

### 2. Network Access
```bash
# Allow network access (for testing on other devices)
npx expo start --web --host 0.0.0.0

# Access via IP address
# Find your IP: ifconfig (macOS/Linux) or ipconfig (Windows)
# Then access: http://YOUR_IP:8081
```

### 3. Tunnel Access
```bash
# Use Expo tunnel (requires Expo account)
npx expo start --tunnel
```

## 📞 Getting Help

If you're still experiencing issues, gather this information:

### System Information
```bash
# Create system report
./scripts/system-report.sh > system-report.txt
```

### Error Logs
```bash
# Collect relevant logs
cat ~/.expo/logs/expo-cli.log > expo-logs.txt
```

### Browser Information
- Browser name and version
- Extensions installed
- Console error messages
- Network tab information

## 🔄 Reset Everything (Nuclear Option)

If all else fails, try a complete reset:

```bash
# 1. Stop all Node processes
pkill -f node

# 2. Clear all caches
npm cache clean --force
npx expo start --clear

# 3. Remove and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Reset Expo
npx expo logout
npx expo login

# 5. Restart development server
npm run dev
```

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Browser loads http://localhost:8081 without errors
- ✅ SecuriComm login screen appears
- ✅ No console errors in browser dev tools
- ✅ Hot reload works when you make changes
- ✅ All app features function correctly

## 📚 Additional Resources

- [Expo Troubleshooting Guide](https://docs.expo.dev/troubleshooting/overview/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)

---

**Need immediate help?** Run `./scripts/quick-fix.sh` for automated problem resolution.