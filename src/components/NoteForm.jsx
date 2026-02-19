import { useEffect, useState } from "react";
import "../css/NoteForm.css";
import { requestSpecificNote, requestNoteUpdate, requestNoteDeletion, requestCreateNote } from "../api/notes"

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

const validateNote = ({ oldTitle, newTitle, oldContent, newContent, mode }) => {
    if (!newTitle || !newContent) return {
        isValid: false,
        reason: `${!newTitle ? 'Content' : 'Title'} must be a non-empty string`
    }

    if (mode !== 'create') {
        if (oldTitle === newTitle && oldContent === newContent) {
            return {
                isValid: false,
                reason: `Old Note cannot be the same as the new note`
            }
        }
    }

    return {
        isValid: true
    }
}

export default function NoteForm({ note: rawNote, mode }) {
    const [formMode, setFormMode] = useState(mode);
    const [note, setNote] = useState(() => (formMode === 'create' ? null : modifyNote(rawNote)))
    const [isModifying, setIsModifying] = useState(formMode === 'create');
    const [formData, setFormData] = useState({
        title: note?.title || "",
        content: note?.content || ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [feedBack, setFeedback] = useState(null)


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = validateNote({
            oldTitle: note?.title,
            oldContent: note?.content,
            newTitle: formData.title,
            newContent: formData.content,
            mode: formMode
        })

        if (!result.isValid) {
            return displayInvalidMessage(result.reason)
        }

        try {
            setIsLoading(true)
            let result
            if (formMode === 'create') {
                result = await requestCreateNote(formData)
                setFormMode('update')
                setFeedback("Created Note Succesfully")
            } else {
                result = await requestNoteUpdate(note.id, formData)
                setFeedback("Updated Note Succesfully")
            }
            const newNote = await requestSpecificNote(result.id)
            setNote(modifyNote(newNote))
            setIsModifying(false)
        } catch (err) {
            setFeedback("An Error has Occured")
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const displayInvalidMessage = (reason) => {
        setIsError(true)
        setFeedback(reason)
    }

    function renderHeader() {
        if (formMode === "create") return "New Note";

        if (formMode === "update" && !isLoading) {
            return (
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
            );
        }

        return (
            <div>
                <div className="spinner"></div>
                <span>{formMode === 'create' ? 'Creating note...' : 'Updating note...'}</span>
            </div>
        )
    }

    return (
        <div className="form-container">
            <form action="" onSubmit={handleSubmit} className="note-form">
                <header className="form-note-heading">
                    {renderHeader()}
                </header>

                <label htmlFor="note-title" className="form-note-title">
                    Title:
                    <input
                        className="note-title-input"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        readOnly={!isModifying}
                        autoFocus={mode ==='create'}
                    />
                </label>

                <label htmlFor="note-content" className="form-note-content">
                    <textarea
                        className="note-content-input"
                        type="text"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        readOnly={!isModifying}
                    ></textarea>
                </label>
                {feedBack && <div className={`feedback-display ${isError ? 'feedback-display-error' : ""}`}>{feedBack}</div>}
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
    );
}
