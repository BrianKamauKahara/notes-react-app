import DeleteNoteIcon from '../assets/svg/deleteNoteIcon'
import '../css/Note.css'

export default function Note(props) {
    const formattedDates = [props.createdAt, props.updatedAt].map(
        date => new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // 24-hour format; true for AM/PM
        }))

    const hasBeenEdited = props.createdAt.getTime() !== props.updatedAt.getTime()

    return (
        <article className="note">
            <div className="note-heading">
                <time className="note-time note-time-created" dateTime={props.createdAt.toISOString()}>{formattedDates[0]}</time>
                <h3 className="note-title" onClick={props.onSelect}>{props.title}</h3>
                <button className="delete-note-btn" onClick={props.onDelete}>
                <DeleteNoteIcon size={12}></DeleteNoteIcon>
            </button>
            </div>
            <section className="note-content">{props.content}</section>
            
            {hasBeenEdited && <time className="note-time note-time-updated" dateTime={props.updatedAt.toISOString()}>edit - {formattedDates[1]}</time>}
        </article>
    )
}