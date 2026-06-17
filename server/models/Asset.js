const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  data: { type: Buffer, required: true },
  size: { type: Number, required: true },
  category: { type: String, default: 'general', enum: ['logo', 'avatar', 'book-cover', 'general'] },
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
