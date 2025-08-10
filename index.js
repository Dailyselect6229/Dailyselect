require('dotenv').config();
const express = require("express");
const connectDB = require("./db");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
connectDB();

// Basic route
app.get("/", (req, res) => {
  res.send("🚀 DailySelect Backend is Running!");
});

// Example API route
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and Email are required" });
  }

  // This is just for testing — DB model can be added later
  res.json({ message: "User data received", user: { name, email } });
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
