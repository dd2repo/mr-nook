// Mr. Nook, a private audiobook player. Vanilla JS, no build step.
// Screens: profiles -> home | library | book | search | settings. Player and sheets are overlays.

const audio = document.getElementById('audio');
const app = document.getElementById('app');

const APP_VERSION = '1.0.0';
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
    home: 'Start',
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
    sortAdded: 'Neu dabei',
    sortProgress: 'Fortschritt',
    emptyNook: 'Dein Nook ist noch ein bisschen leer.',
    addFirst: 'Erstes Hörbuch hinzufügen',
    nothingHere: 'Hier ist noch nichts.',
    nothingInFilter: 'In dieser Ansicht ist nichts.',
    pickSomething: 'Such dir etwas aus der Bibliothek aus.',
    addAudiobook: 'Hörbuch hinzufügen',
    addHint: 'Neue Bücher legt Yannick am Mac ein.',
    searchPlaceholder: 'Titel oder Autor',
    play: 'Abspielen',
    resume: 'Weiterhören',
    startOver: 'Von vorn',
    pause: 'Pause',
    left: 'übrig',
    total: 'gesamt',
    markFinished: 'Als fertig markieren',
    markUnfinished: 'Doch nicht fertig',
    restart: 'Buch von vorn',
    favorite: 'Favorit',
    chapters: 'Kapitel',
    fullBook: 'Ganzes Buch',
    bookmarks: 'Lesezeichen',
    addBookmark: 'Lesezeichen',
    addBookmarkHere: 'Hier Lesezeichen setzen',
    streaming: 'Wird gestreamt',
    downloaded: 'Auf dem Gerät',
    download: 'Herunterladen',
    downloading: 'Lädt',
    cancel: 'Abbrechen',
    removeDownload: 'Vom Gerät löschen',
    downloadDone: 'Steht offline bereit',
    downloadFailed: 'Download fehlgeschlagen',
    downloadRemoved: 'Vom Gerät gelöscht',
    notEnoughSpace: 'Zu wenig Speicher frei',
    offlineHint: 'Offline hörbar, kein Datenverbrauch.',
    offlineMode: 'Offline. Es lassen sich nur heruntergeladene Bücher abspielen.',
    streamHint: 'Wird über das Internet geladen.',
    wishes: 'Wünsche',
    wishBook: 'Buch wünschen',
    wishHint: 'Fehlt dir etwas? Schreib es auf, es landet auf der Liste.',
    wishTitle: 'Titel',
    wishAuthor: 'Autor',
    wishNote: 'Notiz',
    wishSend: 'Auf die Liste',
    wishAdded: 'Steht auf der Liste',
    noWishes: 'Keine offenen Wünsche.',
    wishDeleted: 'Wunsch gelöscht',
    markDone: 'Erledigt',
    reopen: 'Wieder öffnen',
    wishFrom: 'von',
    security: 'Verbindung',
    encrypted: 'Verschlüsselt',
    notEncrypted: 'Nicht verschlüsselt',
    securityHint: 'Streams und Downloads laufen über diese verschlüsselte Verbindung.',
    sleepHistory: 'Einschlaf-Verlauf',
    sleepHistoryHint: 'Alle Zeiten sind Stellen im Buch, keine Uhrzeiten.',
    lastAwakeIn: 'Zuletzt wach bei',
    lastTouched: 'Zuletzt angefasst',
    screenWentDark: 'Handy dunkel',
    timerSetAt: 'Timer gestellt',
    thenSlept: 'Danach verschlafen:',
    thenRan: 'Lief noch',
    untilPos: 'weiter, bis',
    todayAt: 'Heute um',
    yesterdayAt: 'Gestern um',
    show: 'Anzeigen',
    nightRemoved: 'Nacht gelöscht',
    whatWeThought: 'Was wir dazu gesagt haben',
    thisBook: 'Dieses Buch',
    manage: 'Verwalten',
    allBooks: 'Alle Bücher',
    viewToggle: 'Ansicht wechseln',
    chapterShort: 'Kap.',
    refreshed: 'Neu geladen',
    speedSticks: 'Gilt ab jetzt für alle Bücher.',
    searchIdle: 'Tippe los, ich schaue in der Bibliothek nach.',
    awakeAt: 'wach bei',
    ranUntil: 'lief bis',
    timerStopped: 'Timer aus bei',
    chapterModeActive: 'Bleibt beim Kapitelende. Die fünf Minuten gibt es nur beim Timer.',
    noRealChapters: 'Dieses Buch hat keine echten Kapitel.',
    sleptThrough: 'verschlafen',
    toStop: 'Zum Stopp',
    jumpBack: 'Zur wachen Stelle',
    noSleepHistory: 'Noch nichts eingeschlafen.',
    rating: 'Bewertung',
    yourRating: 'Dein Eindruck',
    rateHint: 'Bewerten kannst du, wenn du das Buch durch hast.',
    rateHintUnfinished: 'Du hast das Buch zurück auf ungehört gesetzt. Dein Eindruck bleibt trotzdem stehen.',
    howWasIt: 'Wie war es?',
    sheWrote: 'hat was geschrieben',
    reviewDeleted: 'Eindruck zurückgenommen',
    reviewPlaceholder: 'Deine Notiz …',
    saveReview: 'Speichern',
    reviewSaved: 'Gespeichert',
    deleteReview: 'Zurücknehmen',
    nooks: 'Nooks',
    noReviews: 'Noch keine Bewertungen.',
    reviews: 'Eindrücke',
    searchPlaceholderShort: 'Titel oder Autor',
    hidePlayer: 'Wegwischen',
    restarted: 'Auf Anfang gesetzt',
    downloadBusy: 'Ein Download läuft schon.',
    connectionLost: 'Verbindung abgerissen',
    pickNooksFirst: 'Erst Nooks antippen.',
    prevChapter: 'Kapitel zurück',
    nextChapter: 'Kapitel vor',
    sortRating: 'Bewertung',
    backToAwake: 'Zurück zu',
    pasteLink: 'Einladungslink einfügen',
    unlock: 'Freischalten',
    unlockFailed: 'Damit konnte ich nichts anfangen.',
    inviteUsed: 'Diese Einladung wurde schon benutzt.',
    inviteExpired: 'Diese Einladung ist abgelaufen.',
    history: 'Verlauf',
    historyHint: 'Zuletzt gehört, mit der Stelle, an der der Timer ausging.',
    noHistory: 'Noch nichts gehört.',
    upTo: 'gehört bis',
    rateNow: 'Jetzt bewerten',
    notYet: 'Erst durchhören',
    you: 'Du',
    stats: 'Hörzeit',
    totalListened: 'insgesamt gehört',
    hoursShort: 'Std',
    booksFinished: 'Bücher fertig',
    lastDays: 'die letzten Tage',
    badges: 'Abzeichen',
    noBadges: 'Noch keine. Die erste Stunde reicht schon.',
    nextBadge: 'Als Nächstes:',
    toGo: 'fehlen noch',
    badgeEarned: 'Geschafft!',
    tellOther: 'Zeigen',
    alreadyShared: 'Schon gezeigt',
    badgeShared: 'Ist unterwegs',
    reached: 'hat ein Abzeichen geholt:',
    congratulate: 'Gratulieren',
    cheerSent: 'Gratulation verschickt',
    cheersYou: 'gratuliert dir',
    nice: 'Schön!',
    later: 'Später',
    atRest: 'Die Dateien liegen bei Cloudflare R2 verschlüsselt (AES-256).',
    bookmarkDeleted: 'Lesezeichen gelöscht',
    noBookmarks: 'Noch keine Lesezeichen in diesem Buch.',
    showThem: 'Anzeigen',
    undo: 'Rückgängig',
    bookmarkAdded: 'Lesezeichen gesetzt',
    notePlaceholder: 'Notiz …',
    delete: 'Löschen',
    sleep: 'Einschlafen',
    sleepTimer: 'Einschlaf-Timer',
    off: 'Aus',
    endOfChapter: 'Kapitelende',
    sleepHint: 'Mr. Nook blendet aus und stoppt, wenn die Zeit um ist.',
    speed: 'Tempo',
    playback: 'Wiedergabe',
    defaultSpeed: 'Standard-Tempo',
    skipBack: 'Zurückspringen',
    skipForward: 'Vorspringen',
    autoResume: 'Zuletzt gehörtes Buch beim Start laden',
    appearance: 'Darstellung',
    theme: 'Farben',
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
    sleepIn: (t) => `Aus in ${t}`,
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
    home: 'Start',
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
    addHint: 'New books get added by Yannick on the Mac.',
    searchPlaceholder: 'Title or author',
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
    addBookmarkHere: 'Bookmark this spot',
    streaming: 'Streaming',
    downloaded: 'On this device',
    download: 'Download',
    downloading: 'Downloading',
    cancel: 'Cancel',
    removeDownload: 'Remove from device',
    downloadDone: 'Available offline',
    downloadFailed: 'Download failed',
    downloadRemoved: 'Removed from device',
    notEnoughSpace: 'Not enough free space',
    offlineHint: 'Plays offline, uses no data.',
    offlineMode: 'Offline. Only downloaded books will play.',
    streamHint: 'Loaded over the internet.',
    wishes: 'Wishes',
    wishBook: 'Wish for a book',
    wishHint: 'Missing something? Write it down and it lands on the list.',
    wishTitle: 'Title',
    wishAuthor: 'Author',
    wishNote: 'Note',
    wishSend: 'Add to list',
    wishAdded: 'On the list',
    noWishes: 'No open wishes.',
    wishDeleted: 'Wish deleted',
    markDone: 'Done',
    reopen: 'Reopen',
    wishFrom: 'from',
    security: 'Connection',
    encrypted: 'Encrypted',
    notEncrypted: 'Not encrypted',
    securityHint: 'Streams and downloads run over this encrypted connection.',
    sleepHistory: 'Sleep history',
    sleepHistoryHint: 'All times are places in the book, not times of day.',
    lastAwakeIn: 'Last awake at',
    lastTouched: 'Last touched',
    screenWentDark: 'Screen went dark',
    timerSetAt: 'Timer set',
    thenSlept: 'Slept through:',
    thenRan: 'Ran on for',
    untilPos: 'more, up to',
    todayAt: 'Today at',
    yesterdayAt: 'Yesterday at',
    show: 'Show',
    nightRemoved: 'Night removed',
    whatWeThought: 'What we said about these',
    thisBook: 'This book',
    manage: 'Manage',
    allBooks: 'All books',
    viewToggle: 'Switch view',
    chapterShort: 'Ch.',
    refreshed: 'Reloaded',
    speedSticks: 'Applies to every book from now on.',
    searchIdle: 'Start typing and I will look through the library.',
    awakeAt: 'awake at',
    ranUntil: 'ran until',
    timerStopped: 'timer off at',
    chapterModeActive: 'End of chapter is already set.',
    noRealChapters: 'This book has no real chapters.',
    sleptThrough: 'slept through',
    toStop: 'Where it stopped',
    jumpBack: 'Jump there',
    noSleepHistory: 'No sleep sessions yet.',
    rating: 'Rating',
    yourRating: 'Your rating',
    rateHint: 'You can rate once you have finished the book.',
    rateHintUnfinished: 'You set this book back to unheard. What you wrote stays.',
    howWasIt: 'How was it?',
    sheWrote: 'left a note',
    reviewDeleted: 'Note taken back',
    reviewPlaceholder: 'What did you like?',
    saveReview: 'Save',
    reviewSaved: 'Saved',
    deleteReview: 'Delete rating',
    nooks: 'Nooks',
    noReviews: 'No ratings yet.',
    reviews: 'Reviews',
    searchPlaceholderShort: 'Title or author',
    hidePlayer: 'Swipe away',
    restarted: 'Back to the start',
    downloadBusy: 'A download is already running.',
    connectionLost: 'Connection dropped',
    pickNooksFirst: 'Pick some Nooks first.',
    prevChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    sortRating: 'Rating',
    backToAwake: 'Back to where you were awake,',
    pasteLink: 'Paste your invite link',
    unlock: 'Unlock',
    unlockFailed: 'I could not make sense of that.',
    inviteUsed: 'That invite was already used.',
    inviteExpired: 'That invite has expired.',
    history: 'History',
    historyHint: 'What you listened to lately, and where the timer left you.',
    noHistory: 'Nothing listened to yet.',
    upTo: 'heard up to',
    rateNow: 'Rate it',
    notYet: 'Finish it first',
    you: 'You',
    stats: 'Listening time',
    totalListened: 'listened in total',
    hoursShort: 'h',
    booksFinished: 'books finished',
    lastDays: 'the last days',
    badges: 'Badges',
    noBadges: 'None yet. The first hour already counts.',
    nextBadge: 'Up next:',
    toGo: 'to go',
    badgeEarned: 'Well done!',
    tellOther: 'Show them',
    alreadyShared: 'Already shared',
    badgeShared: 'On its way',
    reached: 'earned a badge:',
    congratulate: 'Congratulate',
    cheerSent: 'Congratulations sent',
    cheersYou: 'cheers you on',
    nice: 'Lovely!',
    later: 'Later',
    atRest: 'Files are stored encrypted on Cloudflare R2 (AES-256).',
    bookmarkDeleted: 'Bookmark deleted',
    noBookmarks: 'No bookmarks in this book yet.',
    showThem: 'Show',
    undo: 'Undo',
    bookmarkAdded: 'Bookmark added',
    notePlaceholder: 'Note …',
    delete: 'Delete',
    sleep: 'Einschlafen',
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
    theme: 'Farben',
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
    sleepIn: (t) => `Off in ${t}`,
  },
};

// ------------------------------------------------------------------ state

