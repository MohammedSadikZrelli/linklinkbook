const Joi = require('joi');

const createBookSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  subject: Joi.string().allow(''),
  level: Joi.string().allow(''),
  condition: Joi.string().allow(''),
  price: Joi.number().min(0),
  type: Joi.string().valid('vente', 'échange', 'don').required(),
  status: Joi.string().valid('Disponible', 'En attente', 'Vendu', 'Donné'),
  description: Joi.string().allow(''),
  location: Joi.string().allow(''),
  author: Joi.string().allow(''),
  isbn: Joi.string().allow(''),
  images: Joi.array().items(Joi.string()),
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

module.exports = { createBookSchema, updateBookSchema };
