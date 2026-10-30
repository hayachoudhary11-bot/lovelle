import "dotenv/config";
import mongoose from "mongoose";
import { readConfig } from "./config/env";
import { createApplication } from "./app";
async function main() {
  const config = readConfig();
  const { server, io, ready } = createApplication(config);
  await ready();
  server.listen(config.port, "0.0.0.0", () => console.log("Lovelle API listening on port", config.port));
  server.on("error", () => { console.error("Server could not listen"); process.exit(1); });
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    const timer = setTimeout(() => process.exit(1), 10000);
    timer.unref();
    io.close(() => { void mongoose.disconnect().then(() => { clearTimeout(timer); process.exit(0); }); });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
main().catch(() => { console.error("Startup failed. Check environment configuration and MongoDB connectivity."); process.exit(1); });
