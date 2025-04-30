import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bnpl_project.settings')

app = Celery('bnpl_project')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Setting up timezone for Riyadh/Asia.
app.conf.enable_utc = True
app.conf.timezone = 'Asia/Riyadh'
