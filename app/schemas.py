from pydantic import BaseModel, ConfigDict
from typing import Optional
from typing import Literal


class TicketCreate(BaseModel):
    title: str
    description: str
    priority: Literal["Low", "Medium", "High", "Critical"] = "Medium"
    category: str
    assigned_to: Optional[str] = None


class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    status: str
    category: str
    assigned_to: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TicketStatusUpdate(BaseModel):
    status: str

class TicketAssignment(BaseModel):
    assigned_to: str

class TicketNoteCreate(BaseModel):
    technician: str
    note: str


class TicketNoteResponse(BaseModel):
    id: int
    ticket_id: int
    technician: str
    note: str

    model_config = {"from_attributes": True}

class TicketResolve(BaseModel):
    technician: str
    resolution: str