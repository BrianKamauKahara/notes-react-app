import { useRef, useState } from 'react'
import Book from './components/Book'
import { fetchNotesBatch } from './api/notes';
import './App.css'

function randomTimePastTwoDays() {
  const now = Date.now()
  const twoDaysAgo = now - 5 * 24 * 60 * 60 * 1000; // 2 days in ms
  const randomTimestamp = twoDaysAgo + Math.random() * (now - twoDaysAgo)
  return new Date(randomTimestamp)
}


function computeNextBatchSize(max_length_allowed, currentLength, numNotesFetched) {
  const averageNoteLength = currentLength / numNotesFetched
  const requiredNumNotes = Math.ceil((max_length_allowed - currentLength) / averageNoteLength)

  return requiredNumNotes
}

function App() {
  const MAX_ESTIMATED_LENGTH = 2500
  const [fetchedNotes, setFetchedNotes] = useState([])
  const [totalFetchedLength, setTotalFetchedLength] = useState(0)
  const [nextBatchSize, setNextBatchSize] = useState(2)

  const fetchNotes = async () => {
    if (totalFetchedLength >= MAX_ESTIMATED_LENGTH) return

    // Fetch a batch of notes
    const newNotes = await (fetchNotesBatch({
      start: fetchedNotes.length ?? fetchedNotes[-1].id,
      limit: nextBatchSize,
      exclude: true
    }))

    if (newNotes.length === 0) {
      return
    }

    setFetchedNotes(prev => [...prev, newNotes])

    const newNotesLength = newNotes.reduce((sum, note) => sum + note.content.length, 0)
    setTotalFetchedLength(prev => prev + newNotesLength)
    calibrateBatchSize()

    await fetchNotes()
  }

  const calibrateBatchSize = () => {
    const newBatchSize = computeNextBatchSize(MAX_ESTIMATED_LENGTH, newNotesLength + fetchedNotes.length, newNotes.length)
    setNextBatchSize(newBatchSize)
  }

  const notes = Array.from({ length: 24 }).fill(0).map((_, i) =>
  ({
    id: i,
    title: "A Real Heading but it happens to be a bit long so what you gonna do this gon make the news",
    createdAt: randomTimePastTwoDays(),
    updatedAt: randomTimePastTwoDays(), // placeholder, illogical
    content: "Today I became a and then they did Today I became a Becuase it wasnt worh then they did Today I became a and eventually that resulted in became a Becuase it wasnt worh then they did Today I became a became a Becuase it wasnt worh then they did Today I became a "
  })).sort((a, b) => a.createdAt - b.createdAt)

  return (
    <>
      <header className='main-header'>Jot It Down...</header>
      <main className="book-wrapper">
        <Book notes={notes} />
      </main>
    </>
  )
}

export default App
