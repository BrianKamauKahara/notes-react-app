import CreateNoteIcon from "../assets/svg/createNoteIcon";
type PropsType = {
    isDisabled: boolean,
    onClick: () => void
}

const CreateNoteButton = ({ isDisabled, onClick }: PropsType) => {
    return (
        <>
            <button
                className="new-note-btn"
                onClick={() => onClick()}
                disabled={isDisabled}
            >
                <CreateNoteIcon />
            </button>
            {" "}
            <br />
        </>
    )
}

export default CreateNoteButton