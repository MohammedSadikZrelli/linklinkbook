const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string().trim(),
  profileType: Joi.string().valid('eleve', 'etudiant', 'enseignant', 'parent', 'autre', ''),
  schoolLevel: Joi.string().allow(''),
  wilaya: Joi.string().allow(''),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    postalCode: Joi.string().allow(''),
  }),
  role: Joi.string().valid('user', 'admin'),
  isPro: Joi.boolean(),
});

const upgradeSubscriptionSchema = Joi.object({
  months: Joi.number().integer().positive().default(12),
});

const updateBookSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  subject: Joi.string().allow(''),
  level: Joi.string().allow(''),
  condition: Joi.string().allow(''),
  price: Joi.number().min(0),
  type: Joi.string().valid('vente', 'échange', 'don'),
  status: Joi.string().valid('Disponible', 'En attente', 'Vendu', 'Donné'),
  description: Joi.string().allow(''),
  location: Joi.string().allow(''),
  author: Joi.string().allow(''),
  isbn: Joi.string().allow(''),
  images: Joi.array().items(Joi.string()),
});

module.exports = { updateUserSchema, upgradeSubscriptionSchema, updateBookSchema };
