# Lovelle

Expo / React Native couples app with an Express, Socket.IO and MongoDB API.
The web app and API deploy as **two Vercel projects from this repository**.

## Local setup

Use Node.js **22** (see `.nvmrc`). In each folder run `npm ci`.

1. Copy `backend/.env.example` to `backend/.env` only if you do not already have one.
2. Set `MONGO_URI` to a MongoDB Atlas database or local **replica set**, and generate a random `JWT_SECRET` of at least 32 characters. Standalone MongoDB does not support the transactions used for couple membership.
3. From `backend`, run `npm run dev`. `http://localhost:4000/health` should return `{"status":"ok"}`.
4. Copy `mobile/.env.example` to `mobile/.env`. Set the API URL and your Cloudinary cloud name and unsigned image upload preset.
5. From `mobile`, run `npm start` or `npm run web`. For a physical phone, use your computer's LAN IP in `EXPO_PUBLIC_API_URL`. Android emulators can use `http://10.0.2.2:4000`.
6. Seed daily content once with `npm run seed:prompts` and `npm run seed:challenges` from `backend`. Seeds are idempotent and do not delete existing content.

## Deploy to Vercel

Before deploying, **rotate the MongoDB password and JWT secret previously tracked in `backend/.env`**. The file is now ignored and untracked, but older Git history still contains it. Update local and Vercel values after rotating. JWT rotation signs out existing users.

Create two projects in Vercel, importing this repository. Select Node.js **22.x** and Framework Preset **Other** for both. Each folder has its own `vercel.json`.

| Project | Root directory | Build | Output |
| --- | --- | --- | --- |
| API | `backend` | `npm run build` | Vercel function `api/index.ts` (leave Output Directory unset) |
| Web app | `mobile` | `npm run build:web` | `dist` |

Set these **backend** environment variables:

| Variable | Value |
| --- | --- |
| `MONGO_URI` | New Atlas connection string with database name |
| `JWT_SECRET` | New random secret, at least 32 characters |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | Exact web origin, e.g. `https://lovelle.vercel.app`; comma-separated for additional origins, without trailing slashes |

Vercel enables the MongoDB Socket.IO adapter automatically. Atlas must allow connectivity from the deployment and the database user needs read/write, index creation, and change-stream access to this app's database. The `socket_events` collection uses a one-hour TTL. Keep this database separate from other applications.

Set these **frontend** variables before building:

| Variable | Value |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Backend HTTPS origin, e.g. `https://lovelle-api.vercel.app`, with no `/api` suffix |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Your unsigned image-only upload preset |

Public variables are bundled into JavaScript. Never put MongoDB credentials, JWT secrets or Cloudinary API secrets in `EXPO_PUBLIC_*`. Restrict the upload preset to images and an appropriate file-size limit in Cloudinary. Existing gallery URLs are ordinary Cloudinary delivery URLs, not authenticated private media; anyone with a URL can access that image. Deleting a photo currently removes its database metadata, not the Cloudinary asset.

Deploy the API, check `/health`, seed prompts/challenges using `npm run build` then `npm run seed:production` with the production database environment, and deploy the frontend. Update `CORS_ORIGINS` if the final frontend domain differs. Preview deployments need their exact frontend origin added too; do not wildcard all `vercel.app` domains. Both API and WebSocket routes must be reachable without a Vercel deployment-protection login for public clients.

The frontend uses WebSocket-only Socket.IO. Vercel can close connections at the function duration limit; the client reconnects and reloads history. MongoDB change streams deliver events across function instances. See [Vercel WebSockets](https://vercel.com/docs/functions/websockets), [Socket.IO MongoDB adapter](https://socket.io/docs/v4/mongo-adapter/), and [Expo web deployment](https://docs.expo.dev/guides/publishing-websites/).

Enable Vercel Firewall rate limiting for `/auth/*` and `/socket.io/*` as appropriate to your traffic. The application auth limiter is an additional per-instance limit, not a global quota.

## Verify

```text
cd backend
npm test
npm audit --omit=dev
cd ../mobile
npm run typecheck
npm run lint -- --max-warnings=0
npx expo install --check
npm run build:web
```

Backend tests create and destroy an isolated MongoDB replica set, seed disposable records, run the existing 30 API scenarios, and check security, membership races and communication across two servers. The first run downloads a MongoDB binary. They do not use the database in `.env`.

### Dependency audit limitations

The backend audit is clean after compatible dependency updates. Expo SDK 57 still reports 11 transitive findings (6 high, 5 low): the `query-string` / `decode-uri-component` chain used by routing, and `zod` / `deepmerge` used by Expo tooling. Compatible updates do not resolve these. `npm audit fix --force` proposes incompatible Expo/Router versions (including an Expo downgrade); it must not be used blindly. A fully clean frontend audit remains a release follow-up requiring upstream fixes or a separately validated SDK migration. The unused ngrok tunnel dependency was removed; standard local development still works.

The latest collaborator features (cards, bucket list, affection, thumb touch and weekly activity) are preserved. Regression coverage also checks weekly activity, bucket-list isolation and cross-instance affection/touch delivery.

The legacy `npm run test:apis` command requires `TEST_BASE_URL` and `ALLOW_TEST_WRITES=true`; only point it at a disposable environment because it creates records. CI performs builds, backend tests, type checking and linting automatically.

After deployment, smoke-test two separate accounts: signup/login, create/join, notes, tasks, calendar, upload, prompts, chat and drawing. Keep two browser sessions open to verify synchronization and reconnect after refreshing. Local checks do not verify your Vercel account, Atlas network access or Cloudinary preset settings.

Vercel publishes the web app. App Store / Play Store releases still need your own bundle identifiers, Expo/EAS account and signing credentials.
