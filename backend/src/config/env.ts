export function readConfig(env = process.env) {
  const mongoUri = env.MONGO_URI || env.MONGODB_URI;
  if (!mongoUri || !/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) throw new Error("Set MONGO_URI to a MongoDB connection string");
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || env.JWT_SECRET.includes("your_jwt")) throw new Error("JWT_SECRET must be a random secret of at least 32 characters");
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  const production = env.NODE_ENV === "production";
  const origins = (env.CORS_ORIGINS || (production ? "" : "http://localhost:8081,http://localhost:3000"))
    .split(",").map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length) throw new Error("CORS_ORIGINS must list the allowed frontend origins");
  for (const origin of origins) {
    const url = new URL(origin);
    if (url.origin !== origin || !["http:", "https:"].includes(url.protocol) || (production && url.protocol !== "https:")) throw new Error("CORS_ORIGINS must contain exact origins (HTTPS in production), without trailing slashes");
  }
  const trustProxy = Number(env.TRUST_PROXY || (env.VERCEL ? 1 : 0));
  if (!Number.isInteger(trustProxy) || trustProxy < 0) throw new Error("Invalid TRUST_PROXY hop count");
  return { mongoUri, port, origins, production, trustProxy, distributed: env.VERCEL === "1" || env.SOCKET_DISTRIBUTED === "true" };
}
export type AppConfig = ReturnType<typeof readConfig>;
