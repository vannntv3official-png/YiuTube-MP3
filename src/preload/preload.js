const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Video & Playlist information & Search & Home Feed & Suggestions
  fetchMetadata: (url) => ipcRenderer.invoke('fetch-metadata', url),
  fetchPlaylist: (url) => ipcRenderer.invoke('fetch-playlist', url),
  searchYouTube: (query, limit) => ipcRenderer.invoke('search-youtube', query, limit),
  fetchHomeFeed: (category, forceRefresh) => ipcRenderer.invoke('fetch-home-feed', category, forceRefresh),
  getSearchSuggestions: (query) => ipcRenderer.invoke('get-search-suggestions', query),

  // File system & folder selection
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getDefaultFolder: () => ipcRenderer.invoke('get-default-folder'),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),

  // Downloads
  startDownload: (options) => ipcRenderer.invoke('start-download', options),
  cancelDownload: (id) => ipcRenderer.invoke('cancel-download', id),
  downloadThumbnail: (options) => ipcRenderer.invoke('download-thumbnail', options),

  // Progress and event subscriptions
  onDownloadProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  },
  onDownloadStatus: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('download-status', handler);
    return () => ipcRenderer.removeListener('download-status', handler);
  },
  onDownloadComplete: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('download-complete', handler);
    return () => ipcRenderer.removeListener('download-complete', handler);
  },
  onDownloadError: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('download-error', handler);
    return () => ipcRenderer.removeListener('download-error', handler);
  },

  // Window operations
  windowControl: (action) => ipcRenderer.invoke('window-control', action),

  // Clipboard
  readClipboardText: () => clipboard.readText(),
  writeClipboardText: (text) => clipboard.writeText(text)
});
