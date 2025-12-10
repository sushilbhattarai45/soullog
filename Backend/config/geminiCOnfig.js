import { GoogleGenAI } from "@google/genai";
import YTMusic from "ytmusic-api"
import dotenv from 'dotenv';

dotenv.config ();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY, {
  apiKey: process.env.GEMINI_API_KEY
});
const ytmusic = new YTMusic();

await ytmusic.initialize(); // optional: cookies for personalization

const analysisPrompt = "You are an AI that must return JSON only, with no explanations or extra text. " +
"You will be given a personal journal entry. Your tasks: " +
"1. Analyze the journal and determine its primary emotion. Choose exactly one: " +
" - \"happy\" " +
" - \"sad\" " +
" - \"motivated\" " +
" - \"anxious\" " +
" - \"peaceful\" " +
" - \"nostalgic\" " +
" - \"mixed\" " +
"2. Recommend ONE English-language pop song that: " +
" - Is popular and widely listened to " +
" - Was released within the last 6–8 years (2017 or newer) " +
" - Fits the emotion: " +
"     • If sad or anxious → choose a comforting or uplifting popular song " +
"     • If happy, motivated, peaceful, or nostalgic → choose a song that enhances the mood " +
" - Avoid explicit, harmful, AI-generated, or extremely old music " +
" - The song must exist and be findable on YouTube " +
"3. Provide a short AI feedback message (2–3 sentences max): " +
" - If the journal is sad or anxious → give gentle reassurance or uplifting words " +
" - If the journal is happy, motivated, peaceful, or nostalgic → reflect positivity or encouragement " +
" - Keep the tone friendly, safe for teens, and non-romantic " +
" - Do not give therapy-like advice or deep psychological claims " +
"Return strictly JSON in this format: " +
"{ " +
"\"emotion\": \"\", " +
"\"song_recommendation\": { " +
"\"title\": \"\", " +
"\"artist\": \"\", " +
"\"reason\": \"\" " +
"}, " +
"\"ai_feedback\": \"\" " +
"}";



function safeJSONParse(text) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

async function analyzeJournal(journalText) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: analysisPrompt + `\n\nJournal Entry: "${journalText}"`
  });

  const rawText = response.candidates[0].content.parts[0].text;
  return safeJSONParse(rawText);
}

async function getLatestYouTubeLink(songTitle, artist) {
  const query = `${songTitle} +"by"+ ${artist}`;
  const results = await ytmusic.search(query);
  // Filter only songs
  const songs = results.filter(item =>item.videoId !== undefined);
  if (songs.length === 0) throw new Error("No song results found.");

  // Prefer recent releases (sort by published date if available)
  const recentSongs = songs
    .filter(s => s.year && s.year >= new Date().getFullYear() - 8);

  const chosenSong = recentSongs[0] || songs[0];
  console.log (chosenSong);
  // fallback to first song if no recent ones

  return {
    title: chosenSong.name,
    artist: chosenSong.artist.name,
    youtube_url: `https://www.youtube.com/watch?v=${chosenSong.videoId}`
  };
}

export default async function main(journalText) {
  try {
    const analysis = await analyzeJournal(journalText);
    console.log("Analysis:", analysis);

    const youtubeData = await getLatestYouTubeLink(
      analysis.song_recommendation.title,
      analysis.song_recommendation.artist
    );
    console.log("YouTube Data:", youtubeData);

    const combined = {
      emotion: analysis.emotion,
      song: youtubeData,
      feedback: analysis.ai_feedback
    };

    console.log("Combined Result:", combined);
    return combined;

  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

// Example usage
