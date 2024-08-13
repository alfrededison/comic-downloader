const increasement = require("../flows/increasement")
const { axiosCatch404Downloader } = require("../libs/downloader")
const { pageWritter, responsePipe } = require("../libs/writters")

const directLinkBuilder = (name, chapter, page) => `https://cmnvymn.com/nettruyen/${name}/${chapter}/${page}.jpg`

module.exports = (streamWritter) => increasement(
    axiosCatch404Downloader({ responseType: 'stream' }),
    directLinkBuilder
)(pageWritter(streamWritter, responsePipe))