const defaultSettings = { speed: 1, skipBack: 15, skipFwd: 30, autoResume: true, theme: 'light', libView: 'grid', libSort: 'lastPlayed', lastSleep: 30 };
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
  wishes: null,
  downloads: new Set(),
  downloading: null,   // { bookId, pct, controller }
  security: null,
  offline: false,
  allBookmarks: null,
  lastSleepRun: null,
  history: null,
  sleepLog: null,
  stats: null,
  totalSeconds: 0,
  achievements: { mine: [], inbox: [], cheers: [] },
  recentReviews: null,
  miniCollapsed: false,
  sleepRun: null,   // { bookId, startedSec, startedAt, kind }
};

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
}
function saveSettings() {
  localStorage.setItem('nook.settings', JSON.stringify(settings));
  applyTheme();
}
function applyLang() {
  document.documentElement.lang = state.lang === 'en' ? 'en' : 'de';
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
  // Round to whole minutes first, then carry, or 3599 s prints as "60 Min".
  const total = Math.round((Number(seconds) || 0) / 60);
  return t('hoursMin', Math.floor(total / 60), total % 60);
}
function initials(text) {
  return String(text || '?').split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
}
// Mr. Nook says one of these under the greeting; picked per daypart, changes each hour.
const SAYINGS = {
  de: {
    morning: [
      'Der Kessel pfeift gleich.',
      'Erst ein Kapitel, dann der Tag.',
      'Die Decke liegt noch bereit.',
      'Guten Morgen, die Seiten warten.',
      'Noch fünf Minuten liegen bleiben zählt auch.',
      'Kaffee in die Tasse, Geschichte ins Ohr.',
      'Langsam anfangen ist auch anfangen.',
      'Das Sofa hat auf dich gewartet.',
    ],
    day: [
      'Kurze Pause? Ein Kapitel passt immer.',
      'Ohren auf, Schultern runter.',
      'Zeit für eine kleine Fluchtgeschichte.',
      'Der Sessel ist frei.',
      'Ein Schluck Tee, ein paar Seiten.',
      'Zwischendurch hören zählt doppelt.',
      'Der Stapel wird nicht kleiner von allein.',
      'Draußen lärmt es, hier drinnen nicht.',
    ],
    evening: [
      'Mach es dir gemütlich heute Abend.',
      'Licht gedimmt, Decke drüber.',
      'Der beste Teil vom Tag beginnt jetzt.',
      'Füße hoch, die Geschichte übernimmt.',
      'Nur noch ein Kapitel, versprochen.',
      'Die Welt kann kurz warten.',
      'Warmes Licht, warme Stimme.',
      'Zeit, in den Sessel zu sinken.',
    ],
    night: [
      'Leise weiterhören, bis die Augen zufallen.',
      'Der Sleep-Timer passt auf dich auf.',
      'Kissen zurecht, Geschichte an.',
      'Gute Nacht, ich mach das Licht aus.',
      'Träum was Schönes, Kapitel für Kapitel.',
      'Die Nacht ist lang genug für ein Kapitel.',
      'Ganz leise jetzt.',
      'Schlaf gut, ich bin gleich still.',
    ],
  },
  en: {
    morning: [
      'The kettle is nearly there.',
      'One chapter first, then the day.',
      'The blanket is still right here.',
      'Good morning, the pages are waiting.',
      'Five more minutes counts too.',
      'Coffee in the cup, a story in your ear.',
      'Starting slowly is still starting.',
      'The sofa saved you a seat.',
    ],
    day: [
      'A short break? A chapter always fits.',
      'Ears open, shoulders down.',
      'Time for a small escape.',
      'The armchair is free.',
      'A sip of tea, a few pages.',
      'Listening mid-day counts double.',
      'The pile will not shrink on its own.',
      'It is loud out there, not in here.',
    ],
    evening: [
      'Make yourself cosy tonight.',
      'Lights low, blanket on.',
      'The best part of the day starts now.',
      'Feet up, the story takes over.',
      'Just one more chapter, promise.',
      'The world can wait a moment.',
      'Warm light, warm voice.',
      'Time to sink into the chair.',
    ],
    night: [
      'Keep listening softly until your eyes close.',
      'The sleep timer is watching over you.',
      'Pillow sorted, story on.',
      'Good night, I will get the light.',
      'Sweet dreams, chapter by chapter.',
      'The night is long enough for one chapter.',
      'Very quietly now.',
      'Sleep well, I will hush in a moment.',
    ],
  },
};

function daypart() {
  const h = new Date().getHours();
  if (h < 5) return 'night';
  if (h < 11) return 'morning';
  if (h < 17) return 'day';
  if (h < 23) return 'evening';
  return 'night';
}

function saying() {
  const table = SAYINGS[state.lang] || SAYINGS.de;
  const list = table[daypart()];
  const now = new Date();
  // Stable within the hour, so it does not flicker on every re-render.
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + now.getHours() * 7;
  return list[seed % list.length];
}

function greeting() {
  return t(daypart());
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
  cloud: '<svg viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z"/></svg>',
  downloadIcon: '<svg viewBox="0 0 24 24"><path d="M12 4v11"/><path d="m7.5 11 4.5 4.5 4.5-4.5"/><path d="M5 19h14"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4.5v4h4"/><path d="M12 8v4.5l3 1.8"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M17 5.5v13L8 12z"/><path d="M6.5 5.5v13"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M7 5.5v13L16 12z"/><path d="M17.5 5.5v13"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M7 7v12.5h10V7"/><path d="M10.5 10.5v6M13.5 10.5v6"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 4 2.4 5 5.6.7-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.7z"/></svg>',
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

// ----------------------------------------------------------- local mirror
// Enough of the library is mirrored locally that downloaded books still play with no
// network at all. Details are only kept for downloaded books, to stay well inside quota.

function mirrorGet(key) {
  try { return JSON.parse(localStorage.getItem(`nook.mirror.${key}`)); } catch { return null; }
}
function mirrorSet(key, value) {
  try { localStorage.setItem(`nook.mirror.${key}`, JSON.stringify(value)); } catch { /* quota */ }
}
function mirrorDrop(key) {
  try { localStorage.removeItem(`nook.mirror.${key}`); } catch { /* ignore */ }
}

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

  await loadDownloads();

  let me;
  try {
    me = await fetch('/api/me', { credentials: 'same-origin' });
  } catch {
    // No network. If this device has been here before, carry on from the mirror.
    return bootOffline();
  }
  if (me.status === 401) { state.screen = 'locked'; return render(); }
  if (!me.ok) return state.downloads.size ? bootOffline() : fail();

  try {
    state.users = await api('/users');
    mirrorSet('users', state.users);
  } catch {
    return bootOffline();
  }
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
  restoreSleep();
  try { state.lastSleepRun = JSON.parse(localStorage.getItem(lastSleepKey())); } catch { /* ignore */ }
  loadDownloads().then(render).catch(() => {});
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

function fail() {
  state.screen = 'error';
  render();
}

function bootOffline() {
  const users = mirrorGet('users');
  if (!users || !users.length) return fail();
  restoreSleep();
  state.offline = true;
  state.users = users;
  const savedUserId = localStorage.getItem('nook.user');
  state.user = state.users.find((u) => String(u.id) === savedUserId) || null;
  if (!state.user) {
    state.screen = 'profiles';
    render();
    return;
  }
  state.lang = state.user.lang || 'de';
  applyLang();
  try { state.lastSleepRun = JSON.parse(localStorage.getItem(lastSleepKey())); } catch { /* ignore */ }
  state.books = mirrorGet(`books.${state.user.id}`) || [];
  if (!location.hash || location.hash.startsWith('#k=')) history.replaceState(null, '', `${location.pathname}#/home`);
  route();
  window.addEventListener('online', () => location.reload());
}

async function enterApp() {
  try { await loadLibrary(); } catch (err) { return fail(); }
  if (!location.hash || location.hash === '#' || location.hash.startsWith('#k=')) history.replaceState(null, '', `${location.pathname}#/home`);
  await route();
  checkNudges().catch(() => {});
  if (settings.autoResume && !state.now) {
    const last = state.books.find((b) => b.last_played > 0 && b.position_sec > 0 && !b.finished);
    if (last) loadIntoPlayer(last.id, { autoplay: false }).catch(() => {});
  }
}

async function loadLibrary() {
  try {
    state.books = await api(`/books?user=${state.user.id}`);
    state.offline = false;
    mirrorSet(`books.${state.user.id}`, state.books);
    flushQueue();
  } catch (err) {
    const mirrored = mirrorGet(`books.${state.user.id}`);
    if (err.message === 'unauthorized' || !mirrored) throw err;
    state.books = mirrored;
    state.offline = true;
  }
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
      state.offline = false;
      if (isDownloaded(parts[1])) mirrorSet(`detail.${state.user.id}.${parts[1]}`, state.detail);
    } catch (err) {
      const mirrored = mirrorGet(`detail.${state.user.id}.${parts[1]}`);
      if (!mirrored) {
        toast(`${t('error')}: ${err.message}`);
        location.hash = '#/library';
        return;
      }
      state.detail = mirrored;
      state.offline = true;
    }
    render();
    return;
  }
  if (['home', 'library', 'search', 'settings'].includes(screen)) {
    state.screen = screen;
    if (screen === 'home' || screen === 'library') loadLibrary().then(render).catch(() => {});
    if (screen === 'home' && state.wishes === null) loadWishes();
    if (screen === 'settings') { loadInvites(); loadWishes(); loadSecurity(); }
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
  commitPendingInput();
  if (history.state && history.state.overlay === 'sheet') history.back();
  else { state.sheet = null; render(); }
}
// The back button removes a focused field without a blur, so commit it first.
function commitPendingInput() {
  const el = document.activeElement;
  if (!el) return;
  if (el.dataset && el.dataset.bookmark) updateBookmarkNote(Number(el.dataset.bookmark), el.value.trim());
  commitReviewText();
}

// The textarea may already have lost focus by the time a sheet closes, so read the element
// itself rather than relying on document.activeElement.
function commitReviewText() {
  const field = document.getElementById('review-text');
  if (!field) return;
  const book = [state.detail, state.now].find((b) => b && (b.reviews || []).length >= 0 && field.dataset.book === b.id);
  const bookId = field.dataset.book;
  if (!bookId) return;
  const source = book || state.detail;
  const mine = source && (source.reviews || []).find((r) => r.user_id === state.user.id);
  const text = field.value.trim();
  if ((mine ? mine.text : '') === text) return;
  saveRating(bookId, mine ? mine.rating : null, text);
}

window.addEventListener('popstate', (event) => {
  commitPendingInput();
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
  applyLang();
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
// Many rips carry one mark per track. Stopping at the "end of chapter" is only meaningful
// when a chapter is long enough to fall asleep in.
function hasRealChapters(book) {
  if (!book || !book.chapters || book.chapters.length < 1) return false;
  const duration = Number(book.duration_sec) || 0;
  return duration / book.chapters.length >= 300;
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
// Back within the first seconds of a chapter means "the one before this one".
function stepChapter(direction) {
  if (!state.now || !state.now.chapters.length) return;
  const chapters = state.now.chapters;
  const pos = audio.currentTime;
  let idx = chapterIndexAt(state.now, pos);
  if (direction < 0) idx = pos - Number(chapters[Math.max(0, idx)].start_sec) > 3 ? idx : idx - 1;
  else idx += 1;
  idx = Math.max(0, Math.min(chapters.length - 1, idx));
  seekTo(Number(chapters[idx].start_sec), !audio.paused);
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

// Positions are queued locally so an hour in a dead spot does not vanish.
const QUEUE_KEY = 'nook.pending';

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || {}; } catch { return {}; }
}
function writeQueue(queue) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch { /* storage full */ }
}

function saveProgressFor(bookId, position, finished, { touch = true, useBeacon = false } = {}) {
  if (!state.user) return Promise.resolve();
  const payload = { user_id: state.user.id, book_id: bookId, position_sec: position, finished, touch };
  const queue = readQueue();
  queue[`${state.user.id}:${bookId}`] = payload;
  writeQueue(queue);

  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon('/api/progress', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    return Promise.resolve();
  }
  return api('/progress', { method: 'PUT', body: payload })
    .then(() => {
      const after = readQueue();
      const still = after[`${state.user.id}:${bookId}`];
      // Only drop it if nothing newer arrived while the request was in flight.
      if (still && still.position_sec === position && still.finished === finished) {
        delete after[`${state.user.id}:${bookId}`];
        writeQueue(after);
      }
    })
    .catch(() => {});
}

function flushQueue() {
  const queue = readQueue();
  const entries = Object.entries(queue);
  if (!entries.length) return;
  entries.forEach(([key, payload]) => {
    api('/progress', { method: 'PUT', body: payload })
      .then(() => {
        const after = readQueue();
        delete after[key];
        writeQueue(after);
      })
      .catch(() => {});
  });
}
window.addEventListener('online', flushQueue);

let lastSaveAt = 0;
function saveProgress(force, useBeacon) {
  if (!state.now || !state.user) return;
  const now = Date.now();
  if (!force && now - lastSaveAt < SAVE_INTERVAL_MS) return;
  lastSaveAt = now;
  const duration = bookDuration(state.now);
  const position = Math.floor(currentPos());
  const finished = audio.ended || (duration > 0 && duration - position < 5) ? 1 : 0;
  applyLocalProgress(state.now.id, { position_sec: position, finished, last_played: now });
  saveProgressFor(state.now.id, position, finished, { useBeacon });
  // Keeps restoreSleep able to reconstruct a night the app did not survive.
  if (state.sleepRun) persistSleep();
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
  const previous = Number(book.progress ? book.progress.position_sec : book.position_sec) || 0;
  // Marking finished jumps to the end; taking it back keeps where you actually were.
  const position = finished ? Math.floor(duration) : Math.min(previous, Math.max(0, Math.floor(duration) - 1));
  if (state.now && state.now.id === book.id) {
    audio.pause();
    if (finished) audio.currentTime = position;
  }
  applyLocalProgress(book.id, { position_sec: position, finished: finished ? 1 : 0 });
  render();
  await saveProgressFor(book.id, position, finished ? 1 : 0, { touch: false });
}

async function restartBook(book) {
  const previous = Number(book.progress ? book.progress.position_sec : book.position_sec) || 0;
  const wasFinished = Number(book.progress ? book.progress.finished : book.finished) || 0;
  if (state.now && state.now.id === book.id) audio.currentTime = 0;
  applyLocalProgress(book.id, { position_sec: 0, finished: 0 });
  render();
  saveProgressFor(book.id, 0, 0, { touch: false });
  if (previous > 30) {
    toast(t('restarted'), t('undo'), () => {
      if (state.now && state.now.id === book.id) audio.currentTime = previous;
      applyLocalProgress(book.id, { position_sec: previous, finished: wasFinished });
      render();
      saveProgressFor(book.id, previous, wasFinished, { touch: false });
    });
  }
}

// ---- sleep timer

function sleepKey() {
  return `nook.sleep.${state.user ? state.user.id : 'anon'}`;
}
function lastSleepKey() {
  return `nook.lastSleep.${state.user ? state.user.id : 'anon'}`;
}

function persistSleep() {
  try {
    if (sleepActive()) {
      localStorage.setItem(sleepKey(), JSON.stringify({
        sleep: state.sleep,
        run: state.sleepRun,
        lastSec: state.now ? currentPos() : 0,
        bookId: state.now ? state.now.id : null,
      }));
    } else {
      localStorage.removeItem(sleepKey());
    }
  } catch { /* ignore */ }
}

const CHAPTER_MODE_MAX_AGE = 6 * 3600000;

function restoreSleep() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(sleepKey())); } catch { return; }
  if (!saved || !saved.sleep) return;
  try { localStorage.removeItem(sleepKey()); } catch { /* ignore */ }

  const expired = saved.sleep.until && saved.sleep.until <= Date.now();
  // A chapter-end timer from a previous evening must not ambush tonight's listening.
  const staleChapter = saved.sleep.endOfChapter
    && saved.run && Date.now() - saved.run.startedAt > CHAPTER_MODE_MAX_AGE;

  if (expired || staleChapter) {
    // The app was killed while the timer ran. Write down what we know instead of losing it.
    if (saved.run && saved.lastSec > saved.run.startedSec + 30) {
      queueSleepRun({
        user_id: state.user ? state.user.id : saved.run.userId,
        book_id: saved.run.bookId,
        started_sec: saved.run.startedSec,
        stopped_sec: saved.lastSec,
        kind: saved.run.kind,
        started_at: saved.run.startedAt,
        awake_sec: saved.run.awakeSec ?? null, awake_at: saved.run.awakeAt ?? null,
        hidden_sec: saved.run.hiddenSec ?? null, hidden_at: saved.run.hiddenAt ?? null,
      });
    }
    return;
  }
  state.sleep = saved.sleep;
  state.sleepRun = saved.run || null;
  armSleepAlarm();
}

