// Hand-set 32x32 pixel sprite of Mr. Nook (book with headphones), scaled up with
// nearest-neighbour into the PNG app icons. No dependencies.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.argv[2] || join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const PALETTE = {
  '.': null,          // background
  B: '#482d1e',       // dark brown outline / headphones
  b: '#6c4530',       // brown ear cup padding
  S: '#82855b',       // sage spine
  s: '#9d9f71',       // light sage leaves
  C: '#fbe9cf',       // page cream
  c: '#f0dcbc',       // page shading
  P: '#f4b090',       // cheeks
  R: '#ce6946',       // heart
  W: '#fdf8ec',       // highlight
};
const BG = '#fcf3e3';

const rows = [
  '................................',
  '.............ss....ss...........',
  '..............sSSs..............',
  '...............SS...............',
  '............BBBBBBBB............',
  '.........BBB........BBB.........',
  '........BB............BB........',
  '.......BB..............BB.......',
  '......BBBBBBBBBBBBBBBBBBBB......',
  '......B.BSSCCCCCCCCCCCCB.B......',
  '......B.BSSCCCCCCCCCCCCB.B......',
  '......B.BSSCCCCCCCCCCCCB.B......',
  '....BBBBBSSCCCCCCCCCCCCBBBBB....',
  '...BbbbBBSSCCCCCCCCCCCCBBbbbB...',
  '...BbbbBBSSCCCCCCCCCCCCBBbbbB...',
  '...BbbbBBSSCCCCCCCCCCCCBBbbbB...',
  '...BbbbBBSSCCCCCCCCCCCCBBbbbB...',
  '...BbbbBBSSCCCCCCCCCCCCBBbbbB...',
  '...BbbbBBSSCCCCCCCCCCCCBBbbbB...',
  '....BBBBBSSCCCCCCCCCCCCBBBBB....',
  '........BSSCCCCCCCCCCCCB........',
  '........BSSCCCCCCCCCCCCB........',
  '........BSSCCCCCCCCCCCCB........',
  '........BSSCCCCCCCCCCCCB........',
  '........BSSCCCCCCCCCCCCB........',
  '........BSSCCCCCCCCCCCcB........',
  '........BSSCCCCCCCCCCCcB........',
  '........BBBBBBBBBBBBBBBB........',
  '..........BB........BB..........',
  '..........BB........BB..........',
  '................................',
  '................................',
].map((r) => r.split(''));

for (const [i, r] of rows.entries()) if (r.length !== 32) throw new Error(`row ${i} has ${r.length} columns`);

const set = (x, y, ch) => { rows[y][x] = ch; };
// Happy closed eyes
set(14, 13, 'B'); set(13, 14, 'B'); set(15, 14, 'B');
set(19, 13, 'B'); set(18, 14, 'B'); set(20, 14, 'B');
// Cheeks
set(12, 16, 'P'); set(21, 16, 'P');
// Smile
set(14, 17, 'B'); set(19, 17, 'B');
for (let x = 15; x <= 18; x++) set(x, 18, 'B');
// Heart on the cover
set(14, 21, 'R'); set(15, 21, 'R'); set(17, 21, 'R'); set(18, 21, 'R');
for (let x = 13; x <= 19; x++) set(x, 22, 'R');
for (let x = 14; x <= 18; x++) set(x, 23, 'R');
for (let x = 15; x <= 17; x++) set(x, 24, 'R');
set(16, 25, 'R');
// Page highlight line
for (let y = 9; y <= 26; y++) set(11, y, 'W');
// Ear cup highlight
set(5, 14, 'W'); set(26, 14, 'W');

// ---- PNG encoder
const crcTable = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => { let c = -1; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function render(size, { spriteFrac, bg, roundedBg }) {
  const rgba = Buffer.alloc(size * size * 4);
  const bgRgb = bg ? hex(bg) : null;
  const spriteSize = Math.round(size * spriteFrac);
  const px = spriteSize / 32;
  const offset = (size - spriteSize) / 2;
  const radius = size * 0.22;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let color = null;
      let alpha = 0;
      const inBg = !roundedBg || (() => {
        const rx = Math.max(0, Math.max(radius - x, x - (size - radius)));
        const ry = Math.max(0, Math.max(radius - y, y - (size - radius)));
        return Math.hypot(rx, ry) <= radius;
      })();
      if (bgRgb && inBg) { color = bgRgb; alpha = 255; }
      const sx = Math.floor((x - offset) / px);
      const sy = Math.floor((y - offset) / px);
      if (sx >= 0 && sx < 32 && sy >= 0 && sy < 32) {
        const ch = rows[sy][sx];
        if (PALETTE[ch]) { color = hex(PALETTE[ch]); alpha = 255; }
      }
      if (color) { rgba[i] = color[0]; rgba[i + 1] = color[1]; rgba[i + 2] = color[2]; rgba[i + 3] = alpha; }
    }
  }
  return encodePng(size, size, rgba);
}

writeFileSync(join(outDir, 'icon-512.png'), render(512, { spriteFrac: 0.86, bg: BG, roundedBg: true }));
writeFileSync(join(outDir, 'icon-192.png'), render(192, { spriteFrac: 0.86, bg: BG, roundedBg: true }));
writeFileSync(join(outDir, 'apple-touch-icon.png'), render(180, { spriteFrac: 0.86, bg: BG, roundedBg: false }));
writeFileSync(join(outDir, 'favicon.png'), render(64, { spriteFrac: 1, bg: null, roundedBg: false }));
writeFileSync(join(outDir, 'icon-512-maskable.png'), render(512, { spriteFrac: 0.66, bg: BG, roundedBg: false }));
console.log('pixel icons written to', outDir);

// Transparent sprite for the in-app mascot spots (profile screen, empty states, sleep timer).
const imgDir = join(root, 'public', 'img');
mkdirSync(imgDir, { recursive: true });
writeFileSync(join(imgDir, 'nook-pixel.png'), render(512, { spriteFrac: 1, bg: null, roundedBg: false }));
console.log('sprite written to', imgDir);
