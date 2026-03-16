import DeleteNoteIcon from '../assets/svg/deleteNoteIcon.jsx'
import '../css/Note.css'
import { type NormalizedNote as NoteType } from '../api/notes.js'
import { formatNoteDates } from './NoteForm.js'
import { memo } from 'react'
import useNotes from '../hooks/useNotes.js'

type NoteProps = {
    note: NoteType
    onSelect: () => void
}


export default memo(function Note({ note, onSelect }: NoteProps) {
    const { deleteNote } = useNotes()
    const formattedDates = formatNoteDates([note.createdAt, note.updatedAt])

    const hasBeenEdited = note.createdAt.getTime() !== note.updatedAt.getTime()

    const confirmDelete = () => window.confirm("Are you sure you want to delete this note?")
    return (
        <article className="note">
            <div className="note-heading">
                <time className="note-time note-time-created" dateTime={note.createdAt.toISOString()}>{formattedDates[0]?.time}</time>
                <h3 className="note-title" onClick={onSelect}>{note.title}</h3>
                <button className="delete-note-btn" onClick={() => { confirmDelete() && deleteNote(note.id) }}>
                    <DeleteNoteIcon size={12}></DeleteNoteIcon>
                </button>
            </div>
            <section className="note-content">{note.content}</section>

            {hasBeenEdited && <time className="note-time note-time-updated" dateTime={note.updatedAt.toISOString()}>edit - {formattedDates[1]?.time}</time>}
        </article>
    )
})