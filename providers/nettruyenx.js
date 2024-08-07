const axios = require('axios')

module.exports = (name, chapter) => async (writter) => {
    const download = async (name, chapter, page) => {
        console.log(`Downloading ${name} - chap ${chapter} - img ${page}...`)

        const url = `https://cmnvymn.com/nettruyen/${name}/${chapter}/${page}.jpg`
        const response = await axios.get(url, {
            responseType: 'stream',
            validateStatus: status => (status >= 200 && status < 300) || status === 404
        })

        if (response.status === 404) {
            return
        }

        response.data.pipe(writter(name, chapter, page))
        return download(name, chapter, page + 1)
    }

    return download(name, chapter, 0)
}
