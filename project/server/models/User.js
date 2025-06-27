import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  deviceFingerprint: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  securityProfile: {
    trustScore: {
      type: Number,
      default: 95
    },
    lastSecurityCheck: {
      type: Date,
      default: Date.now
    },
    deviceInfo: {
      type: Object,
      default: {}
    }
  },
  permissions: {
    type: [String],
    default: ['user', 'secure-messaging']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active timestamp
userSchema.methods.updateActivity = function() {
  this.lastActive = Date.now();
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
