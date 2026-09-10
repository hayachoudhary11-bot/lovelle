# Lovelle — Architecture Reference

This is the source-of-truth document for the app. Any new feature or change should
be checked against this file, and this file should be updated whenever something
here changes.

## 1. Project Overview

Lovelle is a couples app inspired by "Lovora." It gives each couple a shared,
private space in the app to keep notes, count down to special dates, and (later)
share photos and daily prompts. It starts as a personal project but is designed
from day one to support many different couples, each with their own private data.

## 2. Folder Structure

```
lovelle/
  mobile/     ← Expo (React Native) frontend
  backend/    ← Node.js + Express + TypeScript + MongoDB backend
  architecture.md   ← this file
```

### mobile/

```
mobile/
  app/
    (tabs)/
      index.tsx      → Home tab
      notes.tsx       → Notes tab
      gallery.tsx      → Gallery tab
      prompts.tsx      → Prompts tab
      settings.tsx     → Settings tab
  components/
  assets/
  app.json
  package.json
```

### backend/

```
backend/
  src/
    index.ts            → Express app entry point
    config/
      db.ts              → MongoDB connection setup
    models/
      User.ts
      Couple.ts
      Note.ts
      Event.ts           (planned)
      Photo.ts           (planned)
      Prompt.ts          (planned)
    routes/
      auth.ts
      notes.ts
    middleware/
      auth.ts             → verifies JWT tokens
  .env                    → real secrets (never committed to git)
  .env.example             → template showing which variables are needed
  package.json
  tsconfig.json
```

## 3. Tech Stack

| Layer     | Choice                                                                                       |
| --------- | -------------------------------------------------------------------------------------------- |
| Frontend  | Expo (React Native) with Expo Router (file-based navigation)                                 |
| Backend   | Node.js + Express + TypeScript                                                               |
| Database  | MongoDB Atlas (cloud-hosted, free tier)                                                      |
| ODM       | Mongoose                                                                                     |
| Auth      | Email/password, hashed with bcrypt, sessions handled via JWT                                 |
| Real-time | Socket.IO (for the live Drawing Board — WebSocket connection alongside the regular REST API) |

The mobile app never talks to MongoDB directly — it always goes through the
backend server, which checks the user's login token and only returns data for
their own couple.

## 4. Screens / Tabs

| Tab           | Purpose                                                                 | Status                                                     |
| ------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| Home          | Overview: recent notes, upcoming countdown                              | Planned                                                    |
| Notes         | Shared sticky notes — add / view / delete                               | Built (Firebase version); being rebuilt on MongoDB backend |
| Messages      | Live 1-on-1 chat between the two partners                               | Planned                                                    |
| Gallery       | Shared photo grid                                                       | Planned                                                    |
| Prompts       | Daily prompts / questions for the couple                                | Planned                                                    |
| Challenges    | Challenge questions — a second, separate pool of questions from Prompts | Planned                                                    |
| Drawing Board | Live shared canvas — both partners draw together in real time           | Planned                                                    |
| To-Do List    | Shared tasks/grocery list, both partners can add/check off              | Planned                                                    |
| Calendar      | Shared calendar for planning dates and events together                  | Planned                                                    |
| Settings      | Account settings, sign out, couple settings/invite code                 | Planned                                                    |

**Note:** the Photo Frame is not a separate tab — it's a small widget on the
Home screen showing one chosen photo (see section 14). The Milestones
timeline (section 21) also lives on the Home screen, not as its own tab.

**A note on tab count:** the app now has 8 planned tabs, which is more than
most phone screens comfortably fit in a bottom tab bar (5–6 is typical). When
you get to building the navigation, it's worth revisiting whether some of
these (e.g. Prompts + Challenges, or To-Do List + Calendar) should be merged
into fewer tabs with internal sections, rather than staying fully separate.

## 5. Data Models

### User

| Field                 | Type             | Notes                                   |
| --------------------- | ---------------- | --------------------------------------- |
| \_id                  | ObjectId         |                                         |
| email                 | string           | unique, indexed                         |
| passwordHash          | string           | bcrypt hash, never store plain password |
| name                  | string           |                                         |
| coupleId              | ObjectId \| null | which Couple they belong to             |
| createdAt / updatedAt | Date             |                                         |

