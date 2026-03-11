function randomTimePastTwoDays(): Date {
    const now = Date.now()
    const twoDaysAgo = now - 5 * 24 * 60 * 60 * 1000; // 2 days in ms
    const randomTimestamp = twoDaysAgo + Math.random() * (now - twoDaysAgo)
    return new Date(randomTimestamp)
}

function generateRandomContent(minWords: number = 8, maxWords: number = 80): string {
    const WORDS = [
        "grace", "light", "truth", "code", "logic",
        "faith", "hope", "build", "create", "learn",
        "think", "grow", "write", "peace", "order"
    ];

    if (minWords > maxWords) [minWords, maxWords] = [maxWords, minWords];

    const wordCount =
        Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;

    let content = "";

    for (let i = 0; i < wordCount; i++) {
        const randomWord =
            WORDS[Math.floor(Math.random() * WORDS.length)];
        content += randomWord + (i < wordCount - 1 ? " " : "");
    }

    return content
}