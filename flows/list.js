module.exports = (chaplistScraper, imgScraper) =>
    (downloader, writter) => {
        const cachedChaplists = {}

        return async (name, chapter) => {
            if (cachedChaplists[name] === undefined) {
                cachedChaplists[name] = await chaplistScraper(name)
            }
            if (chapter < 1 || chapter > cachedChaplists[name].length) {
                return
            }

            const imgs = await imgScraper(cachedChaplists[name], chapter)

            const download = async (url, page) => {
                console.log(`Downloading ${name} - chap ${chapter} - img ${page}...`)
                const response = await downloader(url)
                writter(name, chapter, page)(response)
            }

            return imgs.reduce((acc, url, index) => {
                const page = index + 1
                return acc.then(() => download(url, page))
            }, Promise.resolve())
        }
    }
