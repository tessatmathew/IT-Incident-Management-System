import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app, get_db
from app.database import Base
from app import models


@pytest.fixture
def client():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )

    Base.metadata.create_all(bind=test_engine)

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        test_engine.dispose()


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_get_tickets(client):
    response = client.get("/tickets")

    assert response.status_code == 200
    assert response.json() == []


def test_ticket_not_found(client):
    response = client.get("/tickets/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Ticket not found"

def test_create_ticket(client):
    ticket_data = {
        "title": "Laptop cannot connect to Wi-Fi",
        "description": "Employee cannot access the office network.",
        "priority": "High",
        "category": "Network",
        "assigned_to": "Alex Johnson"
    }

    response = client.post("/tickets", json=ticket_data)

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["title"] == ticket_data["title"]
    assert data["priority"] == "High"
    assert data["status"] == "Open"
    assert data["assigned_to"] == "Alex Johnson"

    # Verify the ticket was saved in the test database
    get_response = client.get("/tickets/1")

    assert get_response.status_code == 200
    assert get_response.json()["title"] == ticket_data["title"]

def test_update_ticket_status(client):
    # Create a test ticket
    ticket_data = {
        "title": "Email server not responding",
        "description": "Employees cannot access company email.",
        "priority": "Critical",
        "category": "Software"
    }

    create_response = client.post("/tickets", json=ticket_data)

    assert create_response.status_code == 200

    ticket_id = create_response.json()["id"]

    # Change the ticket status
    update_response = client.patch(
        f"/tickets/{ticket_id}/status",
        json={"status": "In Progress"}
    )

    assert update_response.status_code == 200
    assert update_response.json()["status"] == "In Progress"

    # Confirm the updated status was saved
    get_response = client.get(f"/tickets/{ticket_id}")

    assert get_response.status_code == 200
    assert get_response.json()["status"] == "In Progress"

def test_assign_ticket(client):
    # Create a new ticket
    ticket_data = {
        "title": "Printer not working",
        "description": "Office printer is not responding.",
        "priority": "Medium",
        "category": "Hardware"
    }

    create_response = client.post("/tickets", json=ticket_data)

    assert create_response.status_code == 200

    ticket_id = create_response.json()["id"]

    # Assign the ticket to a technician
    assign_response = client.patch(
        f"/tickets/{ticket_id}/assign",
        json={"assigned_to": "Sarah Wilson"}
    )

    assert assign_response.status_code == 200
    assert assign_response.json()["assigned_to"] == "Sarah Wilson"

    # Verify the assignment was saved
    get_response = client.get(f"/tickets/{ticket_id}")

    assert get_response.status_code == 200
    assert get_response.json()["assigned_to"] == "Sarah Wilson"

def test_resolve_ticket(client):
    # Create a new support ticket
    ticket_data = {
        "title": "VPN connection failure",
        "description": "Employee cannot connect to the company VPN.",
        "priority": "High",
        "category": "Network"
    }

    create_response = client.post("/tickets", json=ticket_data)

    assert create_response.status_code == 200

    ticket_id = create_response.json()["id"]

    # Resolve the incident
    resolve_response = client.post(
        f"/tickets/{ticket_id}/resolve",
        json={
            "technician": "Alex Johnson",
            "resolution": "Updated VPN settings and restored connectivity."
        }
    )

    assert resolve_response.status_code == 200
    assert resolve_response.json()["status"] == "Resolved"

    # Verify the resolution was saved
    get_response = client.get(f"/tickets/{ticket_id}")

    assert get_response.status_code == 200
    assert get_response.json()["status"] == "Resolved"

    # Verify the troubleshooting history
    notes_response = client.get(f"/tickets/{ticket_id}/notes")

    assert notes_response.status_code == 200

    notes = notes_response.json()

    assert len(notes) == 1
    assert notes[0]["technician"] == "Alex Johnson"
    assert "Updated VPN settings" in notes[0]["note"]

def test_invalid_ticket_priority(client):
    ticket_data = {
        "title": "Server connection issue",
        "description": "The server is not responding.",
        "priority": "Super Urgent",
        "category": "Software"
    }

    response = client.post("/tickets", json=ticket_data)

    assert response.status_code == 422

    # Confirm the invalid ticket was not saved
    get_response = client.get("/tickets")

    assert get_response.status_code == 200
    assert get_response.json() == []