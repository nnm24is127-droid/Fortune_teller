# 🔮 AstroTeller

[![Tests](https://github.com/USERNAME/astro-teller/actions/workflows/tests.yml/badge.svg)](https://github.com/USERNAME/astro-teller/actions/workflows/tests.yml)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Code style: PEP8](https://img.shields.io/badge/code%20style-PEP8-blue)](https://peps.python.org/pep-0008/)

> A production-quality FastAPI backend for generating, storing, and reviewing astrology readings using the Navamsha Astrology API.

AstroTeller is an **entertainment and self-reflection** application that takes a user's birth information, queries an external astrology API, generates a structured personal reading, and stores it for future review. The project is designed for **educational purposes** — demonstrating real-world backend engineering patterns in a self-contained, well-tested Python application.

> ⚠️ **Disclaimer:** Astrology interpretations provided by AstroTeller are for entertainment and personal reflection only. They are not scientifically validated predictions and should not be treated as professional advice of any kind.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [What This Project Demonstrates](#what-this-project-demonstrates)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Folder Structure](#folder-structure)
7. [Installation](#installation)
8. [Environment Variables](#environment-variables)
9. [Running the Application](#running-the-application)
10. [Running with Docker](#running-with-docker)
11. [Frontend Application (React + Vite)](#frontend-application-react--vite)
12. [LLM Integration (Google Gemini AI)](#llm-integration-google-gemini-ai)
13. [Authentication Flow](#authentication-flow)
14. [Role-Based Access Control](#role-based-access-control)
15. [API Endpoints](#api-endpoints)
16. [API Examples](#api-examples)
17. [Database](#database)
18. [Astrology API Integration](#astrology-api-integration)
19. [Error Handling](#error-handling)
20. [Logging](#logging)
21. [Testing](#testing)
22. [Security](#security)
23. [Git Hygiene](#git-hygiene)
24. [Utility Scripts](#utility-scripts)
25. [Future Improvements](#future-improvements)

---

## Project Overview

AstroTeller demonstrates a complete, layered backend application lifecycle:

```
User Request
     │
     ▼
JWT Authentication
     │
     ▼
Role Authorization
     │
     ▼
Input Validation (Pydantic)
     │
     ▼
Navamsha Astrology API  ◄─── birth date, time, location
     │
     ▼
Astrology Profile
(Sun sign, Moon sign, Nakshatra, Ascendant, Zodiac)
     │
     ▼
Interpretation Engine
(structured reading from curated interpretation data)
     │
     ▼
Database (SQLite via SQLAlchemy)
     │
     ▼
API Response (Pydantic-validated JSON)
     │
     ▼
Reading History / Astrologer Review
```

From a software engineering perspective, the project covers:

- **REST API design** — clean URL naming, correct HTTP status codes, consistent JSON responses
- **Authentication** — JWT Bearer tokens, Argon2 password hashing
- **Authorization** — role-based access control (user / astrologer / admin)
- **External API integration** — timeout handling, error isolation, mocked in tests
- **Database design** — SQLAlchemy ORM, relational data, migrations
- **Layered service architecture** — routes → services → tools → external API
- **Professional error handling** — centralized handlers, no stack trace leakage
- **Structured logging** — per-request context, rotating file logs
- **Automated testing** — 60 tests, isolated DB, mocked external calls

---

## What This Project Demonstrates

> This section is useful for explaining the project in an interview.

| Area | What Was Built |
|------|---------------|
| **REST API** | FastAPI with correct HTTP verbs, status codes, and consistent JSON |
| **Authentication** | JWT (HS256), Bearer scheme, Swagger Authorize button |
| **Authorization** | Role-based access control — user, astrologer, admin roles |
| **Password security** | Argon2 hashing via `pwdlib` — no plain text passwords anywhere |
| **External API** | Navamsha Astrology API with timeout, retry-safe error handling |
| **API key management** | Stored in `.env`, never hardcoded, never logged, never returned |
| **Database** | SQLAlchemy ORM, relational model (User → Reading), SQLite |
| **Pagination** | DB-level LIMIT/OFFSET on all list endpoints |
| **Filtering & Sorting** | Whitelisted query params, SQL-safe via SQLAlchemy |
| **Validation** | Pydantic v2 — request schemas, custom date validation, response models |
| **Error handling** | Centralized exception handlers, uniform error envelope |
| **Logging** | Structured per-request logging, rotating log files, no secret leakage |
| **Testing** | pytest, 60 tests, isolated test DB, external API fully mocked |
| **OpenAPI docs** | Swagger with BearerAuth, summaries, descriptions, response schemas |
| **Clean architecture** | routes → services → tools, each layer with single responsibility |

---

## Features

### Authentication
- User registration with duplicate-check (username and email)
- Login with JWT access token (60-minute expiry)
- Argon2 password hashing (via `pwdlib`)
- Bearer token authentication (Swagger Authorize button supported)

### Authorization
- Three roles: **user**, **astrologer**, **admin**
- Role-based access control on every protected endpoint
- Admin cannot demote the sole remaining admin (safeguard)

### Astrology
- Birth information submission (date, time, latitude, longitude, timezone)
- Calendar date validation (e.g. February 31 is rejected)
- Navamsha Astrology API integration for Vedic chart data
- Western zodiac sign calculation (built-in)
- Structured reading: Sun, Moon, Nakshatra, Ascendant, summary, disclaimer

### Reading History
- Personal reading history (paginated)
- Filter by moon sign
- Sort by date or ID (ascending/descending)
- User isolation — you only ever see your own readings

### Astrologer Functionality
- Paginated reading review queue
- Filter by reviewed/unreviewed status
- Full reading detail view (birth data, chart, interpretation)
- Add or update professional interpretation notes
- Review timestamp and reviewer identity recorded

### Admin
- Paginated user list with search (username or email)
- User lookup by ID
- Role management (promote/demote users)
- Sole-admin demotion protection

### Engineering Quality
- Centralized exception handling — uniform JSON error envelope
- Input validation with detailed field-level error messages
- Structured logging to console and rotating log file
- 60 automated tests with mocked external API
- Swagger/OpenAPI documentation with security scheme
- Liveness (`GET /health`) and readiness (`GET /health/ready`) endpoints
- Configurable API timeout via environment variable

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Backend language |
| FastAPI | 0.141 | REST API framework |
| Uvicorn | 0.53 | ASGI server |
| SQLAlchemy | 2.0 | ORM and database abstraction |
| SQLite | built-in | Relational database (development) |
| Pydantic | 2.13 | Request/response validation and serialization |
| python-jose | 3.5 | JWT creation and verification (HS256) |
| pwdlib + Argon2 | 0.3 | Secure password hashing |
| Requests | 2.34 | External Navamsha API HTTP client |
| python-dotenv | 1.2 | Environment variable loading |
| pytest | 8+ | Automated test framework |
| pytest-cov | 5+ | Test coverage reporting |
| Navamsha API | external | Vedic astrology chart data |

---

## Architecture

```
┌─────────────────────────────────────┐
│           HTTP Client               │
│     (Browser / curl / Swagger)      │
└──────────────────┬──────────────────┘
                   │ HTTP Request
                   ▼
┌─────────────────────────────────────┐
│         FastAPI Application         │
│  ┌────────────────────────────────┐ │
│  │  Request Logging Middleware    │ │
│  └────────────────────────────────          ▼                    ▼
┌─────────────────┐  ┌────────────────────┐
│  app/auth.py    │  │      Services      │
│  - JWT verify   │  │  astrology_service │
│  - require_role │  │  llm_service       │
└─────────────────┘  │  reading_service   │
                     │  astrologer_service│
                     └────────┬───────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌─────────────────┐  ┌──────────────────┐
          │  External APIs  │  │  Interpretation  │
          │  astrology_tool │  │  llm_prompts.py  │
          │  (Navamsha API) │  │  (Gemini REST)   │
          │  llm_tool (LLM) │  └──────────────────┘
          └────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │   SQLAlchemy ORM │
         │  (app/database)  │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  SQLite Database │
         │ astro_teller.db  │
         └──────────────────┘
```

### Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|---------------|
| **Routes** | `app/routes/` | HTTP request/response, query params, status codes |
| **Auth** | `app/auth.py` | JWT decode, user lookup, role enforcement |
| **Services** | `app/services/` | Business logic, orchestration, Gemini AI prompting, DB writes |
| **Tools** | `app/tools/` | External API clients (Navamsha API, Gemini REST API), zodiac calculator |
| **Data** | `app/data/` | Fallback interpretation text (Sun, Moon, Ascendant) |
| **Models** | `app/models/` | SQLAlchemy ORM table definitions |
| **Schemas** | `app/schemas.py` | Pydantic request/response models & LLM output validation |
| **Core** | `app/core/` | Exception definitions, handlers, logging config |

---

## Folder Structure

```
astro-teller/
│
├── app/                          # Main application package
│   ├── core/
│   │   ├── exceptions.py         # Custom exception classes (Navamsha & LLM errors)
│   │   ├── exception_handlers.py # Centralized FastAPI error handlers
│   │   └── logging_config.py     # Logging setup (console + rotating file)
│   │
│   ├── data/
│   │   └── interpretations.py    # Curated Sun/Moon/Ascendant text data (fallback)
│   │
│   ├── models/
│   │   └── __init__.py           # SQLAlchemy ORM models: User, Reading
│   │
│   ├── routes/
│   │   ├── auth_routes.py        # POST /auth/register, POST /auth/login
│   │   ├── user_routes.py        # GET /users/me
│   │   ├── astrology_routes.py   # POST /astrology/reading, GET /astrology/history
│   │   ├── astrologer_routes.py  # GET/PATCH /astrologer/readings
│   │   └── admin_routes.py       # GET/PATCH /admin/users
│   │
│   ├── services/
│   │   ├── astrology_service.py  # Orchestrates Navamsha API + Gemini LLM synthesis
│   │   ├── llm_service.py        # High-level Gemini AI orchestration & Pydantic validation
│   │   ├── llm_prompts.py        # Strict system prompts & schema formatting
│   │   ├── reading_service.py    # Fallback rule-based structured reading generator
│   │   └── astrologer_service.py # Review queue, note management
│   │
│   ├── tools/
│   │   ├── astrology_tool.py     # HTTP client for Navamsha API
│   │   ├── llm_tool.py           # HTTP client for Google Gemini REST API
│   │   └── zodiac_tool.py        # Western zodiac sign calculator
│   │
│   ├── auth.py                   # JWT creation/verification, role checker
│   ├── config.py                 # Environment variable loading
│   ├── database.py               # SQLAlchemy engine, session, Base
│   ├── main.py                   # FastAPI app, middleware, routers, health
│   └── schemas.py                # All Pydantic request/response models
│
├── frontend/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/           # Navbar, Footer, LoadingSpinner, Pagination, ZodiacBadge
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── pages/                # Landing, Auth, Dashboard, Reading, History, Admin, Astrologer
│   │   └── services/             # Axios API client
│   └── package.json
│
├── astrology_book/               # Static astrology reference data (JSON)
├── scripts/                      # Admin & DB migration helpers
├── tests/
│   ├── conftest.py               # Shared fixtures (test DB, client, mocked APIs)
│   ├── test_auth.py              # Registration, login, validation
│   ├── test_users.py             # User profile endpoint
│   ├── test_astrology.py         # Reading creation, history, pagination, filters
│   ├── test_astrologer.py        # Review queue, notes, pagination
│   ├── test_admin.py             # User management, search, pagination
│   ├── test_health.py            # Liveness and readiness probes
│   ├── test_error_handling.py    # External API failures, error sanitization
│   └── test_llm.py               # LLM tool timeouts, rate limits, schema validation, fallback
│
├── logs/                         # Runtime logs (git-ignored)
│   └── app.log�   │
│   ├── services/
│   │   ├── astrology_service.py  # Orchestrates API call + profile + reading
│   │   ├── reading_service.py    # Builds StructuredReading from profile
│   │   └── astrologer_service.py # Review queue, note management
│   │
│   ├── tools/
│   │   ├── astrology_tool.py     # HTTP client for Navamsha API
│   │   └── zodiac_tool.py        # Western zodiac sign calculator
│   │
│   ├── auth.py                   # JWT creation/verification, role checker
│   ├── config.py                 # Environment variable loading
│   ├── database.py               # SQLAlchemy engine, session, Base
│   ├── main.py                   # FastAPI app, middleware, routers, health
│   └── schemas.py                # All Pydantic request/response models
│
├── astrology_book/               # Static astrology reference data (JSON)
│   ├── zodiac.json
│   ├── planets.json
│   └── elements.json
│
├── scripts/
│   ├── create_admin.py           # CLI: create or promote an admin user
│   └── migrate_db.py             # DB migration helper
│
├── tests/
│   ├── conftest.py               # Shared fixtures (test DB, test client, mocks)
│   ├── test_auth.py              # Registration, login, validation
│   ├── test_users.py             # User profile endpoint
│   ├── test_astrology.py         # Reading creation, history, pagination, filters
│   ├── test_astrologer.py        # Review queue, notes, pagination
│   ├── test_admin.py             # User management, search, pagination
│   ├── test_health.py            # Liveness and readiness probes
│   └── test_error_handling.py    # External API failures, error sanitization
│
├── logs/                         # Runtime logs (git-ignored)
│   └── app.log
│
├── .env                          # Local secrets — NEVER commit (git-ignored)
├── .env.example                  # Safe placeholder template — commit this
├── .gitignore
├── pytest.ini                    # Test configuration
├── requirements.txt              # All Python dependencies (pinned)
├── LICENSE
└── README.md
```

---

## Installation

### Prerequisites

- Python 3.10 or higher
- A [Navamsha Astrology API](https://navamsha.in) key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/astro-teller.git
cd astro-teller
```

### 2. Create a virtual environment

**Windows:**
```powershell
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables)).

### 5. Create the first admin user (optional)

```bash
python scripts/create_admin.py
```

This interactive script creates a new admin account or promotes an existing user to admin.

---

## Environment Variables

Create a `.env` file in the project root. Use `.env.example` as your template:

```env
# Required Secrets
ASTROLOGY_API_KEY=your_navamsha_api_key_here
SECRET_KEY=your_jwt_secret_key_here

# LLM Integration (Google Gemini AI)
LLM_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-2.5-flash
LLM_TIMEOUT=30
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta

# Database
DATABASE_URL=sqlite:///./astro_teller.db

# Logging
LOG_LEVEL=INFO

# External API timeout in seconds
ASTROLOGY_API_TIMEOUT=15

# CORS origins for frontend (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `ASTROLOGY_API_KEY` | Yes | — | Navamsha Astrology API key |
| `SECRET_KEY` | Yes | — | JWT signing secret (use a long random string) |
| `LLM_API_KEY` | No | empty | Google Gemini AI API key (enables dynamic LLM interpretations) |
| `LLM_MODEL` | No | `gemini-2.5-flash` | Gemini model name |
| `LLM_TIMEOUT` | No | `30` | Timeout in seconds for LLM API requests |
| `LLM_BASE_URL` | No | `https://generativelanguage.googleapis.com/v1beta` | Google Gemini API base endpoint |
| `DATABASE_URL` | No | `sqlite:///./astro_teller.db` | SQLAlchemy connection string |
| `LOG_LEVEL` | No | `INFO` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `ASTROLOGY_API_TIMEOUT` | No | `15` | Seconds before external astrology API call times out |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173,http://localhost:3000` | Comma-separated CORS origins |

> **Important:** `.env` is listed in `.gitignore` and must **never** be committed to version control. Your API key and secret key must stay private.

To generate a strong `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Running the Application

```bash
uvicorn app.main:app --reload
```

| URL | Purpose |
|-----|---------|
| `http://127.0.0.1:8000` | Application root |
| `http://127.0.0.1:8000/docs` | Swagger UI (interactive API docs) |
| `http://127.0.0.1:8000/redoc` | ReDoc (readable API reference) |
| `http://127.0.0.1:8000/api/v1/health/live` | Liveness probe |
| `http://127.0.0.1:8000/api/v1/health/ready` | Readiness probe (DB check) |

---

## Running with Docker

AstroTeller can be built and run using Docker Compose without needing local Python installation:

```bash
# 1. Build and start the container in detached mode
docker compose up --build -d

# 2. View live application logs
docker compose logs -f app

# 3. Check container status and health check
docker compose ps

# 4. Stop the container
docker compose down
```

> 💾 **Data Persistence:** The SQLite database is volume-mounted to `./data` and application logs to `./logs` on the host, ensuring all readings and logs persist across container restarts.

---

## Frontend Application (React + Vite)

AstroTeller features a modern, cosmic SaaS single-page application built with **React 18**, **TypeScript**, and **Vite**.

```
                ┌────────────────┐
                │    Frontend    │
                │  React + Vite  │
                │(Port 5173 / 80)│
                └───────┬────────┘
                        │
                        │ HTTP / JSON (JWT Bearer)
                        ▼
                ┌────────────────┐
                │    FastAPI     │
                │  Backend API   │
                │  (Port 8000)   │
                └───────┬────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
        ┌───────────┐       ┌─────────────┐
        │SQLAlchemy │       │  Navamsha   │
        │ + SQLite  │       │     API     │
        └───────────┘       └─────────────┘
```

### 1. Setup and Run Frontend Locally

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

### 2. Frontend Test & Build

```bash
# Run Vitest test suite
npm test

# Production build
npm run build

# Preview build
npm run preview
```

### 3. Frontend Pages & Features

- **Public**: Cosmic Landing Page, User Registration with validation, User Login.
- **User Portal**: Dashboard with overview metrics, Kundali reading generator with city coordinate presets, structured results view, and paginated reading history with moon sign filtering.
- **Astrologer Portal**: Pending reading queue, full chart detail viewer, and professional note submission (`PATCH /astrologer/readings/:id/note`).
- **Admin Portal**: System diagnostics, searchable user directory, and role management modal (`PATCH /admin/users/:id/role`) with sole-admin demotion prevention.

---

## LLM Integration (Google Gemini AI)

AstroTeller uses **Google Gemini AI** to transform raw planetary calculations into empathetic, nuanced, and human-friendly personal interpretations.

### 1. Separation of Responsibilities

```
+-------------------------------------------------------------+
|                      Navamsha API                           |
|        (Sole Source of Astronomical & Vedic Calculations)   |
|  - Planetary degrees & signs                                |
|  - Ascendant (Lagna) & Nakshatra                            |
+------------------------------+------------------------------+
                               |
                               v Normalized Data
+-------------------------------------------------------------+
|                     Google Gemini AI                        |
|       (Synthesis, Translation & Psychological Reflection)   |
|  - Interprets planetary combinations                        |
|  - Generates personality, strengths, reflection themes      |
|  - Outputs strict JSON matching Pydantic schema             |
+------------------------------+------------------------------+
                               |
                               v Validated Schema
+-------------------------------------------------------------+
|                Database (SQLite) & Frontend                 |
|  - Stored permanently in SQLite database                    |
|  - Reading history fetches cached JSON without re-calling   |
|  - Zero token waste or rate-limit usage on re-reads         |
+-------------------------------------------------------------+
```

### 2. Output Schema (`AstrologyInterpretation`)

Every Gemini response is strictly validated against a Pydantic schema:

| Field | Type | Description |
|---|---|---|
| `summary` | `str` | Concise executive summary of core astrological identity |
| `personality` | `str` | Emotional nature, temperament, and core traits |
| `strengths` | `List[str]` | 3–5 practical strengths derived from positive placements |
| `areas_for_reflection` | `List[str]` | 2–4 constructive self-reflection points (no fatalism) |
| `relationships` | `str` | Interpersonal dynamics and communication style |
| `career` | `str` | Vocation, creative pursuits, and work ethics |
| `explanation` | `str` | Transparent rationale linking placements to traits |
| `disclaimer` | `str` | Clear ethical and self-reflection notice |

### 3. Safety and Non-Fatalistic Framing

The system prompt enforces strict safety boundaries:
- **No predictive claims:** Avoids definitive statements about the future or lifespan.
- **No medical, legal, or financial advice:** Explicitly restricted by prompt and disclaimer.
- **Self-reflection emphasis:** Frames all interpretations as archetype lenses for personal growth.

### 4. Offline Deterministic Fallback

If `LLM_API_KEY` is not provided (e.g. in offline dev environments or basic automated test runs), AstroTeller automatically falls back to curated rule-based interpretations in `app/services/reading_service.py` without throwing runtime exceptions.

---

## Authentication Flow

AstroTeller uses **JWT Bearer authentication**.

```
1. POST /auth/register   →  create account  →  receive JWT token
        (or)
   POST /auth/login      →  verify password  →  receive JWT token

2. Copy the access_token from the response

3. In Swagger UI: click "Authorize" → paste: Bearer <your_token>
        (or)
   In API calls: add header:  Authorization: Bearer <your_token>

4. Access protected endpoints with the token

5. Token expires after 60 minutes — log in again to refresh
```

All protected endpoints return:
- `401 Unauthorized` — if the token is missing, malformed, or expired
- `403 Forbidden` — if the token is valid but the role is insufficient

---

## Role-Based Access Control

| Feature | User | Astrologer | Admin |
|---------|:----:|:----------:|:-----:|
| Register / Login | ✅ | ✅ | ✅ |
| View own profile (`GET /users/me`) | ✅ | ✅ | ✅ |
| Generate astrology reading | ✅ | ✅ | ✅ |
| View own reading history | ✅ | ✅ | ✅ |
| View reading review queue | ❌ | ✅ | ✅ |
| View full reading detail | ❌ | ✅ | ✅ |
| Add astrologer interpretation note | ❌ | ✅ | ✅ |
| List all users | ❌ | ❌ | ✅ |
| View any user by ID | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |

Roles are assigned as `user` on registration. Use `scripts/create_admin.py` to create the first admin, then manage roles via `PATCH /admin/users/{user_id}/role`.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new account → returns JWT | None |
| `POST` | `/auth/login` | Login → returns JWT | None |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/users/me` | Get current user profile | Any role |

### Astrology

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/astrology/reading` | Generate and save a reading | Any role |
| `GET` | `/astrology/history` | Paginated personal reading history | Any role |

**History query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int ≥ 1 | `1` | Page number |
| `limit` | int 1–100 | `10` | Items per page |
| `moon_sign` | string | — | Filter by moon sign (e.g. `Aries`) |
| `sort` | `created_at` \| `id` | `created_at` | Sort field |
| `order` | `asc` \| `desc` | `desc` | Sort direction |

### Astrologer

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/astrologer/readings` | Paginated reading review queue | astrologer, admin |
| `GET` | `/astrologer/readings/{id}` | Full detail of a single reading | astrologer, admin |
| `PATCH` | `/astrologer/readings/{id}/note` | Add or update interpretation note | astrologer, admin |

**Review queue query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int ≥ 1 | `1` | Page number |
| `limit` | int 1–100 | `20` | Items per page |
| `is_reviewed` | bool | — | `true` = reviewed only, `false` = pending only |
| `sort` | `created_at` \| `id` | `created_at` | Sort field |
| `order` | `asc` \| `desc` | `desc` | Sort direction |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/admin/users` | Paginated user list with search | admin |
| `GET` | `/admin/users/{id}` | Get user by ID | admin |
| `PATCH` | `/admin/users/{id}/role` | Update user role | admin |

**User list query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int ≥ 1 | `1` | Page number |
| `limit` | int 1–100 | `20` | Items per page |
| `search` | string | — | Partial match on username or email |
| `sort` | `id` \| `username` \| `created_at` | `id` | Sort field |
| `order` | `asc` \| `desc` | `asc` | Sort direction |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Liveness probe — is the process alive? | None |
| `GET` | `/health/ready` | Readiness probe — is the DB reachable? | None |

---

## API Examples

### Register

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "azmal",
    "email": "azmal@example.com",
    "password": "mysecretpassword"
  }'
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Login

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "azmal", "password": "mysecretpassword"}'
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Generate a Reading

```bash
curl -X POST http://127.0.0.1:8000/astrology/reading \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 1995,
    "month": 8,
    "date": 15,
    "hours": 14,
    "minutes": 30,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "timezone": 5.5
  }'
```

```json
{
  "message": "Reading generated successfully 🔮",
  "reading_id": 1,
  "profile": {
    "zodiac_sign": "Leo",
    "sun_sign": "Leo",
    "moon_sign": "Aries",
    "nakshatra": "Ashwini",
    "ascendant": "Scorpio"
  },
  "reading": {
    "summary": "Astrological Profile: Sun in Leo, Moon in Aries, Ascendant in Scorpio...",
    "sun_interpretation": "...",
    "moon_interpretation": "...",
    "nakshatra_interpretation": "...",
    "ascendant_interpretation": "...",
    "overall_interpretation": "...",
    "disclaimer": "This reading is for entertainment and self-reflection only..."
  }
}
```

### View Reading History (paginated)

```bash
curl "http://127.0.0.1:8000/astrology/history?page=1&limit=5&moon_sign=Aries" \
  -H "Authorization: Bearer <your_token>"
```

```json
{
  "items": [
    {
      "id": 1,
      "zodiac_sign": "Leo",
      "moon_sign": "Aries",
      "nakshatra": "Ashwini",
      "ascendant": "Scorpio",
      "reading": { "summary": "...", "disclaimer": "..." },
      "astrologer_note": null,
      "reviewed_at": null,
      "created_at": "2026-09-23T17:30:00"
    }
  ],
  "page": 1,
  "limit": 5,
  "total": 1,
  "pages": 1
}
```

### Error Response (consistent envelope)

All errors follow the same shape:

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication token is missing.",
  "details": null
}
```

---

## Database

| Property | Value |
|----------|-------|
| Engine | SQLite (development) |
| ORM | SQLAlchemy 2.0 |
| File | `astro_teller.db` (git-ignored) |

### Entity Relationship

```
users
  │  id, username, email, password_hash, role, created_at
  │
  └──< readings
         id, user_id (FK → users.id),
         birth_year, birth_month, birth_date, birth_hours, birth_minutes,
         latitude, longitude, timezone,
         zodiac_sign, moon_sign, nakshatra, ascendant,
         reading_text (JSON),
         astrologer_note, reviewed_by (FK → users.id), reviewed_at,
         created_at
```

One user can have many readings. A reading can optionally reference a second user (the reviewing astrologer) via `reviewed_by`.

Tables are created automatically on application startup via `Base.metadata.create_all()`.

---

## Astrology API Integration

AstroTeller integrates with the [Navamsha Astrology API](https://navamsha.in) for Vedic chart data.

**Flow:**

1. User submits birth date, time, and geographic coordinates
2. `astrology_tool.py` sends a `POST` request to the Navamsha API with an `X-API-Key` header
3. The API returns planetary positions, ascendant, nakshatra, and other chart data
4. `astrology_service.py` extracts Sun sign, Moon sign, Nakshatra, and Ascendant
5. `zodiac_tool.py` independently calculates the Western zodiac sign from birth date
6. `reading_service.py` combines all data into a structured interpretation

**External API failures are handled safely:**

| Failure | Response to Client |
|---------|--------------------|
| Timeout | `502` — "The astrology service timed out. Please try again shortly." |
| Rate limit (429) | `502` — "Rate limit reached. Please try again later." |
| Auth error (401/403) | `502` — "Authorization failed. Contact administrator." |
| Malformed response | `502` — "Malformed response from astrology service." |
| Network error | `502` — "The astrology service is temporarily unavailable." |

No internal details, API keys, or stack traces are ever included in error responses.

---

## Error Handling

All errors return a consistent JSON envelope:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description.",
  "details": null
}
```

| Status Code | Meaning | Example |
|-------------|---------|---------|
| `200 OK` | Success | Successful GET |
| `201 Created` | Resource created | Registration, reading generation |
| `400 Bad Request` | Business logic error | Username already exists |
| `401 Unauthorized` | Missing or invalid token | No Bearer header |
| `403 Forbidden` | Insufficient role | User accessing admin endpoint |
| `404 Not Found` | Resource missing | User or reading ID not found |
| `422 Unprocessable Entity` | Validation error | Feb 31, invalid coordinates, invalid role |
| `502 Bad Gateway` | External API failure | Navamsha API timeout/error |
| `500 Internal Server Error` | Unexpected server error | Unhandled exception |

---

## Logging

AstroTeller uses Python's built-in `logging` module with two output targets:

| Target | Location | Rotation |
|--------|----------|----------|
| Console (stdout) | Terminal | N/A |
| File | `logs/app.log` | 5 MB max, 5 backup files |

**Log format:**
```
2026-09-23 17:30:00 | INFO    | astro_teller.http  | [a1b2c3d4] POST /astrology/reading -> 201 (143.2ms)
```

Each HTTP request is assigned a unique `request_id` (8-character hex). The ID is also returned in the `X-Request-ID` response header.

**Log levels** are controlled by the `LOG_LEVEL` environment variable (`DEBUG`, `INFO`, `WARNING`, `ERROR`).

**Security:** Sensitive values — API keys, JWT tokens, passwords, SECRET_KEY — are **never** logged.

The `logs/` directory is listed in `.gitignore` and will not be committed.

---

## Testing

### Run all tests

```bash
# Windows
venv\Scripts\python.exe -m pytest tests/ -v

# macOS / Linux
python -m pytest tests/ -v
```

### Run with coverage

```bash
venv\Scripts\python.exe -m pytest tests/ --cov=app
```

### Run a specific file

```bash
venv\Scripts\python.exe -m pytest tests/test_astrology.py -v
```

### Test design

| Principle | Implementation |
|-----------|---------------|
| Isolated database | Each test function gets a fresh transactional session, rolled back after |
| Mocked external API | `conftest.py` provides `mock_navamsha_kundali` — no real API calls in tests |
| No real credentials needed | Tests work without a real API key |
| 60 tests across 7 files | Authentication, RBAC, astrology, admin, astrologer, health, error handling |

### What is tested

- User registration — success, duplicate username, duplicate email, invalid email, short password, long password
- Login — success, wrong password, nonexistent user
- JWT authentication — missing token, invalid token
- Role-based access control — user / astrologer / admin restrictions
- Reading creation — success (`201`), unauthenticated (`401`), invalid dates, invalid coordinates
- Reading history — pagination structure, empty pages, moon_sign filter, sort validation
- User isolation — User A cannot see User B's readings
- Astrologer review — queue access, note creation, filter by review status, sort validation
- Admin — user list, search, pagination, role update, invalid role, password_hash not leaked
- Health — liveness, readiness, unauthenticated access
- Error handling — timeout, rate limit, secret/traceback leakage prevention

---

## Security

| Practice | Implementation |
|----------|---------------|
| Password hashing | Argon2 (via `pwdlib`) — computationally expensive, salted |
| JWT authentication | HS256 with configurable secret, 60-minute expiry |
| Role-based authorization | Enforced at route level via `require_roles()` dependency |
| Secret storage | All secrets in `.env`, loaded via `python-dotenv` |
| `.env` git-ignored | `.gitignore` excludes `.env` from version control |
| No hardcoded secrets | API key, SECRET_KEY loaded from environment only |
| Response sanitization | `password_hash` is never included in any API response |
| Error sanitization | Stack traces, file paths, and internal details never returned |
| No secret logging | Sensitive values explicitly excluded from all log messages |
| Input validation | Pydantic v2 validates all request fields with strict type and range checks |
| SQL injection safety | All queries use SQLAlchemy parameterised methods (`.filter()`, `.ilike()`) |
| External API timeout | Configurable via `ASTROLOGY_API_TIMEOUT` (default: 15 seconds) |
| Sole-admin protection | Cannot demote the last remaining admin user |

---

## Git Hygiene

### Files that must NEVER be committed

```
.env                 ← API keys, JWT secret
astro_teller.db      ← database with user data
logs/                ← application logs
__pycache__/         ← compiled bytecode
venv/                ← virtual environment
test_astro_teller.db ← test database artefact
```

All of the above are included in `.gitignore`.

### Basic workflow

```bash
git status                        # check what has changed
git add .                         # stage changes
git commit -m "feat: add feature" # commit with a meaningful message
git push                          # push to remote
```

### Commit message conventions (recommended)

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring |
| `test:` | Test changes |
| `docs:` | Documentation |
| `chore:` | Tooling, config, dependencies |

---

## Utility Scripts

### Create or promote an admin user

```bash
python scripts/create_admin.py
```

Interactive prompts guide you through creating a new admin user or promoting an existing registered user to the admin role. Useful for first-time setup when there is no admin yet.

---

## Future Improvements

The following are planned enhancements — **not currently implemented**:

- **PostgreSQL** — replace SQLite for production-grade persistence
- **Docker** — containerise the application for portable deployment
- **CI/CD** — GitHub Actions for automated test runs and deployment
- **React / Next.js frontend** — user-facing interface for the API
- **Redis caching** — cache astrology readings to reduce external API calls
- **Background jobs** — Celery for asynchronous reading generation
- **Richer interpretation engine** — deeper chart analysis (house placements, aspects)
- **AI-assisted interpretation** — LLM integration for personalized narrative readings
- **Rate limiting** — per-user/per-IP limits on reading generation
- **Refresh tokens** — longer sessions without re-login
- **Email verification** — verify email on registration
- **Production deployment** — cloud hosting (Railway, Render, AWS, etc.)
- **Monitoring** — structured metrics, health dashboards

---

## License

This project is licensed under the terms in the [LICENSE](LICENSE) file.

---

## Disclaimer

AstroTeller is an educational and entertainment-oriented software project.

Astrology interpretations provided by this application are presented for entertainment and personal self-reflection purposes only. They are **not** scientifically validated, and should not be treated as professional advice — medical, psychological, financial, or otherwise.

---

*Built with Python, FastAPI, and a touch of cosmic curiosity.*
