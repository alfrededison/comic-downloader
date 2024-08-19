const fs = require('fs')

const fileLogger = (path) => {
    return {
        info: (message) => {
            fs.appendFileSync(path, `[INF] ${message}\n`)
        },
        error: (message) => {
            fs.appendFileSync(path, `[ERR] ${message}\n`)
        },
    }
}

module.exports = {
    fileLogger,
}
