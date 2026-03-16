import DeleteNoteIcon from '../assets/svg/deleteNoteIcon.jsx'
import '../css/Note.css'
import { type NormalizedNote as NoteType } from '../api/notes.js'
import { formatNoteDates } from './NoteForm.js'

type NoteProps = {
    note: NoteType
    onSelect: () => void
    onDelete: () => void
}

export default function Note({ note, onSelect, onDelete }: NoteProps) {
    const formattedDates = formatNoteDates([note.createdAt, note.updatedAt])

    const hasBeenEdited = note.createdAt.getTime() !== note.updatedAt.getTime()

    return (
        <article className="note">
            <div className="note-heading">
                <time className="note-time note-time-created" dateTime={note.createdAt.toISOString()}>{formattedDates[0]?.time}</time>
                <h3 className="note-title" onClick={onSelect}>{note.title}</h3>
                <button className="delete-note-btn" onClick={onDelete}>
                    <DeleteNoteIcon size={12}></DeleteNoteIcon>
                </button>
            </div>
            <section className="note-content">{note.content}</section>

            {hasBeenEdited && <time className="note-time note-time-updated" dateTime={note.updatedAt.toISOString()}>edit - {formattedDates[1]?.time}</time>}
        </article>
    )
}