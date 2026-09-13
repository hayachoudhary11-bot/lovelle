"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = require("./config/db");
const auth_1 = __importDefault(require("./routes/auth"));
const notes_1 = __importDefault(require("./routes/notes"));
const drawing_1 = __importDefault(require("./routes/drawing"));
const messages_1 = __importDefault(require("./routes/messages"));
const photos_1 = __importDefault(require("./routes/photos"));
const events_1 = __importDefault(require("./routes/events"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const prompts_1 = __importDefault(require("./routes/prompts"));
const challenges_1 = __importDefault(require("./routes/challenges"));
const couples_1 = __importDefault(require("./routes/couples"));
const drawing_2 = require("./socket/drawing");
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:8081", "http://localhost:3000"],
        credentials: true,
    },
});
const PORT = process.env.PORT || 4000;
const logRegisteredRoutes = () => {
    const stack = app._router?.stack ?? [];
    console.log("\nRegistered routes:");
    for (const layer of stack) {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods)
                .map((method) => method.toUpperCase())
                .join(", ");
            console.log(`- ${methods} ${layer.route.path}`);
        }
        else if (layer.name === "router") {
            console.log(`- ROUTER ${String(layer.regexp)}`);
        }
    }
};
// ============ MIDDLEWARE ============
// CORS: Allow requests from the mobile app (Expo uses http://localhost:8081 during dev)
app.use((0, cors_1.default)({
    origin: ["http://localhost:8081", "http://localhost:3000"], // Add your mobile app URL here
    credentials: true,
}));
// JSON parser: automatically parse request bodies as JSON
app.use(express_1.default.json());
// ============ ROUTES ============
// Health check endpoint (useful for debugging)
app.get("/health", (req, res) => {
    res.json({ status: "Backend is running ✅" });
});
// Auth routes (signup, login, create/join couple)
app.use("/auth", auth_1.default);
// Notes routes (protected by JWT)
app.use("/notes", notes_1.default);
app.use("/drawing", drawing_1.default);
app.use("/messages", messages_1.default);
app.use("/photos", photos_1.default);
app.use("/events", events_1.default);
app.use("/tasks", tasks_1.default);
app.use("/prompts", prompts_1.default);
app.use("/challenges", challenges_1.default);
app.use("/couples", couples_1.default);
app.set("io", io);
(0, drawing_2.registerDrawingSocket)(io);
// Temporary sanity-check route to confirm Express is accepting routes at all
app.get("/notes-test", (req, res) => {
    res.json({ ok: true, message: "Notes test route is working" });
});
// ============ START SERVER ============
const startServer = async () => {
    try {
        // Connect to MongoDB
        await (0, db_1.connectDB)();
        // Start Express server
        server.listen(PORT, () => {
            logRegisteredRoutes();
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📝 Try: curl http://localhost:${PORT}/health\n`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map