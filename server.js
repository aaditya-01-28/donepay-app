require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Submission = require('./models/Submission');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Serve ONLY User App (Static files from /public)
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB (User App)'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// --- USER ROUTES ---

app.post('/api/submit', async (req, res) => {
  try {
    const newSubmission = new Submission(req.body);
    await newSubmission.save();
    console.log(`📝 New submission from: ${req.body.loginPhone}`);
    res.status(201).json({ message: 'Saved successfully' });
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fallback for User App routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;

// Only run app.listen if we are running LOCALLY (not on Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}