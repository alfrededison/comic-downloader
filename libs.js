const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const createQueue = (threads) => {
    let activeThreads = 0
    const queue = []

    const dequeue = async () => {
        if (activeThreads >= threads || queue.length === 0) {
            return
        }

        activeThreads++
        const { task, resolve } = queue.shift()
        await task()
        resolve()
        activeThreads--

        // Process the next task in the queue
        dequeue()
    }

    const enqueue = (task) => {
        return new Promise((resolve) => {
            queue.push({ task, resolve })
            dequeue()
        })
    }

    return enqueue
}

const createJobs = (start, end, each) => (fn) => Array.from(
    { length: Math.ceil((end - start) / each) },
    (_, i) => () => fn(start + i * each, Math.min(end, start + (i + 1) * each)),
)

module.exports = {
    sleep,
    createQueue,
    createJobs,
}
