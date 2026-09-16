#!/usr/bin/env node
// Manage audiobooks from the Mac. Needs: node >= 18, ffprobe/ffmpeg on PATH.
//
//   node scripts/books.mjs add  <book.mp3> [--cover cover.jpg] [--title "…"] [--author "…"] [--id slug]
//                               [--no-chapter-titles]   drop junk track names, app shows "Chapter N"
//   node scripts/books.mjs list
//   node scripts/books.mjs remove <id>
//
// Connection: --url https://… and --key … , or APP_URL / APP_KEY env vars,
// or the files .secrets/app-url and .secrets/app-key written by scripts/setup.sh.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, openSync, readSync, closeSync, statSync, unlinkSync } from 'node:fs';
import { basename, extname, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PART_SIZE = 20 * 1024 * 1024; // 20 MiB, below the Worker body limit, above R2's 5 MiB minimum
const PARALLEL_PARTS = Number(process.env.PARALLEL_PARTS) || 4;

// ------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
const command = argv.shift();
const positional = [];
const flags = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    flags[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  } else positional.push(argv[i]);
}

function readSecret(name) {
  const file = join(root, '.secrets', name);
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : '';
}

const baseUrl = (flags.url || process.env.APP_URL || readSecret('app-url')).replace(/\/+$/, '');
const appKey = flags.key || process.env.APP_KEY || readSecret('app-key');
if (!command || !['add', 'list', 'remove'].includes(command)) usage();
if (!baseUrl || !appKey) fail('Missing app URL or key. Pass --url/--key, set APP_URL/APP_KEY, or run scripts/setup.sh first.');

function usage() {
  console.error(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 10).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(2);
}
function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

// -------------------------------------------------------------- HTTP

