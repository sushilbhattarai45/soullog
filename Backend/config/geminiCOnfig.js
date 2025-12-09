// backend/musicJournalBackend.js
import { GoogleGenAI } from "@google/genai";
import YTMusic from "ytmusic-api";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY, {
  apiKey: process.env.GEMINI_API_KEY,
});

const ytmusic = new YTMusic();
await ytmusic.initialize(); // optional: cookies for personalization

// ----------------------------
// Helper function: safe JSON parsing from Gemini output
function safeJSONParse(text) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

// ----------------------------
// Preload multiple songs for a mood (before journaling)
const predefinedQueries = {
  happy: ["Top happy pop songs 2023", "Upbeat trending songs 2022-2024", "Feel-good pop music"],
  sad: ["Sad but uplifting songs 2022-2024", "Comforting pop songs 2020-2024", "Emotional pop tracks"],
  motivated: ["Motivational pop songs 2023", "Energetic trending songs 2022-2024", "Workout pop hits"],
  peaceful: ["Calm instrumental pop", "Relaxing trending music 2022-2024", "Chill piano and flute music"],
  nostalgic: ["Popular songs from 2017-2022", "Nostalgic pop hits", "Hits from last 6-8 years"],
  calm: ["Himalayan flute music", "Meditative pop instrumentals", "Relaxing trending tracks"],
};

export async function preloadMoodSongs(mood, limit = 5) {
  const queries = predefinedQueries[mood];
  const allResults = [];

  for (const q of queries) {
    const searchResults = await ytmusic.search(q);

    const songs = searchResults
      .filter((item) => item.videoId) // ensure it's a song/video
      .slice(0, limit);

    songs.forEach((song) => {
      allResults.push({
        title: song.name,
        artist: song.artist?.name || "Unknown",
        youtube_url: `https://www.youtube.com/watch?v=${song.videoId}`,
      });
    });


    if (allResults.length >= limit) break; // stop when enough songs collected
  }

  // Remove duplicates
  const uniqueResults = Array.from(
    new Map(allResults.map((item) => [`${item.title}-${item.artist}`, item])).values()
  ).slice(0, limit);

  return uniqueResults;
}

// ----------------------------
// Analyze journal + recommend song
const analysisPrompt = `
You are an AI that must return JSON only.

You will be given a personal journal entry. Your tasks:

1. Analyze the journal and determine its primary emotion. Choose exactly one:
   - "happy"
   - "sad"
   - "motivated"
   - "anxious"
   - "peaceful"
   - "nostalgic"
   - "mixed"

2. Recommend ONE English-language pop song that:
   - Is popular and widely listened to
   - Was released within the last 6–8 years (2017+)
   - Fits the emotion:
       • Sad/Anxious → uplifting or comforting
       • Happy/Motivated/Peaceful/Nostalgic → enhances the positive mood
   - Avoid explicit, harmful, AI-generated, or very old music
   - The song must exist and be findable on YouTube

3. Provide a short AI feedback message (2–3 sentences max):
   - Sad/Anxious → gentle reassurance or uplifting words
   - Happy/Motivated/Peaceful/Nostalgic → reflect positivity or encouragement
   - Tone: friendly, safe for teens, non-romantic, no deep psychological advice

Return strictly JSON in this format:
{
  "emotion": "",
  "song_recommendation": { "title": "", "artist": "", "reason": "" },
  "ai_feedback": ""
}
`;

async function analyzeJournal(journalText) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: analysisPrompt + `\n\nJournal Entry: "${journalText}"`,
  });

  const rawText = response.candidates[0].content.parts[0].text;
  return safeJSONParse(rawText);
}

// ----------------------------
// Get latest playable YouTube link for AI-recommended song
async function getLatestYouTubeLink(songTitle, artist) {
  const query = `${songTitle} by ${artist}`;
  const results = await ytmusic.search(query);

  const songs = results.filter((item) => item.videoId !== undefined);
  if (!songs.length) throw new Error("No song results found.");

  const recentSongs = songs.filter((s) => s.year && s.year >= new Date().getFullYear() - 8);
  const chosenSong = recentSongs[0] || songs[0];

  return {
    title: chosenSong.name,
    artist: chosenSong.artist?.name || "Unknown",
    youtube_url: `https://www.youtube.com/watch?v=${chosenSong.videoId}`,
  };
}

// ----------------------------
// Full workflow after journal submission
export async function processJournal(journalText) {
  try {
    const analysis = await analyzeJournal(journalText);
    console.log("Analysis:", analysis);

    const youtubeData = await getLatestYouTubeLink(
      analysis.song_recommendation.title,
      analysis.song_recommendation.artist
    );
    console.log("YouTube Data:", youtubeData);

    return {
      emotion: analysis.emotion,
      song: youtubeData,
      feedback: analysis.ai_feedback,
    };
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

// ----------------------------
// Example usage
/*
(async () => {
  const preSongs = await preloadMoodSongs("calm", 5);
  console.log("Preloaded Songs:", preSongs);

  const result = await processJournal("I felt overwhelmed today but managed to finish all my assignments.");
  console.log("Journal Analysis + Recommendation:", result);
})();
*/
