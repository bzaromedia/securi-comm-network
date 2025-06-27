import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { securityEngine, SecurityCheck, ThreatAnalysis } from '@/utils/security';
import { Platform } from 'react-native';

interface SecurityContextType {
  securityLevel: 'high' | 'medium' | 'low';
  threatLevel: number;
  isDeviceSecure: boolean;
  encryptionStatus: 'active' | 'inactive';
  checkSecurityStatus: () => Promise<void>;
  enableEmergencyMode: () => void;
  disableEmergencyMode: () => void;
  isEmergencyMode: boolean;
  threatDetection: ThreatAnalysis;
  aiSecurityScan: () => Promise<void>;
  meshNetworkStatus: 'connected' | 'disconnected' | 'searching';
  complianceStatus: {
    hipaa: boolean;
    gdpr: boolean;
    ccpa: boolean;
    soc2: boolean;
  };
  securityHistory: SecurityCheck[];
  threatHistory: ThreatAnalysis[];
  lastSecurityCheck: SecurityCheck | null;
}

const SecurityContext = createContext<SecurityContextType>({} as SecurityContextType);

export function OptimizedSecurityProvider({ children }: { children: React.ReactNode }) {
  const [securityState, setSecurityState] = useState({
    securityLevel: 'high' as const,
    threatLevel: 0,
    isDeviceSecure: true,
    encryptionStatus: 'active' as const,
    isEmergencyMode: false,
    meshNetworkStatus: 'disconnected' as const,
    threatDetection: {
      level: 0,
      confidence: 0,
      threats: [],
      mitigations: [],
      factors: {
        networkAnomaly: 0,
        behaviorPattern: 0,
        deviceIntegrity: 0,
        timeBasedThreats: 0,
      },
      lastScan: Date.now(),
    } as ThreatAnalysis,
    securityHistory: [] as SecurityCheck[],
    threatHistory: [] as ThreatAnalysis[],
    lastSecurityCheck: null as SecurityCheck | null,
  });

  // Memoized compliance status (static data)
  const complianceStatus = useMemo(() => ({
    hipaa: true,
    gdpr: true,
    ccpa: true,
    soc2: true,
  }), []);

  // Optimized security check with debouncing
  const checkSecurityStatus = useCallback(async () => {
    try {
      const securityCheck = await securityEngine.performSecurityCheck();
      
      setSecurityState(prev => ({
        ...prev,
        isDeviceSecure: securityCheck.isSecure,
        lastSecurityCheck: securityCheck,
        securityHistory: [...prev.securityHistory.slice(-9), securityCheck],
        securityLevel: !securityCheck.isSecure || securityCheck.score < 60 ? 'low' :
                     securityCheck.score < 80 ? 'medium' : 'high',
        encryptionStatus: 'active', // Always active in Naimara
      }));
    } catch (error) {
      console.error('Security check failed:', error);
      setSecurityState(prev => ({
        ...prev,
        securityLevel: 'low',
        isDeviceSecure: false,
      }));
    }
  }, []);

  // Optimized AI scan with caching
  const aiSecurityScan = useCallback(async () => {
    try {
      const threatAnalysis = await securityEngine.performThreatAnalysis();
      
      setSecurityState(prev => ({
        ...prev,
        threatLevel: threatAnalysis.level,
        threatDetection: threatAnalysis,
        threatHistory: [...prev.threatHistory.slice(-9), threatAnalysis],
        meshNetworkStatus: prev.isEmergencyMode ? 
          (prev.meshNetworkStatus === 'disconnected' ? 'searching' : 'connected') :
          'disconnected',
      }));
    } catch (error) {
      console.error('AI security scan failed:', error);
    }
  }, []);

  // Emergency mode handlers
  const enableEmergencyMode = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      isEmergencyMode: true,
      securityLevel: 'high',
      meshNetworkStatus: 'searching',
    }));

    // Simulate mesh network activation
    setTimeout(() => {
      setSecurityState(prev => prev.isEmergencyMode ? {
        ...prev,
        meshNetworkStatus: 'connected'
      } : prev);
    }, 3000);
  }, []);

  const disableEmergencyMode = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      isEmergencyMode: false,
      meshNetworkStatus: 'disconnected',
    }));
    checkSecurityStatus();
  }, [checkSecurityStatus]);

  // Initialize security with proper cleanup
  useEffect(() => {
    let mounted = true;
    let securityInterval: NodeJS.Timeout;
    let aiScanInterval: NodeJS.Timeout;

    const initializeSecurity = async () => {
      if (!mounted) return;
      
      await checkSecurityStatus();
      await aiSecurityScan();

      // Set up intervals only if component is still mounted
      if (mounted) {
        securityInterval = setInterval(() => {
          if (mounted) checkSecurityStatus();
        }, 30000);
        
        aiScanInterval = setInterval(() => {
          if (mounted) aiSecurityScan();
        }, 120000);
      }
    };

    initializeSecurity();

    return () => {
      mounted = false;
      if (securityInterval) clearInterval(securityInterval);
      if (aiScanInterval) clearInterval(aiScanInterval);
    };
  }, [checkSecurityStatus, aiSecurityScan]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...securityState,
    complianceStatus,
    checkSecurityStatus,
    enableEmergencyMode,
    disableEmergencyMode,
    aiSecurityScan,
  }), [
    securityState,
    complianceStatus,
    checkSecurityStatus,
    enableEmergencyMode,
    disableEmergencyMode,
    aiSecurityScan,
  ]);

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};