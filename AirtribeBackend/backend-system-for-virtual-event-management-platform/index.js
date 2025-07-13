// Basic Express server setup
const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies (needed for POST requests later)
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello from Virtual Event Management Backend!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// In-memory storage (as per README) - we'll expand these later
let users = []; // Array for user data
let events = []; // Array for event data

// NEW/UPDATED: Correct requires (add/replace after existing requires)
const authRoutes = require('./routes/authRoutes')(users); // Pass users array
const authMiddleware = require('./utils/authMiddleware');

// NEW/UPDATED: Mount auth routes (add/replace before app.listen if not already there)
app.use('/auth', authRoutes); // Routes under /auth/register and /auth/login

// NEW: Add after authRoutes require
const eventRoutes = require('./routes/eventRoutes')(events);

// NEW: Mount event routes with auth middleware (add before app.listen)
app.use('/events', authMiddleware, eventRoutes);

// Export app for testing (if needed later)
module.exports = app;
