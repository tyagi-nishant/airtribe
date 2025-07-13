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

// Export app for testing (if needed later)
module.exports = app;
