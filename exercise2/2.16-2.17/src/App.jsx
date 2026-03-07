import { useState, useEffect } from 'react'
import personsService from './services/persons'

const Notification = ({ message, type }) => {
  if (!message) return null

  const style = {
    color: type === 'success' ? 'green' : 'red',
    background: '#f0f0f0',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px'
  }

  return <div style={style}>{message}</div>
}

const Filter = ({ filter, handleFilterChange }) => (
  <div>
    filter shown with: <input value={filter} onChange={handleFilterChange} />
  </div>
)

const PersonForm = ({
  addPerson,
  newName,
  handleNameChange,
  newNumber,
  handleNumberChange
}) => (
  <form onSubmit={addPerson}>
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    <div>
      number: <input value={newNumber} onChange={handleNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Person = ({ person, handleDelete }) => (
  <p>
    {person.name} {person.number}
    <button onClick={() => handleDelete(person.id, person.name)}>delete</button>
  </p>
)

const Persons = ({ persons, handleDelete }) => (
  <div>
    {persons.map(person => (
      <Person key={person.id} person={person} handleDelete={handleDelete} />
    ))}
  </div>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type })
    setTimeout(() => setNotification(null), 5000) // disappear after 5 seconds
  }

  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => setPersons(initialPersons))
      .catch(err => console.error('Failed to load persons', err))
  }, [])

  const addPerson = event => {
    event.preventDefault()

    const personObject = { name: newName, number: newNumber }
    const existingPerson = persons.find(p => p.name === newName)

    if (existingPerson) {
      if (
        !window.confirm(
          `${newName} is already added. Replace old number with new one?`
        )
      ) {
        return
      }

      personsService
        .update(existingPerson.id, { ...existingPerson, number: newNumber })
        .then(updatedPerson => {
          setPersons(
            persons.map(p => (p.id !== updatedPerson.id ? p : updatedPerson))
          )
          showNotification(`Updated ${newName}'s number`)
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          if (error.response?.status === 404) {
            showNotification(
              `Information of ${newName} has already been removed from server`,
              'error'
            )
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          } else {
            showNotification('Failed to update number', 'error')
          }
        })
      return
    }

    personsService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        showNotification(`Added ${newName}`)
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        showNotification('Failed to add person', 'error')
      })
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return

    personsService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== id))
        showNotification(`Deleted ${name}`)
      })
      .catch(error => {
        showNotification(
          `Information of ${name} has already been removed from server`,
          'error'
        )
        setPersons(persons.filter(p => p.id !== id))
      })
  }

  const personsToShow = filter
    ? persons.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : persons

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification?.message} type={notification?.type} />

      <Filter
        filter={filter}
        handleFilterChange={e => setFilter(e.target.value)}
      />

      <h3>add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={e => setNewName(e.target.value)}
        newNumber={newNumber}
        handleNumberChange={e => setNewNumber(e.target.value)}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  )
}

export default App