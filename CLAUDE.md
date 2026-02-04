# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack CRM application with Django REST Framework backend and React frontend.

**Tech Stack:**
- Backend: Django 5.2 + Django REST Framework
- Frontend: React 19 + Vite + Tailwind CSS 4
- Database: PostgreSQL (Supabase in production, local Postgres for development)
- Drag & Drop: @dnd-kit for kanban pipeline

## Development Commands

### Backend (root directory)
```bash
python manage.py runserver           # Start dev server (port 8000)
python manage.py makemigrations      # Create migrations
python manage.py migrate             # Apply migrations
python manage.py dbshell             # Access database shell
```

### Frontend (crm-frontend/)
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Backend Structure
- `crm_backend/` - Django project configuration (settings, urls, wsgi)
- `core/` - Main Django app with models, views, serializers

### Data Models (core/models.py)
- **DealPhase** - Pipeline stages (name, color, order)
- **Account** - Companies/organizations
- **Contact** - People within accounts (belongs to Account)
- **Deal** - Sales opportunities (belongs to Account and DealPhase, has documents JSON field)
- **Activity** - Logged interactions (belongs to Account, Contact, and/or Deal)
- **Product** - Products/services that can be sold
- **DealProduct** - Junction table linking products to deals (with quantity, price)

### API Endpoints
All endpoints at `/api/`:
- `/accounts/`, `/contacts/`, `/deals/`, `/activities/`, `/deal-phases/`

### Frontend Structure (crm-frontend/src/)
- `App.jsx` - Main component with centralized state management (useState/useEffect)
- `api.js` - Axios configuration using VITE_API_URL
- `components/` - UI components:
  - `PipelineView.jsx` - Kanban board with @dnd-kit drag & drop
  - `DealModal.jsx`, `ContatcModal.jsx` - Detail/edit modals
  - `ActivityForm.jsx`, `ActivityLog.jsx` - Activity management

## Deployment

- Database: Supabase (free Postgres)
- Backend: Render.com (auto-deploys on push to main)
- Frontend: Vercel (auto-deploys on push to main)

Database migrations must be run manually against production after deploy by temporarily switching DATABASE_URL in settings.py to the cloud database.