function extendSleep(minutes) {
  if (state.sleep.until > 0) state.sleep.until += minutes * 60000;
  else if (state.sleep.endOfChapter) return toast(t('chapterModeActive'));
  else state.sleep = { until: Date.now() + minutes * 60000, endOfChapter: false, startChapter: -1, minutes };
  audio.volume = 1;
  if (!state.sleepRun && state.now) {
    state.sleepRun = { bookId: state.now.id, startedSec: currentPos(), startedAt: Date.now(), kind: 'timer' };
  } else {
    markAwake();   // reaching for +5 is proof you are still here
  }
  persistSleep();
  armSleepAlarm();
  render();
}

function setSleep(option) {
  audio.volume = 1;
  if (option === -1 && !hasRealChapters(state.now)) return toast(t('noRealChapters'));
  if (option === -1) state.sleep = { until: 0, endOfChapter: true, startChapter: chapterIndexAt(state.now, currentPos()), minutes: -1 };
  else if (option > 0) state.sleep = { until: Date.now() + option * 60000, endOfChapter: false, startChapter: -1, minutes: option };
  else state.sleep = { until: 0, endOfChapter: false, startChapter: -1, minutes: 0 };
  // Remember where you were still awake, so the run can be written down later.
  if (option !== 0 && state.now) {
    state.sleepRun = { bookId: state.now.id, startedSec: currentPos(), startedAt: Date.now(), kind: option === -1 ? 'chapter' : 'timer' };
  } else {
    state.sleepRun = null;
  }
  // Remember the choice so the next night starts from it.
  if (option > 0) { settings.lastSleep = option; saveSettings(); }
  persistSleep();
  armSleepAlarm();
  closeSheet();
  render();
}

// Sleep runs are queued the same way positions are, because the nights you listen offline
// are exactly the nights worth recording.
const SLEEP_QUEUE_KEY = 'nook.pendingSleep';

function readSleepQueue() {
  try { return JSON.parse(localStorage.getItem(SLEEP_QUEUE_KEY)) || []; } catch { return []; }
}
function writeSleepQueue(list) {
  try { localStorage.setItem(SLEEP_QUEUE_KEY, JSON.stringify(list.slice(-20))); } catch { /* ignore */ }
}

function queueSleepRun(payload) {
  const queue = readSleepQueue();
  queue.push(payload);
  writeSleepQueue(queue);
  flushSleepQueue();
}

function flushSleepQueue() {
  const queue = readSleepQueue();
  if (!queue.length) return;
  queue.forEach((payload, index) => {
    api('/sleep-sessions', { method: 'POST', body: payload })
      .then((row) => {
        writeSleepQueue(readSleepQueue().filter((_, i) => i !== index));
        for (const d of [state.now, state.detail]) {
          if (d && d.id === payload.book_id) d.sleep_sessions = [row, ...(d.sleep_sessions || [])].slice(0, 5);
        }
        render();
      })
      .catch(() => {});
  });
}
window.addEventListener('online', flushSleepQueue);

function deleteSleepRun(id) {
  let removed = null;
  for (const book of [state.detail, state.now]) {
    if (!book || !book.sleep_sessions) continue;
    const hit = book.sleep_sessions.find((r) => r.id === id);
    if (hit) removed = { run: hit, bookId: book.id };
    book.sleep_sessions = book.sleep_sessions.filter((r) => r.id !== id);
  }
  render();
  api(`/sleep-sessions/${id}`, { method: 'DELETE' }).catch((err) => toast(`${t('error')}: ${err.message}`));
  if (removed) {
    toast(t('nightRemoved'), t('undo'), () => {
      queueSleepRun({
        user_id: state.user.id, book_id: removed.bookId,
        started_sec: removed.run.started_sec, stopped_sec: removed.run.stopped_sec,
        kind: removed.run.kind, started_at: removed.run.started_at || removed.run.stopped_at,
      });
    });
  }
}

// Called when the timer actually pauses playback.
function recordSleepRun() {
  const run = state.sleepRun;
  state.sleepRun = null;
  if (!run || !state.now || state.now.id !== run.bookId) return;
  const stopped = currentPos();
  if (stopped - run.startedSec < 30) return;   // too short to be worth remembering

  // The best guess at "the last thing I took in", newest evidence first.
  const lastSign = Math.max(run.startedSec, run.awakeSec || 0, run.hiddenSec || 0);

  // Remembered first, sent second, so nothing depends on the network.
  state.lastSleepRun = {
    book_id: run.bookId, started_sec: run.startedSec, awake_sec: lastSign,
    stopped_sec: stopped, stopped_at: Date.now(),
  };
  try { localStorage.setItem(lastSleepKey(), JSON.stringify(state.lastSleepRun)); } catch { /* ignore */ }
  queueSleepRun({
    user_id: state.user.id, book_id: run.bookId,
    started_sec: run.startedSec, stopped_sec: stopped, kind: run.kind, started_at: run.startedAt,
    awake_sec: run.awakeSec ?? null, awake_at: run.awakeAt ?? null,
    hidden_sec: run.hiddenSec ?? null, hidden_at: run.hiddenAt ?? null,
  });

  // The morning's big button should resume where you still were, not where the timer
  // carried you. Two re-heard minutes cost nothing; a skipped hour loses the thread.
  const resumeAt = Math.max(0, lastSign - 120);
  if (stopped - resumeAt > 120) {
    // The pause handler writes the stop position first, so this has to land after it.
    setTimeout(() => {
      applyLocalProgress(run.bookId, { position_sec: Math.floor(resumeAt), finished: 0 });
      saveProgressFor(run.bookId, Math.floor(resumeAt), 0, { touch: false });
      render();
    }, 0);
  }
  render();
}
// "When I set the timer" is a guess. "The last time this phone was touched" is evidence.
// startedSec stays the timer moment; awakeSec is the last sign of life.
let lastAwakeWrite = 0;

function markAwake() {
  if (!state.sleepRun || !state.now || state.sleepRun.bookId !== state.now.id) return;
  const now = Date.now();
  if (now - lastAwakeWrite < 5000) return;
  lastAwakeWrite = now;
  state.sleepRun.awakeSec = currentPos();
  state.sleepRun.awakeAt = now;
  persistSleep();
}

// Locking the phone is the closest thing to "they put it down".
function markScreenOff() {
  if (!state.sleepRun || !state.now || state.sleepRun.bookId !== state.now.id) return;
  if (audio.paused) return;
  state.sleepRun.hiddenSec = currentPos();
  state.sleepRun.hiddenAt = Date.now();
  persistSleep();
}

// Passive so it never costs a scroll frame, and only while a timer is actually armed.
['pointerdown', 'touchstart', 'keydown'].forEach((type) => {
  document.addEventListener(type, () => { if (state.sleepRun) markAwake(); }, { passive: true, capture: true });
});

function sleepActive() {
  return state.sleep.until > 0 || state.sleep.endOfChapter;
}
function sleepShort() {
  if (state.sleep.until > 0) return fmtTime((state.sleep.until - Date.now()) / 1000);
  if (state.sleep.endOfChapter) return t('chapterShort');
  return '';
}

function sleepLabel() {
  if (state.sleep.until > 0) return t('sleepIn', fmtTime((state.sleep.until - Date.now()) / 1000));
  if (state.sleep.endOfChapter) return t('endOfChapter');
  return t('sleep');
}
let sleepTick = Date.now();
setInterval(() => {
  const now = Date.now();
  const elapsed = now - sleepTick;
  sleepTick = now;
  if (state.sleep.until > 0) {
    // A hand-pause stops the clock; listening time is what the timer counts, not wall time.
    if (audio.paused) {
      state.sleep.until += Math.min(elapsed, 5000);
      persistSleep();
      armSleepAlarm();
    }
    if (enforceSleepDeadline()) return;
    const remaining = state.sleep.until - Date.now();
    if (!audio.paused && remaining < SLEEP_FADE_MS) audio.volume = Math.max(0.05, remaining / SLEEP_FADE_MS);
  } else if (state.sleep.endOfChapter && state.now && !audio.paused) {
    // Fade towards the next chapter mark so both modes end the same gentle way.
    const chapters = state.now.chapters || [];
    const next = chapters[state.sleep.startChapter + 1];
    if (next) {
      const left = (Number(next.start_sec) - currentPos()) / (audio.playbackRate || 1) * 1000;
      audio.volume = left < SLEEP_FADE_MS ? Math.max(0.05, left / SLEEP_FADE_MS) : 1;
    }
  }
  const label = document.getElementById('sleep-label');
  if (label) label.textContent = sleepLabel();
  const mini = document.getElementById('mini-sleep');
  if (mini) mini.textContent = sleepShort();
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
    render();
    toast(t('bookmarkAdded'), t('showThem'), () => openSheet({ type: 'bookmarks', bookId: state.now.id }));
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
  let removed = null;
  let bookId = null;
  for (const d of [state.now, state.detail]) {
    if (!d || !d.bookmarks) continue;
    const hit = d.bookmarks.find((b) => b.id === id);
    if (hit) { removed = hit; bookId = d.id; }
    d.bookmarks = d.bookmarks.filter((b) => b.id !== id);
  }
  render();
  api(`/bookmarks/${id}`, { method: 'DELETE' }).catch((err) => toast(`${t('error')}: ${err.message}`));
  if (removed) toast(t('bookmarkDeleted'), t('undo'), () => restoreBookmark(bookId, removed));
}

// Undo re-creates the row; the id changes, which nothing depends on.
async function restoreBookmark(bookId, bookmark) {
  try {
    const row = await api('/bookmarks', {
      method: 'POST',
      body: { user_id: state.user.id, book_id: bookId, position_sec: bookmark.position_sec, note: bookmark.note || '' },
    });
    for (const d of [state.now, state.detail]) {
      if (d && d.id === bookId && d.bookmarks && !d.bookmarks.some((b) => b.id === row.id)) {
        d.bookmarks.push(row);
        d.bookmarks.sort((a, b) => a.position_sec - b.position_sec);
      }
    }
    render();
  } catch (err) {
    toast(`${t('error')}: ${err.message}`);
  }
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
  set('play', () => { markAwake(); audio.play().catch(() => {}); });
  set('pause', () => { markAwake(); audio.pause(); });
  set('seekbackward', () => { markAwake(); skip(-settings.skipBack); });
  set('seekforward', () => { markAwake(); skip(settings.skipFwd); });
  set('previoustrack', () => { markAwake(); skip(-settings.skipBack); });
  set('nexttrack', () => { markAwake(); skip(settings.skipFwd); });
  set('seekto', (d) => { markAwake(); if (d && d.seekTime != null) seekTo(d.seekTime, false); });
}
function updatePositionState() {
  if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState || !state.now) return;
  const duration = bookDuration(state.now);
  if (!Number.isFinite(duration) || duration <= 0) return;
  try { navigator.mediaSession.setPositionState({ duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, duration) }); } catch { /* ignore */ }
}

// ---- audio events

// A backgrounded page has its timers throttled to about once a minute, which is why the
// timer used to sail past its deadline with the screen off. Three independent triggers now
// enforce it: the media element's own timeupdate, a setTimeout armed for the exact moment,
// and the one second interval for when playback is paused.
let sleepAlarm = null;

function armSleepAlarm() {
  clearTimeout(sleepAlarm);
  sleepAlarm = null;
  if (state.sleep.until > 0) {
    const wait = Math.max(0, state.sleep.until - Date.now());
    sleepAlarm = setTimeout(() => enforceSleepDeadline(), wait);
  }
}

function enforceSleepDeadline() {
  if (state.sleep.until > 0 && Date.now() >= state.sleep.until) {
    clearTimeout(sleepAlarm);
    sleepAlarm = null;
    audio.pause();
    audio.volume = 1;
    recordSleepRun();
    setSleep(0);
    return true;
  }
  return false;
}

