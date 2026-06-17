const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  profileType: {
    type: String,
    enum: ['eleve', 'etudiant', 'enseignant', 'parent', 'autre', ''],
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  schoolLevel: {
    type: String,
    default: ''
  },
  wilaya: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  location: {
    lat: { type: Number, default: 34.74 },
    lng: { type: Number, default: 10.76 } // Approximate coordinates default (Sfax)
  },
  avatar: {
    type: String,
    default: ''
  },
  isPro: {
    type: Boolean,
    default: false
  },
  subscriptionActive: {
    type: Boolean,
    default: false
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    type: String,
    default: null
  },
  verificationOTPExpires: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  ip: {
    type: String,
    default: ''
  },
  bannedIp: {
    type: String,
    default: ''
  },
  balance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
