import { useEffect, useRef, useState } from 'react'
import Book from './components/Book'
import { fetchNotesBatch } from './api/notes';
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

function App() {
  const MAX_ESTIMATED_LENGTH = 2500
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  
  const testNotes = Array.from({ length: 13 }).fill(0).map((_, i) =>
  ({
    id: i,
    title: "Short Heading",
    createdAt: randomTimePastTwoDays(),
    updatedAt: randomTimePastTwoDays(), // placeholder, illogical
    content: generateRandomContent()
  })).sort((a, b) => a.createdAt - b.createdAt)

  useEffect(() => {
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
    
    /* fetchNotesRecursively()
      .then(fetchedNotes => setNotes(fetchedNotes))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false)) */
  }, [])


  console.log(notes)
  return (
    <>
      <header className='main-header'>Jot It Down...</header>
      <main className="book-wrapper">
        <Book notes={testNotes} />
      </main>
    </>
  )
}

export default App
