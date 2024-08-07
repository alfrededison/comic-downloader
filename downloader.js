const fs = require('fs')

const pageWritter = (path, name, chapter, page) => fs.createWriteStream(`${path}/${name}/${name}-${chapter}/${String(page).padStart(3, '0')}.jpg`)

const wrappedPageWritter = (writter) => {
    const checks = {}
    return (path, name, chapter, page) => {
        const key = `${path}/${name}/${name}-${chapter}`
        if (checks[key] === undefined) {
            checks[key] = fs.existsSync(key)
        }
        if (!checks[key]) {
            fs.mkdirSync(key, { recursive: true })
        }

        return writter(path, name, chapter, page)
    }
}

const download = (provider) => {
    const downloadProvider = require(`./providers/${provider}`)
    return (writter) => (name, chapter, path) => {
        const downloader = downloadProvider(name, chapter)
        return downloader((name, chapter, page) => writter(path, name, chapter, page))
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
    pageWritter,
    wrappedPageWritter,
    download,
    run,
}
