# Enterprise IT Support & Incident Management Platform

[![Python API Tests](https://github.com/tessatmathew/IT-Incident-Management-System/actions/workflows/python-tests.yml/badge.svg)](https://github.com/tessatmathew/IT-Incident-Management-System/actions/workflows/python-tests.yml)

A Python-based REST API for managing IT support incidents, tracking troubleshooting activities, assigning technicians, and documenting issue resolutions.

## Overview

This project simulates an enterprise IT service desk environment where technical support teams can manage incidents throughout their lifecycle, from initial reporting to resolution.

Built with FastAPI, SQLAlchemy, and SQLite, the platform demonstrates backend development, database integration, API design, and automated testing.

## Key Features

- Create and retrieve IT support tickets
- Assign incidents to technicians
- Update ticket statuses and priorities
- Filter tickets by status, priority, and category
- Record and retrieve troubleshooting notes
- Resolve incidents with documented solutions
- View ticket statistics
- Validate incoming API requests
- Handle invalid requests and missing resources

## Technology Stack

- **Backend:** Python, FastAPI
- **Database:** SQLite, SQLAlchemy
- **Data Validation:** Pydantic
- **API Documentation:** Swagger UI / OpenAPI
- **Automated Testing:** pytest, FastAPI TestClient
- **Development Tools:** Visual Studio Code, Git

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API health |
| POST | `/tickets` | Create an incident |
| GET | `/tickets` | Retrieve and filter incidents |
| GET | `/tickets/{ticket_id}` | Retrieve a specific incident |
| PATCH | `/tickets/{ticket_id}/status` | Update incident status |
| PATCH | `/tickets/{ticket_id}/assign` | Assign a technician |
| POST | `/tickets/{ticket_id}/notes` | Add troubleshooting notes |
| GET | `/tickets/{ticket_id}/notes` | Retrieve troubleshooting history |
| POST | `/tickets/{ticket_id}/resolve` | Resolve an incident |
| GET | `/stats` | Retrieve ticket statistics |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/IT-Incident-Management-System.git
cd IT-Incident-Management-System
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the application

```bash
uvicorn app.main:app --reload
```

### 5. Access API documentation

Open:

`http://127.0.0.1:8000/docs`

## Automated Testing

The project includes automated API tests covering:

- Health checks
- Ticket retrieval
- Missing ticket handling
- Ticket creation
- Status updates
- Technician assignments
- Incident resolution
- Input validation

Run the tests:

```bash
python -m pytest tests/test_api.py -v
```

Tests use a separate in-memory SQLite database to avoid modifying development data.

## Future Improvements

- User authentication and role-based access control
- Incident activity logs and audit trails
- PostgreSQL integration
- Web-based dashboard
- CI/CD integration using GitHub Actions
- Docker containerization

## Author

Tessa Theresa Mathew