async function request(method, path, { json, body, contentType } = {}) {
  const headers = { authorization: `Bearer ${appKey}` };
  let payload;
  if (json !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(json);
  } else if (body !== undefined) {
    headers['content-type'] = contentType || 'application/octet-stream';
    payload = body;
  }
  const res = await fetch(`${baseUrl}${path}`, { method, headers, body: payload });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

async function withRetry(fn, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.error(`  retry ${i}/${attempts}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
  throw lastErr;
}

// ------------------------------------------------------------- ffprobe

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', '-show_chapters', file], {
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out.toString('utf8'));
}

function extractEmbeddedCover(file, info) {
  const pic = (info.streams || []).find((s) => s.codec_type === 'video' && (s.disposition?.attached_pic || s.codec_name === 'mjpeg' || s.codec_name === 'png'));
  if (!pic) return null;
  const ext = pic.codec_name === 'png' ? 'png' : 'jpg';
  const tmp = join(tmpdir(), `cover-${randomBytes(4).toString('hex')}.${ext}`);
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-an', '-map', `0:${pic.index}`, '-c', 'copy', '-frames:v', '1', tmp], { stdio: 'ignore' });
    return existsSync(tmp) && statSync(tmp).size > 0 ? tmp : null;
  } catch {
    return null;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'book';
}

function contentTypeFor(file) {
  const ext = extname(file).toLowerCase();
  return { '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.m4b': 'audio/mp4', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext]
    || 'application/octet-stream';
}

// -------------------------------------------------------------- upload

async function uploadMultipart(file, key, contentType) {
  const size = statSync(file).size;
  const totalParts = Math.max(1, Math.ceil(size / PART_SIZE));
  const { upload_id } = await request('POST', '/api/upload/start', { json: { key, content_type: contentType } });
  const fd = openSync(file, 'r');
  const parts = [];
  let next = 1;
  let done = 0;
  const worker = async () => {
    while (next <= totalParts) {
      const n = next++;
      const offset = (n - 1) * PART_SIZE;
      const length = Math.min(PART_SIZE, size - offset);
      const buffer = Buffer.alloc(length);
      readSync(fd, buffer, 0, length, offset);
      const query = `key=${encodeURIComponent(key)}&upload_id=${encodeURIComponent(upload_id)}&part=${n}`;
      const part = await withRetry(() => request('PUT', `/api/upload/part?${query}`, { body: buffer, contentType }));
      parts.push({ part_number: part.part_number, etag: part.etag });
      done++;
      process.stderr.write(`\r  part ${done}/${totalParts} (${Math.round((done / totalParts) * 100)} %)`);
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.min(PARALLEL_PARTS, totalParts) }, worker));
    process.stderr.write('\n');
    parts.sort((a, b) => a.part_number - b.part_number);
    return await request('POST', '/api/upload/complete', { json: { key, upload_id, parts } });
  } catch (err) {
    process.stderr.write('\n');
    await request('POST', '/api/upload/abort', { json: { key, upload_id } }).catch(() => {});
    throw err;
  } finally {
    closeSync(fd);
  }
}

async function uploadSmall(file, key) {
  const contentType = contentTypeFor(file);
  const query = `key=${encodeURIComponent(key)}&content_type=${encodeURIComponent(contentType)}`;
  return request('PUT', `/api/upload/put?${query}`, { body: readFileSync(file), contentType });
}

// ------------------------------------------------------------ commands

async function add() {
  const file = positional[0];
  if (!file || !existsSync(file)) fail('audio file missing');
  const info = probe(file);
  const tags = Object.fromEntries(Object.entries(info.format?.tags || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const title = (flags.title || tags.album || tags.title || basename(file, extname(file))).trim();
  const author = (flags.author || tags.artist || tags.album_artist || tags.composer || '').trim();
  const id = flags.id || `${slugify(title)}-${randomBytes(2).toString('hex')}`;
  const duration = Number(info.format?.duration) || 0;
  const size = Number(info.format?.size) || statSync(file).size;
  const chapters = (info.chapters || []).map((c) => ({
    title: flags['no-chapter-titles'] ? null : c.tags?.title || null,
    start_sec: Number(c.start_time) || 0,
  }));

  let coverFile = flags.cover || null;
  let coverTmp = null;
  if (coverFile && !existsSync(coverFile)) fail(`cover not found: ${coverFile}`);
  if (!coverFile) {
    coverTmp = extractEmbeddedCover(file, info);
    coverFile = coverTmp;
  }

  console.log(`Title:    ${title}`);
  console.log(`Author:   ${author || '-'}`);
  console.log(`Id:       ${id}`);
  console.log(`Duration: ${Math.round(duration / 60)} min, ${(size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Chapters: ${chapters.length}`);
  console.log(`Cover:    ${coverFile ? (coverTmp ? 'embedded' : coverFile) : 'none'}`);

  const audioKey = `books/${id}/audio${extname(file).toLowerCase() || '.mp3'}`;
  console.log(`Uploading audio -> ${audioKey}`);
  await uploadMultipart(file, audioKey, contentTypeFor(file));

  let coverKey = null;
  if (coverFile) {
    coverKey = `books/${id}/cover${extname(coverFile).toLowerCase() || '.jpg'}`;
    console.log(`Uploading cover -> ${coverKey}`);
    await uploadSmall(coverFile, coverKey);
    if (coverTmp) unlinkSync(coverTmp);
  }

  const result = await request('POST', '/api/books', {
    json: { id, title, author, duration_sec: duration, size_bytes: size, audio_key: audioKey, cover_key: coverKey, chapters },
  });
  console.log(`Done: ${result.id} (${result.chapters} chapters)`);
}

async function list() {
  const books = await request('GET', '/api/books?user=1');
  if (!books.length) return console.log('(no books)');
  for (const b of books) {
    console.log(`${b.id}\t${Math.round(b.duration_sec / 60)} min\t${b.author || '-'} - ${b.title}`);
  }
}

async function remove() {
  const id = positional[0];
  if (!id) fail('book id missing');
  await request('DELETE', `/api/books/${encodeURIComponent(id)}`);
  console.log(`removed ${id}`);
}

({ add, list, remove })[command]().catch((err) => fail(err.message));
