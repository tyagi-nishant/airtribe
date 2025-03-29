const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        default: 'member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a virtual field for tasks in this project (reverse relationship)
ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  justOne: false
});

// Middleware to cascade delete tasks when a project is deleted
ProjectSchema.pre('remove', async function(next) {
  await this.model('Task').deleteMany({ project: this._id });
  next();
});

// Add owner as a member with 'owner' role when project is created
ProjectSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if owner is already in members
    const ownerExists = this.members.some(member => 
      member.user.toString() === this.owner.toString() && member.role === 'owner'
    );

    if (!ownerExists) {
      this.members.push({
        user: this.owner,
        role: 'owner',
        joinedAt: Date.now()
      });
    }
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema); 