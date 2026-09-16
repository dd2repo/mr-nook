// Mr. Nook, a private audiobook player. Vanilla JS, no build step.
// Screens: profiles -> home | library | book | search | settings. Player and sheets are overlays.

const audio = document.getElementById('audio');
const app = document.getElementById('app');

const APP_VERSION = '0.5.0';
const GITHUB_URL = 'https://github.com/dd2repo/mr-nook';
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const SKIP_BACK_OPTIONS = [10, 15, 30];
const SKIP_FWD_OPTIONS = [15, 30, 45, 60];
const SLEEP_MINUTES = [5, 10, 15, 30, 45, 60];
const PALETTE = ['#82855b', '#ce6946', '#6c4530', '#9d9f71', '#f4b090', '#864c2f'];
const SAVE_INTERVAL_MS = 10000;
const SLEEP_FADE_MS = 20000;

// ------------------------------------------------------------------ i18n

const STRINGS = {
  de: {
    whoListens: 'Wer hört?',
    editPicture: 'Profilbild ändern',
    choosePhoto: 'Foto auswählen',
    removePhoto: 'Foto entfernen',
    pickColor: 'Oder eine Farbe',
    morning: 'Guten Morgen',
    day: 'Hallo',
    evening: 'Guten Abend',
    night: 'Gute Nacht',
    continueListening: 'Weiterhören',
    recentlyAdded: 'Neu dabei',
    recentlyPlayed: 'Zuletzt gehört',
    favorites: 'Favoriten',
    home: 'Home',
    library: 'Bibliothek',
    search: 'Suche',
    settings: 'Einstellungen',
    all: 'Alle',
    inProgress: 'Angefangen',
    finished: 'Fertig',
    sortBy: 'Sortieren',
    sortTitle: 'Titel',
    sortAuthor: 'Autor',
    sortLastPlayed: 'Zuletzt gehört',
    sortAdded: 'Neu hinzugefügt',
    sortProgress: 'Fortschritt',
    emptyNook: 'Dein Nook ist noch ein bisschen leer.',
    addFirst: 'Erstes Hörbuch hinzufügen',
    nothingHere: 'Hier ist noch nichts.',
    nothingInFilter: 'In dieser Ansicht ist nichts.',
    pickSomething: 'Such dir etwas aus der Bibliothek aus.',
    addAudiobook: 'Hörbuch hinzufügen',
    addHint: 'Hörbücher kommen über das Skript auf dem Mac in den Nook. Eine MP3 pro Buch, Cover optional:',
    searchPlaceholder: 'Titel, Autor oder Kapitel',
    play: 'Abspielen',
    resume: 'Weiterhören',
    startOver: 'Von Anfang',
    pause: 'Pause',
    left: 'übrig',
    total: 'gesamt',
    markFinished: 'Als fertig markieren',
    markUnfinished: 'Fertig zurücknehmen',
    restart: 'Neu starten',
    favorite: 'Favorit',
    chapters: 'Kapitel',
    fullBook: 'Ganzes Buch',
    bookmarks: 'Lesezeichen',
    addBookmark: 'Lesezeichen',
    bookmarkAdded: 'Lesezeichen gesetzt',
    notePlaceholder: 'Notiz …',
    delete: 'Löschen',
    sleep: 'Sleep',
    sleepTimer: 'Sleep-Timer',
    off: 'Aus',
    endOfChapter: 'Kapitelende',
    sleepHint: 'Mr. Nook macht leise aus, wenn du eingeschlafen bist.',
    speed: 'Tempo',
    playback: 'Wiedergabe',
    defaultSpeed: 'Standard-Tempo',
    skipBack: 'Zurückspringen',
    skipForward: 'Vorspringen',
    autoResume: 'Zuletzt gehörtes Buch beim Start laden',
    appearance: 'Darstellung',
    theme: 'Theme',
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System',
    language: 'Sprache',
    profile: 'Profil',
    switchProfile: 'Profil wechseln',
    invites: 'Einladungen',
    newInvite: 'Einladung erstellen',
    inviteHint: 'Erzeugt einen Link mit Anleitung. Einmal gültig, läuft nach 14 Tagen ab.',
    inviteFor: 'Für wen?',
    copyLink: 'Link kopieren',
    copied: 'Kopiert',
    share: 'Teilen',
    openInvites: 'Offen',
    usedInvite: 'Benutzt',
    expiredInvite: 'Abgelaufen',
    revoke: 'Zurückziehen',
    noInvites: 'Keine offenen Einladungen.',
    changePicture: 'Profilbild',
    libraryHeading: 'Bibliothek',
    refreshLibrary: 'Bibliothek neu laden',
    clearCache: 'Cache leeren',
    cacheCleared: 'Cache geleert',
    about: 'Über',
    version: 'Version',
    sourceCode: 'Quellcode auf GitHub',
    licenses: 'Lizenzen',
    licensesText: 'Mr. Nook ist MIT-lizenziert. Keine Bibliotheken von Dritten zur Laufzeit; Schrift Nunito (OFL) von Google Fonts.',
    locked: 'Kein Zugang',
    lockedHint: 'Öffne Mr. Nook über den geheimen Link, den du bekommen hast. Danach merkt sich dieses Gerät den Zugang.',
    error: 'Fehler',
    loadError: 'Konnte nicht laden. Internet prüfen und erneut versuchen.',
    retry: 'Erneut versuchen',
    nowPlaying: 'Läuft gerade',
    close: 'Schließen',
    back: 'Zurück',
    seconds: 's',
    minutes: 'Min',
    chapterN: (n) => `Kapitel ${n}`,
    showAllChapters: (n) => `Alle ${n} Kapitel anzeigen`,
    hoursMin: (h, m) => (h > 0 ? `${h} Std ${m} Min` : `${m} Min`),
    sleepIn: (t) => `Schläft in ${t}`,
  },
  en: {
    whoListens: "Who's listening?",
    editPicture: 'Change picture',
    choosePhoto: 'Choose photo',
    removePhoto: 'Remove photo',
    pickColor: 'Or pick a colour',
    morning: 'Good morning',
    day: 'Hello',
    evening: 'Good evening',
    night: 'Good night',
    continueListening: 'Continue listening',
    recentlyAdded: 'Recently added',
    recentlyPlayed: 'Recently played',
    favorites: 'Favorites',
    home: 'Home',
    library: 'Library',
    search: 'Search',
    settings: 'Settings',
    all: 'All',
    inProgress: 'In progress',
    finished: 'Finished',
    sortBy: 'Sort by',
    sortTitle: 'Title',
    sortAuthor: 'Author',
    sortLastPlayed: 'Last played',
    sortAdded: 'Recently added',
    sortProgress: 'Progress',
    emptyNook: 'Your nook is a little empty.',
    addFirst: 'Add your first audiobook',
    nothingHere: 'Nothing here yet.',
    nothingInFilter: 'Nothing in this view.',
    pickSomething: 'Pick something from your library.',
    addAudiobook: 'Add audiobook',
    addHint: 'Audiobooks reach the nook through the script on the Mac. One MP3 per book, cover optional:',
    searchPlaceholder: 'Title, author or chapter',
    play: 'Play',
    resume: 'Continue',
    startOver: 'Start over',
    pause: 'Pause',
    left: 'left',
    total: 'total',
    markFinished: 'Mark as finished',
    markUnfinished: 'Mark as unfinished',
    restart: 'Restart book',
    favorite: 'Favorite',
    chapters: 'Chapters',
    fullBook: 'Full book',
    bookmarks: 'Bookmarks',
    addBookmark: 'Bookmark',
    bookmarkAdded: 'Bookmark added',
    notePlaceholder: 'Note …',
    delete: 'Delete',
    sleep: 'Sleep',
    sleepTimer: 'Sleep timer',
    off: 'Off',
    endOfChapter: 'End of chapter',
    sleepHint: 'Mr. Nook turns the volume down gently once you have drifted off.',
    speed: 'Speed',
    playback: 'Playback',
    defaultSpeed: 'Default speed',
    skipBack: 'Skip back',
    skipForward: 'Skip forward',
    autoResume: 'Load last book on start',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    profile: 'Profile',
    switchProfile: 'Switch profile',
    invites: 'Invites',
    newInvite: 'Create invite',
    inviteHint: 'Creates a link with setup instructions. Single use, expires after 14 days.',
    inviteFor: 'Who is it for?',
    copyLink: 'Copy link',
    copied: 'Copied',
    share: 'Share',
    openInvites: 'Open',
    usedInvite: 'Used',
    expiredInvite: 'Expired',
    revoke: 'Revoke',
    noInvites: 'No open invites.',
    changePicture: 'Profile picture',
    libraryHeading: 'Library',
    refreshLibrary: 'Refresh library',
    clearCache: 'Clear cache',
    cacheCleared: 'Cache cleared',
    about: 'About',
    version: 'Version',
    sourceCode: 'Source code on GitHub',
    licenses: 'Licenses',
    licensesText: 'Mr. Nook is MIT licensed. No third-party runtime libraries; the Nunito typeface (OFL) is loaded from Google Fonts.',
    locked: 'No access',
    lockedHint: 'Open Mr. Nook with the secret link you were given. This device will remember it afterwards.',
    error: 'Error',
    loadError: 'Could not load. Check your connection and try again.',
    retry: 'Retry',
    nowPlaying: 'Now playing',
    close: 'Close',
    back: 'Back',
    seconds: 's',
    minutes: 'min',
    chapterN: (n) => `Chapter ${n}`,
    showAllChapters: (n) => `Show all ${n} chapters`,
    hoursMin: (h, m) => (h > 0 ? `${h} h ${m} min` : `${m} min`),
    sleepIn: (t) => `Sleeps in ${t}`,
  },
};

