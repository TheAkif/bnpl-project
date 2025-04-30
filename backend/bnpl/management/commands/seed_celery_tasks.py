from django.core.management.base import BaseCommand
from django_celery_beat.models import CrontabSchedule, PeriodicTask


class Command(BaseCommand):
    help = "Seed Celery-Beat periodic tasks for BNPL overdue & reminders"

    def handle(self, *args, **options):
        # Every day at 00:00.
        # Mark overdue installments.
        midnight, _ = CrontabSchedule.objects.get_or_create(
            minute="15", hour="0", day_of_week="*", day_of_month="*", month_of_year="*"
        )
        overdue_task, created = PeriodicTask.objects.get_or_create(
            name="Mark Overdue Installments",
            task="bnpl.tasks.mark_overdue_installments",
            defaults={"crontab": midnight, "enabled": True},
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Created Mark Overdue Installments"))

        # Every day at 08:00
        # Send reminders to upcoming payments.
        morning, _ = CrontabSchedule.objects.get_or_create(
            minute="0", hour="8", day_of_week="*", day_of_month="*", month_of_year="*"
        )
        reminder_task, created = PeriodicTask.objects.get_or_create(
            name="Send Due Reminders",
            task="bnpl.tasks.send_due_reminders",
            defaults={"crontab": morning, "enabled": True},
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Created Send Due Reminders"))
