# Comic Downloader
Download comics from various providers

## Installation
```
npm install
```

## Usage
```
npm start -- --help

> node main.js "--help"

Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -n, --name      The name of the comic                      [string] [required]
  -s, --start     The start number of the chapters           [number] [required]
  -e, --end       The end number of chapters                 [number] [required]
  -p, --path      The path to save the image                 [string] [required]
  -t, --threads   The number of threads to use                          [number]
  -d, --provider  The provider to use: blogtruyenvn, nettruyenx, _dummy [string]
```
