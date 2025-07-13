Brief
Develop a backend system for a virtual event management platform focusing on user registration, event scheduling, and participant management, all managed through in-memory data structures (if you are comfortable with databases, you can use any NoSQL or SQL database).

The system will feature secure user authentication, allowing users to register and log in using bcrypt for password hashing and JWT for session management.

Event management capabilities include creating, updating, and deleting event details, with each event storing information like date, time, description, and participant list in memory. These functionalities should be accessible only to authenticated and authorized users. Additionally, the system should allow users to register for events, and view, and manage their event registrations.

The backend should offer a set of RESTful API endpoints, catering to various functionalities such as user registration (POST /register), login (POST /login), event creation (POST /events), updating events (PUT /events/:id), and event registration (POST /events/:id/register). On successful registration, the user should receive an email.

Requirements:

Project Setup:

Initialize a Node.js project with Express.js and necessary NPM packages.

Utilize in-memory data structures (arrays, objects) instead of a database to store user data and event details.

User Authentication:

Implement user registration and login using bcrypt for password hashing and JWT for token-based authentication.

Manage user profiles in-memory, distinguishing between event organizers and attendees.

Event Management:

Create a data model for events, including fields for date, time, description, and participants, stored in-memory.

Implement CRUD operations for managing events, accessible only by authorized users (event organizers).

Participant Management:

Allow users to register for events.

Manage participant lists in-memory and handle attendee registrations.

RESTful API Endpoints:

POST /register and POST /login for user authentication.

GET, POST, PUT, DELETE /events for event management.

POST /events/:id/register for attendee event registration.

Asynchronous Operations:

Employ async/await and Promises for handling operations such as sending email notifications.

Submission guidelines
Write a clear and concise README file

Run npm run test and confirm all test cases are passing.

To submit your project, please provide a link to your GitHub repository.

[Important] Make sure the repository is public.