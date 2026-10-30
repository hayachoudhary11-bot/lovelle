const { existsSync } = require('node:fs');
// Match Expo's production file precedence while retaining CI/hosting variables.
for (const file of ['.env.production.local', '.env.local', '.env.production', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}
const value = process.env.EXPO_PUBLIC_API_URL;
if (!value) throw new Error('Set EXPO_PUBLIC_API_URL before building (your deployed backend HTTPS origin).');
const url = new URL(value);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
  throw new Error('EXPO_PUBLIC_API_URL must be an HTTPS origin without a path or credentials.');
}
for (const key of ['EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME', 'EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET']) {
  if (!process.env[key]?.trim()) throw new Error(`Set ${key} before building to enable gallery uploads.`);
}
