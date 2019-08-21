# YouTube Downloader

`npm start`

YouTube Downloader is an Electron application which tracks your YouTube channel
subscriptions and syncs their videos with subtitles and comments to your phone
for offline viewing and reading.

For now it only downloads videos for the first channel in order for me to debug
the downloader first.

## To-Do

- Scrape comments (Puppeteer screenshots)
- Recognize MTP phone and sync videos https://docs.microsoft.com/en-us/uwp/api/windows.devices.portable.storagedevice
- Download subtitles
- Point Puppeteer to an instance of the Electron self if possible to stop bundling extra Chrome

## Notes

I opted to use Puppeteer to scrape the comments instead of the Youtube API,
because I am not going to bother with stupid keys just to get me a piece of data
which is already public.
