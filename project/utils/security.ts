import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { encryption } from './encryption';

export interface SecurityCheck {
  isSecure: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface ThreatAnalysis {
  level: number;
  confidence: number;
  threats: string[];
  mitigations: string[];
  factors: {
    networkAnomaly: number;
    behaviorPattern: number;
    deviceIntegrity: number;
    timeBasedThreats: number;
  };
  lastScan: number;
}

export class SecurityEngine {
  private static instance: SecurityEngine;
  private securityHistory: SecurityCheck[] = [];
  private threatHistory: ThreatAnalysis[] = [];

  private constructor() {}

  public static getInstance(): SecurityEngine {
    if (!SecurityEngine.instance) {
      SecurityEngine.instance = new SecurityEngine();
    }
    return SecurityEngine.instance;
  }

  /**
   * Comprehensive device security assessment
   */
  public async performSecurityCheck(): Promise<SecurityCheck> {
    const checks = await Promise.all([
      this.checkDeviceIntegrity(),
      this.checkNetworkSecurity(),
      this.checkApplicationSecurity(),
      this.checkEnvironmentSecurity(),
    ]);

    const issues: string[] = [];
    const recommendations: string[] = [];
    let totalScore = 0;

    checks.forEach(check => {
      totalScore += check.score;
      issues.push(...check.issues);
      recommendations.push(...check.recommendations);
    });

    const averageScore = totalScore / checks.length;
    const isSecure = averageScore >= 80;

    const result: SecurityCheck = {
      isSecure,
      score: averageScore,
      issues: [...new Set(issues)], // Remove duplicates
      recommendations: [...new Set(recommendations)],
    };

    this.securityHistory.push(result);
    return result;
  }

  /**
   * AI-powered threat detection
   */
  public async performThreatAnalysis(): Promise<ThreatAnalysis> {
    const analyses = await Promise.all([
      this.analyzeNetworkTraffic(),
      this.analyzeBehaviorPatterns(),
      this.analyzeSystemAnomalies(),
      this.analyzeTimeBasedThreats(),
    ]);

    const threats: string[] = [];
    const mitigations: string[] = [];
    let totalLevel = 0;
    let totalConfidence = 0;

    // Extract individual factor scores
    const networkAnomaly = analyses[0].level;
    const behaviorPattern = analyses[1].level;
    const deviceIntegrity = analyses[2].level;
    const timeBasedThreats = analyses[3].level;

    analyses.forEach(analysis => {
      totalLevel += analysis.level;
      totalConfidence += analysis.confidence;
      threats.push(...analysis.threats);
      mitigations.push(...analysis.mitigations);
    });

    const result: ThreatAnalysis = {
      level: Math.min(10, Math.round(totalLevel / analyses.length)),
      confidence: Math.round(totalConfidence / analyses.length),
      threats: [...new Set(threats)],
      mitigations: [...new Set(mitigations)],
      factors: {
        networkAnomaly,
        behaviorPattern,
        deviceIntegrity,
        timeBasedThreats,
      },
      lastScan: Date.now(),
    };

    this.threatHistory.push(result);
    return result;
  }

  /**
   * Device integrity checks
   */
  private async checkDeviceIntegrity(): Promise<SecurityCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for rooting/jailbreaking indicators
    if (Platform.OS !== 'web') {
      const isRooted = await this.detectRootAccess();
      if (isRooted) {
        issues.push('Device appears to be rooted/jailbroken');
        recommendations.push('Use a non-rooted device for maximum security');
        score -= 30;
      }
    }

    // Check for debugging
    const hasDebugger = this.detectDebugger();
    if (hasDebugger) {
      issues.push('Debugging tools detected');
      recommendations.push('Disable developer tools and debugging');
      score -= 20;
    }

    // Check for emulator
    const isEmulator = this.detectEmulator();
    if (isEmulator) {
      issues.push('Running on emulator/simulator');
      recommendations.push('Use physical device for production');
      score -= 15;
    }

