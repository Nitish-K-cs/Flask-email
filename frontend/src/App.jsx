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
    <div className="app-shell">
      <h1>Contact Manager</h1>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="field-row">
          <label htmlFor="fname">First Name</label>
          <input
            id="fname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="field-row">
          <label htmlFor="lname">Last Name</label>
          <input
            id="lname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="field-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="buttons">
          <button type="submit">{isEditing ? 'Update' : 'Add'} user</button>
          {isEditing && (
            <button type="button" className="cancel" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>All Users</h2>
      {contacts.length === 0 ? (
        <p>No users yet.</p>
      ) : (
        <table className="contact-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.firstName}</td>
                <td>{contact.lastName}</td>
                <td>{contact.email}</td>
                <td>
                  <button className="small" onClick={() => handleEdit(contact)}>
                    Edit
                  </button>
                  <button className="small danger" onClick={() => handleDelete(contact.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
