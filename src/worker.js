// Private audiobook backend on Cloudflare Workers.
// - /api/*   JSON API (users, books, progress, bookmarks, uploads)
// - /media/* streams audio and covers from R2 with HTTP Range support
// - everything else is served from ./public (static PWA assets)
//
// Access control: one shared secret (env.APP_KEY). It arrives either as
// "Authorization: Bearer <key>" (upload script) or as an HttpOnly cookie that
// POST /api/session sets after the user opened the secret link once.

const COOKIE = 'hb_key';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const KEY_PREFIX = 'books/';
const encoder = new TextEncoder();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env, url);
      if (url.pathname.startsWith('/media/')) return await handleMedia(request, env, url);
      return env.ASSETS.fetch(request);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err && err.stack ? err.stack : err);
      return json({ error: 'internal error' }, 500);
    }
  },
};

// ---------------------------------------------------------------- helpers

function json(data, status = 200, extraHeaders) {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  if (extraHeaders) for (const [k, v] of Object.entries(extraHeaders)) headers.append(k, v);
  return new Response(JSON.stringify(data), { status, headers });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'invalid json body');
  }
}

function presentedKey(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function keyMatches(candidate, expected) {
  if (typeof candidate !== 'string' || typeof expected !== 'string' || !candidate || !expected) return false;
  const a = encoder.encode(candidate);
  const b = encoder.encode(expected);
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

function requireAuth(request, env) {
  if (!env.APP_KEY) throw new HttpError(500, 'APP_KEY secret is not configured');
  if (!keyMatches(presentedKey(request), env.APP_KEY)) throw new HttpError(401, 'unauthorized');
}

function requireInt(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n)) throw new HttpError(400, `${name} must be an integer`);
  return n;
}

function requireNumber(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `${name} must be a non-negative number`);
  return n;
}

function requireObjectKey(key) {
  if (typeof key !== 'string' || !key.startsWith(KEY_PREFIX) || key.includes('..') || key.length > 300) {
    throw new HttpError(400, `object key must start with ${KEY_PREFIX}`);
  }
  return key;
}

function requireBookId(id) {
  if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]{1,80}$/.test(id)) {
    throw new HttpError(400, 'book id must be a lowercase slug');
  }
  return id;
}

// -------------------------------------------------------------------- API

async function handleApi(request, env, url) {
  const parts = url.pathname.slice('/api/'.length).split('/').filter(Boolean);
  const method = request.method;
  const [resource, id, sub] = parts;

  // Exchange the secret from the link for a long-lived cookie.
  if (resource === 'session' && method === 'POST') {
    const body = await readJson(request);
    if (!keyMatches(body.key, env.APP_KEY)) throw new HttpError(401, 'invalid key');
    const secure = url.protocol === 'https:' ? '; Secure' : '';
    const cookie = `${COOKIE}=${encodeURIComponent(body.key)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`;
    return json({ ok: true }, 200, { 'set-cookie': cookie });
  }

  requireAuth(request, env);

  if (resource === 'me' && method === 'GET') return json({ ok: true });

  if (resource === 'users') {
    if (method === 'GET' && !id) {
      const { results } = await env.DB.prepare('SELECT id, name, color, lang FROM users ORDER BY id').all();
      return json(results);
    }
    if (method === 'PATCH' && id && !sub) {
      const userId = requireInt(id, 'user id');
      const body = await readJson(request);
      const lang = body.lang === 'en' ? 'en' : 'de';
      await env.DB.prepare('UPDATE users SET lang = ? WHERE id = ?').bind(lang, userId).run();
      return json({ ok: true, lang });
    }
  }

  if (resource === 'books') {
    if (method === 'GET' && !id) return listBooks(env, url);
    if (method === 'GET' && id && !sub) return getBook(env, url, requireBookId(id));
    if (method === 'POST' && !id) return upsertBook(env, await readJson(request));
    if (method === 'DELETE' && id && !sub) return deleteBook(env, requireBookId(id));
    if (method === 'PUT' && id && sub === 'chapters') return replaceChapters(env, requireBookId(id), await readJson(request));
  }

  if (resource === 'progress' && (method === 'PUT' || method === 'POST') && !id) {
    return saveProgress(env, await readJson(request));
  }

  if (resource === 'bookmarks') {
    if (method === 'GET' && !id) return listBookmarks(env, url);
    if (method === 'POST' && !id) return createBookmark(env, await readJson(request));
    if (method === 'PATCH' && id && !sub) return updateBookmark(env, requireInt(id, 'bookmark id'), await readJson(request));
    if (method === 'DELETE' && id && !sub) {
      await env.DB.prepare('DELETE FROM bookmarks WHERE id = ?').bind(requireInt(id, 'bookmark id')).run();
      return new Response(null, { status: 204 });
    }
  }

  if (resource === 'upload') return handleUpload(request, env, url, id, method);

  throw new HttpError(404, 'not found');
}