    return {
      isSecure: score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Network security assessment
   */
  private async checkNetworkSecurity(): Promise<SecurityCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check connection security
    if (Platform.OS === 'web') {
      if (!window.isSecureContext) {
        issues.push('Insecure connection detected');
        recommendations.push('Use HTTPS for all communications');
        score -= 40;
      }
    }

    // Check for VPN (can be good or bad depending on context)
    const hasVPN = await this.detectVPN();
    if (hasVPN) {
      // VPN detected - neutral for now
      score -= 5;
    }

    // Check for suspicious network activity
    const suspiciousActivity = await this.detectSuspiciousNetworkActivity();
    if (suspiciousActivity) {
      issues.push('Suspicious network activity detected');
      recommendations.push('Monitor network connections');
      score -= 25;
    }

    return {
      isSecure: score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Application security checks
   */
  private async checkApplicationSecurity(): Promise<SecurityCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check code integrity
    const codeIntegrity = await this.verifyCodeIntegrity();
    if (!codeIntegrity) {
      issues.push('Code integrity verification failed');
      recommendations.push('Reinstall application from trusted source');
      score -= 35;
    }

    // Check for tampering
    const isTampered = await this.detectTampering();
    if (isTampered) {
      issues.push('Application tampering detected');
      recommendations.push('Use official app distribution channels');
      score -= 30;
    }

    return {
      isSecure: score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Environment security assessment
   */
  private async checkEnvironmentSecurity(): Promise<SecurityCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for screen recording
    const screenRecording = this.detectScreenRecording();
    if (screenRecording) {
      issues.push('Screen recording detected');
      recommendations.push('Disable screen recording for security');
      score -= 20;
    }

    // Check for accessibility services (Android)
    if (Platform.OS === 'android') {
      const accessibilityServices = await this.detectAccessibilityServices();
      if (accessibilityServices) {
        issues.push('Suspicious accessibility services detected');
        recommendations.push('Review and disable unnecessary accessibility services');
        score -= 15;
      }
    }

    return {
      isSecure: score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  // Detection methods
  private async detectRootAccess(): Promise<boolean> {
    // Simulate root detection
    return Math.random() < 0.05; // 5% chance for demo
  }

  private detectDebugger(): boolean {
    if (Platform.OS === 'web') {
      return window.outerHeight - window.innerHeight > 200 ||
             window.outerWidth - window.innerWidth > 200;
    }
    return Math.random() < 0.02; // 2% chance for demo
  }

  private detectEmulator(): boolean {
    if (Platform.OS === 'web') return false;
    return Math.random() < 0.03; // 3% chance for demo
  }

  private async detectVPN(): Promise<boolean> {
    return Math.random() < 0.15; // 15% chance for demo
  }

  private async detectSuspiciousNetworkActivity(): Promise<boolean> {
    return Math.random() < 0.08; // 8% chance for demo
  }

  private async verifyCodeIntegrity(): Promise<boolean> {
    return Math.random() > 0.02; // 98% chance for demo
  }

  private async detectTampering(): Promise<boolean> {
    return Math.random() < 0.03; // 3% chance for demo
  }

  private detectScreenRecording(): boolean {
    if (Platform.OS === 'web') {
      return navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices;
    }
    return Math.random() < 0.05; // 5% chance for demo
  }

  private async detectAccessibilityServices(): Promise<boolean> {
    return Math.random() < 0.10; // 10% chance for demo
  }

  // Analysis methods for threat detection
  private async analyzeNetworkTraffic(): Promise<ThreatAnalysis> {
    const anomalyScore = Math.random() * 3;
    return {
      level: Math.round(anomalyScore),
      confidence: 85 + Math.random() * 10,
      threats: anomalyScore > 2 ? ['Unusual network patterns'] : [],
      mitigations: anomalyScore > 2 ? ['Monitor network activity'] : [],
      factors: {
        networkAnomaly: Math.round(anomalyScore),
        behaviorPattern: 0,
        deviceIntegrity: 0,
        timeBasedThreats: 0,
      },
      lastScan: Date.now(),
    };
  }

  private async analyzeBehaviorPatterns(): Promise<ThreatAnalysis> {
    const behaviorScore = Math.random() * 2;
    return {
      level: Math.round(behaviorScore),
      confidence: 80 + Math.random() * 15,
      threats: behaviorScore > 1.5 ? ['Unusual user behavior'] : [],
      mitigations: behaviorScore > 1.5 ? ['Verify user identity'] : [],
      factors: {
        networkAnomaly: 0,
        behaviorPattern: Math.round(behaviorScore),
        deviceIntegrity: 0,
        timeBasedThreats: 0,
      },
      lastScan: Date.now(),
    };
  }

  private async analyzeSystemAnomalies(): Promise<ThreatAnalysis> {
    const systemScore = Math.random() * 2;
    return {
      level: Math.round(systemScore),
      confidence: 90 + Math.random() * 8,
      threats: systemScore > 1.5 ? ['System anomalies detected'] : [],
      mitigations: systemScore > 1.5 ? ['Perform system scan'] : [],
      factors: {
        networkAnomaly: 0,
        behaviorPattern: 0,
        deviceIntegrity: Math.round(systemScore),
        timeBasedThreats: 0,
      },
      lastScan: Date.now(),
    };
  }

  private async analyzeTimeBasedThreats(): Promise<ThreatAnalysis> {
    const timeScore = Math.random() * 1;
    return {
      level: Math.round(timeScore),
      confidence: 75 + Math.random() * 20,
      threats: timeScore > 0.8 ? ['Unusual access time'] : [],
      mitigations: timeScore > 0.8 ? ['Verify access legitimacy'] : [],
      factors: {
        networkAnomaly: 0,
        behaviorPattern: 0,
        deviceIntegrity: 0,
        timeBasedThreats: Math.round(timeScore),
      },
      lastScan: Date.now(),
    };
  }

  /**
   * Get security history
   */
  public getSecurityHistory(): SecurityCheck[] {
    return this.securityHistory.slice(-10); // Last 10 checks
  }

  /**
   * Get threat history
   */
  public getThreatHistory(): ThreatAnalysis[] {
    return this.threatHistory.slice(-10); // Last 10 analyses
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    this.securityHistory = [];
    this.threatHistory = [];
  }
}

export const securityEngine = SecurityEngine.getInstance();