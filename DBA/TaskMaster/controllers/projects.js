const Project = require('../models/Project');

// @desc    Get all projects for the logged in user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query;

    // Finding resource
    query = Project.find({
      'members.user': req.user.id
    });

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Project.countDocuments({ 'members.user': req.user.id });

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const projects = await query;

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
      count: projects.length,
      pagination,
      data: projects
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate({
      path: 'members.user',
      select: 'name email'
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Make sure user is a member of the project
    const isMember = project.members.some(
      member => member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    // Add the owner (current user)
    req.body.owner = req.user.id;
    
    // Check if the owner is already in the members array (should be added by pre-save hook but just in case)
    if (!req.body.members || !req.body.members.length) {
      req.body.members = [{ 
        user: req.user.id,
        role: 'owner'
      }];
    }

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (admin and owner only)
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Make sure user is project owner or admin
    const member = project.members.find(
      member => member.user.toString() === req.user.id
    );

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Prevent owner change if not current owner
    if (req.body.owner && project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can transfer ownership'
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Make sure user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await project.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (owner and admin only)
exports.addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check for required fields
    if (!req.body.userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a user ID'
      });
    }

    // Make sure user is project owner or admin
    const currentMember = project.members.find(
      member => member.user.toString() === req.user.id
    );

    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members to this project'
      });
    }

    // Check if user is already a member
    const existingMember = project.members.find(
      member => member.user.toString() === req.body.userId
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Add new member
    project.members.push({
      user: req.body.userId,
      role: req.body.role || 'member',
      joinedAt: Date.now()
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (owner and admin only)
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Make sure user is project owner or admin
    const currentMember = project.members.find(
      member => member.user.toString() === req.user.id
    );

    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members from this project'
      });
    }

    // Cannot remove the owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner'
      });
    }

    // Don't allow admins to remove other admins (only owner can)
    const memberToRemove = project.members.find(
      member => member.user.toString() === req.params.userId
    );

    if (
      !memberToRemove ||
      (memberToRemove.role === 'admin' && 
       currentMember.role !== 'owner')
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this member'
      });
    }

    // Remove member
    project.members = project.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 