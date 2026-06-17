const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    default: ''
  },
  condition: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: ''
  },
  isbn: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['vente', 'échange', 'don'],
    required: true
  },
  status: {
    type: String,
    enum: ['Disponible', 'En attente', 'Vendu', 'Donné'],
    default: 'Disponible'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
