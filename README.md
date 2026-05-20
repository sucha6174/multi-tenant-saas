

# 🚀 Multi-Tenant SaaS Platform

A full-stack, production-ready **Project & Task Management System** built using a **Multi-Tenant SaaS Architecture**. This platform allows multiple organizations to manage teams, projects, and tasks securely within isolated environments.

The project demonstrates core backend and full-stack concepts such as **tenant isolation, role-based access control, secure authentication, subscription handling, and containerized deployment**.

---

## 🌟 Core Features

### 🏢 Tenant-Based Data Isolation

* Designed with a **Shared Database, Shared Schema** model.
* Each organization (tenant) has isolated data using a unique **tenantId**.
* Prevents unauthorized access between tenants.

### 🔐 Role-Based Access Control (RBAC)

The platform supports different user roles:

* **Super Admin** → Can manage all tenants and plans.
* **Tenant Admin** → Can manage users, projects, and tasks within their organization.
* **Standard User** → Limited access to assigned projects and tasks.

### 💳 Subscription Management

Supports multiple subscription plans:

* Free
* Pro
* Enterprise

System restricts resource creation when plan limits are reached, such as:

* Maximum users
* Maximum projects

### 🔑 Secure Authentication

* Stateless authentication using **JWT (JSON Web Token)**.
* Passwords securely stored using **bcrypt hashing**.
* Token expiry handling for session security.

### 📦 Dockerized Deployment

Application services are containerized using Docker:

* Frontend
* Backend
* PostgreSQL Database

Benefits:

* Easy deployment
* Consistent environment setup
* Simplified service management

### 💾 Persistent Database Storage

* Uses Docker Volumes for PostgreSQL.
* Data remains safe even after restarting containers.

### 🔄 Automated Initialization

On startup:

* Database migrations run automatically
* Seed data is inserted
* No manual SQL setup required

### 🛡️ Security Measures

* Helmet for secure HTTP headers
* CORS configuration
* Input validation for APIs
* Protected routes

### 📱 Responsive UI

Built with modern frontend tools:

* Responsive layout
* Dynamic navigation based on user role
* Dashboard statistics
* User-friendly project/task management

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Axios

## Backend

* Node.js
* Express.js
* PostgreSQL
* Sequelize ORM
* JWT Authentication

## DevOps

* Docker
* Docker Compose

---

# 🏗️ Architecture

This project follows a **Three-Tier Architecture**:

### 1. Presentation Layer

Frontend built with React.

### 2. Application Layer

Backend REST APIs using Express.js.

### 3. Data Layer

PostgreSQL for relational data storage.

Flow:

Frontend → Backend API → Database

---

# 🚀 Setup & Installation

## Prerequisites

* Docker Desktop
* Git

## Clone Repository

```bash
git clone <your-repo-url>
cd saas-platform
```

## Start Application

```bash
docker-compose up -d --build
```

This starts:

* Frontend
* Backend
* PostgreSQL

## Stop Application

```bash
docker-compose down
```

---

# ⚙️ Environment Variables

| Variable     | Description             |
| ------------ | ----------------------- |
| PORT         | Backend server port     |
| DB_HOST      | Database host           |
| DB_PORT      | PostgreSQL port         |
| DB_NAME      | Database name           |
| DB_USER      | Database username       |
| DB_PASSWORD  | Database password       |
| JWT_SECRET   | Secret key for JWT      |
| FRONTEND_URL | Allowed frontend origin |

---

# 📚 API Endpoints

## Authentication

* `POST /api/auth/login` → User login
* `POST /api/auth/register-tenant` → Register organization

## Projects

* `GET /api/projects` → Fetch tenant projects
* `POST /api/projects` → Create project

## Tenants

* `GET /api/tenants` → View all tenants (Super Admin)

---

# 👤 User Roles

### Super Admin

* Manage tenants
* View platform-wide data
* Control subscription plans

### Tenant Admin

* Manage organization users
* Create/update projects
* Assign tasks

### Standard User

* View assigned projects
* Manage own tasks

---

# 📂 Folder Structure

```bash
saas-platform/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── scripts/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── api/
│
├── docker-compose.yml
└── README.md
```

---

# 🎯 Key Learnings

Through this project, I gained practical experience in:

* Multi-tenant architecture
* JWT authentication
* Role-based access control
* REST API development
* Database handling with PostgreSQL
* Docker deployment
* Full-stack application design

