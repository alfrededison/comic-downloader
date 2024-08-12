const HTMLParser = require('node-html-parser')

const parsePageContent = (content) =>
    (content && HTMLParser.valid(content)) ? HTMLParser.parse(content) : null

const getPageContent = (downloader, parser) => async (url) => {
    const response = await downloader(url)

    if (response === false) {
        return false
    }

    return parser(response)
}

const scrape = (urlBuilder, contentDownloader, extractor) => async (param) => {
    const url = urlBuilder(param)
    const content = await contentDownloader(url)
    return extractor(content)
}

module.exports = {
    getPageContent,
    parsePageContent,
    scrape,
}
