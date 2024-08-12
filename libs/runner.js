const download = (provider) => {
    const downloadProvider = require(`../providers/${provider}`)
    return (writter) => (name, chapter, path) => {
        const wrappedWritter = (name, chapter, page) => writter(path, name, chapter, page)
        const downloader = downloadProvider(wrappedWritter)
        return downloader(name, chapter)
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
