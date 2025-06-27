/**
 * SecuriComm Conversation Context
 * 
 * Provides conversation state and methods for the entire application.
 * Manages conversations, messages, and real-time updates.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuth } from './AuthContext';
import { useWebSocket } from '@/utils/websocket';
import { encryptMessage, decryptMessage } from '@/utils/encryption';

// Conversation interface
export interface Conversation {
  _id: string;
  name: string;
  type: 'direct' | 'group';
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  encryptionKey?: string;
}

// Participant interface
export interface Participant {
  _id: string;
  email: string;
  displayName: string;
  avatar?: string;
  isActive: boolean;
  lastActive?: string;
}

// Message interface
export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  attachments?: Attachment[];
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
  isEncrypted: boolean;
}

// Attachment interface
export interface Attachment {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

// Conversation context interface
interface ConversationContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  loadMessages: (
    conversationId: string,
    limit?: number,
    before?: string
  ) => Promise<void>;
  sendMessage: (
    conversationId: string,
    content: string,
    attachments?: any[]
  ) => Promise<void>;
  createDirectConversation: (recipientEmail: string) => Promise<Conversation | null>;
  createGroupConversation: (
    name: string,
    participantEmails: string[]
  ) => Promise<Conversation | null>;
  setActiveConversation: (conversation: Conversation | null) => void;
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
}

// Create context
const ConversationContext = createContext<ConversationContextType>({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  isLoading: false,
  error: null,
  loadConversations: async () => {},
  loadMessages: async () => {},
  sendMessage: async () => {},
  createDirectConversation: async () => null,
  createGroupConversation: async () => null,
  setActiveConversation: () => {},
  markAsRead: async () => {},
  deleteMessage: async () => {},
  deleteConversation: async () => {},
  sendTypingIndicator: () => {},
});

// Conversation provider component
export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { socket, isConnected, sendEvent } = useWebSocket();
  
  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize conversations
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);
  
  // Handle socket events
  useEffect(() => {
    if (isConnected && socket) {
      // New message event
      socket.on('new_message', handleNewMessage);
      
      // Message status update event
      socket.on('message_status', handleMessageStatus);
      
      // Typing indicator event
      socket.on('typing_indicator', handleTypingIndicator);
      
      // New conversation event
      socket.on('new_conversation', handleNewConversation);
      
      // Conversation update event
      socket.on('conversation_update', handleConversationUpdate);
      
      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('message_status', handleMessageStatus);
        socket.off('typing_indicator', handleTypingIndicator);
        socket.off('new_conversation', handleNewConversation);
        socket.off('conversation_update', handleConversationUpdate);
      };
    }
  }, [isConnected, socket, messages, conversations]);
  
  // Load conversations
  const loadConversations = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get conversations from API
      const response = await api.conversations.getAll();
      
      if (!response.success) {
        setError(response.message || 'Failed to load conversations');
        setIsLoading(false);
        return;
      }
      
      // Update conversations
      setConversations(response.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Load conversations error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to load conversations'
      );
      setIsLoading(false);
    }
  };
  
  // Load messages
  const loadMessages = async (
    conversationId: string,
    limit: number = 20,
    before?: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get messages from API
      const response = await api.messages.getByConversation(
        conversationId,
        limit,
        before
      );
      
      if (!response.success) {
        setError(response.message || 'Failed to load messages');
        setIsLoading(false);
        return;
      }
      
      // Get conversation for encryption key
      const conversation = conversations.find((c) => c._id === conversationId);
      
      if (!conversation) {
        setError('Conversation not found');
        setIsLoading(false);
        return;
      }
      
      // Decrypt messages if needed
      const decryptedMessages = await Promise.all(
        (response.data || []).map(async (message: Message) => {
          if (message.isEncrypted && conversation.encryptionKey) {
            try {
              const decryptedContent = await decryptMessage(
                message.content,
                conversation.encryptionKey
              );
              
              return {
                ...message,
                content: decryptedContent,
              };
            } catch (error) {
              console.error('Decrypt message error:', error);
              return message;
            }
          }
          
          return message;
        })
      );
      
      // Update messages
      setMessages((prevMessages) => {
        const existingMessages = prevMessages[conversationId] || [];
        
        // Merge messages and remove duplicates
        const mergedMessages = [...existingMessages];
        
        decryptedMessages.forEach((message) => {
          const existingIndex = mergedMessages.findIndex(
            (m) => m._id === message._id
          );
          
          if (existingIndex >= 0) {
            mergedMessages[existingIndex] = message;
          } else {
            mergedMessages.push(message);
          }
        });
        
        // Sort messages by date
        mergedMessages.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        return {
          ...prevMessages,
          [conversationId]: mergedMessages,
        };
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Load messages error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to load messages'
      );
      setIsLoading(false);
    }
  };
  
  // Send message
  const sendMessage = async (
    conversationId: string,
    content: string,
    attachments: any[] = []
  ): Promise<void> => {
    try {
      // Get conversation for encryption key
      const conversation = conversations.find((c) => c._id === conversationId);
      
      if (!conversation) {
        setError('Conversation not found');
        return;
      }
      
      // Encrypt message if needed
      let messageContent = content;
      let isEncrypted = false;
      
      if (conversation.encryptionKey) {
        try {
          messageContent = await encryptMessage(content, conversation.encryptionKey);
          isEncrypted = true;
        } catch (error) {
          console.error('Encrypt message error:', error);
        }
      }
      
      // Create optimistic message
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        conversationId,
        sender: {
          _id: user?.userID || '',
          displayName: user?.displayName || '',
          avatar: user?.avatar,
        },
        content,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEncrypted,
      };
      
      // Add optimistic message to state
      setMessages((prevMessages) => {
        const existingMessages = prevMessages[conversationId] || [];
        
        return {
          ...prevMessages,
          [conversationId]: [optimisticMessage, ...existingMessages],
        };
      });
      
      // Send message to API
      const response = await api.messages.send(
        conversationId,
        messageContent,
        attachments
      );
      
      if (!response.success) {
        // Handle error
        setError(response.message || 'Failed to send message');
        
        // Remove optimistic message
        setMessages((prevMessages) => {
          const existingMessages = prevMessages[conversationId] || [];
          
          return {
            ...prevMessages,
            [conversationId]: existingMessages.filter(
              (m) => m._id !== optimisticMessage._id
            ),
          };
        });
        
        return;
      }
      
      // Update message with real ID
      setMessages((prevMessages) => {
        const existingMessages = prevMessages[conversationId] || [];
        
        return {
          ...prevMessages,
          [conversationId]: existingMessages.map((m) =>
            m._id === optimisticMessage._id ? { ...response.data, content } : m
          ),
        };
      });
      
      // Update conversation last message
      setConversations((prevConversations) =>
        prevConversations.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: {
                  ...response.data,
                  content,
                },
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (error) {
      console.error('Send message error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };
  
  // Create direct conversation
  const createDirectConversation = async (
    recipientEmail: string
  ): Promise<Conversation | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create conversation with API
      const response = await api.conversations.createDirect(recipientEmail);
      
      if (!response.success) {
        setError(response.message || 'Failed to create conversation');
        setIsLoading(false);
        return null;
      }
      
      // Add conversation to state
      const newConversation = response.data;
      
      setConversations((prevConversations) => [
        newConversation,
        ...prevConversations,
      ]);
      
      setIsLoading(false);
      return newConversation;
    } catch (error) {
      console.error('Create direct conversation error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to create conversation'
      );
      setIsLoading(false);
      return null;
    }
  };
  
  // Create group conversation
  const createGroupConversation = async (
    name: string,
    participantEmails: string[]
  ): Promise<Conversation | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate encryption key
      const encryptionKey = Math.random().toString(36).substring(2, 15);
      
      // Create conversation with API
      const response = await api.conversations.createGroup(
        name,
        participantEmails,
        encryptionKey
      );
      
      if (!response.success) {
        setError(response.message || 'Failed to create group');
        setIsLoading(false);
        return null;
      }
      
      // Add conversation to state
      const newConversation = response.data;
      
      setConversations((prevConversations) => [
        newConversation,
        ...prevConversations,
      ]);
      
      setIsLoading(false);
      return newConversation;
    } catch (error) {
      console.error('Create group conversation error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to create group'
      );
      setIsLoading(false);
      return null;
    }
  };
  
  // Mark message as read
  const markAsRead = async (messageId: string): Promise<void> => {
    try {
      // Send read status to API
      await api.messages.markAsRead(messageId);
      
      // Update message status in state
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        
        // Find message in all conversations
        Object.keys(updatedMessages).forEach((conversationId) => {
          updatedMessages[conversationId] = updatedMessages[conversationId].map(
            (message) =>
              message._id === messageId
                ? { ...message, status: 'read' }
                : message
          );
        });
        
        return updatedMessages;
      });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };
  
  // Delete message
  const deleteMessage = async (messageId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete message from API
      const response = await api.messages.delete(messageId);
      
      if (!response.success) {
        setError(response.message || 'Failed to delete message');
        setIsLoading(false);
        return;
      }
      
      // Remove message from state
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        
        // Find message in all conversations
        Object.keys(updatedMessages).forEach((conversationId) => {
          updatedMessages[conversationId] = updatedMessages[conversationId].filter(
            (message) => message._id !== messageId
          );
        });
        
        return updatedMessages;
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Delete message error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to delete message'
      );
      setIsLoading(false);
    }
  };
  
  // Delete conversation
  const deleteConversation = async (conversationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete conversation from API
      const response = await api.conversations.delete(conversationId);
      
      if (!response.success) {
        setError(response.message || 'Failed to delete conversation');
        setIsLoading(false);
        return;
      }
      
      // Remove conversation from state
      setConversations((prevConversations) =>
        prevConversations.filter((c) => c._id !== conversationId)
      );
      
      // Remove messages from state
      setMessages((prevMessages) => {
        const { [conversationId]: _, ...rest } = prevMessages;
        return rest;
      });
      
      // Clear active conversation if deleted
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Delete conversation error:', error);
      
      setError(
        error instanceof Error ? error.message : 'Failed to delete conversation'
      );
      setIsLoading(false);
    }
  };
  
  // Send typing indicator
  const sendTypingIndicator = (
    conversationId: string,
    isTyping: boolean
  ): void => {
    if (isConnected && socket) {
      sendEvent('typing_indicator', {
        conversationId,
        isTyping,
      });
    }
  };
  
  // Handle new message
  const handleNewMessage = async (data: any) => {
    try {
      const { message, conversationId } = data;
      
      // Get conversation for encryption key
      const conversation = conversations.find((c) => c._id === conversationId);
      
      if (!conversation) {
        return;
      }
      
      // Decrypt message if needed
      let decryptedMessage = message;
      
      if (message.isEncrypted && conversation.encryptionKey) {
        try {
          const decryptedContent = await decryptMessage(
            message.content,
            conversation.encryptionKey
          );
          
          decryptedMessage = {
            ...message,
            content: decryptedContent,
          };
        } catch (error) {
          console.error('Decrypt message error:', error);
        }
      }
      
      // Add message to state
      setMessages((prevMessages) => {
        const existingMessages = prevMessages[conversationId] || [];
        
        // Check if message already exists
        const messageExists = existingMessages.some(
          (m) => m._id === decryptedMessage._id
        );
        
        if (messageExists) {
          return prevMessages;
        }
        
        return {
          ...prevMessages,
          [conversationId]: [decryptedMessage, ...existingMessages],
        };
      });
      
      // Update conversation last message
      setConversations((prevConversations) =>
        prevConversations.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: decryptedMessage,
                updatedAt: new Date().toISOString(),
                unreadCount:
                  decryptedMessage.sender._id !== user?.userID
                    ? c.unreadCount + 1
                    : c.unreadCount,
              }
            : c
        )
      );
      
      // Mark message as delivered if from another user
      if (
        decryptedMessage.sender._id !== user?.userID &&
        decryptedMessage.status !== 'read'
      ) {
        await markAsRead(decryptedMessage._id);
      }
    } catch (error) {
      console.error('Handle new message error:', error);
    }
  };
  
  // Handle message status update
  const handleMessageStatus = (data: any) => {
    try {
      const { messageId, status, conversationId } = data;
      
      // Update message status in state
      setMessages((prevMessages) => {
        const conversationMessages = prevMessages[conversationId] || [];
        
        return {
          ...prevMessages,
          [conversationId]: conversationMessages.map((message) =>
            message._id === messageId ? { ...message, status } : message
          ),
        };
      });
    } catch (error) {
      console.error('Handle message status error:', error);
    }
  };
  
  // Handle typing indicator
  const handleTypingIndicator = (data: any) => {
    try {
      const { conversationId, user: typingUser, isTyping } = data;
      
      // Update typing users
      setTypingUsers((prevTypingUsers) => {
        const conversationTypingUsers = prevTypingUsers[conversationId] || [];
        
        if (isTyping) {
          // Add user to typing list if not already there
          if (!conversationTypingUsers.includes(typingUser.displayName)) {
            return {
              ...prevTypingUsers,
              [conversationId]: [...conversationTypingUsers, typingUser.displayName],
            };
          }
        } else {
          // Remove user from typing list
          return {
            ...prevTypingUsers,
            [conversationId]: conversationTypingUsers.filter(
              (name) => name !== typingUser.displayName
            ),
          };
        }
        
        return prevTypingUsers;
      });
    } catch (error) {
      console.error('Handle typing indicator error:', error);
    }
  };
  
  // Handle new conversation
  const handleNewConversation = (data: any) => {
    try {
      const { conversation } = data;
      
      // Add conversation to state if not already there
      setConversations((prevConversations) => {
        const conversationExists = prevConversations.some(
          (c) => c._id === conversation._id
        );
        
        if (conversationExists) {
          return prevConversations;
        }
        
        return [conversation, ...prevConversations];
      });
    } catch (error) {
      console.error('Handle new conversation error:', error);
    }
  };
  
  // Handle conversation update
  const handleConversationUpdate = (data: any) => {
    try {
      const { conversation } = data;
      
      // Update conversation in state
      setConversations((prevConversations) =>
        prevConversations.map((c) =>
          c._id === conversation._id ? { ...c, ...conversation } : c
        )
      );
      
      // Update active conversation if needed
      if (activeConversation?._id === conversation._id) {
        setActiveConversation((prev) =>
          prev ? { ...prev, ...conversation } : null
        );
      }
    } catch (error) {
      console.error('Handle conversation update error:', error);
    }
  };
  
  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        typingUsers,
        isLoading,
        error,
        loadConversations,
        loadMessages,
        sendMessage,
        createDirectConversation,
        createGroupConversation,
        setActiveConversation,
        markAsRead,
        deleteMessage,
        deleteConversation,
        sendTypingIndicator,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

// Conversation hook
export const useConversation = () => useContext(ConversationContext);
