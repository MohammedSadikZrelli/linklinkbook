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
const { validate } = require('../validators');
const { askChatbotSchema, startConversationSchema, sendMessageSchema } = require('../validators/chat');

// AI Chatbot
router.post('/ask', validate(askChatbotSchema), askChatbot);

// Peer-to-Peer
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, validate(startConversationSchema), startConversation);
router.get('/messages/:id', protect, getMessages);
router.post('/messages', protect, validate(sendMessageSchema), sendMessage);

module.exports = router;
