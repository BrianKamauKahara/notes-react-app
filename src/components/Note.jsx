import '../css/Note.css'

export default function Note(props) {
    const createdAt = props.createdAt
    const updatedAt = props.updatedAt

    const formattedDates = [createdAt, updatedAt].map(
        date => new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // 24-hour format; true for AM/PM
        }))

    const hasBeenEdited = createdAt.getTime() !== updatedAt.getTime()

    return (
        <article className="note">
            <div className="note-heading">
                <time className="note-time note-time-created" dateTime={createdAt.toISOString()}>{formattedDates[0]}</time>
                <h3 className="note-title">{props.title}</h3>
            </div>
            <p className="note-content">{props.content}</p>
            {hasBeenEdited && <time className="note-time note-time-updated" dateTime={updatedAt.toISOString()}>edit - {formattedDates[1]}</time>}
        </article>
    )
}