const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function fetchNotesBatch({ start = null, limit = 2 }) {
  const query = start ? `startDocId=${start}&limit=${limit}` : `limit=${limit}`

  try {
    const response = await fetch(`${API_BASE_URL}/notes?${query}`)

    if (!response.ok) throw new Error("Failed to fetch notes")

    const result = await response.json()

    return result

  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error
  }
}

async function requestNoteUpdate(noteDetails) {
  try {
    const response = await fetch(`${API_BASE_URL}/note/${noteDetails.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteDetails)
    }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const updatedNote = await response.json()
    return updatedNote
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error
  }
}

export {
  fetchNotesBatch,
  requestNoteUpdate
}