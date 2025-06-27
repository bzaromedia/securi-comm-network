import { User, Message, Conversation } from '../models/index.js';
import jwt from 'jsonwebtoken';

// Map to store userId to socket.id for direct messaging
const userSocketMap = new Map();

/**
 * Authenticate Socket.IO connection
 */
export const authenticateConnection = async (token) => {
  try {
    if (!token) {
      return { authenticated: false, error: 'No token provided' };
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return { authenticated: false, error: 'User not found' };
    }

    return { authenticated: true, user };
  } catch (error) {
    console.error('Socket.IO authentication error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
};

/**
 * Handle new Socket.IO connection
 */
export const handleConnection = (socket, userId) => {
  // Store connection: a user can have multiple active sockets (e.g., from different devices)
  // We use socket.id to manage individual connections
  userSocketMap.set(socket.id, userId);
  socket.join(userId); // Join a room named after the userId for easy broadcasting

  // Send connection confirmation
  socket.emit('connection', {
    status: 'connected',
    timestamp: Date.now()
  });

  // Update user's online status
  updateUserStatus(userId, true);

  // Handle disconnection
  socket.on('disconnect', () => {
    userSocketMap.delete(socket.id);
    // Check if the user has any other active connections
    const hasOtherConnections = Array.from(userSocketMap.values()).includes(userId);
    if (!hasOtherConnections) {
      updateUserStatus(userId, false);
    }
  });
};

/**
 * Update user's online status
 */
const updateUserStatus = async (userId, isOnline) => {
  try {
    // Update user's last active timestamp
    await User.findByIdAndUpdate(userId, {
      lastActive: Date.now()
    });

    // Broadcast status change to relevant users
    broadcastUserStatus(userId, isOnline);
  } catch (error) {
    console.error('Update user status error:', error);
  }
};

/**
 * Broadcast user status change to relevant users
 */
const broadcastUserStatus = async (userId, isOnline) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    });

    // Get all participants from these conversations
    const participantIds = new Set();

    conversations.forEach(conversation => {
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== userId.toString()) {
          participantIds.add(participantId.toString());
        }
      });
    });

    // Broadcast status change to all participants
    const statusMessage = {
      type: 'user_status',
      userId,
      status: isOnline ? 'online' : 'offline',
      timestamp: Date.now()
    };

    participantIds.forEach(participantId => {
      // Use io.to(roomName).emit() to send to all sockets in a user's room
      io.to(participantId.toString()).emit('user_status', statusMessage);
    });
  } catch (error) {
    console.error('Broadcast user status error:', error);
  }
};

/**
 * Handle incoming message
 */
export const handleMessage = async (io, socket, userId, data) => {
  try {
    const { type, payload } = data;

    switch (type) {
      case 'ping':
        // Respond to ping
        socket.emit('pong', {
          timestamp: Date.now()
        });
        break;

      case 'message':
        // Handle new message
        await handleNewMessage(io, socket, userId, payload);
        break;

      case 'typing':
        // Handle typing indicator
        await handleTypingIndicator(io, userId, payload);
        break;

      case 'read':
        // Handle read receipt
        await handleReadReceipt(io, userId, payload);
        break;

      default:
        // Unknown message type
        socket.emit('error', {
          type: 'unknown_message_type',
          error: 'Unknown message type',
          timestamp: Date.now()
        });
    }
  } catch (error) {
    console.error('Handle message error:', error);
    socket.emit('error', {
      type: 'message_processing_error',
      error: 'Failed to process message',
      timestamp: Date.now()
    });
  }
};

/**
 * Handle new message
 */
const handleNewMessage = async (io, socket, userId, payload) => {
  try {
    const { conversationId, encryptedContent, attachments } = payload;

    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return socket.emit('error', {
        type: 'conversation_not_found',
        error: 'Conversation not found',
        timestamp: Date.now()
      });
    }

    if (!conversation.participants.includes(userId)) {
      return socket.emit('error', {
        type: 'unauthorized',
        error: 'Not authorized to send messages to this conversation',
        timestamp: Date.now()
      });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      encryptedContent,
      attachments: attachments || [],
      readBy: [{ user: userId }], // Sender has read the message
      securityMetadata: {
        integrityHash: payload.integrityHash,
        securityLevel: conversation.securityLevel
      }
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    await conversation.save();

    // Populate sender info
    await message.populate('sender', 'email');

    // Send confirmation to sender
    socket.emit('message_sent', {
      messageId: message._id,
      timestamp: Date.now()
    });

    // Broadcast message to other participants
    const messageData = {
      type: 'new_message',
      message: {
        _id: message._id,
        conversation: message.conversation,
        sender: message.sender,
        encryptedContent: message.encryptedContent,
        attachments: message.attachments,
        securityMetadata: message.securityMetadata,
        createdAt: message.createdAt
      },
      timestamp: Date.now()
    };

    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        io.to(participantId.toString()).emit('new_message', messageData);
      }
    });
  } catch (error) {
    console.error('Handle new message error:', error);
    socket.emit('error', {
      type: 'send_message_failed',
      error: 'Failed to send message',
      timestamp: Date.now()
    });
  }
};

/**
 * Handle typing indicator
 */
const handleTypingIndicator = async (io, userId, payload) => {
  try {
    const { conversationId, isTyping } = payload;

    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.participants.includes(userId)) {
      return;
    }

    // Broadcast typing indicator to other participants
    const typingData = {
      type: 'typing',
      conversationId,
      userId,
      isTyping,
      timestamp: Date.now()
    };

    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        io.to(participantId.toString()).emit('typing', typingData);
      }
    });
  } catch (error) {
    console.error('Handle typing indicator error:', error);
  }
};

/**
 * Handle read receipt
 */
const handleReadReceipt = async (io, userId, payload) => {
  try {
    const { messageId } = payload;

    // Find message
    const message = await Message.findById(messageId);

    if (!message) {
      return;
    }

    // Check if user is part of the conversation
    const conversation = await Conversation.findById(message.conversation);

    if (!conversation || !conversation.participants.includes(userId)) {
      return;
    }

    // Mark as read
    await message.markAsReadBy(userId);

    // Broadcast read receipt to other participants
    const readData = {
      type: 'read_receipt',
      messageId,
      userId,
      conversationId: message.conversation,
      timestamp: Date.now()
    };

    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        io.to(participantId.toString()).emit('read_receipt', readData);
      }
    });
  } catch (error) {
    console.error('Handle read receipt error:', error);
  }
};

/**
 * Send message to specific user (all their connected sockets)
 */
export const sendToUser = (io, userId, event, data) => {
  io.to(userId).emit(event, data);
};

/**
 * Broadcast message to all connected users (all sockets)
 */
export const broadcastToAll = (io, event, data) => {
  io.emit(event, data);
};

/**
 * Get active users count (approximate based on connected sockets)
 */
export const getActiveUsersCount = (io) => {
  return io.engine.clientsCount;
};

