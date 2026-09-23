# ─────────────────────────────────────────────────────────────────────────────
# AstroTeller — Dockerfile
# ─────────────────────────────────────────────────────────────────────────────
# Uses a slim Python 3.11 image to keep the final image small.
# "slim" means it contains only the minimal OS packages needed to run Python.
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Prevent Python from writing .pyc files to disk (they're not needed in a
# container — we have no reason to cache bytecode between runs).
ENV PYTHONDONTWRITEBYTECODE=1

# Prevent Python from buffering stdout/stderr. This ensures log messages
# appear immediately in `docker compose logs` rather than being held in a buffer.
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container.
# All subsequent COPY, RUN, and CMD instructions are relative to this path.
WORKDIR /app

# ── Install dependencies ────────────────────────────────────────────────────
# Copy requirements first — before the application code — so that Docker can
# cache this layer. If only source code changes, Docker reuses the cached
# pip-install layer and does not re-download packages.
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ── Copy application source code ─────────────────────────────────────────────
# Copied after pip install to take advantage of Docker layer caching.
# .dockerignore prevents .env, venv/, __pycache__, *.db, logs/ from being
# copied into the image.
COPY app/ ./app/
COPY astrology_book/ ./astrology_book/
COPY scripts/ ./scripts/

# ── Create data and logs directories ─────────────────────────────────────────
# The data/ directory will hold the SQLite database file.
# The logs/ directory will hold rotating log files.
# Both are mounted as Docker volumes at runtime, so they persist between
# container restarts. We create them here so the container starts cleanly
# even if the volume mount hasn't been created yet.
RUN mkdir -p /app/data /app/logs

# ── Expose the application port ──────────────────────────────────────────────
# EXPOSE is informational — it documents which port the application listens on.
# The actual port binding is done in docker-compose.yml.
EXPOSE 8000

# ── Start the application ─────────────────────────────────────────────────────
# Important differences from local development:
#   --host 0.0.0.0  → listen on ALL network interfaces, not just 127.0.0.1.
#                     Required inside Docker so the host machine can reach it.
#   --port 8000     → explicit port binding.
#   NO --reload     → hot-reload requires the source code to be on the host.
#                     In a container, the code is baked in. Reload is not
#                     appropriate for a production-style container.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
