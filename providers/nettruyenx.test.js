const download = require('./nettruyenx')

const downloader = require('../libs/downloader')
jest.mock('../libs/downloader')

describe('download', () => {
    const SUCCESS_RESPONSE = { data: { pipe: () => { } } }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call writter with correct arguments when having a response', async () => {
        const name = 'TestComic'
        const chapter = 1

        downloader.axiosCatch404Downloader.mockReturnValue(jest.fn().mockResolvedValueOnce(SUCCESS_RESPONSE).mockResolvedValue(false))

        const writter = jest.fn()
        await download(name, chapter)(writter)

        expect(writter).toHaveBeenCalledTimes(1)
        expect(writter).toHaveBeenCalledWith(name, chapter, 0)
    })

    it('should handle a break response correctly and stop downloading', async () => {
        const name = 'TestComic'
        const chapter = 1

        const downloadFunc = jest.fn()
            .mockResolvedValueOnce(SUCCESS_RESPONSE)
            .mockResolvedValueOnce(SUCCESS_RESPONSE)
            .mockResolvedValueOnce(false)

        downloader.axiosCatch404Downloader.mockReturnValue(downloadFunc)

        const writter = jest.fn()
        await download(name, chapter)(writter)

        expect(downloadFunc).toHaveBeenCalledTimes(3)
        expect(downloadFunc).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/0.jpg`)
        expect(downloadFunc).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/1.jpg`)
        expect(downloadFunc).toHaveBeenCalledWith(`https://cmnvymn.com/nettruyen/${name}/1/2.jpg`)

        expect(writter).toHaveBeenCalledTimes(2)
        expect(writter).toHaveBeenCalledWith(name, chapter, 0)
        expect(writter).toHaveBeenCalledWith(name, chapter, 1)
    })

    it('should throw an error when having an error response', async () => {
        const name = 'TestComic'
        const chapter = 1

        const error = new Error('Test error')
        downloader.axiosCatch404Downloader.mockReturnValue(jest.fn().mockRejectedValue(error))

        const writter = jest.fn()

        await expect(download(name, chapter)(writter)).rejects.toThrowError(error)

        expect(writter).toHaveBeenCalledTimes(0)
    })
})
