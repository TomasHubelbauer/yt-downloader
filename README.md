# YouTube Downloader

`npm start`

YouTube Downloader is an Electron application which tracks your YouTube channel
subscriptions and syncs their videos with subtitles and comments to your phone
for offline viewing and reading.

For now it only downloads videos for the first channel in order for me to debug
the downloader first.

## To-Do

- Scrape subscriptions from https://www.youtube.com/channel/$id/channels if public (auto-check?)
    - Update subscriptions obtained this way automatically - not possible with the OPML file
- See if it is possible to find the local Chrome installation (if any) with Puppeteer and download
  the OPML file through the user's browser profile (to avoid having them sign in)
  https://github.com/GoogleChrome/puppeteer/issues/4394 or
  https://github.com/bertrandom/chrome-cookies-secure
- Scrape comments (Puppeteer screenshots)
- Use AFC with https://github.com/mceSystems/libijs to sync videos
- Recognize watched videos by knowing they were synced but have been since deleted (to know not
  to reupload them to the phone)
- Download subtitles
- Point Puppeteer to an instance of the Electron self if possible to stop bundling extra Chrome

## Notes

I opted to use Puppeteer to scrape the comments instead of the Youtube API,
because I am not going to bother with stupid keys just to get me a piece of data
which is already public.
