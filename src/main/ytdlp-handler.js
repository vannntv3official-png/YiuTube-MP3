const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Active download processes map: id -> ChildProcess
const activeProcesses = new Map();

/**
 * Locate yt-dlp executable
 */
function getYtDlpPath() {
  const possiblePaths = [
    path.join(process.resourcesPath || '', 'bin', 'yt-dlp.exe'),
    path.join(process.resourcesPath || '', 'yt-dlp.exe'),
    path.join(__dirname, '..', '..', 'bin', 'yt-dlp.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python314', 'Scripts', 'yt-dlp.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'yt-dlp.exe';
}

/**
 * Locate ffmpeg executable
 */
function getFfmpegDir() {
  const possibleDirs = [
    path.join(process.resourcesPath || '', 'bin'),
    path.join(process.resourcesPath || ''),
    path.join(__dirname, '..', '..', 'bin'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python314', 'Scripts'),
    path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-7.1-essentials_build', 'bin')
  ];

  for (const dir of possibleDirs) {
    if (fs.existsSync(path.join(dir, 'ffmpeg.exe'))) {
      return dir;
    }
  }
  return '';
}

/**
 * Format duration seconds into mm:ss or hh:mm:ss
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format view count (e.g. 1500000 -> 1.5M views)
 */
function formatViews(views) {
  if (!views || isNaN(views)) return '0';
  if (views >= 1000000000) return (views / 1000000000).toFixed(1) + 'B';
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
  return views.toLocaleString();
}

/**
 * Fetch video metadata via yt-dlp
 */
function fetchMetadata(url) {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return reject(new Error('Invalid URL provided'));
    }

    const cleanUrl = url.trim();
    const ytDlp = getYtDlpPath();
    const args = [
      '--js-runtimes', 'node',
      '--dump-single-json',
      '--no-warnings',
      '--no-check-certificates',
      '--no-playlist',
      cleanUrl
    ];

    const ffmpegDir = getFfmpegDir();
    if (ffmpegDir) {
      args.push('--ffmpeg-location', ffmpegDir);
    }

    const proc = spawn(ytDlp, args, { shell: false, windowsHide: true });
    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to launch yt-dlp: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderrData.trim() || `yt-dlp exited with code ${code}`));
      }

      try {
        const info = JSON.parse(stdoutData);
        // Find best thumbnail
        let thumbnail = info.thumbnail;
        if (Array.isArray(info.thumbnails) && info.thumbnails.length > 0) {
          // Look for maxresdefault or highest resolution
          const maxRes = info.thumbnails.find(t => t.url && t.url.includes('maxresdefault'));
          if (maxRes && maxRes.url) {
            thumbnail = maxRes.url;
          } else {
            const sorted = [...info.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
            thumbnail = sorted[0].url || thumbnail;
          }
        }

        const result = {
          id: info.id,
          title: info.title || 'Unknown Title',
          uploader: info.uploader || info.channel || 'Unknown Artist',
          uploaderUrl: info.uploader_url || info.channel_url || '',
          duration: info.duration || 0,
          durationFormatted: formatDuration(info.duration),
          views: info.view_count || 0,
          viewsFormatted: formatViews(info.view_count),
          thumbnail: thumbnail || '',
          webpageUrl: info.webpage_url || cleanUrl,
          uploadDate: info.upload_date || '',
          isPlaylist: Boolean(info._type === 'playlist')
        };
        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to parse video info: ${err.message}`));
      }
    });
  });
}

/**
 * Search YouTube using ytsearch
 */
function searchYouTube(query, limit = 10) {
  return new Promise((resolve, reject) => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return reject(new Error('Invalid search query provided'));
    }

    const cleanQuery = query.trim();
    const ytDlp = getYtDlpPath();
    const count = Math.min(Math.max(1, parseInt(limit, 10) || 10), 30);
    const args = [
      '--js-runtimes', 'node',
      '--dump-single-json',
      '--flat-playlist',
      '--no-warnings',
      '--no-check-certificates',
      `ytsearch${count}:${cleanQuery}`
    ];

    const ffmpegDir = getFfmpegDir();
    if (ffmpegDir) {
      args.push('--ffmpeg-location', ffmpegDir);
    }

    const proc = spawn(ytDlp, args, { shell: false, windowsHide: true });
    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to launch yt-dlp: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderrData.trim() || `yt-dlp exited with code ${code}`));
      }

      try {
        const info = JSON.parse(stdoutData);
        const entries = Array.isArray(info.entries) ? info.entries : [];
        const results = entries.map((entry) => {
          let thumb = '';
          if (Array.isArray(entry.thumbnails) && entry.thumbnails.length > 0) {
            thumb = entry.thumbnails[entry.thumbnails.length - 1].url || entry.thumbnails[0].url;
          } else if (entry.thumbnail) {
            thumb = entry.thumbnail;
          } else if (entry.id) {
            thumb = `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`;
          }

          const videoUrl = entry.url && (entry.url.startsWith('http://') || entry.url.startsWith('https://'))
            ? entry.url
            : `https://www.youtube.com/watch?v=${entry.id}`;

          return {
            id: entry.id,
            title: entry.title || 'Unknown Title',
            uploader: entry.uploader || entry.channel || 'YouTube Artist',
            uploaderUrl: entry.uploader_url || entry.channel_url || '',
            duration: entry.duration || 0,
            durationFormatted: formatDuration(entry.duration),
            views: entry.view_count || 0,
            viewsFormatted: formatViews(entry.view_count),
            thumbnail: thumb,
            url: videoUrl
          };
        });

        resolve({
          query: cleanQuery,
          count: results.length,
          results
        });
      } catch (err) {
        reject(new Error(`Failed to parse search results: ${err.message}`));
      }
    });
  });
}

