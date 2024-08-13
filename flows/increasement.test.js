const downloadFlow = require('./increasement')

describe('downloadFunction', () => {
  it('should download successfully with valid response', async () => {
    const downloader = jest.fn()
      .mockResolvedValueOnce('valid response')
      .mockResolvedValueOnce(false)
    const fn = jest.fn()
    const writter = jest.fn().mockReturnValue(fn)
    const directLinkBuilder = jest.fn().mockReturnValue('url')

    await downloadFlow(downloader, directLinkBuilder)(writter)('name', 'chapter')

    expect(downloader).toHaveBeenCalledTimes(2)
    expect(writter).toHaveBeenCalledTimes(1)
    expect(writter).toHaveBeenCalledWith('name', 'chapter', 0)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('valid response')
  })

  it('should stop download with false response', async () => {
    const downloader = jest.fn().mockResolvedValueOnce(false)
    const fn = jest.fn()
    const writter = jest.fn().mockReturnValue(fn)
    const directLinkBuilder = jest.fn().mockReturnValue('url')

    await downloadFlow(downloader, directLinkBuilder)(writter)('name', 'chapter')

    expect(downloader).toHaveBeenCalledTimes(1)
    expect(writter).not.toHaveBeenCalled()
    expect(fn).not.toHaveBeenCalled()
  })

  it('should handle download error', async () => {
    const downloader = jest.fn().mockRejectedValueOnce(new Error('download error'))
    const fn = jest.fn()
    const writter = jest.fn().mockReturnValue(fn)
    const directLinkBuilder = jest.fn().mockReturnValue('url')

    await expect(downloadFlow(downloader, directLinkBuilder)(writter)('name', 'chapter')).rejects.toThrowError('download error')

    expect(downloader).toHaveBeenCalledTimes(1)
    expect(writter).not.toHaveBeenCalled()
    expect(fn).not.toHaveBeenCalled()
  })
})
