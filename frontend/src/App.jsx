

import { useEffect, useState } from 'react'

import './App.css'

const emptyForm = {

  title: '',

  description: '',

  priority: 'Medium',

  category: '',

  assigned_to: '',

}

const emptyStats = {

  total_tickets: 0,

  open: 0,

  in_progress: 0,

  resolved: 0,

  closed: 0,

}

const statuses = ['Open', 'In Progress', 'Resolved', 'Closed']

const priorities = ['Low', 'Medium', 'High', 'Critical']

const priorityOrder = {

  Low: 1,

  Medium: 2,

  High: 3,

  Critical: 4,

}

const statusOrder = {

  Open: 1,

  'In Progress': 2,

  Resolved: 3,

  Closed: 4,

}

async function apiRequest(url, options = {}) {

  const response = await fetch(url, options)

  const data = await response.json().catch(() => null)

  if (!response.ok) {

    let message = 'Request failed'

    if (typeof data?.detail === 'string') {

      message = data.detail

    } else if (Array.isArray(data?.detail)) {

      message = data.detail.map((item) => item.msg).join(', ')

    }

    throw new Error(message)

  }

  return data

}

function jsonOptions(method, body) {

  return {

    method,

    headers: {

      'Content-Type': 'application/json',

    },

    body: JSON.stringify(body),

  }

}

