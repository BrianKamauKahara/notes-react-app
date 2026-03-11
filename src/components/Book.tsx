import { useLayoutEffect, useRef, useState, Fragment, type ReactElement } from "react";
import "../css/Book.css"
import Note from "./Note";
import NoteForm from "./NoteForm";
import CreateNoteIcon from "../assets/svg/createNoteIcon";

// Types
import { type NormalizedNote as NoteType } from "../api/notes";
import { type NotesObjType } from "../App";
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

const groupNotesByDay = (notesObj: NotesObjType): DisplayObjType => {
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
type BookPropsType = {
  notes: NotesObjType,

}

export default function Book(props) {
  const bookRef = useRef(null);
  const buttonRefs = useRef([null, null]);

  const [columnWidth, setColumnWidth] = useState(0);
  const [columnCount, setColumnCount] = useState(0);

  const [currentDisplayedColumns, setCurrentDisplayedColumns] = useState([
    1, 2,
  ]);
  const [transformPx, setTransformPx] = useState(0);

  const [formState, setFormState] = useState({ isOpen: false, mode: null })
  const [selectedNoteId, setSelectedNoteId] = useState(null);


  // Book navigation features
  useLayoutEffect(() => {
    if (bookRef.current) {
      const totalWidth = bookRef.current.scrollWidth;
      const viewingWidth = bookRef.current.clientWidth;

      setColumnWidth(viewingWidth / 2);

      const columnCount = Math.round(totalWidth / (viewingWidth / 2));
      setColumnCount(columnCount === 1 ? 2 : columnCount);

    }
  }, [props.notes])

  const changeRed = (i) => {
    const el = buttonRefs.current[i];
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  }

  const transformPage = (i) => {
    if (i === 0) {
      // Previous Page
      if (currentDisplayedColumns[0] === 1) return changeRed(0);

      setTransformPx((prev) => prev - columnWidth);
      setCurrentDisplayedColumns((prev) => prev.map((v) => v - 1));
    } else {
      // Next Page
      if (currentDisplayedColumns[1] === columnCount) return changeRed(1);

      setTransformPx((prev) => prev + columnWidth);
      setCurrentDisplayedColumns((prev) => prev.map((v) => v + 1));
    }
  }

  // Form features
  function openForm(mode) {
    setFormState(prev => ({ ...prev, isOpen: true, mode: mode }))
  }

  const selectNote = (noteId) => {
    setSelectedNoteId(noteId);
    openForm('update')
  }

  const deleteNote = async (noteId) => {
    const isDeleted = await props.deleteNote(noteId)
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
    const groupedNotes = groupNotesByDay(props.notes)

    return Object.keys(groupedNotes).map((day) => {
      const dayEl = getDayElFrom(day)
      const noteEls = groupedNotes[day].map(note => (
        <Note
          key={note.id}
          onSelect={() => selectNote(note.id)}
          onDelete={() => props.deleteNote(note.id)}
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
            note={props.notes[selectedNoteId]}
            mode={formState.mode}
            selectNote={selectNote}
            deleteNote={deleteNote}
            createNote={props.createNote}
            updateNote={props.updateNote}
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
