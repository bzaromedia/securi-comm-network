import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  Home, 
  Phone, 
  MessageCircle, 
  Users, 
  Settings,
  Shield
} from 'lucide-react-native';
import { useSecurity } from '@/contexts/SecurityContext';

export default function TabLayout() {
  const { securityLevel, isEmergencyMode } = useSecurity();

  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'high': return '#00FF94';
      case 'medium': return '#FFB800';
      case 'low': return '#FF4444';
      default: return '#00FF94';
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(10, 11, 15, 0.8)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        ),
        tabBarActiveTintColor: getSecurityColor(),
        tabBarInactiveTintColor: '#FFFFFF60',
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter-Medium',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Home size={size} color={color} strokeWidth={2} />
              {isEmergencyMode && (
                <View style={[styles.emergencyBadge, { backgroundColor: '#FF4444' }]}>
                  <Shield size={8} color="#FFFFFF" />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ size, color }) => (
            <Phone size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: 'Security',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Shield size={size} color={color} strokeWidth={2} />
              {securityLevel === 'low' && (
                <View style={[styles.alertBadge, { backgroundColor: '#FF4444' }]}>
                  <Text style={styles.badgeText}>!</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  emergencyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});