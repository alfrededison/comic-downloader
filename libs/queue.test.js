const { sleep } = require('./common')
const { createQueue, createJobs } = require('./queue')

describe('createQueue', () => {
    const asyncTask = async (results, i, delay, shouldFail = false) => {
        await sleep(delay)
        if (shouldFail) {
            throw new Error(`Task ${i} failed`)
        }
        results.push(i)
    }

    it('should process tasks in the correct order with limited concurrency', async () => {
        const queue = createQueue(2)
        const results = []

        const tasks = [
            queue(() => asyncTask(results, 1, 100)),
            queue(() => asyncTask(results, 2, 200)),
            queue(() => asyncTask(results, 3, 50)),
            queue(() => asyncTask(results, 4, 150)),
            queue(() => asyncTask(results, 5, 10))
        ]

        await Promise.all(tasks)

        expect(results).toEqual([1, 3, 2, 5, 4])
    })

    it('should not exceed the maximum number of parallel jobs', async () => {
        const queue = createQueue(2)
        const results = []

        const tasks = [
            queue(() => asyncTask(results, 1, 300)),
            queue(() => asyncTask(results, 2, 300)),
            queue(() => asyncTask(results, 3, 100)),
            queue(() => asyncTask(results, 4, 100)),
            queue(() => asyncTask(results, 5, 100))
        ]

        await Promise.all(tasks)

        expect(results).toEqual([1, 2, 3, 4, 5])
    })

    it('should not exceed the maximum number of jobs', async () => {
        const queue = createQueue(3)
        const results = []

        const tasks = [
            queue(() => asyncTask(results, 1, 300)),
            queue(() => asyncTask(results, 2, 300)),
        ]

        await Promise.all(tasks)

        expect(results).toEqual([1, 2])
    })

    it('should stop processing if a job fails by default', async () => {
        const queue = createQueue(3)
        const results = []

        const tasks = [
            queue(() => asyncTask(results, 1, 100)),
            queue(() => asyncTask(results, 0, 50, true)),
            queue(() => asyncTask(results, 2, 200)),
            queue(() => asyncTask(results, 3, 300)),
        ]

        await expect(Promise.all(tasks)).rejects.toThrowError('Task 0 failed')
    })

    it('should be able to continue processing if a job fails', async () => {
        const queue = createQueue(3, { continueOnError: true })
        const results = []

        const tasks = [
            queue(() => asyncTask(results, 1, 100)),
            queue(() => asyncTask(results, 0, 50, true)),
            queue(() => asyncTask(results, 2, 200)),
            queue(() => asyncTask(results, 3, 300)),
        ]

        await Promise.all(tasks)
        expect(results).toEqual([1, 2, 3])
    })
})

describe('createJobs', () => {
    it('should create an array of jobs', () => {
        const fn = jest.fn()
        const jobs = createJobs(1, 5)(fn)
        expect(jobs).toHaveLength(5)

        jobs.forEach(job => job())

        expect(fn).toHaveBeenCalledTimes(5)
        expect(fn.mock.calls).toEqual([[1], [2], [3], [4], [5]])
    })
})
