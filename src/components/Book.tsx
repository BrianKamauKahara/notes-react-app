import { useLayoutEffect, useRef, Fragment, type ReactElement, useReducer } from "react";
import "../css/Book.css"
import Note from "./Note";
import NoteForm from "./NoteForm";
import CreateNoteButton from "./CreateNoteButton";


// Types
import { type NormalizedNote as NoteType } from "../api/notes";
import { type NotesStateType } from "../context/NotesProvider";
export type DateString = `${number}-${string}-${string}`
type DisplayObjType = Record<DateString, NoteType[]>

// Custom Hooks
import useNotes from "../hooks/useNotes";

// Util functions
function getDayElFrom(day: DateString): ReactElement {
  const [y, m, d] = day.split("-").map(Number) as [number, number, number]

  const date = new Date(y, m - 1, d);

  return (
    <time dateTime={day} className="notes-day">
      {date.toDateString()}
    </time>)
    ;
}

export const getCurrentDayFrom = (date: Date): DateString => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const groupNotesByDay = (notesObj: NotesStateType): DisplayObjType => {
  return Object.entries(notesObj).reduce((displayObj, [_, note]) => {
    const noteDay = getCurrentDayFrom(note.createdAt)

    if (!displayObj[noteDay]) {
      displayObj[noteDay] = []
    }

    displayObj[noteDay].push(note)

    return displayObj
  }, {} as DisplayObjType)
}

// Actual Book Prop
// States and Init State
type BookStateType = {
  columnWidth: number,
  columnCount: number,
  currentDisplayedColumns: [number, number],
  formOpen: boolean,
  selectedNoteId: NoteType["id"] | null
}
const initBookState: BookStateType = {
  columnWidth: 0,
  columnCount: 2,
  currentDisplayedColumns: [1, 2],
  formOpen: false,
  selectedNoteId: null
}

// Reducer 
const BOOK_REDUCER_ACTIONS = {
  SET_NEW_COLUMNS: "SET_NEW_COLUMNS",
  GO_NEXT_PAGES: "GO_NEXT_PAGES",
  GO_PREVIOUS_PAGES: "GO_PREVIOUS_PAGES",
  OPEN_FORM: "OPEN_FORM",
  CLOSE_FORM: "CLOSE_FORM"
} as const
type BOOK_REDUCER_PAYLOADS = {
  SET_NEW_COLUMNS: { totalWidth: number, viewingWidth: number },
  OPEN_FORM: NoteType["id"] | undefined
}

type BookReducerAction = {
  [K in keyof typeof BOOK_REDUCER_ACTIONS]:
  { type: K } &
  (K extends keyof BOOK_REDUCER_PAYLOADS
    ? (undefined extends BOOK_REDUCER_PAYLOADS[K]
      ? { payload?: BOOK_REDUCER_PAYLOADS[K] }
      : { payload: BOOK_REDUCER_PAYLOADS[K] })
    : {})
}[keyof typeof BOOK_REDUCER_ACTIONS]



const bookReducer = (state: BookStateType, action: BookReducerAction): BookStateType => {
  switch (action.type) {
    // Book Actions
    case "SET_NEW_COLUMNS": {
      const { totalWidth, viewingWidth } = action.payload

      return { ...state, columnWidth: viewingWidth / 2, columnCount: Math.round(totalWidth / (viewingWidth / 2)) }
    }
    case "GO_NEXT_PAGES": {
      return { ...state, currentDisplayedColumns: state.currentDisplayedColumns.map(v => v + 1) as [number, number] }
    }
    case "GO_PREVIOUS_PAGES": {
      return { ...state, currentDisplayedColumns: state.currentDisplayedColumns.map(v => v - 1) as [number, number] }
    }
    case "OPEN_FORM": {
      const noteId = action.payload || null

      return { ...state, formOpen: true, selectedNoteId: noteId }
    }
    case "CLOSE_FORM": {
      return { ...state, formOpen: false, selectedNoteId: null }
    }
  }
}

export default function Book() {
  const bookRef = useRef<HTMLDivElement>(null)
  const prevPageBtnRef = useRef<HTMLButtonElement>(null)
  const nextPageBtnRef = useRef<HTMLButtonElement>(null)

  const { notes, selectNote } = useNotes()
  const [state, dispatch] = useReducer(bookReducer, initBookState)

  // Book navigation features
  useLayoutEffect(() => {
    if (bookRef.current) {
      const totalWidth = bookRef.current.scrollWidth;
      const viewingWidth = bookRef.current.clientWidth;

      dispatch({
        type: "SET_NEW_COLUMNS",
        payload: { totalWidth, viewingWidth }
      })

    }
  }, [notes])

  const changeRed = (i: 0 | 1): void => {
    const ref = i === 0 ? prevPageBtnRef : nextPageBtnRef

    const el = ref.current
    if (!el) return

    el.classList.remove("flash")
    void el.offsetWidth
    el.classList.add("flash")
  }

  const transformPage = (i: number): void => {
    if (i === 0) {
      // Previous Page
      if (state.currentDisplayedColumns[0] === 1) return changeRed(0);
      dispatch({ type: "GO_PREVIOUS_PAGES" })
    } else {
      // Next Page
      if (state.currentDisplayedColumns[1] === state.columnCount) return changeRed(1);
      dispatch({ type: "GO_NEXT_PAGES" })

    }
  }

  // Form features
  const openBlankForm = () =>
    dispatch({ type: "OPEN_FORM" })

  const openFilledForm = (noteId: NoteType["id"]) =>
    dispatch({ type: "OPEN_FORM", payload: noteId })

  const closeForm = () =>
    dispatch({ type: "CLOSE_FORM" })


  // Rendeering Page functions
  function getNoteElFrom(note: NoteType) {
    return <Note
      key={note.id}
      onSelect={() => { openFilledForm(note.id) }}
      note={note}
    />
  }

  const renderNotes = () => {
    const groupedNotes: DisplayObjType = groupNotesByDay(notes)

    return (Object.keys(groupedNotes) as DateString[])
      .map((day: keyof typeof groupedNotes) => {
        const dayEl = getDayElFrom(day)
        const noteEls = groupedNotes[day]?.map(note => getNoteElFrom(note))

        return (
          <Fragment key={day}>
            {dayEl}
            {noteEls}
          </Fragment>
        )
      })
  }
  const renderedNotes = renderNotes()
  const transformPx = (state.currentDisplayedColumns[0] - 1) * state.columnWidth
  return (
    <>
      < CreateNoteButton
        isDisabled={state.formOpen}
        onClick={openBlankForm}
      />

      <div className="book-container">
        <div
          ref={bookRef}
          className="book"
          style={{
            transform: `translateX(-${transformPx}px)`,
            transition: "transform 0.5s ease",
          }}
        >
          {renderedNotes}
        </div>
      </div>

      {state.formOpen && (
        <NoteForm
          note={state.selectedNoteId ? selectNote(state.selectedNoteId) : undefined}
          openFilledForm={openFilledForm}
          openBlankForm={openBlankForm}
          closeForm={closeForm}
        />

      )}

      <button
        id="prev-page-btn"
        ref={prevPageBtnRef}
        className="page-switch-btn"
        onClick={() => transformPage(0)}
      >
        {"<"}
      </button>
      <button
        id="next-page-btn"
        ref={nextPageBtnRef}
        className="page-switch-btn"
        onClick={() => transformPage(1)}
      >
        {">"}
      </button>
    </>
  );
}

