from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Installment, PaymentPlan


@receiver(post_save, sender=Installment)
def mark_plan_completed(sender, instance, **kwargs):
    plan = instance.plan
    if (
        plan.installments.filter(
            status__in=[Installment.STATUS_PENDING, Installment.STATUS_LATE]
        ).count()
        == 0
    ):
        plan.status = PaymentPlan.STATUS_COMPLETED
        plan.save()
