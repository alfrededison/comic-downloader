const createQueue = (threads, { continueOnError = false } = {}) => {
    let activeThreads = 0
    const queue = []

    const dequeue = async () => {
        if (activeThreads >= threads || queue.length === 0) {
            return
        }

        activeThreads++
        const { task, resolve, reject } = queue.shift()

        try {
            await task()
            resolve()
        } catch (error) {
            if (continueOnError) {
                resolve() // Continue to the next job
            } else {
                reject(error) // Fail the enqueue promise
            }
        } finally {
            activeThreads--
            // Process the next task in the queue
            dequeue()
        }
    }

    const enqueue = (task) => {
        return new Promise((resolve, reject) => {
            queue.push({ task, resolve, reject })
            dequeue()
        })
    }

    return enqueue
}

const createJobs = (start, end) => (fn) => Array.from(
    { length: end - start + 1 },
    (_, i) => () => fn(start + i),
)

module.exports = {
    createQueue,
    createJobs,
}
