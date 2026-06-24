const Joi = require('joi');

const addressSchema = Joi.object({
  street: Joi.string().allow(''),
  city: Joi.string().allow(''),
  postalCode: Joi.string().allow(''),
}).default();

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required(),
  password: Joi.string().min(6).required(),
  profileType: Joi.string().valid('eleve', 'etudiant', 'enseignant', 'parent', 'autre', '').required(),
  schoolLevel: Joi.string().allow(''),
  wilaya: Joi.string().required(),
  address: addressSchema,
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim(),
  profileType: Joi.string().valid('eleve', 'etudiant', 'enseignant', 'parent', 'autre', ''),
  schoolLevel: Joi.string().allow(''),
  wilaya: Joi.string().allow(''),
  address: addressSchema,
  avatar: Joi.string().allow(''),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  emailSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
};
