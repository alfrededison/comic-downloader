// create file downloader
const fs = require('fs')
const axios = require('axios')
const yargs = require('yargs')
const { createJobs, createQueue } = require('./libs')

// get comic name, chapter number and saved path from command line
const argv = yargs
    .option('name', {
        alias: 'n',
        type: 'string',
        demandOption: true,
        describe: 'The name of the comic'
    })
    .option('chapter', {
        alias: 'c',
        type: 'number',
        demandOption: true,
        describe: 'The number of the chapters'
    })
    .option('skip', {
        alias: 's',
        type: 'number',
        demandOption: false,
        describe: 'The number of chapters to skip'
    })
    .option('path', {
        alias: 'p',
        type: 'string',
        demandOption: true,
        describe: 'The path to save the image'
    })
    .option('split', {
        alias: 'l',
        type: 'number',
        demandOption: false,
        describe: 'The number of chapters to split for each thread'
    })
    .option('threads', {
        alias: 't',
        type: 'number',
        demandOption: false,
        describe: 'The number of threads to use'
    })
    .argv


const download = async (name, chapter, path, skip = 0) => {
    let i = 1 + skip, j = 0

    // download images
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

download(argv.name, argv.chapter, argv.path, argv.skip)

const setup = createJobs(argv.skip, argv.chapter, argv.split)
const job = (skip, chapter) => download(argv.name, chapter, argv.path, skip)
const jobs = setup(job)

const queue = createQueue(argv.threads)
const run = jobs.map(q => queue(q))

await Promise.all(run)
