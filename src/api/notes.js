const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const normalizeNote = (note) => {
  return {
    ...note,
    createdAt: normalizeDate(note.createdAt),
    updatedAt: normalizeDate(note.updatedAt)
  }
}

const normalizeDate = (rawDateObj) => {
  if (!rawDateObj) return null

  if (rawDateObj instanceof Date) return rawDateObj

  if (rawDateObj._seconds !== undefined) {
    return new Date(
      rawDateObj._seconds * 1000 +
      Math.floor(rawDateObj._nanoseconds / 1e6)
    )
  }

  return new Date(rawDateObj)
}

async function fetchNotesBatch({ start = null, limit = 2 }) {
  const query = start ? `startDocId=${start}&limit=${limit}` : `limit=${limit}`

  try {
    const response = await fetch(`${API_BASE_URL}/notes?${query}`)

    if (!response.ok) throw new Error("Failed to fetch notes")

    const rawNotes = await response.json()
    return rawNotes.map(note => normalizeNote(note))
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

    return normalizeNote(await response.json())
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

    const updatedNote = await response.json()

    return normalizeNote(updatedNote)
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

    const rawNote = await response.json()

    return normalizeNote(rawNote)
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