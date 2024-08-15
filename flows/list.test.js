const downloadFunction = require('./list')

describe('downloadFunction', () => {
    const chaplistScraper = jest.fn().mockReturnValue(['chaplist-item'])
    const imgScraper = jest.fn().mockReturnValue(['image-url'])
    const imgDownloader = jest.fn().mockResolvedValue('image-data')
    const writeFn = jest.fn()
    const writter = jest.fn().mockReturnValue(writeFn)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns a function that takes name and chapter as arguments', () => {
        const downloader = downloadFunction(chaplistScraper, imgScraper)(imgDownloader, writter)
        expect(downloader).toBeInstanceOf(Function)
        expect(downloader.length).toBe(2)
    })

    it('caches chaplists for each name', async () => {
        const downloader = downloadFunction(chaplistScraper, imgScraper)(imgDownloader, writter)
        const name = 'name1'
        await downloader(name, 1)
        expect(chaplistScraper).toHaveBeenCalledTimes(1)
        expect(chaplistScraper).toHaveBeenCalledWith(name)

        await downloader(name, 2)
        expect(chaplistScraper).toHaveBeenCalledTimes(1)
        expect(chaplistScraper).toHaveBeenCalledWith(name)
    })

    it('returns an empty array if chapter is out of range', async () => {
        const downloader = downloadFunction(chaplistScraper, imgScraper)(imgDownloader, writter)
        await downloader('name', 0)
        expect(writter).not.toHaveBeenCalled()

        await downloader('name', 2)
        expect(writter).not.toHaveBeenCalled()
    })

    it('scrapes images for a given chapter', async () => {
        const downloader = downloadFunction(chaplistScraper, imgScraper)(imgDownloader, writter)
        await downloader('name', 1)
        expect(imgScraper).toHaveBeenCalledTimes(1)
        expect(imgScraper).toHaveBeenCalledWith(['chaplist-item'], 1)
    })

    it('downloads images using the imgDownloader function', async () => {
        const downloader = downloadFunction(chaplistScraper, imgScraper)(imgDownloader, writter)
        await downloader('name', 1)
        expect(imgDownloader).toHaveBeenCalledTimes(1)
        expect(imgDownloader).toHaveBeenCalledWith('image-url')
    })

    it('calls the writter function with the correct arguments', async () => {
        const downloader = downloadFunction(chaplistScraper, imgScraper)(imgDownloader, writter)
        await downloader('name', 1)
        expect(writter).toHaveBeenCalledTimes(1)
        expect(writter).toHaveBeenCalledWith('name', 1, 1)
        expect(writeFn).toHaveBeenCalledWith('image-data')
    })
})
