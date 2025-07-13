const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Access in-memory users (will be required from index.js)
let users;

// Secret for JWT (in production, use env variable)
const JWT_SECRET = 'your-secret-key'; // Change this to something secure!

// Initialize with users array
module.exports = (userStore) => {
  users = userStore;

  // POST /register
  router.post('/register', async (req, res) => {
    const { username, password, role } = req.body; // role: 'organizer' or 'attendee'
    if (!username || !password || !role || (role !== 'organizer' && role !== 'attendee')) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    // Check for existing user
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user
    const newUser = { id: users.length + 1, username, password: hashedPassword, role };
    users.push(newUser);

    // Generate JWT
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered', token });
  });

  // POST /login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  });

  return router;
};
