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
  Users,
  Search,
  Plus,
  Shield,
  Phone,
  MessageCircle,
  Video,
  MoreVertical,
  UserPlus,
  QrCode,
  Key,
} from 'lucide-react-native';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  isOnline: boolean;
  isVerified: boolean;
  publicKey: string;
  lastSeen: string;
  mutualContacts: number;
}

export default function ContactsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'verified' | 'pending'>('all');

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      phone: '+1 (555) 123-4567',
      email: 'sarah.chen@secure.com',
      avatar: 'SC',
      isOnline: true,
      isVerified: true,
      publicKey: 'pub_key_abc123...',
      lastSeen: 'now',
      mutualContacts: 12,
    },
    {
      id: '2',
      name: 'Mark Johnson',
      phone: '+1 (555) 987-6543',
      email: 'mark.j@encrypted.com',
      avatar: 'MJ',
      isOnline: false,
      isVerified: true,
      publicKey: 'pub_key_def456...',
      lastSeen: '2h ago',
      mutualContacts: 8,
    },
    {
      id: '3',
      name: 'Emma Davis',
      phone: '+1 (555) 777-8888',
      email: 'emma.davis@secure.net',
      avatar: 'ED',
      isOnline: true,
      isVerified: false,
      publicKey: 'pub_key_ghi789...',
      lastSeen: 'now',
      mutualContacts: 5,
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      phone: '+1 (555) 444-3333',
      avatar: 'AR',
      isOnline: false,
      isVerified: true,
      publicKey: 'pub_key_jkl012...',
      lastSeen: '1d ago',
      mutualContacts: 15,
    },
  ];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.phone.includes(searchQuery);
    
    if (selectedTab === 'verified') return matchesSearch && contact.isVerified;
    if (selectedTab === 'pending') return matchesSearch && !contact.isVerified;
    return matchesSearch;
  });

  const ContactItem = ({ contact }: { contact: Contact }) => (
    <TouchableOpacity style={styles.contactItem}>
      <BlurView intensity={20} style={styles.contactItemBlur}>
        <View style={styles.contactLeft}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: '#00FF94' }]}>
              <Text style={styles.avatarText}>{contact.avatar}</Text>
            </View>
            {contact.isOnline && <View style={styles.onlineIndicator} />}
            {contact.isVerified && (
              <View style={styles.verifiedBadge}>
                <Shield size={10} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactPhone}>{contact.phone}</Text>
            <View style={styles.contactMeta}>
              <Text style={styles.lastSeen}>
                {contact.isOnline ? 'Online' : `Last seen ${contact.lastSeen}`}
              </Text>
              {contact.mutualContacts > 0 && (
                <Text style={styles.mutualContacts}>
                  • {contact.mutualContacts} mutual
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.contactActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Call', `Calling ${contact.name}`)}
          >
            <Phone size={18} color="#00FF94" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Message', `Messaging ${contact.name}`)}
          >
            <MessageCircle size={18} color="#00D4FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MoreVertical size={18} color="#FFFFFF60" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, label, onPress, color = '#00FF94' }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.quickAction}>
      <BlurView intensity={20} style={styles.quickActionBlur}>
        <View style={[styles.quickActionIcon, { borderColor: color }]}>
          {icon}
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0A0B0F', '#1A1B23']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#00FF94" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <BlurView intensity={20} style={styles.searchContainer}>
          <Search size={20} color="#FFFFFF60" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="#FFFFFF60"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </BlurView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickAction
            icon={<UserPlus size={24} color="#00FF94" />}
            label="Add Contact"
            onPress={() => Alert.alert('Add Contact', 'Feature coming soon')}
          />
          <QuickAction
            icon={<QrCode size={24} color="#00D4FF" />}
            label="QR Code"
            onPress={() => Alert.alert('QR Code', 'Scan QR to add contact')}
            color="#00D4FF"
          />
          <QuickAction
            icon={<Key size={24} color="#FF6B35" />}
            label="Key Exchange"
            onPress={() => Alert.alert('Key Exchange', 'Secure key exchange')}
            color="#FF6B35"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'all' && styles.activeTabText
            ]}>
              All ({contacts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'verified' && styles.activeTab]}
            onPress={() => setSelectedTab('verified')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'verified' && styles.activeTabText
            ]}>
              Verified ({contacts.filter(c => c.isVerified).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
            onPress={() => setSelectedTab('pending')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'pending' && styles.activeTabText
            ]}>
              Pending ({contacts.filter(c => !c.isVerified).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contacts List */}
        <ScrollView 
          style={styles.contactsList}
          showsVerticalScrollIndicator={false}
        >
          {filteredContacts.map(contact => (
            <ContactItem key={contact.id} contact={contact} />
          ))}

          {filteredContacts.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color="#FFFFFF40" />
              <Text style={styles.emptyTitle}>No contacts found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or add new contacts
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Security Info */}
        <BlurView intensity={20} style={styles.securityInfo}>
          <View style={styles.securityRow}>
            <Shield size={16} color="#00FF94" />
            <Text style={styles.securityText}>
              All contacts use verified public keys
            </Text>
          </View>
          <View style={styles.securityRow}>
            <Key size={16} color="#00FF94" />
            <Text style={styles.securityText}>
              End-to-end encrypted communication
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
  quickAction: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
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
    marginBottom: 8,
  },
  quickActionLabel: {
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
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF60',
  },
  activeTabText: {
    color: '#00FF94',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactItemBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00FF94',
    borderWidth: 2,
    borderColor: '#0A0B0F',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00FF94',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginBottom: 4,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastSeen: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  mutualContacts: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginLeft: 4,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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