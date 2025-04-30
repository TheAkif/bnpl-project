from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Installment, PaymentPlan, User
from .serializers import (InstallmentSerializer, PaymentPlanSerializer,
                          UserSerializer, UserSignupSerializer)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def merchant_analytics(request):
    merchant = request.user

    # all plans for this merchant
    plans_qs = PaymentPlan.objects.filter(merchant=merchant)
    inst_qs = Installment.objects.filter(plan__in=plans_qs)

    total_plans = plans_qs.count()

    # 1) total revenue = sum of all paid installments
    total_revenue = (
        inst_qs.filter(status=Installment.STATUS_PAID).aggregate(total=Sum("amount"))[
            "total"
        ]
        or 0
    )

    # 2) overdue plans = count of distinct plans with any late installment
    overdue_plans = (
        plans_qs.filter(installments__status=Installment.STATUS_LATE).distinct().count()
    )

    # 3) success rate = paid installments / total installments * 100
    totals = inst_qs.aggregate(
        total=Count("id"), paid=Count("id", filter=Q(status=Installment.STATUS_PAID))
    )
    total_inst = totals["total"] or 0
    paid_inst = totals["paid"] or 0
    success_rate = round(paid_inst / total_inst * 100, 2) if total_inst else 0

    return Response(
        {
            "total_plans": total_plans,
            "total_revenue": total_revenue,
            "overdue_plans": overdue_plans,
            "success_rate": success_rate,
        }
    )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(UserSerializer(request.user).data)


class SignupView(generics.CreateAPIView):
    """
    Public endpoint for new users (merchants or customers) to register.
    """

    serializer_class = UserSignupSerializer
    permission_classes = [permissions.AllowAny]


class IsMerchant(permissions.BasePermission):
    def has_permission(self, req, view):
        return req.user.role == req.user.MERCHANT


class PlanViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == user.MERCHANT:
            return PaymentPlan.objects.filter(merchant=user)
        return PaymentPlan.objects.filter(customer=user)

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated(), IsMerchant()]
        return super().get_permissions()


class InstallmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Installment.objects.all()
    serializer_class = InstallmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        """
        Pay a BNPL installment in strict sequence.

        This endpoint allows the plan's customer to pay the next unpaid installment.
        It enforces:
          - Ownership: only the plan.customer may pay.
          - Idempotency: cannot pay an installment already marked "paid".
          - Completeness: there must be at least one unpaid installment.
          - Order: the requested installment must be the next pending (or late) one.

        On success, the installment's status is updated to 'paid' and paid_at is set
        to the current timestamp, then the updated installment is returned.

        Raises:
            serializers.ValidationError: if any of the above validations fail.
        """

        serializer = self.get_serializer(data={})
        serializer.is_valid(raise_exception=True)

        inst = get_object_or_404(Installment, pk=pk)

        inst.status = Installment.STATUS_PAID
        inst.paid_at = timezone.now()
        inst.save()

        return Response(self.get_serializer(inst).data)
