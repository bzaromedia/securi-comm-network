import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  encryptedContent: {
    data: {
      type: String,
      required: true
    },
    nonce: {
      type: String,
      required: true
    },
    algorithm: {
      type: String,
      default: 'XChaCha20-Poly1305'
    }
  },
  attachments: [{
    encryptedData: {
      type: String
    },
    nonce: {
      type: String
    },
    mimeType: {
      type: String
    },
    filename: {
      type: String
    },
    size: {
      type: Number
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  securityMetadata: {
    integrityHash: {
      type: String
    },
    signatureValid: {
      type: Boolean,
      default: true
    },
    securityLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'high'
    }
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  expiresAt: {
    type: Date
  },
  isEphemeral: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Method to mark message as read by a user
messageSchema.methods.markAsReadBy = function(userId) {
  if (!this.readBy.some(read => read.user.toString() === userId.toString())) {
    this.readBy.push({
      user: userId,
      timestamp: Date.now()
    });
    this.status = 'read';
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if message is read by a specific user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
