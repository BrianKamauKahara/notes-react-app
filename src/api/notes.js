const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchNotesBatch({ start = null, limit = 2 }) {
  const query = start ? `startDocId=${start}&limit=${limit}` : `limit=${limit}`

  try {
    const response = await fetch(`${API_BASE_URL}/notes?${query}`)

    if (!response.ok) throw new Error("Failed to fetch notes")

    const result = await response.json()

    return result

  } catch (error) {
    console.error("Error fetching notes:", error);

    return []
  }
}

