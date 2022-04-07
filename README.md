# YouTube Downloader

`npm start`

YouTube Downloader is an Electron application which tracks your YouTube channel
subscriptions and syncs their videos with subtitles and comments to your phone
for offline viewing and reading.

For now it only downloads videos for the first channel in order for me to debug
the downloader first.

## To-Do

### Look into https://developers.google.com/youtube/v3/docs/subscriptions/list

Combine this with the OAuth flow I came up with for the `streams` repository and
it should be possible to scrape everything nicely in a script assuming I find a
solution to keeping the refresh token alive for non-interactive workflow runs.

### Scrape comments (Puppeteer screenshots)

### Use AFC with https://github.com/mceSystems/libijs to sync videos

### Recognize watched videos by knowing they were synced but have been since deleted

(to know not to reupload them to the phone)

### Download subtitles

### Point Puppeteer to an instance of the Electron self if possible to stop bundling extra Chrome

## Notes

### OPML

YouTube used to have an OPML subscriptions export, but they removed it, because
it was too useful, presumably. Now the only two ways to get the subscriptions
list is to use the API and accept the interactive OAuth (meaning this script
could run on schedule only with great difficulty) or to use browser automation
to scrape https://www.youtube.com/feed/channels.

### Puppeteer

I opted to use Puppeteer to scrape the comments instead of the Youtube API,
because I am not going to bother with stupid keys just to get me a piece of data
which is already public.

### Playwright

Years later, I decided to use Playwright and just use my main Firefox profile.
Turns out Playwright Firefox cannot run at the same time as main Firefox.
Turns out further, even if you close main Firefox, Playwright Firefox runs
Nightly and Nightly will recommend not using main profile as it could ruin it
for the main Firefox.

I tried using Webkit and accepting that I'd have YouTube signed in Safari just
for this script to work. But Playwright Webkit doesn't support accepting
`userDataDir`. Even still, YouTube will recognized it is running in automated
Webkit and will refuse to let you sign in.

I also tried using Playwright Chromium. But YouTube will recognize it is running
in automated Chromium instance and will also refuse to sign in. Google sucks.

Firefox is the only browser where YouTube won't recognize it is running in an
automated instance, but the Playwright Puppeteer support is so poor, the Firefox
instance will only work once when using a separate profile. It allows you to
sign in and creates the special profile just for this script with YouTube signed
in, but on future runs, it will just start up and get stuck at the empty window.