### Couple

| Field                 | Type       | Notes                                      |
| --------------------- | ---------- | ------------------------------------------ |
| \_id                  | ObjectId   |                                            |
| name                  | string     | optional, e.g. "Alex & Sam"                |
| members               | [ObjectId] | references to Users (usually 2)            |
| inviteCode            | string     | short code the second partner uses to join |
| createdAt / updatedAt | Date       |                                            |

### Note

| Field                 | Type     | Notes                                 |
| --------------------- | -------- | ------------------------------------- |
| \_id                  | ObjectId |                                       |
| coupleId              | ObjectId | indexed — enforces per-couple privacy |
| authorId              | ObjectId | who wrote it                          |
| text                  | string   |                                       |
| color                 | string   | optional                              |
| pinned                | boolean  | optional                              |
| createdAt / updatedAt | Date     |                                       |

### Message

| Field     | Type         | Notes                                             |
| --------- | ------------ | ------------------------------------------------- |
| \_id      | ObjectId     |                                                   |
| coupleId  | ObjectId     | indexed — enforces per-couple privacy             |
| senderId  | ObjectId     | which partner sent it                             |
| text      | string       |                                                   |
| readAt    | Date \| null | when the other partner saw it (for read receipts) |
| createdAt | Date         |                                                   |

### Event (planned — countdown feature, reused by Calendar)

| Field          | Type       | Notes                                                                 |
| -------------- | ---------- | --------------------------------------------------------------------- |
| \_id, coupleId | ObjectId   |                                                                       |
| title          | string     |                                                                       |
| date           | Date (ISO) | the target date; for Calendar events, this is when it happens         |
| notes          | string     | optional                                                              |
| isCountdown    | boolean    | true = shown on Home as a countdown; false = a regular calendar event |
| createdBy      | ObjectId   | which partner added it                                                |

**Note:** Calendar and Countdown reuse the same `Event` collection rather
than having two separate ones — a countdown is really just a calendar event
with `isCountdown: true`, so there's no need to duplicate the model.

### Task (planned — to-do list feature)

| Field                 | Type             | Notes              |
| --------------------- | ---------------- | ------------------ |
| \_id, coupleId        | ObjectId         |                    |
| text                  | string           |                    |
| done                  | boolean          |                    |
| createdBy             | ObjectId         |                    |
| doneBy                | ObjectId \| null | who checked it off |
| createdAt / updatedAt | Date             |                    |

### Milestone (planned — anniversary timeline)

| Field          | Type             | Notes                                  |
| -------------- | ---------------- | -------------------------------------- |
| \_id, coupleId | ObjectId         |                                        |
| title          | string           | e.g. "First date", "Moved in together" |
| date           | Date             |                                        |
| note           | string           | optional — a short memory/description  |
| photoId        | ObjectId \| null | optional link to a Gallery photo       |
| createdAt      | Date             |                                        |

### Photo (planned — gallery feature)

| Field                      | Type     | Notes                                                       |
| -------------------------- | -------- | ----------------------------------------------------------- |
| \_id, coupleId, uploaderId | ObjectId |                                                             |
| cloudinaryPublicId         | string   | Cloudinary's reference id — needed to delete the file later |
| url                        | string   | full-size image URL (Cloudinary-hosted)                     |
| thumbUrl                   | string   | smaller, faster-loading version for the grid view           |
| caption                    | string   | optional                                                    |
| width, height              | number   | used to size the grid without waiting for the image to load |
| createdAt                  | Date     |                                                             |

### Prompt (planned)

| Field      | Type     | Notes                                                                          |
| ---------- | -------- | ------------------------------------------------------------------------------ |
| \_id       | ObjectId |                                                                                |
| promptText | string   | the question itself, e.g. "What's your favorite memory together?"              |
| category   | string   | optional, e.g. "fun", "deep", "future" — lets prompts be filtered/themed later |
| active     | boolean  | whether it's still in the rotation pool                                        |