// In-memory cache for Home feed
const homeFeedCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const HOME_CATEGORIES = {
  trending: 'trending music official hits',
  pop: 'top pop hits music video',
  lofi: 'lofi hip hop radio beats to relax study to',
  electronic: 'electronic dance music edm club hits',
  rock: 'top rock hits official music video',
  hiphop: 'trending hip hop rap music video',
  acoustic: 'acoustic guitar chill relaxing songs'
};

/**
 * Fetch YouTube Home feed for a specific category
 */
async function fetchHomeFeed(category = 'trending', forceRefresh = false) {
  const catKey = (category || 'trending').toLowerCase();
  const cached = homeFeedCache.get(catKey);
  const now = Date.now();

  if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const query = HOME_CATEGORIES[catKey] || `${category} music hits`;
  const result = await searchYouTube(query, 12);

  const feedData = {
    category: catKey,
    updatedAt: now,
    items: result.results || []
  };

  homeFeedCache.set(catKey, { timestamp: now, data: feedData });
  return feedData;
}

/**
 * Fetch YouTube Playlist metadata and tracklist
 */
function fetchPlaylist(url) {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return reject(new Error('Invalid playlist URL provided'));
    }

    const cleanUrl = url.trim();
    const ytDlp = getYtDlpPath();
    const args = [
      '--js-runtimes', 'node',
      '--dump-single-json',
      '--flat-playlist',
      '--no-warnings',
      '--no-check-certificates',
      cleanUrl
    ];

    const ffmpegDir = getFfmpegDir();
    if (ffmpegDir) {
      args.push('--ffmpeg-location', ffmpegDir);
    }

    const proc = spawn(ytDlp, args, { shell: false, windowsHide: true });
    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to launch yt-dlp: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderrData.trim() || `yt-dlp exited with code ${code}`));
      }

      try {
        const info = JSON.parse(stdoutData);
        const entries = Array.isArray(info.entries) ? info.entries : [];
        
        let playlistThumb = '';
        if (Array.isArray(info.thumbnails) && info.thumbnails.length > 0) {
          playlistThumb = info.thumbnails[info.thumbnails.length - 1].url || info.thumbnails[0].url;
        }

        const tracks = entries.map((entry, index) => {
          let thumb = '';
          if (Array.isArray(entry.thumbnails) && entry.thumbnails.length > 0) {
            thumb = entry.thumbnails[entry.thumbnails.length - 1].url || entry.thumbnails[0].url;
          } else if (entry.thumbnail) {
            thumb = entry.thumbnail;
          } else if (entry.id) {
            thumb = `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`;
          }

          if (!playlistThumb && thumb) {
            playlistThumb = thumb;
          }

          const videoUrl = entry.url && (entry.url.startsWith('http://') || entry.url.startsWith('https://'))
            ? entry.url
            : `https://www.youtube.com/watch?v=${entry.id}`;

          return {
            index: index + 1,
            id: entry.id,
            title: entry.title || `Track ${index + 1}`,
            uploader: entry.uploader || entry.channel || info.uploader || info.channel || 'Various Artists',
            duration: entry.duration || 0,
            durationFormatted: formatDuration(entry.duration),
            thumbnail: thumb,
            url: videoUrl
          };
        });

        resolve({
          id: info.id || '',
          title: info.title || 'YouTube Playlist',
          uploader: info.uploader || info.channel || 'Curator',
          trackCount: tracks.length,
          thumbnail: playlistThumb,
          webpageUrl: info.webpage_url || cleanUrl,
          tracks
        });
      } catch (err) {
        reject(new Error(`Failed to parse playlist: ${err.message}`));
      }
    });
  });
}

