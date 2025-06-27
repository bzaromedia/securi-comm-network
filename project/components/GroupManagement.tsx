import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Users,
  Plus,
  Search,
  Settings,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'online' | 'offline' | 'away';
  joinedAt: number;
  lastSeen: number;
  permissions: {
    canInvite: boolean;
    canRemove: boolean;
    canEdit: boolean;
    canManageRoles: boolean;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  type: 'private' | 'public' | 'secret';
  memberCount: number;
  maxMembers: number;
  createdAt: number;
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    allowFileSharing: boolean;
    allowVoiceCalls: boolean;
    allowVideoConference: boolean;
    messageRetention: number; // days
    encryptionLevel: 'standard' | 'enhanced' | 'military';
  };
  members: GroupMember[];
  pendingInvites: string[];
  isOwner: boolean;
  isAdmin: boolean;
}

interface GroupManagementProps {
  groups?: Group[];
  onCreateGroup: (group: Partial<Group>) => void;
  onUpdateGroup: (groupId: string, updates: Partial<Group>) => void;
  onDeleteGroup: (groupId: string) => void;
  onInviteMember: (groupId: string, userId: string) => void;
  onRemoveMember: (groupId: string, userId: string) => void;
  onUpdateMemberRole: (groupId: string, userId: string, role: GroupMember['role']) => void;
}

