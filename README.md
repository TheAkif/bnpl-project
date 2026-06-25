# BNPL Payment Plan Simulator

A full-stack Buy Now, Pay Later demo where merchants create installment plans and customers pay them off on a structured schedule.

---

## Project Structure

```text
bnpl-project/
├── backend/
├── bnpl-frontend/
└── README.md
```

---

## Tech Stack

### Backend

| Layer | Technology |
| --- | --- |
| Language | Python 3.12 |
| Framework | Django 4.2 · Django REST Framework |
| Auth | SimpleJWT (access + refresh tokens) |
| Database | PostgreSQL |
| Task Queue | Celery + django-celery-beat |
| Config | django-environ (`.env` file) |

### Frontend

| Layer | Technology |
| --- | --- |
| Framework | React 19 · Vite 6 |
| Styling | Tailwind CSS |
| Routing | React Router DOM 7 |
| HTTP | Axios (auto-injects JWT) |
| Charts | Chart.js · react-chartjs-2 |
| Calendar | react-calendar |
| Notifications | react-toastify |

---

## Features

- **Merchants** — create payment plans, split purchases into monthly installments, view analytics (revenue, overdue plans, success rate)
- **Customers** — view plans on a calendar or table, pay installments in sequence
- **Celery tasks** — automatically mark installments late when overdue, send due-date reminders 3 days ahead
- **Signals** — auto-complete a plan when all its installments are paid

---

## API Endpoints

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/signup/` | Register a new user | Public |
| `POST` | `/api/login/` | Login — returns JWT + user data | Public |
| `POST` | `/api/token/refresh/` | Refresh access token | Public |
| `GET/POST` | `/api/plans/` | List or create payment plans | Authenticated |
| `GET/PUT/DELETE` | `/api/plans/{id}/` | Retrieve, update, or delete a plan | Authenticated |
| `GET` | `/api/installments/` | List installments | Authenticated |
| `POST` | `/api/installments/{id}/pay/` | Pay the next installment in sequence | Customer only |
| `GET` | `/api/analytics/` | Merchant revenue and overdue stats | Merchant only |

---

## Getting Started

### Prerequisites

- Python 3.12
- Node.js 18+
- PostgreSQL
- Redis (Celery broker)

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file and fill in your values
cp .env.example .env

# Run migrations
python manage.py migrate

# Seed Celery periodic tasks
python manage.py seed_celery_tasks

# Start the dev server
python manage.py runserver

# In separate terminals — start Celery worker and beat scheduler
python -m celery -A bnpl_project worker -l info
python -m celery -A bnpl_project beat -l info
```

#### Required `.env` variables

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_NAME=bnpl_db
DATABASE_USER=postgres
DATABASE_USER_PASSWORD=yourpassword
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### Frontend

```bash
cd bnpl-frontend

npm install
npm run dev
```

### Access

| Service | URL |
| --- | --- |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |
| Frontend | http://localhost:5173/ |

---

## User Roles

| Role | Capabilities |
| --- | --- |
| **Merchant** | Create and manage payment plans, view analytics |
| **Customer** | View assigned plans, pay installments in order |
