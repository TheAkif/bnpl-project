from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    MERCHANT = "merchant"
    CUSTOMER = "customer"
    ROLE_CHOICES = [(MERCHANT, "Merchant"), (CUSTOMER, "Customer")]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)


class PaymentPlan(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_COMPLETED = "completed"
    STATUS_CHOICES = [(STATUS_ACTIVE, "Active"), (STATUS_COMPLETED, "Completed")]

    merchant = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="plans_created"
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="plans")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    num_installments = models.PositiveIntegerField()
    start_date = models.DateField()
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default=STATUS_ACTIVE
    )
    # currency = models.CharField() # In future if needed to support multi-currency support.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plan #{self.id} ({self.total_amount} over {self.num_installments})"


class Installment(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_LATE = "late"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_LATE, "Late"),
    ]

    plan = models.ForeignKey(
        PaymentPlan, on_delete=models.CASCADE, related_name="installments"
    )
    sequence = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING
    )
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("plan", "sequence")
        ordering = ["sequence"]

    def __str__(self):
        return f"Inst#{self.sequence} of Plan#{self.plan_id}: {self.status}"
