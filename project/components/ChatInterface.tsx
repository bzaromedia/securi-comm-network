/**
 * SecuriComm Chat Interface Component
 * 
 * Displays the chat interface with messages, input, and security indicators.
 * Handles message sending, encryption, and real-time updates.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConversation } from '@/contexts/ConversationContext';
import { useSecurity } from '@/contexts/SecurityContext';
import { useAuth } from '@/contexts/AuthContext';
import EncryptionIndicator from './EncryptionIndicator';
import ThreatMeter from './ThreatMeter';

// Props interface
export interface ChatInterfaceProps {
  conversationId?: string;
}

// Chat interface component
const ChatInterface = ({ conversationId }: ChatInterfaceProps) => {
  // Contexts
  const {
    activeConversation,
    messages,
    typingUsers,
    isLoading,
    error,
    loadMessages,
    sendMessage,
    setActiveConversation,
    sendTypingIndicator,
  } = useConversation();
  
  const { securityLevel, threatLevel } = useSecurity();
  const { user } = useAuth();
  
  // State
  const [messageText, setMessageText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load conversation and messages
  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
    
    return () => {
      // Clear typing indicator on unmount
      if (activeConversation) {
        sendTypingIndicator(activeConversation._id, false);
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId]);
  
  // Load conversation
  const loadConversation = async () => {
    if (!conversationId) return;
    
    // Find conversation in context
    const conversation = activeConversation?._id === conversationId
      ? activeConversation
      : undefined;
    
    if (conversation) {
      // Set active conversation
      setActiveConversation(conversation);
      
      // Load messages
      await loadMessages(conversationId);
    }
  };
  
  // Load more messages
  const handleLoadMore = async () => {
    if (!activeConversation || loadingMore || isLoading) return;
    
    try {
      setLoadingMore(true);
      
      // Get oldest message
      const conversationMessages = messages[activeConversation._id] || [];
      
      if (conversationMessages.length === 0) {
        setLoadingMore(false);
        return;
      }
      
      const oldestMessage = conversationMessages[conversationMessages.length - 1];
      
      // Load messages before oldest message
      await loadMessages(activeConversation._id, 20, oldestMessage._id);
      
      setLoadingMore(false);
    } catch (error) {
      console.error('Load more messages error:', error);
      setLoadingMore(false);
    }
  };
  
  // Handle message input change
  const handleMessageChange = (text: string) => {
    setMessageText(text);
    
    // Handle typing indicator
    if (activeConversation) {
      // Set typing state
      if (!isTyping && text.length > 0) {
        setIsTyping(true);
        sendTypingIndicator(activeConversation._id, true);
      } else if (isTyping && text.length === 0) {
        setIsTyping(false);
        sendTypingIndicator(activeConversation._id, false);
      }
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to clear typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          sendTypingIndicator(activeConversation._id, false);
        }
      }, 3000);
    }
  };
  
  // Handle message send
  const handleSendMessage = async () => {
    if (!activeConversation || !messageText.trim()) return;
    
    try {
      // Clear typing indicator
      setIsTyping(false);
      sendTypingIndicator(activeConversation._id, false);
      
      // Send message
      const trimmedMessage = messageText.trim();
      setMessageText('');
      await sendMessage(activeConversation._id, trimmedMessage);
      
      // Scroll to bottom
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };
  
  // Render message item
  const renderMessageItem = ({ item }: { item: any }) => {
    const isCurrentUser = item.sender._id === user?.userID;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        {!isCurrentUser && (
          <Text style={styles.senderName}>{item.sender.displayName}</Text>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.content}</Text>
        </View>
        
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          
          {isCurrentUser && (
            <View style={styles.messageStatus}>
              {item.status === 'sent' && (
                <Ionicons name="checkmark" size={14} color="#8E8E93" />
              )}
              {item.status === 'delivered' && (
                <Ionicons name="checkmark-done" size={14} color="#8E8E93" />
              )}
              {item.status === 'read' && (
                <Ionicons name="checkmark-done" size={14} color="#34C759" />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };
  
  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!activeConversation) return null;
    
    const typingUsersList = typingUsers[activeConversation._id] || [];
    
    if (typingUsersList.length === 0) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>
            {typingUsersList.join(', ')} {typingUsersList.length === 1 ? 'is' : 'are'} typing...
          </Text>
        </View>
      </View>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadConversation}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (!activeConversation) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Select a conversation to start chatting</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
      </View>
    );
  };
  
  // Get conversation messages
  const getConversationMessages = () => {
    if (!activeConversation) return [];
    
    return messages[activeConversation._id] || [];
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.securityContainer}>
        <EncryptionIndicator
          encryptionLevel={securityLevel}
          isActive={true}
          lastEncrypted={
            getConversationMessages()[0]?.createdAt
          }
        />
        
        <ThreatMeter
          threatLevel={threatLevel}
          securityLevel={securityLevel}
        />
      </View>
      
      <FlatList
        ref={flatListRef}
        style={styles.messagesList}
        data={getConversationMessages()}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item._id}
        inverted
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.loadingMore} /> : null}
        ListEmptyComponent={renderEmptyState()}
      />
      
      {renderTypingIndicator()}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={handleMessageChange}
          multiline
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() ? styles.sendButtonDisabled : {},
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={!messageText.trim() ? '#8E8E93' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  securityContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  messagesList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageContainer: {
    marginHorizontal: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 2,
    marginLeft: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
  },
  otherUserBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginHorizontal: 12,
  },
  messageTime: {
    fontSize: 10,
    color: '#8E8E93',
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  typingBubble: {
    backgroundColor: '#E5E5EA',
    padding: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  loadingMore: {
    padding: 16,
  },
});

export default ChatInterface;
