const axios = require('axios')
jest.mock('axios')

const { axiosDownloader, axiosCatch404Downloader } = require('./downloader')

describe('axiosDownloader', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return response for successful request', async () => {
        const url = 'https://example.com'
        const options = {}
        const response = { status: 200, data: 'success' }
        axios.get.mockResolvedValue(response)

        const result = await axiosDownloader(options)(url)
        expect(result).toBe(response)
    })

    it('should throw error for invalid URL', async () => {
        const url = ' invalid-url'
        const options = {}
        axios.get.mockRejectedValue(new Error('Invalid URL'))

        await expect(axiosDownloader(options)(url)).rejects.toThrowError('Invalid URL')
    })

    it('should override options with validateStatus', async () => {
        const url = 'https://example.com'
        const options = { xyz: 'abc', validateStatus: () => false }
        axios.get.mockResolvedValue({ status: 404 })

        axiosDownloader(options)(url)
        expect(axios.get).toHaveBeenCalledTimes(1)
        expect(axios.get).toHaveBeenCalledWith(url, options)
    })
})

describe('axiosCatch404Downloader', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return response for successful request', async () => {
        const url = 'https://example.com'
        const options = {}
        const response = { status: 200, data: 'success' }
        axios.get.mockResolvedValue(response)

        const result = await axiosCatch404Downloader(options)(url)
        expect(result).toBe(response)
    })

    it('should return false for 404 response', async () => {
        const url = 'https://example.com'
        const options = {}
        const response = { status: 404 }
        axios.get.mockResolvedValue(response)

        const result = await axiosCatch404Downloader(options)(url)
        expect(result).toBe(false)
    })

    it('should throw error for invalid URL', async () => {
        const url = ' invalid-url'
        const options = {}
        axios.get.mockRejectedValue(new Error('Invalid URL'))

        await expect(axiosCatch404Downloader(options)(url)).rejects.toThrowError('Invalid URL')
    })

    it('should not override options with validateStatus', async () => {
        const url = 'https://example.com'
        const options = { xyz: 'abc', validateStatus: () => false }
        const response = { status: 200, data: 'success' }
        axios.get.mockResolvedValue(response)

        await axiosCatch404Downloader(options)(url)
        const [cUrl, cOptions] = axios.get.mock.calls[0]
        
        expect(axios.get).toHaveBeenCalledTimes(1)
        expect(cUrl).toBe(url)
        expect(cOptions.xyz).toEqual(options.xyz)
        expect(cOptions.validateStatus).not.toEqual(options.validateStatus)
    })

    it('should handle response status correctly', async () => {
        const url = 'https://example.com'
        const options = {}
        axios.get.mockResolvedValue({ status: 404 })

        await axiosCatch404Downloader(options)(url)

        const [_, cOptions] = axios.get.mock.calls[0]

        expect(cOptions.validateStatus).toBeInstanceOf(Function)
        expect(cOptions.validateStatus(200)).toBe(true)
        expect(cOptions.validateStatus(302)).toBe(false)
        expect(cOptions.validateStatus(401)).toBe(false)
        expect(cOptions.validateStatus(404)).toBe(true)
        expect(cOptions.validateStatus(403)).toBe(false)
        expect(cOptions.validateStatus(500)).toBe(false)
    })
})
