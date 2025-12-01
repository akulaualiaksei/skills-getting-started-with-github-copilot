import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data

def test_signup_for_activity_success():
    response = client.post("/activities/Chess Club/signup", params={"email": "testuser@mergington.edu"})
    assert response.status_code == 200
    assert "Signed up testuser@mergington.edu for Chess Club" in response.json()["message"]
    # Clean up
    client.delete("/activities/Chess Club/participants/testuser@mergington.edu")

def test_signup_for_activity_already_signed_up():
    email = "michael@mergington.edu"
    response = client.post("/activities/Chess Club/signup", params={"email": email})
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up for this activity"

def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup", params={"email": "someone@mergington.edu"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_remove_participant_success():
    # Add a participant first
    email = "removeuser@mergington.edu"
    client.post("/activities/Chess Club/signup", params={"email": email})
    response = client.delete(f"/activities/Chess Club/participants/{email}")
    assert response.status_code == 200
    assert f"Removed {email} from Chess Club" in response.json()["message"]

def test_remove_participant_not_found():
    response = client.delete("/activities/Chess Club/participants/notfound@mergington.edu")
    assert response.status_code == 404
    assert response.json()["detail"] == "Participant not found in this activity"

def test_remove_participant_activity_not_found():
    response = client.delete("/activities/Nonexistent/participants/someone@mergington.edu")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"
