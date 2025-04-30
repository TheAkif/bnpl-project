# bnpl/tests/test_installments_api.py
from datetime import date

import pytest
from rest_framework.test import APIClient

from bnpl.tests.factories import MerchantFactory, UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def merchant_token(api_client, db):
    merchant = MerchantFactory()
    resp = api_client.post(
        "/api/token/", {"username": merchant.username, "password": "defaultpass"}
    )
    return resp.data["access"], merchant


@pytest.fixture
def customer_token(api_client, db):
    user = UserFactory()
    resp = api_client.post(
        "/api/token/", {"username": user.username, "password": "defaultpass"}
    )
    return resp.data["access"], user


@pytest.mark.django_db
def test_customer_can_pay_installment_and_status_updates(
    api_client, merchant_token, customer_token
):
    # Merchant creates plan
    m_token, merchant = merchant_token
    c_token, customer = customer_token
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {m_token}")
    create = api_client.post(
        "/api/plans/",
        {
            "customer": customer.id,
            "total_amount": "400.00",
            "num_installments": 2,
            "start_date": "2025-05-01",
        },
        format="json",
    )
    plan = create.json()
    inst = plan["installments"][0]
    inst_id = inst["id"]

    # Customer pays first installment
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {c_token}")
    pay_resp = api_client.post(f"/api/installments/{inst_id}/pay/")
    assert pay_resp.status_code == 200
    paid = pay_resp.json()
    assert paid["status"] == "paid"
    assert paid["paid_at"] is not None

    # Attempt to pay again fails
    second = api_client.post(f"/api/installments/{inst_id}/pay/")
    assert second.status_code == 400


@pytest.mark.django_db
def test_cannot_pay_other_users_installment(api_client, merchant_token, customer_token):
    # Set up one plan/customer
    m_token, merchant = merchant_token
    c_token, customer = customer_token
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {m_token}")
    create = api_client.post(
        "/api/plans/",
        {
            "customer": customer.id,
            "total_amount": "600.00",
            "num_installments": 3,
            "start_date": "2025-05-01",
        },
        format="json",
    )
    plan = create.json()
    inst_id = plan["installments"][0]["id"]

    # Another unrelated user
    other = UserFactory()
    resp = api_client.post(
        "/api/token/", {"username": other.username, "password": "defaultpass"}
    )
    other_token = resp.json()["access"]

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token}")
    resp = api_client.post(f"/api/installments/{inst_id}/pay/")
    assert resp.status_code == 403
