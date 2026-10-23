# 🎵 YubTube MP3 — Light & Glassmorphism YouTube to MP3 Downloader

A modern, fast, and elegant desktop application built with **Electron.js**, **yt-dlp**, and **FFmpeg** featuring an ultra-clean **Glassmorphic Light Theme**.

---

## ✨ Key Features

- 💎 **Glassmorphism + Light Modern Aesthetic**:
  - Translucent frosted glass panels (`backdrop-filter: blur(28px)`).
  - Ambient fluid pastel light mesh animating softly in the background.
  - Border highlights, smooth shadows, and micro-interactions.
  - Frameless modern window with custom glass controls (Minimize, Maximize, Close).

- ⚡ **High-Speed & Pristine Quality Audio Extraction**:
  - Powered by the robust **yt-dlp** engine and **FFmpeg v7.1**.
  - **Bitrate Options**: 320 kbps (HQ Studio), 256 kbps (Very High), 192 kbps (Standard), 128 kbps (Compact).
  - **Multi-Format Support**: MP3, M4A (AAC), FLAC (Lossless), WAV, and OPUS.
  - **ID3 Tagging & Album Cover Embedding**: Automatically embeds high-res thumbnail covers and metadata (Title, Artist/Channel, Year).
  - **Audio Trimming / Cutting**: Cut specific segments (e.g. `00:15` to `03:30`) to extract just your favorite song part or ringtone.

- ⚡ **Real-Time YouTube Suite**:
  - **Live Search Autocomplete & Suggestions**: Type into either the Home banner search or Downloader search bar and receive instant, live YouTube search suggestions with keyboard navigation (Up/Down arrow, Enter, Escape).
  - **Live Audio/Video Stream Preview Modal**: Watch and listen to YouTube tracks or live streams directly inside the app before downloading, using a responsive frosted glass player with audio cutoff on close, external browser popout, and 1-click MP3 download.
  - **Active System Clipboard Watcher**: Real-time background detection across Windows for copied YouTube links (`youtube.com/watch`, `youtu.be/`, `shorts/`, `playlist?list=`) with an instant toast notification offering 1-click download or analysis.

- 🖼️ **High-Resolution Video Thumbnail Downloader**:
  - Download high-res video thumbnails (Full HD 1080p / HD 720p `maxresdefault`) directly.
  - Hover over the preview thumbnail for an instant **"Save HD Art"** quick-action button.
  - Dedicated **"Download Thumbnail"** button in the preview actions bar with 1-click save and **Shift + Click** for "Save As..." dialog.
  - Automatic duplicate handling (`_thumbnail_(1).jpg`), celebratory particle burst, and quick "Show in Folder" shortcut.

- 🏠 **YouTube Home & Music Discover Feed**:
  - Live trending feed with high-res album cards, view counts, and durations.
  - Category filters: **🔥 Trending Today**, **🎵 Pop Hits**, **🎧 Lofi & Chill**, **⚡ EDM & Dance**, **🎸 Rock**, **🎤 Hip-Hop**, and **☕ Acoustic**.
  - **Featured Curated Playlists & Mixes**: 1-click access to explore and batch-download top Billboard charts and study mixes.
  - **Instant Actions**: 1-Click download directly to MP3 queue or analyze/trim any track.
  - Integrated quick search bar right inside the Home hero banner.

- 🔍 **Integrated In-App YouTube Search**:
  - Search songs, artists, albums, and remixes directly in the app without opening a browser.
  - Interactive search result cards with high-res thumbnails, durations, views, and channel names.
  - **1-Click Download**: Instantly enqueue any search result as MP3.
  - **Analyze & Customize**: Load any search result into the preview deck to trim, change formats, or download artwork.

- 📑 **YouTube Playlist & Album Batch Downloader**:
  - Automatic detection of YouTube playlist URLs (`playlist?list=...`).
  - High-speed playlist parsing with track count, curator, and artwork.
  - Interactive tracklist checklist: **Select All**, **Deselect All**, or choose specific tracks.
  - Batch download selected songs with progress tracking per track in the Queue.

- 📥 **Interactive Video Analysis & Queue**:
  - Quick **Paste from Clipboard** or auto-detection of YouTube URLs.
  - Real-time video preview: High-res thumbnail, title, uploader, view count, and duration.
  - Live animated download progress bar with download speed (MB/s), ETA, and stage indicators (Downloading stream → Converting with LAME → Embedding ID3 tags).
  - Cancel & clear queue support.

- 🎧 **Built-in Floating Glass Audio Player**:
  - Listen to downloaded MP3 tracks right within the app without switching to external music players.
  - Seekbar, track thumbnail, volume control, and 10s skip buttons.

- 📂 **Library & File Management**:
  - Complete history of downloaded songs.
  - Search & filter downloaded tracks.
  - One-click "Show in Folder" to open the MP3 directly in Windows Explorer.
  - Custom destination directory picker.

---

## 🚀 How to Run & Build

### Development Mode
```bash
npm start
```

### Build to Windows `.exe`
```bash
# Build both Installer (.exe) and Portable (.exe)
npm run build

# Or build Portable executable only:
npm run build:portable

# Or build Setup Installer only:
npm run build:nsis
```

The output executables will be generated in the **`dist/`** directory:
- **`dist/YubTube MP3-Portable-1.0.0.exe`**: Standalone portable version (no installation required).
- **`dist/YubTube MP3 Setup 1.0.0.exe`**: Standard Windows Setup Installer.

---

## 🛠️ Tech Stack & Requirements

- **Electron.js** (`^41.2.1`)
- **yt-dlp** (Auto-detected from system / Python path)
- **FFmpeg** (Auto-detected from system / WinGet / PATH)
- **HTML5 / CSS3 / Vanilla JS** (Ultra-fast, zero bloat, instant startup)
