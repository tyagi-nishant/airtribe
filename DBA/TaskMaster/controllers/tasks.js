const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks for the logged in user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Task.find(JSON.parse(queryStr));

    // Add user filter (tasks created by user or assigned to user or in projects user is a member of)
    query = query.find({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    });

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Task.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const tasks = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination,
      data: tasks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'project',
        select: 'name description'
      })
      .populate({
        path: 'comments.user',
        select: 'name email'
      })
      .populate({
        path: 'attachments.uploadedBy',
        select: 'name email'
      });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure the user is either the creator, assignee, or a member of the project
    if (
      task.createdBy._id.toString() !== req.user.id &&
      (task.assignedTo && task.assignedTo._id.toString() !== req.user.id)
    ) {
      // Check if the task has a project and if the user is a member of that project
      if (task.project) {
        const project = await Project.findById(task.project._id);
        const isMember = project.members.some(
          member => member.user.toString() === req.user.id
        );
        
        if (!isMember) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to access this task'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this task'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    // Add the created by user
    req.body.createdBy = req.user.id;

    // Check if project exists and user is a member if project is provided
    if (req.body.project) {
      const project = await Project.findById(req.body.project);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const isMember = project.members.some(
        member => member.user.toString() === req.user.id
      );
      
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create tasks in this project'
        });
      }
    }

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user is task creator or has appropriate permissions
    if (
      task.createdBy.toString() !== req.user.id &&
      (task.assignedTo && task.assignedTo.toString() !== req.user.id)
    ) {
      // Check if the task has a project and if the user is an admin or owner of that project
      if (task.project) {
        const project = await Project.findById(task.project);
        const isAdminOrOwner = project.members.some(
          member => 
            member.user.toString() === req.user.id && 
            (member.role === 'admin' || member.role === 'owner')
        );
        
        if (!isAdminOrOwner) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to update this task'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task'
        });
      }
    }

    // Update the updatedAt timestamp
    req.body.updatedAt = Date.now();

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user is task creator or has appropriate permissions
    if (task.createdBy.toString() !== req.user.id) {
      // Check if the task has a project and if the user is an admin or owner of that project
      if (task.project) {
        const project = await Project.findById(task.project);
        const isAdminOrOwner = project.members.some(
          member => 
            member.user.toString() === req.user.id && 
            (member.role === 'admin' || member.role === 'owner')
        );
        
        if (!isAdminOrOwner) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this task'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this task'
        });
      }
    }

    await task.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if user has access to the task (creator, assignee, or project member)
    if (
      task.createdBy.toString() !== req.user.id &&
      (task.assignedTo && task.assignedTo.toString() !== req.user.id)
    ) {
      if (task.project) {
        const project = await Project.findById(task.project);
        const isMember = project.members.some(
          member => member.user.toString() === req.user.id
        );
        
        if (!isMember) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to comment on this task'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to comment on this task'
        });
      }
    }

    const comment = {
      text: req.body.text,
      user: req.user.id
    };

    task.comments.unshift(comment);
    await task.save();

    res.status(200).json({
      success: true,
      data: task.comments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 