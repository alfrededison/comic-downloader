const fs = require('fs')

const pageWriteStreamBuilder = (path, name, chapter, page) => 
    fs.createWriteStream(`${path}/${name}/${name}-${chapter}/${String(page).padStart(3, '0')}.jpg`)

const responsePipe = (stream) => 
    (response) => response.data.pipe(stream)

const pageWritter = (writeStreamBuilder, responseHandler) =>
    (name, chapter, page) => responseHandler(writeStreamBuilder(name, chapter, page))

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

module.exports = {
    pageWriteStreamBuilder,
    responsePipe,
    pageWritter,
    wrappedPageWritter,
}
