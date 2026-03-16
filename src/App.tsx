import { type ReactElement } from 'react'
import useNotes from './hooks/useNotes'
import Book from './components/Book'
import Error from './components/MainPageError'
import './App.css'

function App(): ReactElement {
  const { loading, error } = useNotes()
  // console.log(loading)

  return (
    <>
      {!error ?
        <>
          <header className='main-header'>Jot It Down...</header>
          <main className="book-wrapper">
            {loading ?
              <div className="book-loading">Loading Your Notes...</div> :
              <Book />
            }
          </main>
        </> :
        <Error error={error} />}
    </>
  )
}

export default App
