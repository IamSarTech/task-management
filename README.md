# Project Management Web App

A full-stack collaborative Project Management System where users can create projects, assign tasks, manage teams, and track progress with secure Role-Based Access Control (RBAC).

---

# Live Demo

Frontend: `https://your-frontend-url.vercel.app`  
Backend API: `https://your-backend-url.railway.app`

---

# GitHub Repository

`https://github.com/your-username/project-management-app`

---

# Features

## Authentication & Authorization
- User Signup/Login
- JWT Authentication
- Password Hashing using bcrypt
- Persistent Login Sessions
- Role-Based Access Control (Admin/Member)

---

## Project Management

### Admin Features
- Create/Edit/Delete Projects
- Add Team Members
- Set Project Deadlines
- Manage Project Details

### Member Features
- View Assigned Projects
- Track Progress
- Update Task Status

---

## Task Management
- Create Tasks
- Assign Tasks to Members
- Task Priorities:
  - Low
  - Medium
  - High
- Due Dates
- Task Status Tracking:
  - Todo
  - In Progress
  - Completed

---

## Dashboard
- Total Projects
- Total Tasks
- Completed Tasks
- Pending Tasks
- Overdue Tasks
- Progress Visualization
- Responsive Analytics Cards

---

## UI/UX
- Modern Responsive Design
- Dark/Light Theme
- Sidebar Navigation
- Mobile Friendly
- Smooth Animations
- Dashboard Layout

---

# Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM

## Backend
- Node.js
- Express.js

## Database
- MongoDB Atlas

## Authentication
- JWT
- bcrypt.js

## Deployment
- Railway (Backend)
- Vercel / Netlify (Frontend)

---

# Folder Structure

## Frontend
```bash
client/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   ├── layouts/
│   └── App.jsx
│
├── public/
└── package.json
```

## Backend
```bash
server/
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── config/
├── server.js
└── package.json
```

---

# Installation & Setup

## Clone Repository
```bash
git clone https://github.com/your-username/project-management-app.git
cd project-management-app
```

---

# Backend Setup

## Navigate to Server
```bash
cd server
```

## Install Dependencies
```bash
npm install
```

## Create `.env` File
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Run Backend
```bash
npm run dev
```

Backend runs on:
```bash
http://localhost:5000
```

---

# Frontend Setup

## Navigate to Client
```bash
cd client
```

## Install Dependencies
```bash
npm install
```

## Create `.env` File
```env
VITE_API_URL=http://localhost:5000/api
```

## Run Frontend
```bash
npm run dev
```

Frontend runs on:
```bash
http://localhost:5173
```

---

# API Endpoints

## Auth Routes

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/signup` | Register User |
| POST | `/api/auth/login` | Login User |

---

## Project Routes

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/projects` | Get All Projects |
| POST | `/api/projects` | Create Project |
| PUT | `/api/projects/:id` | Update Project |
| DELETE | `/api/projects/:id` | Delete Project |

---

## Task Routes

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/tasks` | Get Tasks |
| POST | `/api/tasks` | Create Task |
| PUT | `/api/tasks/:id` | Update Task |
| DELETE | `/api/tasks/:id` | Delete Task |

---

# Role-Based Access Control

## Admin Permissions
- Manage Projects
- Manage Team Members
- Assign Tasks
- Delete Tasks
- Update Any Task

## Member Permissions
- View Assigned Projects
- Update Assigned Tasks
- Track Task Status

---

# Database Models

## User Model
```js
{
  name,
  email,
  password,
  role
}
```

## Project Model
```js
{
  title,
  description,
  admin,
  members,
  deadline
}
```

## Task Model
```js
{
  title,
  description,
  assignedTo,
  projectId,
  priority,
  status,
  dueDate
}
```

---

# Deployment

## Backend Deployment (Railway)
1. Push backend to GitHub
2. Connect Railway to repository
3. Add environment variables
4. Deploy

---

## Frontend Deployment (Vercel)
1. Push frontend to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

---

# Demo Video

Add your demo video link here:

```bash
https://youtube.com/your-demo-video
```

---

# Future Enhancements
- Real-Time Notifications
- Kanban Board
- Drag & Drop Tasks
- Email Invitations
- Task Comments
- File Uploads
- Activity Logs

---

# Author

Your Name  
B.Tech Student | Full Stack Developer

---

# License

This project is licensed under the MIT License.
