import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurity } from '@/contexts/SecurityContext';
import {
  Settings as SettingsIcon,
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  Bell,
  Moon,
  Globe,
  HelpCircle,
  LogOut,
  AlertTriangle,
  Fingerprint,
  Database,
  Wifi,
  ChevronRight,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { 
    securityLevel, 
    isEmergencyMode, 
    enableEmergencyMode, 
    disableEmergencyMode 
  } = useSecurity();

  const [settings, setSettings] = useState({
    biometricAuth: true,
    endToEndEncryption: true,
    autoDelete: false,
    darkMode: true,
    notifications: true,
    metadataProtection: true,
    meshNetworking: false,
    aiThreatDetection: true,
    screenSecurity: true,
    voiceEncryption: true,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? This will clear all local data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const SettingSection = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <BlurView intensity={20} style={styles.sectionContent}>
        {children}
      </BlurView>
    </View>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onPress, 
    showToggle = false,
    showChevron = false,
    danger = false 
  }: any) => (
    <TouchableOpacity
      style={[styles.settingItem, danger && styles.dangerItem]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIcon]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {showToggle && (
          <Switch
            value={value}
            onValueChange={onPress}
            trackColor={{ false: '#FFFFFF20', true: '#00FF9460' }}
            thumbColor={value ? '#00FF94' : '#FFFFFF60'}
          />
        )}
        {showChevron && (
          <ChevronRight size={20} color="#FFFFFF60" />
        )}
      </View>
    </TouchableOpacity>
  );

  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'high': return '#00FF94';
      case 'medium': return '#FFB800';
      case 'low': return '#FF4444';
      default: return '#00FF94';
    }
  };

  return (
    <LinearGradient colors={['#0A0B0F', '#1A1B23']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity style={styles.helpButton}>
              <HelpCircle size={24} color="#FFFFFF60" />
            </TouchableOpacity>
          </View>

          {/* Security Status */}
          <BlurView intensity={20} style={styles.securityStatus}>
            <View style={styles.securityHeader}>
              <Shield size={24} color={getSecurityColor()} />
              <Text style={styles.securityTitle}>Security Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getSecurityColor() }]}>
                <Text style={styles.statusText}>
                  {securityLevel.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.securityDescription}>
              Your device and communications are protected with military-grade encryption
            </Text>
          </BlurView>

          {/* Emergency Mode */}
          {isEmergencyMode && (
            <BlurView intensity={20} style={styles.emergencyMode}>
              <AlertTriangle size={20} color="#FF4444" />
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>Emergency Mode Active</Text>
                <Text style={styles.emergencySubtitle}>
                  Enhanced security protocols enabled
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.emergencyButton}
                onPress={disableEmergencyMode}
              >
                <Text style={styles.emergencyButtonText}>Disable</Text>
              </TouchableOpacity>
            </BlurView>
          )}

          {/* Security Settings */}
          <SettingSection title="Security & Privacy">
            <SettingItem
              icon={<Fingerprint size={20} color="#00FF94" />}
              title="Biometric Authentication"
              subtitle="Use fingerprint or face recognition"
              value={settings.biometricAuth}
              onPress={() => toggleSetting('biometricAuth')}
              showToggle
            />
            <SettingItem
              icon={<Lock size={20} color="#00FF94" />}
              title="End-to-End Encryption"
              subtitle="XChaCha20-Poly1305 encryption"
              value={settings.endToEndEncryption}
              onPress={() => toggleSetting('endToEndEncryption')}
              showToggle
            />
            <SettingItem
              icon={<Eye size={20} color="#00FF94" />}
              title="Metadata Protection"
              subtitle="Hide communication patterns"
              value={settings.metadataProtection}
              onPress={() => toggleSetting('metadataProtection')}
              showToggle
            />
            <SettingItem
              icon={<Database size={20} color="#00FF94" />}
              title="Auto-Delete Messages"
              subtitle="Automatically delete old messages"
              value={settings.autoDelete}
              onPress={() => toggleSetting('autoDelete')}
              showToggle
            />
          </SettingSection>

          {/* AI & Threat Detection */}
          <SettingSection title="AI & Threat Detection">
            <SettingItem
              icon={<Shield size={20} color="#9D4EDD" />}
              title="AI Threat Detection"
              subtitle="Monitor for security threats"
              value={settings.aiThreatDetection}
              onPress={() => toggleSetting('aiThreatDetection')}
              showToggle
            />
            <SettingItem
              icon={<EyeOff size={20} color="#9D4EDD" />}
              title="Screen Security"
              subtitle="Prevent screenshots and recording"
              value={settings.screenSecurity}
              onPress={() => toggleSetting('screenSecurity')}
              showToggle
            />
          </SettingSection>

          {/* Communication */}
          <SettingSection title="Communication">
            <SettingItem
              icon={<Key size={20} color="#00D4FF" />}
              title="Voice Encryption"
              subtitle="Encrypt all voice calls"
              value={settings.voiceEncryption}
              onPress={() => toggleSetting('voiceEncryption')}
              showToggle
            />
            <SettingItem
              icon={<Wifi size={20} color="#00D4FF" />}
              title="Mesh Networking"
              subtitle="Off-grid communication"
              value={settings.meshNetworking}
              onPress={() => toggleSetting('meshNetworking')}
              showToggle
            />
          </SettingSection>

          {/* Preferences */}
          <SettingSection title="Preferences">
            <SettingItem
              icon={<Bell size={20} color="#FFB800" />}
              title="Notifications"
              subtitle="Push notifications and alerts"
              value={settings.notifications}
              onPress={() => toggleSetting('notifications')}
              showToggle
            />
            <SettingItem
              icon={<Moon size={20} color="#FFB800" />}
              title="Dark Mode"
              subtitle="Use dark theme"
              value={settings.darkMode}
              onPress={() => toggleSetting('darkMode')}
              showToggle
            />
            <SettingItem
              icon={<Globe size={20} color="#FFB800" />}
              title="Language"
              subtitle="English (US)"
              onPress={() => Alert.alert('Language', 'Feature coming soon')}
              showChevron
            />
          </SettingSection>

          {/* Emergency Actions */}
          <SettingSection title="Emergency">
            <SettingItem
              icon={<AlertTriangle size={20} color="#FF6B35" />}
              title="Emergency Mode"
              subtitle="Enable maximum security protocols"
              onPress={() => {
                if (isEmergencyMode) {
                  disableEmergencyMode();
                } else {
                  enableEmergencyMode();
                }
              }}
              showChevron
            />
          </SettingSection>

          {/* Account */}
          <SettingSection title="Account">
            <SettingItem
              icon={<LogOut size={20} color="#FF4444" />}
              title="Sign Out"
              subtitle="Clear all local data and sign out"
              onPress={handleLogout}
              danger
              showChevron
            />
          </SettingSection>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Naimara v1.0.0</Text>
            <Text style={styles.footerSubtitle}>
              Built with Zero Trust Security Architecture
            </Text>
            <Text style={styles.footerCompliance}>
              HIPAA • GDPR • SOC2 • ISO 27001 Compliant
            </Text>
          </View>
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
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  securityDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    lineHeight: 20,
  },
  emergencyMode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  emergencyText: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF444480',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dangerItem: {},
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dangerText: {
    color: '#FF4444',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 120,
  },
  footerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginBottom: 8,
  },
  footerCompliance: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF40',
    textAlign: 'center',
  },
});