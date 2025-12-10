require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Submission = require('./models/Submission');

const app = express();
// Use a different port if running locally (e.g., 5001), or let host assign PORT
const PORT = process.env.ADMIN_PORT || 5001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Serve ONLY Admin Panel
// We serve it at the ROOT path (/) since this is now a dedicated admin server
app.use(express.static(path.join(__dirname, 'admin'), {
    index: 'admin.html'
}));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB (Admin Panel)'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// --- ADMIN ROUTES ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_MASTER_PASSWORD) {
        res.json({ success: true, token: "ADMIN_ACCESS_GRANTED" });
    } else {
        res.status(401).json({ success: false, error: 'Invalid Password' });
    }
});

// Get Data
app.get('/api/admin/data', async (req, res) => {
    if(req.headers['auth-token'] !== "ADMIN_ACCESS_GRANTED") {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const data = await Submission.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Error fetching data" });
    }
});

// Delete Data
app.delete('/api/admin/data/:id', async (req, res) => {
    if(req.headers['auth-token'] !== "ADMIN_ACCESS_GRANTED") {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        await Submission.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Error deleting" });
    }
});

// Fallback for Admin routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`⚙️  Admin Panel running on http://localhost:${PORT}`);
});