/**
 * Start Audio Download and conversion
 */
function downloadAudio(options, onProgress, onStatus, onComplete, onError) {
  const {
    id,
    url,
    outputDir,
    format = 'mp3',
    bitrate = '320k',
    embedThumbnail = true,
    embedMetadata = true,
    trim = null // { start: '00:00', end: '03:30' }
  } = options;

  if (!url) {
    return onError(new Error('Missing URL'));
  }

  // Ensure output directory exists
  const resolvedOutputDir = outputDir && typeof outputDir === 'string' && outputDir.trim()
    ? outputDir.trim()
    : path.join(os.homedir(), 'Downloads');

  try {
    if (!fs.existsSync(resolvedOutputDir)) {
      fs.mkdirSync(resolvedOutputDir, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create output directory:', err);
  }

  const ytDlp = getYtDlpPath();
  const outputTemplate = path.join(resolvedOutputDir, '%(title)s.%(ext)s');

  const args = [
    '--js-runtimes', 'node',
    '-x',
    '--audio-format', format,
    '--windows-filenames',
    '--compat-options', 'no-live-chat',
    '--newline',
    '--no-playlist',
    '--no-warnings',
    '--progress',
    '--progress-template', 'download-progress:%(progress.downloaded_bytes)s/%(progress.total_bytes)s/%(progress._percent_str)s/%(progress._speed_str)s/%(progress._eta_str)s',
    '-o', outputTemplate
  ];

  // Bitrate handling
  if (format === 'mp3') {
    args.push('--audio-quality', bitrate);
  } else if (format === 'flac' || format === 'wav') {
    args.push('--audio-quality', '0');
  } else {
    args.push('--audio-quality', bitrate);
  }

  if (embedThumbnail && (format === 'mp3' || format === 'm4a')) {
    args.push('--embed-thumbnail');
  }

  if (embedMetadata) {
    args.push('--embed-metadata');
  }

  // Audio trimming if specified
  if (trim && trim.enabled && (trim.start || trim.end)) {
    const startStr = trim.start || '00:00';
    const endStr = trim.end ? `-${trim.end}` : '';
    args.push('--download-sections', `*${startStr}${endStr}`);
    args.push('--force-keyframes-at-cuts');
  }

  const ffmpegDir = getFfmpegDir();
  if (ffmpegDir) {
    args.push('--ffmpeg-location', ffmpegDir);
  }

  args.push(url);

  onStatus({ id, stage: 'starting', message: 'Initializing download...' });

  const proc = spawn(ytDlp, args, { shell: false, windowsHide: true });
  activeProcesses.set(id, proc);

  let finalFilePath = null;
  let lastError = '';

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (!line) continue;

      // Check for progress template line
      if (line.startsWith('download-progress:')) {
        const raw = line.substring('download-progress:'.length);
        const [downloadedBytes, totalBytes, percentStr, speedStr, etaStr] = raw.split('/');
        
        let percent = 0;
        if (percentStr) {
          const cleanPct = percentStr.replace('%', '').trim();
          percent = parseFloat(cleanPct) || 0;
        }

        onProgress({
          id,
          percent: Math.min(100, Math.max(0, percent)),
          speed: speedStr ? speedStr.trim() : '',
          eta: etaStr ? etaStr.trim() : '',
          downloadedBytes: parseInt(downloadedBytes, 10) || 0,
          totalBytes: parseInt(totalBytes, 10) || 0
        });
        continue;
      }

      // Check conversion and post-processing stages
      if (line.includes('[ExtractAudio] Destination:')) {
        finalFilePath = line.split('[ExtractAudio] Destination:')[1]?.trim();
        onStatus({ id, stage: 'converting', message: `Converting audio to ${format.toUpperCase()} (${bitrate})...` });
      } else if (line.includes('[ExtractAudio]')) {
        onStatus({ id, stage: 'converting', message: `Converting audio to ${format.toUpperCase()}...` });
      } else if (line.includes('[ThumbnailsConvertor]') || line.includes('[EmbedThumbnail]')) {
        onStatus({ id, stage: 'tagging', message: 'Embedding album artwork...' });
      } else if (line.includes('[Metadata]') || line.includes('[AddMetadata]')) {
        const metaMatch = line.match(/(?:Adding metadata to|destination:)\s*["']?([^"']+)["']?/i);
        if (metaMatch && metaMatch[1]) {
          finalFilePath = metaMatch[1].trim();
        }
        onStatus({ id, stage: 'tagging', message: 'Writing ID3 tags & metadata...' });
      } else if (line.includes('[download] Destination:')) {
        const dest = line.split('[download] Destination:')[1]?.trim();
        if (dest && !finalFilePath) {
          finalFilePath = dest;
        }
        onStatus({ id, stage: 'downloading', message: 'Downloading source audio stream...' });
      } else if (line.includes('[download] 100%')) {
        onStatus({ id, stage: 'processing', message: 'Processing audio stream...' });
      }
    }
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString();
    lastError += text;
  });

  proc.on('error', (err) => {
    activeProcesses.delete(id);
    onError(err);
  });

  proc.on('close', (code) => {
    activeProcesses.delete(id);
    if (code === 0) {
      // If finalFilePath had a temporary extension, resolve the expected format extension
      if (finalFilePath) {
        const parsed = path.parse(finalFilePath);
        const targetExt = `.${format.toLowerCase()}`;
        if (parsed.ext.toLowerCase() !== targetExt) {
          const expectedPath = path.join(parsed.dir, `${parsed.name}${targetExt}`);
          if (fs.existsSync(expectedPath)) {
            finalFilePath = expectedPath;
          }
        }
      }

      // Fallback: If finalFilePath is still missing or does not exist on disk, scan outputDir
      if (!finalFilePath || !fs.existsSync(finalFilePath)) {
        try {
          const files = fs.readdirSync(resolvedOutputDir)
            .filter(f => f.toLowerCase().endsWith(`.${format.toLowerCase()}`))
            .map(f => {
              const fullP = path.join(resolvedOutputDir, f);
              return { path: fullP, mtime: fs.statSync(fullP).mtimeMs };
            })
            .sort((a, b) => b.mtime - a.mtime);

          if (files.length > 0 && (Date.now() - files[0].mtime < 180000)) {
            finalFilePath = files[0].path;
          }
        } catch (scanErr) {
          console.error('File scan fallback error:', scanErr);
        }
      }

      onComplete({
        id,
        filePath: finalFilePath,
        fileName: finalFilePath ? path.basename(finalFilePath) : 'Converted Audio'
      });
    } else {
      onError(new Error(lastError.trim() || `Download failed with exit code ${code}`));
    }
  });
}

