// Generates the PNG app icons (192, 512, 512 maskable) without any dependency.
// A tiny PNG encoder plus a supersampled rasterizer for the ring + play glyph.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = [0x12, 0x12, 0x16];
const ACCENT = [0xff, 0x7a, 0x1a];

const crcTable = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Geometry in a 512 unit space (matches icon.svg).
function inTriangle(x, y) {
  const ax = 216, ay = 176, bx = 336, by = 256, cx = 216, cy = 336;
  const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by);
  const d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy);
  const d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}
function inRing(x, y) {
  const d = Math.hypot(x - 256, y - 256);
  return d >= 162 && d <= 190;
}
function inRoundedSquare(x, y, radius) {
  const rx = Math.max(0, Math.max(radius - x, x - (512 - radius)));
  const ry = Math.max(0, Math.max(radius - y, y - (512 - radius)));
  return Math.hypot(rx, ry) <= radius;
}

function renderIcon(size, { maskable }) {
  const ss = 3;
  const rgba = Buffer.alloc(size * size * 4);
  const scale = 512 / size;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const x = (px + (sx + 0.5) / ss) * scale;
          const y = (py + (sy + 0.5) / ss) * scale;
          // Maskable icons need full-bleed background and a smaller glyph (safe zone 80 %).
          const gx = maskable ? (x - 256) / 0.8 + 256 : x;
          const gy = maskable ? (y - 256) / 0.8 + 256 : y;
          const inside = maskable || inRoundedSquare(x, y, 112);
          if (!inside) continue;
          const glyph = inTriangle(gx, gy) || inRing(gx, gy);
          const c = glyph ? ACCENT : BG;
          r += c[0]; g += c[1]; b += c[2]; a += 255;
        }
      }
      const n = ss * ss;
      const i = (py * size + px) * 4;
      const cov = a / n;
      rgba[i] = cov ? Math.round(r / (a / 255)) : 0;
      rgba[i + 1] = cov ? Math.round(g / (a / 255)) : 0;
      rgba[i + 2] = cov ? Math.round(b / (a / 255)) : 0;
      rgba[i + 3] = Math.round(cov);
    }
  }
  return encodePng(size, size, rgba);
}

writeFileSync(join(outDir, 'icon-192.png'), renderIcon(192, { maskable: false }));
writeFileSync(join(outDir, 'icon-512.png'), renderIcon(512, { maskable: false }));
writeFileSync(join(outDir, 'icon-512-maskable.png'), renderIcon(512, { maskable: true }));
console.log('icons written to', outDir);
