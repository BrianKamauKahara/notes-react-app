import { useReducer, useState } from "react";
import "../css/NoteForm.css";
import { requestSpecificNote, requestNoteUpdate, requestNoteDeletion, requestCreateNote } from "../api/notes"

const getCurrentDayFrom = (timestamp) => {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isSameDay(date1, date2) {
  if (!date1 || !date2) return false

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
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

const initialFormState = {
    modifying: true,
    feedBack: "",
    loading: false,
    error: null,
    currentAction: null
}

export default function NoteForm(props) {
    // Form Controlled
    const [formData, setFormData] = useState({
        title: props.note?.title || "",
        content: props.note?.content || ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const clearFormContents = () => {
        setFormData({ title: "", content: ""})
    }

    // Form State Handling
    const [state, dispatch] = useReducer(reducer, initialFormState)

    function reducer(state, action) {
        switch (action.type) {
            case "TOGGLE_MODIFICATION": 
                return state.loading
        ? state
        : { ...state, modifying: !state.modifying }
            case "FORM_START_LOADING":
                return { ...state, loading: true, error: null, modifying: false, currentAction: action.payload }

            case "CREATED_NOTE_SUCCESFULLY":
                return { ...state, feedBack: 'Created Note Succesfully', error: null }

            case "UPDATED_NOTE_SUCCESFULLY":
                return { ...state, feedBack: 'Updated Note Succesfully', error: null }

            case "DELETED_NOTE_SUCCESFULLY":
                return { ...state, feedBack: 'Deleted Note Succsesfully', error: null }

            case "FORM_STOP_LOADING":
                return { ...state, currentAction: null, loading: false, modifying: true }

            case "OBTAINED_ERROR":
                console.log(action.payload?.error)
                return { ...state, error: action.payload.error || true, feedBack: action.payload.feedBack || 'An Error Has Occured' }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = validateNote({
            oldTitle: props.note?.title,
            oldContent: props.note?.content,
            newTitle: formData.title,
            newContent: formData.content,
            mode: props.mode
        })

        if (!result.isValid) {
            return displayInvalidMessage(result.reason)
        }

        try {
            dispatch({
                type: "FORM_START_LOADING",
                payload: 'create'
            })

            let result
            if (props.mode === 'create') {
                const newNote = await props.createNote(formData)
                props.selectNote(newNote.id)
                dispatch({
                    type: 'CREATED_NOTE_SUCCESFULLY',
                })

            } else {
                await props.updateNote(props.note.id, formData)
                dispatch({
                    type: 'UPDATED_NOTE_SUCCESFULLY',
                })
            }

        } catch (err) {
            dispatch({
                type: 'OBTAINED_ERROR',
                payload: { error: err }
            })
        } finally {
            dispatch({
                type: 'FORM_STOP_LOADING'
            })
        }
    }

    const handleDelete = async () => {
        if (props.note) {
            try {
                dispatch({ 
                    type: "FORM_START_LOADING",
                    payload: 'delete'
                 })
                const deleted = await props.deleteNote(props.note.id)
                if (deleted) {
                    dispatch({ type: "DELETED_NOTE_SUCCESFULLY" })    
                    clearFormContents()
                }
            } catch (error) {
                dispatch({ type: "OBTAINED_ERROR", payload: {error}})
            } finally {
                dispatch({ type: "FORM_STOP_LOADING"})
            }
        } else {
            clearFormContents()
        }
    }

    const displayInvalidMessage = (reason) => {
        dispatch({
            type: 'OBTAINED_ERROR',
            payload: { feedBack: reason }
        })
    }

    const toggleModification = (state) => {
        dispatch({type: "TOGGLE_MODIFICATION", payload: state})
    }
    
    function renderHeader() {
        const note = props.note
        const mode = props.mode
        const currentAction = state.currentAction

        if (state.loading) {

            const loadingMessage = {
                create: 'Creating note...',
                update: 'Updating note...',
                delete: 'Deleting note...'
            }[currentAction]

            return (
                <>
                    <div className="spinner"></div>
                    <span>{loadingMessage}</span>
                </>
            )
        }

        if (mode === 'create') {
            return "New Note"
        } else if (note && mode === "update") {
            const formattedDates = [note.createdAt, note.updatedAt].map(date => {
                const day = getCurrentDayFrom(date)
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
                }
            })
            const hasBeenEdited = note.createdAt.getTime() !== note.updatedAt.getTime()
            const editedInSameDay = isSameDay(note.createdAt, note.updatedAt)
            return (
                <div className="form-times-wrapper">
                    <time
                        className="form-note-time form-note-time-created"
                        dateTime={note.createdAt.toISOString()}
                    >
                        {formattedDates[0].string}
                    </time>
                    {hasBeenEdited && (
                        <time
                            className="form-note-time form-note-time-updated"
                            dateTime={note.updatedAt.toISOString()}
                        >
                            last edited -{" "}
                            {editedInSameDay ? formattedDates[1].time : formattedDates[1].string}
                        </time>
                    )}
                </div>
            )
        }
        return (
    <div>
        <div className="spinner"></div>
        <span>{currentAction === 'create' ? 'Creating note...' : currentAction === 'update' ? 'Updating note...' : 'Deleting note...'}</span>
    </div>
)
    }

return (
    <div className="form-container">
        <button
            className="close-form-btn"
            type="button"
            onClick={() => !state.loading && props.closeForm()}
        ></button>
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
                    readOnly={!state.modifying}
                    autoFocus={props.mode === 'create'}
                />
            </label>

            <label htmlFor="note-content" className="form-note-content">
                <textarea
                    className="note-content-input"
                    type="text"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    readOnly={!state.modifying}
                ></textarea>
            </label>
            {state.feedBack && <div className={`feedback-display ${state.error ? 'feedback-display-error' : ""}`}>{state.feedBack}</div>}
            <nav className="form-buttons-wrapper">
                <button className="form-btn save-note-btn" type="submit">
                    Save
                </button>
                <button
                    className="form-btn edit-note-btn"
                    type="button"
                    onClick={() => toggleModification(!state.modifying)}
                >
                    {state.modifying ? "Lock" : "Edit"}
                </button>
                <button className="form-btn delete-note-btn" type="button" onClick={() => handleDelete()}>
                    Trash
                </button>
            </nav>
        </form>
    </div>
);
}
