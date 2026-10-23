// State management
const state = {
  activeView: 'view-home',
  inputMode: 'url', // 'url' | 'search'
  homeCategory: 'trending',
  homeFeed: [],
  homeLoading: false,
  currentVideo: null,
  currentPlaylist: null,
  playlistSelectedIds: new Set(),
  searchResults: [],
  selectedFormat: 'mp3',
  selectedBitrate: '320k',
  outputDir: '',
  queue: new Map(), // id -> download item
  library: [], // array of completed downloads
  audioPlayer: {
    currentTrack: null,
    isPlaying: false
  }
};

// DOM Elements
const elements = {
  // Window buttons
  btnMinimize: document.getElementById('btn-minimize'),
  btnMaximize: document.getElementById('btn-maximize'),
  btnClose: document.getElementById('btn-close'),

  // Navigation
  navItems: document.querySelectorAll('.nav-item'),
  views: document.querySelectorAll('.view-panel'),
  queueBadge: document.getElementById('queue-badge'),
  libraryBadge: document.getElementById('library-badge'),

  // Home View Elements
  homeSearchInput: document.getElementById('home-search-input'),
  btnHomeSearch: document.getElementById('btn-home-search'),
  homeCategoryPills: document.querySelectorAll('#home-category-pills .pill-btn'),
  btnRefreshHome: document.getElementById('btn-refresh-home'),
  homeRefreshIcon: document.getElementById('home-refresh-icon'),
  homeFeedGrid: document.getElementById('home-feed-grid'),
  featuredPlaylistCards: document.querySelectorAll('.featured-playlist-card'),

  // Mode Selection
  tabModeUrl: document.getElementById('tab-mode-url'),
  tabModeSearch: document.getElementById('tab-mode-search'),
  inputModeIcon: document.getElementById('input-mode-icon'),

  // Downloader Inputs
  urlInput: document.getElementById('url-input'),
  btnClearUrl: document.getElementById('btn-clear-url'),
  btnPaste: document.getElementById('btn-paste'),
  btnFetch: document.getElementById('btn-fetch'),
  formatPills: document.querySelectorAll('#format-pills .pill-btn'),
  bitrateBox: document.getElementById('bitrate-box'),
  bitratePills: document.querySelectorAll('#bitrate-pills .pill-btn'),
  destinationPathDisplay: document.getElementById('destination-path-display'),
  btnBrowseFolder: document.getElementById('btn-browse-folder'),
  btnOpenFolder: document.getElementById('btn-open-folder'),

  // Advanced toggles
  toggleEmbedArt: document.getElementById('toggle-embed-art'),
  toggleEmbedTags: document.getElementById('toggle-embed-tags'),
  toggleTrim: document.getElementById('toggle-trim'),
  trimControls: document.getElementById('trim-controls'),
  trimStart: document.getElementById('trim-start'),
  trimEnd: document.getElementById('trim-end'),

  // Search Results Section
  searchSection: document.getElementById('search-section'),
  searchResultsTitle: document.getElementById('search-results-title'),
  searchCountBadge: document.getElementById('search-count-badge'),
  searchResultsGrid: document.getElementById('search-results-grid'),
  btnCloseSearch: document.getElementById('btn-close-search'),

  // Playlist Section
  playlistSection: document.getElementById('playlist-section'),
  playlistThumb: document.getElementById('playlist-thumb'),
  playlistTitle: document.getElementById('playlist-title'),
  playlistUploader: document.getElementById('playlist-uploader'),
  playlistCount: document.getElementById('playlist-count'),
  playlistSelectedCount: document.getElementById('playlist-selected-count'),
  playlistFormatLabel: document.getElementById('playlist-format-label'),
  playlistSelectAll: document.getElementById('playlist-select-all'),
  selectionCounterBadge: document.getElementById('selection-counter-badge'),
  btnDownloadPlaylist: document.getElementById('btn-download-playlist'),
  btnDownloadPlaylistText: document.getElementById('btn-download-playlist-text'),
  playlistTrackList: document.getElementById('playlist-track-list'),

  // Preview Section
  previewSection: document.getElementById('preview-section'),
  previewThumb: document.getElementById('preview-thumb'),
  previewDuration: document.getElementById('preview-duration'),
  previewTitle: document.getElementById('preview-title'),
  previewUploader: document.getElementById('preview-uploader'),
  previewViews: document.getElementById('preview-views'),
  previewDate: document.getElementById('preview-date'),
  previewSelectedFormat: document.getElementById('preview-selected-format'),
  btnStartDownload: document.getElementById('btn-start-download'),
  btnAddQueue: document.getElementById('btn-add-queue'),
  btnDownloadThumb: document.getElementById('btn-download-thumb'),

  // Queue View
  queueItemsContainer: document.getElementById('queue-items-container'),
  queueEmptyState: document.getElementById('queue-empty-state'),
  btnClearQueue: document.getElementById('btn-clear-queue'),

  // Library View
  libraryItemsContainer: document.getElementById('library-items-container'),
  libraryEmptyState: document.getElementById('library-empty-state'),
  librarySearch: document.getElementById('library-search'),
  btnClearLibrary: document.getElementById('btn-clear-library'),

  // Settings View
  settingsFolderPath: document.getElementById('settings-folder-path'),
  btnSettingsChangeFolder: document.getElementById('btn-settings-change-folder'),
  settingsBitratePills: document.querySelectorAll('#settings-bitrate-pills .pill-btn'),
  settingsAutoPaste: document.getElementById('settings-auto-paste'),
  settingsNotification: document.getElementById('settings-notification'),

  // Floating Player
  floatingPlayer: document.getElementById('floating-player'),
  playerThumb: document.getElementById('player-thumb'),
  playerThumbWrapper: document.getElementById('player-thumb-wrapper'),
  playerSoundwave: document.getElementById('player-soundwave'),
  playerTitle: document.getElementById('player-title'),
  playerArtist: document.getElementById('player-artist'),
  playerBtnPlay: document.getElementById('player-btn-play'),
  playerPlayIcon: document.getElementById('player-play-icon'),
  playerPauseIcon: document.getElementById('player-pause-icon'),
  playerBtnPrev: document.getElementById('player-btn-prev'),
  playerBtnNext: document.getElementById('player-btn-next'),
  playerCurrentTime: document.getElementById('player-current-time'),
  playerTotalTime: document.getElementById('player-total-time'),
  playerSeek: document.getElementById('player-seek'),
  playerVolume: document.getElementById('player-volume'),
  playerBtnClose: document.getElementById('player-btn-close'),
  audioElement: document.getElementById('audio-element'),

  // Toast & Ambient Elements
  toastContainer: document.getElementById('toast-container'),
  cursorGlow: document.getElementById('cursor-glow'),
  confettiCanvas: document.getElementById('confetti-canvas'),

  // Real-time YouTube Suite Elements
  homeSuggestionsDropdown: document.getElementById('home-suggestions-dropdown'),
  urlSuggestionsDropdown: document.getElementById('url-suggestions-dropdown'),
  livePlayerModal: document.getElementById('live-player-modal'),
  livePlayerIframe: document.getElementById('live-player-iframe'),
  livePlayerTitle: document.getElementById('live-player-title'),
  livePlayerArtist: document.getElementById('live-player-artist'),
  btnLivePlayerClose: document.getElementById('btn-live-player-close'),
  btnLivePlayerPopout: document.getElementById('btn-live-player-popout'),
  btnLiveDownloadNow: document.getElementById('btn-live-download-now'),
  btnPreviewStreamModal: document.getElementById('btn-preview-stream-modal')
};

