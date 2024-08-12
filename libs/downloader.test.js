const axios = require('axios')
jest.mock('axios')

const { axiosCatch404Downloader } = require('./downloader')

describe('axiosCatch404Downloader', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return response for successful request', async () => {
        const url = 'https://example.com'
        const options = {}
        const response = { status: 200, data: 'success' }
        axios.get.mockResolvedValue(response)

        const downloader = axiosCatch404Downloader(options)
        const result = await downloader(url)
        expect(result).toBe(response)
    })

    it('should return false for 404 response', async () => {
        const url = 'https://example.com'
        const options = {}
        const response = { status: 404 }
        axios.get.mockResolvedValue(response)

        const downloader = axiosCatch404Downloader(options)
        const result = await downloader(url)
        expect(result).toBe(false)
    })

    it('should throw error for invalid URL', async () => {
        const url = ' invalid-url'
        const options = {}
        axios.get.mockRejectedValue(new Error('Invalid URL'))

        const downloader = axiosCatch404Downloader(options)
        await expect(downloader(url)).rejects.toThrowError('Invalid URL')
    })

    it('should not override options with validateStatus', async () => {
        const url = 'https://example.com'
        const options = { validateStatus: () => false }
        const response = { status: 200, data: 'success' }
        axios.get.mockResolvedValue(response)

        const downloader = axiosCatch404Downloader(options)
        const result = await downloader(url)
        expect(result).toBe(response)
    })

    it('should handle response status correctly', async () => {
        const url = 'https://example.com'
        const options = {}
        axios.get.mockResolvedValue({ status: 404 })

        const downloader = axiosCatch404Downloader(options)
        await downloader(url)

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
