module.exports = (chaplistScraper, imgScraper) =>
    (downloader, writter) => {
        const cachedChaplists = {}

        return async (name, chapter) => {
            if (cachedChaplists[name] === undefined) {
                cachedChaplists[name] = await chaplistScraper(name)
            }

            const totalChapters = cachedChaplists[name].length
            if (chapter < 1 || chapter > totalChapters) {
                console.log(`${name} has ${totalChapters} chapters`)
                return
            }

            const imgs = await imgScraper(cachedChaplists[name], chapter)

            const download = async (url, page) => {
                console.log(`Downloading ${name} - chap ${chapter}/${totalChapters} - img ${page}/${imgs.length}...`)
                const response = await downloader(url)
                writter(name, chapter, page)(response)
            }

            return imgs.reduce((acc, url, index) => {
                const page = index + 1
                return acc.then(() => download(url, page))
            }, Promise.resolve())
        }
    }
