# Wellness360 — Task Management

A full-stack task management application with JWT authentication, built with **Vue.js 3** on the frontend and **Spring Boot** on the backend.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Frontend (Vue.js 3)](#frontend-vuejs-3)
- [Backend (Spring Boot)](#backend-spring-boot)
- [API Endpoints](#api-endpoints)
- [Task Model](#task-model)
- [Demo Credentials](#demo-credentials)
- [Architecture Notes](#architecture-notes)
- [HTTP Status Codes](#http-status-codes)

---

## Tech Stack

### Frontend
| Technology      | Version  | Purpose                        |
|-----------------|----------|--------------------------------|
| Vue.js          | 3.4+     | UI framework                   |
| Vue Router      | 4.2+     | Client-side routing            |
| Pinia           | 2.1+     | State management               |
| Axios           | 1.6+     | HTTP client                    |
| @vueuse/core    | 10.7+    | Vue composition utilities      |
| Vite            | 5.0+     | Build tool & dev server        |

### Backend
| Technology      | Purpose                              |
|-----------------|--------------------------------------|
| Spring Boot     | REST API framework                   |
| Spring Security | Auth & route protection              |
| jjwt            | JWT token generation & validation    |
| Bean Validation | Request payload validation           |
| SpringDoc / Swagger UI | API documentation            |
| ConcurrentHashMap | In-memory thread-safe storage     |

---

## Project Structure

```
task-management/
├── frontend/                  # Vue.js 3 SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── NavBar.vue
│   │   │   ├── TaskCard.vue
│   │   │   └── TaskModal.vue
│   │   ├── views/             # Page-level components
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   └── TasksView.vue
│   │   ├── store/             # Pinia state stores
│   │   │   └── index.js
│   │   ├── services/          # Axios API service layer
│   │   ├── router/            # Vue Router config
│   │   ├── assets/            # Static assets
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── backend/                   # Spring Boot REST API
    └── src/main/java/...
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (SPA)                    │
│                   Vue.js 3 + Pinia                  │
│          LoginView / DashboardView / TasksView       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (Axios)
                       │ /api/* → proxy → :9095
┌──────────────────────▼──────────────────────────────┐
│               Spring Boot REST API                  │
│                   Port: 9095                        │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Auth Filter │  │  Controllers │  │ Services  │  │
│  │  (JWT)      │→ │  /api/auth   │→ │ Task CRUD │  │
│  │             │  │  /api/tasks  │  │           │  │
│  └─────────────┘  └──────────────┘  └─────┬─────┘  │
│                                           │        │
│                              ┌────────────▼──────┐  │
│                              │  ConcurrentHashMap│  │
│                              │  (In-Memory Store)│  │
│                              └───────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Request flow:**
1. Vue app sends request via Axios to `/api/*`
2. Vite dev server proxies it to `http://localhost:9095`
3. Spring Security validates the JWT `Authorization` header
4. Controller delegates to the service layer
5. Service reads/writes to the in-memory `ConcurrentHashMap`
6. JSON response is returned to the Vue store (Pinia)
7. UI reactively updates

---

## Frontend (Vue.js 3)

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

> The Vite dev server proxies `/api` → `http://localhost:9095` automatically (configured in `vite.config.js`).

### Build for Production

```bash
npm run build
```

Built assets are output to `frontend/dist/`.

### Key Frontend Files

| File | Description |
|------|-------------|
| `src/main.js` | App entry point — mounts Vue, registers Router & Pinia |
| `src/router/` | Route definitions & navigation guards (auth protection) |
| `src/store/index.js` | Pinia store — auth state, task list, loading flags |
| `src/services/` | Axios instance with JWT interceptor |
| `src/views/LoginView.vue` | Login page |
| `src/views/DashboardView.vue` | Task summary dashboard |
| `src/views/TasksView.vue` | Full task list with CRUD actions |
| `src/components/TaskCard.vue` | Individual task card component |
| `src/components/TaskModal.vue` | Create / edit task modal |
| `src/components/NavBar.vue` | Top navigation bar |

---

## Backend (Spring Boot)

### Prerequisites
- Java 17+
- Maven 3.8+

### Install & Run

```bash
cd backend
mvn spring-boot:run
```

API runs at: `http://localhost:9095`

Swagger UI: `http://localhost:9095/swagger-ui.html`

### Build JAR

```bash
mvn clean package
java -jar target/*.jar
```

---

## API Endpoints

All task endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint                   | Description             |
|--------|----------------------------|-------------------------|
| POST   | `/api/auth/login`          | Login, get JWT token    |
| POST   | `/api/auth/register`       | Register new user       |
| GET    | `/api/tasks`               | Get all tasks           |
| GET    | `/api/tasks/{id}`          | Get task by ID          |
| POST   | `/api/tasks`               | Create new task         |
| PUT    | `/api/tasks/{id}`          | Update task             |
| DELETE | `/api/tasks/{id}`          | Delete task             |
| PATCH  | `/api/tasks/{id}/complete` | Mark task as complete   |

### Example: Login

```bash
curl -X POST http://localhost:9095/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "username": "admin"
  }
}
```

### Example: Create Task

```bash
curl -X POST http://localhost:9095/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix production bug",
    "description": "Priority P0 issue in payment service",
    "dueDate": "2026-05-20"
  }'
```

### Example: Mark Task Complete

```bash
curl -X PATCH http://localhost:9095/api/tasks/{id}/complete \
  -H "Authorization: Bearer <token>"
```

---

## Task Model

| Field       | Type      | Description                             |
|-------------|-----------|-----------------------------------------|
| id          | string    | UUID, auto-generated                    |
| title       | string    | Required, 1–200 chars                   |
| description | string    | Optional, max 1000 chars                |
| dueDate     | date      | Optional, `yyyy-MM-dd` format           |
| status      | enum      | `pending` / `in_progress` / `completed` |
| createdAt   | timestamp | Auto-set on creation                    |
| updatedAt   | timestamp | Auto-updated on modification            |

---

## Demo Credentials

| Username | Password    |
|----------|-------------|
| admin    | password123 |
| demo     | password123 |

---

## Architecture Notes

- **Storage**: In-memory `ConcurrentHashMap` — thread-safe, no database required
- **Auth**: Stateless JWT tokens via `jjwt` library; token is stored in `localStorage` on the frontend
- **Validation**: Bean Validation (`@NotBlank`, `@Size`, `@FutureOrPresent`) on all incoming payloads
- **Error Handling**: `@RestControllerAdvice` global exception handler returns consistent JSON error responses
- **CORS**: Configured to allow all origins in development mode
- **API Docs**: SpringDoc OpenAPI / Swagger UI available at `/swagger-ui.html`
- **State Management**: Pinia store on the frontend manages auth token, user info, and task list reactively
- **Proxy**: Vite dev server proxies `/api` to the backend so no CORS issues during development

---

## HTTP Status Codes

| Code | Meaning                  |
|------|--------------------------|
| 200  | Success                  |
| 201  | Created                  |
| 400  | Validation / Bad Request |
| 401  | Unauthorized             |
| 404  | Task Not Found           |
| 500  | Internal Server Error    |