# BNPL Payment Plan Simulator

A two‐part full-stack demo for “Buy Now, Pay Later” plans:

- **Merchants** can split a purchase into installments.  
- **Customers** can view and pay installments on a calendar/table UI.  
- Includes automated overdue marking, mock email reminders, and analytics.

---

## Repository Layout

bnpl_project/ 

├─ backend/ # Django + DRF + Celery + PostgreSQL 

├─ bnpl-frontend/ # React + Vite + Chart.js + React Calendar 

└─ README.md


---

## Backend

- **Frameworks**: Python 3.12, Django 4.2, Django REST Framework  
- **Auth**: JWT via SimpleJWT  
- **Database**: PostgreSQL (configured via django-environ)  
- **Tasks**: Celery + django-celery-beat for:
  - Marking installments late when overdue  
  - Sending "due in 3 days" reminders  
- **Signals**: Update plan status when all installments are paid  
- **Endpoints**:
  - `POST /api/signup`, `POST /api/token/`, `POST /api/login`
  - `CRUD /api/plans/` (merchant only)  
  - `POST /api/installments/{id}/pay/`  
  - `GET /api/analytics/`  

See **`backend/README.md`** for setup, migrations, env vars, Celery, etc.

---

## Frontend

- **Tooling**: React 18 + Vite (Used Vite for fast development)
- **Routing**: React Router DOM  
- **HTTP**: Axios with a shared API client (auto-injects JWT)  
- **UI**:
  - Custom CSS (no Tailwind)  
  - Calendar view via `react-calendar`  
  - Toasts via `react-toastify`  
  - Charts via `react-chartjs-2`  
- **Pages**:
  - **Login/Signup** with role-based redirects.
  - **Merchant Dashboard**: create plans, view cards, analytics tabs.
  - **User Dashboard**: calendar + table, accordion per plan.

See **`bnpl-frontend/README.md`** for install & run instructions.

---

## Getting Started

1. **Clone** this repo  

2. **Backend**  
```bash
   cd backend
   pip install -r requirements.txt
   touch .env # set DATABASE_URL, SECRET_KEY, CELERY_*
   python manage.py migrate
   python manage.py runserver
   celery -A bnpl_project worker -l info
   celery -A bnpl_project beat -l info
```

Note: Sometimes celery work do not start using this command, so, usually I use `python -m celery -A bnpl_project beat -l info` to run the workers.

3. **Frontend**

```bash
cd ../bnpl-frontend
npm install
npm run dev
```

4. **Browse**

 - Backend API at http://localhost:8000/api/
 - Frontend at http://localhost:5173/
