// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: String,
    address: String,
    accountNumber: { type: String, unique: true },
    balance: { type: Number, default: 0 },
    password: { type: String, required: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model('User', userSchema);
