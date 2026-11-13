# 🍽️ SmartMess — College Mess Management System

> A full-stack college minor project built with React, Node.js, PostgreSQL, and Prisma.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Running the Application](#running-the-application)
7. [Demo Credentials](#demo-credentials)
8. [API Endpoints](#api-endpoints)
9. [Project Structure](#project-structure)

---

## Project Overview

SmartMess helps college mess administrators understand student meal patterns through:

- **Meal Attendance** — Students mark which meals they actually ate
- **Feedback System** — Star ratings and comments for meals
- **Complaints** — Report food quality, hygiene, and service issues
- **Food Wastage Tracking** — Daily waste records with charts
- **Admin Dashboard** — Statistics, charts, and insights
- **Monthly Reports** — Summary statistics per month

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript            |
| Database  | PostgreSQL, Prisma ORM                  |
| Auth      | JWT (JSON Web Tokens)                   |
| Charts    | Recharts                                |
| Icons     | Lucide React                            |

---

## Features

### Student
- View today's and upcoming meal menus
- Mark meal attendance (Breakfast / Lunch / Dinner)
- Submit star ratings and feedback for meals
- Submit and track complaints

### Admin
- Manage daily menus (Add / Edit / Delete)
- View all student attendance
- View all feedback and ratings
- Manage complaints (mark as resolved)
- Record daily food waste
- View dashboard analytics
- Generate monthly reports

---

## Prerequisites

Make sure you have installed:

- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **PostgreSQL** v14 or higher → [postgresql.org](https://www.postgresql.org/download/)

---

## Installation & Setup

### Step 1 — Clone / Download the Project

```bash
# Navigate to the project folder
cd smartmess
```

### Step 2 — Configure PostgreSQL

Open PostgreSQL and create a database:

```sql
CREATE DATABASE smartmess;
```

### Step 3 — Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your database URL:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/smartmess"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

### Step 4 — Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 5 — Run Prisma Migration

This creates all the database tables:

```bash
cd backend
npx prisma migrate dev --name init
```

### Step 6 — Seed the Database

This adds demo data (students, menus, attendance, feedback, complaints):

```bash
cd backend
npm run prisma:seed
```

### Step 7 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start at: **http://localhost:5000**

### Start the Frontend Dev Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start at: **http://localhost:5173**

Open your browser and visit: **http://localhost:5173**

---

## Demo Credentials

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@smartmess.com        | admin123    |
| Student | student@smartmess.com      | student123  |

> The login page also shows these credentials for easy access.

---

## API Endpoints

| Method | Endpoint                  | Description              | Auth Required |
|--------|---------------------------|--------------------------|---------------|
| POST   | /api/auth/login           | Login                    | No            |
| GET    | /api/menu                 | Get menus                | Yes           |
| POST   | /api/menu                 | Create menu              | Admin         |
| PUT    | /api/menu/:id             | Update menu              | Admin         |
| DELETE | /api/menu/:id             | Delete menu              | Admin         |
| GET    | /api/attendance           | Get attendance records   | Yes           |
| POST   | /api/attendance           | Mark attendance          | Student       |
| GET    | /api/feedback             | Get feedback             | Yes           |
| POST   | /api/feedback             | Submit feedback          | Student       |
| GET    | /api/complaints           | Get complaints           | Yes           |
| POST   | /api/complaints           | Submit complaint         | Student       |
| PUT    | /api/complaints/:id       | Update complaint status  | Admin         |
| GET    | /api/wastage              | Get food waste records   | Yes           |
| POST   | /api/wastage              | Add waste record         | Admin         |
| GET    | /api/reports/monthly      | Monthly report           | Admin         |

---

## Project Structure

```
smartmess/
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts          # Express server entry point
│       ├── seed.ts           # Database seeder
│       ├── lib/
│       │   └── prisma.ts     # Prisma client
│       ├── middleware/
│       │   └── auth.ts       # JWT authentication
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── menu.ts
│       │   ├── attendance.ts
│       │   ├── feedback.ts
│       │   ├── complaints.ts
│       │   ├── wastage.ts
│       │   └── reports.ts
│       └── types/
│           └── express.d.ts  # Type extensions
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── types/
        │   └── index.ts
        ├── context/
        │   └── AuthContext.tsx
        ├── lib/
        │   └── axios.ts
        ├── components/
        │   ├── Layout.tsx
        │   ├── Sidebar.tsx
        │   ├── Navbar.tsx
        │   ├── DashboardCard.tsx
        │   ├── StatusBadge.tsx
        │   ├── RatingStars.tsx
        │   ├── LoadingSpinner.tsx
        │   └── Modal.tsx
        └── pages/
            ├── Login.tsx
            ├── student/
            │   ├── Dashboard.tsx
            │   ├── Menu.tsx
            │   ├── Attendance.tsx
            │   ├── Feedback.tsx
            │   └── Complaints.tsx
            └── admin/
                ├── Dashboard.tsx
                ├── Menu.tsx
                ├── Attendance.tsx
                ├── Complaints.tsx
                ├── Wastage.tsx
                └── Reports.tsx
```

---

## Database Schema

```
User → Attendance (one-to-many)
User → Feedback (one-to-many)
User → Complaint (one-to-many)
Menu (standalone, indexed by date + mealType)
FoodWaste (standalone, indexed by date)
```

---

*Built as a college minor project to demonstrate full-stack web development skills.*