async function listBooks(env, url) {
  const userId = requireInt(url.searchParams.get('user'), 'user');
  const { results } = await env.DB.prepare(
    `SELECT b.id, b.title, b.author, b.duration_sec, b.size_bytes, b.created_at,
            (b.cover_key IS NOT NULL) AS has_cover,
            p.position_sec, p.finished, p.updated_at AS last_played
       FROM books b
       LEFT JOIN progress p ON p.book_id = b.id AND p.user_id = ?
      ORDER BY p.updated_at DESC NULLS LAST, b.created_at DESC`,
  ).bind(userId).all();
  return json(results);
}

async function getBook(env, url, bookId) {
  const userId = requireInt(url.searchParams.get('user'), 'user');
  const book = await env.DB.prepare(
    `SELECT id, title, author, duration_sec, size_bytes, created_at, (cover_key IS NOT NULL) AS has_cover
       FROM books WHERE id = ?`,
  ).bind(bookId).first();
  if (!book) throw new HttpError(404, 'book not found');

  const [chapters, bookmarks, progress] = await env.DB.batch([
    env.DB.prepare('SELECT id, idx, title, start_sec FROM chapters WHERE book_id = ? ORDER BY idx').bind(bookId),
    env.DB.prepare('SELECT id, position_sec, note, created_at FROM bookmarks WHERE book_id = ? AND user_id = ? ORDER BY position_sec').bind(bookId, userId),
    env.DB.prepare('SELECT position_sec, finished, updated_at FROM progress WHERE book_id = ? AND user_id = ?').bind(bookId, userId),
  ]);
  return json({
    ...book,
    chapters: chapters.results,
    bookmarks: bookmarks.results,
    progress: progress.results[0] || null,
  });
}

function normalizeChapters(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((c, i) => ({
      idx: i,
      title: typeof c.title === 'string' ? c.title.slice(0, 200) : null,
      start_sec: requireNumber(c.start_sec, `chapters[${i}].start_sec`),
    }))
    .sort((a, b) => a.start_sec - b.start_sec)
    .map((c, i) => ({ ...c, idx: i }));
}

async function upsertBook(env, body) {
  const id = requireBookId(body.id);
  if (typeof body.title !== 'string' || !body.title.trim()) throw new HttpError(400, 'title is required');
  const audioKey = requireObjectKey(body.audio_key);
  const coverKey = body.cover_key ? requireObjectKey(body.cover_key) : null;
  const duration = requireNumber(body.duration_sec ?? 0, 'duration_sec');
  const size = body.size_bytes == null ? null : requireInt(body.size_bytes, 'size_bytes');
  const author = typeof body.author === 'string' && body.author.trim() ? body.author.trim().slice(0, 200) : null;
  const chapters = normalizeChapters(body.chapters);

  const statements = [
    env.DB.prepare(
      `INSERT INTO books (id, title, author, duration_sec, size_bytes, audio_key, cover_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title, author = excluded.author, duration_sec = excluded.duration_sec,
         size_bytes = excluded.size_bytes, audio_key = excluded.audio_key, cover_key = excluded.cover_key`,
    ).bind(id, body.title.trim().slice(0, 300), author, duration, size, audioKey, coverKey, Date.now()),
    env.DB.prepare('DELETE FROM chapters WHERE book_id = ?').bind(id),
    ...chapters.map((c) =>
      env.DB.prepare('INSERT INTO chapters (book_id, idx, title, start_sec) VALUES (?, ?, ?, ?)').bind(id, c.idx, c.title, c.start_sec),
    ),
  ];
  await env.DB.batch(statements);
  return json({ ok: true, id, chapters: chapters.length });
}

