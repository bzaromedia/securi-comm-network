import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/index.js';

const router = express.Router();

// Test endpoint
router.post('/test', (req, res) => {
  res.json({ 
    message: 'Auth endpoint working',
    timestamp: Date.now(),
    test: req.body.test || false
  });
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, deviceFingerprint } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      email,
      password, // Will be hashed by the pre-save hook
      deviceFingerprint,
      publicKey: req.body.publicKey || ''
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: user._id, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: { 
        id: user._id, 
        email,
        securityProfile: user.securityProfile,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
