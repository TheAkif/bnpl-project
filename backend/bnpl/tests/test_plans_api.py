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
def test_merchant_can_create_plan_and_installments(api_client, merchant_token):
    """
    This function is to test the creation of plan by merchant
    and auto generating of "num_installments" number of installments.

    This test case covers:
        - Creation of plan.
        - Assertion of plan data.
        - Assertion of number of installments.
        - Assertion of sum of all installments with total_amount.

    """

    token, merchant = merchant_token
    customer = UserFactory()
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    payload = {
        "customer": customer.id,
        "total_amount": "1000.00",
        "num_installments": 4,
        "start_date": "2025-06-01",
    }
    resp = api_client.post("/api/plans/", payload, format="json")
    assert resp.status_code == 201
    data = resp.json()
    assert data["merchant"] == merchant.id
    assert data["customer"] == customer.id
    assert data["total_amount"] == "1000.00"
    assert data["num_installments"] == 4
    assert data["status"] == "active"

    insts = data["installments"]
    assert len(insts) == 4

    amounts = [float(i["amount"]) for i in insts]
    assert sum(amounts) == pytest.approx(1000.00, rel=1e-3)


@pytest.mark.django_db
def test_only_merchants_can_create_plans(api_client, customer_token):
    """
    This function tests whether only merchants can create plans or not.
    Asserts that a customer cannot create a plan.

    The test covers:
        - Customer is created.
        - Using the token of Customer a plan is created.
        - Receive 403(Forbidden).
    """

    token, customer = customer_token
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    payload = {
        "customer": customer.id,
        "total_amount": "500.00",
        "num_installments": 2,
        "start_date": "2025-07-01",
    }
    resp = api_client.post("/api/plans/", payload, format="json")
    assert resp.status_code == 403


@pytest.mark.django_db
def test_list_plans_filters_by_user_role(api_client, merchant_token, customer_token):
    """
    This function tests the listing of plans for different user and the merchant himself.

    Test covers:
        - One merchant is created.
        - Two users are created.
        - Using the merchant credentials, two plans are created.
        - One for first customer and one for second customer.
        - Merchant should see both the plans in his "plans listing".
        - Login using customer credentials.
        - In plans listing, there should only be, one, assigned plan.
    """

    m_token, merchant = merchant_token
    c_token, customer = customer_token

    other_customer = UserFactory()
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {m_token}")
    resp1 = api_client.post(
        "/api/plans/",
        {
            "customer": customer.id,
            "total_amount": "200.00",
            "num_installments": 2,
            "start_date": "2025-08-01",
        },
        format="json",
    )
    resp2 = api_client.post(
        "/api/plans/",
        {
            "customer": other_customer.id,
            "total_amount": "300.00",
            "num_installments": 3,
            "start_date": "2025-08-01",
        },
        format="json",
    )
    assert resp1.status_code == 201
    assert resp2.status_code == 201

    resp = api_client.get("/api/plans/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {c_token}")
    resp = api_client.get("/api/plans/")
    assert resp.status_code == 200
    plans = resp.json()
    assert len(plans) == 1
    assert plans[0]["customer"] == customer.id

    # other_customer_token, other_customer = other_customer

    # api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {c_token}')
    # resp = api_client.get('/api/plans/')
    # assert resp.status_code == 200
    # plans = resp.json()
    # assert len(plans) == 1
    # assert plans[0]['customer'] == customer.id
