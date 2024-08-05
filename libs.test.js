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

describe('run', () => {
    it('should run the mocked downloads', async () => {
        const results = []
        const download = async (name, chapter, path, skip = 0) => {
            results.push(`Downloading ${name} ${chapter} ${skip} ${path}...`)
            await sleep(100)
        }

        const setup = createJobs(1000, 1100, 20)
        const job = (skip, chapter) => download("Comic", chapter, "downloads", skip)
        const jobs = setup(job)

        const queue = createQueue(3)
        const run = jobs.map(q => queue(q))

        await Promise.all(run)

        expect(results).toEqual([
            'Downloading Comic 1020 1000 downloads...',
            'Downloading Comic 1040 1020 downloads...',
            'Downloading Comic 1060 1040 downloads...',
            'Downloading Comic 1080 1060 downloads...',
            'Downloading Comic 1100 1080 downloads...',
        ])
    })
})
