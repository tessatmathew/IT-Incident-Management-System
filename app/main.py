from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from . import models
from .schemas import (
    TicketCreate,
    TicketResponse,
    TicketStatusUpdate,
    TicketAssignment,
    TicketNoteCreate,
    TicketNoteResponse,
    TicketResolve,
    TicketUpdate
)
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Enterprise IT Support & Incident Management Platform",
    description="REST API for managing enterprise IT support incidents.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://it-incident-management-frontend.onrender.com",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "IT Support Incident Management API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/tickets", response_model=TicketResponse)
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db)
):
    new_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        category=ticket.category,
        assigned_to=ticket.assigned_to
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket

@app.get("/tickets", response_model=list[TicketResponse])
def get_tickets(
    status: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Ticket)

    if status:
        query = query.filter(models.Ticket.status == status)

    if priority:
        query = query.filter(models.Ticket.priority == priority)

    if category:
        query = query.filter(models.Ticket.category == category)

    return query.all()

@app.patch("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    update: TicketUpdate,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    update_data = update.model_dump(exclude_unset=True)

    allowed_priorities = ["Low", "Medium", "High", "Critical"]

    if "priority" in update_data:
        if update_data["priority"] not in allowed_priorities:
            raise HTTPException(
                status_code=400,
                detail="Invalid priority"
            )

    for field, value in update_data.items():
        if value is None or not isinstance(value, str) or not value.strip():
            raise HTTPException(
                status_code=400,
                detail=f"{field} cannot be empty"
            )

        setattr(ticket, field, value.strip())

    db.commit()
    db.refresh(ticket)

    return ticket

@app.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket

@app.patch("/tickets/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status(
    ticket_id: int,
    update: TicketStatusUpdate,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    allowed_statuses = ["Open", "In Progress", "Resolved", "Closed"]

    if update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid ticket status"
        )

    ticket.status = update.status
    db.commit()
    db.refresh(ticket)

    return ticket

@app.patch("/tickets/{ticket_id}/assign", response_model=TicketResponse)
def assign_ticket(
    ticket_id: int,
    assignment: TicketAssignment,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    ticket.assigned_to = assignment.assigned_to
    db.commit()
    db.refresh(ticket)

    return ticket

@app.get("/stats")
def get_ticket_statistics(db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).all()

    return {
        "total_tickets": len(tickets),
        "open": sum(t.status == "Open" for t in tickets),
        "in_progress": sum(t.status == "In Progress" for t in tickets),
        "resolved": sum(t.status == "Resolved" for t in tickets),
        "closed": sum(t.status == "Closed" for t in tickets)
    }

@app.post("/tickets/{ticket_id}/notes", response_model=TicketNoteResponse)
def add_ticket_note(
    ticket_id: int,
    note: TicketNoteCreate,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    new_note = models.TicketNote(
        ticket_id=ticket_id,
        technician=note.technician,
        note=note.note
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note

@app.get("/tickets/{ticket_id}/notes", response_model=list[TicketNoteResponse])
def get_ticket_notes(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    notes = db.query(models.TicketNote).filter(
        models.TicketNote.ticket_id == ticket_id
    ).all()

    return notes

@app.post("/tickets/{ticket_id}/resolve", response_model=TicketResponse)
def resolve_ticket(
    ticket_id: int,
    resolution: TicketResolve,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if ticket.status == "Closed":
        raise HTTPException(
            status_code=400,
            detail="Closed tickets cannot be resolved"
        )

    resolution_note = models.TicketNote(
        ticket_id=ticket_id,
        technician=resolution.technician,
        note=f"RESOLUTION: {resolution.resolution}"
    )

    ticket.status = "Resolved"

    db.add(resolution_note)
    db.commit()
    db.refresh(ticket)

    return ticket