### PromptAnswer (planned)

| Field                    | Type     | Notes                                  |
| ------------------------ | -------- | -------------------------------------- |
| \_id, coupleId, promptId | ObjectId |                                        |
| answeredBy               | ObjectId | which user answered                    |
| answerText               | string   |                                        |
| date                     | Date     | the day this prompt was shown/answered |

### ChallengeQuestion (planned)

| Field        | Type     | Notes                                                           |
| ------------ | -------- | --------------------------------------------------------------- |
| \_id         | ObjectId |                                                                 |
| questionText | string   | separate pool from Prompts — same shape, different content/tone |
| category     | string   | optional, e.g. "fun", "spicy", "future"                         |
| active       | boolean  |                                                                 |

### ChallengeAnswer (planned)

| Field                      | Type     | Notes |
| -------------------------- | -------- | ----- |
| \_id, coupleId, questionId | ObjectId |       |
| answeredBy                 | ObjectId |       |
| answerText                 | string   |       |
| date                       | Date     |       |

### DrawingBoard (planned)

| Field          | Type     | Notes                                                                                               |
| -------------- | -------- | --------------------------------------------------------------------------------------------------- |
| \_id, coupleId | ObjectId | one board per couple (or one per "session" if you want a history of past drawings)                  |
| strokes        | array    | list of stroke objects: `{ points: [{x,y}], color, width, userId }` — the saved state of the canvas |
| updatedAt      | Date     |                                                                                                     |

### Couple (updated)

Additional fields on the existing Couple model:
| Field | Type | Notes |
|---|---|---|
| featuredPhotoId | ObjectId \| null | which Photo is currently shown in the Home screen's Photo Frame widget |
| relationshipStartDate | Date | set once (e.g. during onboarding), powers the "Days Together" counter |
| currentStreak | number | consecutive days with at least one note sent by either partner |
| longestStreak | number | best streak ever reached, kept even after the current one breaks |
| lastNoteDate | Date | the date (not time) of the most recent note — used to check if today keeps the streak alive |

### Heartbeat (planned)

| Field          | Type     | Notes                        |
| -------------- | -------- | ---------------------------- |
| \_id, coupleId | ObjectId |                              |
| senderId       | ObjectId | which partner sent the nudge |
| sentAt         | Date     |                              |

## 10. Gallery Feature — Detailed Flow

**Storage:** Cloudinary (free tier). Actual image files never touch MongoDB —
only the resulting Cloudinary URL and metadata are stored in the `Photo`
collection. Cloudinary also auto-generates a thumbnail version, which is
cheaper to load in the grid view than the full photo.

**Upload flow:**

1. User picks a photo on their phone (using `expo-image-picker`).
2. Mobile app uploads the image directly to Cloudinary using an "unsigned
   upload preset" (a Cloudinary setting that allows uploads from a mobile app
   without exposing secret keys).
3. Cloudinary returns a URL, thumbnail URL, width, and height.
4. Mobile app sends just that metadata (not the image itself) to the backend:
   `POST /photos` with `{ url, thumbUrl, cloudinaryPublicId, width, height, caption }`.
5. Backend saves it to MongoDB, tagged with the user's `coupleId`.

**Viewing:** `GET /photos` returns all photos for the couple, newest first.
Mobile app renders them in a grid using the `thumbUrl` for speed, and shows
the full `url` when a photo is tapped open.

**Deleting:** `DELETE /photos/:id` — backend checks the photo belongs to the
user's couple, then deletes it both from MongoDB and from Cloudinary (using
the stored `cloudinaryPublicId`) so storage doesn't fill up with orphaned files.

**Limits to plan for (free tier):** Cloudinary's free tier has a monthly
bandwidth/storage cap — fine for personal use, worth revisiting if the app
grows to many couples.

## 11. Prompts Feature — Detailed Flow

**Source:** a fixed pool of prompts (seeded ahead of time into the `Prompt`
collection) — not AI-generated, to keep things simple and predictable.

