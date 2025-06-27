import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { authenticateConnection, handleConnection, handleMessage } from './websocket/messageHandler.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true,
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/security', (await import('./routes/security.js')).default);
app.use('/api/messages', (await import('./routes/messages.js')).default);
app.use('/api/conversations', (await import('./routes/conversations.js')).default);
app.use('/api', (await import('./routes/api.js')).default);

// Socket.IO handling
io.on('connection', async (socket) => {
  console.log('New Socket.IO connection');

  // Extract token from handshake query
  const token = socket.handshake.query.token;

  // Authenticate connection
  const authResult = await authenticateConnection(token);

  if (!authResult.authenticated) {
    socket.emit('error', {
      type: 'auth_error',
      error: authResult.error,
      timestamp: Date.now()
    });
    return socket.disconnect(true);
  }

  const userId = authResult.user._id.toString();

  // Handle new connection
  handleConnection(socket, userId);

  // Handle messages
  socket.on('message', async (message) => {
    try {
      await handleMessage(io, socket, userId, message);
    } catch (error) {
      console.error('Socket.IO message error:', error);
      socket.emit('error', {
        type: 'message_error',
        error: 'Invalid message format',
        timestamp: Date.now()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected');
    // Additional cleanup or state management for disconnected users can go here
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