/**
 * Download thumbnail image to destination
 */
async function downloadThumbnailImage({ url, videoId, title, outputDir, targetFilePath }) {
  let targetUrl = url;

  // Check if maxresdefault is reachable for YouTube videos
  if (videoId) {
    const maxResUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    try {
      const checkRes = await fetch(maxResUrl, { method: 'HEAD' });
      if (checkRes.ok) {
        targetUrl = maxResUrl;
      }
    } catch (e) {
      // Fallback to provided URL
    }
  }

  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`Failed to download thumbnail (${response.status} ${response.statusText})`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  let ext = '.jpg';
  if (contentType.includes('png')) ext = '.png';
  else if (contentType.includes('webp')) ext = '.webp';

  let destPath = targetFilePath;
  if (!destPath) {
    const cleanTitle = (title || 'video_thumbnail')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .trim()
      .substring(0, 80);

    let baseName = `${cleanTitle}_thumbnail`;
    destPath = path.join(outputDir, `${baseName}${ext}`);
    let counter = 1;
    while (fs.existsSync(destPath)) {
      destPath = path.join(outputDir, `${baseName}_(${counter})${ext}`);
      counter++;
    }
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(destPath, buffer);

  return {
    success: true,
    filePath: destPath,
    fileName: path.basename(destPath),
    size: buffer.length
  };
}

/**
 * Cancel an active download
 */
function cancelDownload(id) {
  const proc = activeProcesses.get(id);
  if (proc) {
    try {
      proc.kill('SIGKILL');
      activeProcesses.delete(id);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

module.exports = {
  fetchMetadata,
  fetchPlaylist,
  searchYouTube,
  fetchHomeFeed,
  downloadAudio,
  downloadThumbnailImage,
  cancelDownload,
  getYtDlpPath,
  getFfmpegDir
};
