// Tiny client wrapper for /api/ai
export type AvatarResp = { imageDataUrl: string | null };
export type TextResp = { text: string };
export type InsightsResp = { summary: string; highlights: string[]; suggestions: string[] };

async function post<T>(body: unknown): Promise<T> {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    if (r.status === 429) throw new Error("rate-limited");
    if (r.status === 402) throw new Error("credits-exhausted");
    throw new Error(t || "AI request failed");
  }
  return (await r.json()) as T;
}

export const aiRephrase = (cards: string[], lang: "en" | "fr") =>
  post<TextResp>({ task: "rephrase", cards, lang });

export const aiHero = (lang: "en" | "fr") =>
  post<TextResp>({ task: "hero", lang });

export const aiReflection = (
  data: { mood: string | null; done: number; total: number; timeOfDay: string },
  lang: "en" | "fr",
) => post<TextResp>({ task: "reflection", data, lang });

export const aiInsights = (entries: string[], lang: "en" | "fr") =>
  post<InsightsResp>({ task: "insights", data: { entries }, lang });

export const aiAvatar = (imageDataUrl: string) =>
  post<AvatarResp>({ task: "avatar", imageDataUrl });
