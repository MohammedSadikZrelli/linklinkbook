const Joi = require('joi');

const purchaseSubscriptionSchema = Joi.object({
  planType: Joi.string().valid('pro').required(),
});

module.exports = { purchaseSubscriptionSchema };
