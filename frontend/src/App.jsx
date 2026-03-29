import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [contacts, setContacts] = useState([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/contacts')
      if (!response.ok) throw new Error('Failed to load contacts')
      const data = await response.json()
      setContacts(data.contacts)
    } catch (error) {
      console.error(error)
      setMessage('Unable to fetch contacts. Check backend.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setMessage('All fields are required.')
      return
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim()
    }

    try {
      const url = isEditing
        ? `http://127.0.0.1:5000/update_contact/${editId}`
        : 'http://127.0.0.1:5000/create_contact'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Server error')
      }

      setMessage(data.message || (isEditing ? 'Contact updated' : 'Contact added'))
      setFirstName('')
      setLastName('')
      setEmail('')
      setIsEditing(false)
      setEditId(null)
      await fetchContacts()
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Could not save contact')
    }
  }

  const handleEdit = (contact) => {
    setFirstName(contact.firstName)
    setLastName(contact.lastName)
    setEmail(contact.email)
    setIsEditing(true)
    setEditId(contact.id)
    setMessage('Editing contact ' + contact.firstName + ' ' + contact.lastName)
  }

  const handleDelete = async (contactId) => {
    if (!window.confirm('Delete this contact?')) return

    try {
      const response = await fetch(`http://127.0.0.1:5000/delete_contact/${contactId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete')
      setMessage(data.message || 'Contact deleted')
      await fetchContacts()
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Delete failed')
    }
  }

  const handleCancel = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setIsEditing(false)
    setEditId(null)
    setMessage('')
  }

return (
  <div className="dashboard">
    
    {/* Sidebar */}
    <aside className="sidebar">
      <h2 className="logo">Nexus Direct</h2>
      <button className="primary-btn">+ New Contact</button>

      <nav>
        <p className="active">All Contacts</p>
        <p>Groups</p>
        <p>Recent</p>
        <p>Trash</p>
      </nav>
    </aside>

    {/* Main Content */}
    <main className="main">
      
      {/* Topbar */}
      <div className="topbar">
        <input placeholder="Search contacts..." />
        <div className="profile">Nexus Direct</div>
      </div>

      {/* Header */}
      <div className="header">
        <h1>All Contacts</h1>
        <div className="count-card">Total Contacts: {contacts.length}</div>
      </div>

      {/* Cards Section */}
      <div className="cards">
        
        {/* Quick Add */}
        <form onSubmit={handleSubmit} className="quick-add">
          <h3>Quick Add</h3>
          <input placeholder="First Name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
          <input placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />

          <button type="submit">{isEditing ? "Update" : "Add"}</button>
        </form>

        {/* Insights */}
        <div className="insights">
          <h3>Network Insights</h3>
          <p>Contacts growing 🚀</p>
        </div>

      </div>

      {/* Table */}
      <div className="table-card">
        <h3>Recent Contacts</h3>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.firstName} {c.lastName}</td>
                <td>{c.email}</td>
                <td>
                  <button onClick={()=>handleEdit(c)}>✏️</button>
                  <button onClick={()=>handleDelete(c.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </main>
  </div>
);
}

export default App
