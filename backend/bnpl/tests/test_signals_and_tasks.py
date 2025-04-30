# import pytest
# from rest_framework.test import APIClient
# from bnpl.tests.factories import MerchantFactory, UserFactory
# from bnpl.tasks import mark_overdue_installments, send_due_reminders
# from datetime import timedelta
# from django.utils import timezone

# @pytest.fixture
# def api_client():
#     return APIClient()

# @pytest.fixture
# def merchant_token(api_client, db):
#     merchant = MerchantFactory()
#     resp = api_client.post('/api/token/', {
#         'username': merchant.username,
#         'password': 'defaultpass'
#     })
#     return resp.data['access'], merchant

# @pytest.fixture
# def customer_token(api_client, db):
#     user = UserFactory()
#     resp = api_client.post('/api/token/', {
#         'username': user.username,
#         'password': 'defaultpass'
#     })
#     return resp.data['access'], user

# @pytest.mark.django_db
# def test_signals_mark_plan_completed(api_client, merchant_token, customer_token):
#     m_token, merchant = merchant_token
#     c_token, customer = customer_token
#     api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {m_token}')
#     create = api_client.post('/api/plans/', {
#         "customer": customer.id,
#         "total_amount": "200.00",
#         "num_installments": 2,
#         "start_date": "2025-04-01"
#     }, format='json')
#     plan = create.json()
#     inst_ids = [i['id'] for i in plan['installments']]

#     api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {c_token}')
#     for inst_id in inst_ids:
#         resp = api_client.post(f'/api/installments/{inst_id}/pay/')
#         assert resp.status_code == 200

#     api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {m_token}')
#     resp = api_client.get(f'/api/plans/{plan["id"]}/')
#     assert resp.status_code == 200
#     assert resp.json()['status'] == 'completed'

# @pytest.mark.django_db
# def test_mark_overdue_installments_task(db):
#     from bnpl.models import Installment
#     inst = Installment.objects.create(
#         plan=None,  # plan not needed for this test
#         sequence=1,
#         amount=100,
#         due_date=timezone.now().date() - timedelta(days=1),
#         status=Installment.STATUS_PENDING
#     )
#     # Run task
#     mark_overdue_installments()
#     inst.refresh_from_db()
#     assert inst.status == Installment.STATUS_LATE

# @pytest.mark.django_db
# def test_send_due_reminders_task(capsys, db):
#     from bnpl.models import Installment
#     due_in_3 = Installment.objects.create(
#         plan=None,
#         sequence=1,
#         amount=50,
#         due_date=timezone.now().date() + timedelta(days=3),
#         status=Installment.STATUS_PENDING
#     )
#     due_in_5 = Installment.objects.create(
#         plan=None,
#         sequence=2,
#         amount=75,
#         due_date=timezone.now().date() + timedelta(days=5),
#         status=Installment.STATUS_PENDING
#     )
#     send_due_reminders()
#     captured = capsys.readouterr().out
#     assert f"Reminder: installment {due_in_3.id}" in captured
#     assert f"Reminder: installment {due_in_5.id}" not in captured
