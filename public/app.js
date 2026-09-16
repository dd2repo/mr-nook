// Private audiobook player. Vanilla JS, no build step.
// Views: locked (no valid key) -> profiles -> library -> player.

const audio = document.getElementById('audio');
const app = document.getElementById('app');

const SKIP_SECONDS = 15;
const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEP_MINUTES = [15, 30, 45, 60];
const SAVE_INTERVAL_MS = 10000;
const SLEEP_FADE_MS = 20000;

const STRINGS = {
  de: {
    appName: 'Mr. Nook',
    whoListens: 'Wer hört?',
    locked: 'Kein Zugang',
    lockedHint: 'Öffne die App über den geheimen Link, den du bekommen hast. Danach merkt sich dieses Gerät den Zugang.',
    library: 'Bibliothek',
    switchProfile: 'Profil wechseln',
    empty: 'Noch keine Hörbücher. Lade eins mit dem Skript hoch.',
    continueListening: 'Weiterhören',
    finished: 'Fertig',
    notStarted: 'Neu',
    back: 'Zurück',
    play: 'Abspielen',
    pause: 'Pause',
    remaining: 'übrig',
    speed: 'Tempo',
    sleep: 'Sleep-Timer',
    sleepOff: 'Aus',
    sleepEndOfChapter: 'Kapitelende',
    sleepMinutes: (m) => `${m} Min`,
    sleepRemaining: (s) => `Schläft in ${s}`,
    bookmarks: 'Lesezeichen',
    addBookmark: 'Lesezeichen setzen',
    bookmarkAdded: 'Lesezeichen gesetzt',
    notePlaceholder: 'Notiz …',
    delete: 'Löschen',
    chapters: 'Kapitel',
    chapterN: (n) => `Kapitel ${n}`,
    language: 'Sprache',
    error: 'Fehler',
    loadError: 'Konnte nicht laden. Internet prüfen und erneut versuchen.',
    retry: 'Erneut versuchen',
  },
  en: {
    appName: 'Mr. Nook',
    whoListens: "Who's listening?",
    locked: 'No access',
    lockedHint: 'Open the app with the secret link you were given. This device will remember it afterwards.',
    library: 'Library',
    switchProfile: 'Switch profile',
    empty: 'No audiobooks yet. Upload one with the script.',
    continueListening: 'Continue',
    finished: 'Finished',
    notStarted: 'New',
    back: 'Back',
    play: 'Play',
    pause: 'Pause',
    remaining: 'left',
    speed: 'Speed',
    sleep: 'Sleep timer',
    sleepOff: 'Off',
    sleepEndOfChapter: 'End of chapter',
    sleepMinutes: (m) => `${m} min`,
    sleepRemaining: (s) => `Sleeps in ${s}`,
    bookmarks: 'Bookmarks',
    addBookmark: 'Add bookmark',
    bookmarkAdded: 'Bookmark added',
    notePlaceholder: 'Note …',
    delete: 'Delete',
    chapters: 'Chapters',
    chapterN: (n) => `Chapter ${n}`,
    language: 'Language',
    error: 'Error',
    loadError: 'Could not load. Check your connection and try again.',
    retry: 'Retry',
  },
};

const state = {
  view: 'loading',
  lang: 'de',
  users: [],
  user: null,
  books: [],
  book: null,          // currently loaded book (detail) - also drives the mini player
  speed: Number(localStorage.getItem('hb.speed')) || 1,
  sleep: { until: 0, endOfChapter: false, label: null },
  sleepOpen: false,
  seeking: false,
  pendingStart: 0,
  error: null,
};

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

