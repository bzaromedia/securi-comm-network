import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurity } from '@/contexts/SecurityContext';
import { Platform } from 'react-native';
import { 
  Shield, 
  Fingerprint, 
  Lock, 
  Eye, 
  EyeOff, 
  Cpu, 
  Globe, 
  Zap,
  Brain,
  FileShield
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const { login, isLoading } = useAuth();
  const { securityLevel, encryptionStatus, complianceStatus } = useSecurity();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [authStep, setAuthStep] = useState<'initial' | 'biometric' | 'verifying'>('initial');

  const pulseAnimation = useSharedValue(1);
  const shieldRotation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    // Continuous pulse animation for the shield
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
    
    // Shield rotation animation
    shieldRotation.value = withRepeat(
      withTiming(360, { duration: 10000 }),
      -1,
      false
    );

    // Glow effect animation
    glowAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const animatedShieldStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shieldRotation.value}deg` }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (glowAnimation.value * 0.7),
  }));

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    setAuthStep('biometric');
    
    try {
      // Simulate device security check
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuthStep('verifying');
      
      const success = await login();
      if (success) {
        // Show success animation
        await new Promise(resolve => setTimeout(resolve, 500));
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Authentication Failed', 
          'Unable to verify your identity. Please try again.',
          [{ text: 'OK', onPress: () => setAuthStep('initial') }]
        );
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert(
        'Authentication Error', 
        'A security error occurred. Please try again.',
        [{ text: 'OK', onPress: () => setAuthStep('initial') }]
      );
    } finally {
      setIsAuthenticating(false);
      setAuthStep('initial');
    }
  };

  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'high': return '#00FF94';
      case 'medium': return '#FFB800';
      case 'low': return '#FF4444';
      default: return '#00FF94';
    }
  };

  const getAuthStepText = () => {
    switch (authStep) {
      case 'biometric':
        return Platform.OS === 'web' 
          ? 'Verifying web credentials...' 
          : 'Place your finger on the sensor';
      case 'verifying':
        return 'Verifying security protocols...';
      default:
        return 'Tap to authenticate';
    }
  };

  return (
    <LinearGradient
      colors={['#0A0B0F', '#1A1B23', '#2A2B35']}
      style={styles.container}
    >
      {/* Animated Background Pattern */}
      <View style={styles.backgroundPattern}>
        {Array.from({ length: 30 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.patternDot,
              animatedGlowStyle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: 0.1 + Math.random() * 0.2,
              },
            ]}
          />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.logoContainer, animatedPulseStyle]}>
          <View style={styles.shieldContainer}>
            <Animated.View style={[styles.shieldGlow, animatedGlowStyle]} />
            <Animated.View style={[styles.shieldIcon, animatedShieldStyle]}>
              <Shield size={80} color="#00FF94" strokeWidth={1.5} />
            </Animated.View>
          </View>
        </Animated.View>
        
        <Text style={styles.title}>Naimara</Text>
        <Text style={styles.subtitle}>Zero Trust Security Platform</Text>
        <Text style={styles.tagline}>Military-Grade • Quantum-Resistant • AI-Powered</Text>
      </View>

      {/* Security Status */}
      <BlurView intensity={20} style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <View style={[styles.securityIndicator, { backgroundColor: getSecurityColor() }]} />
          <Text style={styles.securityLevel}>
            Security Level: {securityLevel.toUpperCase()}
          </Text>
          <TouchableOpacity
            onPress={() => setShowSecurityDetails(!showSecurityDetails)}
            style={styles.toggleButton}
          >
            {showSecurityDetails ? (
              <EyeOff size={20} color="#FFFFFF80" />
            ) : (
              <Eye size={20} color="#FFFFFF80" />
            )}
          </TouchableOpacity>
        </View>

        {showSecurityDetails && (
          <View style={styles.securityDetails}>
            <View style={styles.securityItem}>
              <FileShield size={16} color="#00FF94" />
              <Text style={styles.securityText}>
                XChaCha20-Poly1305: {encryptionStatus.toUpperCase()}
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Shield size={16} color="#00FF94" />
              <Text style={styles.securityText}>Signal Protocol: Active</Text>
            </View>
            <View style={styles.securityItem}>
              <Cpu size={16} color="#00FF94" />
              <Text style={styles.securityText}>
                Hardware Security: {Platform.OS === 'web' ? 'Web Secure Context' : 'TPM Verified'}
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Brain size={16} color="#9D4EDD" />
              <Text style={styles.securityText}>AI Threat Detection: Active</Text>
            </View>
          </View>
        )}
      </BlurView>

      {/* Compliance Status */}
      <BlurView intensity={20} style={styles.complianceCard}>
        <View style={styles.complianceHeader}>
          <Globe size={16} color="#00FF94" />
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

      {/* Authentication Button */}
      <TouchableOpacity
        style={[styles.authButton, (isAuthenticating || isLoading) && styles.authButtonDisabled]}
        onPress={handleAuthenticate}
        disabled={isAuthenticating || isLoading}
      >
        <LinearGradient
          colors={['#00FF94', '#00CC75']}
          style={styles.authButtonGradient}
        >
          {isAuthenticating || isLoading ? (
            <View style={styles.authButtonContent}>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={styles.authButtonText}>{getAuthStepText()}</Text>
            </View>
          ) : (
            <View style={styles.authButtonContent}>
              <Fingerprint size={24} color="#000000" />
              <Text style={styles.authButtonText}>
                {Platform.OS === 'web' ? 'Secure Authentication' : 'Biometric Authentication'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Security Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Lock size={16} color="#00FF94" />
          <Text style={styles.featureText}>End-to-End Encryption</Text>
        </View>
        <View style={styles.feature}>
          <Zap size={16} color="#FFB800" />
          <Text style={styles.featureText}>Zero-Knowledge Architecture</Text>
        </View>
        <View style={styles.feature}>
          <Brain size={16} color="#9D4EDD" />
          <Text style={styles.featureText}>AI-Powered Security</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Protected by XChaCha20-Poly1305 • Signal Protocol
        </Text>
        <Text style={styles.footerSubtext}>
          HIPAA • GDPR • CCPA • SOC2 • ISO 27001 Compliant
        </Text>
        <Text style={styles.footerCopyright}>
          © 2024 Naimara • Bzaro Coding Haus
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    width: 2,
    height: 2,
    backgroundColor: '#00FF94',
    borderRadius: 1,
    position: 'absolute',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  shieldContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00FF94',
    opacity: 0.2,
  },
  shieldIcon: {
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF80',
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#00FF94',
    textAlign: 'center',
  },
  securityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  securityLevel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  toggleButton: {
    padding: 4,
  },
  securityDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginLeft: 12,
  },
  complianceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  complianceTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
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
    marginBottom: 6,
  },
  complianceLabel: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF80',
  },
  complianceStatus: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  complianceStatusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  authButton: {
    width: '100%',
    marginBottom: 30,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonGradient: {
    paddingVertical: 18,
    borderRadius: 12,
  },
  authButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginLeft: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF40',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerCopyright: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF30',
    textAlign: 'center',
  },
});