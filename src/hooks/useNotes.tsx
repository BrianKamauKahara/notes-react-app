import { NotesContext } from "../context/NotesProvider";
import { useContext } from "react";

export default function useNotes() {
    return useContext(NotesContext)
}