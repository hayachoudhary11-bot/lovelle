import "dotenv/config";
import { readConfig } from "../src/config/env";
import { createApplication } from "../src/app";

// Vercel owns the listener; HTTP and WebSocket requests share initialization.
const { server } = createApplication(readConfig());
export default server;
