import { useEffect, useState } from 'react'
import Book from './components/Book'
import { fetchNotesBatch, requestCreateNote, requestNoteUpdate, requestSpecificNote, requestNoteDeletion } from './api/notes';
import './App.css'

function randomTimePastTwoDays() {
  const now = Date.now()
  const twoDaysAgo = now - 5 * 24 * 60 * 60 * 1000; // 2 days in ms
  const randomTimestamp = twoDaysAgo + Math.random() * (now - twoDaysAgo)
  return new Date(randomTimestamp)
}

function generateRandomContent(minWords = 8, maxWords = 80) {
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

function computeNextBatchSize(max_length_allowed, currentLengthOfFetchedNotes, numNotesFetched) {
  const averageNoteLength = currentLengthOfFetchedNotes / numNotesFetched
  const requiredNumNotes = Math.ceil((max_length_allowed - currentLengthOfFetchedNotes) / averageNoteLength)

  return requiredNumNotes
}

const convertNotesToObj = (noteArray) => {
    const notesObj = {}
    noteArray.forEach(note => {
      notesObj[note.id] = note
    })
  
    return notesObj
}

function App() {
  const MAX_ESTIMATED_LENGTH = 2500
  const [notes, setNotes] = useState({})
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function createNote(noteDetails) {
    try {
      const newNote = await requestCreateNote(noteDetails)
      setNotes(prev => {
        return {
          [newNote.id] : newNote,
          ...prev
      }})
      return newNote
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async function updateNote(noteId, newDetails) {
    try {
      const newNote = await requestNoteUpdate(noteId, newDetails)
      setNotes(prev => ({
        ...prev,
        [noteId] : newNote
      }))
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async function deleteNote(noteId) {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await requestNoteDeletion(noteId)
        setNotes(prev => {
          const {[noteId]: _, ...rest} = prev
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
  }

  function selectNote(noteId) {
    return notes[noteId]
  }

  useEffect(() => {
    setIsLoading(true)
    const fetchedNotes = []
    let totalFetchedLength = 0
    let nextBatchSize = 2

    const fetchNotesRecursively = async () => {
      if (totalFetchedLength >= MAX_ESTIMATED_LENGTH) return fetchedNotes

      const newNotes = await fetchNotesBatch({
              start: fetchedNotes.length ? fetchedNotes[fetchedNotes.length - 1].id : undefined,
              limit: nextBatchSize
      })

      if (!newNotes || newNotes.length === 0) {
        return fetchedNotes
      }

      fetchedNotes.push(...newNotes)

      const newNotesLength = newNotes.reduce((sum, note) => sum + note.content.length, 0)
      totalFetchedLength += newNotesLength
      nextBatchSize = computeNextBatchSize(MAX_ESTIMATED_LENGTH, totalFetchedLength, fetchedNotes.length)

      return fetchNotesRecursively()
    }
    
    fetchNotesRecursively() // Fetch a complete batch of notes
      .then(fetchedNotes => setNotes(prev => ({
        ...prev,
        ...convertNotesToObj(fetchedNotes)
      })))
      .catch(err => {
        console.error(err)
        setError(err.message)})
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
            <Book notes={notes} selectNote={selectNote} createNote={createNote} updateNote={updateNote} deleteNote={deleteNote}/>}

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
