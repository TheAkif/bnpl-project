# BNPL Application - Testing Setup Guide

This guide explains how to configure and run automated tests for the BNPL backend using Django, pytest, and factory_boy.

## 1. Prerequisites

- **Python 3.12** installed  
- **pip** (comes with Python)  
- **Virtual environment** tool (venv)  
- **PostgreSQL** (for the main database; tests use a separate test database created automatically)  

## 2. Install Test Dependencies

Activate your virtual environment and install:

```bash
pip install pytest pytest-django factory_boy coverage
```

## 3. Configure pytest

Create a `pytest.ini` in your project root:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = bnpl_project.settings
python_files = tests.py test_*.py *_tests.py
```

> **Note:** pytest-django will automatically create a test database named `test_<YOUR_DB_NAME_FROM_DJANGO_SETTINGS>` and destroy it after the test run.


## 6. Run Tests

From the project root, run:

```bash
pytest --cov=bnpl
```

- **Coverage report** will show test coverage.
- A separate test database `test_<dbname>` is created at start and destroyed when tests complete.

---

Your test suite will now run in an isolated environment, using factories to generate data, and automatically tear down the test database afterward.


## Test Coverage

These tests cover:

**Plan API:** creation, permission enforcement, automatic installment generation, listing by role.
**Installment API:** paying, double-pay prevention, unauthorized access.
**Signals:** plan status flips to “completed” once all paid.
**Tasks:** overdue marking and due-date reminders.