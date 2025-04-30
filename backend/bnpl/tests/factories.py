import factory
from django.utils import timezone

from bnpl.models import Installment, PaymentPlan, User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda u: f"{u.username}@example.com")
    password = factory.PostGenerationMethodCall("set_password", "defaultpass")
    role = User.CUSTOMER

    @classmethod
    def _after_postgeneration(cls, instance, create, results=None):
        super()._after_postgeneration(instance, create, results)
        instance.save()


class MerchantFactory(UserFactory):
    role = User.MERCHANT


class PaymentPlanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PaymentPlan
        skip_postgeneration_save = True

    merchant = factory.SubFactory(MerchantFactory)
    customer = factory.SubFactory(UserFactory)
    total_amount = 1000
    num_installments = 4
    start_date = factory.LazyFunction(timezone.now)

    @classmethod
    def _after_postgeneration(cls, instance, create, results=None):
        super()._after_postgeneration(instance, create, results)
        instance.save()


class InstallmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Installment
        skip_postgeneration_save = True

    plan = factory.SubFactory(PaymentPlanFactory)
    sequence = factory.Sequence(lambda n: n + 1)
    amount = factory.LazyAttribute(
        lambda obj: obj.plan.total_amount / obj.plan.num_installments
    )
    due_date = factory.LazyAttribute(lambda obj: obj.plan.start_date)
    status = Installment.STATUS_PENDING

    @classmethod
    def _after_postgeneration(cls, instance, create, results=None):
        super()._after_postgeneration(instance, create, results)
        instance.save()
