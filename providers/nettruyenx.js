const { axiosCatch404Downloader } = require("../libs/downloader")

module.exports = (writter) => async (name, chapter) => {
    const download = async (name, chapter, page) => {
        console.log(`Downloading ${name} - chap ${chapter} - img ${page}...`)

        const url = `https://cmnvymn.com/nettruyen/${name}/${chapter}/${page}.jpg`
        const downloader = axiosCatch404Downloader({ responseType: 'stream' })

        const response = await downloader(url)

        if (response === false) {
            return
        }

        response.data.pipe(writter(name, chapter, page))
        return download(name, chapter, page + 1)
    }

    return download(name, chapter, 0)
}
