const { getPageContent, parsePageContent, scrape } = require('./scraper')

describe('parsePageContent', () => {
  it('should return a valid HTML element', () => {
    const content = '<html><head></head><body></body></html>'
    const result = parsePageContent(content)
    expect(result).toHaveProperty('querySelector')
    expect(result).toHaveProperty('querySelectorAll')
  })

  it('should return null for empty content', () => {
    const content = ''
    const result = parsePageContent(content)
    expect(result).toBeNull()
  })

  it('should return null for invalid content', () => {
    const content = '<html><head></head><body>'
    const result = parsePageContent(content)
    expect(result).toBeNull()
  })
})

describe('getPageContent', () => {
  it('should return successful response from downloader', async () => {
    const downloader = jest.fn().mockResolvedValue('response')
    const parser = jest.fn().mockReturnValue('parsed response')
    const url = 'https://example.com'
    const result = await getPageContent(downloader, parser)(url)
    expect(result).toBe('parsed response')
    expect(downloader).toHaveBeenCalledTimes(1)
    expect(downloader).toHaveBeenCalledWith(url)
    expect(parser).toHaveBeenCalledTimes(1)
    expect(parser).toHaveBeenCalledWith('response')
  })

  it('should return false when downloader returns false', async () => {
    const downloader = jest.fn().mockResolvedValue(false)
    const parser = jest.fn()
    const url = 'https://example.com'
    const result = await getPageContent(downloader, parser)(url)
    expect(result).toBe(false)
    expect(downloader).toHaveBeenCalledTimes(1)
    expect(downloader).toHaveBeenCalledWith(url)
    expect(parser).not.toHaveBeenCalled()
  })

  it('should handle error when downloader throws an error', async () => {
    const downloader = jest.fn().mockRejectedValue(new Error('Downloader error'))
    const parser = jest.fn()
    const url = 'https://example.com'
    await expect(getPageContent(downloader, parser)(url)).rejects.toThrowError('Downloader error')
    expect(downloader).toHaveBeenCalledTimes(1)
    expect(downloader).toHaveBeenCalledWith(url)
    expect(parser).not.toHaveBeenCalled()
  })
})

describe('scrape function', () => {
  it('should scrape successfully with valid inputs', async () => {
    const urlBuilder = jest.fn(() => 'https://example.com')
    const contentDownloader = jest.fn(() => 'content')
    const extractor = jest.fn(() => 'extracted content')
    const name = 'test name'

    const result = await scrape(urlBuilder, contentDownloader, extractor)(name)
    expect(result).toBe('extracted content')
    expect(urlBuilder).toHaveBeenCalledTimes(1)
    expect(urlBuilder).toHaveBeenCalledWith(name)
    expect(contentDownloader).toHaveBeenCalledTimes(1)
    expect(contentDownloader).toHaveBeenCalledWith('https://example.com')
    expect(extractor).toHaveBeenCalledTimes(1)
    expect(extractor).toHaveBeenCalledWith('content')
  })

  it('should throw an error when urlBuilder throws an error', async () => {
    const urlBuilder = jest.fn(() => { throw new Error('urlBuilder error') })
    const contentDownloader = jest.fn()
    const extractor = jest.fn()
    const name = 'test name'

    await expect(scrape(urlBuilder, contentDownloader, extractor)(name)).rejects.toThrowError('urlBuilder error')
    expect(urlBuilder).toHaveBeenCalledTimes(1)
    expect(contentDownloader).not.toHaveBeenCalled()
    expect(extractor).not.toHaveBeenCalled()
  })

  it('should throw an error when contentDownloader throws an error', async () => {
    const urlBuilder = jest.fn(() => 'https://example.com')
    const contentDownloader = jest.fn(() => { throw new Error('contentDownloader error') })
    const extractor = jest.fn()
    const name = 'test name'

    await expect(scrape(urlBuilder, contentDownloader, extractor)(name)).rejects.toThrowError('contentDownloader error')
    expect(urlBuilder).toHaveBeenCalledTimes(1)
    expect(contentDownloader).toHaveBeenCalledTimes(1)
    expect(extractor).not.toHaveBeenCalled()
  })

  it('should throw an error when extractor throws an error', async () => {
    const urlBuilder = jest.fn(() => 'https://example.com')
    const contentDownloader = jest.fn(() => 'content')
    const extractor = jest.fn(() => { throw new Error('extractor error') })
    const name = 'test name'

    await expect(scrape(urlBuilder, contentDownloader, extractor)(name)).rejects.toThrowError('extractor error')
    expect(urlBuilder).toHaveBeenCalledTimes(1)
    expect(contentDownloader).toHaveBeenCalledTimes(1)
    expect(extractor).toHaveBeenCalledTimes(1)
  })

  it('should handle null or undefined inputs', async () => {
    const urlBuilder = null
    const contentDownloader = undefined
    const extractor = jest.fn()
    const name = 'test name'

    await expect(scrape(urlBuilder, contentDownloader, extractor)(name)).rejects.toThrowError()
  })
})
