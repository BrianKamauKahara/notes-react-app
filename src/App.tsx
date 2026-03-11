import { useCallback, useEffect, useState, type ReactElement } from 'react'
import Book from './components/Book'

import './App.css'

function App(): ReactElement {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
