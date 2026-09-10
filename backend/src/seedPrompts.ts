import "dotenv/config";
import mongoose from "mongoose";
import { Prompt } from "./models/Prompt";

const prompts = [
  { promptText: "What is one small thing your partner does that always makes you smile?", category: "appreciation" },
  { promptText: "What would your perfect day together look like?", category: "dreams" },
  { promptText: "What is your favorite memory from the past year together?", category: "memories" },
  { promptText: "What meal would you love to cook together?", category: "fun" },
  { promptText: "What song reminds you most of your partner?", category: "memories" },
  { promptText: "Where should you go together for a weekend adventure?", category: "dreams" },
  { promptText: "What is something new you would like to learn together?", category: "growth" },
  { promptText: "What makes your relationship feel like home?", category: "connection" },
  { promptText: "What is one habit you appreciate in your partner?", category: "appreciation" },
  { promptText: "What silly moment together still makes you laugh?", category: "fun" },
  { promptText: "What tradition would you like to start as a couple?", category: "dreams" },
  { promptText: "When do you feel most supported by your partner?", category: "connection" },
  { promptText: "What fictional world would you visit together?", category: "fun" },
  { promptText: "What is one goal you would love to accomplish together?", category: "growth" },
  { promptText: "What quality in your partner inspires you?", category: "appreciation" },
  { promptText: "What was your first favorite thing about your partner?", category: "memories" },
  { promptText: "What would you like to celebrate more often together?", category: "connection" },
  { promptText: "If you had a free day with no responsibilities, what would you do?", category: "fun" },
];

async function seedPrompts() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
  await mongoose.connect(process.env.MONGO_URI);
  await Prompt.bulkWrite(
    prompts.map((prompt) => ({
      updateOne: {
        filter: { promptText: prompt.promptText },
        update: { $set: prompt, $setOnInsert: { active: true } },
        upsert: true,
      },
    })),
  );
  console.log(`Seeded ${prompts.length} prompts.`);
  await mongoose.disconnect();
}

seedPrompts().catch(async (error) => {
  console.error("Prompt seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
