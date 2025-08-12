// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db'); // from new code
const { isAdminAuth, authRouter } = require('./middleware/authentication'); // Google login routes

const app = express();
app.use(cors()); // or use your corsOptions
app.use(express.json());

// Connect to DB
connectDB(); // ✅ using new function instead of direct mongoose.connect

// Basic route
app.get("/", (req, res) => {
  res.send("🚀 DailySelect Backend is Running!");
});

// Google Auth route
app.use('/api/auth', authRouter); // ✅ Google login routes

// Your existing users route
app.use('/api/users', require('./routes/users'));

// Example API route from new code (optional for testing)
app.post("/api/users-test", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and Email are required" });
  }
  res.json({ message: "User data received", user: { name, email } });
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
