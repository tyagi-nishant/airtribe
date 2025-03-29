const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // We'll create this next

// Route files
const auth = require('./routes/auth');
const tasks = require('./routes/tasks');
const projects = require('./routes/projects');

// Load env vars
dotenv.config({ path: './config/config.env' }); // We'll create this too

// Connect to database
connectDB(); // We'll uncomment this after setting up the DB connection

const app = express();

// Body parser middleware
app.use(express.json());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/tasks', tasks);
app.use('/api/projects', projects);

// Basic route
app.get('/', (req, res) => {
  res.send('API Running');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 