function App() {

  const [stats, setStats] = useState(emptyStats)

  const [tickets, setTickets] = useState([])

  const [sortBy, setSortBy] = useState('newest')

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState(emptyForm)

  const [saving, setSaving] = useState(false)

  const [formError, setFormError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')

  const [statusFilter, setStatusFilter] = useState('All')

  const [priorityFilter, setPriorityFilter] = useState('All')

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [editDetails, setEditDetails] = useState({ title: '', description: '', category: '', priority: 'Medium' })

  const [ticketStatus, setTicketStatus] = useState('Open')

  const [assignedTo, setAssignedTo] = useState('')

  const [notes, setNotes] = useState([])

  const [notesLoading, setNotesLoading] = useState(false)

  const [technicianName, setTechnicianName] = useState('')

  const [noteText, setNoteText] = useState('')

  const [resolutionTechnician, setResolutionTechnician] = useState('')

  const [resolutionText, setResolutionText] = useState('')

  const [actionLoading, setActionLoading] = useState(false)

  const [actionError, setActionError] = useState('')

  async function loadDashboard(showLoading = true) {

    if (showLoading) {

      setLoading(true)

    }

    try {

      const [statsData, ticketsData] = await Promise.all([

        apiRequest('/api/stats'),

        apiRequest('/api/tickets'),

      ])

      setStats(statsData)

      setTickets(ticketsData)

      setError('')

    } catch (err) {

      setError(err.message || 'Unable to load dashboard')

    } finally {

      if (showLoading) {

        setLoading(false)

      }

    }

  }

  useEffect(() => {

    loadDashboard()

  }, [])

  // Search and filter incidents

  const filteredTickets = tickets.filter((ticket) => {

    const query = searchQuery.trim().toLowerCase()

    const searchableValues = [

      ticket.id,

      `#${ticket.id}`,

      ticket.title,

      ticket.description,

      ticket.category,

      ticket.priority,

      ticket.status,

      ticket.assigned_to,

    ]

    const matchesSearch =

      !query ||

      searchableValues.some((value) =>

        String(value ?? '').toLowerCase().includes(query)

      )

    const matchesStatus =

      statusFilter === 'All' || ticket.status === statusFilter

    const matchesPriority =

      priorityFilter === 'All' || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority

  })

  // Sort incidents after applying filters

  const sortedTickets = [...filteredTickets].sort((a, b) => {

    switch (sortBy) {

      case 'newest':

        return Number(b.id) - Number(a.id)

      case 'oldest':

        return Number(a.id) - Number(b.id)

      case 'priority-high':

        return (

          (priorityOrder[b.priority] ?? 0) -

            (priorityOrder[a.priority] ?? 0) ||

          Number(b.id) - Number(a.id)

        )

      case 'priority-low':

        return (

          (priorityOrder[a.priority] ?? 0) -

            (priorityOrder[b.priority] ?? 0) ||

          Number(b.id) - Number(a.id)

        )

      case 'status':

        return (

          (statusOrder[a.status] ?? 99) -

            (statusOrder[b.status] ?? 99) ||

          Number(b.id) - Number(a.id)

        )

      default:

        return 0

    }

  })

  function clearFilters() {

    setSearchQuery('')

    setStatusFilter('All')

    setPriorityFilter('All')

    setSortBy('newest')

  }

  function handleChange(event) {

    const { name, value } = event.target

    setForm((previous) => ({

      ...previous,

      [name]: value,

    }))

  }

  async function handleSubmit(event) {

    event.preventDefault()

    setSaving(true)

    setFormError('')

    setSuccess('')

    try {

      const payload = {

        title: form.title.trim(),

        description: form.description.trim(),

        priority: form.priority,

        category: form.category.trim(),

        assigned_to: form.assigned_to.trim() || null,

      }

      if (

        !payload.title ||

        !payload.description ||

        !payload.category

      ) {

        throw new Error('Please complete all required fields.')

      }

      await apiRequest(

        '/api/tickets',

        jsonOptions('POST', payload)

      )

      setForm({ ...emptyForm })

      setShowForm(false)

      setSuccess('Incident created successfully!')

      await loadDashboard(false)

    } catch (err) {

      setFormError(err.message || 'Unable to create incident')

    } finally {

      setSaving(false)

    }

  }

  async function openTicket(ticket) {

    setSelectedTicket(ticket)
    setEditDetails({ title: ticket.title || '', description: ticket.description || '', category: ticket.category || '', priority: ticket.priority || 'Medium' })

    setTicketStatus(ticket.status)

    setAssignedTo(ticket.assigned_to || '')

    setTechnicianName(ticket.assigned_to || '')

    setNoteText('')

    setResolutionTechnician(ticket.assigned_to || '')

    setResolutionText('')

    setActionError('')

    setSuccess('')

    setNotes([])

    setNotesLoading(true)

    try {

      const ticketNotes = await apiRequest(

        `/api/tickets/${ticket.id}/notes`

      )

      setNotes(ticketNotes)

    } catch (err) {

      setActionError(err.message || 'Unable to load notes')

    } finally {

      setNotesLoading(false)

    }

  }

  async function saveIncidentDetails(event) {
    event.preventDefault()
    if (!selectedTicket) return

    const payload = {
      title: editDetails.title.trim(),
      description: editDetails.description.trim(),
      category: editDetails.category.trim(),
      priority: editDetails.priority,
    }
    if (!payload.title || !payload.description || !payload.category) {
      setActionError('Title, description, and category are required.')
      return
    }

    setActionLoading(true)
    setActionError('')
    setSuccess('')
    try {
      const updated = await apiRequest(
        `/api/tickets/${selectedTicket.id}`,
        jsonOptions('PATCH', payload)
      )
      setSelectedTicket(updated)
      setEditDetails({
        title: updated.title,
        description: updated.description,
        category: updated.category,
        priority: updated.priority,
      })
      setSuccess(`Incident #${updated.id} details saved successfully!`)
      await loadDashboard(false)
    } catch (err) {
      setActionError(err.message || 'Unable to save incident details')
    } finally {
      setActionLoading(false)
    }
  }

  async function saveTicketChanges(event) {

    event.preventDefault()

    if (!selectedTicket) return

    setActionLoading(true)

    setActionError('')

    setSuccess('')

    const ticketId = selectedTicket.id

    try {

      let updatedTicket = selectedTicket

      if (ticketStatus !== selectedTicket.status) {

        updatedTicket = await apiRequest(

          `/api/tickets/${ticketId}/status`,

          jsonOptions('PATCH', {

            status: ticketStatus,

          })

        )

      }

      const newAssignee = assignedTo.trim()

      if (newAssignee !== (selectedTicket.assigned_to || '')) {

        updatedTicket = await apiRequest(

          `/api/tickets/${ticketId}/assign`,

          jsonOptions('PATCH', {

            assigned_to: newAssignee,

          })

        )

      }

      setSelectedTicket(updatedTicket)

      setTicketStatus(updatedTicket.status)

      setAssignedTo(updatedTicket.assigned_to || '')

      setSuccess(`Incident #${ticketId} updated successfully!`)

      await loadDashboard(false)

    } catch (err) {

      setActionError(err.message || 'Unable to update incident')

      try {

        const latestTicket = await apiRequest(

          `/api/tickets/${ticketId}`

        )

        setSelectedTicket(latestTicket)
        setEditDetails({ title: latestTicket.title, description: latestTicket.description, category: latestTicket.category, priority: latestTicket.priority })

        setTicketStatus(latestTicket.status)

        setAssignedTo(latestTicket.assigned_to || '')

        await loadDashboard(false)

      } catch {

        // Preserve the original error.

      }

    } finally {

      setActionLoading(false)

    }

  }

  async function addNote(event) {

    event.preventDefault()

    if (!selectedTicket) return

    const technician = technicianName.trim()

    const note = noteText.trim()

    if (!technician || !note) {

      setActionError(

        'Enter a technician name and troubleshooting details.'

      )

      return

    }

    setActionLoading(true)

    setActionError('')

    setSuccess('')

    try {

      await apiRequest(

        `/api/tickets/${selectedTicket.id}/notes`,

        jsonOptions('POST', {

          technician,

          note,

        })

      )

      const updatedNotes = await apiRequest(

        `/api/tickets/${selectedTicket.id}/notes`

      )

      setNotes(updatedNotes)

      setNoteText('')

      setSuccess('Troubleshooting note added successfully!')

    } catch (err) {

      setActionError(err.message || 'Unable to add note')

    } finally {

      setActionLoading(false)

    }

  }

  async function resolveTicket(event) {

    event.preventDefault()

    if (!selectedTicket) return

    const technician = resolutionTechnician.trim()

    const resolution = resolutionText.trim()

    if (!technician || !resolution) {

      setActionError(

        'Enter the resolving technician and resolution details.'

      )

      return

    }

    setActionLoading(true)

    setActionError('')

    setSuccess('')

    const ticketId = selectedTicket.id

    try {

      await apiRequest(

        `/api/tickets/${ticketId}/resolve`,

        jsonOptions('POST', {

          technician,

          resolution,

        })

      )

      setSelectedTicket(null)

      setNotes([])

      setResolutionText('')

      setSuccess(`Incident #${ticketId} resolved successfully!`)

      await loadDashboard(false)

    } catch (err) {

      setActionError(err.message || 'Unable to resolve incident')

    } finally {

      setActionLoading(false)

    }

  }

  function closeTicket() {

    setSelectedTicket(null)

    setNotes([])

    setActionError('')

  }

  return (

    <div className="dashboard">

      <aside className="sidebar">

        <h2>IT Support Hub</h2>

        <p>Incident Management</p>

        <nav>

          <a href="#dashboard">Dashboard</a>

          <a href="#incidents">Incidents</a>

        </nav>

      </aside>

      <main className="main-content" id="dashboard">

        <header>

          <h1>Incident Management Dashboard</h1>

          <p>

            Monitor, manage, and resolve IT support incidents.

          </p>

        </header>

        {error && (

          <p role="alert" className="error-message">

            {error}

          </p>

        )}

        {success && (

          <p role="status" className="success-message">

            {success}

          </p>

        )}

        <section className="stats">

          <div className="stat-card">

            <h3>Total Incidents</h3>

            <p>{loading ? '...' : stats.total_tickets}</p>

          </div>

          <div className="stat-card">

            <h3>Open Incidents</h3>

            <p>{loading ? '...' : stats.open}</p>

          </div>

          <div className="stat-card">

            <h3>In Progress</h3>

            <p>{loading ? '...' : stats.in_progress}</p>

          </div>

          <div className="stat-card">

            <h3>Resolved</h3>

            <p>{loading ? '...' : stats.resolved}</p>

          </div>

        </section>

        <section className="incidents" id="incidents">

          <div className="section-heading">

            <h2>Recent Incidents</h2>

            <button

              type="button"

              className="primary-button"

              onClick={() => {

                setShowForm((previous) => !previous)

                setFormError('')

              }}

            >

              {showForm ? 'Cancel' : '+ Create Incident'}

            </button>

          </div>

          {showForm && (

            <form

              className="incident-form"

              onSubmit={handleSubmit}

            >

              <h3>Create New Incident</h3>

              <label htmlFor="title">Incident Title</label>

              <input

                id="title"

                name="title"

                value={form.title}

                onChange={handleChange}

                placeholder="e.g. Employee unable to connect to VPN"

                required

              />

              <label htmlFor="description">Description</label>

              <textarea

                id="description"

                name="description"

                value={form.description}

                onChange={handleChange}

                placeholder="Describe the technical issue"

                rows={4}

                required

              />

              <label htmlFor="priority">Priority</label>

              <select

                id="priority"

                name="priority"

                value={form.priority}

                onChange={handleChange}

              >

                {priorities.map((priority) => (

                  <option key={priority} value={priority}>

                    {priority}

                  </option>

                ))}

              </select>

              <label htmlFor="category">Category</label>

              <input

                id="category"

                name="category"

                value={form.category}

                onChange={handleChange}

                placeholder="e.g. Network, Software, Hardware"

                required

              />

              <label htmlFor="assigned_to">

                Assigned Technician (Optional)

              </label>

              <input

                id="assigned_to"

                name="assigned_to"

                value={form.assigned_to}

                onChange={handleChange}

                placeholder="e.g. Alex Johnson"

              />

              {formError && (

                <p role="alert" className="error-message">

                  {formError}

                </p>

              )}

              <button

                type="submit"

                className="primary-button"

                disabled={saving}

              >

                {saving ? 'Creating...' : 'Create Ticket'}

              </button>

            </form>

          )}

          {/* Status and Priority Filters */}

          <div className="filter-controls">

            <div className="filter-field">

              <label htmlFor="status-filter">Status</label>

              <select

                id="status-filter"

                value={statusFilter}

                onChange={(event) =>

                  setStatusFilter(event.target.value)

                }

              >

                <option value="All">All Statuses</option>

                {statuses.map((status) => (

                  <option key={status} value={status}>

                    {status}

                  </option>

                ))}

              </select>

            </div>

            <div className="filter-field">

              <label htmlFor="priority-filter">Priority</label>

              <select

                id="priority-filter"

                value={priorityFilter}

                onChange={(event) =>

                  setPriorityFilter(event.target.value)

                }

              >

                <option value="All">All Priorities</option>

                {priorities.map((priority) => (

                  <option key={priority} value={priority}>

                    {priority}

                  </option>

                ))}

              </select>

            </div>

            {/* Sort By Dropdown */}

            <div className="filter-field">

              <label htmlFor="sort-by">Sort By</label>

              <select

                id="sort-by"

                value={sortBy}

                onChange={(event) =>

                  setSortBy(event.target.value)

                }

              >

                <option value="newest">Newest First</option>

                <option value="oldest">Oldest First</option>

                <option value="priority-high">

                  Priority: Highest First

                </option>

                <option value="priority-low">

                  Priority: Lowest First

                </option>

                <option value="status">Status</option>

              </select>

            </div>

          </div>

          {/* Search Bar */}

          <div className="search-container">

            <input

              type="search"

              className="search-input"

              placeholder="Search incidents by ID, title, status, priority, category or technician..."

              aria-label="Search incidents"

              value={searchQuery}

              onChange={(event) =>

                setSearchQuery(event.target.value)

              }

            />

            {(searchQuery ||

              statusFilter !== 'All' ||

              priorityFilter !== 'All' ||

              sortBy !== 'newest') && (

              <button

                type="button"

                className="secondary-button"

                onClick={clearFilters}

              >

                Clear Filters

              </button>

            )}

          </div>

          {!loading && !error && (

            <p className="results-count">

              Showing {sortedTickets.length} of {tickets.length} incidents

            </p>

          )}

          {loading ? (

            <p>Loading incidents...</p>

          ) : error ? (

            <p>Unable to load incidents.</p>

          ) : tickets.length === 0 ? (

            <p>No incidents to display yet.</p>

          ) : sortedTickets.length === 0 ? (

            <p>No incidents match your search or filters.</p>

          ) : (

            <div className="table-container">

              <table className="incident-table">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Title</th>

                    <th>Category</th>

                    <th>Priority</th>

                    <th>Status</th>

                    <th>Assigned To</th>

                  </tr>

                </thead>

                <tbody>

                  {sortedTickets.map((ticket) => (

                    <tr key={ticket.id}>

                      <td>#{ticket.id}</td>

                      <td>

                        <button

                          type="button"

                          className="ticket-link"

                          onClick={() => openTicket(ticket)}

                        >

                          {ticket.title}

                        </button>

                      </td>

                      <td>{ticket.category}</td>

                      <td>{ticket.priority}</td>

                      <td>

                        <span

                          className={`status-badge ${String(

                            ticket.status || ''

                          )

                            .toLowerCase()

                            .replace(/\s+/g, '-')}`}

                        >

                          {ticket.status}

                        </span>

                      </td>

                      <td>

                        {ticket.assigned_to || 'Unassigned'}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

          {/* Incident Details */}

          {selectedTicket && (

            <div className="incident-form ticket-details">

              <h3>

                Manage Incident #{selectedTicket.id}

              </h3>
              <h4>{selectedTicket.title}</h4>
              <p>{selectedTicket.description}</p>

              <h3>Edit Incident Details</h3>
              <form onSubmit={saveIncidentDetails}>
                <label htmlFor="edit-title">Incident Title</label>
                <input
                  id="edit-title"
                  value={editDetails.title}
                  onChange={(event) => setEditDetails((previous) => ({ ...previous, title: event.target.value }))}
                  required
                  disabled={actionLoading}
                />

                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={editDetails.description}
                  onChange={(event) => setEditDetails((previous) => ({ ...previous, description: event.target.value }))}
                  rows={4}
                  required
                  disabled={actionLoading}
                />

                <label htmlFor="edit-category">Category</label>
                <input
                  id="edit-category"
                  value={editDetails.category}
                  onChange={(event) => setEditDetails((previous) => ({ ...previous, category: event.target.value }))}
                  required
                  disabled={actionLoading}
                />

                <label htmlFor="edit-priority">Priority</label>
                <select
                  id="edit-priority"
                  value={editDetails.priority}
                  onChange={(event) => setEditDetails((previous) => ({ ...previous, priority: event.target.value }))}
                  disabled={actionLoading}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>

                <button type="submit" className="primary-button" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Incident Details'}
                </button>
              </form>
              <hr />

              {actionError && (

                <p role="alert" className="error-message">

                  {actionError}

                </p>

              )}

              <form onSubmit={saveTicketChanges}>

                <label htmlFor="ticket-status">

                  Incident Status

                </label>

                <select

                  id="ticket-status"

                  value={ticketStatus}

                  onChange={(event) =>

                    setTicketStatus(event.target.value)

                  }

                  disabled={actionLoading}

                >

                  {statuses.map((status) => (

                    <option key={status} value={status}>

                      {status}

                    </option>

                  ))}

                </select>

                <label htmlFor="ticket-assignee">

                  Assigned Technician

                </label>

                <input

                  id="ticket-assignee"

                  value={assignedTo}

                  onChange={(event) =>

                    setAssignedTo(event.target.value)

                  }

                  placeholder="Technician name"

                  disabled={actionLoading}

                />

                <button

                  type="submit"

                  className="primary-button"

                  disabled={actionLoading}

                >

                  {actionLoading

                    ? 'Saving...'

                    : 'Save Changes'}

                </button>

              </form>

              <hr />

              <h3>Troubleshooting Notes</h3>

              {notesLoading ? (

                <p>Loading notes...</p>

              ) : notes.length === 0 ? (

                <p>No troubleshooting notes yet.</p>

              ) : (

                <div className="notes-list">

                  {notes.map((note) => (

                    <div

                      className="note-card"

                      key={note.id}

                    >

                      <strong>{note.technician}</strong>

                      <p>{note.note}</p>

                    </div>

                  ))}

                </div>

              )}

              <h4>Add Troubleshooting Note</h4>

              <form onSubmit={addNote}>

                <label htmlFor="note-technician">

                  Technician Name

                </label>

                <input

                  id="note-technician"

                  value={technicianName}

                  onChange={(event) =>

                    setTechnicianName(event.target.value)

                  }

                  placeholder="Technician name"

                  required

                  disabled={actionLoading}

                />

                <label htmlFor="note-text">

                  Troubleshooting Details

                </label>

                <textarea

                  id="note-text"

                  value={noteText}

                  onChange={(event) =>

                    setNoteText(event.target.value)

                  }

                  placeholder="Describe the troubleshooting steps performed"

                  rows={4}

                  required

                  disabled={actionLoading}

                />

                <button

                  type="submit"

                  className="primary-button"

                  disabled={actionLoading}

                >

                  {actionLoading ? 'Saving...' : 'Add Note'}

                </button>

              </form>

              {selectedTicket.status !== 'Resolved' &&

                selectedTicket.status !== 'Closed' && (

                  <>

                    <hr />

                    <h3>Resolve Incident</h3>

                    <p>

                      Record the solution and mark this incident as resolved.

                    </p>

                    <form onSubmit={resolveTicket}>

                      <label htmlFor="resolution-technician">

                        Resolving Technician

                      </label>

                      <input

                        id="resolution-technician"

                        value={resolutionTechnician}

                        onChange={(event) =>

                          setResolutionTechnician(event.target.value)

                        }

                        placeholder="Technician name"

                        required

                        disabled={actionLoading}

                      />

                      <label htmlFor="resolution-text">

                        Resolution Details

                      </label>

                      <textarea

                        id="resolution-text"

                        value={resolutionText}

                        onChange={(event) =>

                          setResolutionText(event.target.value)

                        }

                        placeholder="Explain how the incident was resolved"

                        rows={4}

                        required

                        disabled={actionLoading}

                      />

                      <button

                        type="submit"

                        className="primary-button"

                        disabled={actionLoading}

                      >

                        {actionLoading

                          ? 'Resolving...'

                          : 'Resolve Incident'}

                      </button>

                    </form>

                  </>

                )}

              <hr />

              <button

                type="button"

                className="secondary-button"

                onClick={closeTicket}

                disabled={actionLoading}

              >

                Close Details

              </button>

            </div>

          )}

        </section>

      </main>

    </div>

  )

}

export default App
