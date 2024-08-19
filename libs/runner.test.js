const { run, download } = require("./runner")
const { sleep } = require('./common')
const { createQueue, createJobs } = require('./queue')

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
    const logger = {
        info: jest.fn(),
        error: jest.fn(),
    }
    
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call the writter function with correct arguments', async () => {
        const name = 'testName'
        const chapter = 'testChapter'
        const path = 'testPath'

        jest.mock('../providers/_dummy', () => jest.fn())
        const mockProvider = require('../providers/_dummy')

        const writter = jest.fn()

        mockProvider.mockImplementation((callback) => async () => {
            await callback(name, chapter, 0)
        })

        const downloadFunction = download('_dummy')(writter, logger)

        await downloadFunction(name, chapter, path)

        expect(mockProvider).toHaveBeenCalledWith(expect.any(Function))
        expect(writter).toHaveBeenCalledWith(path, name, chapter, 0)
    })
    
    it('should call the writter function with correct arguments', async () => {
        const name = 'testName'
        const chapter = 'testChapter'
        const path = 'testPath'

        jest.mock('../providers/_dummy', () => jest.fn())
        const mockProvider = require('../providers/_dummy')

        const writter = jest.fn()

        const downloader = jest.fn().mockImplementation(() => {
            writter(name, chapter, 0)
        })
        mockProvider.mockReturnValue(downloader)

        const downloadFunction = download('_dummy')(writter, logger)

        await downloadFunction(name, chapter, path)

        expect(mockProvider).toHaveBeenCalledWith(expect.any(Function))
        expect(downloader).toHaveBeenCalledWith(name, chapter)
        expect(writter).toHaveBeenCalledWith(name, chapter, 0)
    })

    it('should call the logger info function with correct arguments on success', async () => {
        const name = 'testName'
        const chapter = 'testChapter'
        const path = 'testPath'

        jest.mock('../providers/_dummy', () => jest.fn())
        const mockProvider = require('../providers/_dummy')
        mockProvider.mockReturnValue(jest.fn())

        const downloadFunction = download('_dummy')(() => {}, logger)
        await downloadFunction(name, chapter, path)

        expect(logger.info).toHaveBeenCalledWith(`[_dummy] Downloaded ${name} - chap ${chapter}`)
        expect(logger.error).not.toHaveBeenCalled()
    })

    it('should call the logger error function with correct arguments on failure', async () => {
        const name = 'testName'
        const chapter = 'testChapter'
        const path = 'testPath'

        jest.mock('../providers/_dummy', () => jest.fn())
        const mockProvider = require('../providers/_dummy')
        mockProvider.mockReturnValue(jest.fn().mockRejectedValue(new Error('download error')))

        const downloadFunction = download('_dummy')(() => {}, logger)
        await downloadFunction(name, chapter, path)

        expect(logger.info).not.toHaveBeenCalled()
        expect(logger.error).toHaveBeenCalledWith(`[_dummy] Error downloading ${name} - chap ${chapter}: Error: download error`)
    })
})
