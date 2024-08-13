module.exports = (downloader, directLinkBuilder) => (writter) =>
    async (name, chapter) => {
        const download = async (page) => {
            console.log(`Downloading ${name} - chap ${chapter} - img ${page}...`)

            const url = directLinkBuilder(name, chapter, page)
            const response = await downloader(url)

            if (response === false) {
                return
            }

            writter(name, chapter, page)(response)
            return download(page + 1)
        }

        return download(0)
    }