**Daily selection:** each day, the backend picks one prompt at random from the
active pool for each couple. To keep it consistent for both partners on the
same day (not a new random pick every time either of them opens the app),
the selection is deterministic per day — e.g. based on the date plus the
couple's id as a seed, so both partners see the same prompt without needing
to store "today's prompt" separately for every couple.

**Answering:** `POST /prompts/answer` saves a `PromptAnswer` with the current
date, the prompt shown, and the user's answer. Each partner answers
independently — the UI can reveal both answers only once both have submitted,
to encourage honest answers rather than copying.

**History:** `GET /prompts/history` returns past prompts and both partners'
answers, so couples can look back over what they've shared.

**Routes:**
| Method | Path | Purpose |
|---|---|---|
| GET | /prompts/today | Get today's prompt (and each partner's answer status) |
| POST | /prompts/answer | Submit an answer to today's prompt |
| GET | /prompts/history | Get past prompts + answers |

## 12. Challenge Questions — Detailed Flow

Structurally identical to Prompts (section 11) but with its own separate
question pool, so the tone/content can differ (e.g. more playful or bold
questions) without mixing into the daily Prompts rotation. Same deterministic
daily-pick logic, same hide-until-both-answer behavior.

**Routes:**
| Method | Path | Purpose |
|---|---|---|
| GET | /challenges/today | Get today's challenge question + answer status |
| POST | /challenges/answer | Submit an answer to today's challenge |
| GET | /challenges/history | Get past challenges + answers |

## 13. Drawing Board — Detailed Flow

**Real-time approach:** unlike every other feature (which uses simple REST
API calls), the Drawing Board needs a live, always-open connection so both
partners see each other's pen strokes appear instantly. This uses
**Socket.IO**, which runs alongside the existing Express server on the same
backend — no separate service needed.

**How it works:**

1. When a user opens the Drawing Board screen, the mobile app opens a
   Socket.IO connection to the backend and "joins a room" named after their
   `coupleId` — this makes sure only the two partners see each other's strokes,
   not other couples.
2. As a user draws, the app sends small stroke events (e.g. "pen moved from
   point A to point B, this color, this width") to the server the moment they
   happen.
3. The server immediately relays that event to the other partner's connection
   (if they're online and on the screen too) — this is what makes it feel
   "live."
4. Periodically (or when a user leaves the screen), the current full canvas
   state is saved to MongoDB in the `DrawingBoard` document, so the drawing
   persists even after both partners close the app.
5. When either partner reopens the Drawing Board later, the saved strokes are
   loaded from MongoDB first, then new live strokes continue from there.

**What happens if only one partner is online:** drawing still works — strokes
just save to MongoDB as normal. The other partner sees the finished drawing
next time they open the screen, they just don't see it appear in real time.

**Socket events (not REST routes, since this uses WebSockets):**
| Event name | Direction | Purpose |
|---|---|---|
| join-board | mobile → server | join the couple's private drawing room |
| stroke | mobile → server → other partner | a new pen stroke to relay live |
| clear-board | mobile → server → other partner | clear the canvas for both |
| save-board | mobile → server | persist current strokes to MongoDB |

## 14. Photo Frame — Detailed Flow

A small widget on the **Home** screen — not its own tab — that displays one
chosen photo from the couple's Gallery, styled like a picture frame.

**Choosing the photo:** either partner can go to the Gallery, tap a photo, and
choose "Set as Photo Frame." This updates `featuredPhotoId` on the `Couple`
document (see updated Couple model above).

**Displaying it:** the Home screen fetches the couple's info (which now
includes `featuredPhotoId`), looks up that photo's `url`, and displays it in
a styled frame component at the top of the Home screen.

**Routes:**
| Method | Path | Purpose |
|---|---|---|
| POST | /couples/featured-photo | Set which photo shows in the Home screen's frame |

**Access rule:** every route checks the logged-in user's `coupleId` (from their
JWT) and only reads/writes documents where `coupleId` matches. This is what
keeps each couple's data private from every other couple.

## 6. Auth Flow