// ============================================================================
// Initialization
// ============================================================================
async function init() {
  loadSavedPreferences();
  setupWindowControls();
  setupNavigation();
  setupFormatAndBitrateSelectors();
  setupFolderPicker();
  setupHomeFeed();
  setupModeSwitcher();
  setupInputHandlers();
  setupSearchHandlers();
  setupPlaylistHandlers();
  setupDownloadHandlers();
  setupQueueHandlers();
  setupLibraryHandlers();
  setupAudioPlayer();
  setupIpcListeners();
  setupCursorGlow();
  setupConfettiCanvas();
  setupSearchSuggestions();
  setupLivePreviewModal();
  setupRealtimeClipboardWatcher();

  // Load initial Home feed
  loadHomeFeed('trending');

  // Load default folder from system
  if (!state.outputDir) {
    const defaultFolder = await window.api.getDefaultFolder();
    setOutputDir(defaultFolder);
  }

  // Auto-paste check on focus
  window.addEventListener('focus', handleWindowFocus);
}

// Load local storage preferences & library
function loadSavedPreferences() {
  try {
    const savedDir = localStorage.getItem('yubtube_output_dir');
    if (savedDir) setOutputDir(savedDir);

    const savedBitrate = localStorage.getItem('yubtube_default_bitrate');
    if (savedBitrate) {
      state.selectedBitrate = savedBitrate;
      updateBitrateUI(savedBitrate);
    }

    const savedLibrary = localStorage.getItem('yubtube_library');
    if (savedLibrary) {
      state.library = JSON.parse(savedLibrary);
      renderLibrary();
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
}

// Save library to localStorage
function saveLibrary() {
  try {
    localStorage.setItem('yubtube_library', JSON.stringify(state.library));
    updateBadges();
  } catch (e) {
    console.error('Failed to save library:', e);
  }
}

function setOutputDir(dir) {
  state.outputDir = dir;
  elements.destinationPathDisplay.textContent = dir;
  elements.destinationPathDisplay.title = dir;
  elements.settingsFolderPath.textContent = dir;
  localStorage.setItem('yubtube_output_dir', dir);
}

// ============================================================================
// Window Controls
// ============================================================================
function setupWindowControls() {
  elements.btnMinimize?.addEventListener('click', () => window.api.windowControl('minimize'));
  elements.btnMaximize?.addEventListener('click', () => window.api.windowControl('maximize'));
  elements.btnClose?.addEventListener('click', () => window.api.windowControl('close'));
}

// ============================================================================
// Navigation Views
// ============================================================================
function setupNavigation() {
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      switchView(targetView);
    });
  });
}

function switchView(viewId) {
  state.activeView = viewId;
  elements.navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewId);
  });
  elements.views.forEach(view => {
    view.classList.toggle('active', view.id === viewId);
  });
}

// ============================================================================
// YouTube Home & Discover Feed
// ============================================================================
function setupHomeFeed() {
  // Category filter pills
  elements.homeCategoryPills?.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.homeCategoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const category = pill.getAttribute('data-category') || 'trending';
      state.homeCategory = category;
      loadHomeFeed(category, false);
    });
  });

  // Refresh feed button
  elements.btnRefreshHome?.addEventListener('click', () => {
    loadHomeFeed(state.homeCategory, true);
  });

  // Quick search in Home banner
  const triggerHomeSearch = () => {
    const q = elements.homeSearchInput?.value.trim();
    if (!q) {
      showToast('Please type a search query', 'error');
      return;
    }
    switchView('view-downloader');
    setInputMode('search');
    elements.urlInput.value = q;
    elements.btnClearUrl.style.display = 'flex';
    executeYouTubeSearch(q);
  };

  elements.btnHomeSearch?.addEventListener('click', triggerHomeSearch);
  elements.homeSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerHomeSearch();
  });

  // Featured curated playlists
  elements.featuredPlaylistCards?.forEach(card => {
    card.addEventListener('click', () => {
      const playlistUrl = card.getAttribute('data-playlist');
      if (playlistUrl) {
        switchView('view-downloader');
        setInputMode('url');
        elements.urlInput.value = playlistUrl;
        elements.btnClearUrl.style.display = 'flex';
        handleFetchPlaylist(playlistUrl);
      }
    });
  });
}

