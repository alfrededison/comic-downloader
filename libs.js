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

module.exports = {
    sleep,
    createQueue,
}
