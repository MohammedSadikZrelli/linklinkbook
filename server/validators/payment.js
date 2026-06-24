const Joi = require('joi');

const rechargeSchema = Joi.object({
  amount: Joi.number().positive().required(),
  proofImage: Joi.string().required(),
  method: Joi.string().allow(''),
});

const purchaseBookSchema = Joi.object({
  bookId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

module.exports = { rechargeSchema, purchaseBookSchema };