async function loadHomeFeed(category = 'trending', forceRefresh = false) {
  if (state.homeLoading) return;
  state.homeLoading = true;

  if (elements.homeRefreshIcon) {
    elements.homeRefreshIcon.classList.add('spin');
  }

  renderHomeSkeletons();

  try {
    const res = await window.api.fetchHomeFeed(category, forceRefresh);
    if (!res.success) {
      throw new Error(res.error || 'Failed to fetch home feed');
    }

    state.homeFeed = res.items || [];
    renderHomeFeed(state.homeFeed);
  } catch (err) {
    console.error('Home feed error:', err);
    elements.homeFeedGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 40px;">
        <h3>Unable to load trending feed</h3>
        <p>${err.message || 'Check your internet connection or yt-dlp setup'}</p>
        <button class="btn-secondary" style="margin-top: 12px;" onclick="loadHomeFeed('${category}', true)">Try Again</button>
      </div>
    `;
  } finally {
    state.homeLoading = false;
    if (elements.homeRefreshIcon) {
      elements.homeRefreshIcon.classList.remove('spin');
    }
  }
}

function renderHomeSkeletons() {
  elements.homeFeedGrid.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const sk = document.createElement('div');
    sk.className = 'home-skeleton-card';
    sk.innerHTML = `
      <div class="skeleton-thumb"></div>
      <div class="skeleton-body">
        <div class="skeleton-line" style="width: 85%;"></div>
        <div class="skeleton-line" style="width: 55%; height: 10px;"></div>
        <div class="skeleton-line" style="width: 40%; height: 9px; margin-top: auto;"></div>
      </div>
    `;
    elements.homeFeedGrid.appendChild(sk);
  }
}

function renderHomeFeed(items) {
  elements.homeFeedGrid.innerHTML = '';

  if (!items || items.length === 0) {
    elements.homeFeedGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 40px;">
        <h3>No trending songs found</h3>
        <p>Try refreshing or switching to another category.</p>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'home-card';
    card.innerHTML = `
      <div class="home-thumb-wrap">
        <img class="home-thumb-img" src="${item.thumbnail || ''}" alt="Thumb" loading="lazy" onerror="this.src=''"/>
        <span class="home-duration-badge">${item.durationFormatted}</span>
      </div>
      <div class="home-card-body">
        <div class="home-card-title" title="${item.title}">${item.title}</div>
        <div class="home-card-channel" title="${item.uploader}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>${item.uploader}</span>
        </div>
        <div class="home-card-views">${item.viewsFormatted} views</div>
        <div class="home-card-actions">
          <button class="btn-preview-stream" title="Watch & Stream Live Now">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Live</span>
          </button>
          <button class="btn-home-dl" title="1-Click Download MP3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download MP3</span>
          </button>
          <button class="btn-home-analyze" title="Customize, Trim & Preview">
            <span>Analyze</span>
          </button>
        </div>
      </div>
    `;

    card.querySelector('.btn-preview-stream').addEventListener('click', (e) => {
      e.stopPropagation();
      openLivePreview(item);
    });

    card.querySelector('.btn-home-dl').addEventListener('click', (e) => {
      e.stopPropagation();
      downloadSearchResult(item);
    });

    card.querySelector('.btn-home-analyze').addEventListener('click', (e) => {
      e.stopPropagation();
      switchView('view-downloader');
      setInputMode('url');
      elements.urlInput.value = item.url;
      elements.btnClearUrl.style.display = 'flex';
      fetchVideoInfo(item.url);
    });

    elements.homeFeedGrid.appendChild(card);
  });
}

function updateBadges() {
  // Queue badge
  let activeDownloads = 0;
  state.queue.forEach(item => {
    if (item.status !== 'completed' && item.status !== 'error') activeDownloads++;
  });
  if (activeDownloads > 0) {
    elements.queueBadge.textContent = activeDownloads;
    elements.queueBadge.style.display = 'inline-block';
  } else {
    elements.queueBadge.style.display = 'none';
  }

  // Library badge
  if (state.library.length > 0) {
    elements.libraryBadge.textContent = state.library.length;
    elements.libraryBadge.style.display = 'inline-block';
  } else {
    elements.libraryBadge.style.display = 'none';
  }
}

// ============================================================================
// Format & Bitrate Selectors
// ============================================================================
function setupFormatAndBitrateSelectors() {
  elements.formatPills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.formatPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.selectedFormat = pill.getAttribute('data-format');

      // If format is not MP3, hide or adjust bitrate box
      if (state.selectedFormat === 'mp3') {
        elements.bitrateBox.style.display = 'flex';
      } else {
        elements.bitrateBox.style.display = 'none';
      }
      updatePreviewFormatLabel();
    });
  });

  elements.bitratePills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.bitratePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.selectedBitrate = pill.getAttribute('data-bitrate');
      updatePreviewFormatLabel();
    });
  });

  elements.settingsBitratePills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.settingsBitratePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const val = pill.getAttribute('data-val');
      state.selectedBitrate = val;
      localStorage.setItem('yubtube_default_bitrate', val);
      updateBitrateUI(val);
      showToast('Default bitrate updated to ' + val, 'info');
    });
  });
}

function updateBitrateUI(bitrate) {
  elements.bitratePills.forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-bitrate') === bitrate);
  });
  elements.settingsBitratePills.forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-val') === bitrate);
  });
  updatePreviewFormatLabel();
}

function updatePreviewFormatLabel() {
  if (state.selectedFormat === 'mp3') {
    elements.previewSelectedFormat.textContent = `MP3 · ${state.selectedBitrate}`;
  } else {
    elements.previewSelectedFormat.textContent = state.selectedFormat.toUpperCase();
  }
}

// ============================================================================
// Folder Picker
// ============================================================================
function setupFolderPicker() {
  const chooseFolder = async () => {
    const folder = await window.api.selectFolder();
    if (folder) {
      setOutputDir(folder);
      showToast('Output directory updated', 'success');
    }
  };

  elements.btnBrowseFolder?.addEventListener('click', chooseFolder);
  elements.btnSettingsChangeFolder?.addEventListener('click', chooseFolder);

  elements.btnOpenFolder?.addEventListener('click', () => {
    if (state.outputDir) {
      window.api.openFile(state.outputDir);
    }
  });
}

// ============================================================================
// Mode Switcher (Link vs Search)
// ============================================================================
function setupModeSwitcher() {
  elements.tabModeUrl?.addEventListener('click', () => setInputMode('url'));
  elements.tabModeSearch?.addEventListener('click', () => setInputMode('search'));
}

function setInputMode(mode) {
  state.inputMode = mode;
  if (mode === 'url') {
    elements.tabModeUrl?.classList.add('active');
    elements.tabModeSearch?.classList.remove('active');
    elements.urlInput.placeholder = 'Paste YouTube Video or Playlist URL (e.g. https://youtu.be/...)';
    const span = elements.btnFetch.querySelector('span');
    if (span) span.textContent = 'Analyze';
    if (elements.inputModeIcon) {
      elements.inputModeIcon.innerHTML = `
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      `;
    }
  } else {
    elements.tabModeSearch?.classList.add('active');
    elements.tabModeUrl?.classList.remove('active');
    elements.urlInput.placeholder = 'Search songs, artists, albums, or lyrics (e.g. Coldplay Yellow)...';
    const span = elements.btnFetch.querySelector('span');
    if (span) span.textContent = 'Search';
    if (elements.inputModeIcon) {
      elements.inputModeIcon.innerHTML = `
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      `;
    }
  }
}

// ============================================================================
// Input & Fetching Handlers
// ============================================================================
function setupInputHandlers() {
  // Input typing & clear button
  elements.urlInput.addEventListener('input', () => {
    elements.btnClearUrl.style.display = elements.urlInput.value ? 'flex' : 'none';
  });

  elements.btnClearUrl.addEventListener('click', () => {
    elements.urlInput.value = '';
    elements.btnClearUrl.style.display = 'none';
    elements.previewSection.style.display = 'none';
    elements.searchSection.style.display = 'none';
    elements.playlistSection.style.display = 'none';
    state.currentVideo = null;
    state.currentPlaylist = null;
    elements.urlInput.focus();
  });

  elements.urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleMainAction();
    }
  });

  // Paste button
  elements.btnPaste.addEventListener('click', async () => {
    const text = await window.api.readClipboardText();
    if (text) {
      elements.urlInput.value = text.trim();
      elements.btnClearUrl.style.display = 'flex';
      handleMainAction();
    }
  });

  // Fetch / Search button
  elements.btnFetch.addEventListener('click', () => {
    handleMainAction();
  });

  // Trim toggle
  elements.toggleTrim.addEventListener('change', () => {
    elements.trimControls.classList.toggle('active', elements.toggleTrim.checked);
  });
}

function handleMainAction() {
  const inputVal = elements.urlInput.value.trim();
  if (!inputVal) {
    showToast(state.inputMode === 'search' ? 'Please type a search query' : 'Please paste a YouTube URL', 'error');
    return;
  }

  // Detect if input is a URL
  const isUrl = /^(https?:\/\/|www\.|youtu\.be\/|youtube\.com\/)/i.test(inputVal);

  if (state.inputMode === 'search') {
    if (isUrl) {
      // User pasted a link while in search mode -> switch to link mode
      setInputMode('url');
      if (inputVal.includes('list=') || inputVal.includes('/playlist')) {
        handleFetchPlaylist(inputVal);
      } else {
        fetchVideoInfo(inputVal);
      }
    } else {
      executeYouTubeSearch(inputVal);
    }
  } else {
    // In Link / Playlist mode
    if (!isUrl) {
      // User typed search keywords -> auto-switch to search mode
      setInputMode('search');
      executeYouTubeSearch(inputVal);
    } else if (inputVal.includes('list=') || inputVal.includes('/playlist')) {
      handleFetchPlaylist(inputVal);
    } else {
      fetchVideoInfo(inputVal);
    }
  }
}

async function handleWindowFocus() {
  if (!elements.settingsAutoPaste.checked) return;
  // If input is empty, inspect clipboard
  if (!elements.urlInput.value.trim()) {
    const text = await window.api.readClipboardText();
    if (text && (text.includes('youtube.com/watch') || text.includes('youtu.be/') || text.includes('youtube.com/shorts/') || text.includes('youtube.com/playlist'))) {
      elements.urlInput.value = text.trim();
      elements.btnClearUrl.style.display = 'flex';
      handleMainAction();
    }
  }
}

// ============================================================================
// YouTube Search Handlers & Rendering
// ============================================================================
function setupSearchHandlers() {
  elements.btnCloseSearch?.addEventListener('click', () => {
    elements.searchSection.style.display = 'none';
  });
}

async function executeYouTubeSearch(query) {
  if (!query) return;

  elements.btnFetch.disabled = true;
  elements.btnFetch.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
    <span>Searching...</span>
  `;

  // Hide other cards while searching
  elements.previewSection.style.display = 'none';
  elements.playlistSection.style.display = 'none';

  try {
    const res = await window.api.searchYouTube(query, 12);
    if (!res.success) {
      throw new Error(res.error || 'Failed to search YouTube');
    }

    state.searchResults = res.results || [];
    renderSearchResults(state.searchResults, query);
    showToast(`Found ${state.searchResults.length} results for "${query}"`, 'success');
  } catch (err) {
    showToast(`Search error: ${err.message}`, 'error');
  } finally {
    elements.btnFetch.disabled = false;
    elements.btnFetch.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <span>${state.inputMode === 'search' ? 'Search' : 'Analyze'}</span>
    `;
  }
}

function renderSearchResults(results, query) {
  elements.searchResultsGrid.innerHTML = '';
  elements.searchResultsTitle.textContent = `Search Results for "${query}"`;
  elements.searchCountBadge.textContent = `${results.length} found`;

  if (results.length === 0) {
    elements.searchResultsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 40px;">
        <h3>No matching videos found</h3>
        <p>Try searching with another keyword or paste a direct video link.</p>
      </div>
    `;
    elements.searchSection.style.display = 'block';
    return;
  }

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'search-card';
    card.innerHTML = `
      <div class="search-thumb-wrap">
        <img class="search-thumb-img" src="${item.thumbnail || ''}" alt="Thumb" loading="lazy" onerror="this.src=''"/>
        <span class="search-duration-badge">${item.durationFormatted}</span>
      </div>
      <div class="search-card-body">
        <div class="search-card-title" title="${item.title}">${item.title}</div>
        <div class="search-card-channel" title="${item.uploader}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>${item.uploader}</span>
        </div>
        <div class="search-card-views">${item.viewsFormatted} views</div>
        <div class="search-card-actions">
          <button class="btn-preview-stream" title="Watch & Stream Live Now">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Live</span>
          </button>
          <button class="btn-search-dl" title="1-Click Download MP3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download MP3</span>
          </button>
          <button class="btn-search-analyze" title="Customize, Trim & Preview">
            <span>Analyze</span>
          </button>
        </div>
      </div>
    `;

    card.querySelector('.btn-preview-stream').addEventListener('click', (e) => {
      e.stopPropagation();
      openLivePreview(item);
    });

    card.querySelector('.btn-search-dl').addEventListener('click', (e) => {
      e.stopPropagation();
      downloadSearchResult(item);
    });

    card.querySelector('.btn-search-analyze').addEventListener('click', (e) => {
      e.stopPropagation();
      analyzeSearchResult(item);
    });

    elements.searchResultsGrid.appendChild(card);
  });

  elements.searchSection.style.display = 'block';
  elements.searchSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function downloadSearchResult(item) {
  const started = queueDownloadItem({
    url: item.url,
    title: item.title,
    uploader: item.uploader,
    thumbnail: item.thumbnail,
    durationFormatted: item.durationFormatted
  }, false);

  if (started) {
    fireCelebrationConfetti();
    showToast(`Added to download queue: "${item.title.substring(0, 32)}..."`, 'success');
  }
}

