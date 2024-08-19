const fs = require('fs')
const path = require('path')
const { fileLogger } = require('./loggers')

describe('fileLogger', () => {
    const testFilePath = 'test-log.txt'

    afterEach(() => {
        fs.existsSync(testFilePath) && fs.unlinkSync(testFilePath)
    })

    it('returns an object with info and error methods', () => {
        const logger = fileLogger(testFilePath)
        expect(logger).toHaveProperty('info')
        expect(logger).toHaveProperty('error')
    })

    it('info method appends a log message to the file with [INF] prefix', () => {
        const logger = fileLogger(testFilePath)
        logger.info('Test message')
        const logContent = fs.readFileSync(testFilePath, 'utf8')
        expect(logContent).toBe('[INF] Test message\n')
    })

    it('error method appends a log message to the file with [ERR] prefix', () => {
        const logger = fileLogger(testFilePath)
        logger.error('Test error message')
        const logContent = fs.readFileSync(testFilePath, 'utf8')
        expect(logContent).toBe('[ERR] Test error message\n')
    })

    it('info and error methods append messages to the correct file path', () => {
        const logger = fileLogger(testFilePath)
        logger.info('Test message')
        logger.error('Test error message')
        const logContent = fs.readFileSync(testFilePath, 'utf8')
        expect(logContent).toBe('[INF] Test message\n[ERR] Test error message\n')
    })

    it('info and error methods throw an error if the file path is invalid', () => {
        const invalidFilePath = './invalid/path/file.txt'
        const logger = fileLogger(invalidFilePath)
        expect(() => logger.info('Test message')).toThrowError()
        expect(() => logger.error('Test error message')).toThrowError()
    })
})
