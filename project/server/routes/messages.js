import express from 'express';
import { authenticate, authorize, securityCheck } from '../middleware/auth.js';
import { Message, Conversation } from '../models/index.js';

const router = express.Router();

// Get all messages for a conversation
router.get('/conversation/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }
    
    // Build query
    const query = { conversation: conversationId };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    // Get messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'email');
    
    res.json({
      success: true,
      messages: messages.reverse(),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send a new message
router.post('/', authenticate, securityCheck, async (req, res) => {
  try {
    const { conversationId, encryptedContent, attachments } = req.body;
    
    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to send messages to this conversation' });
    }
    
    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      encryptedContent,
      attachments: attachments || [],
      readBy: [{ user: req.user._id }], // Sender has read the message
      securityMetadata: {
        integrityHash: req.body.integrityHash,
        securityLevel: conversation.securityLevel
      }
    });
    
    await message.save();
    
    // Update conversation's last message
    conversation.lastMessage = message._id;
    await conversation.save();
    
    // Populate sender info
    await message.populate('sender', 'email');
    
    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.patch('/:messageId/read', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Find message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findById(message.conversation);
    
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to access this message' });
    }
    
    // Mark as read
    await message.markAsReadBy(req.user._id);
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Delete message
router.delete('/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Find message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }
    
    // Delete message
    await Message.findByIdAndDelete(messageId);
    
    // Update conversation's last message if needed
    const conversation = await Conversation.findById(message.conversation);
    
    if (conversation.lastMessage && conversation.lastMessage.toString() === messageId) {
      // Find new last message
      const lastMessage = await Message.findOne({ conversation: conversation._id })
        .sort({ createdAt: -1 });
      
      conversation.lastMessage = lastMessage ? lastMessage._id : null;
      await conversation.save();
    }
    
    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
