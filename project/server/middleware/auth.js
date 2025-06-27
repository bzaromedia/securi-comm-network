import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Attach user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Authorization middleware
 * Checks if user has required permissions
 */
export const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has all required permissions
    const hasPermissions = requiredPermissions.every(permission => 
      req.user.permissions.includes(permission)
    );
    
    if (!hasPermissions) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Security check middleware
 * Verifies device fingerprint and security profile
 */
export const securityCheck = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check device fingerprint
    const deviceFingerprint = req.header('X-Device-Fingerprint');
    
    if (!deviceFingerprint || deviceFingerprint !== req.user.deviceFingerprint) {
      return res.status(403).json({ error: 'Device verification failed' });
    }
    
    // Check security profile
    if (req.user.securityProfile.trustScore < 70) {
      return res.status(403).json({ error: 'Security check failed' });
    }
    
    next();
  } catch (error) {
    console.error('Security check error:', error);
    res.status(500).json({ error: 'Security check failed' });
  }
};