async function replaceChapters(env, bookId, body) {
  const exists = await env.DB.prepare('SELECT 1 FROM books WHERE id = ?').bind(bookId).first();
  if (!exists) throw new HttpError(404, 'book not found');
  const chapters = normalizeChapters(body.chapters);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM chapters WHERE book_id = ?').bind(bookId),
    ...chapters.map((c) =>
      env.DB.prepare('INSERT INTO chapters (book_id, idx, title, start_sec) VALUES (?, ?, ?, ?)').bind(bookId, c.idx, c.title, c.start_sec),
    ),
  ]);
  return json({ ok: true, chapters: chapters.length });
}

async function deleteBook(env, bookId) {
  const book = await env.DB.prepare('SELECT audio_key, cover_key FROM books WHERE id = ?').bind(bookId).first();
  if (!book) throw new HttpError(404, 'book not found');
  await env.BUCKET.delete([book.audio_key, book.cover_key].filter(Boolean));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM bookmarks WHERE book_id = ?').bind(bookId),
    env.DB.prepare('DELETE FROM progress WHERE book_id = ?').bind(bookId),
    env.DB.prepare('DELETE FROM chapters WHERE book_id = ?').bind(bookId),
    env.DB.prepare('DELETE FROM books WHERE id = ?').bind(bookId),
  ]);
  return new Response(null, { status: 204 });
}

