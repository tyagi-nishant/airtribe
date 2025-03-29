# TaskMaster API

A RESTful API for a collaborative task tracking and management application. This backend system facilitates team collaboration, task organization, and project management.

## Features

- **User Authentication & Management**
  - Register and login users securely with JWT
  - User profile management
  - Role-based access control
  
- **Task Management**
  - Create, read, update, and delete tasks
  - Assign tasks to team members
  - Task filtering, sorting, and searching
  - Task status tracking
  - Priority levels
  - Due dates and deadlines
  
- **Project Collaboration**
  - Create and manage projects/teams
  - Add/remove members to projects
  - Role-based permissions (owner, admin, member)
  - Comments on tasks
  - File attachments

## Tech Stack

- **Node.js** with **Express.js** - Backend API framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - For secure authentication
- **bcryptjs** - For password hashing

## Setup and Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Configure environment variables
   - Create a `config/config.env` file with the following variables:
     ```
     NODE_ENV=development
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRE=30d
     ```
4. Run the server
   - For development (with nodemon):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Tasks
- `GET /api/tasks` - Get all tasks for the logged-in user
- `GET /api/tasks/:id` - Get a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/comments` - Add a comment to a task

### Projects
- `GET /api/projects` - Get all projects for the logged-in user
- `GET /api/projects/:id` - Get a single project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:id/members` - Add a member to a project
- `DELETE /api/projects/:id/members/:userId` - Remove a member from a project

## Authentication and Authorization

This API uses JWT (JSON Web Tokens) for authentication. To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer your_token_here
```

## Data Models

### User
- `name` - User's full name
- `email` - User's email (unique)
- `password` - Hashed password
- `role` - User role (user, admin)
- `createdAt` - Timestamp of account creation

### Task
- `title` - Task title
- `description` - Detailed task description
- `dueDate` - Task deadline
- `status` - Task status (open, in-progress, review, completed)
- `priority` - Task priority (low, medium, high)
- `assignedTo` - User assigned to the task
- `createdBy` - User who created the task
- `project` - Associated project (if any)
- `comments` - Array of comments on the task
- `attachments` - Array of file attachments
- `createdAt` - Timestamp of task creation
- `updatedAt` - Timestamp of last update

### Project
- `name` - Project name
- `description` - Project description
- `owner` - User who owns the project
- `members` - Array of users with roles (owner, admin, member)
- `createdAt` - Timestamp of project creation

## License

This project is licensed under the MIT License 