const fs = require('fs')
jest.mock('fs')

const { pageWritter, wrappedPageWritter, pageWriteStreamBuilder, responsePipe } = require("./writters")

describe('pageWriteStreamBuilder', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Correctly constructs file path with leading zeros', () => {
        const path = 'test/path'
        const name = 'testName'
        const chapter = 1

        pageWriteStreamBuilder(path, name, chapter, 2)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/002.jpg`)

        pageWriteStreamBuilder(path, name, chapter, 20)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/020.jpg`)

        pageWriteStreamBuilder(path, name, chapter, 200)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/200.jpg`)

        pageWriteStreamBuilder(path, name, chapter, 2000)
        expect(fs.createWriteStream).toHaveBeenCalledWith(`${path}/${name}/${name}-1/2000.jpg`)
    })
})

describe('responsePipe', () => {
    it('returns a function', () => {
        const stream = {}
        const result = responsePipe(stream)
        expect(result).toBeInstanceOf(Function)
    })

    it('calls pipe on response data with provided stream', () => {
        const stream = {}
        const response = { data: { pipe: jest.fn() } }
        const result = responsePipe(stream)
        result(response)
        expect(response.data.pipe).toHaveBeenCalledTimes(1)
        expect(response.data.pipe).toHaveBeenCalledWith(stream)
    })
})

describe('pageWritter', () => {
    it('returns a function', () => {
        const writeStreamBuilder = () => { }
        const responseHandler = () => { }
        const result = pageWritter(writeStreamBuilder, responseHandler)
        expect(result).toBeInstanceOf(Function)
    })

    it('calls responseHandler with the result of writeStreamBuilder', () => {
        const writeStreamBuilder = () => 'result'
        const responseHandler = jest.fn()
        const result = pageWritter(writeStreamBuilder, responseHandler)
        result()
        expect(responseHandler).toHaveBeenCalledTimes(1)
        expect(responseHandler).toHaveBeenCalledWith('result')
    })

    it('passes the correct arguments to writeStreamBuilder', () => {
        const name = 'name'
        const chapter = 'chapter'
        const page = 'page'
        const writeStreamBuilder = jest.fn()
        const responseHandler = () => { }
        const result = pageWritter(writeStreamBuilder, responseHandler)
        result(name, chapter, page)
        expect(writeStreamBuilder).toHaveBeenCalledTimes(1)
        expect(writeStreamBuilder).toHaveBeenCalledWith(name, chapter, page)
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