1. **Sign up** — user provides email + password. Password is hashed with bcrypt
   before saving. User is created with `coupleId: null`.
2. **Create or join a couple:**
   - **Create Couple** — user becomes the first member; server generates a short
     `inviteCode` for their partner to use.
   - **Join Couple** — user enters their partner's invite code; server adds them
     to that Couple and sets both users' `coupleId`.
3. **Login** — email + password checked against the stored hash. On success,
   server issues a JWT containing the user's id and coupleId.
4. **Authenticated requests** — mobile app sends the JWT in the
   `Authorization: Bearer <token>` header on every request. Backend middleware
   verifies it and attaches `req.user` before any route logic runs.

## 7. API Routes

| Method | Path                    | Purpose                                                     | Auth required? |
| ------ | ----------------------- | ----------------------------------------------------------- | -------------- |
| POST   | /auth/signup            | Create a new user                                           | No             |
| POST   | /auth/login             | Log in, receive JWT                                         | No             |
| POST   | /couples/create         | Create a new couple, get invite code                        | Yes            |
| POST   | /couples/join           | Join a couple using invite code                             | Yes            |
| GET    | /notes                  | Get all notes for the logged-in user's couple               | Yes            |
| POST   | /notes                  | Add a new note                                              | Yes            |
| DELETE | /notes/:id              | Delete a note by id                                         | Yes            |
| GET    | /events                 | Get countdown events (planned)                              | Yes            |
| POST   | /events                 | Add a countdown event (planned)                             | Yes            |
| GET    | /photos                 | Get gallery photos for the couple (planned)                 | Yes            |
| POST   | /photos                 | Save photo metadata after a Cloudinary upload (planned)     | Yes            |
| DELETE | /photos/:id             | Delete a photo, from MongoDB and Cloudinary (planned)       | Yes            |
| GET    | /prompts/today          | Get today's prompt + each partner's answer status (planned) | Yes            |
| POST   | /prompts/answer         | Submit an answer to today's prompt (planned)                | Yes            |
| GET    | /prompts/history        | Get past prompts and answers (planned)                      | Yes            |
| GET    | /challenges/today       | Get today's challenge question + answer status (planned)    | Yes            |
| POST   | /challenges/answer      | Submit an answer to today's challenge (planned)             | Yes            |
| GET    | /challenges/history     | Get past challenges + answers (planned)                     | Yes            |
| POST   | /couples/featured-photo | Set the Home screen Photo Frame photo (planned)             | Yes            |
| GET    | /tasks                  | Get all to-do/grocery tasks (planned)                       | Yes            |
| POST   | /tasks                  | Add a new task (planned)                                    | Yes            |
| PATCH  | /tasks/:id              | Toggle task done/not-done (planned)                         | Yes            |
| DELETE | /tasks/:id              | Remove a task (planned)                                     | Yes            |
| DELETE | /events/:id             | Remove a calendar/countdown event (planned)                 | Yes            |
| GET    | /milestones             | Get anniversary timeline (planned)                          | Yes            |
| POST   | /milestones             | Add a milestone (planned)                                   | Yes            |
| DELETE | /milestones/:id         | Remove a milestone (planned)                                | Yes            |

## 15. Heartbeat — Detailed Flow

A simple "thinking of you" nudge — one partner taps a button, the other gets
a push notification instantly. No screen of its own; likely a button on the
Home screen.

**Sending:** `POST /heartbeat/send` — backend saves a `Heartbeat` record (for
a small history, e.g. "you sent 3 today") and triggers a push notification to
the partner's device.

**Push notifications:** requires Expo's push notification service
(`expo-notifications`) — each user's device gets a push token when they log
in, stored on their `User` document, so the backend knows where to send it.

**Optional light touches:** rate-limit to prevent spamming (e.g. max one
heartbeat per few minutes), and show a small animation/haptic buzz on the
receiving end when it arrives.

**Routes:**
| Method | Path | Purpose |
|---|---|---|
| POST | /heartbeat/send | Send a nudge to your partner (triggers push notification) |
| GET | /heartbeat/history | Get recent heartbeats sent/received (optional) |

