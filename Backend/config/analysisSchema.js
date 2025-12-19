const journalAnalysisSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "JournalAnalysisResponse",
  type: "object",
  required: ["emotion", "song_recommendation", "ai_feedback"],
  additionalProperties: false,

  properties: {
    emotion: {
      type: "string",
      enum: [
        "happy",
        "sad",
        "angry",
        "anxious",
        "excited",
        "calm",
        "neutral",
        "mixed",
        "peaceful",
        "nostalgic",
        "motivated",
      ],
    },

    song_recommendation: {
      type: "array",
      minItems: 5,
      maxItems: 6,
      items: {
        type: "object",
        required: ["title", "artist", "reason"],
        additionalProperties: false,
        properties: {
          title: { type: "string", minLength: 1 },
          artist: { type: "string", minLength: 1 },
          reason: { type: "string", minLength: 5 },
        },
      },
    },

    ai_feedback: {
      type: "string",
      minLength: 10,
    },
  },
};

export default journalAnalysisSchema;
