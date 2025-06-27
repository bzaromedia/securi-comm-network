# SecuriComm - Secure Communication Platform

A military-grade secure communication app built with Expo and React Native, featuring end-to-end encryption, AI-powered threat detection, and zero-trust security architecture.

## 🔒 Security Features

- **End-to-End Encryption**: All messages are encrypted using XChaCha20-Poly1305
- **Zero-Trust Architecture**: No data stored unencrypted
- **Threat Detection**: Real-time monitoring for security threats
- **Security Scoring**: Visual indicators of your security posture
- **Emergency Mode**: Enhanced security protocols for high-risk situations

## 🚀 Quick Start

### Project Structure

The project follows a modular architecture:

- **contexts/**: React contexts for state management
  - `AuthContext`: Authentication state and methods
  - `ConversationContext`: Messaging and conversation management
  - `SecurityContext`: Security settings and threat detection

- **components/**: Reusable UI components
  - `ChatInterface`: Main messaging interface
  - `EncryptionIndicator`: Shows current encryption level
  - `SecurityBadge`: Displays security score
  - `ThreatMeter`: Visualizes current threat level

- **utils/**: Utility functions and services
  - `api.ts`: API communication layer
  - `encryption.ts`: Encryption/decryption utilities
  - `storage.ts`: Secure storage utilities
  - `websocket.ts`: Real-time communication

### Prerequisites

Before setting up the local development environment, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - [VS Code recommended](https://code.visualstudio.com/)
- **Modern Browser** - Chrome or Firefox for testing

### 1. Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd naimara-secure-app

# Verify the clone was successful
ls -la
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables (use your preferred editor)
code .env
```

**Required Environment Variables:**
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_KEY=your_development_api_key

# Security Configuration
EXPO_PUBLIC_ENCRYPTION_KEY=your_encryption_key
EXPO_PUBLIC_APP_ENV=development

# Feature Flags
EXPO_PUBLIC_ENABLE_AI_FEATURES=true
EXPO_PUBLIC_ENABLE_MESH_NETWORK=false
```

### 4. Start Development Server

```bash
# Start the Expo development server
npm run dev

# Alternative: Start with specific platform
npx expo start --web
```

### 5. Access the Application

Once the development server starts, you can access SecuriComm at:

- **Web**: http://localhost:8081
- **Mobile**: Scan QR code with Expo Go app
- **Simulator**: Press 'i' for iOS or 'a' for Android

## 🛠 Development Tools Setup

### Browser Extensions (Recommended)

1. **React Developer Tools**
   - [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

2. **Redux DevTools** (if using Redux)
   - [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

### VS Code Extensions

```bash
# Install recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
```

### Testing Framework Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# Run tests
npm test
```

## 📱 Platform-Specific Setup

### Web Development
- Primary development platform
- Full feature compatibility
- Hot reload enabled
- Browser dev tools available

### Mobile Development (Optional)

1. **Install Expo Go**
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Development Build** (for native features)
   ```bash
   # Create development build
   npx expo install expo-dev-client
   npx expo run:ios # or expo run:android
   ```

## 🔧 Common Development Commands

```bash
# Start development server
npm run dev

# Build for web
npm run build:web

# Lint code
npm run lint

# Type checking
npm run type-check

# Clear cache
npx expo start --clear

# Update dependencies
npx expo update
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 8081
   # First install kill-port if not already installed
   npm install -g kill-port
   # Then use it to kill the process
   kill-port 8081
   ```

2. **Cache Issues**
   ```bash
   # Clear all caches
   npx expo start --clear
   npm start -- --reset-cache
   ```

3. **Node Modules Issues**
   ```bash
   # Clean reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit --skipLibCheck
   ```

### Performance Optimization

1. **Enable Fast Refresh**
   - Automatically enabled in development
   - Preserves component state during edits

2. **Bundle Analysis**
   ```bash
   # Analyze bundle size
   npx expo export --platform web --dev
   ```

3. **Memory Monitoring**
   - Use browser dev tools Performance tab
   - Monitor React DevTools Profiler

## 🔒 Security Features

SecuriComm includes several security features that work in development:

- **End-to-End Encryption**: XChaCha20-Poly1305 for all messages and data
- **AI Threat Detection**: Real-time monitoring with threat visualization
- **Zero-Trust Architecture**: No data stored unencrypted at any point
- **Biometric Authentication**: Web Authentication API for secure login
- **Emergency Mode**: Enhanced security protocols with mesh networking fallback
- **Security Scoring**: Visual indicators of your security posture
- **Threat Visualization**: Real-time display of security threats
- **Secure Storage**: All sensitive data is encrypted at rest

## 📊 Development Metrics

Monitor these metrics during development:

- **Bundle Size**: Keep under 2MB for web
- **Load Time**: Target under 3 seconds
- **Memory Usage**: Monitor for leaks
- **Security Score**: Maintain 95%+ rating
- **Encryption Performance**: Message encryption/decryption under 50ms
- **API Response Time**: Under 200ms for critical operations
- **WebSocket Latency**: Under 100ms for real-time updates

## 🚀 Deployment

### Web Deployment
```bash
# Build for production
npm run build:web

# Deploy to hosting service
# (Netlify, Vercel, etc.)
```

### Mobile Deployment
```bash
# Build for app stores using EAS Build
npx eas build --platform ios
npx eas build --platform android
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [SecuriComm PRD](./docs/SecuriComm_PRD.md)
- [Localhost Troubleshooting](./docs/LOCALHOST_TROUBLESHOOTING.md)
- [API Documentation](./docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**SecuriComm** - Military-grade secure communication for everyone.