async function saveProgress(env, body) {
  const userId = requireInt(body.user_id, 'user_id');
  const bookId = requireBookId(body.book_id);
  const position = requireNumber(body.position_sec, 'position_sec');
  const finished = body.finished ? 1 : 0;
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO progress (user_id, book_id, position_sec, finished, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, book_id) DO UPDATE SET
       position_sec = excluded.position_sec, finished = excluded.finished, updated_at = excluded.updated_at`,
  ).bind(userId, bookId, position, finished, now).run();
  return json({ ok: true, updated_at: now });
}

async function listBookmarks(env, url) {
  const userId = requireInt(url.searchParams.get('user'), 'user');
  const bookId = requireBookId(url.searchParams.get('book'));
  const { results } = await env.DB.prepare(
    'SELECT id, position_sec, note, created_at FROM bookmarks WHERE user_id = ? AND book_id = ? ORDER BY position_sec',
  ).bind(userId, bookId).all();
  return json(results);
}

async function createBookmark(env, body) {
  const userId = requireInt(body.user_id, 'user_id');
  const bookId = requireBookId(body.book_id);
  const position = requireNumber(body.position_sec, 'position_sec');
  const note = typeof body.note === 'string' ? body.note.slice(0, 500) : '';
  const now = Date.now();
  const row = await env.DB.prepare(
    'INSERT INTO bookmarks (user_id, book_id, position_sec, note, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id, position_sec, note, created_at',
  ).bind(userId, bookId, position, note, now).first();
  return json(row, 201);
}

async function updateBookmark(env, bookmarkId, body) {
  const note = typeof body.note === 'string' ? body.note.slice(0, 500) : '';
  await env.DB.prepare('UPDATE bookmarks SET note = ? WHERE id = ?').bind(note, bookmarkId).run();
  return json({ ok: true });
}

// ----------------------------------------------------------------- upload
// Multipart upload through the Worker so the upload script only needs the
// APP_KEY and no separate S3 credentials. Parts must be >= 5 MiB (except the
// last one) and stay below the Worker request body limit (100 MB on Free).

async function handleUpload(request, env, url, action, method) {
  if (action === 'start' && method === 'POST') {
    const body = await readJson(request);
    const key = requireObjectKey(body.key);
    const upload = await env.BUCKET.createMultipartUpload(key, {
      httpMetadata: { contentType: body.content_type || 'application/octet-stream' },
    });
    return json({ key, upload_id: upload.uploadId });
  }
  if (action === 'part' && method === 'PUT') {
    const key = requireObjectKey(url.searchParams.get('key'));
    const uploadId = url.searchParams.get('upload_id');
    const partNumber = requireInt(url.searchParams.get('part'), 'part');
    if (!uploadId) throw new HttpError(400, 'upload_id is required');
    const upload = env.BUCKET.resumeMultipartUpload(key, uploadId);
    const part = await upload.uploadPart(partNumber, await request.arrayBuffer());
    return json({ part_number: part.partNumber, etag: part.etag });
  }
  if (action === 'complete' && method === 'POST') {
    const body = await readJson(request);
    const key = requireObjectKey(body.key);
    if (!body.upload_id || !Array.isArray(body.parts)) throw new HttpError(400, 'upload_id and parts are required');
    const upload = env.BUCKET.resumeMultipartUpload(key, body.upload_id);
    const object = await upload.complete(body.parts.map((p) => ({ partNumber: Number(p.part_number), etag: String(p.etag) })));
    return json({ key, size: object.size, etag: object.httpEtag });
  }
  if (action === 'abort' && method === 'POST') {
    const body = await readJson(request);
    const key = requireObjectKey(body.key);
    if (!body.upload_id) throw new HttpError(400, 'upload_id is required');
    await env.BUCKET.resumeMultipartUpload(key, body.upload_id).abort();
    return json({ ok: true });
  }
  if (action === 'put' && method === 'PUT') {
    // Single-request upload for small objects such as covers.
    const key = requireObjectKey(url.searchParams.get('key'));
    const contentType = url.searchParams.get('content_type') || request.headers.get('content-type') || 'application/octet-stream';
    const object = await env.BUCKET.put(key, await request.arrayBuffer(), { httpMetadata: { contentType } });
    return json({ key, size: object.size, etag: object.httpEtag });
  }
  throw new HttpError(404, 'not found');
}

// ------------------------------------------------------------------ media
// GET /media/:bookId/audio  and  GET /media/:bookId/cover
// R2 parses the Range header itself; we translate the result to 200/206/304/416.

async function handleMedia(request, env, url) {
  requireAuth(request, env);
  if (request.method !== 'GET' && request.method !== 'HEAD') throw new HttpError(405, 'method not allowed');

  const [, , rawBookId, kind] = url.pathname.split('/');
  const bookId = requireBookId(rawBookId);
  const book = await env.DB.prepare('SELECT audio_key, cover_key FROM books WHERE id = ?').bind(bookId).first();
  if (!book) throw new HttpError(404, 'book not found');

  const key = kind === 'audio' ? book.audio_key : kind === 'cover' ? book.cover_key : null;
  if (!key) throw new HttpError(404, 'not found');

  const range = parseRange(request.headers.get('range'));
  const options = { onlyIf: request.headers };
  if (range) options.range = range;

  let object;
  try {
    object = await env.BUCKET.get(key, options);
  } catch (err) {
    // R2 throws on unsatisfiable ranges.
    return new Response(null, { status: 416, headers: { 'accept-ranges': 'bytes' } });
  }
  if (!object) throw new HttpError(404, 'object not found');

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (!headers.has('content-type')) headers.set('content-type', kind === 'audio' ? 'audio/mpeg' : 'image/jpeg');
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', kind === 'cover' ? 'private, max-age=604800' : 'private, max-age=3600');

  // Precondition matched (If-None-Match etc.): R2 returns the object without a body.
  if (!('body' in object)) return new Response(null, { status: 304, headers });

  if (!range) {
    headers.set('content-length', String(object.size));
    return new Response(request.method === 'HEAD' ? null : object.body, { status: 200, headers });
  }

  let offset;
  let length;
  if (range.suffix !== undefined) {
    length = Math.min(range.suffix, object.size);
    offset = object.size - length;
  } else {
    offset = range.offset;
    length = range.length === undefined ? object.size - offset : Math.min(range.length, object.size - offset);
  }
  if (offset >= object.size || length <= 0) {
    headers.set('content-range', `bytes */${object.size}`);
    return new Response(null, { status: 416, headers });
  }
  headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
  headers.set('content-length', String(length));
  return new Response(request.method === 'HEAD' ? null : object.body, { status: 206, headers });
}

// Parses a single-range "bytes=a-b" / "bytes=a-" / "bytes=-n" header into R2's range shape.
// Returns null for a missing or malformed header (the full object is served then).
function parseRange(header) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === '' && match[2] === '')) return null;
  if (match[1] === '') {
    const suffix = Number(match[2]);
    return suffix > 0 ? { suffix } : null;
  }
  const offset = Number(match[1]);
  if (match[2] === '') return { offset };
  const end = Number(match[2]);
  if (end < offset) return null;
  return { offset, length: end - offset + 1 };
}
