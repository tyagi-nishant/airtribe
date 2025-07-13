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

const jwt = require('jsonwebtoken');

// ADD/VERIFY: Match this exactly with authRoutes.js
const JWT_SECRET = 'your-secret-key'; // Or whatever value you have in authRoutes.js

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Middleware: No valid Bearer token provided'); // Debug log
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('Middleware: Token verified, req.user set:', req.user); // Debug log
    next();
  } catch (err) {
    console.log('Middleware: Token verification failed:', err.message); // Debug log
    return res.status(401).json({ message: 'Invalid token' });
  }
};
