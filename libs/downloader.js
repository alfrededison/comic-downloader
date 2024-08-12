const axios = require('axios')

const axiosDownloader = (options) =>
    (url) => axios.get(url, options)

const axiosCatch404Downloader = (options) =>
    async (url) => {
        const response = await axios.get(url, {
            ...options,
            validateStatus: status => (status >= 200 && status < 300) || status === 404
        })

        if (response.status === 404) {
            return false
        }

        return response
    }

module.exports = {
    axiosDownloader,
    axiosCatch404Downloader,
}
