const fs = require('fs')
const axios = require('axios')

const download = async (name, chapter, path) => {
    let j = 0

    while (true) {
        console.log(`Downloading ${name} - chap ${chapter} - img ${j}...`)
        if (!fs.existsSync(`${path}/${name}/${name}-${chapter}`)) {
            fs.mkdirSync(`${path}/${name}/${name}-${chapter}`, { recursive: true })
        }

        const url = `https://cmnvymn.com/nettruyen/${name}/${chapter}/${j}.jpg`
        const response = await axios.get(url, {
            responseType: 'stream',
            validateStatus: status => (status >= 200 && status < 300) || status === 404
        })

        if (response.status === 404) {
            break
        } else {
            response.data.pipe(fs.createWriteStream(`${path}/${name}/${name}-${chapter}/${String(j).padStart(3, '0')}.jpg`))
            j++
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
