const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const ytdlp = require('./ytdlp-handler');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 800,
    minWidth: 880,
    minHeight: 640,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#00000000', // Transparent for glassmorphism
    backgroundMaterial: 'mica', // Windows 11 Mica/Acrylic support
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App lifecycle
app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers() {
  // Window control (minimize, maximize, close)
  ipcMain.handle('window-control', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (action === 'minimize') {
      win.minimize();
    } else if (action === 'maximize') {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    } else if (action === 'close') {
      win.close();
    }
  });

  // Metadata retrieval
  ipcMain.handle('fetch-metadata', async (event, url) => {
    try {
      const data = await ytdlp.fetchMetadata(url);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to fetch video information' };
    }
  });

  // Search YouTube
  ipcMain.handle('search-youtube', async (event, query, limit = 10) => {
    try {
      const data = await ytdlp.searchYouTube(query, limit);
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to search YouTube' };
    }
  });

  // Playlist retrieval
  ipcMain.handle('fetch-playlist', async (event, url) => {
    try {
      const data = await ytdlp.fetchPlaylist(url);
      return { success: true, playlist: data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to fetch playlist' };
    }
  });

  // YouTube Home feed
  ipcMain.handle('fetch-home-feed', async (event, category, forceRefresh = false) => {
    try {
      const data = await ytdlp.fetchHomeFeed(category, forceRefresh);
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to fetch home feed' };
    }
  });

  // Real-time search suggestions
  ipcMain.handle('get-search-suggestions', async (event, query) => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return { success: true, suggestions: [] };
    }
    try {
      const cleanQ = query.trim();
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(cleanQ)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = await res.json();
      const suggestions = Array.isArray(data[1]) ? data[1] : [];
      return { success: true, suggestions };
    } catch (err) {
      return { success: false, suggestions: [], error: err.message };
    }
  });

  // Get default music/downloads directory
  ipcMain.handle('get-default-folder', () => {
    try {
      const musicPath = app.getPath('music');
      if (fs.existsSync(musicPath)) return musicPath;
      const downloadsPath = app.getPath('downloads');
      if (fs.existsSync(downloadsPath)) return downloadsPath;
      return os.homedir();
    } catch (e) {
      return os.homedir();
    }
  });

  // Folder selector dialog
  ipcMain.handle('select-folder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(win, {
      title: 'Select Destination Folder for MP3',
      properties: ['openDirectory', 'createDirectory']
    });
    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  // Shell open file / show in folder
  ipcMain.handle('open-file', async (event, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      return shell.openPath(filePath);
    }
    return 'File does not exist';
  });

  ipcMain.handle('show-in-folder', async (event, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return true;
    }
    return false;
  });

  // Download handling
  ipcMain.handle('start-download', async (event, options) => {
    const sender = event.sender;

    ytdlp.downloadAudio(
      options,
      (progressData) => {
        if (!sender.isDestroyed()) {
          sender.send('download-progress', progressData);
        }
      },
      (statusData) => {
        if (!sender.isDestroyed()) {
          sender.send('download-status', statusData);
        }
      },
      (completeData) => {
        if (!sender.isDestroyed()) {
          sender.send('download-complete', completeData);
        }
      },
      (error) => {
        if (!sender.isDestroyed()) {
          sender.send('download-error', { id: options.id, error: error.message || 'Download failed' });
        }
      }
    );

    return { started: true, id: options.id };
  });

  // Cancel download
  ipcMain.handle('cancel-download', (event, id) => {
    return ytdlp.cancelDownload(id);
  });

  // Download video thumbnail
  ipcMain.handle('download-thumbnail', async (event, options) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender);
      let targetFilePath = null;

      if (options.saveAs) {
        const cleanTitle = (options.title || 'video_thumbnail')
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
          .trim()
          .substring(0, 80);

        const result = await dialog.showSaveDialog(win, {
          title: 'Save Video Thumbnail Image',
          defaultPath: path.join(options.outputDir || app.getPath('downloads'), `${cleanTitle}_thumbnail.jpg`),
          filters: [
            { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
            { name: 'PNG Image', extensions: ['png'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (result.canceled || !result.filePath) {
          return { canceled: true };
        }
        targetFilePath = result.filePath;
      }

      const result = await ytdlp.downloadThumbnailImage({
        ...options,
        outputDir: options.outputDir || app.getPath('downloads') || os.homedir(),
        targetFilePath
      });
      return { success: true, ...result };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to download thumbnail' };
    }
  });
}
