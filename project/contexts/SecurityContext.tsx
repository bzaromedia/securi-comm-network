/**
 * SecuriComm Security Context
 * 
 * Provides security state and methods for the entire application.
 * Manages security levels, threat detection, and emergency mode.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { secureStorage, StorageKeys } from '@/utils/storage';
import { useAuth } from './AuthContext';

// Security level enum
export enum SecurityLevel {
  MAXIMUM = 'maximum',
  HIGH = 'high',
  MEDIUM = 'medium',
  BASIC = 'basic',
}

// Threat interface
export interface Threat {
  _id: string;
  type: string;
  severity: number;
  description: string;
  source: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

// Security log interface
export interface SecurityLog {
  _id: string;
  action: string;
  description: string;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

// Security context interface
interface SecurityContextType {
  securityLevel: SecurityLevel;
  threatLevel: number;
  emergencyModeActive: boolean;
  threats: Threat[];
  logs: SecurityLog[];
  isLoading: boolean;
  error: string | null;
  setSecurityLevel: (level: SecurityLevel) => Promise<void>;
  enableEmergencyMode: () => Promise<void>;
  disableEmergencyMode: () => Promise<void>;
  getThreats: (limit?: number, page?: number) => Promise<void>;
  getLogs: (limit?: number, page?: number) => Promise<void>;
  reportThreat: (data: any) => Promise<void>;
  resolveThreat: (threatId: string) => Promise<void>;
}

// Create context
const SecurityContext = createContext<SecurityContextType>({
  securityLevel: SecurityLevel.HIGH,
  threatLevel: 0,
  emergencyModeActive: false,
  threats: [],
  logs: [],
  isLoading: false,
  error: null,
  setSecurityLevel: async () => {},
  enableEmergencyMode: async () => {},
  disableEmergencyMode: async () => {},
  getThreats: async () => {},
  getLogs: async () => {},
  reportThreat: async () => {},
  resolveThreat: async () => {},
});

// Security provider component
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // Security state
  const [securityLevel, setSecurityLevelState] = useState<SecurityLevel>(
    SecurityLevel.HIGH
  );
  const [threatLevel, setThreatLevel] = useState<number>(0);
  const [emergencyModeActive, setEmergencyModeActive] = useState<boolean>(false);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize security state
  useEffect(() => {
    if (isAuthenticated) {
      initializeSecurity();
    }
  }, [isAuthenticated]);
  
  // Initialize security
  const initializeSecurity = async () => {
    try {
      // Get stored security level
      const storedLevel = await secureStorage.getItem(StorageKeys.SECURITY_LEVEL);
      
      if (storedLevel) {
        setSecurityLevelState(storedLevel as SecurityLevel);
      }
      
      // Get security status from API
      await getSecurityStatus();
      
      // Get threats
      await getThreats();
      
      // Calculate threat level
      calculateThreatLevel();
    } catch (error) {
      console.error('Initialize security error:', error);
    }
  };
  
  // Get security status
  const getSecurityStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get security status from API
      const response = await api.security.getStatus();
      
      if (!response.success) {
        setError(response.message || 'Failed to get security status');
        setIsLoading(false);
        return;
      }
      
      // Update security state
      if (response.data) {
        // Update security level
        if (response.data.securityLevel) {
          setSecurityLevelState(response.data.securityLevel as SecurityLevel);
        }
        
        // Update emergency mode
        if (response.data.emergencyModeActive !== undefined) {
          setEmergencyModeActive(response.data.emergencyModeActive);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Get security status error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to get security status'
      );
      setIsLoading(false);
    }
  };
  
  // Get threats
  const getThreats = async (limit: number = 20, page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get threats from API
      const response = await api.security.getThreats(limit, page);
      
      if (!response.success) {
        setError(response.message || 'Failed to get threats');
        setIsLoading(false);
        return;
      }
      
      // Update threats
      if (response.data && response.data.threats) {
        setThreats(response.data.threats);
        
        // Calculate threat level
        calculateThreatLevel();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Get threats error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to get threats'
      );
      setIsLoading(false);
    }
  };
  
  // Get logs
  const getLogs = async (limit: number = 20, page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get logs from API
      const response = await api.security.getLogs(limit, page);
      
      if (!response.success) {
        setError(response.message || 'Failed to get logs');
        setIsLoading(false);
        return;
      }
      
      // Update logs
      if (response.data && response.data.logs) {
        setLogs(response.data.logs);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Get logs error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to get logs'
      );
      setIsLoading(false);
    }
  };
  
  // Report threat
  const reportThreat = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Report threat to API
      const response = await api.security.reportThreat(data);
      
      if (!response.success) {
        setError(response.message || 'Failed to report threat');
        setIsLoading(false);
        return;
      }
      
      // Add threat to state
      if (response.data && response.data.threat) {
        setThreats((prevThreats) => [response.data.threat, ...prevThreats]);
        
        // Calculate threat level
        calculateThreatLevel();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Report threat error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to report threat'
      );
      setIsLoading(false);
    }
  };
  
  // Resolve threat
  const resolveThreat = async (threatId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update threats
      setThreats((prevThreats) =>
        prevThreats.map((threat) =>
          threat._id === threatId
            ? { ...threat, resolved: true, resolvedAt: new Date().toISOString() }
            : threat
        )
      );
      
      // Calculate threat level
      calculateThreatLevel();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Resolve threat error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to resolve threat'
      );
      setIsLoading(false);
    }
  };
  
  // Set security level
  const setSecurityLevel = async (level: SecurityLevel) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update security level in API
      const response = await api.security.updateLevel(level);
      
      if (!response.success) {
        setError(response.message || 'Failed to update security level');
        setIsLoading(false);
        return;
      }
      
      // Update security level in state
      setSecurityLevelState(level);
      
      // Store security level
      await secureStorage.setItem(StorageKeys.SECURITY_LEVEL, level);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Set security level error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to update security level'
      );
      setIsLoading(false);
    }
  };
  
  // Enable emergency mode
  const enableEmergencyMode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Enable emergency mode in API
      const response = await api.security.enableEmergencyMode();
      
      if (!response.success) {
        setError(response.message || 'Failed to enable emergency mode');
        setIsLoading(false);
        return;
      }
      
      // Update emergency mode in state
      setEmergencyModeActive(true);
      
      // Set security level to maximum
      setSecurityLevelState(SecurityLevel.MAXIMUM);
      
      // Store security level
      await secureStorage.setItem(
        StorageKeys.SECURITY_LEVEL,
        SecurityLevel.MAXIMUM
      );
      
      setIsLoading(false);
    } catch (error) {
      console.error('Enable emergency mode error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to enable emergency mode'
      );
      setIsLoading(false);
    }
  };
  
  // Disable emergency mode
  const disableEmergencyMode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Disable emergency mode in API
      const response = await api.security.disableEmergencyMode();
      
      if (!response.success) {
        setError(response.message || 'Failed to disable emergency mode');
        setIsLoading(false);
        return;
      }
      
      // Update emergency mode in state
      setEmergencyModeActive(false);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Disable emergency mode error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to disable emergency mode'
      );
      setIsLoading(false);
    }
  };
  
  // Calculate threat level
  const calculateThreatLevel = () => {
    // Get active threats
    const activeThreats = threats.filter((threat) => !threat.resolved);
    
    if (activeThreats.length === 0) {
      setThreatLevel(0);
      return;
    }
    
    // Calculate average severity
    const totalSeverity = activeThreats.reduce(
      (sum, threat) => sum + threat.severity,
      0
    );
    const averageSeverity = totalSeverity / activeThreats.length;
    
    // Apply security level modifier
    let modifier = 1;
    
    switch (securityLevel) {
      case SecurityLevel.MAXIMUM:
        modifier = 0.5; // Reduce threat level by 50%
        break;
      case SecurityLevel.HIGH:
        modifier = 0.75; // Reduce threat level by 25%
        break;
      case SecurityLevel.MEDIUM:
        modifier = 1; // No change
        break;
      case SecurityLevel.BASIC:
        modifier = 1.25; // Increase threat level by 25%
        break;
    }
    
    // Calculate final threat level (0-100)
    const calculatedThreatLevel = Math.min(
      100,
      Math.round(averageSeverity * modifier * 10)
    );
    
    setThreatLevel(calculatedThreatLevel);
  };
  
  return (
    <SecurityContext.Provider
      value={{
        securityLevel,
        threatLevel,
        emergencyModeActive,
        threats,
        logs,
        isLoading,
        error,
        setSecurityLevel,
        enableEmergencyMode,
        disableEmergencyMode,
        getThreats,
        getLogs,
        reportThreat,
        resolveThreat,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

// Security hook
export const useSecurity = () => useContext(SecurityContext);
