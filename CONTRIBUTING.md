# Contributing to AstroTeller

Thank you for your interest in contributing to AstroTeller!

This document explains how to set up your development environment,
run the test suite, and submit changes.

---

## Development Setup

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/astro-teller.git
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
# Edit .env with your Navamsha API key and a JWT secret
```

---

## Running the Application

```bash
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` to explore the API.

---

## Running Tests

The test suite does **not** require a real Navamsha API key. All external calls are mocked.

```bash
# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=app
```

All tests must pass before submitting a pull request.

---

## Branching

1. Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes.

3. Ensure tests pass:

```bash
python -m pytest tests/ -v
```

4. Commit with a meaningful message:

```bash
git commit -m "feat: describe your change clearly"
```

5. Push your branch and open a pull request against `main`.

---

## Commit Message Conventions

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring without behaviour change |
| `test:` | Adding or updating tests |
| `docs:` | Documentation changes |
| `chore:` | Tooling, config, dependencies |

---

## What Not to Commit

The following must **never** appear in a pull request:

- `.env` — secrets file
- `*.db` — database files
- `logs/` — log output
- `venv/` — virtual environment
- Any real API keys, JWT secrets, or passwords

---

## Code Style

- Follow the existing code style throughout the project.
- Use descriptive variable and function names.
- Add docstrings to public functions and modules.
- Keep functions focused — one responsibility per function.

---

## Questions

Open a GitHub Issue if you have questions or want to discuss a change before implementing it.
