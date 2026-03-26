# TaskFlow — Fullstack App

A production-ready fullstack project built with **Node.js**, **TypeScript**, and **SQLite (SQL)**.

## 🏗️ Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js, Express, TypeScript      |
| Database  | SQLite via `better-sqlite3`       |
| Auth      | JWT + bcrypt                      |
| Frontend  | React, TypeScript, Vite           |
| Shared    | TypeScript types shared across both |

## 📁 Project Structure

```
fullstack-app/
├── backend/
│   └── src/
│       ├── controllers/   # Business logic
│       ├── db/            # Database, migrations, seed
│       ├── middleware/    # Auth, error handling
│       └── routes/        # Express routers
├── frontend/
│   └── src/
│       ├── api/           # Axios client + service functions
│       ├── components/    # AuthContext
│       └── pages/         # Login, Register, Dashboard, Project
└── shared/
    └── types.ts           # Shared TypeScript interfaces
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

### 3. Seed the database

```bash
cd backend && npm run seed
```

### 4. Run the app

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Demo credentials
- **Email:** alice@example.com
- **Password:** password123

## 🔌 API Endpoints

| Method | Route                                | Description         |
|--------|--------------------------------------|---------------------|
| POST   | /api/auth/register                   | Register user       |
| POST   | /api/auth/login                      | Login               |
| GET    | /api/auth/me                         | Current user        |
| GET    | /api/projects                        | List projects       |
| POST   | /api/projects                        | Create project      |
| GET    | /api/projects/:id                    | Project + tasks     |
| PUT    | /api/projects/:id                    | Update project      |
| DELETE | /api/projects/:id                    | Delete project      |
| GET    | /api/projects/:id/tasks              | List tasks          |
| POST   | /api/projects/:id/tasks              | Create task         |
| PUT    | /api/projects/:id/tasks/:taskId      | Update task         |
| DELETE | /api/projects/:id/tasks/:taskId      | Delete task         |
| POST   | /api/projects/:id/tasks/:taskId/comments | Add comment     |
| GET    | /api/users                           | List users          |
| GET    | /api/users/stats                     | Stats (admin only)  |

## 🗄️ Database Schema

```sql
users       — id, name, email, password_hash, role
projects    — id, title, description, status, owner_id
tasks       — id, title, description, status, priority, due_date, project_id, assignee_id
comments    — id, content, task_id, author_id
```
