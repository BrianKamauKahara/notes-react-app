type ErrorPropsType = {
    error: Error
}

const MainPageError = ({ error }: ErrorPropsType) => {
    return (
        <main className='error-wrapper'>
            <div className='error-container'>
                <h3>An Error has Occured :{'('}</h3>
                <hr /><br />
                <p>
                    <strong>Message:</strong>{' '}
                    {error.message || String(error)}
                </p>

                {error.stack && (
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {error.stack}
                    </pre>
                )}
            </div>
        </main>
    )
}

export default MainPageError