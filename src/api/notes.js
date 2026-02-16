const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchNotesBatch({ start = null, limit = 2 }) {
  try {
    const response = await fetch(`${API_BASE_URL}/notes?startDocId=${start}&limit=${limit}`)
    if (!response.ok) throw new Error("Failed to fetch notes")

    const result = await response.json();
    return result?.data
  } catch (error) {
    console.error("Error fetching notes:", error);
    return []
  }
}

