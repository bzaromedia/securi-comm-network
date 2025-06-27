import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  name: {
    type: String,
    trim: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  encryptionKeys: {
    groupKey: {
      type: String
    },
    keyRotationTimestamp: {
      type: Date,
      default: Date.now
    }
  },
  securityLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'high'
  },
  metadata: {
    icon: {
      type: String
    },
    color: {
      type: String
    },
    description: {
      type: String
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    messageRetention: {
      type: Number, // Days to keep messages
      default: 0 // 0 means forever
    },
    isEncryptionEnabled: {
      type: Boolean,
      default: true
    },
    isScreenshotAllowed: {
      type: Boolean,
      default: false
    },
    isForwardingAllowed: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'metadata.isArchived': 1, 'metadata.isPinned': -1, updatedAt: -1 });

// Method to add a participant to the conversation
conversationSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove a participant from the conversation
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    participant => participant.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update the last message
conversationSchema.methods.updateLastMessage = function(messageId) {
  this.lastMessage = messageId;
  return this.save();
};

// Method to rotate encryption keys
conversationSchema.methods.rotateEncryptionKey = function(newKey) {
  this.encryptionKeys.groupKey = newKey;
  this.encryptionKeys.keyRotationTimestamp = Date.now();
  return this.save();
};

// Static method to find or create a direct conversation between two users
conversationSchema.statics.findOrCreateDirectConversation = async function(user1Id, user2Id) {
  let conversation = await this.findOne({
    type: 'direct',
    participants: { $all: [user1Id, user2Id], $size: 2 }
  });
  
  if (!conversation) {
    conversation = new this({
      participants: [user1Id, user2Id],
      type: 'direct'
    });
    await conversation.save();
  }
  
  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
