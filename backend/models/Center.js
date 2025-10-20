// backend/models/Center.js
const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  latitude: Number,
  longitude: Number,
  website: { type: String, default: null },
  bookingLink: { type: String, default: null }
});

module.exports = mongoose.model('Center', centerSchema);