audio.addEventListener('timeupdate', () => {
  if (enforceSleepDeadline()) return;
  updateTimeUi();
  saveProgress(false);
  if (state.sleep.endOfChapter && !audio.paused
      && (!state.sleepRun || state.sleepRun.bookId === state.now.id)
      && chapterIndexAt(state.now, currentPos()) > state.sleep.startChapter) {
    audio.pause();
    recordSleepRun();
    setSleep(0);
  }
});
audio.addEventListener('play', () => { updatePlayUi(); updatePositionState(); });
audio.addEventListener('pause', () => { updatePlayUi(); saveProgress(true); countListening(); pushListening(); });
audio.addEventListener('play', () => { lastTick = Date.now(); });
audio.addEventListener('seeked', () => { updateTimeUi(); updatePositionState(); });
audio.addEventListener('ratechange', updatePositionState);
audio.addEventListener('ended', () => { saveProgress(true); render(); });
audio.addEventListener('error', () => {
  if (!state.now) return;
  // A dropped connection leaves the element unusable; give it a fresh source at the same spot.
  const at = currentPos();
  const wasPlaying = !audio.paused;
  toast(t('connectionLost'), t('retry'), () => {
    state.pendingStart = at;
    audio.src = audioPath(state.now.id);
    audio.load();
    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = at;
      state.pendingStart = 0;
      if (wasPlaying) audio.play().catch(() => {});
    }, { once: true });
  });
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { markScreenOff(); saveProgress(true, true); }
  else { enforceSleepDeadline(); markAwake(); }
});
window.addEventListener('pageshow', () => { enforceSleepDeadline(); armSleepAlarm(); });
window.addEventListener('focus', () => enforceSleepDeadline());
audio.addEventListener('playing', () => { enforceSleepDeadline(); armSleepAlarm(); });
window.addEventListener('pagehide', () => saveProgress(true, true));

// ------------------------------------------------------------- downloads
// A downloaded book lives in the Cache API under its media path. The service worker answers
// range requests from there, so playback never touches the network again.

const AUDIO_CACHE = 'mr-nook-audio';

function audioPath(bookId) {
  return `/media/${bookId}/audio`;
}

async function loadDownloads() {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(AUDIO_CACHE);
    const keys = await cache.keys();
    state.downloads = new Set(keys.map((req) => new URL(req.url).pathname.split('/')[2]).filter(Boolean));
  } catch { /* storage unavailable */ }
}

function isDownloaded(bookId) {
  return state.downloads.has(bookId);
}