function analyzeSearchResult(item) {
  elements.urlInput.value = item.url;
  elements.btnClearUrl.style.display = 'flex';
  setInputMode('url');
  fetchVideoInfo(item.url);
}

// ============================================================================
// YouTube Playlist Batch Downloader Handlers & Rendering
// ============================================================================
function setupPlaylistHandlers() {
  elements.playlistSelectAll?.addEventListener('change', () => {
    const isChecked = elements.playlistSelectAll.checked;
    if (!state.currentPlaylist || !state.currentPlaylist.tracks) return;

    if (isChecked) {
      state.currentPlaylist.tracks.forEach(t => state.playlistSelectedIds.add(t.id));
    } else {
      state.playlistSelectedIds.clear();
    }
    updatePlaylistSelectionUI();
  });

  elements.btnDownloadPlaylist?.addEventListener('click', () => {
    startPlaylistBatchDownload();
  });
}

async function handleFetchPlaylist(url) {
  elements.btnFetch.disabled = true;
  elements.btnFetch.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
    <span>Loading Playlist...</span>
  `;

  elements.previewSection.style.display = 'none';
  elements.searchSection.style.display = 'none';

  try {
    const res = await window.api.fetchPlaylist(url);
    if (!res.success) {
      throw new Error(res.error || 'Failed to fetch playlist');
    }

    state.currentPlaylist = res.playlist;
    // Select all tracks by default
    state.playlistSelectedIds = new Set(res.playlist.tracks.map(t => t.id));
    renderPlaylist(res.playlist);
    showToast(`Loaded playlist: "${res.playlist.title}" (${res.playlist.tracks.length} tracks)`, 'success');
  } catch (err) {
    showToast(`Playlist error: ${err.message}`, 'error');
  } finally {
    elements.btnFetch.disabled = false;
    elements.btnFetch.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <span>Analyze</span>
    `;
  }
}

function renderPlaylist(playlist) {
  elements.playlistThumb.src = playlist.thumbnail || '';
  elements.playlistTitle.textContent = playlist.title;
  elements.playlistUploader.textContent = playlist.uploader;
  elements.playlistCount.textContent = `${playlist.trackCount} tracks`;
  elements.playlistFormatLabel.textContent = `${state.selectedFormat.toUpperCase()} · ${state.selectedBitrate}`;
  elements.playlistSelectAll.checked = true;

  elements.playlistTrackList.innerHTML = '';

  playlist.tracks.forEach((track, index) => {
    const row = document.createElement('div');
    row.className = 'playlist-track-row';
    row.id = `playlist-row-${track.id}`;
    row.innerHTML = `
      <label class="custom-checkbox-label" style="margin: 0;">
        <input type="checkbox" class="track-checkbox" data-id="${track.id}" checked>
        <span class="checkmark"></span>
      </label>
      <span class="track-index">#${index + 1}</span>
      <img class="track-thumb-mini" src="${track.thumbnail || ''}" alt="Art" loading="lazy" onerror="this.src=''"/>
      <div class="track-info">
        <div class="track-name" title="${track.title}">${track.title}</div>
        <div class="track-sub">${track.uploader}</div>
      </div>
      <span class="track-duration">${track.durationFormatted}</span>
      <button class="btn-track-dl-single" title="Download this track only">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>
    `;

    const checkbox = row.querySelector('.track-checkbox');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.playlistSelectedIds.add(track.id);
        row.classList.remove('unselected');
      } else {
        state.playlistSelectedIds.delete(track.id);
        row.classList.add('unselected');
      }
      updatePlaylistSelectionUI();
    });

    row.querySelector('.btn-track-dl-single').addEventListener('click', (e) => {
      e.stopPropagation();
      downloadSinglePlaylistTrack(track);
    });

    elements.playlistTrackList.appendChild(row);
  });

  updatePlaylistSelectionUI();
  elements.playlistSection.style.display = 'block';
  elements.playlistSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updatePlaylistSelectionUI() {
  if (!state.currentPlaylist) return;
  const total = state.currentPlaylist.tracks.length;
  const count = state.playlistSelectedIds.size;

  elements.playlistSelectedCount.textContent = `${count} selected`;
  elements.selectionCounterBadge.textContent = count === total ? `All selected (${total})` : `${count} of ${total} selected`;
  elements.btnDownloadPlaylistText.textContent = `Download Selected (${count} Tracks)`;
  elements.btnDownloadPlaylist.disabled = count === 0;

  const checkboxes = elements.playlistTrackList.querySelectorAll('.track-checkbox');
  checkboxes.forEach(cb => {
    const isSelected = state.playlistSelectedIds.has(cb.dataset.id);
    cb.checked = isSelected;
    const row = document.getElementById(`playlist-row-${cb.dataset.id}`);
    if (row) {
      row.classList.toggle('unselected', !isSelected);
    }
  });

  elements.playlistSelectAll.checked = count === total && total > 0;
}

