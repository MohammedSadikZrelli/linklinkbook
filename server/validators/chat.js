const Joi = require('joi');

const askChatbotSchema = Joi.object({
  message: Joi.string().trim().min(1).required(),
  context: Joi.object({
    params: Joi.object().pattern(Joi.string(), Joi.any()),
    history: Joi.array().items(Joi.object({
      role: Joi.string().valid('user', 'assistant'),
      content: Joi.string()
    }))
  }).optional(),
});

const startConversationSchema = Joi.object({
  participantId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

const sendMessageSchema = Joi.object({
  conversationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  text: Joi.string().allow(''),
  attachments: Joi.array().items(Joi.string()),
});

module.exports = { askChatbotSchema, startConversationSchema, sendMessageSchema };
