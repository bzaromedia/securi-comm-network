import express from 'express';
import { authenticate, authorize, securityCheck } from '../middleware/auth.js';
import { Conversation, User } from '../models/index.js';

const router = express.Router();

// Get all conversations for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .sort({ 'metadata.isPinned': -1, updatedAt: -1 })
      .populate('participants', 'email')
      .populate('lastMessage')
      .populate('admins', 'email');
    
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get a specific conversation
router.get('/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Find conversation
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'email')
      .populate('lastMessage')
      .populate('admins', 'email');
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Create a new direct conversation
router.post('/direct', authenticate, securityCheck, async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    
    // Find recipient
    const recipient = await User.findOne({ email: recipientEmail });
    
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findOrCreateDirectConversation(
      req.user._id,
      recipient._id
    );
    
    // Populate participants
    await existingConversation.populate('participants', 'email');
    
    res.status(201).json({
      success: true,
      conversation: existingConversation,
      isNew: existingConversation.createdAt === existingConversation.updatedAt
    });
  } catch (error) {
    console.error('Create direct conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Create a new group conversation
router.post('/group', authenticate, securityCheck, async (req, res) => {
  try {
    const { name, participantEmails, groupKey } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    
    if (!participantEmails || !Array.isArray(participantEmails) || participantEmails.length === 0) {
      return res.status(400).json({ error: 'At least one participant is required' });
    }
    
    // Find participants
    const participants = await User.find({ email: { $in: participantEmails } });
    
    if (participants.length === 0) {
      return res.status(404).json({ error: 'No valid participants found' });
    }
    
    // Add current user as participant and admin
    const participantIds = participants.map(p => p._id);
    
    if (!participantIds.includes(req.user._id)) {
      participantIds.push(req.user._id);
    }
    
    // Create new group conversation
    const conversation = new Conversation({
      participants: participantIds,
      type: 'group',
      name,
      admins: [req.user._id],
      encryptionKeys: {
        groupKey
      },
      metadata: {
        icon: req.body.icon,
        color: req.body.color,
        description: req.body.description
      },
      settings: {
        messageRetention: req.body.messageRetention || 0,
        isEncryptionEnabled: true,
        isScreenshotAllowed: req.body.isScreenshotAllowed || false,
        isForwardingAllowed: req.body.isForwardingAllowed || true
      }
    });
    
    await conversation.save();
    
    // Populate participants and admins
    await conversation.populate('participants', 'email');
    await conversation.populate('admins', 'email');
    
    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Create group conversation error:', error);
    res.status(500).json({ error: 'Failed to create group conversation' });
  }
});

// Update a conversation
router.patch('/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name, icon, color, description, isArchived, isPinned } = req.body;
    
    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to update this conversation' });
    }
    
    // For group conversations, check if user is an admin for certain updates
    if (conversation.type === 'group' && (name || icon || color || description)) {
      const isAdmin = conversation.admins.some(admin => admin.toString() === req.user._id.toString());
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can update group details' });
      }
      
      // Update group details
      if (name) conversation.name = name;
      if (icon) conversation.metadata.icon = icon;
      if (color) conversation.metadata.color = color;
      if (description) conversation.metadata.description = description;
    }
    
    // User-specific updates
    if (isArchived !== undefined) conversation.metadata.isArchived = isArchived;
    if (isPinned !== undefined) conversation.metadata.isPinned = isPinned;
    
    await conversation.save();
    
    // Populate participants and admins
    await conversation.populate('participants', 'email');
    await conversation.populate('admins', 'email');
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Add participant to group conversation
router.post('/:conversationId/participants', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { email } = req.body;
    
    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if it's a group conversation
    if (conversation.type !== 'group') {
      return res.status(400).json({ error: 'Cannot add participants to direct conversations' });
    }
    
    // Check if user is an admin
    const isAdmin = conversation.admins.some(admin => admin.toString() === req.user._id.toString());
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can add participants' });
    }
    
    // Find user to add
    const userToAdd = await User.findOne({ email });
    
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is already a participant
    if (conversation.participants.includes(userToAdd._id)) {
      return res.status(400).json({ error: 'User is already a participant' });
    }
    
    // Add participant
    await conversation.addParticipant(userToAdd._id);
    
    // Populate participants and admins
    await conversation.populate('participants', 'email');
    await conversation.populate('admins', 'email');
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ error: 'Failed to add participant' });
  }
});

// Remove participant from group conversation
router.delete('/:conversationId/participants/:userId', authenticate, async (req, res) => {
  try {
    const { conversationId, userId } = req.params;
    
    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if it's a group conversation
    if (conversation.type !== 'group') {
      return res.status(400).json({ error: 'Cannot remove participants from direct conversations' });
    }
    
    // Check if user is an admin or removing themselves
    const isAdmin = conversation.admins.some(admin => admin.toString() === req.user._id.toString());
    const isSelfRemoval = userId === req.user._id.toString();
    
    if (!isAdmin && !isSelfRemoval) {
      return res.status(403).json({ error: 'Not authorized to remove participants' });
    }
    
    // Remove participant
    await conversation.removeParticipant(userId);
    
    // If admin is removed, update admins list
    if (conversation.admins.includes(userId)) {
      conversation.admins = conversation.admins.filter(admin => admin.toString() !== userId);
      
      // If no admins left, make the first participant an admin
      if (conversation.admins.length === 0 && conversation.participants.length > 0) {
        conversation.admins.push(conversation.participants[0]);
      }
      
      await conversation.save();
    }
    
    // Populate participants and admins
    await conversation.populate('participants', 'email');
    await conversation.populate('admins', 'email');
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

export default router;
