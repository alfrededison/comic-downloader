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

const tasks = run(createJobs, createQueue)({
    name: argv.name,
    start: argv.skip,
    end: argv.chapter,
    path: argv.path,
    split: argv.split,
    threads: argv.threads
})(download)

Promise.all(tasks)
