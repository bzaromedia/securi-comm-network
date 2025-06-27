import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSecurity } from '@/contexts/SecurityContext';
import { AISecurityEngine } from '@/components/AISecurityEngine';
import { ThreatMeter } from '@/components/ThreatMeter';
import { SecurityBadge } from '@/components/SecurityBadge';
import { EncryptionIndicator } from '@/components/EncryptionIndicator';
import {
  Shield,
  Brain,
  Activity,
  AlertTriangle,
  Eye,
  Zap,
  Network,
  Lock,
  Cpu,
  Globe,
  FileShield,
  Radar,
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SecurityScreen() {
  const { 
    securityLevel, 
    threatLevel, 
    threatDetection, 
    aiSecurityScan,
    isEmergencyMode,
    enableEmergencyMode,
    disableEmergencyMode,
    meshNetworkStatus,
    complianceStatus,
    securityHistory,
    lastSecurityCheck
  } = useSecurity();

  const [activeTab, setActiveTab] = useState<'overview' | 'ai-engine' | 'analytics'>('overview');
  const [isScanning, setIsScanning] = useState(false);

  const pulseAnimation = useSharedValue(1);
  const shieldRotation = useSharedValue(0);
  const threatPulse = useSharedValue(1);

  React.useEffect(() => {
    // Security level pulse animation
    if (threatLevel > 5) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(1, { duration: 500 });
    }

    // Shield rotation for active protection
    shieldRotation.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );

    // Threat level pulse
    if (threatLevel > 7) {
      threatPulse.value = withRepeat(
        withTiming(1.3, { duration: 300 }),
        -1,
        true
      );
    } else {
      threatPulse.value = withTiming(1, { duration: 300 });
    }
  }, [threatLevel]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const animatedShieldStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shieldRotation.value}deg` }],
  }));

  const animatedThreatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: threatPulse.value }],
  }));

  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'high': return '#00FF94';
      case 'medium': return '#FFB800';
      case 'low': return '#FF4444';
      default: return '#00FF94';
    }
  };

  const getThreatColor = () => {
    if (threatLevel > 7) return '#FF4444';
    if (threatLevel > 3) return '#FFB800';
    return '#00FF94';
  };

  const performAIScan = async () => {
    setIsScanning(true);
    try {
      await aiSecurityScan();
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  const SecurityOverview = () => (
    <View style={styles.tabContent}>
      {/* Emergency Mode Banner */}
      {isEmergencyMode && (
        <Animated.View style={animatedPulseStyle}>
          <BlurView intensity={20} style={styles.emergencyBanner}>
            <AlertTriangle size={20} color="#FF4444" />
            <Text style={styles.emergencyText}>Emergency Mode Active</Text>
            <View style={styles.emergencyActions}>
              <Text style={styles.emergencySubtext}>Mesh: {meshNetworkStatus.toUpperCase()}</Text>
              <TouchableOpacity 
                onPress={disableEmergencyMode}
                style={styles.emergencyButton}
              >
                <Text style={styles.emergencyButtonText}>Disable</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Main Security Status */}
      <BlurView intensity={20} style={styles.mainSecurityCard}>
        <View style={styles.securityHeader}>
          <View style={styles.securityTitleContainer}>
            <Animated.View style={[animatedPulseStyle, animatedShieldStyle]}>
              <Shield size={32} color={getSecurityColor()} />
            </Animated.View>
            <View style={styles.securityTitleText}>
              <Text style={styles.securityTitle}>Zero Trust Security</Text>
              <Text style={styles.securitySubtitle}>Military-Grade Protection</Text>
            </View>
          </View>
          <SecurityBadge level={securityLevel} size="large" />
        </View>

        <View style={styles.securityMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Security Level</Text>
            <Text style={[styles.metricValue, { color: getSecurityColor() }]}>
              {securityLevel.toUpperCase()}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Threat Level</Text>
            <Animated.Text style={[styles.metricValue, { color: getThreatColor() }, animatedThreatStyle]}>
              {threatLevel}/10
            </Animated.Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>AI Confidence</Text>
            <Text style={[styles.metricValue, { color: '#9D4EDD' }]}>
              {threatDetection.confidence}%
            </Text>
          </View>
        </View>

        <ThreatMeter 
          threatLevel={threatLevel} 
          maxLevel={10} 
          size="large" 
          showLabel={true}
        />
      </BlurView>

      {/* Encryption Status */}
      <BlurView intensity={20} style={styles.encryptionCard}>
        <View style={styles.cardHeader}>
          <FileShield size={20} color="#00FF94" />
          <Text style={styles.cardTitle}>Encryption Status</Text>
        </View>
        <EncryptionIndicator 
          isActive={true} 
          protocol="XChaCha20-Poly1305" 
          size="large" 
          showProtocol={true}
        />
        <View style={styles.encryptionDetails}>
          <View style={styles.encryptionItem}>
            <Lock size={14} color="#00FF94" />
            <Text style={styles.encryptionText}>End-to-End Encryption: Active</Text>
          </View>
          <View style={styles.encryptionItem}>
            <Shield size={14} color="#00FF94" />
            <Text style={styles.encryptionText}>Signal Protocol: Verified</Text>
          </View>
          <View style={styles.encryptionItem}>
            <Cpu size={14} color="#00FF94" />
            <Text style={styles.encryptionText}>Hardware Security: TPM Enabled</Text>
          </View>
        </View>
      </BlurView>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Security Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={performAIScan}
            disabled={isScanning}
          >
            <BlurView intensity={20} style={styles.quickActionBlur}>
              <View style={[styles.quickActionIcon, { borderColor: '#9D4EDD' }]}>
                <Brain size={24} color="#9D4EDD" />
              </View>
              <Text style={styles.quickActionText}>
                {isScanning ? 'Scanning...' : 'AI Scan'}
              </Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={isEmergencyMode ? disableEmergencyMode : enableEmergencyMode}
          >
            <BlurView intensity={20} style={styles.quickActionBlur}>
              <View style={[styles.quickActionIcon, { borderColor: '#FF4444' }]}>
                <AlertTriangle size={24} color="#FF4444" />
              </View>
              <Text style={styles.quickActionText}>
                {isEmergencyMode ? 'Exit Emergency' : 'Emergency Mode'}
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {/* Compliance Status */}
      <BlurView intensity={20} style={styles.complianceCard}>
        <View style={styles.cardHeader}>
          <Globe size={20} color="#00FF94" />
          <Text style={styles.cardTitle}>Regulatory Compliance</Text>
        </View>
        <View style={styles.complianceGrid}>
          {Object.entries(complianceStatus).map(([key, status]) => (
            <View key={key} style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>{key.toUpperCase()}</Text>
              <View style={[styles.complianceStatus, { backgroundColor: status ? '#00FF94' : '#FF4444' }]}>
                <Text style={styles.complianceStatusText}>
                  {status ? '✓' : '✗'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </BlurView>
    </View>
  );

  const SecurityAnalytics = () => (
    <View style={styles.tabContent}>
      <BlurView intensity={20} style={styles.analyticsCard}>
        <View style={styles.cardHeader}>
          <BarChart3 size={20} color="#00FF94" />
          <Text style={styles.cardTitle}>Security Analytics</Text>
        </View>
        
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticItem}>
            <Text style={styles.analyticLabel}>Network Anomaly</Text>
            <View style={styles.analyticBar}>
              <View 
                style={[
                  styles.analyticBarFill,
                  { 
                    width: `${(threatDetection.factors?.networkAnomaly || 0) * 33}%`,
                    backgroundColor: '#00D4FF',
                  }
                ]} 
              />
            </View>
            <Text style={styles.analyticValue}>
              {(threatDetection.factors?.networkAnomaly || 0).toFixed(1)}/3.0
            </Text>
          </View>

          <View style={styles.analyticItem}>
            <Text style={styles.analyticLabel}>Behavior Pattern</Text>
            <View style={styles.analyticBar}>
              <View 
                style={[
                  styles.analyticBarFill,
                  { 
                    width: `${(threatDetection.factors?.behaviorPattern || 0) * 50}%`,
                    backgroundColor: '#9D4EDD',
                  }
                ]} 
              />
            </View>
            <Text style={styles.analyticValue}>
              {(threatDetection.factors?.behaviorPattern || 0).toFixed(1)}/2.0
            </Text>
          </View>

          <View style={styles.analyticItem}>
            <Text style={styles.analyticLabel}>Device Integrity</Text>
            <View style={styles.analyticBar}>
              <View 
                style={[
                  styles.analyticBarFill,
                  { 
                    width: `${(threatDetection.factors?.deviceIntegrity || 0) * 50}%`,
                    backgroundColor: '#FFB800',
                  }
                ]} 
              />
            </View>
            <Text style={styles.analyticValue}>
              {(threatDetection.factors?.deviceIntegrity || 0).toFixed(1)}/2.0
            </Text>
          </View>

          <View style={styles.analyticItem}>
            <Text style={styles.analyticLabel}>Time-based Threats</Text>
            <View style={styles.analyticBar}>
              <View 
                style={[
                  styles.analyticBarFill,
                  { 
                    width: `${(threatDetection.factors?.timeBasedThreats || 0) * 100}%`,
                    backgroundColor: '#FF6B35',
                  }
                ]} 
              />
            </View>
            <Text style={styles.analyticValue}>
              {(threatDetection.factors?.timeBasedThreats || 0).toFixed(1)}/1.0
            </Text>
          </View>
        </View>

        <View style={styles.lastScanInfo}>
          <Text style={styles.lastScanText}>
            Last AI scan: {new Date(threatDetection.lastScan || Date.now()).toLocaleTimeString()}
          </Text>
        </View>
      </BlurView>

      {/* Security History */}
      <BlurView intensity={20} style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <Activity size={20} color="#00FF94" />
          <Text style={styles.cardTitle}>Security History</Text>
        </View>
        <View style={styles.historyList}>
          {securityHistory.slice(-5).reverse().map((check, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={[
                styles.historyDot, 
                { backgroundColor: check.isSecure ? '#00FF94' : '#FF4444' }
              ]} />
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>
                  Security Check - Score: {check.score.toFixed(0)}%
                </Text>
                <Text style={styles.historyTime}>
                  {new Date().toLocaleTimeString()}
                </Text>
              </View>
              <View style={[
                styles.historyBadge,
                { backgroundColor: check.isSecure ? '#00FF94' : '#FF4444' }
              ]}>
                <Text style={styles.historyBadgeText}>
                  {check.isSecure ? 'SECURE' : 'ALERT'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </BlurView>
    </View>
  );

  return (
    <LinearGradient colors={['#0A0B0F', '#1A1B23']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Security Center</Text>
          <TouchableOpacity style={styles.scanButton} onPress={performAIScan}>
            <Radar size={20} color="#9D4EDD" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'overview' && styles.activeTabText
            ]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ai-engine' && styles.activeTab]}
            onPress={() => setActiveTab('ai-engine')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'ai-engine' && styles.activeTabText
            ]}>
              AI Engine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'analytics' && styles.activeTabText
            ]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'overview' && <SecurityOverview />}
          {activeTab === 'ai-engine' && <AISecurityEngine />}
          {activeTab === 'analytics' && <SecurityAnalytics />}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9D4EDD',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00FF94',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF60',
  },
  activeTabText: {
    color: '#00FF94',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingBottom: 100,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  emergencyText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginLeft: 12,
  },
  emergencyActions: {
    alignItems: 'flex-end',
  },
  emergencySubtext: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FF444480',
    marginBottom: 4,
  },
  emergencyButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emergencyButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  mainSecurityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  securityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  securityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityTitleText: {
    marginLeft: 16,
  },
  securityTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  securitySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginTop: 2,
  },
  securityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  encryptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  encryptionDetails: {
    marginTop: 16,
    gap: 8,
  },
  encryptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginLeft: 8,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 60) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  complianceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
    marginBottom: 8,
  },
  complianceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF80',
  },
  complianceStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  complianceStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  analyticsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  analyticsGrid: {
    gap: 16,
  },
  analyticItem: {
    marginBottom: 16,
  },
  analyticLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  analyticBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  analyticBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  analyticValue: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    textAlign: 'right',
  },
  lastScanInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastScanText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  historyTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
});