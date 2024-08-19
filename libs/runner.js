const download = (provider) => {
    const downloadProvider = require(`../providers/${provider}`)
    const writeToPath = (path, writter) => (name, chapter, page) => writter(path, name, chapter, page)
    
    return (writter) => async (name, chapter, path) => {
        const wrappedWritter = writeToPath(path, writter)
        const downloader = downloadProvider(wrappedWritter)
        await downloader(name, chapter)
        console.log(`Downloaded ${name} - chap ${chapter}`)
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
