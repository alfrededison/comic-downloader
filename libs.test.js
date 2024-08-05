const { createQueue, createJobs, sleep } = require('./libs')

describe('createQueue', () => {
    const asyncTask = async (results, i, delay) => {
        await sleep(delay)
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
})

describe('createJobs', () => {
    it('should create an array of jobs', () => {
        const jobs = createJobs(1, 5, 2)((i, j) => [i, j])
        expect(jobs).toHaveLength(2)
        expect(jobs[0]).toBeInstanceOf(Function)
        expect(jobs[1]).toBeInstanceOf(Function)

        expect(jobs[0]()).toEqual([1, 3])
        expect(jobs[1]()).toEqual([3, 5])
    })
    
    it('should note create more than max number of jobs', () => {
        const jobs = createJobs(1, 5, 3)((i, j) => [i, j])
        expect(jobs).toHaveLength(2)
        expect(jobs[0]).toBeInstanceOf(Function)
        expect(jobs[1]).toBeInstanceOf(Function)

        expect(jobs[0]()).toEqual([1, 4])
        expect(jobs[1]()).toEqual([4, 5])
    })
})
