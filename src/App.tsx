import { useCallback, useEffect, useState, type ReactElement } from 'react'
import Book from './components/Book'
import { fetchNotesBatch, requestCreateNote, requestNoteUpdate, requestNoteDeletion } from './api/notes'
import './App.css'

// Note Types
import { type NormalizedNote as NoteType, type PassNoteDetails as NoteStructure } from './api/notes'

type NoteIdType = NoteType["id"]

export type NotesObjType = Record<NoteIdType, NoteType>


// Dev Functions
function randomTimePastTwoDays(): Date {
  const now = Date.now()
  const twoDaysAgo = now - 5 * 24 * 60 * 60 * 1000; // 2 days in ms
  const randomTimestamp = twoDaysAgo + Math.random() * (now - twoDaysAgo)
  return new Date(randomTimestamp)
}

function generateRandomContent(minWords: number = 8, maxWords: number = 80): string {
  const WORDS = [
    "grace", "light", "truth", "code", "logic",
    "faith", "hope", "build", "create", "learn",
    "think", "grow", "write", "peace", "order"
  ];

  if (minWords > maxWords) [minWords, maxWords] = [maxWords, minWords];

  const wordCount =
    Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;

  let content = "";

  for (let i = 0; i < wordCount; i++) {
    const randomWord =
      WORDS[Math.floor(Math.random() * WORDS.length)];
    content += randomWord + (i < wordCount - 1 ? " " : "");
  }

  return content
}


// Util Function
function computeNextBatchSize(max_length_allowed: number, currentLengthOfFetchedNotes: number, numNotesFetched: number): number {
  if (numNotesFetched === 0) return 2
  const averageNoteLength = currentLengthOfFetchedNotes / numNotesFetched
  const requiredNumNotes = Math.ceil((max_length_allowed - currentLengthOfFetchedNotes) / averageNoteLength)

  return requiredNumNotes
}

const convertNotesToObj = (noteArray: NoteType[]): NotesObjType => {
  const notesObj: NotesObjType = {}
  noteArray.forEach(note => {
    notesObj[note.id] = note
  })

  return notesObj
}

function App(): ReactElement {
  const MAX_ESTIMATED_LENGTH = 2500
  const [notes, setNotes] = useState<NotesObjType>({})
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const createNote = useCallback(async (noteDetails: NoteStructure): Promise<NoteType> => {
    try {
      const newNote: NoteType = await requestCreateNote(noteDetails)
      setNotes(prev => {
        return {
          [newNote.id]: newNote,
          ...prev
        }
      })
      return newNote
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  const updateNote = useCallback(async (noteId: NoteIdType, newDetails: NoteStructure): Promise<void> => {
    try {
      const newNote: NoteType = await requestNoteUpdate(noteId, newDetails)
      setNotes(prev => ({
        ...prev,
        [noteId]: newNote
      }))
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  const deleteNote = useCallback(async (noteId: NoteIdType): Promise<boolean> => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await requestNoteDeletion(noteId)
        setNotes(prev => {
          const { [noteId]: _, ...rest } = prev
          return rest
        })

        return true
      } catch (err) {
        console.error(err)
        throw err
      }
    } else {
      return false
    }
  }, [])

  const selectNote = useCallback((noteId: NoteIdType): NoteType | undefined => {
    return notes[noteId]
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const fetchedNotes: NoteType[] = []
    let totalFetchedLength: number = 0
    let nextBatchSize: number = 2

    const fetchNotesRecursively = async () => {
      if (totalFetchedLength >= MAX_ESTIMATED_LENGTH) return fetchedNotes

      const newNotes: NoteType[] =
        fetchedNotes.length !== 0
          ? await fetchNotesBatch({
            start: fetchedNotes[fetchedNotes.length - 1]!.id,
            limit: nextBatchSize
          })
          : await fetchNotesBatch({
            limit: nextBatchSize
          })

      if (!newNotes || newNotes.length === 0) {
        return fetchedNotes
      }

      fetchedNotes.push(...newNotes)

      const newNotesLength: number = newNotes.reduce((sum, note) => sum + note.content.length, 0)
      totalFetchedLength += newNotesLength
      nextBatchSize = computeNextBatchSize(MAX_ESTIMATED_LENGTH, totalFetchedLength, fetchedNotes.length)

      return fetchNotesRecursively()
    }

    fetchNotesRecursively() // Fetch a complete batch of notes
      .then(fetchedNotes => setNotes(prev => ({
        ...prev,
        ...convertNotesToObj(fetchedNotes)
      })))
      .catch((err: unknown) => {
        console.error(err)
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <>
      {!error ?
        <>
          <header className='main-header'>Jot It Down...</header>
          <main className="book-wrapper">
            {isLoading ?
              <div className="book-loading">Loading Your Notes...</div> :
              <Book notes={notes} selectNote={selectNote} createNote={createNote} updateNote={updateNote} deleteNote={deleteNote} />}

          </main>
        </> :
        <main className='error-wrapper'>
          <div className='error-container'>
            <h3>An Error has Occured :{'('}</h3>
            <hr /><br />
            <p>
              <strong>Message:</strong>{' '}
              {error.message || String(error)}
            </p>

            {error.stack && (
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {error.stack}
              </pre>
            )}
          </div>
        </main>}
    </>
  )
}

export default App
