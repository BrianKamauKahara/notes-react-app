const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const formatNotes = (notes) => notes.map(note => ({
  ...note,
  createdAt: new Date(note.createdAt._seconds * 1000 + Math.floor(note.createdAt._nanoseconds / 1e6)),
  updatedAt: new Date(note.updatedAt._seconds * 1000 + Math.floor(note.updatedAt._nanoseconds / 1e6)),
}))

async function fetchNotesBatch({ start = null, limit = 2 }) {
  const query = start ? `startDocId=${start}&limit=${limit}` : `limit=${limit}`

  try {
    const response = await fetch(`${API_BASE_URL}/notes?${query}`)

    if (!response.ok) throw new Error("Failed to fetch notes")

    return formatNotes(await response.json())
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error
  }
}

async function requestCreateNote(noteDetails) {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteDetails)
    }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error
  }
}

async function requestNoteUpdate(noteId, noteDetails) {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteDetails)
    }
    )

    if (!response.ok) {
      console.log(response)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error
  }
}

async function requestSpecificNote(noteId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const note = await response.json()

    return ({
      ...note,
      createdAt: new Date(note.createdAt._seconds * 1000 + Math.floor(note.createdAt._nanoseconds / 1e6)),
      updatedAt: new Date(note.updatedAt._seconds * 1000 + Math.floor(note.updatedAt._nanoseconds / 1e6)),
    })
  } catch (error) {
    console.error('Failed to fetch note:', error);
    throw error
  }
}

async function requestNoteDeletion(noteId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to delete:', error);
    throw error
  }
}

export {
  fetchNotesBatch,
  requestCreateNote,
  requestSpecificNote,
  requestNoteUpdate,
  requestNoteDeletion
}