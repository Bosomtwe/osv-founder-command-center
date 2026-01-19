# OSV Founder Command Center

A personal operations dashboard for founders to manage tasks, clients, workers, analytics, and more.

## Features
- Task CRUD + quick status updates
- Client & Worker management
- Global search
- Analytics charts
- CSV export
- Responsive design (mobile-friendly)

## Tech Stack
- Backend: Django + Django REST Framework
- Frontend: React
- Charts: Chart.js
- Deployment-ready (Vercel + Render/Fly.io)

## Setup
```bash
# Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
cd frontend
npm install
npm start