window.addEventListener('load', () => {
  const subscriptionManagerXml = localStorage.getItem('subscription_manager');

  // Render the intro screen if there is no cached subscription manager file
  if (subscriptionManagerXml === null) {
    document.body.innerHTML = `
      <h1>YouTube Downloader</h1>
      <p>
        Welcome to YouTube Downloader! This app will download and sync your YouTube subscriptions for offline viewing.
        Let's start!
      </p>
      <ol>
        <li>
          <a href="https://www.youtube.com/subscription_manager?action_takeout=1" target="_blank">Download the YouTube subscription manager takeout</a>
        </li>
        <li>
          <input type="file" id="fileInput" />
          <button id="uploadButton">Upload the <code>subscription_manager</code> file</button>
        </li>
      </ol>
    `;

    /** @type {HTMLInputElement} */
    const fileInput = document.querySelector('#fileInput');

    /** @type {HTMLButtonElement} */
    const uploadButton = document.querySelector('#uploadButton');

    uploadButton.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length !== 1 || fileInput.files[0].name !== 'subscription_manager') {
        throw new Error('There must be only a single file named subscription_manager.');
      }

      const fileReader = new FileReader();
      fileReader.readAsText(fileInput.files[0]);
      fileReader.addEventListener('load', () => {
        localStorage.setItem('subscription_manager', fileReader.result);

        // Refresh with the file now in local storage to force new screen
        location.reload();
      });
    });

    return;
  }

  const domParser = new DOMParser();
  const subscriptionManagerDocument = domParser.parseFromString(subscriptionManagerXml, 'text/xml');
  if (subscriptionManagerDocument.documentElement.tagName !== 'opml') {
    throw new Error('The XML document must have a root OPML element.');
  }

  const outlineElement = subscriptionManagerDocument.documentElement.querySelector('body > outline');
  if (!outlineElement || outlineElement.getAttribute('title') !== 'YouTube Subscriptions') {
    throw new Error('The OPML document outline title must be YouTube Subscriptions!');
  }

  document.body.innerHTML = `
    <h1>YouTube Downloader</h1>
  `;

  for (const channelOutlineElement of outlineElement.querySelectorAll('outline')) {
    const feedUrl = new URL(channelOutlineElement.getAttribute('xmlUrl'));
    const channelId = feedUrl.searchParams.get('channel_id');

    const channelH2 = document.createElement('h2');

    const channelA = document.createElement('a');
    channelA.textContent = channelOutlineElement.getAttribute('title');
    channelA.href = `https://www.youtube.com/channel/${channelId}`;
    channelA.target = '_blank';
    channelH2.append(channelA);

    const channelP = document.createElement('p');

    document.body.append(channelH2, channelP);

    process(feedUrl, channelP);
    break;
  }

  async function process(/** @type {URL} */ feedUrl, /** @type {HTMLElement} */ channelElement) {
    const channelId = feedUrl.searchParams.get('channel_id');
    const channelData = localStorage.getItem(channelId);

    channelElement.textContent = 'Scraping…';

    const response = await fetch(feedUrl);
    const text = await response.text();

    const domParser = new DOMParser();
    const feedDocument = domParser.parseFromString(text, 'text/xml');

    if (feedDocument.documentElement.tagName !== 'feed') {
      throw new Error('The feed document root element tag name must be feed.');
    }

    const titleElement = feedDocument.querySelector('title');
    const channelTitle = titleElement.textContent;

    if (channelData === null) {
      localStorage.setItem(channelId, JSON.stringify({ trackedDate: new Date() }));

      channelElement.textContent = `${channelTitle} is a new channel.`;
      // TODO: Button *Download latest video*
    } else {
      let {
        // The date the channel has begun being tracked my YouTube Downloader
        trackedDate,
        // The date up until which all videos have been successfully downloaded
        // since the tracked date (a contiguous array) - might be `undefined` if
        // no videos have been downloaded yet
        scrapedDate,
        // The vides which have been downloaded past the scraped date in case
        // some videos past it weren't downloaded successfully (sparse array) -
        // will be empty (with the scraped date being recent) unless videos were
        // skipped due to download issues which were not resolved yet (by retry)
        extraScrapes,
      } = JSON.parse(channelData);

      trackedDate = new Date(trackedDate);
      channelElement.textContent = `${channelTitle} is being tracked since ${trackedDate}. `;

      scrapedDate = scrapedDate ? new Date(scrapedDate) : null;
      if (scrapedDate) {
        channelElement.textContent += `Its videos have been downloaded up until ${scrapedDate.toLocaleString()}. `;
      } else {
        channelElement.textContent += 'None of its videos have been downloaded yet. ';
      }

      // Look for new videos since last successful contiguous download or since
      // tracking start if there are no downloads yet
      scrapedDate = scrapedDate || trackedDate;

      const videos = [];
      for (const entryElement of feedDocument.querySelectorAll('entry')) {
        const publishedElement = entryElement.querySelector('published');
        const publishedDate = new Date(publishedElement.textContent);
        if (publishedDate > scrapedDate) {
          const titleElement = entryElement.querySelector('title');
          const linkElement = entryElement.querySelector('link');
          videos.push({ title: titleElement.textContent, link: linkElement.getAttribute('href') });
        }
      }

      // Work our way up to the most recent video (the opposite of the feed order)
      videos.reverse();

      channelElement.textContent += `Downloading ${videos.length} new videos!`;

      for (const video of videos) {
        const statusP = document.createElement('p');
        channelElement.append(statusP);

        obtain(video, statusP);
        break;
      }
    }
  }

  async function obtain(video, /** @type {HTMLElement} */ statusElement) {
    const titleSpan = document.createElement('span');
    titleSpan.textContent = video.title;

    const transferProgress = document.createElement('progress');
    transferProgress.max = 1;

    statusElement.append(titleSpan, transferProgress);

    window.ipcRenderer.send('obtain', video);
    window.ipcRenderer.on(video.link, (_event, { fileName, progress }) => {
      titleSpan.textContent = fileName;
      transferProgress.value = progress;

      // TODO: Update the localStorage entry, for now with `extraScrapes` and
      // later add the logic to move `scrapedDate` each time the contiguous
      // array of downloaded videos has expanded
    });
  }
});
