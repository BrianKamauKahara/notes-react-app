import { useLayoutEffect, useRef, useState, Fragment, type ReactElement, useReducer } from "react";
import "../css/Book.css"
import Note from "./Note";
import NoteForm from "./NoteForm";
import CreateNoteIcon from "../assets/svg/createNoteIcon";

// Types
import { type NormalizedNote as NoteType, type PassNoteDetails as NoteStructure } from "../api/notes";
import { type NotesStateType } from "../context/NotesProvider";
import useNotes from "../hooks/useNotes";
type DateString = `${number}-${string | number}-${string | number}`

type DisplayObjType = {
  [key: DateString]: NoteType[]
}

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

const getCurrentDayFrom = (date: Date): DateString => {
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
type FormStateType = {
  selectedNoteId: NoteType["id"] | null,
  formOpen: boolean
}

type BookStateType = {
  columnWidth: number,
  columnCount: number,
  currentDisplayedColumns: [number, number]
} & FormStateType

const initBookState: BookStateType = {
  columnWidth: 0,
  columnCount: 2,
  currentDisplayedColumns: [1, 2],

  selectedNoteId: '',
  formOpen: false
}

// Reducer
export const FORM_REDUCER_ACTIONS = {
  OPEN_FORM: "OPEN_FORM",
  CLOSE_FORM: "CLOSE_FORM"
} as const
type FORM_ACTION_PAYLOADS = {}
export type FORM_PAYLOAD_TYPES = FORM_ACTION_PAYLOADS[keyof FORM_ACTION_PAYLOADS]

export const NOTE_REDUCER_ACTIONS = {
  NEW_NOTE_CREATED: "NEW_NOTE_CREATED",
  NOTE_UPDATED: "NOTE_UPDATED",
  NOTE_DELETED: "NOTE_DELETED",
}
type NOTE_ACTION_PAYLOADS = {
  NEW_NOTE_CREATED: NoteType,
  NOTE_UPDATED: NoteStructure & Pick<NoteType, "updatedAt">
  NOTE_DELETED: NoteType["id"]
}
export type NOTE_PAYLOAD_TYPES = NOTE_ACTION_PAYLOADS[keyof NOTE_ACTION_PAYLOADS]

const BOOK_REDUCER_ACTIONS = {
  SET_NEW_COLUMNS: "SET_NEW_COLUMNS",
  GO_NEXT_PAGES: "GO_NEXT_PAGES",
  GO_PREVIOUS_PAGES: "GO_PREVIOUS_PAGES",
  ...FORM_REDUCER_ACTIONS,
  ...NOTE_REDUCER_ACTIONS
} as const
type BOOK_REDUCER_PAYLOADS = {
  SET_NEW_COLUMNS: { totalWidth: number, viewingWidth: number },
} & FORM_ACTION_PAYLOADS & NOTE_PAYLOAD_TYPES

type BookReducerAction = {
  [K in keyof BookReducerActionsType]:
  { type: K } &
  (K extends keyof BOOK_REDUCER_PAYLOADS
    ? { payload?: BOOK_REDUCER_PAYLOADS[K] }
    : {})
}[keyof BookReducerActionsType]

type BookReducerActionsType = typeof BOOK_REDUCER_ACTIONS


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

    // Form Actions
    case "OPEN_FORM": {
      return { ...state, formOpen: true }
    }
    case "CLOSE_FORM": {
      return { ...state, formOpen: false }
    }
  }
}

export default function Book() {
  const bookRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([null, null]);

  const { notes, createNote, updateNote, deleteNote, selectNote } = useNotes()
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
    const el = buttonRefs.current[i] as HTMLButtonElement
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  }

  const transformPage = (i: number): void => {
    if (i === 0) {
      // Previous Page
      if (currentDisplayedColumns[0] === 1) return changeRed(0);
      dispatch({ type: "GO_PREVIOUS_PAGES" })
    } else {
      // Next Page
      if (currentDisplayedColumns[1] === state.columnCount) return changeRed(1);
      dispatch({ type: "GO_NEXT_PAGES" })

    }
  }

  // Form features
  function openForm(id?: NoteType["id"]) {
    dispatch({ type: "OPEN_FORM" })
  }

  const selectNote = (noteId) => {
    setSelectedNoteId(noteId);
    openForm('update')
  }

  const deleteNote = async (noteId) => {
    const isDeleted = await deleteNote(noteId)
    if (isDeleted) {
      selectNote(null)
      openForm('create')
    }
    return isDeleted
  }
  function closeForm() {
    selectNote(null)
    setFormState((prev) => ({ ...prev, isOpen: false, mode: null }))
  }


  // Rendeering Page functions
  const renderNotes = () => {
    const groupedNotes = groupNotesByDay(notes)

    return Object.keys(groupedNotes).map((day) => {
      const dayEl = getDayElFrom(day)
      const noteEls = groupedNotes[day].map(note => (
        <Note
          key={note.id}
          onSelect={() => selectNote(note.id)}
          onDelete={() => deleteNote(note.id)}
          {...note} />
      ));
      return (
        <Fragment key={day}>
          {dayEl}
          {noteEls}
        </Fragment>
      )
    })
  }

  return (
    <>
      <button
        className="new-note-btn"
        onClick={() => openForm('create')}
        disabled={formState.isOpen}
      >
        <CreateNoteIcon />
      </button>{" "}
      <br />
      <div className="book-container">
        <div
          ref={bookRef}
          className="book"
          style={{
            transform: `translateX(-${transformPx}px)`,
            transition: "transform 0.5s ease",
          }}
        >
          {renderNotes()}
        </div>
      </div>
      {formState?.isOpen && (
        <div className="form-wrapper">
          <NoteForm
            note={notes[selectedNoteId]}
            mode={formState.mode}
            selectNote={selectNote}
            deleteNote={deleteNote}
            createNote={createNote}
            updateNote={updateNote}
            closeForm={closeForm}
          />
        </div>
      )}
      <button
        id="prev-page-btn"
        ref={(el) => (buttonRefs.current[0] = el)}
        className="page-switch-btn"
        onClick={() => transformPage(0)}
      >
        {"<"}
      </button>
      <button
        id="next-page-btn"
        ref={(el) => (buttonRefs.current[1] = el)}
        className="page-switch-btn"
        onClick={() => transformPage(1)}
      >
        {">"}
      </button>
    </>
  );
}
