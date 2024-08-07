const fs = require('fs')
const axios = require('axios')

jest.mock('fs')
jest.mock('axios')

const { run, download } = require("./downloader")
const { createJobs, createQueue, sleep } = require("./libs")

describe('run', () => {
    const jobGenerator = jest.fn().mockReturnValue(jest.fn().mockReturnValue(Array.from({ length: 3 }, () => { })))
    const queueProcessor = jest.fn().mockReturnValue(jest.fn().mockReturnValue(Promise.resolve()))
    const fn = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call jobGenerator with the correct arguments', () => {
        const start = 10
        const end = 20
        run(jobGenerator, queueProcessor)({ name: 'Comic', start: 10, end: 20, path: 'downloads', threads: 3 })(fn)
        expect(jobGenerator).toHaveBeenCalledWith(start, end)
    })

    it('should call queueProcessor with the correct arguments', () => {
        const threads = 3
        run(jobGenerator, queueProcessor)({ name: 'Comic', start: 10, end: 20, path: 'downloads', threads })(fn)
        expect(queueProcessor).toHaveBeenCalledWith(threads)
    })

    it('should call queue with the correct arguments', () => {
        run(jobGenerator, queueProcessor)({ name: 'Comic', start: 10, end: 20, path: 'downloads', threads: 3 })(fn)
        const queue = queueProcessor.mock.results[0].value
        queue(jest.fn())
        expect(queueProcessor.mock.results[0].value).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should return an array of promises', () => {
        const result = run(jobGenerator, queueProcessor)({ name: 'Comic', start: 10, end: 20, path: 'downloads', threads: 3 })(fn)
        expect(result).toBeInstanceOf(Array)
        expect(result.length).toBe(3)
        expect(result[0]).toBeInstanceOf(Promise)
    })

    it('should run the mocked downloads', async () => {
        const results = []
        const download = async (name, chapter, path) => {
            results.push(`Downloading ${name} ${chapter} ${path}...`)
            await sleep(100)
        }

        const tasks = run(createJobs, createQueue)({ name: 'Comic', start: 1000, end: 1005, path: 'downloads', threads: 3 })(download)
        await Promise.all(tasks)

        expect(results).toEqual([
            'Downloading Comic 1000 downloads...',
            'Downloading Comic 1001 downloads...',
            'Downloading Comic 1002 downloads...',
            'Downloading Comic 1003 downloads...',
            'Downloading Comic 1004 downloads...',
            'Downloading Comic 1005 downloads...',
        ])
    })
})

describe('download', () => {
    fs.existsSync = jest.fn()
    fs.mkdirSync = jest.fn()
    fs.createWriteStream = jest.fn()
    axios.get = jest.fn()

    const SUCCESS_RESPONSE = { status: 200, data: { pipe: () => { } } }
    const FAILURE_RESPONSE = { status: 404 }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should create directory structure when directory does not exist', async () => {
        const name = 'TestComic'
        const chapter = 1
        const path = './testFolder'

        fs.existsSync.mockReturnValueOnce(false).mockReturnValue(true)
        axios.get.mockResolvedValueOnce(SUCCESS_RESPONSE).mockResolvedValue(FAILURE_RESPONSE)

        await download(name, chapter, path)

        expect(fs.mkdirSync).toHaveBeenCalledTimes(1)
        expect(fs.mkdirSync).toHaveBeenCalledWith(`${path}/${name}/${name}-1`, { recursive: true })
    })

    it('should handle a 404 response correctly and stop downloading', async () => {
        const name = 'TestComic'
        const chapter = 1
        const path = './testFolder'

        fs.existsSync.mockReturnValue(true)
        axios.get
            .mockResolvedValueOnce(SUCCESS_RESPONSE)
            .mockResolvedValueOnce(SUCCESS_RESPONSE)
            .mockResolvedValueOnce(FAILURE_RESPONSE)

        await download(name, chapter, path)

        expect(axios.get).toHaveBeenCalledTimes(3)
        expect(axios.get).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/0.jpg`, expect.any(Object))
        expect(axios.get).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/1.jpg`, expect.any(Object))
        expect(axios.get).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/2.jpg`, expect.any(Object))

        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/000.jpg`)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/001.jpg`)
        expect(fs.createWriteStream).not.toHaveBeenCalledWith(`${path}/${name}/${name}-1/002.jpg`)
    })
})
