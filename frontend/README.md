# AstroTeller 🔮 — Frontend

The modern React + Vite + TypeScript web interface for AstroTeller.

## Features

- **Cosmic SaaS UI**: Glassmorphism, deep dark mode, responsive layout, micro-interactions.
- **Authentication & RBAC**: JWT Bearer token management with role guards (`user`, `astrologer`, `admin`).
- **Kundali Reading Generator**: Comprehensive birth info input form with city coordinate presets and live date validation.
- **Structured Reading View**: Categorized breakdown of Sun, Moon, Nakshatra, and Ascendant interpretations.
- **Reading History**: Paginated previous readings with Moon sign filtering and sorting.
- **Astrologer Review Portal**: Pending review queue and interactive note authoring.
- **Admin Management Portal**: Searchable user directory with role promotion/demotion and sole-admin protection.

## Development Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Testing & Build

```bash
# Run unit & integration tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```
