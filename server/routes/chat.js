const express = require('express');
const router = express.Router();
const { 
  askChatbot, 
  getConversations, 
  getMessages, 
  sendMessage, 
  startConversation 
} = require('../controllers/chatController');
const protect = require('../middleware/auth');

// AI Chatbot
router.post('/ask', askChatbot);

// Peer-to-Peer
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, startConversation);
router.get('/messages/:id', protect, getMessages);
router.post('/messages', protect, sendMessage);

module.exports = router;
