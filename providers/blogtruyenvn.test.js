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
                    <span class="download"> <a href="http://some.host.com/?6b6hpp85x8vzcyr" rel="nofollow" title="Download">Download</a> </span>
                </p> </div>`
    }
    const IMGS_RESPONSE = {
        data: `<article id="content">
                <img src="https://i7.bumcheo.info/manga/13/13223/0.jpg"><img src="https://i10-1.bumcheo4.info/1091/1091883/0.jpg?v=1718957715"><img src="https://i10-1.bumcheo4.info/1091/1091883/1.jpg?v=1718957715"><div class="qc_TC_Chap_Middle" data-positionchapter="1">
                </div><img src="https://i10-1.bumcheo4.info/1091/1091883/11.jpg "><img src="https://i10-1.bumcheo4.info/1091/1091883/12.jpg "><img src="https://i7.bumcheo.info/manga/13/13223/1.png">        </article>`
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call writter with correct arguments when having a valid response', async () => {
        const name = '123/TestComic'
        const chapter = 1

        const contentDlFunc = jest.fn()
            .mockResolvedValueOnce(CHAPLIST_RESPONSE)
            .mockResolvedValueOnce(IMGS_RESPONSE)
        downloader.axiosDownloader.mockReturnValue(contentDlFunc)

        const imgDlFunc = jest.fn().mockResolvedValue(SUCCESS_RESPONSE)
        downloader.axiosCatch404Downloader.mockReturnValue(imgDlFunc)

        const writter = jest.fn()
        await download(writter)(name, chapter)

        expect(contentDlFunc).toHaveBeenCalledTimes(2)
        expect(contentDlFunc).toHaveBeenCalledWith(`https://blogtruyenvn.com/123/TestComic`)
        expect(contentDlFunc).toHaveBeenCalledWith(`https://blogtruyenvn.com/c26766/some-chapter-name-1`)
        
        expect(imgDlFunc).toHaveBeenCalledTimes(4)
        expect(imgDlFunc).not.toHaveBeenCalledWith(`https://i7.bumcheo.info/manga/13/13223/0.jpg`)
        expect(imgDlFunc).not.toHaveBeenCalledWith(`https://i7.bumcheo.info/manga/13/13223/1.png`)
        expect(imgDlFunc).toHaveBeenCalledWith(`https://i10-1.bumcheo4.info/1091/1091883/0.jpg?v=1718957715`)
        expect(imgDlFunc).toHaveBeenCalledWith(`https://i10-1.bumcheo4.info/1091/1091883/1.jpg?v=1718957715`)
        expect(imgDlFunc).toHaveBeenCalledWith(`https://i10-1.bumcheo4.info/1091/1091883/11.jpg`)
        expect(imgDlFunc).toHaveBeenCalledWith(`https://i10-1.bumcheo4.info/1091/1091883/12.jpg`)

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
