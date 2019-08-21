# YouTube Downloader

In this repository I might attempt to prototype a utility which downloads Youtube videos,
subtitles and comments and syncs them to an iPhone for offline viewing.

The utility might allow accepting Google credentials (and caching them with Keytar) and
using Puppeteer (or just accessing a URL if predictable) to download the OPML file with
the user's subscriptions.

It might also allow one to provide the OPML file themselves (guiding them in how to do
that) so they don't have to share the Google credentials.

The utility then checks the OPML file and remembers the last video it downloaded for each
channel. In the beginning, the latest video for each channel is downloaded. Or no video
is and the latest check date is just remembered maybe.

The videos get downloaded with subtitles and the comment sections get downloaded as well,
say the top 5 pages. This might be done using Puppeteer as well or maybe through some
API if any. Also it might be sufficient to just download the screenshots of the comment
section pages instead of fucking around with storing it as formatted text.

The utility might also have a functionality where upon connecting one's iPhone over the
USB, it recognizes it and uploads the downloaded videos and comments to it using the
camera exchange protocol (PTP).

https://support.google.com/youtube/answer/6224202

1. Go through each subscription in the `subscription_manager.xml` file
2. See if there is a timestamp of the last successful download or not
  - No: set the last successful download time to now and continue
  - Yes: find videos between now and the last successful download stamp
3. Download videos succesively updating the stamp with each download
4. Capture the comments for each video (Puppeteer screenshots)
5. Listen for PTP device connection, check ID and sync if needed

https://github.com/fent/node-ytdl-core
