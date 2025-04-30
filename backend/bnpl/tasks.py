from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from .models import Installment


@shared_task
def mark_overdue_installments():
    today = timezone.now().date()
    late = Installment.STATUS_LATE
    pending = Installment.STATUS_PENDING
    qs = Installment.objects.filter(status=pending, due_date__lt=today)
    qs.update(status=late)


@shared_task
def send_due_reminders():
    """
    Send a reminder for every pending installment whose due date
    is within the next 3 days (i.e. due in 1, 2 or 3 days).
    """

    today = timezone.now().date()
    start = today + timedelta(days=1)
    end = today + timedelta(days=3)

    installments = Installment.objects.filter(
        status=Installment.STATUS_PENDING,
        due_date__gte=start,
        due_date__lte=end,
    )

    for inst in installments:
        days_left = (inst.due_date - today).days
        # Mocking email sending due to time constraint.
        print(
            f"Reminder: installment {inst.id} for plan {inst.plan_id} "
            f"is due on {inst.due_date} (in {days_left} days)"
        )
