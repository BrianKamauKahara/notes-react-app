import DeleteNoteIcon from '../assets/svg/deleteNoteIcon.jsx'
import '../css/Note.css'
import { type NormalizedNote as NoteType } from '../api/notes.js'

type NoteProps = {
    note: NoteType
    onSelect: () => void
    onDelete: () => void
}

export default function Note({ note, onSelect, onDelete }: NoteProps) {
    const formattedDates = [note.createdAt, note.updatedAt].map(
        date => new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // 24-hour format; true for AM/PM
        }))

    const hasBeenEdited = note.createdAt.getTime() !== note.updatedAt.getTime()

    return (
        <article className="note">
            <div className="note-heading">
                <time className="note-time note-time-created" dateTime={note.createdAt.toISOString()}>{formattedDates[0]}</time>
                <h3 className="note-title" onClick={onSelect}>{note.title}</h3>
                <button className="delete-note-btn" onClick={onDelete}>
                    <DeleteNoteIcon size={12}></DeleteNoteIcon>
                </button>
            </div>
            <section className="note-content">{note.content}</section>

            {hasBeenEdited && <time className="note-time note-time-updated" dateTime={note.updatedAt.toISOString()}>edit - {formattedDates[1]}</time>}
        </article>
    )
}