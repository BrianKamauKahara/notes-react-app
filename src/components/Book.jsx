import { useLayoutEffect, useRef, useState, useEffect } from "react"
import '../css/Book.css'
import Note from "./Note"

export default function Book({ notes }) {
    const bookRef = useRef(null)
    const buttonRefs = useRef([null, null])


    const [columnWidth, setColumnWidth] = useState(0)
    const [columnCount, setColumnCount] = useState(0)

    const [currentDisplayedColumns, setCurrentDisplayedColumns] = useState([1, 2])
    const [transformPx, setTransformPx] = useState(0)

    useLayoutEffect(() => {
        if (bookRef.current) {
            const totalWidth = bookRef.current.scrollWidth
            const viewingWidth = bookRef.current.clientWidth

            setColumnWidth(viewingWidth / 2)

            const columnCount = Math.round(totalWidth / (viewingWidth / 2))
            setColumnCount(columnCount === 1 ? 2 : columnCount)

            console.log(viewingWidth, columnCount)
        }
    }, [])

    const changeRed = (i) => {
        const el = buttonRefs.current[i]
        el.classList.remove("flash")
        void el.offsetWidth
        el.classList.add("flash")
    }

    const transformPage = (i) => {
        if (i === 0) { // Previous Page
            if (currentDisplayedColumns[0] === 1) return changeRed(0)

            setTransformPx(prev => prev - columnWidth)
            setCurrentDisplayedColumns(prev => prev.map(v => v - 1))
        } else { // Next Page
            if (currentDisplayedColumns[1] === columnCount) return changeRed(1)

            setTransformPx(prev => prev + columnWidth)
            setCurrentDisplayedColumns(prev => prev.map(v => v + 1))
        }
    }

    const pageEls = notes.map((note, i) =>
        <Note
            key={i}
            {...note}
        />
    )

    return (
        <>
            <div className="book-container">
                <div
                    ref={bookRef}
                    className="book"
                    style={{
                        transform: `translateX(-${transformPx}px)`,
                        transition: "transform 0.5s ease"
                    }}
                >
                    {pageEls}
                </div>



                {/* <div className="page-number">{currentDisplayedColumns[0]}</div>
            <div className="page-number">{currentDisplayedColumns[1]}</div> */}
            </div>
            <button
                id="prev-page-btn"
                ref={el => (buttonRefs.current[0] = el)}
                className="page-switch-btn"
                onClick={() => transformPage(0)}
            >
                {'<'}
            </button>

            <button
                id="next-page-btn"
                ref={el => (buttonRefs.current[1] = el)}
                className="page-switch-btn"
                onClick={() => transformPage(1)}
            >
                {'>'}
            </button>
        </>
    )
}
