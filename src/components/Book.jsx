import { useLayoutEffect, useRef, useState, useEffect, Fragment } from "react";
import "../css/Book.css";
import Note from "./Note";
import NoteForm from "./NoteForm";
import CreateNoteIcon from "../assets/svg/createNoteIcon";

const getCurrentDayFrom = (timestamp) => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDayElFrom = (day) => {
  const [y, m, d] = day.split("-");
  const date = new Date(y, m - 1, d);

  return (
    <time dateTime={date} className="notes-day">
      {date.toDateString()}
    </time>
  );
};

const convertNotesToObj = (rawNotes) => {
  const notesObj = {};

  rawNotes.forEach((note) => {
    const noteDay = getCurrentDayFrom(note.createdAt);

    if (!notesObj[noteDay]) {
      notesObj[noteDay] = [];
    }

    notesObj[noteDay].push(note);
  });

  return notesObj;
};

export default function Book({ notes: rawNotes }) {
  const bookRef = useRef(null);
  const buttonRefs = useRef([null, null]);

  const [columnWidth, setColumnWidth] = useState(0);
  const [columnCount, setColumnCount] = useState(0);

  const [currentDisplayedColumns, setCurrentDisplayedColumns] = useState([
    1, 2,
  ]);
  const [transformPx, setTransformPx] = useState(0);

  const [notes, setNotes] = useState(() => convertNotesToObj(rawNotes));
  const [formState, setFormState] = useState({
    isOpen: false,
    isLoading: false,
    mode: "update",
    newChanges: {},
  });
  const [selectedNote, setSelectedNote] = useState(null);

  useLayoutEffect(() => {
    if (bookRef.current) {
      const totalWidth = bookRef.current.scrollWidth;
      const viewingWidth = bookRef.current.clientWidth;

      setColumnWidth(viewingWidth / 2);

      const columnCount = Math.round(totalWidth / (viewingWidth / 2));
      setColumnCount(columnCount === 1 ? 2 : columnCount);

      console.log(viewingWidth, columnCount);
    }
  }, [notes]);

  useEffect(() => {
    setNotes(convertNotesToObj(rawNotes));
  }, [rawNotes]);

  const changeRed = (i) => {
    const el = buttonRefs.current[i];
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  };

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
  };

  const selectNote = (day, noteIndex) => {
    setSelectedNote(notes[day][noteIndex]);
    setFormState((prev) => ({ ...prev, isOpen: true, mode: "update" }));
  };

  const modifyNote = (mode, { noteDay, noteIndex, newNote } = {}) => {
    console.log('Modifying stored note')
    console.log(mode, noteDay, noteIndex, newNote);
    if (mode === "create") {
      const newNoteDay = getCurrentDayFrom(newNote.createdAt);

      setNotes((prevNotes) => {
        const updatedDayNotes = prevNotes[newNoteDay]
          ? [newNote, ...prevNotes[newNoteDay]]
          : [newNote];

        return {
          ...prevNotes,
          [newNoteDay]: updatedDayNotes,
        };
      });
    } else if (mode === "update") {
      setNotes((prevNotes) => {
        console.log(prevNotes)

        return ({
        ...prevNotes,
        [noteDay]: prevNotes[noteDay].map((note, i) =>
          i === noteIndex ? newNote : note,
        ),
      })});
    } else if (mode === "delete") {
      setNotes((prevNotes) => {
        const { [noteDay]: dayNotes, ...rest } = prevNotes;

        if (dayNotes.length === 1) {
          return rest;
        } else {
          return {
            ...rest,
            [noteDay]: dayNotes.filter((_, i) => i !== noteIndex),
          };
        }
      });
    }
  };

  console.log(notes)
  const pageEls = Object.keys(notes)
    .sort((a, b) => b.localeCompare(a))
    .map((day) => {
      const dayEl = getDayElFrom(day);
      const noteEls = notes[day].map((note, i) => (
        <Note key={note.id} select={() => selectNote(day, i)} {...note} />
      ));
      console.log(noteEls)
      return (
        <Fragment key={day}>
          {dayEl}
          {noteEls}
        </Fragment>
      );
    });

  return (
    <>
      <button
        className="new-note-btn"
        onClick={() => {
          setFormState((prev) => ({ ...prev, isOpen: true, mode: "create" }));
        }}
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
          {pageEls}
        </div>
      </div>
      {formState?.isOpen && (
        <div className="form-wrapper">
          <button
            className="close-form-btn"
            type="button"
            onClick={() => {
                console.log(formState.mode, formState.isLoading)
                if (formState.isLoading) {
                console.log('you!')
                return //temporary
                }
              if (Object.keys(formState.newChanges).length !== 0) {
                modifyNote(formState.mode, formState.newChanges);
              } 
              setFormState((prev) => ({ ...prev, isOpen: false }));
            }}
          ></button>
          <NoteForm
            note={selectedNote}
            mode={formState.mode}
            onChanges={setFormState}
            asLoading={setFormState}
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
