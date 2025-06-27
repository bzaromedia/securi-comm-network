import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Search,
  Shield,
  Lock,
  Plus,
  UserPlus,
} from 'lucide-react-native';

interface CallRecord {
  id: string;
  name: string;
  number: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
  duration?: string;
  timestamp: string;
  isEncrypted: boolean;
}

export default function CallsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'contacts'>('recent');

  const recentCalls: CallRecord[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      number: '+1 (555) 123-4567',
      type: 'incoming',
      isVideo: false,
      duration: '12:34',
      timestamp: '2 hours ago',
      isEncrypted: true,
    },
    {
      id: '2',
      name: 'Mark Johnson',
      number: '+1 (555) 987-6543',
      type: 'outgoing',
      isVideo: true,
      duration: '05:42',
      timestamp: '5 hours ago',
      isEncrypted: true,
    },
    {
      id: '3',
      name: 'Unknown',
      number: '+1 (555) 444-3333',
      type: 'missed',
      isVideo: false,
      timestamp: '1 day ago',
      isEncrypted: false,
    },
    {
      id: '4',
      name: 'Emma Davis',
      number: '+1 (555) 777-8888',
      type: 'incoming',
      isVideo: true,
      duration: '23:15',
      timestamp: '2 days ago',
      isEncrypted: true,
    },
  ];

  const getCallIcon = (type: string, isVideo: boolean) => {
    if (isVideo) return <Video size={16} color="#00D4FF" />;
    
    switch (type) {
      case 'incoming':
        return <PhoneIncoming size={16} color="#00FF94" />;
      case 'outgoing':
        return <PhoneOutgoing size={16} color="#00FF94" />;
      case 'missed':
        return <PhoneMissed size={16} color="#FF4444" />;
      default:
        return <Phone size={16} color="#FFFFFF80" />;
    }
  };

  const makeCall = (number: string, isVideo: boolean = false) => {
    Alert.alert(
      'Secure Call',
      `Initiating ${isVideo ? 'video' : 'voice'} call to ${number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling...') },
      ]
    );
  };

  const CallItem = ({ call }: { call: CallRecord }) => (
    <TouchableOpacity 
      style={styles.callItem}
      onPress={() => makeCall(call.number, call.isVideo)}
    >
      <BlurView intensity={20} style={styles.callItemBlur}>
        <View style={styles.callIconContainer}>
          {getCallIcon(call.type, call.isVideo)}
        </View>
        
        <View style={styles.callDetails}>
          <View style={styles.callHeader}>
            <Text style={styles.callName}>{call.name}</Text>
            {call.isEncrypted && (
              <Shield size={12} color="#00FF94" />
            )}
          </View>
          
          <Text style={styles.callNumber}>{call.number}</Text>
          
          <View style={styles.callMeta}>
            <Text style={styles.callTime}>{call.timestamp}</Text>
            {call.duration && (
              <Text style={styles.callDuration}>• {call.duration}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => makeCall(call.number)}
        >
          <Phone size={20} color="#00FF94" />
        </TouchableOpacity>
      </BlurView>
    </TouchableOpacity>
  );

  const QuickCallButton = ({ icon, label, onPress, color = '#00FF94' }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.quickCallButton}>
      <BlurView intensity={20} style={styles.quickCallBlur}>
        <View style={[styles.quickCallIcon, { borderColor: color }]}>
          {icon}
        </View>
        <Text style={styles.quickCallLabel}>{label}</Text>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0A0B0F', '#1A1B23']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Secure Calls</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#00FF94" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <BlurView intensity={20} style={styles.searchContainer}>
          <Search size={20} color="#FFFFFF60" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search calls and contacts..."
            placeholderTextColor="#FFFFFF60"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </BlurView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickCallButton
            icon={<Phone size={24} color="#00FF94" />}
            label="Voice Call"
            onPress={() => Alert.alert('Voice Call', 'Select a contact to call')}
          />
          <QuickCallButton
            icon={<Video size={24} color="#00D4FF" />}
            label="Video Call"
            onPress={() => Alert.alert('Video Call', 'Select a contact to video call')}
            color="#00D4FF"
          />
          <QuickCallButton
            icon={<UserPlus size={24} color="#FF6B35" />}
            label="Add Contact"
            onPress={() => Alert.alert('Add Contact', 'Feature coming soon')}
            color="#FF6B35"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
            onPress={() => setActiveTab('recent')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'recent' && styles.activeTabText
            ]}>
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
            onPress={() => setActiveTab('contacts')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'contacts' && styles.activeTabText
            ]}>
              Contacts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Call List */}
        <ScrollView 
          style={styles.callsList}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'recent' && (
            <>
              {recentCalls.map((call) => (
                <CallItem key={call.id} call={call} />
              ))}
            </>
          )}

          {activeTab === 'contacts' && (
            <View style={styles.emptyState}>
              <UserPlus size={48} color="#FFFFFF40" />
              <Text style={styles.emptyTitle}>No Contacts Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add secure contacts to start making encrypted calls
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Security Info */}
        <BlurView intensity={20} style={styles.securityInfo}>
          <View style={styles.securityRow}>
            <Lock size={16} color="#00FF94" />
            <Text style={styles.securityText}>
              All calls use end-to-end encryption
            </Text>
          </View>
          <View style={styles.securityRow}>
            <Shield size={16} color="#00FF94" />
            <Text style={styles.securityText}>
              Zero-knowledge voice processing
            </Text>
          </View>
        </BlurView>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF94',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickCallButton: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 4,
  },
  quickCallBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickCallIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickCallLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
  callsList: {
    flex: 1,
  },
  callItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  callItemBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  callIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  callDetails: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  callName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  callNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginBottom: 4,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  callDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginLeft: 4,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF94',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  securityInfo: {
    backgroundColor: 'rgba(0, 255, 148, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.2)',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginLeft: 12,
    flex: 1,
  },
});