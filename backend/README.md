# BNPL Application - Quick Start Guide

## Prerequisites

- **Python 3.12** installed. Download from https://www.python.org/downloads/.
- **pip**, included with Python.
- **Redis** for Celery broker:  
  - Ubuntu/Debian: `sudo apt install redis-server`  
  - macOS (Homebrew): `brew install redis`  
- **PostgreSQL** installed and running.

## Setup Steps

1. **Clone the repository**  
   ```bash
   git clone REPO
   cd bnpl_project
   ```

2. **Create & activate virtual environment**  
   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate      # Linux/macOS
   .venv\Scripts\activate         # Windows
   ```

3. **Install project dependencies**  
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**  
   Create a `.env` file (or export directly):
   ```
   SECRET_KEY='django-insecure-p^g+u#+z4d=52y1ux%zh29g%vk$5aq79njle=rk4eenrxn4n@8'
   DJANGO_SETTINGS_MODULE=bnpl_project.settings
   DATABASE_URL=postgres://user:password@localhost:5432/bnpl
   REDIS_URL=redis://localhost:6379/0
   DATABASE_NAME=bnpl_db
   DATABASE_USER=bnpl_user
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER_PASSWORD='123!@#qwE'
   DEBUG=True
   ```

5. **Run database migrations**  
   ```bash
   python manage.py migrate
   ```

Note: After running migration. Run this django command to seed the celery tasks(mark_overdue_installments & send_due_reminders):
   ```bash
   python manage.py seed_celery_tasks
   ```

6. **Create superuser**  
   ```bash
   python manage.py createsuperuser
   ```
It will prompt you to add username, email and password. Make sure you remember the password and email/username.
Using this superuser django-admin can be accessed.

7. **Create example users (optional)**  
   ```bash
   python manage.py shell
   >>> from bnpl.models import User
   >>> User.objects.create_user(username='merchant1', email='m1@example.com', password='pass', role='merchant')
   >>> User.objects.create_user(username='customer1', email='c1@example.com', password='pass', role='customer')
   >>> exit()
   ```

9. **Start Celery worker & beat**  
   ```bash
   celery -A bnpl_project worker --loglevel=info
   celery -A bnpl_project beat  --loglevel=info
   ```

Note: Sometimes celery work do not start using this command, so, usually I use `python -m celery -A bnpl_project beat -l info` to run the workers.

10. **Launch development server**  
    ```bash
    python manage.py runserver
    ```

Backend API will be accessible at `http://127.0.0.1:8000/api/`.  
