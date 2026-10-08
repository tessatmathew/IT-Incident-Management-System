# Enterprise IT Support & Incident Management Platform

[![Python API Tests](https://github.com/tessatmathew/IT-Incident-Management-System/actions/workflows/python-tests.yml/badge.svg)](https://github.com/tessatmathew/IT-Incident-Management-System/actions/workflows/python-tests.yml)

A full-stack IT incident management application built with React, Python, FastAPI, SQLAlchemy, and SQLite. The platform enables users to create, track, assign, troubleshoot, and resolve IT support incidents through an interactive web dashboard.

## Live Application

**[Launch the IT Incident Management Dashboard](https://it-incident-management-frontend.onrender.com)**

**[Backend API Documentation](https://it-incident-management-system-api.onrender.com/docs)**

The application is deployed on Render. Free-tier services may take some time to respond after periods of inactivity.

## Overview

This project simulates an enterprise IT service desk environment where technical support teams manage incidents throughout their lifecycle, from initial reporting to resolution.

It demonstrates full-stack software development, REST API design, database integration, incident troubleshooting workflows, automated testing, and cloud deployment.

## Key Features

### Incident Management
- Create IT support incidents with categories and priorities
- View incident details and assigned technicians
- Update incident statuses and assignments
- Record troubleshooting notes and resolution details
- Track incidents from Open to In Progress to Resolved

### Interactive Dashboard
- View total, open, in-progress, and resolved incident counts
- Search incidents by relevant fields
- Filter incidents by status and priority
- Sort incidents
- Manage incidents through a React-based interface

### Backend API
- RESTful API developed using FastAPI
- SQLAlchemy ORM for database operations
- SQLite database integration
- Pydantic request validation
- Error handling for invalid requests and missing resources
- Interactive Swagger/OpenAPI documentation

### Testing and Deployment
- Automated API tests using pytest
- GitHub Actions workflow for continuous integration
- React frontend deployed on Render
- FastAPI backend deployed on Render

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, CSS, Vite |
| Backend | Python, FastAPI |
| Database | SQLite, SQLAlchemy |
| Data Validation | Pydantic |
| API Documentation | Swagger UI, OpenAPI |
| Testing | pytest, FastAPI TestClient |
| CI/CD | GitHub Actions |
| Deployment | Render |
| Development Tools | Visual Studio Code, Git, GitHub |

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
| GET | `/stats` | Retrieve incident statistics |

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/tessatmathew/IT-Incident-Management-System.git
cd IT-Incident-Management-System
```

### 2. Set Up the Backend

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend API documentation:

http://127.0.0.1:8000/docs

### 3. Set Up the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the React development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

http://localhost:5173

## Automated Testing

The backend includes eight automated API tests covering:

- API health checks
- Ticket retrieval
- Missing ticket handling
- Incident creation
- Status updates
- Technician assignments
- Incident resolution
- Input validation

Run the tests:

```bash
python -m pytest tests/test_api.py -v
```

Tests use a separate in-memory SQLite database to avoid modifying development data.

GitHub Actions runs the automated test workflow when configured repository events occur.

## Deployment

The application is deployed as two Render services:

**Frontend:** React static site

https://it-incident-management-frontend.onrender.com

**Backend:** FastAPI web service

https://it-incident-management-system-api.onrender.com

The frontend communicates with the backend through REST API requests.

**Database limitation:** The current SQLite deployment is suitable for demonstrations. Render's ephemeral filesystem does not guarantee persistence across service restarts or redeployments. A managed PostgreSQL database is recommended for reliable production persistence.

## Future Improvements

- User authentication and role-based access control
- PostgreSQL integration for persistent cloud storage
- Detailed incident audit trails
- Advanced analytics and reporting
- Docker containerization
- Expanded frontend and integration testing

## Author

**Tessa Theresa Mathew**

[GitHub](https://github.com/tessatmathew)