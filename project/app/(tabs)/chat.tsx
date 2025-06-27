import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MessageCircle,
  Search,
  Plus,
  Shield,
  Lock,
  Eye,
  Clock,
  Check,
  CheckCheck,
} from 'lucide-react-native';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  isEncrypted: boolean;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isEncrypted: boolean;
  avatar: string;
  messages: ChatMessage[];
}

export default function ChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const chats: Chat[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      lastMessage: 'The encryption keys are working perfectly!',
      timestamp: '2m ago',
      unreadCount: 2,
      isOnline: true,
      isEncrypted: true,
      avatar: 'SC',
      messages: [
        {
          id: '1',
          content: 'Hey, how is the new security system working?',
          timestamp: '10:30 AM',
          isOwn: false,
          isRead: true,
          isEncrypted: true,
        },
        {
          id: '2',
          content: 'It\'s incredible! The E2E encryption is seamless.',
          timestamp: '10:32 AM',
          isOwn: true,
          isRead: true,
          isEncrypted: true,
        },
        {
          id: '3',
          content: 'The encryption keys are working perfectly!',
          timestamp: '10:35 AM',
          isOwn: false,
          isRead: false,
          isEncrypted: true,
        },
      ],
    },
    {
      id: '2',
      name: 'Mark Johnson',
      lastMessage: 'Can we schedule a secure video call?',
      timestamp: '1h ago',
      unreadCount: 0,
      isOnline: false,
      isEncrypted: true,
      avatar: 'MJ',
      messages: [
        {
          id: '1',
          content: 'Can we schedule a secure video call?',
          timestamp: '9:15 AM',
          isOwn: false,
          isRead: true,
          isEncrypted: true,
        },
      ],
    },
    {
      id: '3',
      name: 'Emma Davis',
      lastMessage: 'Thanks for the security update!',
      timestamp: '3h ago',
      unreadCount: 0,
      isOnline: true,
      isEncrypted: true,
      avatar: 'ED',
      messages: [
        {
          id: '1',
          content: 'Thanks for the security update!',
          timestamp: '7:45 AM',
          isOwn: false,
          isRead: true,
          isEncrypted: true,
        },
      ],
    },
  ];

  const ChatListItem = ({ chat }: { chat: Chat }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => setSelectedChat(chat.id)}
    >
      <BlurView intensity={20} style={styles.chatItemBlur}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: '#00FF94' }]}>
            <Text style={styles.avatarText}>{chat.avatar}</Text>
          </View>
          {chat.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatDetails}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{chat.name}</Text>
            <View style={styles.chatMeta}>
              {chat.isEncrypted && (
                <Shield size={12} color="#00FF94" style={styles.encryptionIcon} />
              )}
              <Text style={styles.chatTime}>{chat.timestamp}</Text>
            </View>
          </View>
          
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chat.lastMessage}
            </Text>
            {chat.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const MessageBubble = ({ message }: { message: ChatMessage }) => (
    <View style={[
      styles.messageBubble,
      message.isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={[
        styles.messageText,
        { color: message.isOwn ? '#000000' : '#FFFFFF' }
      ]}>
        {message.content}
      </Text>
      <View style={styles.messageFooter}>
        <Text style={[
          styles.messageTime,
          { color: message.isOwn ? '#00000080' : '#FFFFFF80' }
        ]}>
          {message.timestamp}
        </Text>
        {message.isEncrypted && (
          <Lock size={10} color={message.isOwn ? '#00000060' : '#FFFFFF60'} />
        )}
        {message.isOwn && (
          message.isRead ? (
            <CheckCheck size={12} color="#00FF94" />
          ) : (
            <Check size={12} color="#00000080" />
          )
        )}
      </View>
    </View>
  );

  const renderChatView = () => {
    const chat = chats.find(c => c.id === selectedChat);
    if (!chat) return null;

    return (
      <View style={styles.chatView}>
        {/* Chat Header */}
        <BlurView intensity={20} style={styles.chatViewHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedChat(null)}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.chatViewHeaderInfo}>
            <Text style={styles.chatViewName}>{chat.name}</Text>
            <View style={styles.chatViewStatus}>
              <View style={[
                styles.statusDot,
                { backgroundColor: chat.isOnline ? '#00FF94' : '#FFFFFF40' }
              ]} />
              <Text style={styles.statusText}>
                {chat.isOnline ? 'Online' : 'Last seen 2h ago'}
              </Text>
              <Shield size={12} color="#00FF94" style={styles.headerShield} />
            </View>
          </View>
        </BlurView>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer}>
          {chat.messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        {/* Message Input */}
        <BlurView intensity={20} style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a secure message..."
            placeholderTextColor="#FFFFFF60"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    );
  };

  if (selectedChat) {
    return (
      <LinearGradient colors={['#0A0B0F', '#1A1B23']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {renderChatView()}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0B0F', '#1A1B23']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <TouchableOpacity style={styles.newChatButton}>
            <Plus size={24} color="#00FF94" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <BlurView intensity={20} style={styles.searchContainer}>
          <Search size={20} color="#FFFFFF60" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="#FFFFFF60"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </BlurView>

        {/* Security Banner */}
        <BlurView intensity={20} style={styles.securityBanner}>
          <Lock size={16} color="#00FF94" />
          <Text style={styles.securityText}>
            All messages are end-to-end encrypted
          </Text>
          <Eye size={16} color="#00FF94" />
        </BlurView>

        {/* Chat List */}
        <ScrollView 
          style={styles.chatsList}
          showsVerticalScrollIndicator={false}
        >
          {chats.map(chat => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
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
  newChatButton: {
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
    marginBottom: 16,
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
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 148, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.2)',
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    marginHorizontal: 12,
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chatItemBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  chatDetails: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptionIcon: {
    marginRight: 6,
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
  },
  unreadBadge: {
    backgroundColor: '#00FF94',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  // Chat View Styles
  chatView: {
    flex: 1,
  },
  chatViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#00FF94',
  },
  chatViewHeaderInfo: {
    flex: 1,
  },
  chatViewName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  chatViewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF80',
    flex: 1,
  },
  headerShield: {
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 16,
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00FF94',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#00FF94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
});