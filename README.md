# Mr. Nook

Private audiobook player for two people, built like Audible but for our own files.
One continuous audio file per book, covers, bookmarks, sleep timer, chapter marks,
listening position synced across devices. Runs as a PWA on Android (and every browser).

Stack: Cloudflare Workers (API + static PWA), R2 (audio and covers), D1 (SQLite: users,
books, progress, bookmarks, chapters). No framework, no build step.

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
node scripts/books.mjs add "/path/to/Book.mp3" --title "Title" --author "Author"
node scripts/books.mjs list
node scripts/books.mjs remove <id>
```

The script reads duration, title, author and ID3 chapter marks with `ffprobe`, extracts an
embedded cover if you pass none, and uploads the audio in 20 MB parts through the Worker
(no S3 credentials needed). Re-running `add` with the same `--id` replaces the book.

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
public/                PWA: index.html, app.js, styles.css, sw.js, manifest, icons
migrations/            D1 schema
scripts/setup.sh       Cloudflare provisioning + deploy
scripts/books.mjs      add / list / remove audiobooks
scripts/make-icons.mjs regenerates the PNG icons
```

## Not yet built

- Chapter editor in the app (chapters are only imported from the file today).
- Offline download of a book to the phone.
- Deleting books from the UI (use `books.mjs remove`).
