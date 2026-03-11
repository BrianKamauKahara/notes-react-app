import { createContext, useState, useEffect, useCallback, type ReactNode, type ReactElement, useMemo } from "react"
import { type NormalizedNote as NoteType, type PassNoteDetails as NoteStructure } from "../api/notes"
import { fetchNotesBatch, requestCreateNote, requestNoteUpdate, requestNoteDeletion } from '../api/notes'

export type NotesStateType = Record<NoteType["id"], NoteType>

type NoteIdType = NoteType["id"]

// Util Function
function computeNextBatchSize(max_length_allowed: number, currentLengthOfFetchedNotes: number, numNotesFetched: number): number {
    if (numNotesFetched === 0) return 2
    const averageNoteLength = currentLengthOfFetchedNotes / numNotesFetched
    const requiredNumNotes = Math.ceil((max_length_allowed - currentLengthOfFetchedNotes) / averageNoteLength)

    return requiredNumNotes
}

const convertNotesToObj = (noteArray: NoteType[]): NotesStateType => {
    const notesObj: NotesStateType = {}
    noteArray.forEach(note => {
        notesObj[note.id] = note
    })

    return notesObj
}

// Context
export const useNotesContext = () => {
    const MAX_ESTIMATED_LENGTH = 2500
    const [notes, setNotes] = useState<NotesStateType>({})
    const [loading, setIsLoading] = useState(true)
    const [error, setIsError] = useState<Error | null>(null)

    const createNote = useCallback(async (noteDetails: NoteStructure): Promise<NoteType> => {
        try {
            const newNote: NoteType = await requestCreateNote(noteDetails)
            setNotes(prev => {
                return {
                    [newNote.id]: newNote,
                    ...prev
                }
            })
            return newNote
        } catch (err) {
            console.error(err)
            throw err
        }
    }, [])

    const updateNote = useCallback(async (noteId: NoteIdType, newDetails: NoteStructure): Promise<void> => {
        try {
            const newNote: NoteType = await requestNoteUpdate(noteId, newDetails)
            setNotes(prev => ({
                ...prev,
                [noteId]: newNote
            }))
        } catch (err) {
            console.error(err)
            throw err
        }
    }, [])

    const deleteNote = useCallback(async (noteId: NoteIdType): Promise<boolean> => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                await requestNoteDeletion(noteId)
                setNotes(prev => {
                    const { [noteId]: _, ...rest } = prev
                    return rest
                })

                return true
            } catch (err) {
                console.error(err)
                throw err
            }
        } else {
            return false
        }
    }, [])

    const selectNote = useCallback((noteId: NoteIdType): NoteType | undefined => {
        return notes[noteId]
    }, [notes])

    useEffect(() => {
        const fetchNotes = async () => {
            const fetchedNotes: NoteType[] = []
            let totalFetchedLength: number = 0
            let nextBatchSize: number = 2
            while (totalFetchedLength < MAX_ESTIMATED_LENGTH) {
                const lastId = fetchedNotes.length ? fetchedNotes[fetchedNotes.length - 1]!.id : undefined
                const fetchParams = lastId ? { start: lastId, limit: nextBatchSize } : { limit: nextBatchSize }

                const batch = await fetchNotesBatch(fetchParams)

                if (!batch.length) break

                fetchedNotes.push(...batch)
                totalFetchedLength += batch.reduce((sum, n) => sum + n.content.length, 0)
                nextBatchSize = computeNextBatchSize(MAX_ESTIMATED_LENGTH, totalFetchedLength, batch.length)
            }

            return fetchedNotes
        }


        fetchNotes() // Fetch a complete batch of notes
            .then(fetchedNotes => setNotes(convertNotesToObj(fetchedNotes)))
            .catch((err: unknown) => {
                if (err instanceof Error) {
                    setIsError(err)
                } else {
                    setIsError(new Error(String(err)))
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [])
    return {
        notes,
        loading,
        error,
        createNote,
        updateNote,
        deleteNote,
        selectNote
    }
}

type UseNotesContextType = ReturnType<typeof useNotesContext>
const initNotesContextState: UseNotesContextType = {
    notes: {},
    loading: true,
    error: null,
    createNote: async () => { throw new Error("Not implemented") },
    updateNote: async () => { throw new Error("Not implemented") },
    deleteNote: async () => { throw new Error("Not implemented") },
    selectNote: () => undefined
}

export const NotesContext = createContext<UseNotesContextType>(initNotesContextState)

// Provider
const NotesProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const contextValue = useMemo(() => useNotesContext(), [])
    return (
        <NotesContext.Provider value={contextValue}>
            {children}
        </NotesContext.Provider>
    )

}