// ------------------------------------------------------------------ state

const defaultSettings = { speed: 1, skipBack: 15, skipFwd: 30, autoResume: true, theme: 'light', libView: 'grid', libSort: 'lastPlayed' };
const settings = { ...defaultSettings, ...readJson('nook.settings') };

const state = {
  screen: 'loading',      // loading | error | locked | profiles | home | library | book | search | settings
  bookId: null,
  lang: 'de',
  users: [],
  user: null,
  books: [],
  detail: null,           // book detail for the book screen
  now: null,              // book detail loaded into the audio element
  playerOpen: false,
  sheet: null,            // { type: 'chapters' | 'sleep' | 'speed' | 'sort' | 'add' | 'avatar', ... }
  libFilter: 'all',
  query: '',
  results: null,
  sleep: { until: 0, endOfChapter: false, startChapter: -1, minutes: 0 },
  seeking: false,
  pendingStart: 0,
  showTotal: false,
  avatarVersion: Date.now(),
  invites: null,
};

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
}
function saveSettings() {
  localStorage.setItem('nook.settings', JSON.stringify(settings));
  applyTheme();
}
function applyTheme() {
  if (settings.theme === 'light' || settings.theme === 'dark') document.documentElement.dataset.theme = settings.theme;
  else delete document.documentElement.dataset.theme;
}

function t(key, ...args) {
  const table = STRINGS[state.lang] || STRINGS.de;
  const value = table[key] ?? STRINGS.de[key] ?? key;
  return typeof value === 'function' ? value(...args) : value;
}
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}
function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return t('hoursMin', h, m);
}
function initials(text) {
  return String(text || '?').split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
}
function greeting() {
  const h = new Date().getHours();
  if (h < 5) return t('night');
  if (h < 11) return t('morning');
  if (h < 17) return t('day');
  if (h < 23) return t('evening');
  return t('night');
}

// ------------------------------------------------------------------ icons

const ICON = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/></svg>',
  library: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="16" rx="1"/><path d="m17 5 4 15"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M11 6.5 5.5 12 11 17.5"/><path d="M6 12h12"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="m6 10 6 6 6-6"/></svg>',
  skipBack: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/></svg>',
  skipFwd: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  restart: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/><path d="M12 8v4l3 2"/></svg>',
  chapters: '<svg viewBox="0 0 24 24"><path d="M5 6h14M5 12h14M5 18h9"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  gauge: '<svg viewBox="0 0 24 24"><path d="M4 15a8 8 0 1 1 16 0"/><path d="m12 15 4-5"/><circle cx="12" cy="15" r="1.5"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24"><path d="M7 4h10v16l-5-3.5L7 20z"/></svg>',
  sort: '<svg viewBox="0 0 24 24"><path d="M4 7h16M7 12h10M10 17h4"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
  pencil: '<svg viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2 2 0 0 0-2.8-2.8L5 17.2z"/><path d="m13.5 8.5 2.8 2.8"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
};

// ------------------------------------------------------------------- API

