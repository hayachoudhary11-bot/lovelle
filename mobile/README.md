# Lovelle mobile and web

See [the repository README](../README.md) for setup, Vercel deployment, environment variables, and validation.

Use Node.js 22. Run `npm ci`, copy `.env.example` to `.env`, configure the API and Cloudinary public values, then run `npm start`.

Production web: `npm run build:web` produces `dist/`. Vercel's project root must be `mobile`.
