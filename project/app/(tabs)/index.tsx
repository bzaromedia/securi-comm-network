import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurity } from '@/contexts/SecurityContext';
import {
  Shield,
  Activity,
  Users,
  MessageCircle,
  Phone,
  Wifi,
  WifiOff,
  AlertTriangle,
  Lock,
  Eye,
  Zap,
  Brain,
  Network,
  FileShield,
  Cpu,
  Globe,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    securityLevel, 
    threatLevel, 
    isDeviceSecure, 
    encryptionStatus,
    isEmergencyMode,
    enableEmergencyMode,
    disableEmergencyMode,
    threatDetection,
    aiSecurityScan,
    meshNetworkStatus,
    complianceStatus
  } = useSecurity();

  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'mesh'>('online');
  const [activeConnections, setActiveConnections] = useState(3);
  const [todayStats, setTodayStats] = useState({
    messages: 24,
    calls: 7,
    contacts: 156,
    dataEncrypted: '2.4GB',
  });

  const pulseAnimation = useSharedValue(1);
  const shieldRotation = useSharedValue(0);
  const threatPulse = useSharedValue(1);

  useEffect(() => {
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

  const getMeshStatusColor = () => {
    switch (meshNetworkStatus) {
      case 'connected': return '#00FF94';
      case 'searching': return '#FFB800';
      case 'disconnected': return '#FF4444';
      default: return '#FF4444';
    }
  };

  const StatCard = ({ title, value, icon, color = '#00FF94', subtitle }: any) => (
    <BlurView intensity={20} style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </BlurView>
  );

  const QuickAction = ({ title, icon, onPress, color = '#00FF94', badge }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.quickAction}>
      <BlurView intensity={20} style={styles.quickActionBlur}>
        <View style={[styles.quickActionIcon, { borderColor: color }]}>
          {icon}
          {badge && (
            <View style={[styles.actionBadge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.quickActionText}>{title}</Text>
      </BlurView>
    </TouchableOpacity>
  );

  const SecurityMetric = ({ label, value, color, icon }: any) => (
    <View style={styles.securityMetric}>
      <View style={styles.metricIcon}>
        {icon}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#0A0B0F', '#1A1B23']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good evening</Text>
              <Text style={styles.userName}>Secure User</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <BlurView intensity={20} style={styles.profileBlur}>
                <Animated.View style={animatedShieldStyle}>
                  <Shield size={24} color={getSecurityColor()} />
                </Animated.View>
              </BlurView>
            </TouchableOpacity>
          </View>

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

          {/* Advanced Security Status */}
          <BlurView intensity={20} style={styles.securityStatus}>
            <View style={styles.securityHeader}>
              <View style={styles.securityTitleContainer}>
                <Animated.View style={animatedPulseStyle}>
                  <Shield size={24} color={getSecurityColor()} />
                </Animated.View>
                <Text style={styles.securityTitle}>Zero Trust Security</Text>
              </View>
              <View style={[styles.statusIndicator, { backgroundColor: getSecurityColor() }]} />
            </View>

            <View style={styles.securityMetrics}>
              <SecurityMetric
                label="Level"
                value={securityLevel.toUpperCase()}
                color={getSecurityColor()}
                icon={<Lock size={16} color={getSecurityColor()} />}
              />
              <SecurityMetric
                label="Threats"
                value={`${threatLevel}/10`}
                color={getThreatColor()}
                icon={<Animated.View style={animatedThreatStyle}>
                  <AlertTriangle size={16} color={getThreatColor()} />
                </Animated.View>}
              />
              <SecurityMetric
                label="E2EE"
                value="ACTIVE"
                color="#00FF94"
                icon={<FileShield size={16} color="#00FF94" />}
              />
            </View>

            {/* Threat Detection Details */}
            <View style={styles.threatDetails}>
              <Text style={styles.threatTitle}>AI Threat Analysis</Text>
              <View style={styles.threatFactors}>
                <View style={styles.threatFactor}>
                  <Text style={styles.factorLabel}>Network</Text>
                  <View style={[styles.factorBar, { width: `${(threatDetection.factors.networkAnomaly / 3) * 100}%` }]} />
                </View>
                <View style={styles.threatFactor}>
                  <Text style={styles.factorLabel}>Behavior</Text>
                  <View style={[styles.factorBar, { width: `${(threatDetection.factors.behaviorPattern / 2) * 100}%` }]} />
                </View>
                <View style={styles.threatFactor}>
                  <Text style={styles.factorLabel}>Device</Text>
                  <View style={[styles.factorBar, { width: `${(threatDetection.factors.deviceIntegrity / 2) * 100}%` }]} />
                </View>
              </View>
            </View>
          </BlurView>

          {/* Network & Mesh Status */}
          <BlurView intensity={20} style={styles.networkCard}>
            <View style={styles.networkHeader}>
              {meshNetworkStatus === 'connected' ? (
                <Network size={20} color="#00FF94" />
              ) : networkStatus === 'offline' ? (
                <WifiOff size={20} color="#FF4444" />
              ) : (
                <Wifi size={20} color="#00FF94" />
              )}
              <Text style={styles.networkTitle}>
                {isEmergencyMode ? 'Mesh Network' : 'Network Status'}
              </Text>
              <View style={[styles.networkBadge, { backgroundColor: getMeshStatusColor() + '20', borderColor: getMeshStatusColor() }]}>
                <Text style={[styles.networkBadgeText, { color: getMeshStatusColor() }]}>
                  {isEmergencyMode ? meshNetworkStatus.toUpperCase() : networkStatus.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.networkSubtext}>
              {activeConnections} secure connections • XChaCha20-Poly1305 encryption
            </Text>
          </BlurView>

          {/* Enhanced Statistics */}
          <View style={styles.statsContainer}>
            <StatCard
              title="Messages"
              value={todayStats.messages}
              subtitle="Today"
              icon={<MessageCircle size={18} color="#00FF94" />}
            />
            <StatCard
              title="Calls"
              value={todayStats.calls}
              subtitle="Encrypted"
              icon={<Phone size={18} color="#00D4FF" />}
              color="#00D4FF"
            />
            <StatCard
              title="Data"
              value={todayStats.dataEncrypted}
              subtitle="Encrypted"
              icon={<FileShield size={18} color="#FF6B35" />}
              color="#FF6B35"
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Security Actions</Text>
            <View style={styles.quickActionsGrid}>
              <QuickAction
                title="Secure Call"
                icon={<Phone size={24} color="#00FF94" />}
                onPress={() => Alert.alert('Secure Call', 'Initiating encrypted voice call')}
              />
              <QuickAction
                title="AI Scan"
                icon={<Brain size={24} color="#9D4EDD" />}
                onPress={aiSecurityScan}
                color="#9D4EDD"
                badge="AI"
              />
              <QuickAction
                title="Emergency"
                icon={<AlertTriangle size={24} color="#FF4444" />}
                onPress={enableEmergencyMode}
                color="#FF4444"
                badge={isEmergencyMode ? "ON" : undefined}
              />
              <QuickAction
                title="Mesh Mode"
                icon={<Network size={24} color="#00D4FF" />}
                onPress={() => Alert.alert('Mesh Network', 'Off-grid communication mode')}
                color="#00D4FF"
                badge={meshNetworkStatus === 'connected' ? "ON" : undefined}
              />
            </View>
          </View>

          {/* Compliance Status */}
          <BlurView intensity={20} style={styles.complianceCard}>
            <View style={styles.complianceHeader}>
              <Globe size={20} color="#00FF94" />
              <Text style={styles.complianceTitle}>Regulatory Compliance</Text>
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

          {/* Security Insights */}
          <BlurView intensity={20} style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Activity size={20} color="#00FF94" />
              <Text style={styles.insightsTitle}>Security Insights</Text>
              <Text style={styles.insightsTime}>
                Last scan: {new Date(threatDetection.lastScan).toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <Lock size={16} color="#00FF94" />
                <Text style={styles.insightText}>
                  All communications encrypted with XChaCha20-Poly1305
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Shield size={16} color="#00FF94" />
                <Text style={styles.insightText}>
                  Zero-knowledge architecture • No metadata stored
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Brain size={16} color="#9D4EDD" />
                <Text style={styles.insightText}>
                  AI threat detection monitoring {threatDetection.factors.networkAnomaly.toFixed(1)}/3.0 network anomaly
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Cpu size={16} color="#FFB800" />
                <Text style={styles.insightText}>
                  Hardware security module active • TPM verified
                </Text>
              </View>
            </View>
          </BlurView>
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  profileButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileBlur: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
  securityStatus: {
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
    marginBottom: 16,
  },
  securityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  securityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  securityMetric: {
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  threatDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  threatTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  threatFactors: {
    gap: 8,
  },
  threatFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factorLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    width: 60,
  },
  factorBar: {
    height: 4,
    backgroundColor: '#00FF94',
    borderRadius: 2,
    flex: 1,
    marginLeft: 12,
  },
  networkCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  networkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  networkBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  networkSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF80',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 60) / 2,
    marginBottom: 16,
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
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#000000',
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
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  complianceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
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
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  insightsTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginLeft: 12,
    flex: 1,
  },
});