async function api(path, options = {}) {
  const init = { method: options.method || 'GET', credentials: 'same-origin', headers: {} };
  if (options.body !== undefined) {
    init.headers['content-type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }
  if (options.raw !== undefined) {
    init.headers['content-type'] = options.contentType || 'application/octet-stream';
    init.body = options.raw;
  }
  const res = await fetch(`/api${path}`, init);
  if (res.status === 401) {
    state.screen = 'locked';
    render();
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    throw new Error(info.error || `${res.status} ${res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}

// ------------------------------------------------------------------ boot

async function boot() {
  applyTheme();
  const rawHash = location.hash.replace(/^#/, '');
  if (rawHash.startsWith('k=')) {
    const key = new URLSearchParams(rawHash).get('k');
    await fetch('/api/session', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key }),
    }).catch(() => {});
    history.replaceState(null, '', `${location.pathname}#/home`);
  }

  let me;
  try { me = await fetch('/api/me', { credentials: 'same-origin' }); } catch { return fail(); }
  if (me.status === 401) { state.screen = 'locked'; return render(); }
  if (!me.ok) return fail();

  try { state.users = await api('/users'); } catch { return fail(); }
  const savedUserId = localStorage.getItem('nook.user') || localStorage.getItem('hb.user');
  state.user = state.users.find((u) => String(u.id) === savedUserId) || null;
  if (!state.user) {
    state.screen = 'profiles';
    render();
  } else {
    state.lang = state.user.lang || 'de';
    await enterApp();
  }
  window.addEventListener('hashchange', route);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

function fail() {
  state.screen = 'error';
  render();
}

async function enterApp() {
  try { await loadLibrary(); } catch (err) { return fail(); }
  if (!location.hash || location.hash === '#' || location.hash.startsWith('#k=')) history.replaceState(null, '', `${location.pathname}#/home`);
  await route();
  if (settings.autoResume && !state.now) {
    const last = state.books.find((b) => b.last_played > 0 && b.position_sec > 0 && !b.finished);
    if (last) loadIntoPlayer(last.id, { autoplay: false }).catch(() => {});
  }
}

async function loadLibrary() {
  state.books = await api(`/books?user=${state.user.id}`);
}

async function route() {
  if (!state.user) return;
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const screen = parts[0] || 'home';
  state.playerOpen = false;
  state.sheet = null;
  if (screen === 'book' && parts[1]) {
    state.screen = 'book';
    state.bookId = parts[1];
    state.detail = state.detail && state.detail.id === parts[1] ? state.detail : null;
    render();
    try {
      state.detail = await api(`/books/${parts[1]}?user=${state.user.id}`);
    } catch (err) {
      toast(`${t('error')}: ${err.message}`);
      location.hash = '#/library';
      return;
    }
    render();
    return;
  }
  if (['home', 'library', 'search', 'settings'].includes(screen)) {
    state.screen = screen;
    if (screen === 'home' || screen === 'library') loadLibrary().then(render).catch(() => {});
    if (screen === 'settings') loadInvites();
    render();
    if (screen === 'search') {
      const input = document.getElementById('q');
      if (input) input.focus();
    }
    return;
  }
  location.hash = '#/home';
}

function go(screen, id) {
  location.hash = id ? `#/${screen}/${id}` : `#/${screen}`;
}

// ---------------------------------------------------------------- overlays
// Player and sheets push a history entry so the Android back button closes them.

function openPlayer() {
  if (state.playerOpen || !state.now) return;
  state.playerOpen = true;
  history.pushState({ overlay: 'player' }, '');
  render();
}
function closePlayer() {
  if (!state.playerOpen) return;
  if (history.state && history.state.overlay === 'player') history.back();
  else { state.playerOpen = false; render(); }
}
function openSheet(sheet) {
  state.sheet = sheet;
  history.pushState({ overlay: 'sheet', player: state.playerOpen }, '');
  render();
}
function closeSheet() {
  if (!state.sheet) return;
  if (history.state && history.state.overlay === 'sheet') history.back();
  else { state.sheet = null; render(); }
}
window.addEventListener('popstate', (event) => {
  const st = event.state || {};
  state.sheet = null;
  state.playerOpen = st.overlay === 'player' || (st.overlay === 'sheet' && st.player);
  render();
});

// --------------------------------------------------------------- profiles

function selectUser(user) {
  if (state.user && state.user.id !== user.id && state.now) {
    saveProgress(true);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    state.now = null;
  }
  state.user = user;
  state.lang = user.lang || 'de';
  localStorage.setItem('nook.user', String(user.id));
  state.screen = 'home';
  location.hash = '#/home';
  enterApp().catch(fail);
}

async function uploadAvatar(userId, file) {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.86));
  await api(`/users/${userId}/avatar`, { method: 'PUT', raw: blob, contentType: 'image/jpeg' });
  const user = state.users.find((u) => u.id === userId);
  if (user) user.has_avatar = 1;
  state.avatarVersion = Date.now();
  render();
}

async function removeAvatar(userId) {
  await api(`/users/${userId}/avatar`, { method: 'DELETE' });
  const user = state.users.find((u) => u.id === userId);
  if (user) user.has_avatar = 0;
  render();
}

async function setUserColor(userId, color) {
  const user = state.users.find((u) => u.id === userId);
  if (user) user.color = color;
  render();
  api(`/users/${userId}`, { method: 'PATCH', body: { color } }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

// ----------------------------------------------------------------- player

function bookDuration(book) {
  if (book && state.now && book.id === state.now.id && Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
  return book ? Number(book.duration_sec) || 0 : 0;
}
function chaptersOf(book) {
  return (book && book.chapters) || [];
}
function chapterIndexAt(book, pos) {
  const chapters = chaptersOf(book);
  let idx = -1;
  for (let i = 0; i < chapters.length; i++) {
    if (Number(chapters[i].start_sec) <= pos + 0.5) idx = i;
    else break;
  }
  return idx;
}
function chapterTitle(book, idx) {
  const c = chaptersOf(book)[idx];
  return c ? c.title || t('chapterN', idx + 1) : '';
}
function chapterLength(book, idx) {
  const chapters = chaptersOf(book);
  const start = Number(chapters[idx].start_sec);
  const end = idx + 1 < chapters.length ? Number(chapters[idx + 1].start_sec) : Number(book.duration_sec) || 0;
  return Math.max(0, end - start);
}
function currentPos() {
  return audio.readyState === 0 && state.pendingStart ? state.pendingStart : audio.currentTime;
}

async function loadIntoPlayer(bookId, { autoplay = true, startAt } = {}) {
  if (state.now && state.now.id === bookId) {
    if (startAt !== undefined) { audio.currentTime = startAt; saveProgress(true); }
    if (autoplay) audio.play().catch(() => {});
    return;
  }
  const detail = state.detail && state.detail.id === bookId ? state.detail : await api(`/books/${bookId}?user=${state.user.id}`);
  if (state.now) saveProgress(true);
  state.now = detail;
  const saved = detail.progress && !detail.progress.finished ? Number(detail.progress.position_sec) || 0 : 0;
  const begin = startAt !== undefined ? startAt : saved;
  state.pendingStart = begin;
  audio.src = `/media/${bookId}/audio`;
  audio.playbackRate = settings.speed;
  audio.addEventListener('loadedmetadata', () => {
    if (begin > 0) audio.currentTime = begin;
    state.pendingStart = 0;
    updateTimeUi();
  }, { once: true });
  audio.load();
  updateMediaSession();
  render();
  if (autoplay) audio.play().catch(() => {});
}

function togglePlay() {
  if (!state.now) return;
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}
function skip(delta) {
  if (!state.now) return;
  const duration = bookDuration(state.now);
  audio.currentTime = Math.max(0, Math.min(duration || Infinity, audio.currentTime + delta));
  saveProgress(true);
}
function seekTo(sec, play = true) {
  audio.currentTime = sec;
  saveProgress(true);
  if (play && audio.paused) audio.play().catch(() => {});
}
function setSpeed(speed) {
  settings.speed = speed;
  audio.playbackRate = speed;
  saveSettings();
  render();
}

// ---- progress

let lastSaveAt = 0;
function saveProgress(force, useBeacon) {
  if (!state.now || !state.user) return;
  const now = Date.now();
  if (!force && now - lastSaveAt < SAVE_INTERVAL_MS) return;
  lastSaveAt = now;
  const duration = bookDuration(state.now);
  const position = Math.floor(currentPos());
  const finished = audio.ended || (duration > 0 && duration - position < 5) ? 1 : 0;
  const payload = { user_id: state.user.id, book_id: state.now.id, position_sec: position, finished };
  applyLocalProgress(state.now.id, { position_sec: position, finished, last_played: now });
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon('/api/progress', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    return;
  }
  api('/progress', { method: 'PUT', body: payload }).catch(() => {});
}

function applyLocalProgress(bookId, patch) {
  const listed = state.books.find((b) => b.id === bookId);
  if (listed) Object.assign(listed, patch);
  for (const d of [state.detail, state.now]) {
    if (d && d.id === bookId) {
      d.progress = { ...(d.progress || {}), position_sec: patch.position_sec ?? d.progress?.position_sec ?? 0, finished: patch.finished ?? d.progress?.finished ?? 0, favorite: patch.favorite ?? d.progress?.favorite ?? 0 };
    }
  }
}

async function toggleFavorite(book) {
  const current = book.progress ? book.progress.favorite : book.favorite;
  const favorite = current ? 0 : 1;
  applyLocalProgress(book.id, { favorite });
  const listed = state.books.find((b) => b.id === book.id);
  if (listed) listed.favorite = favorite;
  render();
  api('/favorite', { method: 'PUT', body: { user_id: state.user.id, book_id: book.id, favorite } }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

async function markFinished(book, finished) {
  const duration = Number(book.duration_sec) || 0;
  const position = finished ? Math.floor(duration) : 0;
  if (state.now && state.now.id === book.id) {
    audio.pause();
    audio.currentTime = position;
  }
  applyLocalProgress(book.id, { position_sec: position, finished: finished ? 1 : 0 });
  render();
  api('/progress', { method: 'PUT', body: { user_id: state.user.id, book_id: book.id, position_sec: position, finished: finished ? 1 : 0, touch: false } }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

async function restartBook(book) {
  if (state.now && state.now.id === book.id) audio.currentTime = 0;
  applyLocalProgress(book.id, { position_sec: 0, finished: 0 });
  render();
  api('/progress', { method: 'PUT', body: { user_id: state.user.id, book_id: book.id, position_sec: 0, finished: 0, touch: false } }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

// ---- sleep timer

function setSleep(option) {
  audio.volume = 1;
  if (option === -1) state.sleep = { until: 0, endOfChapter: true, startChapter: chapterIndexAt(state.now, audio.currentTime), minutes: -1 };
  else if (option > 0) state.sleep = { until: Date.now() + option * 60000, endOfChapter: false, startChapter: -1, minutes: option };
  else state.sleep = { until: 0, endOfChapter: false, startChapter: -1, minutes: 0 };
  closeSheet();
  render();
}
function sleepActive() {
  return state.sleep.until > 0 || state.sleep.endOfChapter;
}
function sleepLabel() {
  if (state.sleep.until > 0) return t('sleepIn', fmtTime((state.sleep.until - Date.now()) / 1000));
  if (state.sleep.endOfChapter) return t('endOfChapter');
  return t('sleep');
}
setInterval(() => {
  if (state.sleep.until > 0) {
    const remaining = state.sleep.until - Date.now();
    if (remaining <= 0) { audio.pause(); setSleep(0); return; }
    if (!audio.paused && remaining < SLEEP_FADE_MS) audio.volume = Math.max(0.05, remaining / SLEEP_FADE_MS);
  }
  const label = document.getElementById('sleep-label');
  if (label) label.textContent = sleepLabel();
}, 1000);

// ---- bookmarks

async function addBookmark() {
  if (!state.now) return;
  try {
    const row = await api('/bookmarks', {
      method: 'POST',
      body: { user_id: state.user.id, book_id: state.now.id, position_sec: Math.floor(audio.currentTime), note: '' },
    });
    for (const d of [state.now, state.detail]) {
      if (d && d.id === state.now.id && d.bookmarks && !d.bookmarks.some((b) => b.id === row.id)) {
        d.bookmarks.push(row);
        d.bookmarks.sort((a, b) => a.position_sec - b.position_sec);
      }
    }
    toast(t('bookmarkAdded'));
    render();
  } catch (err) {
    toast(`${t('error')}: ${err.message}`);
  }
}
function updateBookmarkNote(id, note) {
  for (const d of [state.now, state.detail]) {
    const bm = d && d.bookmarks && d.bookmarks.find((b) => b.id === id);
    if (bm) bm.note = note;
  }
  api(`/bookmarks/${id}`, { method: 'PATCH', body: { note } }).catch((err) => toast(`${t('error')}: ${err.message}`));
}
function deleteBookmark(id) {
  for (const d of [state.now, state.detail]) if (d && d.bookmarks) d.bookmarks = d.bookmarks.filter((b) => b.id !== id);
  render();
  api(`/bookmarks/${id}`, { method: 'DELETE' }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

// ---- media session

function updateMediaSession() {
  if (!('mediaSession' in navigator) || !state.now) return;
  const book = state.now;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: book.title,
      artist: book.author || '',
      album: 'Mr. Nook',
      artwork: book.has_cover ? [{ src: `${location.origin}/media/${book.id}/cover`, sizes: '512x512', type: 'image/jpeg' }] : [],
    });
  } catch { /* older browsers */ }
  const set = (action, handler) => { try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* unsupported */ } };
  set('play', () => audio.play().catch(() => {}));
  set('pause', () => audio.pause());
  set('seekbackward', () => skip(-settings.skipBack));
  set('seekforward', () => skip(settings.skipFwd));
  set('previoustrack', () => skip(-settings.skipBack));
  set('nexttrack', () => skip(settings.skipFwd));
  set('seekto', (d) => { if (d && d.seekTime != null) seekTo(d.seekTime, false); });
}
function updatePositionState() {
  if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState || !state.now) return;
  const duration = bookDuration(state.now);
  if (!Number.isFinite(duration) || duration <= 0) return;
  try { navigator.mediaSession.setPositionState({ duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, duration) }); } catch { /* ignore */ }
}

// ---- audio events

audio.addEventListener('timeupdate', () => {
  updateTimeUi();
  saveProgress(false);
  if (state.sleep.endOfChapter && !audio.paused && chapterIndexAt(state.now, audio.currentTime) !== state.sleep.startChapter) {
    audio.pause();
    setSleep(0);
  }
});
audio.addEventListener('play', () => { updatePlayUi(); updatePositionState(); });
audio.addEventListener('pause', () => { updatePlayUi(); saveProgress(true); });
audio.addEventListener('seeked', () => { updateTimeUi(); updatePositionState(); });
audio.addEventListener('ratechange', updatePositionState);
audio.addEventListener('ended', () => { saveProgress(true); render(); });
audio.addEventListener('error', () => { if (state.now) toast(`${t('error')}: audio ${audio.error ? audio.error.code : ''}`); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveProgress(true, true); });
window.addEventListener('pagehide', () => saveProgress(true, true));

// ----------------------------------------------------------------- render

function render() {
  let html = '';
  switch (state.screen) {
    case 'loading': html = '<p class="muted center" style="margin-top:40vh">…</p>'; break;
    case 'error': html = renderError(); break;
    case 'locked': html = renderLocked(); break;
    case 'profiles': html = renderProfiles(); break;
    case 'home': html = shell(renderHome()); break;
    case 'library': html = shell(renderLibrary()); break;
    case 'book': html = shell(renderBook()); break;
    case 'search': html = shell(renderSearch()); break;
    case 'settings': html = shell(renderSettings()); break;
  }
  if (state.playerOpen && state.now) html += renderPlayer();
  if (state.sheet) html += renderSheet();
  const active = document.activeElement;
  const keepFocus = active && active.id === 'q' ? { start: active.selectionStart, end: active.selectionEnd } : null;
  app.innerHTML = html;
  if (keepFocus) {
    const input = document.getElementById('q');
    if (input) { input.focus(); input.setSelectionRange(keepFocus.start, keepFocus.end); }
  }
  updatePlayUi();
  updateTimeUi();
  if (state.sheet && state.sheet.type === 'chapters') {
    const current = app.querySelector('.sheet .track.current');
    if (current) current.scrollIntoView({ block: 'center' });
  }
}

function shell(content) {
  const mini = state.now ? renderMini() : '';
  return `<div class="screen ${state.now ? 'with-mini' : ''}">${content}</div>${mini}${renderNav()}`;
}

function renderNav() {
  const items = [['home', 'home'], ['library', 'library'], ['search', 'search'], ['settings', 'settings']];
  return `<nav class="nav">${items.map(([screen, icon]) => `
    <button data-action="nav" data-screen="${screen}" class="${state.screen === screen || (screen === 'library' && state.screen === 'book') ? 'active' : ''}">${ICON[icon]}<span>${esc(t(screen))}</span></button>`).join('')}</nav>`;
}

function renderError() {
  return `<div class="locked"><h1>${esc(t('error'))}</h1><p class="muted">${esc(t('loadError'))}</p><button class="primary" data-action="reload">${esc(t('retry'))}</button></div>`;
}
function renderLocked() {
  return `<div class="locked"><img class="hero" src="/img/nook-pixel.png" alt=""><h1>${esc(t('locked'))}</h1><p class="muted" style="max-width:340px">${esc(t('lockedHint'))}</p></div>`;
}

function avatarHtml(user, cls = 'avatar') {
  if (user.has_avatar) return `<span class="${cls}"><img src="/media/avatar/${user.id}?v=${state.avatarVersion}" alt=""></span>`;
  return `<span class="${cls}" style="background:${esc(user.color)}">${esc(initials(user.name))}</span>`;
}

function renderProfiles() {
  return `<div class="profiles">
    <img class="hero" src="/img/nook-pixel.png" alt="Mr. Nook">
    <h1>${esc(t('whoListens'))}</h1>
    <div class="profile-grid">
      ${state.users.map((u) => `
        <div class="profile">
          <button class="ghost" style="padding:0;display:flex;flex-direction:column;align-items:center;gap:10px;color:inherit" data-action="select-user" data-id="${u.id}">
            ${avatarHtml(u)}<span style="font-weight:700">${esc(u.name)}</span>
          </button>
          <button class="edit" data-action="edit-avatar" data-id="${u.id}" aria-label="${esc(t('editPicture'))}">${ICON.pencil}</button>
        </div>`).join('')}
    </div>
  </div>`;
}

// Tiles and the mini player pull the small thumbnail; large artwork only where it shows.
function coverHtml(book, cls = 'cover') {
  const big = cls === 'cover-large';
  if (book.has_cover) return `<img class="${cls}" src="/media/${esc(book.id)}/${big ? 'cover' : 'thumb'}" alt="" loading="lazy" decoding="async">`;
  return `<div class="${cls}">${esc(initials(book.title))}</div>`;
}
function pctOf(book) {
  const duration = Number(book.duration_sec) || 0;
  const pos = Number(book.position_sec ?? book.progress?.position_sec) || 0;
  const finished = book.finished ?? book.progress?.finished;
  if (finished) return 100;
  return duration > 0 ? Math.min(100, Math.round((pos / duration) * 100)) : 0;
}
function tileHtml(book) {
  const pct = pctOf(book);
  return `<button class="tile" data-action="open-book" data-id="${esc(book.id)}">
    ${coverHtml(book)}
    <div class="title">${esc(book.title)}</div>
    <div class="muted small">${esc(book.author || '')}</div>
    ${pct > 0 ? `<div class="progress"><span style="width:${pct}%"></span></div>` : ''}
  </button>`;
}

// ---- home

function renderHome() {
  const u = state.user;
  const books = state.books;
  const continueBook = books.find((b) => b.position_sec > 0 && !b.finished && b.last_played > 0) || books.find((b) => b.position_sec > 0 && !b.finished);
  const recentlyAdded = [...books].sort((a, b) => b.created_at - a.created_at).slice(0, 10);
  const recentlyPlayed = books.filter((b) => b.last_played > 0 && b.position_sec > 0 && (!continueBook || b.id !== continueBook.id)).sort((a, b) => b.last_played - a.last_played).slice(0, 10);
  const favorites = books.filter((b) => b.favorite);

  let hero;
  if (!books.length) {
    hero = `<div class="empty card"><img class="hero small" src="/img/nook-pixel.png" alt=""><p><strong>${esc(t('emptyNook'))}</strong></p><button class="primary" data-action="sheet-add">${esc(t('addFirst'))}</button></div>`;
  } else if (continueBook) {
    const chapterIdx = state.now && state.now.id === continueBook.id ? chapterIndexAt(state.now, currentPos()) : -1;
    const chapterLine = chapterIdx >= 0 ? chapterTitle(state.now, chapterIdx) : (continueBook.chapter_count ? '' : fmtDuration(Math.max(0, continueBook.duration_sec - continueBook.position_sec)) + ' ' + t('left'));
    hero = `<section class="section" style="margin-top:0">
      <div class="section-head"><h2>${esc(t('continueListening'))}</h2></div>
      <div class="continue" role="button" data-action="open-book" data-id="${esc(continueBook.id)}">
        ${coverHtml(continueBook)}
        <div>
          <div class="title">${esc(continueBook.title)}</div>
          <div class="muted small">${esc(continueBook.author || '')}</div>
          <div class="muted small" style="margin-top:4px">${esc(chapterLine)}</div>
          <div class="progress" style="margin-top:8px"><span style="width:${pctOf(continueBook)}%"></span></div>
          <button class="play" data-action="play-book" data-id="${esc(continueBook.id)}" aria-label="${esc(t('play'))}">${ICON.play}</button>
        </div>
      </div>
    </section>`;
  } else {
    hero = `<div class="empty card"><img class="hero small" src="/img/nook-pixel.png" alt=""><p class="muted">${esc(t('pickSomething'))}</p></div>`;
  }

  const shelf = (title, list) => list.length ? `<section class="section"><div class="section-head"><h2>${esc(title)}</h2></div><div class="shelf">${list.map(tileHtml).join('')}</div></section>` : '';

  return `<header class="topbar">
      <div><div class="muted small">${esc(greeting())}, ${esc(u.name)}</div><img class="logo" src="/img/nook-pixel.png" alt="Mr. Nook"></div>
      <button class="avatar" data-action="switch-user" aria-label="${esc(t('switchProfile'))}" style="background:${esc(u.color)}">${u.has_avatar ? `<img src="/media/avatar/${u.id}?v=${state.avatarVersion}" alt="">` : esc(initials(u.name))}</button>
    </header>
    ${hero}
    ${shelf(t('recentlyAdded'), recentlyAdded)}
    ${shelf(t('recentlyPlayed'), recentlyPlayed)}
    ${shelf(t('favorites'), favorites)}`;
}

// ---- library

function sortedBooks(list) {
  const by = settings.libSort;
  const copy = [...list];
  const cmpText = (a, b) => String(a || '').localeCompare(String(b || ''), state.lang);
  switch (by) {
    case 'title': return copy.sort((a, b) => cmpText(a.title, b.title));
    case 'author': return copy.sort((a, b) => cmpText(a.author, b.author) || cmpText(a.title, b.title));
    case 'added': return copy.sort((a, b) => b.created_at - a.created_at);
    case 'progress': return copy.sort((a, b) => pctOf(b) - pctOf(a));
    default: return copy.sort((a, b) => (b.last_played || 0) - (a.last_played || 0) || b.created_at - a.created_at);
  }
}
function filteredBooks() {
  let list = state.books;
  if (state.libFilter === 'progress') list = list.filter((b) => b.position_sec > 0 && !b.finished);
  if (state.libFilter === 'finished') list = list.filter((b) => b.finished);
  if (state.libFilter === 'favorites') list = list.filter((b) => b.favorite);
  return sortedBooks(list);
}
function listItemHtml(book) {
  const pct = pctOf(book);
  return `<button class="item-book" data-action="open-book" data-id="${esc(book.id)}">
    ${coverHtml(book)}
    <div style="min-width:0">
      <div class="title">${esc(book.title)}</div>
      <div class="muted small">${esc(book.author || '')}</div>
      <div class="progress" style="margin-top:6px"><span style="width:${pct}%"></span></div>
    </div>
    ${book.finished ? `<span class="badge done">${ICON.check}</span>` : `<span class="badge">${pct} %</span>`}
  </button>`;
}
function renderLibrary() {
  const list = filteredBooks();
  const filters = [['all', t('all')], ['progress', t('inProgress')], ['finished', t('finished')], ['favorites', t('favorites')]];
  let body;
  if (!state.books.length) {
    body = `<div class="empty"><img class="hero small" src="/img/nook-pixel.png" alt=""><p><strong>${esc(t('emptyNook'))}</strong></p><button class="primary" data-action="sheet-add">${esc(t('addFirst'))}</button></div>`;
  } else if (!list.length) {
    body = `<div class="empty"><p class="muted">${esc(t('nothingInFilter'))}</p></div>`;
  } else if (settings.libView === 'list') {
    body = `<div class="list">${list.map(listItemHtml).join('')}</div>`;
  } else {
    body = `<div class="grid">${list.map(tileHtml).join('')}</div>`;
  }
  return `<header class="topbar">
      <h1>${esc(t('library'))}</h1>
      <div class="row" style="gap:6px">
        <button class="icon ghost" data-action="sheet-add" aria-label="${esc(t('addAudiobook'))}">${ICON.plus}</button>
        <button class="icon ghost" data-action="toggle-view" aria-label="view">${settings.libView === 'grid' ? ICON.list : ICON.grid}</button>
        <button class="icon ghost" data-action="sheet-sort" aria-label="${esc(t('sortBy'))}">${ICON.sort}</button>
      </div>
    </header>
    <div class="chips scroll" style="margin-bottom:16px">${filters.map(([k, label]) => `<button data-action="filter" data-filter="${k}" class="${state.libFilter === k ? 'active' : ''}">${esc(label)}</button>`).join('')}</div>
    ${body}`;
}

// ---- book detail

const INLINE_CHAPTERS = 25;

function eqHtml(playing) {
  return `<span class="eq ${playing ? '' : 'paused'}"><span></span><span></span><span></span></span>`;
}

function trackHtml(book, i, currentIdx, isNow, playing) {
  const c = book.chapters[i];
  return `<button class="track ${i === currentIdx ? 'current' : ''}" data-action="play-chapter" data-id="${esc(book.id)}" data-sec="${Number(c.start_sec)}"${i === currentIdx ? ' data-current="1"' : ''}>
      <span class="n">${i === currentIdx && isNow ? eqHtml(playing) : i + 1}</span>
      <span>${esc(c.title || t('chapterN', i + 1))}</span>
      <span class="len">${fmtTime(chapterLength(book, i))}</span>
    </button>`;
}

function renderBook() {
  const b = state.detail;
  if (!b) return `<header class="topbar"><button class="icon ghost" data-action="back">${ICON.back}</button></header><p class="muted center">…</p>`;
  const progress = b.progress || {};
  const duration = Number(b.duration_sec) || 0;
  const pos = state.now && state.now.id === b.id ? currentPos() : Number(progress.position_sec) || 0;
  const pct = progress.finished ? 100 : duration > 0 ? Math.round((pos / duration) * 100) : 0;
  const isNow = state.now && state.now.id === b.id;
  const playing = isNow && !audio.paused && !audio.ended;
  const label = playing ? t('pause') : progress.finished ? t('startOver') : pos > 0 ? t('resume') : t('play');
  const currentIdx = isNow ? chapterIndexAt(b, pos) : chapterIndexAt(b, pos);

  // Long chapter lists stay in the bottom sheet; the page shows a preview.
  const total = b.chapters.length;
  const shown = total > INLINE_CHAPTERS ? INLINE_CHAPTERS : total;
  const from = total > INLINE_CHAPTERS && currentIdx > INLINE_CHAPTERS - 4 ? Math.min(currentIdx - 2, total - shown) : 0;
  const chapters = total
    ? b.chapters.slice(from, from + shown).map((c, i) => trackHtml(b, from + i, currentIdx, isNow, playing)).join('')
    : `<button class="track ${isNow ? 'current' : ''}" data-action="play-chapter" data-id="${esc(b.id)}" data-sec="-1">
        <span class="n">${isNow ? eqHtml(playing) : 1}</span>
        <span>${esc(t('fullBook'))}</span><span class="len">${fmtTime(duration)}</span>
      </button>`;
  const moreChapters = total > shown
    ? `<button class="ghost" style="width:100%;margin-top:8px" data-action="sheet-chapters" data-id="${esc(b.id)}">${esc(t('showAllChapters', total))}</button>`
    : '';

  const bookmarks = b.bookmarks.length ? `<section class="section"><div class="section-head"><h2>${esc(t('bookmarks'))}</h2><span class="muted small">${b.bookmarks.length}</span></div><div class="list">${b.bookmarks.map((bm) => bookmarkHtml(b, bm)).join('')}</div></section>` : '';

  return `<header class="topbar">
      <button class="icon ghost" data-action="back" aria-label="${esc(t('back'))}">${ICON.back}</button>
      <button class="icon ghost ${progress.favorite ? 'on' : ''}" data-action="fav" data-id="${esc(b.id)}" aria-label="${esc(t('favorite'))}" style="${progress.favorite ? 'color:var(--terracotta)' : ''}">${progress.favorite ? ICON.heart.replace('<svg', '<svg style="fill:currentColor"') : ICON.heart}</button>
    </header>
    <div class="detail">
      ${coverHtml(b, 'cover-large')}
      <div class="center">
        <h1 style="font-size:22px">${esc(b.title)}</h1>
        <div class="muted">${esc(b.author || '')}</div>
        <div class="muted small" style="margin-top:6px">${pct} % · ${esc(fmtDuration(Math.max(0, duration - pos)))} ${esc(t('left'))}${progress.finished ? ` · ${esc(t('finished'))}` : ''}</div>
      </div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <button class="primary big-play" data-action="play-book" data-id="${esc(b.id)}">${playing ? ICON.pause : ICON.play}<span>${esc(label)}</span></button>
      <div class="actions">
        <button class="${progress.favorite ? 'on' : ''}" data-action="fav" data-id="${esc(b.id)}">${ICON.heart}${esc(t('favorite'))}</button>
        <button class="${progress.finished ? 'on' : ''}" data-action="toggle-finished" data-id="${esc(b.id)}">${ICON.check}${esc(progress.finished ? t('markUnfinished') : t('markFinished'))}</button>
        <button data-action="restart" data-id="${esc(b.id)}">${ICON.restart}${esc(t('restart'))}</button>
      </div>
      ${bookmarks}
      <section class="section" style="margin-top:8px">
        <div class="section-head"><h2>${esc(t('chapters'))}</h2><span class="muted small">${total || 1}</span></div>
        <div class="tracklist">${chapters}</div>
        ${moreChapters}
      </section>
    </div>`;
}

function bookmarkHtml(book, bm) {
  const idx = chapterIndexAt(book, bm.position_sec);
  const sub = idx >= 0 ? chapterTitle(book, idx) : '';
  return `<div class="bookmark">
    <button class="jump" data-action="play-chapter" data-id="${esc(book.id)}" data-sec="${Number(bm.position_sec)}">${fmtTime(bm.position_sec)}${sub ? `<small>${esc(sub)}</small>` : ''}</button>
    <input data-bookmark="${bm.id}" value="${esc(bm.note)}" placeholder="${esc(t('notePlaceholder'))}" maxlength="500">
    <button class="del" data-action="delete-bookmark" data-id="${bm.id}" aria-label="${esc(t('delete'))}">${ICON.close}</button>
  </div>`;
}

// ---- search

let searchTimer;
function runSearch(query) {
  state.query = query;
  clearTimeout(searchTimer);
  if (!query.trim()) { state.results = null; return render(); }
  searchTimer = setTimeout(async () => {
    try {
      const results = await api(`/search?user=${state.user.id}&q=${encodeURIComponent(query.trim())}`);
      if (state.query === query) { state.results = results; render(); }
    } catch { /* ignore */ }
  }, 180);
}
function renderSearch() {
  let body = '';
  if (state.results === null) body = '';
  else if (!state.results.length) body = `<div class="empty"><img class="hero small" src="/img/nook-pixel.png" alt=""><p class="muted">${esc(t('nothingHere'))}</p></div>`;
  else body = `<div class="list">${state.results.map(listItemHtml).join('')}</div>`;
  return `<header class="topbar"><h1>${esc(t('search'))}</h1></header>
    <div class="searchbox">${ICON.search}<input id="q" type="search" autocomplete="off" placeholder="${esc(t('searchPlaceholder'))}" value="${esc(state.query)}"></div>
    <div style="margin-top:16px">${body}</div>`;
}

// ---- settings

function inviteUrl(token) {
  return `${location.origin}/einladung/${token}`;
}

function renderInviteRows() {
  if (state.invites === null) return '';
  const open = state.invites.filter((i) => !i.used_at && i.expires_at > Date.now());
  if (!open.length) return `<div class="setting"><span class="hint">${esc(t('noInvites'))}</span></div>`;
  return open.map((i) => `<div class="setting">
      <div style="min-width:0">
        <div class="label">${esc(i.label || t('openInvites'))}</div>
        <div class="hint" style="word-break:break-all">${esc(inviteUrl(i.token))}</div>
      </div>
      <div class="row" style="gap:6px;flex:none">
        <button class="link" data-action="copy-invite" data-token="${esc(i.token)}">${esc(t('copyLink'))}</button>
        <button class="link" style="color:var(--terracotta)" data-action="revoke-invite" data-token="${esc(i.token)}">${esc(t('revoke'))}</button>
      </div>
    </div>`).join('');
}

async function loadInvites() {
  try {
    state.invites = await api('/invites');
    render();
  } catch { /* ignore */ }
}

async function createInvite() {
  const label = prompt(t('inviteFor'), 'Katie');
  if (label === null) return;
  try {
    const invite = await api('/invites', { method: 'POST', body: { label: label.trim(), days: 14 } });
    state.invites = [invite, ...(state.invites || [])];
    render();
    await copyInvite(invite.token);
  } catch (err) {
    toast(`${t('error')}: ${err.message}`);
  }
}

async function copyInvite(token) {
  const url = inviteUrl(token);
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Mr. Nook', text: 'Dein Zugang zu Mr. Nook', url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast(t('copied'));
  } catch {
    toast(url);
  }
}

function revokeInvite(token) {
  state.invites = (state.invites || []).filter((i) => i.token !== token);
  render();
  api(`/invites/${token}`, { method: 'DELETE' }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

function renderSettings() {
  const u = state.user;
  const seg = (name, options, current) => `<div class="segment">${options.map(([value, label]) => `<button data-action="set-${name}" data-value="${value}" class="${String(current) === String(value) ? 'active' : ''}">${esc(label)}</button>`).join('')}</div>`;
  const select = (name, options, current, unit) => `<select data-setting="${name}">${options.map((o) => `<option value="${o}" ${o === current ? 'selected' : ''}>${o}${unit}</option>`).join('')}</select>`;
  return `<header class="topbar"><h1>${esc(t('settings'))}</h1></header>
    <h3 class="muted" style="margin-top:6px">${esc(t('playback'))}</h3>
    <div class="settings-group">
      <div class="setting"><span class="label">${esc(t('defaultSpeed'))}</span>${select('speed', SPEEDS, settings.speed, '×')}</div>
      <div class="setting"><span class="label">${esc(t('skipBack'))}</span>${select('skipBack', SKIP_BACK_OPTIONS, settings.skipBack, ' s')}</div>
      <div class="setting"><span class="label">${esc(t('skipForward'))}</span>${select('skipFwd', SKIP_FWD_OPTIONS, settings.skipFwd, ' s')}</div>
      <div class="setting"><span class="label">${esc(t('autoResume'))}</span><button class="switch ${settings.autoResume ? 'on' : ''}" data-action="toggle-autoresume" aria-label="${esc(t('autoResume'))}"></button></div>
    </div>
    <h3 class="muted" style="margin-top:22px">${esc(t('appearance'))}</h3>
    <div class="settings-group">
      <div class="setting"><span class="label">${esc(t('theme'))}</span>${seg('theme', [['light', t('light')], ['dark', t('dark')], ['system', t('system')]], settings.theme)}</div>
      <div class="setting"><span class="label">${esc(t('language'))}</span>${seg('lang', [['de', 'Deutsch'], ['en', 'English']], state.lang)}</div>
    </div>
    <h3 class="muted" style="margin-top:22px">${esc(t('profile'))}</h3>
    <div class="settings-group">
      <div class="setting"><div class="row">${avatarHtml(u)}<span class="label">${esc(u.name)}</span></div><button class="link" data-action="edit-avatar" data-id="${u.id}">${esc(t('changePicture'))}</button></div>
      <div class="setting"><span class="label">${esc(t('switchProfile'))}</span><button class="link" data-action="switch-user">${esc(t('switchProfile'))}</button></div>
    </div>
    <h3 class="muted" style="margin-top:22px">${esc(t('invites'))}</h3>
    <div class="settings-group">
      <div class="setting"><div><div class="label">${esc(t('newInvite'))}</div><div class="hint">${esc(t('inviteHint'))}</div></div><button class="link" data-action="new-invite">${esc(t('newInvite'))}</button></div>
      ${renderInviteRows()}
    </div>
    <h3 class="muted" style="margin-top:22px">${esc(t('libraryHeading'))}</h3>
    <div class="settings-group">
      <div class="setting"><span class="label">${esc(t('addAudiobook'))}</span><button class="link" data-action="sheet-add">${esc(t('addAudiobook'))}</button></div>
      <div class="setting"><span class="label">${esc(t('refreshLibrary'))}</span><button class="link" data-action="refresh">${esc(t('refreshLibrary'))}</button></div>
      <div class="setting"><span class="label">${esc(t('clearCache'))}</span><button class="link" data-action="clear-cache">${esc(t('clearCache'))}</button></div>
    </div>
    <h3 class="muted" style="margin-top:22px">${esc(t('about'))}</h3>
    <div class="settings-group">
      <div class="setting"><div class="row"><img src="/icons/icon-192.png" width="40" height="40" style="border-radius:10px" alt=""><div><div class="label">Mr. Nook</div><div class="hint">${esc(t('version'))} ${APP_VERSION}</div></div></div></div>
      <div class="setting"><span class="label">${esc(t('sourceCode'))}</span><a href="${GITHUB_URL}" target="_blank" rel="noopener">GitHub</a></div>
      <div class="setting"><div><div class="label">${esc(t('licenses'))}</div><div class="hint">${esc(t('licensesText'))}</div></div></div>
    </div>`;
}

// ---- mini player & full player

function renderMini() {
  const b = state.now;
  const idx = chapterIndexAt(b, currentPos());
  return `<div class="mini" role="button" data-action="open-player">
    <span class="bar" id="mini-bar"></span>
    ${coverHtml(b)}
    <div class="text"><div style="font-weight:700">${esc(b.title)}</div><div class="muted small" id="mini-sub">${esc(idx >= 0 ? chapterTitle(b, idx) : b.author || '')}</div></div>
    <button class="icon" data-action="toggle-play" data-play-button aria-label="${esc(t('play'))}">${ICON.play}</button>
  </div>`;
}

function renderPlayer() {
  const b = state.now;
  const duration = bookDuration(b);
  const idx = chapterIndexAt(b, currentPos());
  return `<section class="player" id="player">
    <div class="inner">
      <header class="topbar" style="margin-bottom:0">
        <button class="icon ghost" data-action="close-player" aria-label="${esc(t('close'))}">${ICON.down}</button>
        <span class="muted small">${esc(t('nowPlaying'))}</span>
        <button class="icon ghost" data-action="open-book-now" aria-label="${esc(b.title)}">${ICON.chapters}</button>
      </header>
      ${coverHtml(b, 'cover-large')}
      <div class="center">
        <h2>${esc(b.title)}</h2>
        <div class="muted">${esc(b.author || '')}</div>
        <div class="muted small chapter-now" id="chapter-now">${esc(idx >= 0 ? chapterTitle(b, idx) : '')}</div>
      </div>
      <div class="seek">
        <input type="range" id="seek" min="0" max="${Math.max(1, Math.floor(duration))}" step="1" value="${Math.floor(currentPos())}" aria-label="seek">
        <div class="times small muted">
          <span id="time-elapsed">${fmtTime(currentPos())}</span>
          <span id="time-percent"></span>
          <button data-action="toggle-total" id="time-remaining"></button>
        </div>
      </div>
      <div class="controls">
        <button class="icon skip" data-action="skip" data-delta="-${settings.skipBack}" aria-label="-${settings.skipBack}s">${ICON.skipBack}<small>${settings.skipBack}</small></button>
        <button class="icon big" data-action="toggle-play" data-play-button aria-label="${esc(t('play'))}">${ICON.play}</button>
        <button class="icon skip" data-action="skip" data-delta="${settings.skipFwd}" aria-label="+${settings.skipFwd}s">${ICON.skipFwd}<small>${settings.skipFwd}</small></button>
      </div>
      <div class="toolbar">
        <button data-action="sheet-chapters" data-id="${esc(b.id)}" ${b.chapters.length ? '' : 'disabled'}>${ICON.chapters}<span>${esc(t('chapters'))}</span></button>
        <button data-action="sheet-sleep" class="${sleepActive() ? 'on' : ''}">${ICON.moon}<span id="sleep-label">${esc(sleepLabel())}</span></button>
        <button data-action="sheet-speed">${ICON.gauge}<span>${settings.speed}×</span></button>
        <button data-action="add-bookmark">${ICON.bookmark}<span>${esc(t('addBookmark'))}</span></button>
      </div>
    </div>
  </section>`;
}

// ---- sheets

function renderSheet() {
  const s = state.sheet;
  let body = '';
  if (s.type === 'chapters') {
    const book = [state.now, state.detail].find((b) => b && b.id === s.bookId) || state.now;
    if (!book) return '';
    const isNow = state.now && state.now.id === book.id;
    const idx = chapterIndexAt(book, isNow ? currentPos() : Number(book.progress?.position_sec) || 0);
    const playing = isNow && !audio.paused && !audio.ended;
    body = `<h3>${esc(t('chapters'))} <span class="muted small">${book.chapters.length}</span></h3>
      <div class="tracklist">${book.chapters.map((c, i) => trackHtml(book, i, idx, isNow, playing).replace('data-action="play-chapter"', 'data-action="play-chapter" data-close="1"')).join('')}</div>`;
  } else if (s.type === 'sleep') {
    body = `<img class="mascot" src="/img/nook-pixel.png" alt=""><h3 class="center">${esc(t('sleepTimer'))}</h3>
      <p class="muted small center" style="margin-top:0">${esc(t('sleepHint'))}</p>
      <div class="chips" style="justify-content:center">
        <button data-action="sleep" data-min="0" class="${sleepActive() ? '' : 'active'}">${esc(t('off'))}</button>
        ${SLEEP_MINUTES.map((m) => `<button data-action="sleep" data-min="${m}" class="${state.sleep.minutes === m ? 'active' : ''}">${m} ${esc(t('minutes'))}</button>`).join('')}
        ${state.now && state.now.chapters.length ? `<button data-action="sleep" data-min="-1" class="${state.sleep.endOfChapter ? 'active' : ''}">${esc(t('endOfChapter'))}</button>` : ''}
      </div>`;
  } else if (s.type === 'speed') {
    body = `<h3 class="center">${esc(t('speed'))}</h3><div class="speed-value">${settings.speed}×</div>
      <input type="range" id="speed-slider" min="0.5" max="3" step="0.05" value="${settings.speed}" style="--pct:${((settings.speed - 0.5) / 2.5) * 100}%">
      <div class="chips" style="justify-content:center;margin-top:12px">${SPEEDS.map((v) => `<button data-action="speed" data-value="${v}" class="${settings.speed === v ? 'active' : ''}">${v}×</button>`).join('')}</div>`;
  } else if (s.type === 'sort') {
    const options = [['lastPlayed', t('sortLastPlayed')], ['added', t('sortAdded')], ['title', t('sortTitle')], ['author', t('sortAuthor')], ['progress', t('sortProgress')]];
    body = `<h3>${esc(t('sortBy'))}</h3>${options.map(([k, label]) => `<button class="option ${settings.libSort === k ? 'active' : ''}" data-action="sort" data-value="${k}"><span>${esc(label)}</span>${settings.libSort === k ? ICON.check : ''}</button>`).join('')}`;
  } else if (s.type === 'add') {
    body = `<h3>${esc(t('addAudiobook'))}</h3><p class="muted small" style="margin-top:0">${esc(t('addHint'))}</p>
      <code>cd ~/mr-nook\nnode scripts/books.mjs add "/path/book.mp3" --cover "/path/cover.jpg"</code>`;
  } else if (s.type === 'avatar') {
    const user = state.users.find((u) => u.id === s.userId);
    if (!user) return '';
    body = `<h3 class="center">${esc(t('editPicture'))}</h3>
      <div class="center" style="margin-bottom:14px">${avatarHtml(user, 'avatar').replace('class="avatar"', 'class="avatar" style="width:96px;height:96px;font-size:38px;margin:0 auto;background:' + esc(user.color) + '"')}<div style="font-weight:700;margin-top:8px">${esc(user.name)}</div></div>
      <div class="chips" style="justify-content:center">
        <label class="primary" style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:999px;background:var(--sage);color:var(--sage-ink);font-weight:700;cursor:pointer">${esc(t('choosePhoto'))}<input type="file" accept="image/*" data-avatar-file="${user.id}" style="display:none"></label>
        ${user.has_avatar ? `<button data-action="remove-avatar" data-id="${user.id}">${esc(t('removePhoto'))}</button>` : ''}
      </div>
      <p class="muted small center" style="margin:16px 0 8px">${esc(t('pickColor'))}</p>
      <div class="swatches" style="justify-content:center">${PALETTE.map((c) => `<button class="swatch ${user.color === c ? 'active' : ''}" data-action="color" data-id="${user.id}" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>`;
  }
  return `<div class="scrim" data-action="close-sheet"></div><div class="sheet"><div class="grip"></div><div class="inner">${body}</div></div>`;
}

// ---- live UI updates (no re-render)

function updatePlayUi() {
  const playing = !audio.paused && !audio.ended && !!state.now;
  app.querySelectorAll('[data-play-button]').forEach((btn) => {
    btn.innerHTML = playing ? ICON.pause : ICON.play;
    btn.setAttribute('aria-label', playing ? t('pause') : t('play'));
  });
  app.querySelectorAll('.eq').forEach((el) => el.classList.toggle('paused', !playing));
}

function updateTimeUi() {
  if (!state.now) return;
  const duration = bookDuration(state.now);
  const pos = currentPos();
  const pct = duration > 0 ? Math.min(100, (pos / duration) * 100) : 0;
  const seek = document.getElementById('seek');
  if (seek && !state.seeking) {
    if (duration > 0 && Number(seek.max) !== Math.floor(duration)) seek.max = String(Math.floor(duration));
    seek.value = String(Math.floor(pos));
    seek.style.setProperty('--pct', `${pct}%`);
  }
  const elapsed = document.getElementById('time-elapsed');
  if (elapsed) elapsed.textContent = fmtTime(pos);
  const remaining = document.getElementById('time-remaining');
  if (remaining) remaining.textContent = state.showTotal ? `${fmtTime(duration)} ${t('total')}` : `-${fmtTime(Math.max(0, (duration - pos) / (audio.playbackRate || 1)))} ${t('left')}`;
  const percent = document.getElementById('time-percent');
  if (percent) percent.textContent = `${pct.toFixed(1)} %`;
  const idx = chapterIndexAt(state.now, pos);
  const chapterNow = document.getElementById('chapter-now');
  if (chapterNow) chapterNow.textContent = idx >= 0 ? chapterTitle(state.now, idx) : '';
  const miniBar = document.getElementById('mini-bar');
  if (miniBar) miniBar.style.width = `${pct}%`;
  const miniSub = document.getElementById('mini-sub');
  if (miniSub) miniSub.textContent = idx >= 0 ? chapterTitle(state.now, idx) : `${fmtTime(pos)} · ${pct.toFixed(0)} %`;
}

let toastTimer;
function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

// ----------------------------------------------------------------- events

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  // Buttons inside a clickable container (mini player, continue card) act on their own.
  if (action !== 'open-player' && event.target.closest('.mini') && action === 'toggle-play') event.stopPropagation();
  switch (action) {
    case 'reload': location.reload(); break;
    case 'nav': go(target.dataset.screen); break;
    case 'back': history.length > 1 ? history.back() : go('library'); break;
    case 'select-user': selectUser(state.users.find((u) => String(u.id) === id)); break;
    case 'switch-user': state.screen = 'profiles'; state.playerOpen = false; render(); break;
    case 'edit-avatar': openSheet({ type: 'avatar', userId: Number(id) }); break;
    case 'remove-avatar': removeAvatar(Number(id)).catch((err) => toast(`${t('error')}: ${err.message}`)); break;
    case 'color': setUserColor(Number(id), target.dataset.color); break;
    case 'open-book': go('book', id); break;
    case 'open-book-now': closePlayer(); setTimeout(() => go('book', state.now.id), 0); break;
    case 'play-book': {
      event.stopPropagation();
      const book = state.detail && state.detail.id === id ? state.detail : state.books.find((b) => b.id === id);
      if (state.now && state.now.id === id) { togglePlay(); break; }
      const finished = book && (book.progress ? book.progress.finished : book.finished);
      loadIntoPlayer(id, { autoplay: true, startAt: finished ? 0 : undefined }).then(() => { if (state.screen !== 'book') openPlayer(); }).catch((err) => toast(`${t('error')}: ${err.message}`));
      break;
    }
    case 'play-chapter': {
      const sec = Number(target.dataset.sec);
      const start = sec < 0 ? undefined : sec;
      if (target.dataset.close) closeSheet();
      loadIntoPlayer(id, { autoplay: true, startAt: start }).catch((err) => toast(`${t('error')}: ${err.message}`));
      break;
    }
    case 'fav': toggleFavorite(state.detail && state.detail.id === id ? state.detail : state.books.find((b) => b.id === id)); break;
    case 'toggle-finished': markFinished(state.detail, !(state.detail.progress && state.detail.progress.finished)); break;
    case 'restart': restartBook(state.detail); break;
    case 'open-player': openPlayer(); break;
    case 'close-player': closePlayer(); break;
    case 'toggle-play': togglePlay(); break;
    case 'skip': skip(Number(target.dataset.delta)); break;
    case 'toggle-total': state.showTotal = !state.showTotal; updateTimeUi(); break;
    case 'sheet-chapters': openSheet({ type: 'chapters', bookId: id || (state.now && state.now.id) }); break;
    case 'sheet-sleep': openSheet({ type: 'sleep' }); break;
    case 'sheet-speed': openSheet({ type: 'speed' }); break;
    case 'sheet-sort': openSheet({ type: 'sort' }); break;
    case 'sheet-add': openSheet({ type: 'add' }); break;
    case 'close-sheet': closeSheet(); break;
    case 'sleep': setSleep(Number(target.dataset.min)); break;
    case 'speed': setSpeed(Number(target.dataset.value)); break;
    case 'sort': settings.libSort = target.dataset.value; saveSettings(); closeSheet(); break;
    case 'filter': state.libFilter = target.dataset.filter; render(); break;
    case 'toggle-view': settings.libView = settings.libView === 'grid' ? 'list' : 'grid'; saveSettings(); render(); break;
    case 'add-bookmark': addBookmark(); break;
    case 'delete-bookmark': deleteBookmark(Number(id)); break;
    case 'set-theme': settings.theme = target.dataset.value; saveSettings(); render(); break;
    case 'set-lang': {
      state.lang = target.dataset.value;
      state.user.lang = state.lang;
      api(`/users/${state.user.id}`, { method: 'PATCH', body: { lang: state.lang } }).catch(() => {});
      render();
      break;
    }
    case 'toggle-autoresume': settings.autoResume = !settings.autoResume; saveSettings(); render(); break;
    case 'new-invite': createInvite(); break;
    case 'copy-invite': copyInvite(target.dataset.token); break;
    case 'revoke-invite': revokeInvite(target.dataset.token); break;
    case 'refresh': loadLibrary().then(() => { render(); toast('✓'); }).catch((err) => toast(`${t('error')}: ${err.message}`)); break;
    case 'clear-cache':
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage('clear-cache');
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => toast(t('cacheCleared'))).catch(() => toast(t('cacheCleared')));
      break;
  }
});

app.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'seek') {
    state.seeking = true;
    const value = Number(el.value);
    const elapsed = document.getElementById('time-elapsed');
    if (elapsed) elapsed.textContent = fmtTime(value);
    const duration = bookDuration(state.now);
    el.style.setProperty('--pct', `${duration > 0 ? (value / duration) * 100 : 0}%`);
  } else if (el.id === 'speed-slider') {
    const v = Math.round(Number(el.value) * 20) / 20;
    settings.speed = v;
    audio.playbackRate = v;
    el.style.setProperty('--pct', `${((v - 0.5) / 2.5) * 100}%`);
    const label = el.parentElement.querySelector('.speed-value');
    if (label) label.textContent = `${v}×`;
  } else if (el.id === 'q') {
    runSearch(el.value);
  }
});

app.addEventListener('change', (event) => {
  const el = event.target;
  if (el.id === 'seek') {
    state.seeking = false;
    seekTo(Number(el.value), false);
  } else if (el.id === 'speed-slider') {
    saveSettings();
    render();
  } else if (el.dataset.bookmark) {
    updateBookmarkNote(Number(el.dataset.bookmark), el.value.trim());
  } else if (el.dataset.setting) {
    settings[el.dataset.setting] = Number(el.value);
    if (el.dataset.setting === 'speed') audio.playbackRate = settings.speed;
    saveSettings();
    render();
  } else if (el.dataset.avatarFile) {
    const file = el.files && el.files[0];
    if (file) uploadAvatar(Number(el.dataset.avatarFile), file).catch((err) => toast(`${t('error')}: ${err.message}`));
  }
});

app.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.dataset.bookmark) event.target.blur();
});

// Swipe down on the player cover closes the player.
let touchStartY = null;
app.addEventListener('touchstart', (event) => {
  const cover = event.target.closest('.player .cover-large');
  touchStartY = cover ? event.touches[0].clientY : null;
}, { passive: true });
app.addEventListener('touchend', (event) => {
  if (touchStartY === null) return;
  const dy = event.changedTouches[0].clientY - touchStartY;
  touchStartY = null;
  if (dy > 90 && state.playerOpen && !state.sheet) closePlayer();
}, { passive: true });

boot().catch(fail);
