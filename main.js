const yargs = require('yargs')
const { createJobs, createQueue } = require('./libs')
const { download, run } = require('./downloader')

// get comic name, chapter number and saved path from command line
const argv = yargs
    .option('name', {
        alias: 'n',
        type: 'string',
        demandOption: true,
        describe: 'The name of the comic'
    })
    .option('start', {
        alias: 's',
        type: 'number',
        demandOption: true,
        describe: 'The start number of the chapters'
    })
    .option('end', {
        alias: 'e',
        type: 'number',
        demandOption: true,
        describe: 'The end number of chapters'
    })
    .option('path', {
        alias: 'p',
        type: 'string',
        demandOption: true,
        describe: 'The path to save the image'
    })
    .option('threads', {
        alias: 't',
        type: 'number',
        demandOption: false,
        describe: 'The number of threads to use'
    })
    .argv

const tasks = run(createJobs, createQueue)({
    name: argv.name,
    start: argv.start,
    end: argv.end,
    path: argv.path,
    threads: argv.threads
})(download)

Promise.all(tasks)