function downloadSinglePlaylistTrack(track) {
  const started = queueDownloadItem({
    url: track.url,
    title: track.title,
    uploader: track.uploader,
    thumbnail: track.thumbnail,
    durationFormatted: track.durationFormatted
  }, false);

  if (started) {
    fireCelebrationConfetti();
    showToast(`Added to queue: "${track.title.substring(0, 32)}..."`, 'success');
  }
}

function startPlaylistBatchDownload() {
  if (!state.currentPlaylist || state.playlistSelectedIds.size === 0) {
    showToast('Please select at least 1 track to download', 'error');
    return;
  }

  if (!state.outputDir) {
    showToast('Please select a destination folder', 'error');
    return;
  }

  const selectedTracks = state.currentPlaylist.tracks.filter(t => state.playlistSelectedIds.has(t.id));
  let queuedCount = 0;

  selectedTracks.forEach(track => {
    const started = queueDownloadItem({
      url: track.url,
      title: track.title,
      uploader: track.uploader || state.currentPlaylist.uploader,
      thumbnail: track.thumbnail || state.currentPlaylist.thumbnail,
      durationFormatted: track.durationFormatted
    }, false);
    if (started) queuedCount++;
  });

  fireCelebrationConfetti();
  showToast(`Enqueued ${queuedCount} tracks from "${state.currentPlaylist.title}"!`, 'success');
  switchView('view-queue');
}

// ============================================================================
// Single Video Information & Preview
// ============================================================================
async function fetchVideoInfo(customUrl = null) {
  const url = (customUrl || elements.urlInput.value).trim();
  if (!url) {
    showToast('Please paste a YouTube URL first', 'error');
    return;
  }

  // Auto-redirect if URL is a playlist
  if (url.includes('list=') || url.includes('/playlist')) {
    return handleFetchPlaylist(url);
  }

  // Loading state
  elements.btnFetch.disabled = true;
  elements.btnFetch.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
    <span>Analyzing...</span>
  `;

  // Hide search and playlist while previewing a video
  elements.searchSection.style.display = 'none';
  elements.playlistSection.style.display = 'none';

  try {
    const res = await window.api.fetchMetadata(url);
    if (!res.success) {
      throw new Error(res.error);
    }

    state.currentVideo = res.data;
    renderPreview(res.data);
    showToast('Video information loaded!', 'success');
  } catch (err) {
    showToast(`Failed to analyze: ${err.message}`, 'error');
  } finally {
    elements.btnFetch.disabled = false;
    elements.btnFetch.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <span>${state.inputMode === 'search' ? 'Search' : 'Analyze'}</span>
    `;
  }
}

