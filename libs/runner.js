const download = (provider) => {
    const downloadProvider = require(`../providers/${provider}`)
    const writeToPath = (path, writter) => (name, chapter, page) => writter(path, name, chapter, page)

    return (writter, logger) => async (name, chapter, path) => {
        const wrappedWritter = writeToPath(path, writter)
        const downloader = downloadProvider(wrappedWritter)
        try {
            await downloader(name, chapter)
            logger.info(`[${provider}] Downloaded ${name} - chap ${chapter}`)
        } catch (error) {
            logger.error(`[${provider}] Error downloading ${name} - chap ${chapter}: ${error}`)
        }
    }
}

const run = (jobGenerator, queueProcessor) => ({ name, start, end, path, threads }) => fn => {
    const wrapper = (chapter) => fn(name, chapter, path)

    const setup = jobGenerator(start, end)
    const jobs = setup(wrapper)

    const queue = queueProcessor(threads)
    return jobs.map(q => queue(q))
}

module.exports = {
    download,
    run,
}
