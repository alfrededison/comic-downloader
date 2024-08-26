const increasement = require("../flows/increasement")
const { axiosCatch404Downloader } = require("../libs/downloader")
const { pageWritter, responsePipe } = require("../libs/writters")

const directLinkBuilder = (name, chapter, page) => `https://ddntcthcd.com/nettruyen/${name}/${chapter}/${page}.jpg`

module.exports = (streamWritter) => increasement(directLinkBuilder)(
    axiosCatch404Downloader({
        responseType: 'stream',
        headers: {
            'referer': 'https://nettruyenx.com/',
        }
    }),
    pageWritter(streamWritter, responsePipe)
)
