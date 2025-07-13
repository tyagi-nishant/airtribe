const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment
} = require('../controllers/tasks');

const router = express.Router();

// Import auth middleware
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Task routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// Comments
router.route('/:id/comments')
  .post(addComment);

module.exports = router; 