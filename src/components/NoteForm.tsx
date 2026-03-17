// IMPORTS
import { useReducer, useState, type ChangeEvent, type SubmitEvent } from "react";
import "../css/NoteForm.css";

// Types
import { type NormalizedNote as NoteType, type PassNoteDetails as NoteStructure } from "../api/notes"

// Custom Hooks
import useNotes from "../hooks/useNotes"

// - - UTIL Functions
// Date Formatting Functions
import { getCurrentDayFrom, type DateString } from "./Book"
type formattedDateType = {
    date: Date,
    day: DateString,
    time: string,
    string: string
}
export function formatNoteDates(dates: Date[]): formattedDateType[] {
    return dates.map(
        date => {
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
}
function isSameDay(date1: Date, date2: Date): boolean {
    if (!date1 || !date2) return false

    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    )

}

// Note Validation Functions
type ValidateNoteReturnType = {
    isValid: true
} | {
    isValid: false,
    reason: string
}
const validateNote = (note: NoteType | undefined, formData: NoteStructure, mode: 'create' | 'update'): ValidateNoteReturnType => {
    const oldTitle = note?.title
    const oldContent = note?.content

    const { title: newTitle, content: newContent } = formData
    if (!newTitle || !newContent) return {
        isValid: false,
        reason: `${!newTitle ? 'Title' : 'Content'} must be a non-empty string`
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

// - - Actual Form Prop
// Form States and init State
type PossibleFormActions = 'create' | 'update' | 'delete'
type FormStateType = {
    isModifying: boolean,
    loading: { action: PossibleFormActions } | false,
    error: Error | null
    feedBack: string
}
const initialFormState: FormStateType = {
    isModifying: true,
    loading: false,
    error: null,
    feedBack: ''
}

// Reducer
const FORM_REDUCER_ACTIONS = {
    TOGGLE_MODIFICATION: "TOGGLE_MODIFICATION",
    FORM_START_OPERATION: "FORM_START_OPERATION",
    OPERATION_COMPLETE: "OPERATION_COMPLETE",
    OBTAINED_ERROR: "OBTAINED_ERROR"
} as const
type FORM_REDUCER_PAYLOADS = {
    TOGGLE_MODIFICATION: boolean,
    FORM_START_OPERATION: PossibleFormActions,
    OBTAINED_ERROR: { error: Error }
}

type FormReducerAction = {
    [K in keyof typeof FORM_REDUCER_ACTIONS]:
    { type: K } &
    (K extends keyof FORM_REDUCER_PAYLOADS
        ? { payload: FORM_REDUCER_PAYLOADS[K] }
        : {})
}[keyof typeof FORM_REDUCER_ACTIONS]

function formReducer(state: FormStateType, action: FormReducerAction): FormStateType {
    switch (action.type) {
        case FORM_REDUCER_ACTIONS.TOGGLE_MODIFICATION:
            return { ...state, isModifying: !state.isModifying }

        case FORM_REDUCER_ACTIONS.FORM_START_OPERATION:
            return { ...state, loading: { action: action.payload }, error: null, isModifying: false }

        case FORM_REDUCER_ACTIONS.OPERATION_COMPLETE:
            return { ...state, loading: false, error: null, isModifying: true }

        case FORM_REDUCER_ACTIONS.OBTAINED_ERROR:
            // console.log(action.payload.error)
            const errorMessage: string = action.payload.error.message || 'An Error Has Occured'
            return { ...state, error: action.payload.error, feedBack: errorMessage, loading: false }
    }
}

// Actual Form Component
type NoteFormProps = {
    note: NoteType | undefined,
    openBlankForm: () => void,
    openFilledForm: (noteId: NoteType['id']) => void,
    closeForm: () => void
}
export default function NoteForm({ note, openBlankForm, openFilledForm, closeForm }: NoteFormProps) {
    // Form Control
    const [formData, setFormData] = useState<Pick<NoteType, 'title' | 'content'>>({
        title: note?.title || "",
        content: note?.content || ""
    })

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const clearFormContents = () => {
        setFormData({ title: "", content: "" })
    }

    // Form State Handling
    const [state, dispatch] = useReducer(formReducer, initialFormState)
    const { createNote, updateNote, deleteNote } = useNotes()

    const dispatchError = (err: unknown) => {
        if (err instanceof Error) {
            dispatch({
                type: 'OBTAINED_ERROR',
                payload: { error: err }
            })
        }
        dispatch({
            type: 'OBTAINED_ERROR',
            payload: { error: new Error(String(err)) }
        })
    }

    const dispatchOperation = (mode: 'begin' | 'end', action?: PossibleFormActions) => {
        if (mode === 'end') {
            dispatch({
                type: 'OPERATION_COMPLETE'
            })
            return
        }
        if (!action) {
            throw new Error('Action not set')
        }
        dispatch({
            type: 'FORM_START_OPERATION',
            payload: action
        })
    }

    const runNoteCreate = async (data: NoteStructure) => {
        if (note) throw new Error('Form opened in incorrect mode: Note exists yet note creation run')

        const newNote = await createNote(data)
        openFilledForm(newNote.id)
    }

    const runNoteUpdate = async (data: NoteStructure) => {
        if (!note) throw new Error('No note to update')

        await updateNote(note.id, data)
        openFilledForm(note.id)
    }

    // Form Actions
    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        const result = validateNote(note, formData, note ? 'update' : 'create')

        if (!result.isValid) {
            dispatchError(result.reason)
            return
        }

        try {
            dispatchOperation('begin', note ? 'update' : 'create')

            if (!note) await runNoteCreate(formData)
            else await runNoteUpdate(formData)

            dispatchOperation('end')
        } catch (err: unknown) {
            dispatchError(err)
        }
    }

    const handleDelete = async () => {
        if (!note) return clearFormContents()

        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                dispatchOperation('begin', 'delete')
                await deleteNote(note.id)

                clearFormContents()
                openBlankForm()

                dispatchOperation('end')
            } catch (err) {
                dispatchError(err)
            }
        }
    }

    const toggleModification = (to: boolean) => {
        dispatch({ type: "TOGGLE_MODIFICATION", payload: to })
    }

    // Rendering Functions
    function renderHeader() {
        if (state.loading) {
            const action = state.loading.action

            const loadingMessage = {
                create: 'Creating note...',
                update: 'Updating note...',
                delete: 'Deleting note...'
            }[action]

            return (
                <>
                    <div className="spinner"></div>
                    <span>{loadingMessage}</span>
                </>
            )
        }

        if (!note) {
            return "New Note"
        }

        const formattedDates = formatNoteDates([note.createdAt, note.updatedAt])
        const hasBeenEdited = note.createdAt.getTime() !== note.updatedAt.getTime()
        const editedInSameDay = isSameDay(note.createdAt, note.updatedAt)
        return (
            <div className="form-times-wrapper">
                <time
                    className="form-note-time form-note-time-created"
                    dateTime={note.createdAt.toISOString()}
                >
                    {formattedDates[0]?.string}
                </time>
                {hasBeenEdited && (
                    <time
                        className="form-note-time form-note-time-updated"
                        dateTime={note.updatedAt.toISOString()}
                    >
                        last edited -{" "}
                        {editedInSameDay ? formattedDates[1]?.time : formattedDates[1]?.string}
                    </time>
                )}
            </div>
        )
    }

    // Snapshots
    const headerContent = renderHeader()

    return (
        <div className="form-wrapper">
            <div className="form-container">
                <button
                    className="close-form-btn"
                    type="button"
                    onClick={() => !state.loading && closeForm()}
                ></button>

                <form action="" onSubmit={handleSubmit} className="note-form">
                    <header className="form-note-heading">
                        {headerContent}
                    </header>

                    <label htmlFor="note-title" className="form-note-title">
                        Title:
                        <input
                            className="note-title-input"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            readOnly={!state.isModifying}
                            autoFocus={note !== undefined}
                        />
                    </label>

                    <label htmlFor="note-content" className="form-note-content">
                        <textarea
                            className="note-content-input"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            readOnly={!state.isModifying}
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
                            onClick={() => toggleModification(!state.isModifying)}
                        >
                            {state.isModifying ? "Lock" : "Edit"}
                        </button>
                        <button className="form-btn delete-note-btn" type="button" onClick={() => handleDelete()}>
                            Trash
                        </button>
                    </nav>
                </form>
            </div>
        </div>
    );
}
