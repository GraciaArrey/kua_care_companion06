// Server-only helper: resolves which AI gateway + key + model to use.
// Prefers the Lovable AI gateway (LOVABLE_API_KEY); otherwise falls back to
// Google's OpenAI-compatible Gemini endpoint (GEMINI_API_KEY / GOOGLE_API_KEY),
// which anyone can obtain free from https://aistudio.google.com/apikey.

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

export type AiProvider = {
  url: string;
  key: string;
  model: string;
  imageModel: string | null;
};

export function getAiProvider(): AiProvider | null {
  const lovable = process.env.LOVABLE_API_KEY;
  if (lovable) {
    return { url: LOVABLE_URL, key: lovable, model: "google/gemini-2.5-flash", imageModel: "google/gemini-2.5-flash-image" };
  }
  const gemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (gemini) {
    return { url: GEMINI_URL, key: gemini, model: "gemini-2.5-flash", imageModel: null };
  }
  return null;
}

export const AI_KEY_MISSING_MESSAGE =
  "AI is not configured. Set LOVABLE_API_KEY or GEMINI_API_KEY in your environment.";
