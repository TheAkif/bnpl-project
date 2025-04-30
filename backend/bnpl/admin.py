from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Installment, PaymentPlan

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # if you added custom fields, list them here:
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "role", "password1", "password2"),
            },
        ),
    )
    search_fields = ("username", "email")
    ordering = ("username",)


@admin.register(PaymentPlan)
class PaymentPlanAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "merchant",
        "customer",
        "total_amount",
        "num_installments",
        "status",
        "start_date",
    )
    list_filter = ("status", "start_date")
    search_fields = ("merchant__username", "customer__username")
    date_hierarchy = "created_at"
    readonly_fields = ("status", "created_at")


@admin.register(Installment)
class InstallmentAdmin(admin.ModelAdmin):
    list_display = ("id", "plan", "sequence", "amount", "due_date", "status", "paid_at")
    list_filter = ("status", "due_date")
    search_fields = ("plan__id",)
    readonly_fields = ("sequence", "amount")
