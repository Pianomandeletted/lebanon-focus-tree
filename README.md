# Lebanon National Focus Tree

An interactive, HOI4-inspired national focus tree for the Roblox Lebanon project, with a
server-authenticated admin panel for managing every piece of content without touching code.

## Stack

- **Next.js 14** (App Router) - frontend + API routes in one project
- **Prisma + PostgreSQL** - data model for paths, focuses, connections, users, stats, music, announcements
- **NextAuth (credentials provider)** - admin authentication, server-side session, JWT role check
- **Tailwind CSS** - styling
- Plain `<audio>` element for the music player (no extra library needed)

Everything content-related (focuses, paths, connections, statuses, icons, statistics, music,
announcements) lives in the database and is edited through `/admin`. Nothing about the tree
itself is hardcoded in the frontend.

## Project layout

```
prisma/schema.prisma        data model
prisma/seed.ts               starter content: every faction/diplomacy/national path,
                              a representative focus chain per path, admin account
src/app/(site)/...           public pages (tree, government, politics, military, diplomacy,
                              economy, statistics, history, news, about)
src/app/admin/...            admin pages (protected by middleware.ts)
src/app/api/...               REST-ish API routes, admin-only writes enforced server-side
src/components/tree/          the pan/zoom canvas, node rendering, detail panel
src/components/music/         the music player
src/lib/auth.ts, authz.ts     NextAuth config + the requireAdmin() check every write route uses
src/middleware.ts             redirects non-admins away from /admin/* at the edge
```

## 1. Install

```bash
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` - a Postgres connection string. For local development, the easiest options are
  a free [Supabase](https://supabase.com) or [Neon](https://neon.tech) project, or a local
  Postgres via Docker (`docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`).
- `NEXTAUTH_SECRET` - generate with `openssl rand -base64 32`.
- `NEXTAUTH_URL` - `http://localhost:3000` locally; your production URL once deployed.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` - **only used by the seed script** to create
  (or reset the password of) your administrator account. There is no public sign-up - the only
  way to become an admin is to be created this way, directly in the database.

## 3. Create the database schema and your admin account

```bash
npm run db:push    # creates all tables from prisma/schema.prisma
npm run db:seed    # creates your admin user + the starter paths/focuses/stats
```

Re-running `db:seed` after changing `ADMIN_PASSWORD` in `.env` will reset that password - this
is the supported way to rotate your own credentials.

## 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` to
sign in with the admin account you just seeded.

## How the admin system stays secure

- Passwords are hashed with bcrypt; the plaintext value from `.env` is only ever read once, by
  the seed script, to produce that hash.
- `src/middleware.ts` checks the signed session token on every request to `/admin/*` (except the
  login page itself) **before** any page code runs, and redirects anyone without an `ADMIN` role.
- Every API route that writes data (`POST`/`PATCH`/`DELETE` under `/api/*`) independently calls
  `requireAdmin()`, which re-derives the role from the server-issued session - never from
  anything the client sends. A user cannot become an admin by editing the frontend, calling the
  API directly, or inspecting client-side code, because the role check happens entirely
  server-side against the database.
- There's intentionally no self-service admin signup. Additional admins are created by inserting
  a `User` row with `role: "ADMIN"` (e.g. via `npx prisma studio`, or by extending the seed
  script).

## Content model, in short

- **Path** - a branch (a faction, a diplomacy country, or a national-development category).
  Paths can nest (`parentPathId`) - this is how the Chamounist Path attaches under National
  Liberal Party, and how each diplomacy country branch attaches under the root "Diplomacy" path.
- **Focus** - one node. Has a status (`COMPLETE` / `COMPLETING` / `INCOMPLETE` / `IMPOSSIBLE`),
  an icon, a canvas position (`x`/`y`), free-text requirements, and completion text.
- **FocusConnection** - a directed edge (`fromFocus` is a prerequisite of `toFocus`). Because
  this is its own table rather than an array on `Focus`, branches can both split and merge -
  a focus can require several prerequisites from different branches at once.
- **Statistic**, **MusicTrack**, **Announcement** - simple content types, each with their own
  admin page.

## What's seeded vs. what you'll add

The seed script creates every faction, diplomacy branch, and national-development category
named in the brief, each with a small "organize → two branches → merge" starter chain (Russia's
branch is intentionally larger, and Chamounist intentionally branches off National Liberal
Party's chain) - enough to prove branching, merging, all four statuses, and cross-path
connections work end to end. Filling in the rest of each tree to full HOI4 depth is content
work best done live, through `/admin/focuses`, rather than guessed at here.

## Icon uploads

`/api/upload` accepts PNG/JPEG/WEBP/GIF up to 4MB and writes them to `public/uploads/icons` -
fine for local development or a host with persistent storage. On a fully serverless host
(e.g. Vercel) local disk writes don't persist between deployments, so before going to production
there, swap the `writeFile` call in `src/app/api/upload/route.ts` for a blob store call
(Vercel Blob, S3, or Supabase Storage all work the same way: validate → upload → store the
returned URL on the Focus). The validation and admin-only authorization logic doesn't need to
change.

## Adding music

Drop audio files in `public/audio/` (or host them anywhere reachable by URL), then add each one
in `/admin/music` with its title, artist, and URL. The player only starts playback after the
visitor clicks the "Play" button, so it never runs into browser autoplay restrictions.

## Deploying

1. Push this repository to GitHub.
2. Create a Postgres database (Supabase/Neon/Railway all have generous free tiers).
3. Import the repo into [Vercel](https://vercel.com) (or your host of choice).
4. Set the same environment variables from `.env` in the host's dashboard.
5. Run `npm run db:push` and `npm run db:seed` once against the production `DATABASE_URL`
   (locally, pointed at the production database, is simplest) to create tables and your admin
   account.
6. Deploy. Visit `/admin/login` on your production URL to confirm admin access works before
   sharing the site.

## Extending further

- Add new pages the same way the existing ones under `src/app/(site)/` are built - most just
  query `db.path`/`db.focus`/etc. directly as server components.
- Add new admin-manageable content types by following the pattern in `src/app/api/announcements`
  (schema + `requireAdmin()` + Prisma call) and a page under `src/app/admin/` styled like the
  existing managers.
