const list = require("../flows/list")
const { axiosDownloader, axiosCatch404Downloader } = require("../libs/downloader")
const { getPageContent, parsePageContent, scrape } = require("../libs/scraper")
const { pageWritter, responsePipe } = require("../libs/writters")

const downloader = async (url) => {
    const response = await axiosDownloader()(url)
    return response.data
}
const contentDownloader = getPageContent(downloader, parsePageContent)

const DOMAIN = "https://blogtruyenvn.com"
const chaplistUrlBuilder = (name) => `${DOMAIN}/${name}`
const chaplistExtractor = (root) => root.querySelectorAll("#list-chapters .title a").reverse().map((node) => DOMAIN + node.getAttribute("href"))
const chaplistScraper = scrape(chaplistUrlBuilder, contentDownloader, chaplistExtractor)

const chapterUrlBuilder = (chaplist, chapter) => chaplist[chapter - 1]
const imgExtractor = (root) => root.querySelectorAll("#content img").map((node) => node.getAttribute("src")).slice(1, -1)
const imgScraper = scrape(chapterUrlBuilder, contentDownloader, imgExtractor)

module.exports = (streamWritter) => list(chaplistScraper, imgScraper)(
    axiosCatch404Downloader({ responseType: 'stream' }), pageWritter(streamWritter, responsePipe)
)
