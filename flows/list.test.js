const downloadFunction = require('./list')

describe('downloadFunction', () => {
    let contentDownloader, chaplistUrlBuilder, chaplistExtractor, imgDownloader, imgExtractor, writter

    beforeEach(() => {
        contentDownloader = jest.fn().mockResolvedValue('content')
        chaplistUrlBuilder = jest.fn().mockReturnValue('chaplist-url')
        chaplistExtractor = jest.fn().mockReturnValue(['chaplist-item'])
        imgDownloader = jest.fn().mockResolvedValue('image-data')
        imgExtractor = jest.fn().mockReturnValue(['image-url'])
        writter = jest.fn().mockReturnValue(jest.fn())
    })

    it('returns a function that takes name and chapter as arguments', () => {
        const downloader = downloadFunction({
            contentDownloader,
            chaplistUrlBuilder,
            chaplistExtractor,
            imgDownloader,
            imgExtractor,
        })(writter)
        expect(typeof downloader).toBe('function')
        expect(downloader.length).toBe(2)
    })

    it('caches chaplists for each name', async () => {
        const downloader = downloadFunction({
            contentDownloader,
            chaplistUrlBuilder,
            chaplistExtractor,
            imgDownloader,
            imgExtractor,
        })(writter)
        await downloader('name1', 1)
        expect(chaplistUrlBuilder).toHaveBeenCalledTimes(1)
        expect(chaplistUrlBuilder).toHaveBeenCalledWith('name1')
        expect(contentDownloader).toHaveBeenCalledTimes(2)
        expect(contentDownloader).toHaveBeenCalledWith('chaplist-url')
        expect(contentDownloader).toHaveBeenCalledWith('chaplist-item')
        expect(chaplistExtractor).toHaveBeenCalledTimes(1)
        expect(chaplistExtractor).toHaveBeenCalledWith('content')

        await downloader('name1', 2)
        expect(chaplistUrlBuilder).toHaveBeenCalledTimes(1)
        expect(contentDownloader).toHaveBeenCalledTimes(2)
    })

    it('returns an empty array if chapter is out of range', async () => {
        const downloader = downloadFunction({
            contentDownloader,
            chaplistUrlBuilder,
            chaplistExtractor,
            imgDownloader,
            imgExtractor,
        })(writter)
        await downloader('name', 0)
        expect(writter).not.toHaveBeenCalled()

        await downloader('name', 2)
        expect(writter).not.toHaveBeenCalled()
    })

    it('scrapes images for a given chapter', async () => {
        const downloader = downloadFunction({
            contentDownloader,
            chaplistUrlBuilder,
            chaplistExtractor,
            imgDownloader,
            imgExtractor,
        })(writter)
        await downloader('name', 1)
        expect(imgExtractor).toHaveBeenCalledTimes(1)
        expect(imgExtractor).toHaveBeenCalledWith('content')
        expect(imgDownloader).toHaveBeenCalledTimes(1)
        expect(imgDownloader).toHaveBeenCalledWith('image-url')
    })

    it('downloads images using the imgDownloader function', async () => {
        const downloader = downloadFunction({
            contentDownloader,
            chaplistUrlBuilder,
            chaplistExtractor,
            imgDownloader,
            imgExtractor,
        })(writter)
        await downloader('name', 1)
        expect(imgDownloader).toHaveBeenCalledTimes(1)
        expect(imgDownloader).toHaveBeenCalledWith('image-url')
    })

    it('calls the writter function with the correct arguments', async () => {
        const downloader = downloadFunction({
            contentDownloader,
            chaplistUrlBuilder,
            chaplistExtractor,
            imgDownloader,
            imgExtractor,
        })(writter)
        await downloader('name', 1)
        expect(writter).toHaveBeenCalledTimes(1)
        expect(writter).toHaveBeenCalledWith('name', 1, 1)
    })
})
