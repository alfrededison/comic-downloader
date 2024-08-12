const fs = require('fs')
const yargs = require('yargs')
const { createJobs, createQueue } = require('./libs/queue')
const { wrappedPageWritter, pageWritter } = require('./libs/writters')
const { download, run } = require('./libs/runner')

// get list of providers
const providers = fs.readdirSync('./providers')
    .filter((file) => /([^.test]\.js)$/.test(file))
    .map((file) => file.slice(0, -3))

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
    .option('provider', {
        alias: 'd',
        type: 'string',
        demandOption: false,
        describe: 'The provider to use: ' + providers.join(', ')
    })
    .argv

const tasks = run(createJobs, createQueue)({
    name: argv.name,
    start: argv.start,
    end: argv.end,
    path: argv.path,
    threads: argv.threads
})(download(argv.provider)(wrappedPageWritter(pageWritter)))

Promise.all(tasks)
