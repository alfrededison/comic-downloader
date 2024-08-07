const axios = require('axios')
const download = require('./nettruyenx')

describe('download', () => {
    axios.get = jest.fn()

    const SUCCESS_RESPONSE = { status: 200, data: { pipe: () => { } } }
    const FAILURE_RESPONSE = { status: 404 }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should create directory structure when directory does not exist', async () => {
        const name = 'TestComic'
        const chapter = 1

        axios.get.mockResolvedValueOnce(SUCCESS_RESPONSE).mockResolvedValue(FAILURE_RESPONSE)

        const writter = jest.fn()
        await download(name, chapter)(writter)

        expect(writter).toHaveBeenCalledTimes(1)
        expect(writter).toHaveBeenCalledWith(name, chapter, 0)
    })

    it('should handle a 404 response correctly and stop downloading', async () => {
        const name = 'TestComic'
        const chapter = 1

        axios.get
        .mockResolvedValueOnce(SUCCESS_RESPONSE)
        .mockResolvedValueOnce(SUCCESS_RESPONSE)
        .mockResolvedValueOnce(FAILURE_RESPONSE)
        
        const writter = jest.fn()
        await download(name, chapter)(writter)

        expect(axios.get).toHaveBeenCalledTimes(3)
        expect(axios.get).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/0.jpg`, expect.any(Object))
        expect(axios.get).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/1.jpg`, expect.any(Object))
        expect(axios.get).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/2.jpg`, expect.any(Object))

        expect(writter).toHaveBeenCalledTimes(2)
        expect(writter).toHaveBeenCalledWith(name, chapter, 0)
        expect(writter).toHaveBeenCalledWith(name, chapter, 1)
    })

    it('should handle response status correctly', async () => {
        axios.get.mockResolvedValueOnce(FAILURE_RESPONSE)
        await download('TestComic', 1)(jest.fn())

        expect(axios.get).toHaveBeenCalledTimes(1)
        const [_, options] = axios.get.mock.calls[0]

        expect(options.validateStatus).toBeInstanceOf(Function)
        expect(options.validateStatus(200)).toBe(true)
        expect(options.validateStatus(302)).toBe(false)
        expect(options.validateStatus(401)).toBe(false)
        expect(options.validateStatus(404)).toBe(true)
        expect(options.validateStatus(403)).toBe(false)
        expect(options.validateStatus(500)).toBe(false)
    })
})
