import math
from datetime import date, timedelta

from dateutil.relativedelta import relativedelta
from django.contrib.auth import get_user_model
from django.utils.dateparse import parse_date
from rest_framework import serializers

from .models import Installment, PaymentPlan

User = get_user_model()


class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = ["id", "sequence", "amount", "due_date", "status", "paid_at"]
        read_only_fields = ["status", "paid_at", "sequence", "amount", "due_date"]

    def validate(self, attrs):
        inst = self.context["view"].get_object()
        user = self.context["request"].user

        if inst.plan.customer != user:
            raise serializers.ValidationError("You can only pay your own installments.")

        if inst.status == Installment.STATUS_PAID:
            raise serializers.ValidationError("This installment is already paid.")

        unpaid = inst.plan.installments.filter(
            status__in=[Installment.STATUS_PENDING, Installment.STATUS_LATE]
        ).order_by("sequence")

        if not unpaid.exists():
            raise serializers.ValidationError("All installments are already paid.")

        next_unpaid = unpaid.first()

        if inst.id != next_unpaid.id:
            raise serializers.ValidationError(
                f"You must pay installment #{next_unpaid.sequence} of this plan first."
            )

        return attrs


class PaymentPlanSerializer(serializers.ModelSerializer):
    installments = InstallmentSerializer(many=True, read_only=True)
    customer_email = serializers.EmailField(write_only=True)

    class Meta:
        model = PaymentPlan
        fields = [
            "id",
            "merchant",
            "customer_email",
            "total_amount",
            "num_installments",
            "start_date",
            "status",
            "installments",
        ]
        read_only_fields = ["id", "merchant", "status", "installments"]

    def update(self, instance, validated_data):
        if instance.installments.filter(status="paid").exists():
            raise serializers.ValidationError(
                "Cannot modify a plan with paid installments."
            )
        return super().update(instance, validated_data)

    def get_installments(self, plan):
        return InstallmentSerializer(plan.installments.all(), many=True).data

    def validate(self, attrs):
        merchant = self.context["request"].user

        email = attrs.pop("customer_email")
        # import pdb
        # pdb.set_trace()
        try:
            customer = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"customer_email": f"No user found with email {email}."}
            )

        if merchant == customer:
            raise serializers.ValidationError(
                "Merchant and customer must be different users."
            )

        attrs["customer"] = customer

        if attrs["start_date"] < date.today():
            raise serializers.ValidationError(
                {"start_date": "Start date cannot be in the past."}
            )

        if attrs["num_installments"] <= 1:
            raise serializers.ValidationError(
                {"num_installments": "Number of installments must at least be 2."}
            )
        if attrs["total_amount"] <= 100 or attrs["total_amount"] >= 10000:
            raise serializers.ValidationError(
                {
                    "total_amount": "To use BNPL service the purchase amount should at least be SAR100 or utmost be SAR10000."
                }
            )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        merchant = request.user
        customer = validated_data.pop("customer")
        total = validated_data["total_amount"]
        n = validated_data["num_installments"]
        start = validated_data["start_date"]

        plan = PaymentPlan.objects.create(
            merchant=merchant,
            customer=customer,
            total_amount=total,
            num_installments=n,
            start_date=start,
        )

        # Generation of installments with "num_installments" equal portions.
        total = plan.total_amount
        n = plan.num_installments
        base = (total / n).quantize(total)
        remainder = total - (base * n)
        for i in range(1, n + 1):
            amt = base + (remainder if i == n else 0)

            """
            Scenario 01:

            This is for the use case that next date is calculated based on number of days. 
            Installments are due after every 30 days.
            """
            # due = plan.start_date + timedelta(days=30 * (i - 1))

            """
            Scenario 02:
            
            This is for the use case that next date is calculated based on end of month. 
            Installments are due after every 30 days and if the date like 31st is not in next month, next payment due date would fall on end of month.
            """
            due = plan.start_date + relativedelta(months=(i - 1))
            Installment.objects.create(plan=plan, sequence=i, amount=amt, due_date=due)
        return plan


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the custom User model, exposing only safe fields.
    """

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "first_name", "last_name")
        read_only_fields = fields


class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "role", "first_name", "last_name", "password")

    def create(self, validated_data):
        raw_password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(raw_password)
        user.save()
        return user
