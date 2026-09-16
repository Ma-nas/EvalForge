"""
Tests for EvalForge Authentication Routes (/api/v1/auth)
"""

def test_register_and_login_flow(client):
    # 1. Register a new user
    register_payload = {
        "email": "mentor@evalforge.dev",
        "username": "evalmentor",
        "password": "Password123!",
    }
    res = client.post("/api/v1/auth/register", json=register_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "mentor@evalforge.dev"
    assert data["user"]["username"] == "evalmentor"

    token = data["access_token"]

    # 2. Prevent duplicate email registration
    res_dup = client.post("/api/v1/auth/register", json=register_payload)
    assert res_dup.status_code == 409

    # 3. Successful Login
    login_payload = {
        "email": "mentor@evalforge.dev",
        "password": "Password123!",
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # 4. Incorrect Password
    res_bad_pw = client.post("/api/v1/auth/login", json={"email": "mentor@evalforge.dev", "password": "wrongpassword"})
    assert res_bad_pw.status_code == 401

    # 5. Access /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "mentor@evalforge.dev"
