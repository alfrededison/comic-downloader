const { scrape } = require('../libs/scraper')

module.exports = ({
    contentDownloader, chaplistUrlBuilder, chaplistExtractor,
    imgDownloader, imgExtractor,
}) =>
    (writter) => {
        const cachedChaplists = {}

        const chaplistScraper = scrape(chaplistUrlBuilder, contentDownloader, chaplistExtractor)
        const chapterGetter = (chaplist) => (chapter) => chaplist[chapter - 1]

        return async (name, chapter) => {
            if (cachedChaplists[name] === undefined) {
                cachedChaplists[name] = await chaplistScraper(name)
            }
            if (chapter < 1 || chapter > cachedChaplists[name].length) {
                return
            }

            const chapterUrlBuilder = chapterGetter(cachedChaplists[name])
            const imgScraper = scrape(chapterUrlBuilder, contentDownloader, imgExtractor)

            const imgs = await imgScraper(chapter)

            const download = async (url, page) => {
                console.log(`Downloading ${name} - chap ${chapter} - img ${page}...`)
                const response = await imgDownloader(url)
                writter(name, chapter, page)(response)
            }

            return imgs.reduce((acc, url, index) => {
                const page = index + 1
                return acc.then(() => download(url, page))
            }, Promise.resolve())
        }
    }
