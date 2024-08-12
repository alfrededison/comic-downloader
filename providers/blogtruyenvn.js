const { axiosDownloader } = require("../libs/downloader")
const { getPageContent, parsePageContent, scrape } = require("../libs/scraper")

const DOMAIN = "https://blogtruyenvn.com"

module.exports = (writter) => {
    const cachedChaplists = {}

    const downloader = async (url) => {
        const response = await axiosDownloader()(url)
        return response.data
    }
    const contentDownloader = getPageContent(downloader, parsePageContent)

    const chaplistUrlBuilder = (name) => `${DOMAIN}/${name}`
    const chaplistExtractor = (root) => root.querySelectorAll("#list-chapters a").reverse().map((node) => DOMAIN + node.getAttribute("href"))
    const chaplistScraper = scrape(chaplistUrlBuilder, contentDownloader, chaplistExtractor)

    const chapterGetter = (chaplist) => (chapter) => chaplist[chapter - 1]
    const imgExtractor = (root) => root.querySelectorAll("#content img").map((node) => node.getAttribute("src"))

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

        const download = async (url, n, c, p) => {
            console.log(`Downloading ${n} - chap ${c} - img ${p}...`)
            const downloader = axiosDownloader({ responseType: 'stream' })
            const response = await downloader(url)
            response.data.pipe(writter(n, c, p))
        }

        return imgs.reduce((acc, url, index) => {
            const page = index + 1
            return acc.then(() => download(url, name, chapter, page))
        }, Promise.resolve())
    }
}