export function GroupManagement({
  groups = [],
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onInviteMember,
  onRemoveMember,
  onUpdateMemberRole,
}: GroupManagementProps) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'groups' | 'create' | 'settings'>('groups');
  const [showMemberDetails, setShowMemberDetails] = useState<string | null>(null);

  // Sample data if none provided
  const sampleGroups: Group[] = groups.length > 0 ? groups : [
    {
      id: '1',
      name: 'Security Team',
      description: 'Core security team for enterprise operations',
      avatar: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
      type: 'private',
      memberCount: 8,
      maxMembers: 50,
      createdAt: Date.now() - 86400000 * 30,
      settings: {
        allowInvites: false,
        requireApproval: true,
        allowFileSharing: true,
        allowVoiceCalls: true,
        allowVideoConference: true,
        messageRetention: 90,
        encryptionLevel: 'military',
      },
      members: [
        {
          id: '1',
          name: 'Sarah Chen',
          avatar: 'SC',
          role: 'owner',
          status: 'online',
          joinedAt: Date.now() - 86400000 * 30,
          lastSeen: Date.now(),
          permissions: { canInvite: true, canRemove: true, canEdit: true, canManageRoles: true },
        },
        {
          id: '2',
          name: 'Mark Johnson',
          avatar: 'MJ',
          role: 'admin',
          status: 'online',
          joinedAt: Date.now() - 86400000 * 25,
          lastSeen: Date.now() - 300000,
          permissions: { canInvite: true, canRemove: true, canEdit: false, canManageRoles: false },
        },
      ],
      pendingInvites: ['user3', 'user4'],
      isOwner: true,
      isAdmin: true,
    },
    {
      id: '2',
      name: 'Development Team',
      description: 'Software development and engineering',
      avatar: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200',
      type: 'private',
      memberCount: 12,
      maxMembers: 25,
      createdAt: Date.now() - 86400000 * 15,
      settings: {
        allowInvites: true,
        requireApproval: false,
        allowFileSharing: true,
        allowVoiceCalls: true,
        allowVideoConference: true,
        messageRetention: 30,
        encryptionLevel: 'enhanced',
      },
      members: [],
      pendingInvites: [],
      isOwner: false,
      isAdmin: true,
    },
  ];

  const getRoleIcon = (role: GroupMember['role']) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      case 'moderator': return Settings;
      default: return Users;
    }
  };

  const getRoleColor = (role: GroupMember['role']) => {
    switch (role) {
      case 'owner': return '#FFB800';
      case 'admin': return '#FF6B35';
      case 'moderator': return '#9D4EDD';
      default: return '#00FF94';
    }
  };

  const getEncryptionColor = (level: Group['settings']['encryptionLevel']) => {
    switch (level) {
      case 'military': return '#FF4444';
      case 'enhanced': return '#FFB800';
      default: return '#00FF94';
    }
  };

  const GroupCard = ({ group }: { group: Group }) => {
    const encryptionColor = getEncryptionColor(group.settings.encryptionLevel);

    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => setSelectedGroup(group)}
      >
        <BlurView intensity={20} style={styles.groupCardBlur}>
          <View style={styles.groupHeader}>
            <Image source={{ uri: group.avatar }} style={styles.groupAvatar} />
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupDescription} numberOfLines={1}>
                {group.description}
              </Text>
              <View style={styles.groupMeta}>
                <Text style={styles.memberCount}>
                  {group.memberCount}/{group.maxMembers} members
                </Text>
                <View style={[styles.encryptionBadge, { backgroundColor: encryptionColor }]}>
                  <Lock size={10} color="#000000" />
                  <Text style={styles.encryptionText}>
                    {group.settings.encryptionLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.groupActions}>
              {group.isOwner && (
                <View style={styles.ownerBadge}>
                  <Crown size={12} color="#FFB800" />
                </View>
              )}
              <TouchableOpacity style={styles.actionButton}>
                <MoreVertical size={16} color="#FFFFFF60" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const MemberCard = ({ member, group }: { member: GroupMember; group: Group }) => {
    const RoleIcon = getRoleIcon(member.role);
    const roleColor = getRoleColor(member.role);

    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => setShowMemberDetails(showMemberDetails === member.id ? null : member.id)}
      >
        <BlurView intensity={20} style={styles.memberCardBlur}>
          <View style={styles.memberHeader}>
            <View style={styles.memberAvatarContainer}>
              <View style={[styles.memberAvatar, { backgroundColor: '#00FF94' }]}>
                <Text style={styles.memberAvatarText}>{member.avatar}</Text>
              </View>
              <View style={[styles.statusDot, { 
                backgroundColor: member.status === 'online' ? '#00FF94' : 
                               member.status === 'away' ? '#FFB800' : '#FFFFFF40' 
              }]} />
            </View>
            
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <View style={styles.memberMeta}>
                <RoleIcon size={12} color={roleColor} />
                <Text style={[styles.memberRole, { color: roleColor }]}>
                  {member.role.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.memberActions}>
              <TouchableOpacity style={styles.memberActionButton}>
                <MessageCircle size={16} color="#00FF94" />
              </TouchableOpacity>
              {group.isOwner && member.role !== 'owner' && (
                <TouchableOpacity 
                  style={styles.memberActionButton}
                  onPress={() => Alert.alert('Remove Member', `Remove ${member.name} from group?`)}
                >
                  <UserMinus size={16} color="#FF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {showMemberDetails === member.id && (
            <View style={styles.memberDetails}>
              <View style={styles.memberDetailRow}>
                <Text style={styles.memberDetailLabel}>Joined:</Text>
                <Text style={styles.memberDetailValue}>
                  {new Date(member.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.memberDetailRow}>
                <Text style={styles.memberDetailLabel}>Last Seen:</Text>
                <Text style={styles.memberDetailValue}>
                  {member.status === 'online' ? 'Now' : new Date(member.lastSeen).toLocaleString()}
                </Text>
              </View>
              <View style={styles.memberDetailRow}>
                <Text style={styles.memberDetailLabel}>Permissions:</Text>
                <View style={styles.permissionsList}>
                  {Object.entries(member.permissions).map(([key, value]) => (
                    <View key={key} style={styles.permissionItem}>
                      {value ? (
                        <CheckCircle size={12} color="#00FF94" />
                      ) : (
                        <XCircle size={12} color="#FF4444" />
                      )}
                      <Text style={styles.permissionText}>
                        {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </BlurView>
      </TouchableOpacity>
    );
  };

  const GroupSettings = ({ group }: { group: Group }) => (
    <ScrollView style={styles.settingsContainer}>
      <BlurView intensity={20} style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Group Settings</Text>
        
        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Lock size={16} color="#00FF94" />
              <Text style={styles.settingLabel}>Encryption Level</Text>
            </View>
            <Text style={[styles.settingValue, { color: getEncryptionColor(group.settings.encryptionLevel) }]}>
              {group.settings.encryptionLevel.toUpperCase()}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <UserPlus size={16} color="#FFFFFF80" />
              <Text style={styles.settingLabel}>Allow Member Invites</Text>
            </View>
            <Text style={styles.settingValue}>
              {group.settings.allowInvites ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Clock size={16} color="#FFFFFF80" />
              <Text style={styles.settingLabel}>Message Retention</Text>
            </View>
            <Text style={styles.settingValue}>
              {group.settings.messageRetention} days
            </Text>
          </View>
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Phone size={16} color="#FFFFFF80" />
              <Text style={styles.settingLabel}>Voice Calls</Text>
            </View>
            <Text style={styles.settingValue}>
              {group.settings.allowVoiceCalls ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Video size={16} color="#FFFFFF80" />
              <Text style={styles.settingLabel}>Video Conference</Text>
            </View>
            <Text style={styles.settingValue}>
              {group.settings.allowVideoConference ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {group.isOwner && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={() => Alert.alert('Delete Group', 'This action cannot be undone.')}
            >
              <Trash2 size={16} color="#FF4444" />
              <Text style={styles.dangerButtonText}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {!selectedGroup ? (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Groups</Text>
            <TouchableOpacity style={styles.createButton} onPress={() => setActiveTab('create')}>
              <Plus size={20} color="#00FF94" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <BlurView intensity={20} style={styles.searchContainer}>
            <Search size={20} color="#FFFFFF60" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search groups..."
              placeholderTextColor="#FFFFFF60"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </BlurView>

          {/* Groups List */}
          <ScrollView style={styles.groupsList} showsVerticalScrollIndicator={false}>
            {sampleGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          {/* Group Detail Header */}
          <View style={styles.detailHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedGroup(null)}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{selectedGroup.name}</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color="#FFFFFF80" />
            </TouchableOpacity>
          </View>

          {/* Group Detail Tabs */}
          <View style={styles.detailTabs}>
            <TouchableOpacity
              style={[styles.detailTab, activeTab === 'groups' && styles.activeDetailTab]}
              onPress={() => setActiveTab('groups')}
            >
              <Text style={[styles.detailTabText, activeTab === 'groups' && styles.activeDetailTabText]}>
                Members ({selectedGroup.memberCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.detailTab, activeTab === 'settings' && styles.activeDetailTab]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.detailTabText, activeTab === 'settings' && styles.activeDetailTabText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'groups' ? (
            <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
              {selectedGroup.members.map(member => (
                <MemberCard key={member.id} member={member} group={selectedGroup} />
              ))}
            </ScrollView>
          ) : (
            <GroupSettings group={selectedGroup} />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  groupsList: {
    flex: 1,
  },
  groupCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  groupCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  encryptionText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginLeft: 4,
  },
  groupActions: {
    alignItems: 'center',
  },
  ownerBadge: {
    marginBottom: 8,
  },
  actionButton: {
    padding: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#00FF94',
  },
  detailTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  detailTabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeDetailTab: {
    borderBottomColor: '#00FF94',
  },
  detailTabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF60',
  },
  activeDetailTabText: {
    color: '#00FF94',
  },
  membersList: {
    flex: 1,
  },
  memberCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  memberCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1A1B23',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberRole: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  memberDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  memberDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberDetailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  memberDetailValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF80',
  },
  permissionsList: {
    flex: 1,
    marginLeft: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginLeft: 4,
  },
  settingsContainer: {
    flex: 1,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF80',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginLeft: 8,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  dangerZone: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 68, 68, 0.2)',
  },
  dangerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginBottom: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  dangerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginLeft: 8,
  },
});