function renderPreview(video) {
  elements.previewThumb.src = video.thumbnail || '';
  elements.previewDuration.textContent = video.durationFormatted;
  elements.previewTitle.textContent = video.title;
  elements.previewUploader.textContent = video.uploader;
  elements.previewViews.textContent = `${video.viewsFormatted} views`;
  elements.previewDate.textContent = formatDate(video.uploadDate);
  updatePreviewFormatLabel();

  // Populate trim end time default if duration exists
  if (video.durationFormatted) {
    elements.trimEnd.placeholder = video.durationFormatted;
  }

  elements.previewSection.style.display = 'block';
  elements.previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatDate(raw) {
  if (!raw || raw.length !== 8) return 'Recently';
  const y = raw.substring(0, 4);
  const m = raw.substring(4, 6);
  const d = raw.substring(6, 8);
  return `${y}-${m}-${d}`;
}

// ============================================================================
// Download & Queue Handlers
// ============================================================================
function setupDownloadHandlers() {
  elements.btnStartDownload.addEventListener('click', () => {
    startNewDownload(true);
  });

  elements.btnAddQueue.addEventListener('click', () => {
    startNewDownload(false);
  });

  // Download Thumbnail actions
  elements.btnDownloadThumb?.addEventListener('click', (e) => {
    handleDownloadThumbnail(e.shiftKey);
  });

  // Real-time live streaming modal trigger
  elements.btnPreviewStreamModal?.addEventListener('click', () => {
    if (state.currentVideo) {
      openLivePreview(state.currentVideo);
    }
  });
}

async function handleDownloadThumbnail(saveAs = false) {
  if (!state.currentVideo) {
    showToast('Please analyze a video first', 'error');
    return;
  }

  const video = state.currentVideo;
  const btn = elements.btnDownloadThumb;
  const originalHtml = btn ? btn.innerHTML : '';

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
      </svg>
      <span>Saving Art...</span>
    `;
  }

  try {
    const res = await window.api.downloadThumbnail({
      url: video.thumbnail,
      videoId: video.id,
      title: video.title,
      outputDir: state.outputDir,
      saveAs
    });

    if (res.canceled) {
      return;
    }

    if (!res.success) {
      throw new Error(res.error || 'Failed to save thumbnail');
    }

    fireCelebrationConfetti();
    showToast(`✓ Thumbnail saved: ${res.fileName}`, 'success', {
      text: 'Show in Folder',
      onClick: () => window.api.showInFolder(res.filePath)
    });
  } catch (err) {
    showToast(`Failed to download thumbnail: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

function startNewDownload(switchToQueue = true) {
  if (!state.currentVideo) {
    showToast('Please analyze a video first', 'error');
    return;
  }

  const video = state.currentVideo;
  const started = queueDownloadItem({
    url: video.webpageUrl,
    title: video.title,
    uploader: video.uploader,
    thumbnail: video.thumbnail,
    durationFormatted: video.durationFormatted,
    format: state.selectedFormat,
    bitrate: state.selectedBitrate,
    trim: {
      enabled: elements.toggleTrim.checked,
      start: elements.trimStart.value.trim(),
      end: elements.trimEnd.value.trim()
    }
  }, switchToQueue);

  if (started) {
    showToast(`Started downloading: "${video.title.substring(0, 30)}..."`, 'info');
  }
}

function queueDownloadItem(itemData, switchToQueue = true) {
  if (!itemData || !itemData.url) {
    showToast('No valid URL provided for download', 'error');
    return false;
  }

  const id = `dl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const format = (itemData.format || state.selectedFormat || 'mp3').toLowerCase();
  const bitrate = itemData.bitrate || state.selectedBitrate || '320k';
  const embedThumbnail = elements.toggleEmbedArt ? elements.toggleEmbedArt.checked : true;
  const embedMetadata = elements.toggleEmbedTags ? elements.toggleEmbedTags.checked : true;

  const downloadItem = {
    id,
    url: itemData.url,
    title: itemData.title || 'YouTube Track',
    uploader: itemData.uploader || 'YouTube Artist',
    thumbnail: itemData.thumbnail || '',
    durationFormatted: itemData.durationFormatted || '0:00',
    format,
    bitrate,
    trim: itemData.trim || null,
    percent: 0,
    speed: '',
    eta: '',
    status: 'starting',
    statusText: 'Initializing download...',
    filePath: null,
    fileName: null
  };

  state.queue.set(id, downloadItem);
  renderQueue();
  updateBadges();

  if (switchToQueue) {
    switchView('view-queue');
  }

  const dispatchDownload = (outputDir) => {
    window.api.startDownload({
      id,
      url: downloadItem.url,
      outputDir: outputDir || state.outputDir,
      format: downloadItem.format,
      bitrate: downloadItem.bitrate,
      embedThumbnail,
      embedMetadata,
      trim: downloadItem.trim
    }).catch(err => {
      downloadItem.status = 'error';
      downloadItem.statusText = `Error: ${err.message || 'Failed to start download'}`;
      updateQueueItemDOM(downloadItem);
      updateBadges();
      showToast(`Download error: ${err.message}`, 'error');
    });
  };

  if (!state.outputDir) {
    window.api.getDefaultFolder().then(folder => {
      setOutputDir(folder);
      dispatchDownload(folder);
    }).catch(() => {
      dispatchDownload('');
    });
  } else {
    dispatchDownload(state.outputDir);
  }

  return true;
}

function setupIpcListeners() {
  // Real-time progress updates
  window.api.onDownloadProgress((data) => {
    const item = state.queue.get(data.id);
    if (!item) return;

    item.percent = data.percent;
    item.speed = data.speed;
    item.eta = data.eta;
    item.status = 'downloading';
    item.statusText = `Downloading: ${data.percent.toFixed(1)}% (${data.speed || '---'} ETA: ${data.eta || '---'})`;

    updateQueueItemDOM(item);
  });

  // Stage changes (converting, tagging, etc.)
  window.api.onDownloadStatus((data) => {
    const item = state.queue.get(data.id);
    if (!item) return;

    item.status = data.stage;
    item.statusText = data.message;
    updateQueueItemDOM(item);
  });

  // Completion
  window.api.onDownloadComplete((data) => {
    const item = state.queue.get(data.id);
    if (!item) return;

    item.status = 'completed';
    item.percent = 100;
    item.statusText = 'Completed successfully!';
    item.filePath = data.filePath;
    item.fileName = data.fileName;

    updateQueueItemDOM(item);
    updateBadges();

    // Add to library
    const libEntry = {
      id: item.id,
      title: item.title,
      uploader: item.uploader,
      thumbnail: item.thumbnail,
      duration: item.durationFormatted,
      format: item.format,
      bitrate: item.bitrate,
      filePath: data.filePath,
      fileName: data.fileName,
      completedAt: Date.now()
    };

    // Prepend to library
    state.library.unshift(libEntry);
    saveLibrary();
    renderLibrary();

    // Trigger celebration effects
    fireCelebrationConfetti();
    showToast(`✓ Download finished: ${item.title.substring(0, 35)}...`, 'success', {
      text: 'Show in Folder',
      onClick: () => window.api.showInFolder(data.filePath)
    });
  });

  // Errors
  window.api.onDownloadError((data) => {
    const item = state.queue.get(data.id);
    if (!item) return;

    item.status = 'error';
    item.statusText = `Error: ${data.error}`;
    updateQueueItemDOM(item);
    updateBadges();
    showToast(`Download failed: ${data.error}`, 'error');
  });
}

function setupQueueHandlers() {
  elements.btnClearQueue.addEventListener('click', () => {
    // Clear completed or errored items
    const keysToRemove = [];
    state.queue.forEach((item, id) => {
      if (item.status === 'completed' || item.status === 'error' || item.status === 'cancelled') {
        keysToRemove.push(id);
      }
    });

    keysToRemove.forEach(id => state.queue.delete(id));
    renderQueue();
    updateBadges();
    showToast('Cleaned up queue', 'info');
  });
}

function renderQueue() {
  elements.queueItemsContainer.innerHTML = '';

  if (state.queue.size === 0) {
    elements.queueItemsContainer.appendChild(elements.queueEmptyState);
    elements.queueEmptyState.style.display = 'flex';
    return;
  }

  elements.queueEmptyState.style.display = 'none';

  // Render items in descending order
  const items = Array.from(state.queue.values()).reverse();
  items.forEach(item => {
    const card = createQueueItemDOM(item);
    elements.queueItemsContainer.appendChild(card);
  });
}

function createQueueItemDOM(item) {
  const card = document.createElement('div');
  card.className = 'download-card';
  card.id = `queue-card-${item.id}`;

  const isCompleted = item.status === 'completed';
  const isError = item.status === 'error';
  const badgeClass = isCompleted ? 'completed' : (isError ? 'error' : (item.status === 'converting' ? 'converting' : 'downloading'));

  card.innerHTML = `
    <div class="download-card-header">
      <div class="download-info">
        <img class="download-thumb" src="${item.thumbnail || ''}" alt="Thumb" onerror="this.src=''"/>
        <div class="download-text-box">
          <div class="download-title" title="${item.title}">${item.title}</div>
          <div class="download-status-text">
            <span class="status-badge ${badgeClass}" id="badge-${item.id}">${item.status.toUpperCase()}</span>
            <span id="text-status-${item.id}">${item.statusText}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        ${!isCompleted && !isError ? `
          <button class="btn-secondary" onclick="cancelJob('${item.id}')" title="Cancel Download">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Cancel
          </button>
        ` : ''}
        ${isCompleted && item.filePath ? `
          <button class="btn-secondary" onclick="openFileInFolder('${item.id}')" title="Show in Windows Explorer">
            Show in Folder
          </button>
          <button class="btn-action-round play-btn" onclick="playQueueAudio('${item.id}')" title="Play Now" style="width: 30px; height: 30px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
        ` : ''}
      </div>
    </div>
    <div class="progress-track">
      <div class="progress-bar" id="bar-${item.id}" style="width: ${item.percent}%;"></div>
    </div>
    <div class="download-meta-footer">
      <span>${item.format.toUpperCase()} · ${item.bitrate}</span>
      <span id="meta-speed-${item.id}">${item.speed ? `${item.speed} | ETA: ${item.eta}` : ''}</span>
    </div>
  `;

  return card;
}

function updateQueueItemDOM(item) {
  const bar = document.getElementById(`bar-${item.id}`);
  const badge = document.getElementById(`badge-${item.id}`);
  const statusText = document.getElementById(`text-status-${item.id}`);
  const metaSpeed = document.getElementById(`meta-speed-${item.id}`);

  if (bar) bar.style.width = `${item.percent}%`;
  if (statusText) statusText.textContent = item.statusText;
  if (metaSpeed) {
    metaSpeed.textContent = item.speed ? `${item.speed} | ETA: ${item.eta}` : '';
  }

  if (badge) {
    badge.textContent = item.status.toUpperCase();
    badge.className = `status-badge ${item.status === 'completed' ? 'completed' : (item.status === 'error' ? 'error' : (item.status === 'converting' ? 'converting' : 'downloading'))}`;
  }

  if (item.status === 'completed' || item.status === 'error') {
    // Re-render card to attach open/play buttons
    const oldCard = document.getElementById(`queue-card-${item.id}`);
    if (oldCard) {
      const newCard = createQueueItemDOM(item);
      oldCard.replaceWith(newCard);
    }
  }
}

window.cancelJob = function(id) {
  window.api.cancelDownload(id);
  const item = state.queue.get(id);
  if (item) {
    item.status = 'cancelled';
    item.statusText = 'Download cancelled';
    updateQueueItemDOM(item);
    updateBadges();
    showToast('Download cancelled', 'info');
  }
};

window.openFileInFolder = function(id) {
  const item = state.queue.get(id);
  if (item && item.filePath) {
    window.api.showInFolder(item.filePath);
  }
};

window.playQueueAudio = function(id) {
  const item = state.queue.get(id);
  if (item && item.filePath) {
    playTrack({
      title: item.title,
      uploader: item.uploader,
      thumbnail: item.thumbnail,
      filePath: item.filePath
    });
  }
};

// ============================================================================
// Library & History Handlers
// ============================================================================
function setupLibraryHandlers() {
  elements.btnClearLibrary.addEventListener('click', () => {
    if (confirm('Clear all downloaded tracks history? (This does not delete your files on disk)')) {
      state.library = [];
      saveLibrary();
      renderLibrary();
      showToast('Library cleared', 'info');
    }
  });

  elements.librarySearch.addEventListener('input', () => {
    renderLibrary(elements.librarySearch.value.trim().toLowerCase());
  });
}

function renderLibrary(filterQuery = '') {
  elements.libraryItemsContainer.innerHTML = '';

  const filtered = state.library.filter(track => {
    if (!filterQuery) return true;
    return (track.title && track.title.toLowerCase().includes(filterQuery)) ||
           (track.uploader && track.uploader.toLowerCase().includes(filterQuery));
  });

  if (filtered.length === 0) {
    elements.libraryItemsContainer.appendChild(elements.libraryEmptyState);
    elements.libraryEmptyState.style.display = 'flex';
    return;
  }

  elements.libraryEmptyState.style.display = 'none';

  filtered.forEach(track => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-item-left">
        <img class="history-thumb" src="${track.thumbnail || ''}" alt="Art" onerror="this.src=''"/>
        <div class="history-details">
          <div class="history-title" title="${track.title}">${track.title}</div>
          <div class="history-meta">
            <span>${track.uploader || 'Unknown'}</span>
            <span>•</span>
            <span style="font-weight: 600; color: #ff416c;">${(track.format || 'MP3').toUpperCase()} · ${track.bitrate || '320k'}</span>
            <span>•</span>
            <span>${track.duration || ''}</span>
          </div>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn-action-round play-btn" onclick="playTrackById('${track.id}')" title="Play Track">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <button class="btn-action-round" onclick="showTrackInFolder('${track.id}')" title="Show in File Explorer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <button class="btn-action-round" onclick="removeTrackFromLibrary('${track.id}')" title="Remove from list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    elements.libraryItemsContainer.appendChild(item);
  });
}

window.playTrackById = function(id) {
  const track = state.library.find(t => t.id === id);
  if (track) playTrack(track);
};

window.showTrackInFolder = function(id) {
  const track = state.library.find(t => t.id === id);
  if (track && track.filePath) {
    window.api.showInFolder(track.filePath);
  }
};

window.removeTrackFromLibrary = function(id) {
  state.library = state.library.filter(t => t.id !== id);
  saveLibrary();
  renderLibrary();
};

// ============================================================================
// Built-in Floating Glass Audio Player
// ============================================================================
function setupAudioPlayer() {
  const audio = elements.audioElement;

  elements.playerBtnPlay.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    state.audioPlayer.isPlaying = true;
    elements.playerPlayIcon.style.display = 'none';
    elements.playerPauseIcon.style.display = 'block';
    elements.playerThumbWrapper?.classList.add('playing');
    elements.playerSoundwave?.classList.remove('paused');
  });

  audio.addEventListener('pause', () => {
    state.audioPlayer.isPlaying = false;
    elements.playerPlayIcon.style.display = 'block';
    elements.playerPauseIcon.style.display = 'none';
    elements.playerThumbWrapper?.classList.remove('playing');
    elements.playerSoundwave?.classList.add('paused');
  });

  audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration) && audio.duration > 0) {
      const pct = (audio.currentTime / audio.duration) * 100;
      elements.playerSeek.value = pct;
      elements.playerCurrentTime.textContent = formatAudioTime(audio.currentTime);
      elements.playerTotalTime.textContent = formatAudioTime(audio.duration);
    }
  });

  elements.playerSeek.addEventListener('input', () => {
    if (!isNaN(audio.duration)) {
      audio.currentTime = (elements.playerSeek.value / 100) * audio.duration;
    }
  });

  elements.playerVolume.addEventListener('input', () => {
    audio.volume = elements.playerVolume.value / 100;
  });

  elements.playerBtnPrev.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  });

  elements.playerBtnNext.addEventListener('click', () => {
    if (!isNaN(audio.duration)) {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    }
  });

  elements.playerBtnClose.addEventListener('click', () => {
    audio.pause();
    elements.floatingPlayer.classList.remove('active');
  });
}

function playTrack(track) {
  state.audioPlayer.currentTrack = track;
  elements.playerThumb.src = track.thumbnail || '';
  elements.playerTitle.textContent = track.title;
  elements.playerArtist.textContent = track.uploader || 'Audio';

  // Normalize Windows path for audio src
  const fileUrl = 'file:///' + track.filePath.replace(/\\/g, '/');
  elements.audioElement.src = fileUrl;
  elements.audioElement.play().catch(e => {
    console.error('Audio play error:', e);
    // Fallback: open via system default player
    window.api.openFile(track.filePath);
  });

  elements.floatingPlayer.classList.add('active');
}

function formatAudioTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Toast Notifications
// ============================================================================
function showToast(message, type = 'info', action = null) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  if (type === 'success') {
    icon = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--accent-green);">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
  } else if (type === 'error') {
    icon = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #ef4444;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  }

  toast.innerHTML = `${icon}<span style="flex: 1;">${message}</span>`;

  if (action && action.text && action.onClick) {
    const actionBtn = document.createElement('button');
    actionBtn.className = 'btn-secondary';
    actionBtn.style.padding = '4px 10px';
    actionBtn.style.fontSize = '11.5px';
    actionBtn.style.marginLeft = '8px';
    actionBtn.textContent = action.text;
    actionBtn.onclick = (e) => {
      e.stopPropagation();
      action.onClick();
    };
    toast.appendChild(actionBtn);
  }

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// ============================================================================
// Ambient Cursor Glow & Animation Effects
// ============================================================================
function setupCursorGlow() {
  const glow = elements.cursorGlow;
  if (!glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      glow.style.opacity = '1';
    }
  });

  window.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    isMoving = false;
  });

  // Smooth lerp RAF for silky motion
  function animateGlow() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;
    requestAnimationFrame(animateGlow);
  }
  requestAnimationFrame(animateGlow);
}

// ============================================================================
// Celebration Confetti Particle Physics System
// ============================================================================
let confettiParticles = [];
let confettiCtx = null;
let confettiAnimationId = null;

function setupConfettiCanvas() {
  const canvas = elements.confettiCanvas;
  if (!canvas) return;

  confettiCtx = canvas.getContext('2d');
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

function fireCelebrationConfetti() {
  const canvas = elements.confettiCanvas;
  if (!canvas || !confettiCtx) return;

  const colors = [
    '#ff416c', '#ff4b2b', '#3b82f6', '#8b5cf6',
    '#10b981', '#f59e0b', '#ec4899', '#06b6d4'
  ];

  const count = 75;
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.35;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    confettiParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.18,
      drag: 0.985,
      alpha: 1,
      decay: 0.008 + Math.random() * 0.012,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }

  if (!confettiAnimationId) {
    runConfettiLoop();
  }
}

function runConfettiLoop() {
  if (!confettiCtx || confettiParticles.length === 0) {
    if (confettiCtx && elements.confettiCanvas) {
      confettiCtx.clearRect(0, 0, elements.confettiCanvas.width, elements.confettiCanvas.height);
    }
    confettiAnimationId = null;
    return;
  }

  const canvas = elements.confettiCanvas;
  confettiCtx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= p.drag;
    p.vy = (p.vy + p.gravity) * p.drag;
    p.rotation += p.rotSpeed;
    p.alpha -= p.decay;

    if (p.alpha <= 0 || p.y > canvas.height) {
      confettiParticles.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.alpha);
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;

    if (p.shape === 'rect') {
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    } else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }

    confettiCtx.restore();
  }

  confettiAnimationId = requestAnimationFrame(runConfettiLoop);
}

// ============================================================================
// Real-Time YouTube Suite: Live Stream Preview Modal
// ============================================================================
let currentLiveVideo = null;

function setupLivePreviewModal() {
  if (!elements.livePlayerModal) return;

  // Close handlers
  elements.btnLivePlayerClose?.addEventListener('click', closeLivePreview);
  elements.livePlayerModal.addEventListener('click', (e) => {
    if (e.target === elements.livePlayerModal) {
      closeLivePreview();
    }
  });

  // ESC key listener to exit modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.livePlayerModal.style.display !== 'none') {
      closeLivePreview();
    }
  });

  // External browser button
  elements.btnLivePlayerPopout?.addEventListener('click', () => {
    if (currentLiveVideo?.url) {
      window.api.openExternal(currentLiveVideo.url);
    }
  });

  // 1-Click Download MP3 from inside preview modal
  elements.btnLiveDownloadNow?.addEventListener('click', () => {
    if (currentLiveVideo) {
      downloadSearchResult(currentLiveVideo);
      closeLivePreview();
    }
  });
}

function openLivePreview(item) {
  if (!item) return;
  currentLiveVideo = item;

  // Extract 11-character YouTube video ID
  let videoId = item.id;
  if (!videoId && item.url) {
    const match = item.url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    if (match) videoId = match[1];
  }

  if (!videoId) {
    showToast('Cannot stream this media source', 'error');
    return;
  }

  if (elements.livePlayerTitle) elements.livePlayerTitle.textContent = item.title || 'Live YouTube Preview';
  if (elements.livePlayerArtist) elements.livePlayerArtist.textContent = item.uploader || 'YouTube Channel';

  // Embed player with autoplay
  if (elements.livePlayerIframe) {
    elements.livePlayerIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  elements.livePlayerModal.style.display = 'flex';
}

function closeLivePreview() {
  if (!elements.livePlayerModal) return;
  elements.livePlayerModal.style.display = 'none';
  // Instantly halt audio and video playback by resetting iframe
  if (elements.livePlayerIframe) {
    elements.livePlayerIframe.src = 'about:blank';
  }
}

// ============================================================================
// Real-Time YouTube Suite: Live Search Suggestions & Autocomplete
// ============================================================================
function setupSearchSuggestions() {
  // Bind to Home banner search
  bindInputSuggestions(
    elements.homeSearchInput,
    elements.homeSuggestionsDropdown,
    (query) => {
      switchView('view-downloader');
      setInputMode('search');
      elements.urlInput.value = query;
      elements.btnClearUrl.style.display = 'flex';
      executeYouTubeSearch(query);
    }
  );

  // Bind to Downloader search / URL bar
  bindInputSuggestions(
    elements.urlInput,
    elements.urlSuggestionsDropdown,
    (query) => {
      setInputMode('search');
      elements.urlInput.value = query;
      elements.btnClearUrl.style.display = 'flex';
      executeYouTubeSearch(query);
    },
    // Only search suggestions when input is NOT already a direct URL
    () => state.inputMode === 'search' || !/^(https?:\/\/|www\.|youtu\.be\/|youtube\.com\/)/i.test(elements.urlInput.value)
  );
}

function bindInputSuggestions(inputEl, dropdownEl, onSelect, conditionFn = () => true) {
  if (!inputEl || !dropdownEl) return;

  let debounceTimer = null;
  let activeIndex = -1;
  let currentSuggestions = [];

  const hideDropdown = () => {
    dropdownEl.style.display = 'none';
    dropdownEl.innerHTML = '';
    activeIndex = -1;
    currentSuggestions = [];
  };

  const updateActiveItem = (items) => {
    items.forEach((item, idx) => {
      if (idx === activeIndex) {
        item.classList.add('selected');
        inputEl.value = currentSuggestions[idx];
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  };

  const renderSuggestions = (suggestions) => {
    currentSuggestions = suggestions;
    activeIndex = -1;
    dropdownEl.innerHTML = '';

    if (!suggestions || suggestions.length === 0) {
      hideDropdown();
      return;
    }

    suggestions.forEach((text) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';

      const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconSvg.setAttribute('class', 'suggestion-icon');
      iconSvg.setAttribute('width', '13');
      iconSvg.setAttribute('height', '13');
      iconSvg.setAttribute('viewBox', '0 0 24 24');
      iconSvg.setAttribute('fill', 'none');
      iconSvg.setAttribute('stroke', 'currentColor');
      iconSvg.setAttribute('stroke-width', '2');
      iconSvg.innerHTML = '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>';

      const textSpan = document.createElement('span');
      textSpan.className = 'suggestion-text';
      textSpan.textContent = text;

      item.appendChild(iconSvg);
      item.appendChild(textSpan);

      item.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevents input blur before selection
        inputEl.value = text;
        hideDropdown();
        onSelect(text);
      });

      dropdownEl.appendChild(item);
    });

    dropdownEl.style.display = 'block';
  };

  inputEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = inputEl.value.trim();

    if (!query || query.length < 2 || !conditionFn()) {
      hideDropdown();
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await window.api.getSearchSuggestions(query);
        if (res.success && res.suggestions && res.suggestions.length > 0) {
          renderSuggestions(res.suggestions);
        } else {
          hideDropdown();
        }
      } catch (e) {
        hideDropdown();
      }
    }, 160);
  });

  inputEl.addEventListener('keydown', (e) => {
    const items = dropdownEl.querySelectorAll('.suggestion-item');
    if (!items.length || dropdownEl.style.display === 'none') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const selectedText = currentSuggestions[activeIndex];
      if (selectedText) {
        inputEl.value = selectedText;
        hideDropdown();
        onSelect(selectedText);
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  inputEl.addEventListener('blur', () => {
    setTimeout(hideDropdown, 200);
  });
}

// ============================================================================
// Real-Time YouTube Suite: Live Clipboard Link Watcher
// ============================================================================
let lastSeenClipboardUrl = '';
let clipboardPollInterval = null;

function setupRealtimeClipboardWatcher() {
  if (clipboardPollInterval) clearInterval(clipboardPollInterval);

  // Initial read to avoid prompting for whatever is already in clipboard at launch
  window.api.readClipboardText().then(initialText => {
    if (initialText) lastSeenClipboardUrl = initialText.trim();
  }).catch(() => {});

  // Poll clipboard every 1200ms
  clipboardPollInterval = setInterval(async () => {
    if (document.hidden) return;

    try {
      const text = await window.api.readClipboardText();
      if (!text) return;
      const trimmed = text.trim();

      const isYoutubeUrl = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|playlist\?list=)|youtu\.be\/)([\w-]+)/i.test(trimmed);

      if (isYoutubeUrl && trimmed !== lastSeenClipboardUrl) {
        lastSeenClipboardUrl = trimmed;

        showToast('YouTube link detected from clipboard!', 'info', {
          text: 'Download MP3',
          onClick: () => {
            switchView('view-downloader');
            setInputMode('url');
            elements.urlInput.value = trimmed;
            elements.btnClearUrl.style.display = 'flex';
            if (trimmed.includes('list=') || trimmed.includes('/playlist')) {
              handleFetchPlaylist(trimmed);
            } else {
              fetchVideoInfo(trimmed);
            }
          }
        });
      }
    } catch (err) {
      // Ignore reading issues silently
    }
  }, 1200);
}

// Start application
document.addEventListener('DOMContentLoaded', init);
