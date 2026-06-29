import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type Task = "rephrase" | "hero" | "insights" | "reflection" | "avatar";

type Body = {
  task: Task;
  lang?: "en" | "fr";
  text?: string;
  cards?: string[];
  data?: Record<string, unknown>;
  imageDataUrl?: string;
};

function systemFor(task: Task, lang: "en" | "fr") {
  const isFr = lang === "fr";
  switch (task) {
    case "rephrase":
      return isFr
        ? "Tu es un assistant de communication doux pour des enfants autistes. Reçois une liste de mots-cartes et compose UNE phrase courte, naturelle, chaleureuse en français (max 12 mots). Réponds uniquement avec la phrase, sans guillemets."
        : "You are a gentle communication helper for autistic children. Take a list of card words and compose ONE short, natural, warm sentence in English (max 12 words). Reply with the sentence only, no quotes.";
    case "hero":
      return isFr
        ? "Tu écris une affirmation très douce (max 14 mots) pour la page d'accueil d'une app de soin pour familles d'enfants autistes. Ton: calme, poétique, sans cliché. Réponds uniquement avec l'affirmation."
        : "Write a very gentle affirmation (max 14 words) for the home page of a care app for families of autistic children. Tone: calm, poetic, never clichéd. Reply with the affirmation only.";
    case "reflection":
      return isFr
        ? "Tu es un compagnon bienveillant. Donne UNE micro-réflexion (2 phrases, max 30 mots) basée sur l'humeur et l'avancement du jour. Pas d'emoji excessif (max 1)."
        : "You are a warm companion. Give ONE micro-reflection (2 sentences, max 30 words) based on the mood and the day's progress. Avoid excessive emoji (max 1).";
    case "insights":
      return isFr
        ? "Tu analyses 30 jours d'humeurs d'un enfant pour ses parents. Réponds en JSON STRICT: {\"summary\": string (2 phrases max), \"highlights\": string[3], \"suggestions\": string[3]}. Ton bienveillant, sans jargon."
        : "You analyze 30 days of a child's moods for their parents. Reply with STRICT JSON: {\"summary\": string (max 2 sentences), \"highlights\": string[3], \"suggestions\": string[3]}. Warm, no jargon.";
    case "avatar":
      return "Crop the image to a tight square centered on the main subject's face. Soft natural lighting. Same person, no edits to features. Return the cropped portrait.";
  }
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const lang = body.lang === "fr" ? "fr" : "en";
        const system = systemFor(body.task, lang);

        // Avatar uses image generation model
        if (body.task === "avatar") {
          if (!body.imageDataUrl) return new Response("Missing image", { status: 400 });
          const r = await fetch(GATEWAY, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: system },
                    { type: "image_url", image_url: { url: body.imageDataUrl } },
                  ],
                },
              ],
              modalities: ["image", "text"],
            }),
          });
          if (!r.ok) {
            const t = await r.text();
            return new Response(t, { status: r.status });
          }
          const j: any = await r.json();
          const img =
            j?.choices?.[0]?.message?.images?.[0]?.image_url?.url ??
            j?.choices?.[0]?.message?.image_url?.url ??
            null;
          return Response.json({ imageDataUrl: img });
        }

        // Build prompt
        let userPrompt = "";
        if (body.task === "rephrase") {
          userPrompt = `Cards: ${(body.cards || []).join(", ")}`;
        } else if (body.task === "hero") {
          userPrompt = "Give one fresh affirmation now.";
        } else if (body.task === "reflection") {
          const d = body.data || {};
          userPrompt = `Mood: ${d.mood ?? "unknown"}. Routine done: ${d.done ?? 0}/${d.total ?? 0}. Time of day: ${d.timeOfDay ?? "day"}.`;
        } else if (body.task === "insights") {
          userPrompt = `Mood log (date:mood):\n${(body.data?.entries as string[] | undefined)?.join("\n") || "no data"}`;
        }

        const r = await fetch(GATEWAY, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: system },
              { role: "user", content: userPrompt },
            ],
            ...(body.task === "insights" ? { response_format: { type: "json_object" } } : {}),
          }),
        });
        if (!r.ok) {
          const t = await r.text();
          return new Response(t, { status: r.status });
        }
        const j: any = await r.json();
        const text: string = j?.choices?.[0]?.message?.content ?? "";
        if (body.task === "insights") {
          try {
            return Response.json(JSON.parse(text));
          } catch {
            return Response.json({ summary: text, highlights: [], suggestions: [] });
          }
        }
        return Response.json({ text: text.trim().replace(/^["']|["']$/g, "").replace(/\*\*/g, "") });
      },
    },
  },
});
