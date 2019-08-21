const electron = require('electron');
const ytdl = require('ytdl-core');
const fs = require('fs');
const puppeteer = require('puppeteer');

electron.app.on('ready', () => {
  const window = new electron.BrowserWindow({
    webPreferences: {
      // Run a preload script which sets app-specific hooks on `window` in renderer
      preload: require('path').join(electron.app.getAppPath(), 'preload.js'),
    }
  });

  // Maximize and open dev tools before loading to avoid reflowing immediately
  window.maximize();
  window.webContents.openDevTools();

  window.loadFile('index.html');

  // Make Electron open links with `target="_blank"` in the OS browser
  window.webContents.on('new-window', (event, url) => {
    // Disallow Electron from opening a new Electron window
    event.preventDefault();

    // Open the would-be new window URL with the default OS browser
    electron.shell.openExternal(url);
  });

  electron.ipcMain.on('obtain', async (event, video) => {
    const browser = await puppeteer.launch({ headless: false });
    const pages = await browser.pages();
    const page = pages[0];
    await page.goto(video.link);

    // TODO: Scroll down to the comment section first to make it appear
    await page.waitForSelector('#comments');
    await page.$$eval('#expander', expanders => expanders.forEach(expander => expander.click()));

    const info = await ytdl.getInfo(video.link);

    // Select the first format as that's the default with no options in `downloadFromInfo`
    const format = info.formats[0];
    const fileName = video.title + '.' + format.container;

    const readable = ytdl.downloadFromInfo(info);
    readable
      .on('progress', (_chunk, size, total) => event.reply(video.link, { fileName, progress: size / total }))
      .pipe(fs.createWriteStream(fileName));
  });
});
