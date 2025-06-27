import express from 'express';

const router = express.Router();

// Messages endpoint
router.get('/messages', (req, res) => {
  res.json({
    messages: [
      {
        id: '1',
        content: 'Hello from secure server!',
        timestamp: Date.now(),
        encrypted: true
      }
    ]
  });
});

// Status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    timestamp: Date.now()
  });
});

export default router;