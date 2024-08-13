const list = require("../flows/list")
const { axiosDownloader } = require("../libs/downloader")
const { getPageContent, parsePageContent } = require("../libs/scraper")
const { pageWritter, responsePipe } = require("../libs/writters")

const downloader = async (url) => {
    const response = await axiosDownloader()(url)
    return response.data
}
const contentDownloader = getPageContent(downloader, parsePageContent)

const DOMAIN = "https://blogtruyenvn.com"
const chaplistUrlBuilder = (name) => `${DOMAIN}/${name}`
const chaplistExtractor = (root) => root.querySelectorAll("#list-chapters a").reverse().map((node) => DOMAIN + node.getAttribute("href"))

const imgExtractor = (root) => root.querySelectorAll("#content img").map((node) => node.getAttribute("src"))

module.exports = (streamWritter) => list({
    contentDownloader, chaplistUrlBuilder, chaplistExtractor,
    imgDownloader: axiosDownloader({ responseType: 'stream' }),
    imgExtractor,
})(pageWritter(streamWritter, responsePipe))
