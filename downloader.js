const fs = require('fs')
const axios = require('axios')

const download = async (name, chapter, path, skip = 0) => {
    let i = 1 + skip, j = 0

    while (i <= chapter) {
        console.log(`Downloading ${name} - chap ${i} - img ${j}...`)
        if (!fs.existsSync(`${path}/${name}/${name}-${i}`)) {
            fs.mkdirSync(`${path}/${name}/${name}-${i}`, { recursive: true })
        }
    
        const url = `https://cmnvymn.com/nettruyen/${name}/${i}/${j}.jpg`
        const response = await axios.get(url, { 
            responseType: 'stream', 
            validateStatus: status => (status >= 200 && status < 300) || status === 404
        })

        if (response.status === 404) {
            i++
            j = 0
        } else {
            response.data.pipe(fs.createWriteStream(`${path}/${name}/${name}-${i}/${String(j).padStart(3, '0')}.jpg`))
            j++
        }
    }
}

const run = (jobGenerator, queueProcessor) => ({name, start, end, path, split, threads}) => fn => {
    const wrapper = (skip, chapter) => fn(name, chapter, path, skip)

    const setup = jobGenerator(start, end, split)
    const jobs = setup(wrapper)

    const queue = queueProcessor(threads)
    return jobs.map(q => queue(q))
}

module.exports = {
    download,
    run,
}
