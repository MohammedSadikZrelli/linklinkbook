const Joi = require('joi');

const sendInvitationSchema = Joi.object({
  bookId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

module.exports = { sendInvitationSchema };
