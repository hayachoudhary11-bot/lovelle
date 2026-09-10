import "dotenv/config";
import mongoose from "mongoose";
import { ChallengeQuestion } from "./models/ChallengeQuestion";

const questions = [
  { questionText: "Do your best impression of your partner. What do you say?", category: "silly" },
  { questionText: "Plan your dream date using only things already in your home.", category: "creative" },
  { questionText: "What harmless rule should your relationship have for one day?", category: "silly" },
  { questionText: "Invent a ridiculous couple nickname and explain it.", category: "fun" },
  { questionText: "What snack would win a competition against every other snack?", category: "debate" },
  { questionText: "If your partner were a superhero, what would their power be?", category: "playful" },
  { questionText: "Send your partner a compliment in the style of a sports commentator.", category: "creative" },
  { questionText: "Choose a movie title that describes your relationship today.", category: "fun" },
  { questionText: "What would your couple mascot be, and what would you name it?", category: "creative" },
  { questionText: "Create a two-line jingle about something you both love.", category: "creative" },
  { questionText: "Which of you would survive longer in a pillow-fort championship?", category: "debate" },
  { questionText: "What tiny everyday task should become an Olympic event?", category: "silly" },
  { questionText: "Give your partner an award for something they do exceptionally well.", category: "appreciation" },
  { questionText: "If you opened a restaurant together, what would it be called?", category: "dreams" },
  { questionText: "Invent a secret handshake using words instead of hand motions.", category: "playful" },
];

async function seedChallenges() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
  await mongoose.connect(process.env.MONGO_URI);
  await ChallengeQuestion.bulkWrite(
    questions.map((question) => ({
      updateOne: {
        filter: { questionText: question.questionText },
        update: { $set: question, $setOnInsert: { active: true } },
        upsert: true,
      },
    })),
  );
  console.log(`Seeded ${questions.length} challenge questions.`);
  await mongoose.disconnect();
}

seedChallenges().catch(async (error) => {
  console.error("Challenge seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
