import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Shield,
  Lock,
  Brain,
  Users,
  MessageCircle,
  Phone,
  ChevronRight,
  Check,
  ArrowRight,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  image?: string;
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const slideAnimation = useSharedValue(0);
  const fadeAnimation = useSharedValue(1);
  const scaleAnimation = useSharedValue(1);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SecuriComm',
      subtitle: 'Military-Grade Security',
      description: 'Experience the future of secure communication with zero-trust architecture and AI-powered threat detection.',
      icon: Shield,
      color: '#00FF94',
      features: [
        'End-to-end encryption',
        'Zero-knowledge architecture',
        'AI threat detection',
        'Quantum-resistant security'
      ],
      image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'security',
      title: 'Advanced Security Features',
      subtitle: 'XChaCha20-Poly1305 Encryption',
      description: 'Your communications are protected by military-grade encryption that even quantum computers cannot break.',
      icon: Lock,
      color: '#00D4FF',
      features: [
        'XChaCha20-Poly1305 encryption',
        'Perfect forward secrecy',
        'Hardware security module',
        'Biometric authentication'
      ],
      image: 'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'ai',
      title: 'AI-Powered Protection',
      subtitle: 'Real-time Threat Detection',
      description: 'Our AI security engine continuously monitors for threats and adapts to new attack patterns in real-time.',
      icon: Brain,
      color: '#9D4EDD',
      features: [
        'Real-time threat analysis',
        'Behavioral pattern detection',
        'Automated threat response',
        'Predictive security alerts'
      ],
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'communication',
      title: 'Secure Communication',
      subtitle: 'Messages, Calls & More',
      description: 'Communicate freely with encrypted messaging, voice calls, video calls, and secure file sharing.',
      icon: MessageCircle,
      color: '#FFB800',
      features: [
        'Encrypted messaging',
        'Secure voice & video calls',
        'File sharing with preview',
        'Group management'
      ],
      image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      subtitle: 'Start Communicating Securely',
      description: 'SecuriComm is ready to protect your communications. Let\'s get started with your secure digital life.',
      icon: Check,
      color: '#00FF94',
      features: [
        'Complete security setup',
        'All features unlocked',
        'Ready for secure communication',
        'Enterprise-grade protection'
      ],
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      
      fadeAnimation.value = withTiming(0, { duration: 200 }, () => {
        slideAnimation.value = withTiming(1, { duration: 300 }, () => {
          runOnJS(setCurrentStep)(currentStep + 1);
          slideAnimation.value = 0;
          fadeAnimation.value = withTiming(1, { duration: 300 });
        });
      });
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      scaleAnimation.value = withSequence(
        withSpring(1.1),
        withSpring(1),
        withTiming(0, { duration: 500 }, () => {
          runOnJS(onComplete)();
        })
      );
    }
  };

  const skipOnboarding = () => {
    scaleAnimation.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onSkip || onComplete)();
    });
  };

  const animatedSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnimation.value * width }],
  }));

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnimation.value,
  }));

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Animated.View style={[styles.container, animatedScaleStyle]}>
      <LinearGradient colors={['#0A0B0F', '#1A1B23', '#2A2B35']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: index <= currentStep ? currentStepData.color : 'rgba(255, 255, 255, 0.2)',
                      transform: [{ scale: index === currentStep ? 1.2 : 1 }],
                    }
                  ]}
                />
              ))}
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {onboardingSteps.length}
            </Text>
          </View>

          {/* Skip Button */}
          {onSkip && currentStep < onboardingSteps.length - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          <Animated.View style={[styles.content, animatedFadeStyle, animatedSlideStyle]}>
            {/* Hero Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentStepData.image }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <BlurView intensity={20} style={styles.imageOverlay}>
                <View style={[styles.iconContainer, { borderColor: currentStepData.color }]}>
                  <IconComponent size={40} color={currentStepData.color} />
                </View>
              </BlurView>
            </View>

            {/* Content */}
            <View style={styles.textContent}>
              <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
              <Text style={styles.title}>{currentStepData.title}</Text>
              <Text style={styles.description}>{currentStepData.description}</Text>

              {/* Features List */}
              <View style={styles.featuresList}>
                {currentStepData.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={[styles.featureDot, { backgroundColor: currentStepData.color }]} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: currentStepData.color }]}
              onPress={nextStep}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
              <ArrowRight size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF60',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    height: height * 0.35,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 40,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    padding: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF80',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresList: {
    alignSelf: 'stretch',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    flex: 1,
  },
  navigation: {
    paddingBottom: 40,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginRight: 8,
  },
});