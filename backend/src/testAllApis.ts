import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:4000";

async function runTests() {
  console.log("🚀 Starting Full End-to-End API Test Suite...\n");
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Health
  await test("GET /health", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  });

  // 2. Auth: Signup
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const testEmail = `test.user.${randomSuffix}@example.com`;
  const testPassword = "password123!";
  let token = "";
  let userId = "";

  await test("POST /auth/signup", async () => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword, name: "Test Tester" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    token = data.token;
    userId = data.user.id;
  });

  // 3. Auth: Login
  await test("POST /auth/login", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 4. Auth: Create Couple
  let coupleId = "";
  let inviteCode = "";
  await test("POST /auth/create", async () => {
    const res = await fetch(`${BASE_URL}/auth/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ coupleName: "Test Lovely Couple" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    token = data.token; // updated token with coupleId
    coupleId = data.couple.id || data.couple._id;
    inviteCode = data.couple.inviteCode;
  });

  const authHeader = { Authorization: `Bearer ${token}` };

  // 5. Auth: Get Current User (GET /auth/me)
  await test("GET /auth/me", async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!data.user || !data.couple) throw new Error("Missing user or couple");
  });

  // 6. Notes: GET /notes
  await test("GET /notes", async () => {
    const res = await fetch(`${BASE_URL}/notes`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!Array.isArray(data)) throw new Error("Expected array of notes");
  });

  // 7. Notes: POST /notes
  let noteId = "";
  await test("POST /notes", async () => {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ text: "Hello love! Have a beautiful day." }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    noteId = data._id;
  });

  // 8. Notes: DELETE /notes/:id
  await test("DELETE /notes/:id", async () => {
    const res = await fetch(`${BASE_URL}/notes/${noteId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 9. Tasks: GET /tasks
  await test("GET /tasks", async () => {
    const res = await fetch(`${BASE_URL}/tasks`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!Array.isArray(data)) throw new Error("Expected array");
  });

  // 10. Tasks: POST /tasks
  let taskId = "";
  await test("POST /tasks", async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ text: "Buy fresh strawberries" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    taskId = data._id;
  });

  // 11. Tasks: PATCH /tasks/:id (toggle)
  await test("PATCH /tasks/:id", async () => {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: authHeader,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (data.done !== true) throw new Error("Task should be marked done");
  });

  // 12. Tasks: DELETE /tasks/:id
  await test("DELETE /tasks/:id", async () => {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 13. Events: GET /events
  await test("GET /events", async () => {
    const res = await fetch(`${BASE_URL}/events`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!Array.isArray(data)) throw new Error("Expected array");
  });

  // 14. Events: POST /events
  let eventId = "";
  await test("POST /events", async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({
        title: "Anniversary Dinner",
        date: new Date(Date.now() + 86400000 * 30).toISOString(),
        notes: "Table reserved at 7 PM",
        isCountdown: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    eventId = data._id;
  });

  // 15. Events: DELETE /events/:id
  await test("DELETE /events/:id", async () => {
    const res = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 16. Photos: GET /photos
  await test("GET /photos", async () => {
    const res = await fetch(`${BASE_URL}/photos`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!Array.isArray(data)) throw new Error("Expected array");
  });

  // 17. Photos: POST /photos
  let photoId = "";
  await test("POST /photos", async () => {
    const res = await fetch(`${BASE_URL}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({
        cloudinaryPublicId: `test-photo-${randomSuffix}`,
        url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7",
        thumbUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7",
        width: 800,
        height: 600,
        caption: "Sunset together",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    photoId = data._id;
  });

  // 18. Couples: POST /couples/featured-photo
  await test("POST /couples/featured-photo", async () => {
    const res = await fetch(`${BASE_URL}/couples/featured-photo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ photoId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 19. Couples: PATCH /couples/featured-photo
  await test("PATCH /couples/featured-photo", async () => {
    const res = await fetch(`${BASE_URL}/couples/featured-photo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ photoId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 20. Photos: DELETE /photos/:id
  await test("DELETE /photos/:id", async () => {
    const res = await fetch(`${BASE_URL}/photos/${photoId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 21. Prompts: GET /prompts/today
  await test("GET /prompts/today", async () => {
    const res = await fetch(`${BASE_URL}/prompts/today`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!data.prompt) throw new Error("Expected prompt object");
  });

  // 22. Prompts: POST /prompts/answer
  await test("POST /prompts/answer", async () => {
    const res = await fetch(`${BASE_URL}/prompts/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ answerText: "Your smile in the morning." }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 23. Prompts: GET /prompts/history
  await test("GET /prompts/history", async () => {
    const res = await fetch(`${BASE_URL}/prompts/history`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!Array.isArray(data)) throw new Error("Expected array");
  });

  // 24. Challenges: GET /challenges/today
  await test("GET /challenges/today", async () => {
    const res = await fetch(`${BASE_URL}/challenges/today`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!data.question) throw new Error("Expected challenge question");
  });

  // 25. Challenges: POST /challenges/answer
  await test("POST /challenges/answer", async () => {
    const res = await fetch(`${BASE_URL}/challenges/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ answerText: "You would say: 'Let's get snacks!'" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 26. Challenges: GET /challenges/history
  await test("GET /challenges/history", async () => {
    const res = await fetch(`${BASE_URL}/challenges/history`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!Array.isArray(data)) throw new Error("Expected array");
  });

  // 27. Messages: GET /messages/history
  await test("GET /messages/history", async () => {
    const res = await fetch(`${BASE_URL}/messages/history`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!Array.isArray(data)) throw new Error("Expected array");
  });

  // 28. Drawing: GET /drawing/strokes
  await test("GET /drawing/strokes", async () => {
    const res = await fetch(`${BASE_URL}/drawing/strokes`, { headers: authHeader });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
    if (!Array.isArray(data)) throw new Error("Expected array");
  });

  // 29. Drawing: POST /drawing/strokes
  await test("POST /drawing/strokes", async () => {
    const res = await fetch(`${BASE_URL}/drawing/strokes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({
        points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
        color: "#ff007f",
        strokeWidth: 4,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  // 30. Drawing: DELETE /drawing/strokes
  await test("DELETE /drawing/strokes", async () => {
    const res = await fetch(`${BASE_URL}/drawing/strokes`, {
      method: "DELETE",
      headers: authHeader,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
  });

  console.log(`\n========================================`);
  console.log(`Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
