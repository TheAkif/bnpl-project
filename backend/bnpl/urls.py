from rest_framework.routers import DefaultRouter

from .views import InstallmentViewSet, PlanViewSet

router = DefaultRouter()
router.register(r"plans", PlanViewSet, basename="plan")
router.register(r"installments", InstallmentViewSet, basename="installment")

urlpatterns = router.urls
