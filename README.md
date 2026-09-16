# Mr. Nook

A cozy home for your own audiobooks. Private player for two people, built like Audible
but for our own files: one continuous audio file per book, covers, chapters, bookmarks,
sleep timer, favorites, listening position synced across devices. Runs as a PWA on Android
(and every browser).

Screens: Home (continue listening, recently added, recently played, favorites), Library
(filters, grid/list, sort), Book detail (chapters, bookmarks, favorite, mark finished,
restart), full-screen Player (±skip, speed 0.5–3×, sleep timer, chapter sheet, bookmarks),
Search (title, author, chapter), Settings (playback defaults, light/dark/system theme,
language, profile picture, about). The Mr. Nook mascot appears on the profile screen,
empty states and the sleep timer.

Stack: Cloudflare Workers (API + static PWA), R2 (audio, covers, profile pictures), D1
(SQLite: users, books, progress, bookmarks, chapters). No framework, no build step.
The app icon and in-app mascot are a hand-set 32x32 pixel sprite (`scripts/make-pixel-icon.mjs`); the painted artwork it is based on lives in `design/`.

## Cost

R2 storage is billed per GB (first 10 GB free), streaming egress is free, Workers and D1
stay inside the free tier for two users. Expect well under 1 EUR/month for a small library.

## Access model

There is no login. Two fixed profiles (Yannick, Katie) are selected on the start screen.
Access from the internet is guarded by one shared secret: open the app once via
`https://<app>/#k=<secret>` and the browser stores an HttpOnly cookie for a year.
Without the cookie the API and the audio streams answer 401.

## Setup (once)

1. Create a free Cloudflare account and enable R2 in the dashboard (R2 asks for a payment
   method even for the free tier).
2. Install and log in:

   ```bash
   cd ~/mr-nook
   npm install
   npx wrangler login
   ```

3. Create bucket, database, secret and deploy:

   ```bash
   npm run setup
   ```

   The script prints the app URL and the secret link. It stores the key in
   `.secrets/app-key` and the URL in `.secrets/app-url` (both git-ignored).

## Adding audiobooks

```bash
node scripts/books.mjs add "/path/to/Book.mp3" --cover "/path/to/cover.jpg"
node scripts/books.mjs add "/path/to/Book.mp3" --title "Title" --author "Author" --id my-book
node scripts/books.mjs add "/path/to/Book.mp3" --no-chapter-titles
node scripts/books.mjs list
node scripts/books.mjs remove <id>
```

The script reads duration, title, author and ID3 chapter marks with `ffprobe`, extracts an
embedded cover if you pass none, and uploads the audio in four parallel 20 MB parts through
the Worker (no S3 credentials needed). Re-running `add` with the same `--id` replaces the
book and keeps listening progress, because progress is keyed on the book id.

### Library conventions

Rips carry whatever the shop wrote into the tags, so titles and covers are normalised by
hand at upload time and the flags above exist for exactly that:

- **Title**: the work only. No publisher, no platform, no "Ungekürzte Lesung". A dramatised
  version keeps the German suffix `(Hörspiel)`; series get `Name N – Subtitle` with an
  en dash, for example `Auris 2 – Die Frequenz des Todes`.
- **Author**: `First Last`, several authors separated by a comma, pen names in parentheses,
  for example `Sebastian Fitzek (als Max Rhode)`. Narrators are not authors.
- **Id**: lowercase slug of the title with umlauts transliterated, stable forever because
  progress and bookmarks hang off it.
- **Cover**: square JPEG, 1000x1000. Portrait artwork is centred on a blurred copy of
  itself rather than stretched or cropped. The upload also stores a 320px thumbnail next to
  it, which is what grids, lists and the mini player load.
- **Chapter titles**: dropped with `--no-chapter-titles` whenever they are track numbers or
  internal codes such as `SebFit-DeSeebre - 01_DGW`; the app then labels them `Kapitel N`.
  Real chapter names are kept.

## Install on Android

Open the secret link in Chrome, then menu → "Add to Home screen" (or accept the install
prompt). Playback keeps running in the background; play/pause and ±15 s are available on the
lock screen and via headset buttons.

## Local development

```bash
npm install
npm run migrate:local
npm run dev            # http://localhost:8787, APP_KEY from .dev.vars
node scripts/books.mjs add test.mp3 --url http://localhost:8787 --key local-dev-key-change-me
```

Open `http://localhost:8787/#k=local-dev-key-change-me`.

## Layout

```
src/worker.js          API, auth, R2 range streaming, multipart upload
public/                PWA: index.html, app.js, styles.css, sw.js, manifest, icons, img
migrations/            D1 schema (applied with wrangler d1 migrations apply)
scripts/setup.sh       Cloudflare provisioning + deploy
scripts/books.mjs      add / list / remove audiobooks
design/                Mascot artwork (reference) and icon proposals
scripts/make-pixel-icon.mjs  Renders the 32x32 pixel sprite into icons and the in-app mascot
```

## Not yet built

- Chapter editor and metadata editing in the app (chapters are imported from the file).
- Offline download of a book to the phone.
- Deleting books from the UI (use `books.mjs remove`).
- Importing from the phone; audiobooks are added with the script on the Mac.