## 16. Days Together — Detailed Flow

A simple counter, likely shown on the Home screen: "You've been together for
X days."

**Setup:** during onboarding (or later in Settings), either partner sets
`relationshipStartDate` once on the `Couple` document.

**Display:** no backend calculation needed — the mobile app fetches
`relationshipStartDate` (via the existing "get my couple info" endpoint) and
computes the day count locally: `today - relationshipStartDate`, updated
automatically each time the screen loads.

**Routes:**
| Method | Path | Purpose |
|---|---|---|
| POST | /couples/start-date | Set or update the relationship start date |

## 17. Daily Streak — Detailed Flow

Tracks consecutive days where at least one note was sent by either partner —
encourages checking in daily, similar to Snapchat/Duolingo-style streaks.

**Updating the streak:** every time `POST /notes` is called (a new note is
added), the backend checks `lastNoteDate` on the Couple document:

- If `lastNoteDate` was **yesterday** → increment `currentStreak` by 1, update
  `lastNoteDate` to today.
- If `lastNoteDate` was **today already** → no change (streak already counted
  for today, don't double-count multiple notes in one day).
- If `lastNoteDate` was **earlier than yesterday** (a day was missed) → reset
  `currentStreak` to 1, update `lastNoteDate` to today.
- If `currentStreak` ever exceeds `longestStreak`, update `longestStreak` too.

**Display:** Home screen shows `currentStreak` (e.g. "🔥 5 day streak") and
optionally `longestStreak` as a personal best.

**No new routes needed** — this piggybacks on the existing `POST /notes`
route; the streak fields just get updated as a side effect whenever a note is
saved.

## 18. Messages — Detailed Flow

Real-time 1-on-1 chat between the two partners — separate from Notes (which
is meant for things worth keeping/revisiting, like a sticky-note board rather
than a conversation).

**Real-time approach:** uses the same **Socket.IO** connection already set up
for the Drawing Board (section 13) — no new real-time infrastructure needed,
just a second "channel" of events on the same connection.

**How it works:**

1. When a user opens the Messages screen, the mobile app joins their couple's
   Socket.IO room (same room concept as the Drawing Board, reused here).
2. When a user sends a message, the app sends it to the server, which:
   - Saves it to MongoDB immediately (unlike drawing strokes, every message
     is saved right away — messages shouldn't be lost if the app closes).
   - Instantly relays it to the partner's device if they're online and on the
     screen, so it appears without needing to refresh.
3. If the partner isn't online, the message just waits in MongoDB — when they
   open the Messages screen later, `GET /messages` loads the full
   conversation history, including anything sent while they were away.
4. Optional: mark `readAt` when the receiving partner opens the screen, to
   support a small "seen" indicator.

**Socket events:**
| Event name | Direction | Purpose |
|---|---|---|
| join-chat | mobile → server | join the couple's private chat room |
| send-message | mobile → server → other partner | send a new message, relayed live |
| message-read | mobile → server → other partner | mark messages as seen |

**Routes (for loading history, not for sending — sending goes through the
socket connection):**
| Method | Path | Purpose |
|---|---|---|
| GET | /messages | Get the full message history for the couple |

**Note:** the Drawing Board does not use REST routes — it uses Socket.IO
events instead (see section 13).

## 19. To-Do / Grocery List — Detailed Flow

A simple shared checklist — either partner adds items, either partner checks
them off, both see updates. Doesn't need to be real-time/live like Messages
(a quick refresh on screen-load is fine, same pattern as Notes), since
checking off a grocery item isn't as time-sensitive as a chat message.

**Adding/checking off:** standard REST calls — `POST /tasks` to add,
`PATCH /tasks/:id` to toggle done/not-done, `DELETE /tasks/:id` to remove.

**Display:** grouped simply — unchecked items on top, checked items below
(or hidden after a delay), similar to any basic to-do app.

**Routes:**
| Method | Path | Purpose |
|---|---|---|
| GET | /tasks | Get all tasks for the couple |
| POST | /tasks | Add a new task |
| PATCH | /tasks/:id | Toggle done/not-done |
| DELETE | /tasks/:id | Remove a task |

## 20. Calendar — Detailed Flow

Lets couples plan dates and events together, reusing the same `Event`
collection already built for Countdown (section covering Event model) —
`isCountdown: true` events show as a Home screen countdown, `isCountdown:
false` events just show on the calendar.

**Viewing:** `GET /events` returns all events for the couple; the mobile app
renders them in a calendar/agenda view (a library like
`react-native-calendars` handles the visual calendar grid).

**Adding:** either partner can add an event with a title, date, and optional
notes — visible to both immediately.

**Routes:**
| Method | Path | Purpose |
|---|---|---|
| GET | /events | Get all events (calendar + countdowns) for the couple |
| POST | /events | Add a new event |
| DELETE | /events/:id | Remove an event |

## 21. Milestones / Anniversary Timeline — Detailed Flow

A scrollable timeline of key relationship dates — first date, anniversaries,
moving in together, etc. — shown on the Home screen, separate from the
day-to-day Calendar (this is for looking back, not planning ahead).

**Adding a milestone:** either partner adds a title, date, optional short
note, and optionally links an existing Gallery photo to it.

**Display:** sorted chronologically, shown as a vertical timeline — each
entry shows its title, date, and photo (if attached).

**Routes:**
| Method | Path | Purpose |
|---|---|---|
| GET | /milestones | Get all milestones for the couple, sorted by date |
| POST | /milestones | Add a new milestone |
| DELETE | /milestones/:id | Remove a milestone |

## 8. Environment Variables

Stored in `backend/.env` (never committed to git — only `.env.example` with
blank placeholders is committed):

| Variable                 | Purpose                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| MONGODB_URI              | MongoDB Atlas connection string                                                                  |
| JWT_SECRET               | random string used to sign/verify login tokens                                                   |
| PORT                     | port the backend runs on locally (e.g. 4000)                                                     |
| CLOUDINARY_CLOUD_NAME    | Cloudinary account identifier (used by mobile app for uploads)                                   |
| CLOUDINARY_UPLOAD_PRESET | the "unsigned" upload preset name, allows the mobile app to upload without exposing a secret key |

## 9. Current Status

- [x] Expo app scaffolded with Expo Router, `(tabs)` layout
- [x] Backend scaffolded as a separate project (`backend/`) with Express + TypeScript + Mongoose
- [x] MongoDB Atlas cluster created
- [x] User, Couple, Note models created
- [x] Auth routes (signup/login) and JWT middleware created
- [x] Notes routes (GET/POST/DELETE) created
- [ ] Backend confirmed running and tested locally
- [ ] Mobile app's Notes screen connected to the new backend (currently still shows default starter screen)
- [ ] Countdown / Events feature rebuilt on new backend
- [ ] Gallery feature (design finalized: Cloudinary + metadata in MongoDB — not yet built)
- [ ] Prompts feature (design finalized: fixed pool, deterministic daily pick — not yet built)
- [ ] Challenge Questions feature (design finalized: same pattern as Prompts, separate pool — not yet built)
- [ ] Drawing Board (design finalized: live via Socket.IO, autosaves to MongoDB — not yet built; needs Socket.IO added to backend)
- [ ] Photo Frame widget (design finalized: featuredPhotoId on Couple model — not yet built)
- [ ] Heartbeat nudge (design finalized: push notification via expo-notifications — not yet built)
- [ ] Days Together counter (design finalized: relationshipStartDate on Couple model — not yet built)
- [ ] Daily Streak (design finalized: tracked as a side effect of sending notes — not yet built)
- [ ] Messages / live chat (design finalized: reuses Socket.IO connection from Drawing Board — not yet built)
- [ ] To-Do / Grocery List (design finalized: standard REST, simple checklist — not yet built)
- [ ] Calendar (design finalized: reuses Event model from Countdown feature — not yet built)
- [ ] Milestones / Anniversary Timeline (design finalized: separate from Calendar, for looking back not planning ahead — not yet built)
- [ ] Settings screen (sign out, invite code display/entry)
