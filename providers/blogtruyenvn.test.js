const download = require('./blogtruyenvn')

const downloader = require('../libs/downloader')
jest.mock('../libs/downloader')

describe('download', () => {
    const SUCCESS_RESPONSE = { data: { pipe: () => { } } }
    const CHAPLIST_RESPONSE = {
        data: `<div class="list-wrap" id="list-chapters">
                <p id="chapter-26766">
                    <span class="title"> <a id="c_26766" href="/c26766/some-chapter-name-1" title="Some Chapter name 1">Some Chapter name 1</a> </span>
                    <span class="publishedDate"> 17/04/2012 </span>
                </p> </div>`
    }
    const IMGS_RESPONSE = {
        data: `<article id="content">
                <img src="https://some.url.info/manga/13/13223/0.jpg"> <img src="https://some.url.info/manga/13/13223/1.jpg"><div class="qc_TC_Chap_Middle" data-positionchapter="1">
                </div><img src="https://some.url.info/25/25630/1-51.jpg"><img src="https://some.url.info/25/25630/1-52.jpg">
                </article>
                `
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call writter with correct arguments when having a valid response', async () => {
        const name = '123/TestComic'
        const chapter = 1

        const downloadFunc = jest.fn()
            .mockResolvedValueOnce(CHAPLIST_RESPONSE)
            .mockResolvedValueOnce(IMGS_RESPONSE)
            .mockResolvedValue(SUCCESS_RESPONSE)

        downloader.axiosDownloader.mockReturnValue(downloadFunc)

        const writter = jest.fn()
        await download(writter)(name, chapter)

        expect(downloadFunc).toHaveBeenCalledTimes(6)
        expect(downloadFunc).toHaveBeenCalledWith(`https://blogtruyenvn.com/123/TestComic`)
        expect(downloadFunc).toHaveBeenCalledWith(`https://blogtruyenvn.com/c26766/some-chapter-name-1`)
        expect(downloadFunc).toHaveBeenCalledWith(`https://some.url.info/manga/13/13223/0.jpg`)
        expect(downloadFunc).toHaveBeenCalledWith(`https://some.url.info/manga/13/13223/1.jpg`)
        expect(downloadFunc).toHaveBeenCalledWith(`https://some.url.info/25/25630/1-51.jpg`)
        expect(downloadFunc).toHaveBeenCalledWith(`https://some.url.info/25/25630/1-52.jpg`)

        expect(writter).toHaveBeenCalledTimes(4)
        expect(writter).toHaveBeenCalledWith(name, chapter, 1)
        expect(writter).toHaveBeenCalledWith(name, chapter, 2)
        expect(writter).toHaveBeenCalledWith(name, chapter, 3)
        expect(writter).toHaveBeenCalledWith(name, chapter, 4)
    })

    it('should handle incorrect chapter', async () => {
        const name = '123/TestComic'

        const downloadFunc = jest.fn()
            .mockResolvedValueOnce(CHAPLIST_RESPONSE)
            .mockResolvedValueOnce(IMGS_RESPONSE)
            .mockResolvedValue(SUCCESS_RESPONSE)

        downloader.axiosDownloader.mockReturnValue(downloadFunc)

        const writter = jest.fn()

        await download(writter)(name, 0)
        expect(downloadFunc).toHaveBeenCalledTimes(1)

        await download(writter)(name, 2)
        expect(downloadFunc).toHaveBeenCalledTimes(2)

        expect(writter).not.toHaveBeenCalled()
    })
    
    it('should handle caching chapter list', async () => {
        const name = '123/TestComic'

        const downloadFunc = jest.fn()
            .mockResolvedValueOnce(CHAPLIST_RESPONSE)
            .mockResolvedValueOnce(IMGS_RESPONSE)
            .mockResolvedValue(SUCCESS_RESPONSE)

        downloader.axiosDownloader.mockReturnValue(downloadFunc)

        const writter = jest.fn()
        const downloadFn = download(writter)

        await downloadFn(name, 0)
        expect(downloadFunc).toHaveBeenCalledTimes(1)

        await downloadFn(name, 2)
        expect(downloadFunc).toHaveBeenCalledTimes(1)
    })

    it('should throw an error when having an error response', async () => {
        const name = 'TestComic'
        const chapter = 1

        const error = new Error('Test error')
        downloader.axiosDownloader.mockReturnValue(jest.fn().mockRejectedValue(error))

        const writter = jest.fn()

        await expect(download(writter)(name, chapter)).rejects.toThrowError(error)

        expect(writter).toHaveBeenCalledTimes(0)
    })
})
