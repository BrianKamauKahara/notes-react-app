const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Database Note Document Types
export type DbDateObj = {
  _seconds: number,
  _nanoseconds: number
}

export type NoteDocument = {
  id: string,
  title: string,
  content: string,
  createdAt: DbDateObj,
  updatedAt: DbDateObj
}

export type PassNoteDetails = { // Details to be passed to db
  title: NoteDocument["title"],
  content: NoteDocument["content"]
}

export type DeletionFullfilment = {
  ack: string
}

// Normalized Note Types
export type NormalizedNote = Omit<NoteDocument, "createdAt" | "updatedAt"> & {
  createdAt: Date,
  updatedAt: Date
}

const normalizeDate = (rawDateObj: DbDateObj): Date => {
  return new Date(
    rawDateObj._seconds * 1000 +
    Math.floor(rawDateObj._nanoseconds / 1e6)
  )
}

const normalizeNote = (note: NoteDocument): NormalizedNote => {
  return {
    ...note,
    createdAt: normalizeDate(note.createdAt),
    updatedAt: normalizeDate(note.updatedAt)
  }
}

// Helper fetch and error functions
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`)

  return response.json() as Promise<T>
}

function handleFetchError(context: string, error: unknown): never {
  console.error(`${context}:`, error)
  throw error
}

// Actual DB functions
type FetchNotesBatchType = {
  start?: string,
  limit: number
}
async function fetchNotesBatch({ start, limit = 2 }: FetchNotesBatchType): Promise<NormalizedNote[]> {
  const query = start ? `startDocId=${start}&limit=${limit}` : `limit=${limit}`

  try {
    const rawNotes: NoteDocument[] = await fetchJSON<NoteDocument[]>(
      `${API_BASE_URL}/notes?${query}`
    )

    return rawNotes.map(note => normalizeNote(note))
  } catch (error) {
    handleFetchError('Failed to Fetch Notes', error)
  }
}

async function requestCreateNote(noteDetails: PassNoteDetails): Promise<NormalizedNote> {
  try {
    const rawNote = await fetchJSON<NoteDocument>(
      `${API_BASE_URL}/notes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteDetails)
      }
    )

    return normalizeNote(rawNote)
  } catch (error) {
    handleFetchError('Failed to Create Note', error)
  }
}

async function requestNoteUpdate(noteId: NoteDocument["id"], noteDetails: Partial<PassNoteDetails>): Promise<NormalizedNote> {
  try {
    const rawUpdatedNote = await fetchJSON<NoteDocument>(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteDetails)
    }
    )

    return normalizeNote(rawUpdatedNote)
  } catch (error) {
    handleFetchError('Failed to Update Note', error)
  }
}

async function requestSpecificNote(noteId: NoteDocument["id"]): Promise<NormalizedNote> {
  try {
    const rawNote = await fetchJSON<NoteDocument>(`${API_BASE_URL}/notes/${noteId}`)
    return normalizeNote(rawNote)
  } catch (error) {
    handleFetchError('Failed to Obtain Note', error)
  }
}

async function requestNoteDeletion(noteId: NoteDocument["id"]): Promise<DeletionFullfilment> {
  try {
    const acknowledgement = await fetchJSON<DeletionFullfilment>(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE'
    })

    return acknowledgement
  } catch (error) {
    handleFetchError('Failed to Delete', error)
  }
}

export {
  fetchNotesBatch,
  requestCreateNote,
  requestSpecificNote,
  requestNoteUpdate,
  requestNoteDeletion
}