async function downloadBook(book) {
  if (!book) return;
  if (state.downloading) return toast(t('downloadBusy'));
  if (!('caches' in window)) return toast(t('downloadFailed'));

  const needed = Number(book.size_bytes) || 0;
  if (navigator.storage && navigator.storage.estimate && needed) {
    try {
      const { quota = 0, usage = 0 } = await navigator.storage.estimate();
      if (quota && quota - usage < needed * 1.1) return toast(t('notEnoughSpace'));
    } catch { /* estimate is advisory */ }
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  const controller = new AbortController();
  state.downloading = { bookId: book.id, pct: 0, controller };
  render();

  try {
    const res = await fetch(audioPath(book.id), { credentials: 'same-origin', signal: controller.signal });
    if (!res.ok || !res.body) throw new Error(String(res.status));
    const total = Number(res.headers.get('content-length')) || needed;
    let loaded = 0;
    let lastPaint = 0;

    // Count bytes as they flow into the cache instead of buffering the whole book.
    const meter = new TransformStream({
      transform(chunk, ctrl) {
        loaded += chunk.byteLength;
        const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
        if (state.downloading && pct !== state.downloading.pct && Date.now() - lastPaint > 250) {
          lastPaint = Date.now();
          state.downloading.pct = pct;
          updateDownloadUi();
        }
        ctrl.enqueue(chunk);
      },
    });

    const headers = new Headers({ 'content-type': res.headers.get('content-type') || 'audio/mpeg' });
    const cache = await caches.open(AUDIO_CACHE);
    await cache.put(audioPath(book.id), new Response(res.body.pipeThrough(meter), { status: 200, headers }));

    state.downloads.add(book.id);
    state.downloading = null;
    if (state.detail && state.detail.id === book.id) mirrorSet(`detail.${state.user.id}.${book.id}`, state.detail);
    render();
    toast(t('downloadDone'));
  } catch (err) {
    state.downloading = null;
    await caches.open(AUDIO_CACHE).then((c) => c.delete(audioPath(book.id))).catch(() => {});
    render();
    if (err.name !== 'AbortError') toast(`${t('downloadFailed')}: ${err.message}`);
  }
}

function cancelDownload() {
  if (state.downloading) state.downloading.controller.abort();
}

async function removeDownload(bookId) {
  try {
    const cache = await caches.open(AUDIO_CACHE);
    await cache.delete(audioPath(bookId));
  } catch { /* ignore */ }
  state.downloads.delete(bookId);
  mirrorDrop(`detail.${state.user.id}.${bookId}`);
  render();
  toast(t('downloadRemoved'));
}

function updateDownloadUi() {
  const bar = document.getElementById('dl-bar');
  const label = document.getElementById('dl-label');
  const pct = state.downloading ? state.downloading.pct : 0;
  if (bar) bar.style.width = `${pct}%`;
  if (label) label.textContent = `${t('downloading')} ${pct} %`;
}

function fmtNumber(value, digits = 0) {
  return Number(value).toLocaleString(state.lang === 'en' ? 'en-GB' : 'de-DE', {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
}

function fmtBytes(bytes) {
  const mb = (Number(bytes) || 0) / 1048576;
  return mb >= 1024 ? `${fmtNumber(mb / 1024, 1)} GB` : `${fmtNumber(Math.round(mb))} MB`;
}

// ---------------------------------------------------------------- wishes

async function loadWishes() {
  try {
    state.wishes = await api('/wishes');
    render();
  } catch { /* ignore */ }
}

async function submitWish() {
  const title = (document.getElementById('wish-title') || {}).value || '';
  const author = (document.getElementById('wish-author') || {}).value || '';
  const note = (document.getElementById('wish-note') || {}).value || '';
  if (!title.trim()) return;
  try {
    const row = await api('/wishes', {
      method: 'POST',
      body: { user_id: state.user.id, title: title.trim(), author: author.trim(), note: note.trim() },
    });
    state.wishes = [{ ...row, user_name: state.user.name }, ...(state.wishes || [])];
    closeSheet();
    toast(t('wishAdded'));
  } catch (err) {
    toast(`${t('error')}: ${err.message}`);
  }
}

function setWishStatus(id, status) {
  const wish = (state.wishes || []).find((w) => w.id === id);
  if (wish) wish.status = status;
  render();
  api(`/wishes/${id}`, { method: 'PATCH', body: { status } }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

function deleteWish(id) {
  const removed = (state.wishes || []).find((w) => w.id === id);
  state.wishes = (state.wishes || []).filter((w) => w.id !== id);
  render();
  api(`/wishes/${id}`, { method: 'DELETE' }).catch((err) => toast(`${t('error')}: ${err.message}`));
  if (removed) {
    toast(t('wishDeleted'), t('undo'), async () => {
      try {
        const row = await api('/wishes', {
          method: 'POST',
          body: { user_id: removed.user_id, title: removed.title, author: removed.author, note: removed.note },
        });
        state.wishes = [{ ...row, user_name: removed.user_name }, ...(state.wishes || [])];
        render();
      } catch (err) { toast(`${t('error')}: ${err.message}`); }
    });
  }
}

// -------------------------------------------------------------- security

async function loadSecurity() {
  try {
    state.security = await api('/security');
    render();
  } catch { /* ignore */ }
}

// --------------------------------------------------------------- reviews

function nooksHtml(rating, { interactive = false, bookId = '' } = {}) {
  return `<div class="nooks ${interactive ? 'pick' : ''}">${[1, 2, 3, 4, 5].map((n) => (interactive
    ? `<button class="nook ${n <= rating ? 'on' : ''}" data-action="rate" data-id="${esc(bookId)}" data-rating="${n}" aria-label="${n} ${esc(t('nooks'))}"><img src="/img/nook-pixel.png" alt=""></button>`
    : `<span class="nook ${n <= rating ? 'on' : ''}"><img src="/img/nook-pixel.png" alt=""></span>`)).join('')}</div>`;
}

const REVIEW_QUEUE_KEY = 'nook.pendingReviews';

function queueReview(payload) {
  try {
    const queue = JSON.parse(localStorage.getItem(REVIEW_QUEUE_KEY)) || {};
    queue[`${payload.user_id}:${payload.book_id}`] = payload;
    localStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(queue));
  } catch { /* ignore */ }
}

function flushReviewQueue() {
  let queue;
  try { queue = JSON.parse(localStorage.getItem(REVIEW_QUEUE_KEY)) || {}; } catch { return; }
  Object.entries(queue).forEach(([key, payload]) => {
    api('/reviews', { method: 'PUT', body: payload }).then(() => {
      try {
        const after = JSON.parse(localStorage.getItem(REVIEW_QUEUE_KEY)) || {};
        delete after[key];
        localStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(after));
      } catch { /* ignore */ }
    }).catch(() => {});
  });
}
window.addEventListener('online', flushReviewQueue);

async function saveRating(bookId, rating, textOverride) {
  const field = document.getElementById('review-text');
  const text = (textOverride !== undefined ? textOverride : (field ? field.value : '')).trim();
  if (rating === null && !text) return toast(t('pickNooksFirst'));

  // Update what is on screen first; the sheet must not jump while someone is typing.
  const now = Date.now();
  for (const book of [state.detail, state.now]) {
    if (!book || book.id !== bookId) continue;
    book.reviews = book.reviews || [];
    const mine = book.reviews.find((r) => r.user_id === state.user.id);
    if (mine) Object.assign(mine, { rating, text, updated_at: now });
    else book.reviews.unshift({ user_id: state.user.id, user_name: state.user.name, rating, text, updated_at: now });
  }
  const listed = state.books.find((b) => b.id === bookId);
  if (listed) listed.my_rating = rating;
  app.querySelectorAll('.nooks.pick .nook').forEach((el, i) => el.classList.toggle('on', rating !== null && i < rating));

  const payload = { user_id: state.user.id, book_id: bookId, rating, text };
  queueReview(payload);
  try {
    await api('/reviews', { method: 'PUT', body: payload });
    try {
      const after = JSON.parse(localStorage.getItem(REVIEW_QUEUE_KEY)) || {};
      delete after[`${state.user.id}:${bookId}`];
      localStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(after));
    } catch { /* ignore */ }
    toast(t('reviewSaved'));
  } catch (err) {
    if (/finish/.test(err.message)) {
      // Most likely the "finished" flag has not landed yet; give it one more go.
      const book = [state.detail, state.now].find((b) => b && b.id === bookId);
      if (book && book.progress && book.progress.finished) {
        await saveProgressFor(bookId, Math.floor(Number(book.duration_sec) || 0), 1, { touch: false });
        api('/reviews', { method: 'PUT', body: payload }).then(() => toast(t('reviewSaved'))).catch(() => toast(t('rateHint')));
      } else {
        toast(t('rateHint'));
      }
    }
  }
}

function deleteRating(bookId) {
  const detail = state.detail && state.detail.id === bookId ? state.detail : null;
  const removed = detail && (detail.reviews || []).find((r) => r.user_id === state.user.id);
  for (const book of [state.detail, state.now]) {
    if (book && book.id === bookId) book.reviews = (book.reviews || []).filter((r) => r.user_id !== state.user.id);
  }
  const listed = state.books.find((b) => b.id === bookId);
  if (listed) listed.my_rating = null;
  render();
  api(`/reviews?user=${state.user.id}&book=${encodeURIComponent(bookId)}`, { method: 'DELETE' })
    .catch((err) => toast(`${t('error')}: ${err.message}`));
  if (removed) toast(t('reviewDeleted'), t('undo'), () => saveRating(bookId, removed.rating, removed.text));
}

// A compact row on the page; rating and reading happens in a sheet.
// Two people, two opinions. Averaging them would describe nobody.
function ratingRowHtml(book) {
  const all = book.reviews || [];
  const mine = all.find((r) => r.user_id === state.user.id);
  const theirs = all.find((r) => r.user_id !== state.user.id);
  const finished = book.progress && book.progress.finished;

  const slot = (who, review) => `<span class="slot">
      <span class="slot-who">${esc(who)}</span>
      ${review && review.rating ? nooksHtml(review.rating) : `<span class="slot-none">${review ? '…' : '–'}</span>`}
    </span>`;

  let hint = '';
  if (!mine && finished) hint = `<span class="small" style="color:var(--sage);font-weight:700">${esc(t('rateNow'))}</span>`;
  else if (!mine) hint = `<span class="small muted">${esc(t('notYet'))}</span>`;
  else if (theirs && theirs.text) hint = `<span class="small muted">${esc(t('sheWrote'))}</span>`;

  return `<button class="source rating-row" data-action="sheet-rating" data-id="${esc(book.id)}">
      <span class="src-icon ${all.length ? 'ok' : ''}"><img src="/img/nook-pixel.png" alt="" class="nook-icon"></span>
      <div style="flex:1;min-width:0;text-align:left">
        <div class="label">${esc(t('howWasIt'))}</div>
        <div class="slots">${slot(t('you'), mine)}${slot(theirs ? theirs.user_name : otherName(), theirs)}</div>
      </div>
      ${hint}
    </button>`;
}

function otherName() {
  const other = state.users.find((u) => state.user && u.id !== state.user.id);
  return other ? other.name : '';
}

function reviewSectionHtml(book) {
  const finished = book.progress && book.progress.finished;
  const all = book.reviews || [];
  const mine = all.find((r) => r.user_id === state.user.id);
  const others = all.filter((r) => r.user_id !== state.user.id);

  const mineBlock = (finished || mine)
    ? `<div class="review-mine">
        <div class="row spread">
          <span class="small muted">${esc(t('yourRating'))}</span>
          ${mine ? `<button class="link small" style="color:var(--terracotta);background:transparent" data-action="delete-rating" data-id="${esc(book.id)}">${esc(t('deleteReview'))}</button>` : ''}
        </div>
        ${nooksHtml(mine ? mine.rating : 0, { interactive: finished, bookId: book.id })}
        ${!finished && mine ? `<p class="muted small" style="margin:0">${esc(t('rateHintUnfinished'))}</p>` : ''}
        <textarea id="review-text" data-book="${esc(book.id)}" rows="3" maxlength="1000" placeholder="${esc(t('reviewPlaceholder'))}">${esc(mine ? mine.text : '')}</textarea>
        <button class="small" data-action="save-review" data-id="${esc(book.id)}">${esc(t('saveReview'))}</button>
      </div>`
    : `<p class="muted small" style="margin:0">${esc(t('rateHint'))}</p>`;

  const othersBlock = others.length
    ? others.map((r) => `<div class="review">
          <div class="row spread"><span style="font-weight:700">${esc(r.user_name)}</span>${r.rating ? nooksHtml(r.rating) : ''}</div>
          ${r.text ? `<p class="small" style="margin:6px 0 0">${esc(r.text)}</p>` : ''}
          <div class="muted small" style="margin-top:4px">${esc(fmtDay(r.updated_at))}</div>
        </div>`).join('')
    : '';

  return `<section class="section">
      <div class="card" style="box-shadow:none;padding:0">${mineBlock}${othersBlock}</div>
    </section>`;
}

function fmtWhenShort(ts) {
  return new Date(ts).toLocaleString(state.lang === 'en' ? 'en-GB' : 'de-DE',
    { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function fmtDay(ts) {
  return new Date(ts).toLocaleDateString(state.lang === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit' });
}

// The span from "still awake" to "timer stopped" is the part you slept through, so it gets
// its own colour and both ends are labelled.
function nightLabel(ts) {
  const then = new Date(ts);
  const today = new Date();
  const sameDay = then.toDateString() === today.toDateString();
  const yesterday = new Date(today.getTime() - 86400000).toDateString() === then.toDateString();
  const clock = then.toLocaleTimeString(state.lang === 'en' ? 'en-GB' : 'de-DE', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `${t('todayAt')} ${clock}`;
  if (yesterday) return `${t('yesterdayAt')} ${clock}`;
  return `${then.toLocaleDateString(state.lang === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit' })}, ${clock}`;
}

// The best evidence for "where I still was", newest first.
function lastSignOf(run) {
  return Math.max(Number(run.started_sec) || 0, Number(run.awake_sec) || 0, Number(run.hidden_sec) || 0);
}

// A place you can recognise beats a number you have to count. Chapter name first, exact
// timestamp in brackets so it still matches the player clock you jump to.
function placeLabel(book, seconds) {
  const idx = chapterIndexAt(book, seconds);
  const where = fmtTime(seconds);
  return idx >= 0 ? `${chapterTitle(book, idx)} · ${where}` : where;
}

function signWording(run) {
  if (run.hidden_sec != null && lastSignOf(run) === Number(run.hidden_sec)) return t('screenWentDark');
  if (run.awake_sec != null && lastSignOf(run) === Number(run.awake_sec)) return t('lastTouched');
  return t('timerSetAt');
}

function sleepHistoryHtml(book) {
  const runs = book.sleep_sessions || [];
  if (!runs.length) return '';
  return `<section class="section">
      <div class="section-head"><h2>${esc(t('sleepHistory'))}</h2></div>
      <div class="list">${runs.map((r) => {
        const sign = lastSignOf(r);
        const slept = Math.max(0, Number(r.stopped_sec) - sign);
        const clock = r.hidden_at || r.awake_at || r.started_at;
        // One clock time per row: the moment of the last sign of life, which is the
        // "when" a person is actually looking for. The stop time adds nothing.
        return `<div class="sleep-run">
          <div class="row spread">
            <span class="muted small">${esc(nightLabel(clock || r.stopped_at))}${r.kind === 'chapter' ? ` · ${esc(t('endOfChapter'))}` : ''}</span>
            <button class="icon-small" data-action="delete-sleep" data-id="${r.id}" aria-label="${esc(t('delete'))}">${ICON.trash}</button>
          </div>
          <div class="sleep-place">
            <span class="legend awake">${esc(signWording(r))}</span>
            <strong>${esc(placeLabel(book, sign))}</strong>
            <span class="muted small">${esc(t('thenSlept'))} ${esc(fmtDuration(slept))}</span>
          </div>
          <div class="row" style="gap:8px;margin-top:10px">
            <button class="small primary" data-action="play-chapter" data-id="${esc(book.id)}" data-sec="${Number(sign)}">${esc(t('jumpBack'))}</button>
            <button class="small ghost" data-action="play-chapter" data-id="${esc(book.id)}" data-sec="${Number(r.stopped_sec)}">${esc(t('toStop'))}</button>
          </div>
        </div>`;
      }).join('')}</div>
    </section>`;
}
// ------------------------------------------------------------ stats & badges
// Listening time is counted while audio actually plays and pushed up in small batches.

const BADGES = {
  de: {
    'hours-1': ['Erste Stunde', 'Der Sessel ist eingesessen.'],
    'hours-5': ['Fünf Stunden', 'Die Decke kennt dich jetzt.'],
    'hours-10': ['Zehn Stunden', 'Ein Buch weit gekommen.'],
    'hours-25': ['25 Stunden', 'Der Tee wird kalt, du hörst weiter.'],
    'hours-50': ['50 Stunden', 'Stammgast im Nook.'],
    'hours-100': ['100 Stunden', 'Dreistellig. Respekt.'],
    'hours-200': ['200 Stunden', 'Der Sessel hat deine Form.'],
    'hours-350': ['350 Stunden', 'Mr. Nook macht dir den Tee jetzt ungefragt.'],
    'hours-500': ['500 Stunden', 'Ein halbes Tausend. Wahnsinn.'],
    'hours-750': ['750 Stunden', 'Du hörst schneller, als wir nachlegen können.'],
    'hours-1000': ['1000 Stunden', 'Ehrenmitglied des Nooks.'],
  },
  en: {
    'hours-1': ['First hour', 'The chair is broken in.'],
    'hours-5': ['Five hours', 'The blanket knows you now.'],
    'hours-10': ['Ten hours', 'A whole book deep.'],
    'hours-25': ['25 hours', 'Tea goes cold, you keep listening.'],
    'hours-50': ['50 hours', 'A regular at the nook.'],
    'hours-100': ['100 hours', 'Three digits. Respect.'],
    'hours-200': ['200 hours', 'The chair has your shape.'],
    'hours-350': ['350 hours', 'Mr. Nook makes your tea unasked.'],
    'hours-500': ['500 hours', 'Half a thousand. Remarkable.'],
    'hours-750': ['750 hours', 'You listen faster than we can add books.'],
    'hours-1000': ['1000 hours', 'Honorary member of the nook.'],
  },
};

function badgeName(code) {
  const table = BADGES[state.lang] || BADGES.de;
  return (table[code] || BADGES.de[code] || [code, ''])[0];
}
function badgeLine(code) {
  const table = BADGES[state.lang] || BADGES.de;
  return (table[code] || BADGES.de[code] || ['', ''])[1];
}

let listenedSeconds = 0;
let lastTick = 0;

function countListening() {
  const now = Date.now();
  if (lastTick && !audio.paused && !audio.ended) {
    const delta = (now - lastTick) / 1000;
    // Ignore jumps from a backgrounded tab or a seek.
    if (delta > 0 && delta < 5) listenedSeconds += delta * (audio.playbackRate || 1);
  }
  lastTick = now;
  if (listenedSeconds >= 60) pushListening();
}

async function pushListening() {
  if (!state.user || listenedSeconds < 1) return;
  const seconds = Math.round(listenedSeconds);
  listenedSeconds = 0;
  try {
    const res = await api('/listening', {
      method: 'POST',
      body: { user_id: state.user.id, seconds, day: new Date().toLocaleDateString('sv-SE') },
    });
    state.totalSeconds = res.total_seconds;
    if (res.earned && res.earned.length) {
      await loadAchievements();
      const fresh = (state.achievements.mine || []).find((a) => a.code === res.earned[res.earned.length - 1]);
      if (fresh) showBadge(fresh);
    }
  } catch {
    listenedSeconds += seconds;   // try again with the next batch
  }
}

setInterval(countListening, 2000);
window.addEventListener('pagehide', () => { if (listenedSeconds > 1 && navigator.sendBeacon && state.user) {
  navigator.sendBeacon('/api/listening', new Blob([JSON.stringify({ user_id: state.user.id, seconds: Math.round(listenedSeconds), day: new Date().toLocaleDateString('sv-SE') })], { type: 'application/json' }));
  listenedSeconds = 0;
} });

async function loadStats() {
  try {
    state.stats = await api(`/stats?user=${state.user.id}`);
    render();
  } catch { /* ignore */ }
}

async function loadAchievements() {
  try {
    state.achievements = await api(`/achievements?user=${state.user.id}`);
  } catch { /* ignore */ }
}

// Popups: your own new badge, a badge someone shared with you, and a cheer you received.
function showBadge(achievement) {
  openSheet({ type: 'badge', achievement });
  api(`/achievements/${achievement.id}`, { method: 'POST', body: { action: 'seen' } }).catch(() => {});
}

async function checkNudges() {
  await loadAchievements();
  const inbox = (state.achievements.inbox || [])[0];
  const cheer = (state.achievements.cheers || [])[0];
  if (inbox) openSheet({ type: 'cheer-ask', achievement: inbox });
  else if (cheer) {
    openSheet({ type: 'cheer-got', achievement: cheer });
    api(`/achievements/${cheer.id}`, { method: 'POST', body: { action: 'cheer-seen' } }).catch(() => {});
  }
  const unseen = (state.achievements.mine || []).find((a) => !a.seen_at);
  if (!inbox && !cheer && unseen) showBadge(unseen);
}

function shareBadge(id) {
  api(`/achievements/${id}`, { method: 'POST', body: { action: 'share' } })
    .then(() => { closeSheet(); toast(t('badgeShared')); })
    .catch((err) => toast(`${t('error')}: ${err.message}`));
}

function cheerBadge(id) {
  api(`/achievements/${id}`, { method: 'POST', body: { action: 'cheer', user_id: state.user.id } })
    .then(() => { closeSheet(); toast(t('cheerSent')); loadAchievements(); })
    .catch((err) => toast(`${t('error')}: ${err.message}`));
}

function fmtHours(seconds) {
  const h = Math.floor((Number(seconds) || 0) / 3600);
  const m = Math.round(((Number(seconds) || 0) % 3600) / 60);
  return h > 0 ? `${fmtNumber(h)} ${t('hoursShort')} ${m} ${t('minutes')}` : `${m} ${t('minutes')}`;
}

// What the two of you thought about the last books, in one place.
function recentReviewsHtml() {
  const rows = state.recentReviews;
  if (!rows || !rows.length) return '';
  return `<h3 style="margin-top:20px">${esc(t('whatWeThought'))}</h3>
    <div class="list" style="margin-top:8px">${rows.slice(0, 8).map((r) => `
      <button class="history-row" data-action="open-book-sheet" data-id="${esc(r.book_id)}">
        ${coverHtml(r, 'hist-cover')}
        <div style="min-width:0;text-align:left">
          <div style="font-weight:700">${esc(r.book_title)}</div>
          <div class="muted small">${esc(r.user_name)}${r.text ? `: ${esc(r.text.slice(0, 60))}${r.text.length > 60 ? '…' : ''}` : ''}</div>
        </div>
        ${r.rating ? nooksHtml(r.rating) : ''}
      </button>`).join('')}</div>`;
}

function statsSheetHtml() {
  const st = state.stats;
  if (!st) return '<p class="muted small">…</p>';
  const mine = (state.achievements.mine || []);
  const nextHours = [1, 5, 10, 25, 50, 100, 200, 350, 500, 750, 1000].find((h) => st.total_seconds / 3600 < h);
  const maxDay = Math.max(1, ...st.days.map((d) => d.seconds));
  return `<h3 class="center">${esc(t('stats'))}</h3>
    <div class="stat-big">${esc(fmtHours(st.total_seconds))}</div>
    <p class="muted small center" style="margin-top:-6px">${esc(t('totalListened'))}</p>
    <div class="stat-grid">
      ${st.per_user.map((u) => `<div class="stat-cell"><div class="stat-num">${esc(fmtNumber(Math.floor(u.total / 3600)))}</div><div class="muted small">${esc(u.name)} · ${esc(t('hoursShort'))}</div></div>`).join('')}
      <div class="stat-cell"><div class="stat-num">${st.finished_books}</div><div class="muted small">${esc(t('booksFinished'))}</div></div>
    </div>
    ${st.days.length ? `<div class="spark">${[...st.days].reverse().map((d) => `<span style="height:${Math.max(6, Math.round((d.seconds / maxDay) * 100))}%" title="${esc(d.day)}"></span>`).join('')}</div>
      <p class="muted small center" style="margin-top:2px">${esc(t('lastDays'))}</p>` : ''}
    ${recentReviewsHtml()}
    <h3 style="margin-top:20px">${esc(t('badges'))}</h3>
    ${nextHours ? `<p class="muted small" style="margin-top:-6px">${esc(t('nextBadge'))} ${esc(badgeName(`hours-${nextHours}`))} · ${esc(fmtHours(nextHours * 3600 - st.total_seconds))} ${esc(t('toGo'))}</p>` : ''}
    ${mine.length ? `<div class="badge-grid">${mine.map((a) => `
        <button class="badge-tile ${a.shared_at ? 'shared' : ''}" data-action="badge-detail" data-id="${a.id}">
          <img src="/img/nook-pixel.png" alt="">
          <span>${esc(badgeName(a.code))}</span>
        </button>`).join('')}</div>`
      : `<p class="muted small">${esc(t('noBadges'))}</p>`}`;
}


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
  if (state.sheet && (state.sheet.type === 'wish' || state.sheet.type === 'invite')) {
    const first = document.getElementById('wish-title') || document.getElementById('invite-label');
    if (first && document.activeElement !== first) first.focus();
  }
  if (state.sheet && state.sheet.type === 'chapters') {
    const current = app.querySelector('.sheet .track.current');
    if (current) current.scrollIntoView({ block: 'center' });
  }
}

function shell(content) {
  const mini = state.now ? renderMini() : '';
  const banner = state.offline ? `<div class="offline-bar">${ICON.cloud}<span>${esc(t('offlineMode'))}</span></div>` : '';
  return `<div class="screen ${state.now ? 'with-mini' : ''}">${banner}${content}</div>${mini}${renderNav()}`;
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
  return `<div class="locked">
    <img class="hero" src="/img/nook-pixel.png" alt="">
    <h1>${esc(t('locked'))}</h1>
    <p class="muted" style="max-width:340px">${esc(t('lockedHint'))}</p>
    <div class="form" style="width:100%;max-width:340px;margin-top:8px">
      <label><span>${esc(t('pasteLink'))}</span><input id="unlock" autocomplete="off" placeholder="https://…/einladung/…"></label>
      <button class="primary" data-action="unlock">${esc(t('unlock'))}</button>
    </div>
  </div>`;
}

// Accepts a full invite link, a secret link, or just the token or key pasted on its own.
async function unlock() {
  const raw = ((document.getElementById('unlock') || {}).value || '').trim();
  if (!raw) return;
  const token = (raw.match(/einladung\/([a-f0-9]{32})/) || [])[1] || (/^[a-f0-9]{32}$/.test(raw) ? raw : null);
  const key = (raw.match(/[#&]k=([^&\s]+)/) || [])[1] || (!token && /^[a-f0-9]{24,}$/.test(raw) ? raw : null);
  try {
    let res;
    if (token) res = await fetch('/api/invite/redeem', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
    else if (key) res = await fetch('/api/session', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key }) });
    else return toast(t('unlockFailed'));
    if (!res.ok) {
      const info = await res.json().catch(() => ({}));
      return toast(info.error === 'used' ? t('inviteUsed') : info.error === 'expired' ? t('inviteExpired') : t('unlockFailed'));
    }
    location.href = '/#/home';
  } catch {
    toast(t('unlockFailed'));
  }
}

function avatarHtml(user, cls = 'avatar') {
  if (user.has_avatar) return `<span class="${cls}"><img src="/media/avatar/${user.id}?v=${state.avatarVersion}" alt=""></span>`;
  return `<span class="${cls}" style="background:${esc(user.color)}">${esc(initials(user.name))}</span>`;
}

function renderProfiles() {
  return `<div class="profiles">
    <img class="hero wake" src="/img/nook-pixel.png" alt="Mr. Nook">
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
  const id = book.id || book.book_id;
  const title = book.title || book.book_title;
  if (book.has_cover && id) return `<img class="${cls}" src="/media/${esc(id)}/${big ? 'cover' : 'thumb'}" alt="" loading="lazy" decoding="async">`;
  return `<div class="${cls}">${esc(initials(title))}</div>`;
}
function pctOf(book) {
  const duration = Number(book.duration_sec) || 0;
  const pos = Number(book.position_sec ?? book.progress?.position_sec) || 0;
  const finished = book.finished ?? book.progress?.finished;
  if (finished) return 100;
  return duration > 0 ? Math.min(100, Math.round((pos / duration) * 100)) : 0;
}
function ratingBadgeHtml(book) {
  const mine = Number(book.my_rating) || 0;
  const theirs = Number(book.their_rating) || 0;
  if (!mine && !theirs) return '';
  return `<div class="tile-rating">
      ${mine ? `<span class="pip mine"><img src="/img/nook-pixel.png" alt="">${mine}</span>` : ''}
      ${theirs ? `<span class="pip theirs"><img src="/img/nook-pixel.png" alt="">${theirs}</span>` : ''}
    </div>`;
}

function tileHtml(book) {
  const pct = pctOf(book);
  const dimmed = state.offline && !isDownloaded(book.id);
  return `<button class="tile ${dimmed ? 'dimmed' : ''}" data-action="open-book" data-id="${esc(book.id)}">
    ${coverHtml(book)}
    <div class="title">${esc(book.title)}</div>
    <div class="muted small">${esc(book.author || '')}</div>
    ${ratingBadgeHtml(book)}
    ${pct > 0 ? `<div class="progress"><span style="width:${pct}%"></span></div>` : ''}
  </button>`;
}

// ---- home

function openWishesHtml() {
  const open = (state.wishes || []).filter((w) => w.status !== 'done');
  if (!open.length) return '';
  return `<section class="section">
      <div class="section-head"><h2>${esc(t('wishes'))}</h2><span class="muted small">${open.length}</span></div>
      <div class="list">${open.slice(0, 4).map((w) => `
        <div class="wish-row">
          <div style="min-width:0">
            <div style="font-weight:700">${esc(w.title)}</div>
            <div class="muted small">${esc([w.author, `${t('wishFrom')} ${w.user_name}`].filter(Boolean).join(' · '))}</div>
          </div>
          <button class="small ghost" data-action="wish-status" data-id="${w.id}" data-status="done">${esc(t('markDone'))}</button>
        </div>`).join('')}</div>
    </section>`;
}

function lastSleepHintHtml(book) {
  const run = state.lastSleepRun;
  if (!run || run.book_id !== book.id) return '';
  // A three-week-old night is not an offer, it is a trap.
  if (run.stopped_at && Date.now() - run.stopped_at > 18 * 3600000) return '';
  const target = Number(run.awake_sec) || Number(run.started_sec) || 0;
  const pos = Number(book.position_sec) || 0;
  const stop = Number(run.stopped_sec) || target;
  // Outside the span, or already listened past the mark: nothing left to offer.
  if (pos < target - 60 || pos > stop + 60) return '';
  return `<button class="sleep-hint" data-action="play-chapter" data-id="${esc(book.id)}" data-sec="${target}">
      ${ICON.moon}<span>${esc(t('backToAwake'))} ${fmtTime(target)}</span>
    </button>`;
}

function renderHome() {
  const u = state.user;
  const books = state.books;
  const continueBook = books.find((b) => b.position_sec > 0 && !b.finished && b.last_played > 0) || books.find((b) => b.position_sec > 0 && !b.finished);
  const recentlyAdded = [...books].sort((a, b) => b.created_at - a.created_at).slice(0, 10);
  const recentlyPlayed = books.filter((b) => b.last_played > 0 && b.position_sec > 0 && (!continueBook || b.id !== continueBook.id)).sort((a, b) => b.last_played - a.last_played).slice(0, 10);
  const favorites = books.filter((b) => b.favorite);

  let hero;
  if (!books.length) {
    hero = `<div class="empty card"><img class="hero small" src="/img/nook-pixel.png" alt=""><p><strong>${esc(t('emptyNook'))}</strong></p><p class="muted small">${esc(t('addHint'))}</p></div>`;
  } else if (continueBook) {
    const chapterIdx = state.now && state.now.id === continueBook.id ? chapterIndexAt(state.now, currentPos()) : -1;
    const remaining = fmtDuration(Math.max(0, (continueBook.duration_sec - continueBook.position_sec) / (settings.speed || 1))) + ' ' + t('left');
    const chapterLine = chapterIdx >= 0 ? `${chapterTitle(state.now, chapterIdx)} · ${remaining}` : remaining;
    hero = `<section class="section" style="margin-top:0">
      <div class="section-head"><h2>${esc(t('continueListening'))}</h2></div>
      <div class="continue" role="button" data-action="open-book" data-id="${esc(continueBook.id)}">
        ${coverHtml(continueBook)}
        <div style="min-width:0">
          <div class="title">${esc(continueBook.title)}</div>
          <div class="muted small">${esc(continueBook.author || '')}</div>
          <div class="muted small" style="margin-top:4px">${esc(chapterLine)}</div>
          <div class="progress" style="margin-top:8px"><span style="width:${pctOf(continueBook)}%"></span></div>
          ${lastSleepHintHtml(continueBook)}
        </div>
        <button class="play" data-action="play-book" data-id="${esc(continueBook.id)}" aria-label="${esc(t('play'))}">${ICON.play}</button>
      </div>
    </section>`;
  } else {
    hero = `<div class="empty card"><img class="hero small" src="/img/nook-pixel.png" alt=""><p class="muted">${esc(t('pickSomething'))}</p></div>`;
  }

  const shelf = (title, list) => list.length ? `<section class="section"><div class="section-head"><h2>${esc(title)}</h2></div><div class="shelf">${list.map(tileHtml).join('')}</div></section>` : '';

  return `<header class="topbar">
      <div style="min-width:0">
        <div class="row" style="gap:8px"><img class="logo" src="/img/nook-pixel.png" alt="Mr. Nook"><div><div class="muted small">${esc(greeting())}, ${esc(u.name)}</div><div class="saying">${esc(saying())}</div></div></div>
      </div>
      <div class="row" style="gap:6px">
        <button class="icon ghost" data-action="sheet-stats" aria-label="${esc(t('stats'))}">${ICON.star}</button>
        <button class="avatar" data-action="switch-user" aria-label="${esc(t('switchProfile'))}" style="background:${esc(u.color)}">${u.has_avatar ? `<img src="/media/avatar/${u.id}?v=${state.avatarVersion}" alt="">` : esc(initials(u.name))}</button>
      </div>
    </header>
    ${hero}
    ${shelf(t('recentlyAdded'), recentlyAdded)}
    ${shelf(t('recentlyPlayed'), recentlyPlayed)}
    ${shelf(t('favorites'), favorites)}
    ${openWishesHtml()}
    <section class="section">
      <div class="wish-card">
        <img src="/img/nook-pixel.png" alt="" class="wish-mascot">
        <div>
          <div style="font-weight:800">${esc(t('wishBook'))}</div>
          <div class="muted small">${esc(t('wishHint'))}</div>
        </div>
        <button class="primary small" data-action="sheet-wish">${esc(t('wishBook'))}</button>
      </div>
    </section>`;
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
    case 'rating': {
      const best = (b) => Math.max(Number(b.my_rating) || 0, Number(b.their_rating) || 0);
      return copy.sort((a, b) => best(b) - best(a) || cmpText(a.title, b.title));
    }
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
    body = `<div class="empty"><img class="hero small" src="/img/nook-pixel.png" alt=""><p><strong>${esc(t('emptyNook'))}</strong></p><p class="muted small">${esc(t('addHint'))}</p></div>`;
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
        <button class="icon ghost" data-action="toggle-view" aria-label="${esc(t('viewToggle'))}">${settings.libView === 'grid' ? ICON.list : ICON.grid}</button>
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
  return `<button class="track ${i === currentIdx ? 'current' : ''}" data-action="play-chapter" data-id="${esc(book.id)}" data-sec="${Number(c.start_sec)}" data-idx="${i}">
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

  // Always shown, so the way to all bookmarks is not hidden behind having one here.
  const bookmarks = `<section class="section">
      <div class="section-head">
        <h2>${esc(t('bookmarks'))}${b.bookmarks.length ? ` <span class="muted small">${b.bookmarks.length}</span>` : ''}</h2>
        <button class="link small" data-action="sheet-bookmarks" data-id="${esc(b.id)}">${esc(b.bookmarks.length ? t('manage') : t('addBookmarkHere'))}</button>
      </div>
      ${b.bookmarks.length ? `<div class="list">${b.bookmarks.map((bm) => bookmarkHtml(b, bm)).join('')}</div>` : ''}
    </section>`;

  return `<header class="topbar">
      <button class="icon ghost" data-action="back" aria-label="${esc(t('back'))}">${ICON.back}</button>
    </header>
    <div class="detail">
      ${coverHtml(b, 'cover-large')}
      <div class="center">
        <h1 style="font-size:22px">${esc(b.title)}</h1>
        <div class="muted">${esc(b.author || '')}</div>
        <div class="muted small" id="detail-pct" style="margin-top:6px">${pct} % · ${esc(fmtDuration(Math.max(0, (duration - pos) / (settings.speed || 1))))} ${esc(t('left'))}${progress.finished ? ` · ${esc(t('finished'))}` : ''}</div>
      </div>
      <div class="progress"><span id="detail-bar" style="width:${pct}%"></span></div>
      <button class="primary big-play" data-action="play-book" data-id="${esc(b.id)}" data-big-play="${esc(b.id)}">${playing ? ICON.pause : ICON.play}<span>${esc(label)}</span></button>
      <div class="actions">
        <button class="${progress.favorite ? 'on' : ''}" data-action="fav" data-id="${esc(b.id)}">${ICON.heart}${esc(t('favorite'))}</button>
        <button class="${progress.finished ? 'on' : ''}" data-action="toggle-finished" data-id="${esc(b.id)}">${ICON.check}${esc(progress.finished ? t('markUnfinished') : t('markFinished'))}</button>
        <button data-action="restart" data-id="${esc(b.id)}">${ICON.restart}${esc(t('restart'))}</button>
      </div>
      ${bookmarks}
      ${sleepHistoryHtml(b)}
      <section class="section" style="margin-top:8px">
        <div class="section-head"><h2>${esc(t('chapters'))}</h2><span class="muted small">${total || 1}</span></div>
        <div class="tracklist">${chapters}</div>
        ${moreChapters}
      </section>
      <section class="section">
        ${ratingRowHtml(b)}
        <div style="margin-top:10px">${downloadRowHtml(b)}</div>
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
  if (state.results === null) {
    const recent = state.books.filter((b) => b.position_sec > 0).slice(0, 6);
    body = recent.length
      ? `<div class="section-head" style="margin-top:8px"><h2>${esc(t('recentlyPlayed'))}</h2></div><div class="list">${recent.map(listItemHtml).join('')}</div>`
      : `<div class="empty"><img class="hero small" src="/img/nook-pixel.png" alt=""><p class="muted">${esc(t('searchIdle'))}</p></div>`;
  }
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
  const label = ((document.getElementById('invite-label') || {}).value || '').trim();
  try {
    const invite = await api('/invites', { method: 'POST', body: { label, days: 14 } });
    state.invites = [invite, ...(state.invites || [])];
    closeSheet();
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

function downloadRowHtml(book) {
  const busy = state.downloading && state.downloading.bookId === book.id;
  if (busy) {
    return `<div class="source busy">
        <span class="src-icon">${ICON.downloadIcon}</span>
        <div style="flex:1;min-width:0">
          <div class="label" id="dl-label">${esc(t('downloading'))} ${state.downloading.pct} %</div>
          <div class="progress" style="margin-top:6px"><span id="dl-bar" style="width:${state.downloading.pct}%"></span></div>
        </div>
        <button class="small" data-action="cancel-download">${esc(t('cancel'))}</button>
      </div>`;
  }
  const have = isDownloaded(book.id);
  return `<div class="source ${have ? 'offline' : ''}">
      <span class="src-icon">${have ? ICON.phone : ICON.cloud}</span>
      <div style="flex:1;min-width:0">
        <div class="label">${esc(have ? t('downloaded') : t('streaming'))}</div>
        <div class="muted small">${esc(have ? t('offlineHint') : t('streamHint'))} ${esc(fmtBytes(book.size_bytes))}</div>
      </div>
      ${have
        ? `<button class="icon" data-action="remove-download" data-id="${esc(book.id)}" aria-label="${esc(t('removeDownload'))}">${ICON.trash}</button>`
        : `<button class="small" data-action="download" data-id="${esc(book.id)}">${esc(t('download'))}</button>`}
    </div>`;
}

function wishRowsHtml() {
  if (state.wishes === null) return '';
  if (!state.wishes.length) return `<div class="setting"><span class="hint">${esc(t('noWishes'))}</span></div>`;
  return state.wishes.map((w) => `<div class="setting">
      <div style="min-width:0">
        <div class="label" style="${w.status === 'done' ? 'text-decoration:line-through;opacity:0.6' : ''}">${esc(w.title)}</div>
        <div class="hint">${esc([w.author, w.note].filter(Boolean).join(' · '))}${w.author || w.note ? ' · ' : ''}${esc(t('wishFrom'))} ${esc(w.user_name)}</div>
      </div>
      <div class="row" style="gap:6px;flex:none">
        <button class="link" data-action="wish-status" data-id="${w.id}" data-status="${w.status === 'done' ? 'open' : 'done'}">${esc(w.status === 'done' ? t('reopen') : t('markDone'))}</button>
        <button class="link" style="color:var(--terracotta)" data-action="wish-delete" data-id="${w.id}">${esc(t('delete'))}</button>
      </div>
    </div>`).join('');
}

function securityRowHtml() {
  const sec = state.security;
  const on = sec ? sec.https : location.protocol === 'https:';
  const detail = sec && sec.tls_version
    ? `${sec.tls_version} · ${sec.tls_cipher}${sec.http_version ? ` · ${sec.http_version}` : ''}`
    : (on ? 'TLS' : '');
  return `<div class="setting">
      <div class="row" style="min-width:0">
        <span class="src-icon ${on ? 'ok' : 'bad'}">${ICON.lock}</span>
        <div style="min-width:0">
          <div class="label">${esc(on ? t('encrypted') : t('notEncrypted'))}</div>
          <div class="hint" style="word-break:break-all">${esc(detail)}</div>
        </div>
      </div>
    </div>
    <div class="setting"><div class="hint">${esc(t('securityHint'))}</div></div>`;
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
    <h3 class="muted" style="margin-top:22px">${esc(t('wishes'))}</h3>
    <div class="settings-group">
      <div class="setting"><div><div class="label">${esc(t('wishBook'))}</div><div class="hint">${esc(t('wishHint'))}</div></div><button class="link" data-action="sheet-wish">${esc(t('wishBook'))}</button></div>
      ${wishRowsHtml()}
    </div>
    <h3 class="muted" style="margin-top:22px">${esc(t('invites'))}</h3>
    <div class="settings-group">
      <div class="setting"><div><div class="label">${esc(t('newInvite'))}</div><div class="hint">${esc(t('inviteHint'))}</div></div><button class="link" data-action="new-invite">${esc(t('newInvite'))}</button></div>
      ${renderInviteRows()}
    </div>
    <h3 class="muted" style="margin-top:22px">${esc(t('libraryHeading'))}</h3>
    <div class="settings-group">
      <div class="setting"><div><div class="label">${esc(t('addAudiobook'))}</div><div class="hint">${esc(t('addHint'))}</div></div></div>
      <div class="setting"><div><div class="label">${esc(t('history'))}</div><div class="hint">${esc(t('historyHint'))}</div></div><button class="link" data-action="sheet-history">${esc(t('show'))}</button></div>
      <div class="setting"><span class="label">${esc(t('refreshLibrary'))}</span><button class="link" data-action="refresh">${esc(t('refreshLibrary'))}</button></div>
    </div>
    <h3 class="muted" style="margin-top:22px">${esc(t('about'))}</h3>
    <div class="settings-group">
      <div class="setting"><div class="row"><img src="/icons/icon-192.png" width="40" height="40" style="border-radius:10px" alt=""><div><div class="label">Mr. Nook</div><div class="hint">${esc(t('version'))} ${APP_VERSION}</div></div></div></div>
      ${securityRowHtml()}
      <div class="setting"><span class="label">${esc(t('sourceCode'))}</span><a href="${GITHUB_URL}" target="_blank" rel="noopener">GitHub</a></div>
      <div class="setting"><div><div class="label">${esc(t('licenses'))}</div><div class="hint">${esc(t('licensesText'))}</div></div></div>
    </div>`;
}

// ---- mini player & full player

function renderMini() {
  const b = state.now;
  const idx = chapterIndexAt(b, currentPos());
  if (state.miniCollapsed) {
    return `<button class="mini-pill" data-action="expand-mini" aria-label="${esc(t('nowPlaying'))}">
        ${coverHtml(b, 'pill-cover')}
        <span class="pill-dot ${audio.paused ? '' : 'live'}"></span>
      </button>`;
  }
  return `<div class="mini" role="button" data-action="open-player">
    <span class="bar" id="mini-bar"></span>
    ${coverHtml(b)}
    <div class="text"><div style="font-weight:700">${esc(b.title)}</div><div class="muted small" id="mini-sub">${esc(idx >= 0 ? chapterTitle(b, idx) : b.author || '')}</div></div>
    <button class="mini-sleep ${sleepActive() ? 'on' : ''}" data-action="sheet-sleep" aria-label="${esc(t('sleepTimer'))}">${ICON.moon}<span id="mini-sleep">${esc(sleepShort())}</span></button>
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
          <button class="time-toggle" data-action="toggle-total" id="time-remaining"></button>
        </div>
      </div>
      <div class="controls">
        ${b.chapters.length ? `<button class="icon step" data-action="step-chapter" data-dir="-1" aria-label="${esc(t('prevChapter'))}">${ICON.prev}</button>` : ''}
        <button class="icon skip" data-action="skip" data-delta="-${settings.skipBack}" aria-label="-${settings.skipBack}s">${ICON.skipBack}<small>${settings.skipBack}</small></button>
        <button class="icon big" data-action="toggle-play" data-play-button aria-label="${esc(t('play'))}">${ICON.play}</button>
        <button class="icon skip" data-action="skip" data-delta="${settings.skipFwd}" aria-label="+${settings.skipFwd}s">${ICON.skipFwd}<small>${settings.skipFwd}</small></button>
        ${b.chapters.length ? `<button class="icon step" data-action="step-chapter" data-dir="1" aria-label="${esc(t('nextChapter'))}">${ICON.next}</button>` : ''}
      </div>
      <div class="toolbar">
        <button data-action="sheet-chapters" data-id="${esc(b.id)}" ${b.chapters.length ? '' : 'disabled'}>${ICON.chapters}<span>${esc(t('chapters'))}</span></button>
        <button data-action="sheet-sleep" class="${sleepActive() ? 'on' : ''}">${ICON.moon}<span id="sleep-label">${esc(sleepLabel())}</span></button>
        <button data-action="sheet-speed">${ICON.gauge}<span>${settings.speed}×</span></button>
        <button data-action="sheet-bookmarks" data-id="${esc(b.id)}">${ICON.bookmark}<span>${esc(t('bookmarks'))}${b.bookmarks.length ? ` ${b.bookmarks.length}` : ''}</span></button>
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
  } else if (s.type === 'bookmarks') {
    const book = [state.now, state.detail].find((b) => b && b.id === s.bookId) || state.now;
    const all = s.scope === 'all';
    const rows = all ? state.allBookmarks : (book ? book.bookmarks : []);
    body = `<h3>${esc(t('bookmarks'))} ${rows ? `<span class="muted small">${rows.length}</span>` : ''}</h3>
      ${book ? `<div class="chips" style="margin:10px 0 12px">
        <button data-action="bookmark-scope" data-scope="book" class="${all ? '' : 'active'}">${esc(t('thisBook'))}</button>
        <button data-action="bookmark-scope" data-scope="all" class="${all ? 'active' : ''}">${esc(t('allBooks'))}</button>
      </div>` : ''}
      ${!all && book ? `<button class="primary" style="width:100%;margin-bottom:12px" data-action="add-bookmark">${esc(t('addBookmarkHere'))}</button>` : ''}
      ${rows === null || rows === undefined ? '<p class="muted small">…</p>'
        : rows.length
          ? `<div class="list">${rows.map((bm) => (all ? `
              <div class="bookmark">
                <button class="jump" data-action="open-bookmark" data-id="${esc(bm.book_id)}" data-sec="${Number(bm.position_sec)}">
                  ${fmtTime(bm.position_sec)}<small>${esc(bm.book_title)}</small>
                </button>
                <span class="small">${esc(bm.note || '')}</span>
                <button class="del" data-action="delete-bookmark" data-id="${bm.id}" aria-label="${esc(t('delete'))}">${ICON.close}</button>
              </div>` : bookmarkHtml(book, bm))).join('')}</div>`
          : `<p class="muted small center">${esc(t('noBookmarks'))}</p>`}`;
  } else if (s.type === 'rating') {
    const book = [state.detail, state.now].find((b) => b && b.id === s.bookId) || state.detail;
    if (!book) return '';
    body = `<h3 class="center">${esc(book.title)}</h3>${reviewSectionHtml(book).replace('<section class="section">', '<div>').replace('</section>', '</div>')}`;
  } else if (s.type === 'stats') {
    body = statsSheetHtml();
  } else if (s.type === 'badge') {
    const a = s.achievement;
    body = `<div class="center">
        <img class="badge-hero" src="/img/nook-pixel.png" alt="">
        <h3>${esc(t('badgeEarned'))}</h3>
        <div class="badge-name">${esc(badgeName(a.code))}</div>
        <p class="muted small">${esc(badgeLine(a.code))}</p>
        <div class="chips" style="justify-content:center;margin-top:14px">
          ${a.shared_at ? `<span class="badge">${esc(t('alreadyShared'))}</span>` : `<button class="primary" data-action="share-badge" data-id="${a.id}">${esc(t('tellOther'))}</button>`}
          <button data-action="close-sheet">${esc(t('close'))}</button>
        </div>
      </div>`;
  } else if (s.type === 'cheer-ask') {
    const a = s.achievement;
    body = `<div class="center">
        <img class="badge-hero" src="/img/nook-pixel.png" alt="">
        <h3>${esc(a.user_name)} ${esc(t('reached'))}</h3>
        <div class="badge-name">${esc(badgeName(a.code))}</div>
        <p class="muted small">${esc(badgeLine(a.code))}</p>
        <div class="chips" style="justify-content:center;margin-top:14px">
          <button class="primary" data-action="cheer-badge" data-id="${a.id}">${esc(t('congratulate'))}</button>
          <button data-action="close-sheet">${esc(t('later'))}</button>
        </div>
      </div>`;
  } else if (s.type === 'cheer-got') {
    const a = s.achievement;
    body = `<div class="center">
        <img class="badge-hero" src="/img/nook-pixel.png" alt="">
        <h3>${esc(a.cheer_name)} ${esc(t('cheersYou'))}</h3>
        <div class="badge-name">${esc(badgeName(a.code))}</div>
        <div class="chips" style="justify-content:center;margin-top:14px">
          <button class="primary" data-action="close-sheet">${esc(t('nice'))}</button>
        </div>
      </div>`;
  } else if (s.type === 'history') {
    const rows = state.history;
    const naps = state.sleepLog || [];
    const napFor = (bookId, at) => naps.find((n) => n.book_id === bookId && Math.abs(n.stopped_at - at) < 3 * 3600000);
    body = `<h3>${esc(t('history'))}</h3>
      <p class="muted small" style="margin:-4px 0 12px">${esc(t('historyHint'))}</p>
      ${rows === null ? '<p class="muted small">…</p>'
        : rows.length
          ? `<div class="list">${rows.map((row) => {
              const nap = napFor(row.book_id, row.updated_at);
              const napTarget = nap ? Math.max(Number(nap.started_sec) || 0, Number(nap.awake_sec) || 0, Number(nap.hidden_sec) || 0) : 0;
              return `<div class="history-row">
                ${coverHtml(row, 'hist-cover')}
                <div style="min-width:0">
                  <div style="font-weight:700">${esc(row.title)}</div>
                  <div class="muted small">${esc(nightLabel(row.updated_at))} · ${esc(t('upTo'))} ${esc(fmtDuration(row.position_sec))}${row.finished ? ` · ${esc(t('finished'))}` : ''}</div>
                  ${nap ? `<div class="muted small">${esc(t('lastAwakeIn'))} ${fmtTime(napTarget)}</div>` : ''}
                </div>
                <div class="row" style="gap:6px;flex:none">
                  ${nap ? `<button class="small" data-action="open-bookmark" data-id="${esc(row.book_id)}" data-sec="${napTarget}">${esc(t('jumpBack'))}</button>` : ''}
                  <button class="small ${nap ? 'ghost' : ''}" data-action="open-bookmark" data-id="${esc(row.book_id)}" data-sec="${Number(row.position_sec)}">${esc(t('resume'))}</button>
                </div>

              </div>`;
            }).join('')}</div>`
          : `<p class="muted small center">${esc(t('noHistory'))}</p>`}`;
  } else if (s.type === 'invite') {
    body = `<h3 class="center">${esc(t('newInvite'))}</h3>
      <p class="muted small center" style="margin-top:0">${esc(t('inviteHint'))}</p>
      <div class="form">
        <label><span>${esc(t('inviteFor'))}</span><input id="invite-label" maxlength="60" autocomplete="off" placeholder="Katie"></label>
        <button class="primary" data-action="create-invite">${esc(t('newInvite'))}</button>
      </div>`;
  } else if (s.type === 'wish') {
    body = `<h3 class="center">${esc(t('wishBook'))}</h3>
      <p class="muted small center" style="margin-top:0">${esc(t('wishHint'))}</p>
      <div class="form">
        <label><span>${esc(t('wishTitle'))}</span><input id="wish-title" maxlength="200" autocomplete="off"></label>
        <label><span>${esc(t('wishAuthor'))}</span><input id="wish-author" maxlength="200" autocomplete="off"></label>
        <label><span>${esc(t('wishNote'))}</span><input id="wish-note" maxlength="500" autocomplete="off"></label>
        <button class="primary" data-action="submit-wish">${esc(t('wishSend'))}</button>
      </div>`;
  } else if (s.type === 'sleep') {
    body = `<img class="mascot" src="/img/nook-pixel.png" alt=""><h3 class="center">${esc(t('sleepTimer'))}</h3>
      <p class="muted small center" style="margin-top:0">${esc(t('sleepHint'))}</p>
      <div class="chips" style="justify-content:center">
        <button data-action="sleep" data-min="0" class="${sleepActive() ? '' : 'active'}">${esc(t('off'))}</button>
        ${SLEEP_MINUTES.map((m) => `<button data-action="sleep" data-min="${m}" class="${state.sleep.minutes === m ? 'active' : ''}">${m} ${esc(t('minutes'))}</button>`).join('')}
        ${sleepActive() ? `<button data-action="extend-sleep" data-min="5">+5 ${esc(t('minutes'))}</button>` : ''}
        ${hasRealChapters(state.now) ? `<button data-action="sleep" data-min="-1" class="${state.sleep.endOfChapter ? 'active' : ''}">${esc(t('endOfChapter'))}</button>` : ''}
      </div>`;
  } else if (s.type === 'speed') {
    body = `<h3 class="center">${esc(t('speed'))}</h3>
      <p class="muted small center" style="margin-top:0">${esc(t('speedSticks'))}</p>
      <div class="speed-value">${settings.speed}×</div>
      <input type="range" id="speed-slider" min="0.5" max="3" step="0.05" value="${settings.speed}" style="--pct:${((settings.speed - 0.5) / 2.5) * 100}%">
      <div class="chips" style="justify-content:center;margin-top:12px">${SPEEDS.map((v) => `<button data-action="speed" data-value="${v}" class="${settings.speed === v ? 'active' : ''}">${v}×</button>`).join('')}</div>`;
  } else if (s.type === 'sort') {
    const options = [['lastPlayed', t('sortLastPlayed')], ['added', t('sortAdded')], ['title', t('sortTitle')], ['author', t('sortAuthor')], ['progress', t('sortProgress')], ['rating', t('sortRating')]];
    body = `<h3>${esc(t('sortBy'))}</h3>${options.map(([k, label]) => `<button class="option ${settings.libSort === k ? 'active' : ''}" data-action="sort" data-value="${k}"><span>${esc(label)}</span>${settings.libSort === k ? ICON.check : ''}</button>`).join('')}`;
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
  return `<div class="scrim" data-action="close-sheet"></div><div class="sheet"><button class="grip" data-action="close-sheet" aria-label="${esc(t('close'))}"></button><div class="inner">${body}</div></div>`;
}

// ---- live UI updates (no re-render)

// Keeps the "playing now" chapter marked while playback moves, without re-rendering.
function updateTrackHighlight(idx) {
  const playing = !audio.paused && !audio.ended;
  app.querySelectorAll('.tracklist').forEach((list) => {
    const tracks = list.querySelectorAll('.track');
    if (!tracks.length) return;
    // A list may show a window of chapters, so trust each track's own index.
    tracks.forEach((track) => {
      const own = Number(track.dataset.idx);
      const isCurrent = own === idx;
      if (track.classList.contains('current') !== isCurrent) track.classList.toggle('current', isCurrent);
      const slot = track.firstElementChild;
      if (!slot) return;
      const wantEq = isCurrent && state.now && track.dataset.id === state.now.id;
      const hasEq = !!slot.querySelector('.eq');
      if (wantEq && !hasEq) slot.innerHTML = eqHtml(playing);
      else if (!wantEq && hasEq) slot.textContent = String(own + 1);
    });
  });
}

function updatePlayUi() {
  const playing = !audio.paused && !audio.ended && !!state.now;
  app.querySelectorAll('[data-play-button]').forEach((btn) => {
    btn.innerHTML = playing ? ICON.pause : ICON.play;
    btn.setAttribute('aria-label', playing ? t('pause') : t('play'));
  });
  // The detail page button carries a label, and only reacts for the book on screen.
  app.querySelectorAll('[data-big-play]').forEach((btn) => {
    const isThisBook = state.now && state.now.id === btn.dataset.bigPlay;
    const active = playing && isThisBook;
    const book = state.detail;
    const progress = (book && book.progress) || {};
    const pos = isThisBook ? currentPos() : Number(progress.position_sec) || 0;
    const label = active ? t('pause') : progress.finished ? t('startOver') : pos > 0 ? t('resume') : t('play');
    btn.innerHTML = `${active ? ICON.pause : ICON.play}<span>${esc(label)}</span>`;
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
  if (percent) percent.textContent = `${fmtNumber(Math.round(pct))} %`;
  const idx = chapterIndexAt(state.now, pos);
  const chapterNow = document.getElementById('chapter-now');
  if (chapterNow) chapterNow.textContent = idx >= 0 ? chapterTitle(state.now, idx) : '';
  updateTrackHighlight(idx);
  const detailPct = document.getElementById('detail-pct');
  if (detailPct && state.detail && state.now && state.detail.id === state.now.id) {
    const dur = Number(state.detail.duration_sec) || 0;
    const fin = state.detail.progress && state.detail.progress.finished;
    detailPct.textContent = `${fin ? 100 : dur > 0 ? Math.round((pos / dur) * 100) : 0} % · ${fmtDuration(Math.max(0, (dur - pos) / (audio.playbackRate || 1)))} ${t('left')}${fin ? ` · ${t('finished')}` : ''}`;
    const bar = document.getElementById('detail-bar');
    if (bar) bar.style.width = `${dur > 0 ? Math.min(100, (pos / dur) * 100) : 0}%`;
  }
  const miniBar = document.getElementById('mini-bar');
  if (miniBar) miniBar.style.width = `${pct}%`;
  const miniSub = document.getElementById('mini-sub');
  if (miniSub) miniSub.textContent = idx >= 0 ? chapterTitle(state.now, idx) : `${fmtTime(pos)} · ${fmtNumber(pct)} %`;
}

let toastTimer;
function toast(message, actionLabel, onAction) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = '';
  const text = document.createElement('span');
  text.textContent = message;
  el.appendChild(text);
  if (actionLabel && onAction) {
    const action = document.createElement('button');
    action.className = 'toast-action';
    action.textContent = actionLabel;
    action.addEventListener('click', () => {
      el.classList.remove('show');
      clearTimeout(toastTimer);
      onAction();
    });
    el.appendChild(action);
  }
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), actionLabel ? 6000 : 2000);
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
    case 'unlock': unlock(); break;
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
    case 'toggle-play': markAwake(); togglePlay(); break;
    case 'skip': markAwake(); skip(Number(target.dataset.delta)); break;
    case 'step-chapter': markAwake(); stepChapter(Number(target.dataset.dir)); break;
    case 'delete-sleep': deleteSleepRun(Number(id)); break;
    case 'extend-sleep': extendSleep(Number(target.dataset.min)); break;
    case 'toggle-total': state.showTotal = !state.showTotal; updateTimeUi(); break;
    case 'sheet-chapters': openSheet({ type: 'chapters', bookId: id || (state.now && state.now.id) }); break;
    case 'sheet-sleep': event.stopPropagation(); openSheet({ type: 'sleep' }); break;
    case 'sheet-speed': openSheet({ type: 'speed' }); break;
    case 'sheet-sort': openSheet({ type: 'sort' }); break;
    case 'sheet-bookmarks': openSheet({ type: 'bookmarks', bookId: id || (state.now && state.now.id) }); break;
    case 'sheet-wish': openSheet({ type: 'wish' }); break;
    case 'sheet-stats':
      openSheet({ type: 'stats' });
      Promise.all([
        loadStats(),
        loadAchievements(),
        api('/reviews').then((rows) => { state.recentReviews = rows; }).catch(() => {}),
      ]).then(render).catch(() => {});
      break;
    case 'badge-detail': {
      const a = (state.achievements.mine || []).find((x) => x.id === Number(id));
      if (a) openSheet({ type: 'badge', achievement: a });
      break;
    }
    case 'share-badge': shareBadge(Number(id)); break;
    case 'cheer-badge': cheerBadge(Number(id)); break;
    case 'sheet-history':
      state.history = null;
      openSheet({ type: 'history' });
      Promise.all([
        api(`/history?user=${state.user.id}`),
        api(`/sleep-sessions?user=${state.user.id}`).catch(() => []),
      ]).then(([rows, naps]) => { state.history = rows; state.sleepLog = naps; render(); })
        .catch(() => { state.history = []; render(); });
      break;
    case 'sheet-rating': openSheet({ type: 'rating', bookId: id }); break;
    case 'bookmark-scope': {
      const scope = target.dataset.scope;
      state.sheet = { ...state.sheet, scope };
      if (scope === 'all' && state.allBookmarks === null) {
        api(`/bookmarks?user=${state.user.id}`).then((rows) => { state.allBookmarks = rows; render(); }).catch(() => { state.allBookmarks = []; render(); });
      }
      render();
      break;
    }
    case 'open-book-sheet': closeSheet(); setTimeout(() => go('book', id), 0); break;
    case 'open-bookmark':
      closeSheet();
      loadIntoPlayer(id, { autoplay: true, startAt: Number(target.dataset.sec) }).catch((err) => toast(`${t('error')}: ${err.message}`));
      break;
    case 'expand-mini': state.miniCollapsed = false; render(); break;
    case 'rate': saveRating(id, Number(target.dataset.rating)); break;
    case 'save-review': {
      const mineNow = state.detail && (state.detail.reviews || []).find((r) => r.user_id === state.user.id);
      if (mineNow) saveRating(id, mineNow.rating);
      else toast(t('pickNooksFirst'));
      break;
    }
    case 'delete-rating': deleteRating(id); break;
    case 'submit-wish': submitWish(); break;
    case 'wish-status': setWishStatus(Number(id), target.dataset.status); break;
    case 'wish-delete': deleteWish(Number(id)); break;
    case 'download': downloadBook(state.detail && state.detail.id === id ? state.detail : state.books.find((b) => b.id === id)); break;
    case 'cancel-download': cancelDownload(); break;
    case 'remove-download': removeDownload(id); break;
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
      applyLang();
      render();
      break;
    }
    case 'toggle-autoresume': settings.autoResume = !settings.autoResume; saveSettings(); render(); break;
    case 'new-invite': openSheet({ type: 'invite' }); break;
    case 'create-invite': createInvite(); break;
    case 'copy-invite': copyInvite(target.dataset.token); break;
    case 'revoke-invite': revokeInvite(target.dataset.token); break;
    case 'refresh':
      // Also drops the shell cache, which is what "clear cache" used to do separately.
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage('clear-cache');
      loadLibrary().then(() => { render(); toast(t('refreshed')); }).catch((err) => toast(`${t('error')}: ${err.message}`));
      break;
    case 'clear-cache':
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage('clear-cache');
      // Downloaded books are the listener's data, not cache.
      caches.keys()
        .then((keys) => Promise.all(keys.filter((k) => k !== AUDIO_CACHE).map((k) => caches.delete(k))))
        .then(() => toast(t('cacheCleared')))
        .catch(() => toast(t('cacheCleared')));
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
    markAwake();
    seekTo(Number(el.value), false);
  } else if (el.id === 'speed-slider') {
    saveSettings();
    render();
  } else if (el.dataset.bookmark) {
    updateBookmarkNote(Number(el.dataset.bookmark), el.value.trim());
  } else if (el.id === 'review-text') {
    commitReviewText();
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

// The grip on a sheet looks draggable, so it has to be draggable. Same for the player
// cover and the mini bar.
const SHEET_DISMISS_PX = 110;
let touchStart = null;

function sheetElement() {
  return app.querySelector('.sheet');
}

app.addEventListener('touchstart', (event) => {
  const cover = event.target.closest('.player .cover-large');
  const mini = event.target.closest('.mini');
  const sheet = event.target.closest('.sheet');
  if (!cover && !mini && !sheet) { touchStart = null; return; }
  const y = event.touches[0].clientY;
  // A sheet with scrolled content should scroll, not follow the finger; the grip always drags.
  if (sheet && sheet.scrollTop > 0 && !event.target.closest('.grip')) { touchStart = null; return; }
  touchStart = { y, x: event.touches[0].clientX, target: cover ? 'player' : mini ? 'mini' : 'sheet', moved: 0 };
}, { passive: true });

app.addEventListener('touchmove', (event) => {
  if (!touchStart || touchStart.target !== 'sheet') return;
  const dy = event.touches[0].clientY - touchStart.y;
  touchStart.moved = dy;
  const el = sheetElement();
  if (!el) return;
  // Only downward, with a little resistance so it feels attached.
  el.style.transform = dy > 0 ? `translateY(${dy * 0.85}px)` : '';
  el.style.transition = 'none';
}, { passive: true });

function releaseSheet(dismiss) {
  const el = sheetElement();
  if (!el) return;
  el.style.transition = 'transform 0.18s ease-out';
  el.style.transform = dismiss ? 'translateY(105%)' : '';
}

app.addEventListener('touchend', (event) => {
  if (!touchStart) return;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const kind = touchStart.target;
  touchStart = null;
  if (kind === 'player' && dy > 90 && state.playerOpen && !state.sheet) closePlayer();
  if (kind === 'mini' && (dy > 40 || Math.abs(dx) > 70)) {
    state.miniCollapsed = true;
    render();
  }
  if (kind === 'sheet') {
    const dismiss = dy > SHEET_DISMISS_PX;
    releaseSheet(dismiss);
    if (dismiss) setTimeout(() => closeSheet(), 150);
  }
}, { passive: true });

app.addEventListener('touchcancel', () => {
  if (touchStart && touchStart.target === 'sheet') releaseSheet(false);
  touchStart = null;
}, { passive: true });

boot().catch(fail);
