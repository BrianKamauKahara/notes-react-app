import { useEffect, useState } from "react";
import "../css/NoteForm.css";

const modifyNote = (rawNote) => {
    const rawDates = [rawNote.createdAt, rawNote.updatedAt];
    const [createdAt, updatedAt] = rawDates.map((rawDate) => {
      const date = new Date(rawDate);
      const day = `${date.getFullYear()} ${date.getMonth() + 1} ${date.getDate()}`;
      const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        date,
        day,
        time,
        string: `${date.toDateString()}, ${time}`,
      };
    });

    const hasBeenEdited = createdAt.date.getTime() !== updatedAt.date.getTime();
    const editedInSameDay = hasBeenEdited && createdAt.day === updatedAt.day;

    return {
        ...rawNote,
        createdAt,
        updatedAt,
        hasBeenEdited,
        editedInSameDay
    }
}

export default function NoteForm({ note: rawNote, create }) {
  const [isModifying, setIsModifying] = useState(false);
  const [isCreating, setIsCreating] = useState(create);
  const [note, setNote] = useState(isCreating ? null : modifyNote(rawNote));
  const [isLoaded, setIsLoaded] = useState(true);

  
  return (
    <div className="form-wrapper">
      <div className="form-container">
        <form action="" className="note-form">
          <header className="form-note-heading">
            {isCreating ? (
              "New Note"
            ) : (
              <div className="form-times-wrapper">
                <time
                  className="form-note-time form-note-time-created"
                  dateTime={note.createdAt.date.toISOString()}
                >
                  {note.createdAt.string}
                </time>
                {note.hasBeenEdited && (
                  <time
                    className="form-note-time form-note-time-updated"
                    dateTime={note.updatedAt.date.toISOString()}
                  >
                    last edited -{" "}
                    {note.editedInSameDay ? note.updatedAt.time : note.updatedAt.string}
                  </time>
                )}
              </div>
            )}
          </header>

          <label htmlFor="note-title" className="form-note-title">
            Title:
            <input
              className="note-title-input"
              type="text"
              name="note-title"
              defaultValue={note?.title}
              readOnly={!isModifying}
            />
          </label>

          <label htmlFor="note-content" className="form-note-content">
            <textarea
              className="note-content-input"
              type="text"
              name="note-content"
              defaultValue={note?.content}
              readOnly={!isModifying}
            ></textarea>
          </label>
          <nav className="form-buttons-wrapper">
            <button className="form-btn save-note-btn" type="submit">
              Save
            </button>
            <button
              className="form-btn edit-note-btn"
              type="button"
              onClick={() => setIsModifying(!isModifying)}
            >
              {isModifying ? "Lock" : "Edit"}
            </button>
            <button className="form-btn delete-note-btn" type="button">
              Trash
            </button>
          </nav>
        </form>
      </div>
    </div>
  );
}
