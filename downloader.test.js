const fs = require('fs')
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    createWriteStream: jest.fn(),
}))

const { run, pageWritter, wrappedPageWritter, download } = require("./downloader")
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

describe('pageWritter', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Correctly constructs file path with leading zeros', () => {
        const path = 'test/path'
        const name = 'testName'
        const chapter = 1

        pageWritter(path, name, chapter, 2)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/002.jpg`)

        pageWritter(path, name, chapter, 20)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/020.jpg`)

        pageWritter(path, name, chapter, 200)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/200.jpg`)

        pageWritter(path, name, chapter, 2000)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/2000.jpg`)
    })
})

describe('wrappedPageWritter', () => {
    const path = 'test/path'
    const name = 'testName'
    const chapter = 1
    const page = 1

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call writter parameter with the correct arguments', () => {
        const writter = jest.fn()
        wrappedPageWritter(writter)(path, name, chapter, page)
        expect(writter).toHaveBeenCalledWith(path, name, chapter, page)
    })

    it('should create a directory if it does not exist', () => {
        fs.existsSync.mockReturnValue(false)
        wrappedPageWritter(() => { })(path, name, chapter, page)
        expect(fs.existsSync).toHaveBeenCalledWith(`${path}/${name}/${name}-${page}`)
        expect(fs.mkdirSync).toHaveBeenCalledWith(`${path}/${name}/${name}-${page}`, { recursive: true })
    })

    it('should not create a directory if it exists', () => {
        fs.existsSync.mockReturnValue(true)
        wrappedPageWritter(() => { })(path, name, chapter, page)
        expect(fs.existsSync).toHaveBeenCalledWith(`${path}/${name}/${name}-${page}`)
        expect(fs.mkdirSync).not.toHaveBeenCalled()
    })

    it('should not check for the directory if it is already checked', () => {
        fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true)
        const writter = wrappedPageWritter(() => { })
        writter(path, name, 1, 1)
        writter(path, name, 1, 2)
        writter(path, name, 2, 1)
        writter(path, name, 2, 2)

        expect(fs.existsSync).toHaveBeenCalledTimes(2)
        expect(fs.existsSync).toHaveBeenCalledWith(`${path}/${name}/${name}-1`)
        expect(fs.existsSync).toHaveBeenCalledWith(`${path}/${name}/${name}-2`)

        expect(fs.mkdirSync).toHaveBeenCalledWith(`${path}/${name}/${name}-1`, { recursive: true })
        expect(fs.mkdirSync).not.toHaveBeenCalledWith(`${path}/${name}/${name}-2`, { recursive: true })
    })
})

describe('download', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call the writter function with correct arguments', async () => {
        const name = 'testName'
        const chapter = 'testChapter'
        const path = 'testPath'

        jest.mock('./providers/dummy', () => jest.fn())
        const mockProvider = require('./providers/dummy')

        const writter = jest.fn()
        const mockDownloader = jest.fn().mockImplementation(async (callback) => {
            await callback(name, chapter, 0)
        })

        mockProvider.mockReturnValue(mockDownloader)

        const downloadFunction = download('dummy')(writter)

        await downloadFunction(name, chapter, path)

        expect(mockProvider).toHaveBeenCalledWith(name, chapter)
        expect(mockDownloader).toHaveBeenCalled()
        expect(writter).toHaveBeenCalledWith(path, name, chapter, 0)
    })
})
