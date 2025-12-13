require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Submission = require('./models/Submission'); // Ensure you have the models/Submission.js file we created earlier

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// Allow CORS from ANY origin so Netlify can talk to Vercel
app.use(cors()); 
app.use(express.json());

// --- DATABASE CONNECTION ---
// Note: We check if connection exists to prevent multiple connections in serverless environment
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ Connected to MongoDB'))
      .catch(err => console.error('❌ DB Error:', err));
}

// --- ROUTES ---

// 1. User Submission
app.post('/api/submit', async (req, res) => {
  try {
    const newSubmission = new Submission(req.body);
    await newSubmission.save();
    res.status(201).json({ message: 'Saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Admin Login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_MASTER_PASSWORD) {
        res.json({ success: true, token: "ADMIN_ACCESS_GRANTED" });
    } else {
        res.status(401).json({ success: false, error: 'Invalid Password' });
    }
});

// 3. Get Data (Admin)
app.get('/api/admin/data', async (req, res) => {
    if(req.headers['auth-token'] !== "ADMIN_ACCESS_GRANTED") return res.status(401).json({ error: "Unauthorized" });
    try {
        const data = await Submission.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Error fetching" });
    }
});

// 4. Delete Data (Admin)
app.delete('/api/admin/data/:id', async (req, res) => {
    if(req.headers['auth-token'] !== "ADMIN_ACCESS_GRANTED") return res.status(401).json({ error: "Unauthorized" });
    try {
        await Submission.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Error deleting" });
    }
});

// Root route for testing
app.get('/', (req, res) => res.send("DonePay Backend is Running!"));

// --- VERCEL EXPORT ---
module.exports = app;

// Local Start (Only runs if not on Vercel)
if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Server running locally on port ${PORT}`));
}