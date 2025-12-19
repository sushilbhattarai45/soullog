// backend/musicJournalBackend.js
import { GoogleGenAI } from "@google/genai";
import YTMusic from "ytmusic-api";
import dotenv from "dotenv";
import journalAnalysisSchema from "./analysisSchema.js";
dotenv.config();

// ----------------------------
// Gemini setup
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY, {
  apiKey: process.env.GEMINI_API_KEY,
});

// ----------------------------
// YouTube Music setup
const ytmusic = new YTMusic();
await ytmusic.initialize();

// ----------------------------
// ROBUST JSON parsing from Gemini output
function safeJSONParse(text) {
  try {
    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Extract only JSON block
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found");
    }

    cleaned = cleaned.slice(firstBrace, lastBrace + 1);

    // Remove trailing commas
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ JSON PARSE FAILED");
    console.error("RAW GEMINI OUTPUT:\n", text);
    throw err;
  }
}

// ----------------------------
// Preload multiple songs for a mood
const predefinedQueries = {
  happy: [
    "Top happy pop songs 2023",
    "Upbeat trending songs 2022-2024",
    "Feel-good pop music",
  ],
  sad: [
    "Sad but uplifting songs 2022-2024",
    "Comforting pop songs 2020-2024",
    "Emotional pop tracks",
  ],
  motivated: [
    "Motivational pop songs 2023",
    "Energetic trending songs 2022-2024",
    "Workout pop hits",
  ],
  calm: [
    "Calm instrumental pop",
    "Relaxing trending music 2022-2024",
    "Chill piano and flute music",
  ],
  nostalgic: [
    "Popular songs from 2017-2022",
    "Nostalgic pop hits",
    "Hits from last 6-8 years",
  ],
};

export async function preloadMoodSongs(mood, limit = 5) {
  try{
  console.log("Preloading songs for mood:", mood);
  const queries = predefinedQueries[mood];
  if (!queries) return [];


  const allResults = [];

  for (const q of queries) {
    const searchResults = await ytmusic.search(q);

    const songs = searchResults
      .filter((item) => item.videoId)
      .slice(0, limit);

    songs.forEach((song) => {
      allResults.push({
        title: song.name,
        artist: song.artist?.name || "Unknown",
        youtube_url: `https://www.youtube.com/watch?v=${song.videoId}`,
      });
    });

    console.log(`Query "${q}" returned ${songs.length} songs.`);

    if (allResults.length >= limit) break;
  }

  // Remove duplicates
  const uniqueResults = Array.from(
    new Map(
      allResults.map((item) => [`${item.title}-${item.artist}`, item])
    ).values()
  ).slice(0, limit);

  return uniqueResults;}
  catch(err){
    console.error("❌ Error preloading mood songs:", err);
    return [];
  }
}

// ----------------------------
// Gemini analysis prompt
const analysisPrompt = `
SYSTEM RULES (MANDATORY — DO NOT VIOLATE):

- Output MUST be a single valid JSON object
- Use DOUBLE QUOTES for all keys and all string values
- Do NOT include markdown, comments, or explanations
- Do NOT include trailing commas
- Do NOT include extra keys
- Do NOT omit required keys
- Output NOTHING except the JSON object

--------------------------------------------------

You are an AI assistant for a teen-friendly journaling app.

ALLOWED EMOTIONS (choose EXACTLY ONE and ONLY from this list):
"happy"
"sad"
"angry"
"anxious"
"excited"
"calm"
"neutral"
"mixed"
"peaceful"
"nostalgic"
"motivated"

--------------------------------------------------

TASKS:

1. Analyze the journal entry and select ONE primary emotion
   - The emotion value MUST EXACTLY MATCH one of the allowed strings above

2. Recommend BETWEEN 5 AND 6 real, popular, English-language pop songs:
   - Released in 2017 or later
   - Widely known / mainstream
   - Must exist on YouTube
   - MUST follow emotional logic:

   Emotional Logic:
   - sad OR anxious OR angry → uplifting, hopeful, motivating
   - happy OR excited → joyful, upbeat
   - motivated → energetic, inspiring
   - calm OR peaceful → soothing, relaxing
   - nostalgic → warm, reflective, positive
   - mixed OR neutral → emotionally balanced, gently uplifting

3. Each song object MUST include ALL of the following:
   - "title": non-empty string
   - "artist": non-empty string
   - "reason": short explanation (1 sentence)

4. Write an AI feedback message:
   - 2–3 sentences ONLY
   - Friendly, supportive, teen-safe
   - No romance
   - No therapy, diagnosis, or psychological advice

--------------------------------------------------

OUTPUT FORMAT (STRICT — MUST MATCH EXACTLY):

{
  "emotion": "one of the allowed emotion strings",
  "song_recommendation": [
    {
      "title": "string",
      "artist": "string",
      "reason": "string"
    }
  ],
  "ai_feedback": "string"
}

IMPORTANT:
- "song_recommendation" MUST be an array
- The array MUST contain at least 5 items
- If ANY rule cannot be followed, still return valid JSON that best follows the rules
`;


// ----------------------------
// Analyze journal
async function analyzeJournal(journalText) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: analysisPrompt + `\n\nJournal Entry:\n${journalText}`,
    schema: journalAnalysisSchema,
  });

  const rawText =
    response?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Empty Gemini response");
  }

  return safeJSONParse(rawText);
}

// ----------------------------
// Get playable YouTube link
async function getLatestYouTubeLink(songTitle, artist) {
  const query = `${songTitle} by ${artist}`;
  const results = await ytmusic.search(query);

  const songs = results.filter((item) => item.videoId);
  if (!songs.length) throw new Error("No YouTube results");

  const recentSongs = songs.filter(
    (s) => s.year && s.year >= new Date().getFullYear() - 8
  );

  const chosen = recentSongs[0] || songs[0];

  return {
    title: chosen.name,
    artist: chosen.artist?.name || "Unknown",
    youtube_url: `https://www.youtube.com/watch?v=${chosen.videoId}`,
  };
}

// ----------------------------
// Full workflow
export async function processJournal(journalText) {
  try {
    const analysis = await analyzeJournal(journalText);
    console.log("Analysis:", analysis);

    const songsWithLinks = await Promise.all(
      analysis.song_recommendation.map(async (song) => {
        try {
          const yt = await getLatestYouTubeLink(song.title, song.artist);
          return {
            title: yt.title,
            artist: yt.artist,
            youtube_url: yt.youtube_url,
            reason: song.reason,
          };
        } catch {
          return null;
        }
      })
    );

    return {
      emotion: analysis.emotion,
      songs: songsWithLinks.filter(Boolean),
      feedback: analysis.ai_feedback,
    };
  } catch (err) {
    console.error("❌ Error processing journal:", err);
    throw err;
  }
}

// ----------------------------
// Example usage
/*
(async () => {
  const preSongs = await preloadMoodSongs("peaceful", 5);
  console.log("Preloaded Songs:", preSongs);

  const result = await processJournal(
    "I felt overwhelmed today but still completed my tasks."
  );
  console.log("Final Result:", result);
})();
*/