function fmtDurationShort(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function initials(text) {
  return String(text || '?').split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
}

// ------------------------------------------------------------------- API

async function api(path, options = {}) {
  const init = { method: options.method || 'GET', credentials: 'same-origin', headers: {} };
  if (options.body !== undefined) {
    init.headers['content-type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }
  const res = await fetch(`/api${path}`, init);
  if (res.status === 401) {
    state.view = 'locked';
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
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
  const linkKey = hashParams.get('k');
  if (linkKey) {
    await fetch('/api/session', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: linkKey }),
    }).catch(() => {});
    history.replaceState(null, '', location.pathname);
  }

  let me;
  try {
    me = await fetch('/api/me', { credentials: 'same-origin' });
  } catch {
    state.view = 'error';
    render();
    return;
  }
  if (me.status === 401) {
    state.view = 'locked';
    render();
    return;
  }

  try {
    state.users = await api('/users');
  } catch {
    state.view = 'error';
    render();
    return;
  }
  const savedUserId = localStorage.getItem('hb.user');
  state.user = state.users.find((u) => String(u.id) === savedUserId) || null;
  if (state.user) {
    state.lang = state.user.lang || 'de';
    await loadLibrary();
    state.view = 'library';
  } else {
    state.view = 'profiles';
  }
  render();

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

async function loadLibrary() {
  state.books = await api(`/books?user=${state.user.id}`);
}

function selectUser(user) {
  state.user = user;
  state.lang = user.lang || 'de';
  localStorage.setItem('hb.user', String(user.id));
  // Progress and bookmarks belong to a profile, so a profile switch stops playback.
  if (state.book) {
    saveProgress(true);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    state.book = null;
  }
  loadLibrary().then(() => {
    state.view = 'library';
    render();
  }).catch(showLoadError);
}

function showLoadError(err) {
  console.error(err);
  state.view = 'error';
  render();
}

// ---------------------------------------------------------------- player

async function openBook(bookId, autoplay) {
  const same = state.book && state.book.id === bookId;
  let detail;
  try {
    detail = await api(`/books/${bookId}?user=${state.user.id}`);
  } catch (err) {
    return showLoadError(err);
  }
  if (same) {
    // Keep the playing element, refresh bookmarks/chapters only.
    state.book = { ...detail, progress: state.book.progress || detail.progress };
  } else {
    if (state.book) saveProgress(true);
    state.book = detail;
    const startAt = detail.progress && !detail.progress.finished ? Number(detail.progress.position_sec) || 0 : 0;
    audio.src = `/media/${bookId}/audio`;
    audio.playbackRate = state.speed;
    state.pendingStart = startAt;
    audio.addEventListener('loadedmetadata', () => {
      if (startAt > 0) audio.currentTime = startAt;
      state.pendingStart = 0;
      updateTimeUi();
    }, { once: true });
    audio.load();
    updateMediaSession();
  }
  state.view = 'player';
  render();
  if (autoplay) audio.play().catch(() => {});
}

function togglePlay() {
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

function skip(delta) {
  const duration = bookDuration();
  audio.currentTime = Math.max(0, Math.min(duration || Infinity, audio.currentTime + delta));
  saveProgress(true);
}

function bookDuration() {
  if (Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
  return state.book ? Number(state.book.duration_sec) || 0 : 0;
}

function cycleSpeed() {
  const idx = SPEEDS.indexOf(state.speed);
  state.speed = SPEEDS[(idx + 1) % SPEEDS.length];
  audio.playbackRate = state.speed;
  localStorage.setItem('hb.speed', String(state.speed));
  render();
}

function currentChapterIndex() {
  if (!state.book || !state.book.chapters.length) return -1;
  const pos = audio.currentTime;
  let idx = -1;
  for (let i = 0; i < state.book.chapters.length; i++) {
    if (Number(state.book.chapters[i].start_sec) <= pos + 0.5) idx = i;
    else break;
  }
  return idx;
}

// ---- progress sync

let lastSaveAt = 0;
function saveProgress(force, useBeacon) {
  if (!state.book || !state.user) return;
  const now = Date.now();
  if (!force && now - lastSaveAt < SAVE_INTERVAL_MS) return;
  lastSaveAt = now;
  const duration = bookDuration();
  const position = Math.floor(audio.currentTime);
  const finished = audio.ended || (duration > 0 && duration - position < 5) ? 1 : 0;
  const payload = { user_id: state.user.id, book_id: state.book.id, position_sec: position, finished };
  state.book.progress = { ...(state.book.progress || {}), position_sec: position, finished, updated_at: now };
  const listed = state.books.find((b) => b.id === state.book.id);
  if (listed) Object.assign(listed, { position_sec: position, finished, last_played: now });

  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon('/api/progress', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    return;
  }
  api('/progress', { method: 'PUT', body: payload }).catch(() => {});
}

// ---- sleep timer

function setSleep(option) {
  // option: 0 = off, -1 = end of chapter, n = minutes
  audio.volume = 1;
  if (option === -1) state.sleep = { until: 0, endOfChapter: true, startChapter: currentChapterIndex() };
  else if (option > 0) state.sleep = { until: Date.now() + option * 60000, endOfChapter: false, minutes: option };
  else state.sleep = { until: 0, endOfChapter: false };
  state.sleepOpen = false;
  render();
}

function sleepActive() {
  return state.sleep.until > 0 || state.sleep.endOfChapter;
}

function sleepLabel() {
  if (state.sleep.until > 0) return t('sleepRemaining', fmtTime((state.sleep.until - Date.now()) / 1000));
  if (state.sleep.endOfChapter) return t('sleepEndOfChapter');
  return t('sleep');
}

setInterval(() => {
  if (state.sleep.until > 0) {
    const remaining = state.sleep.until - Date.now();
    if (remaining <= 0) {
      audio.pause();
      setSleep(0);
      return;
    }
    if (!audio.paused && remaining < SLEEP_FADE_MS) audio.volume = Math.max(0.05, remaining / SLEEP_FADE_MS);
  }
  const label = document.getElementById('sleep-label');
  if (label) label.textContent = sleepLabel();
}, 1000);

// ---- bookmarks

async function addBookmark() {
  if (!state.book) return;
  try {
    const row = await api('/bookmarks', {
      method: 'POST',
      body: { user_id: state.user.id, book_id: state.book.id, position_sec: Math.floor(audio.currentTime), note: '' },
    });
    state.book.bookmarks.push(row);
    state.book.bookmarks.sort((a, b) => a.position_sec - b.position_sec);
    render();
    toast(t('bookmarkAdded'));
    const input = app.querySelector(`input[data-bookmark="${row.id}"]`);
    if (input) input.focus();
  } catch (err) {
    toast(`${t('error')}: ${err.message}`);
  }
}

async function updateBookmarkNote(id, note) {
  const bm = state.book && state.book.bookmarks.find((b) => b.id === id);
  if (!bm || bm.note === note) return;
  bm.note = note;
  api(`/bookmarks/${id}`, { method: 'PATCH', body: { note } }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

async function deleteBookmark(id) {
  if (!state.book) return;
  state.book.bookmarks = state.book.bookmarks.filter((b) => b.id !== id);
  render();
  api(`/bookmarks/${id}`, { method: 'DELETE' }).catch((err) => toast(`${t('error')}: ${err.message}`));
}

// ---- media session (lock screen / headset controls)

function updateMediaSession() {
  if (!('mediaSession' in navigator) || !state.book) return;
  const book = state.book;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: book.title,
      artist: book.author || '',
      album: t('appName'),
      artwork: book.has_cover ? [{ src: `${location.origin}/media/${book.id}/cover`, sizes: '512x512', type: 'image/jpeg' }] : [],
    });
  } catch { /* older browsers */ }
  const set = (action, handler) => {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* unsupported action */ }
  };
  set('play', () => audio.play().catch(() => {}));
  set('pause', () => audio.pause());
  set('seekbackward', () => skip(-SKIP_SECONDS));
  set('seekforward', () => skip(SKIP_SECONDS));
  set('previoustrack', () => skip(-SKIP_SECONDS));
  set('nexttrack', () => skip(SKIP_SECONDS));
  set('seekto', (details) => {
    if (details && details.seekTime != null) {
      audio.currentTime = details.seekTime;
      saveProgress(true);
    }
  });
}

function updatePositionState() {
  if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
  const duration = bookDuration();
  if (!Number.isFinite(duration) || duration <= 0) return;
  try {
    navigator.mediaSession.setPositionState({
      duration,
      playbackRate: audio.playbackRate,
      position: Math.min(audio.currentTime, duration),
    });
  } catch { /* ignore */ }
}

// ---- audio events

audio.addEventListener('timeupdate', () => {
  updateTimeUi();
  saveProgress(false);
  if (state.sleep.endOfChapter && !audio.paused) {
    const idx = currentChapterIndex();
    if (idx !== state.sleep.startChapter) {
      audio.pause();
      setSleep(0);
    }
  }
});
audio.addEventListener('play', () => { updatePlayUi(); updatePositionState(); });
audio.addEventListener('pause', () => { updatePlayUi(); saveProgress(true); });
audio.addEventListener('seeked', () => { updateTimeUi(); updatePositionState(); });
audio.addEventListener('ratechange', updatePositionState);
audio.addEventListener('ended', () => { saveProgress(true); render(); });
audio.addEventListener('error', () => {
  if (state.book) toast(`${t('error')}: audio (${audio.error ? audio.error.code : '?'})`);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveProgress(true, true);
});
window.addEventListener('pagehide', () => saveProgress(true, true));

// ---------------------------------------------------------------- render

function render() {
  switch (state.view) {
    case 'loading': app.innerHTML = '<p class="muted center" style="margin-top:40vh">…</p>'; break;
    case 'error': app.innerHTML = renderError(); break;
    case 'locked': app.innerHTML = renderLocked(); break;
    case 'profiles': app.innerHTML = renderProfiles(); break;
    case 'library': app.innerHTML = renderLibrary() + renderMini(); break;
    case 'player': app.innerHTML = renderPlayer(); break;
  }
  updatePlayUi();
  updateTimeUi();
}

function renderError() {
  return `<div class="locked">
    <h1>${esc(t('error'))}</h1>
    <p class="muted center">${esc(t('loadError'))}</p>
    <button class="primary" data-action="reload">${esc(t('retry'))}</button>
  </div>`;
}

function renderLocked() {
  return `<div class="locked">
    <img src="/icons/icon.svg" width="96" height="96" alt="">
    <h1>${esc(t('locked'))}</h1>
    <p class="muted center" style="max-width:360px">${esc(t('lockedHint'))}</p>
  </div>`;
}

function renderProfiles() {
  return `<div class="profiles">
    <h1>${esc(t('whoListens'))}</h1>
    <div class="profile-grid">
      ${state.users.map((u) => `
        <button class="profile" data-action="select-user" data-id="${u.id}">
          <span class="avatar" style="background:${esc(u.color)}">${esc(initials(u.name))}</span>
          <span>${esc(u.name)}</span>
        </button>`).join('')}
    </div>
  </div>`;
}

function renderLibrary() {
  const u = state.user;
  const cards = state.books.map((b) => {
    const duration = Number(b.duration_sec) || 0;
    const pos = Number(b.position_sec) || 0;
    const pct = duration > 0 ? Math.min(100, Math.round((pos / duration) * 100)) : 0;
    const status = b.finished ? `<span class="badge">${esc(t('finished'))}</span>`
      : pos > 0 ? `<span class="badge">${pct} %</span>`
      : `<span class="badge">${esc(t('notStarted'))}</span>`;
    return `<button class="card" data-action="open-book" data-id="${esc(b.id)}">
      ${coverHtml(b, 'cover')}
      <div class="meta">
        <div class="title">${esc(b.title)}</div>
        <div class="muted small">${esc(b.author || '')}</div>
        <div class="row spread small muted"><span>${esc(fmtDurationShort(duration))}</span>${status}</div>
        <div class="progress"><span style="width:${b.finished ? 100 : pct}%"></span></div>
      </div>
    </button>`;
  }).join('');

  return `<header class="topbar">
    <h1>${esc(t('library'))}</h1>
    <div class="row">
      <button class="ghost small" data-action="toggle-lang" title="${esc(t('language'))}">${state.lang === 'de' ? 'EN' : 'DE'}</button>
      <button class="avatar" data-action="switch-user" title="${esc(t('switchProfile'))}" style="background:${esc(u.color)}">${esc(initials(u.name))}</button>
    </div>
  </header>
  ${state.books.length ? `<div class="grid">${cards}</div>` : `<p class="muted center empty">${esc(t('empty'))}</p>`}`;
}

function renderMini() {
  const b = state.book;
  if (!b) return '';
  const duration = bookDuration();
  const pct = duration > 0 ? (audio.currentTime / duration) * 100 : 0;
  return `<div class="mini" data-action="open-player" role="button">
    <span class="bar" id="mini-bar" style="width:${pct}%"></span>
    ${coverHtml(b, 'thumb')}
    <div class="text">
      <div>${esc(b.title)}</div>
      <div class="muted small" id="mini-time"></div>
    </div>
    <button class="icon" data-action="toggle-play" data-play-button aria-label="${esc(t('play'))}">▶</button>
  </div>`;
}

function coverHtml(book, cls) {
  if (book.has_cover) return `<img class="${cls}" src="/media/${esc(book.id)}/cover" alt="" loading="lazy">`;
  return `<div class="${cls}">${esc(initials(book.title))}</div>`;
}

function renderPlayer() {
  const b = state.book;
  const duration = bookDuration();
  const chapterIdx = currentChapterIndex();
  const chapter = chapterIdx >= 0 ? b.chapters[chapterIdx] : null;

  const sleepSheet = state.sleepOpen ? `<section class="sheet">
      <h3>${esc(t('sleep'))}</h3>
      <div class="chips">
        <button data-action="sleep" data-min="0" class="${sleepActive() ? '' : 'active'}">${esc(t('sleepOff'))}</button>
        ${SLEEP_MINUTES.map((m) => `<button data-action="sleep" data-min="${m}" class="${state.sleep.minutes === m && state.sleep.until > 0 ? 'active' : ''}">${esc(t('sleepMinutes', m))}</button>`).join('')}
        ${b.chapters.length ? `<button data-action="sleep" data-min="-1" class="${state.sleep.endOfChapter ? 'active' : ''}">${esc(t('sleepEndOfChapter'))}</button>` : ''}
      </div>
    </section>` : '';

  const bookmarks = `<section class="sheet">
      <div class="row spread">
        <h3>${esc(t('bookmarks'))}</h3>
        <button class="small" data-action="add-bookmark">＋ ${esc(t('addBookmark'))}</button>
      </div>
      ${b.bookmarks.length ? `<div class="list">${b.bookmarks.map((bm) => `
        <div class="item">
          <button class="time jump" style="flex:none" data-action="seek-to" data-sec="${Number(bm.position_sec)}">${esc(fmtTime(bm.position_sec))}</button>
          <input data-bookmark="${bm.id}" value="${esc(bm.note)}" placeholder="${esc(t('notePlaceholder'))}" maxlength="500">
          <button class="del" data-action="delete-bookmark" data-id="${bm.id}" aria-label="${esc(t('delete'))}">✕</button>
        </div>`).join('')}</div>` : ''}
    </section>`;

  const chapters = b.chapters.length ? `<section class="sheet">
      <h3>${esc(t('chapters'))}</h3>
      <div class="list">${b.chapters.map((c, i) => `
        <div class="item ${i === chapterIdx ? 'current' : ''}">
          <span class="time">${esc(fmtTime(c.start_sec))}</span>
          <button class="jump" data-action="seek-to" data-sec="${Number(c.start_sec)}">${esc(c.title || t('chapterN', i + 1))}</button>
        </div>`).join('')}</div>
    </section>` : '';

  return `<div class="player">
    <header class="topbar">
      <button class="ghost" data-action="back">‹ ${esc(t('back'))}</button>
      <span class="muted small">${esc(state.user.name)}</span>
    </header>
    ${coverHtml(b, 'cover-large')}
    <div class="center">
      <h2>${esc(b.title)}</h2>
      <div class="muted">${esc(b.author || '')}</div>
      <div class="muted small chapter-now" id="chapter-now">${esc(chapter ? chapter.title || t('chapterN', chapterIdx + 1) : '')}</div>
    </div>
    <div class="seek">
      <input type="range" id="seek" min="0" max="${Math.max(1, Math.floor(duration))}" step="1" value="${Math.floor(audio.currentTime)}">
      <div class="times small muted">
        <span id="time-elapsed">${fmtTime(audio.currentTime)}</span>
        <span id="time-percent"></span>
        <span id="time-remaining"></span>
      </div>
    </div>
    <div class="controls">
      <button class="icon skip" data-action="skip" data-delta="-${SKIP_SECONDS}" aria-label="-${SKIP_SECONDS}s">↺<small>${SKIP_SECONDS}</small></button>
      <button class="icon big" data-action="toggle-play" data-play-button aria-label="${esc(t('play'))}">▶</button>
      <button class="icon skip" data-action="skip" data-delta="${SKIP_SECONDS}" aria-label="+${SKIP_SECONDS}s">↻<small>${SKIP_SECONDS}</small></button>
    </div>
    <div class="toolbar">
      <button data-action="speed">${state.speed}×</button>
      <button data-action="toggle-sleep" class="${sleepActive() ? 'active' : ''}"><span id="sleep-label">${esc(sleepLabel())}</span></button>
      <button data-action="add-bookmark">🔖</button>
    </div>
    ${sleepSheet}
    ${bookmarks}
    ${chapters}
  </div>`;
}

function updatePlayUi() {
  const playing = !audio.paused && !audio.ended;
  app.querySelectorAll('[data-play-button]').forEach((btn) => {
    btn.textContent = playing ? '❚❚' : '▶';
    btn.setAttribute('aria-label', playing ? t('pause') : t('play'));
  });
}

function updateTimeUi() {
  const duration = bookDuration();
  // Before the metadata arrived, show the saved position instead of 0:00.
  const pos = audio.readyState === 0 && state.pendingStart ? state.pendingStart : audio.currentTime;
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
  if (remaining) remaining.textContent = `-${fmtTime(Math.max(0, (duration - pos) / (audio.playbackRate || 1)))} ${t('remaining')}`;
  const percent = document.getElementById('time-percent');
  if (percent) percent.textContent = `${pct.toFixed(1)} %`;

  const chapterNow = document.getElementById('chapter-now');
  if (chapterNow && state.book) {
    const idx = currentChapterIndex();
    chapterNow.textContent = idx >= 0 ? (state.book.chapters[idx].title || t('chapterN', idx + 1)) : '';
    app.querySelectorAll('.list .item.current').forEach((el) => el.classList.remove('current'));
    if (idx >= 0) {
      const items = app.querySelectorAll('section.sheet:last-child .item');
      if (items[idx]) items[idx].classList.add('current');
    }
  }
  const miniBar = document.getElementById('mini-bar');
  if (miniBar) miniBar.style.width = `${pct}%`;
  const miniTime = document.getElementById('mini-time');
  if (miniTime) miniTime.textContent = `${fmtTime(pos)} · ${pct.toFixed(0)} %`;
}

let toastTimer;
function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

// ---------------------------------------------------------------- events

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  // A click on the play button inside the mini bar must not open the player.
  if (action !== 'open-player' && target.closest('.mini') && event.target.closest('[data-action="toggle-play"]')) {
    event.stopPropagation();
  }
  switch (action) {
    case 'reload': location.reload(); break;
    case 'select-user': selectUser(state.users.find((u) => String(u.id) === target.dataset.id)); break;
    case 'switch-user': state.view = 'profiles'; render(); break;
    case 'toggle-lang': {
      state.lang = state.lang === 'de' ? 'en' : 'de';
      state.user.lang = state.lang;
      api(`/users/${state.user.id}`, { method: 'PATCH', body: { lang: state.lang } }).catch(() => {});
      render();
      break;
    }
    case 'open-book': openBook(target.dataset.id, false); break;
    case 'open-player':
      if (event.target.closest('[data-action="toggle-play"]')) { togglePlay(); break; }
      state.view = 'player'; render(); break;
    case 'back':
      state.sleepOpen = false;
      loadLibrary().then(() => { state.view = 'library'; render(); }).catch(() => { state.view = 'library'; render(); });
      break;
    case 'toggle-play': togglePlay(); break;
    case 'skip': skip(Number(target.dataset.delta)); break;
    case 'speed': cycleSpeed(); break;
    case 'toggle-sleep': state.sleepOpen = !state.sleepOpen; render(); break;
    case 'sleep': setSleep(Number(target.dataset.min)); break;
    case 'add-bookmark': addBookmark(); break;
    case 'delete-bookmark': deleteBookmark(Number(target.dataset.id)); break;
    case 'seek-to':
      audio.currentTime = Number(target.dataset.sec);
      saveProgress(true);
      if (audio.paused) audio.play().catch(() => {});
      break;
  }
});

app.addEventListener('input', (event) => {
  if (event.target.id === 'seek') {
    state.seeking = true;
    const value = Number(event.target.value);
    const elapsed = document.getElementById('time-elapsed');
    if (elapsed) elapsed.textContent = fmtTime(value);
    const duration = bookDuration();
    event.target.style.setProperty('--pct', `${duration > 0 ? (value / duration) * 100 : 0}%`);
  }
});

app.addEventListener('change', (event) => {
  if (event.target.id === 'seek') {
    state.seeking = false;
    audio.currentTime = Number(event.target.value);
    saveProgress(true);
  } else if (event.target.dataset.bookmark) {
    updateBookmarkNote(Number(event.target.dataset.bookmark), event.target.value.trim());
  }
});

app.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.dataset.bookmark) event.target.blur();
});

boot().catch(showLoadError);
