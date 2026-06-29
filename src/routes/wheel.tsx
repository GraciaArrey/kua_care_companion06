import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Volume2, Wind, BookHeart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePrefs, useT } from "@/lib/prefs";
import { toast } from "sonner";

export const Route = createFileRoute("/wheel")({
  head: () => ({ meta: [{ title: "Emotion wheel - KUA" }, { name: "description", content: "An interactive emotion wheel with bilingual voice playback." }] }),
  component: WheelPage,
});

// Plutchik-inspired core emotions, with secondary nuances per slice.
type Slice = {
  key: string;
  en: string;
  fr: string;
  color: string;
  secondaries: { en: string; fr: string }[];
};

const slices: Slice[] = [
  { key: "joy",    en: "Joy",     fr: "Joie",      color: "oklch(0.88 0.14 95)",  secondaries: [{ en: "Calm", fr: "Calme" }, { en: "Proud", fr: "Fier·ère" }, { en: "Excited", fr: "Enthousiaste" }] },
  { key: "trust",  en: "Trust",   fr: "Confiance", color: "oklch(0.85 0.10 150)", secondaries: [{ en: "Safe", fr: "En sécurité" }, { en: "Loved", fr: "Aimé·e" }, { en: "Hopeful", fr: "Plein·e d'espoir" }] },
  { key: "fear",   en: "Fear",    fr: "Peur",      color: "oklch(0.78 0.10 230)", secondaries: [{ en: "Worried", fr: "Inquiet·ète" }, { en: "Scared", fr: "Effrayé·e" }, { en: "Nervous", fr: "Nerveux·se" }] },
  { key: "surprise", en: "Surprise", fr: "Surprise", color: "oklch(0.82 0.10 200)", secondaries: [{ en: "Curious", fr: "Curieux·se" }, { en: "Confused", fr: "Confus·e" }, { en: "Amazed", fr: "Émerveillé·e" }] },
  { key: "sadness", en: "Sadness", fr: "Tristesse", color: "oklch(0.74 0.06 270)", secondaries: [{ en: "Lonely", fr: "Seul·e" }, { en: "Tired", fr: "Fatigué·e" }, { en: "Hurt", fr: "Blessé·e" }] },
  { key: "disgust", en: "Yuck",    fr: "Dégoût",    color: "oklch(0.80 0.10 130)", secondaries: [{ en: "Bothered", fr: "Gêné·e" }, { en: "Uncomfortable", fr: "Mal à l'aise" }, { en: "Done", fr: "Fini·e" }] },
  { key: "anger",  en: "Anger",   fr: "Colère",    color: "oklch(0.78 0.13 30)",  secondaries: [{ en: "Frustrated", fr: "Frustré·e" }, { en: "Annoyed", fr: "Agacé·e" }, { en: "Furious", fr: "Furieux·se" }] },
  { key: "anticipation", en: "Wanting", fr: "Envie", color: "oklch(0.86 0.12 70)", secondaries: [{ en: "Eager", fr: "Impatient·e" }, { en: "Focused", fr: "Concentré·e" }, { en: "Playful", fr: "Joueur·se" }] },
];

function speak(text: string, lang: "en" | "fr") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "fr" ? "fr-FR" : "en-US";
  u.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, rIn: number, rOut: number, a0: number, a1: number) {
  const p1 = polar(cx, cy, rOut, a0);
  const p2 = polar(cx, cy, rOut, a1);
  const p3 = polar(cx, cy, rIn, a1);
  const p4 = polar(cx, cy, rIn, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

function WheelPage() {
  const { lang } = usePrefs();
  const t = useT();
  const [active, setActive] = useState<Slice | null>(null);

  const saveToVault = () => {
    if (!active) return;
    try {
      const key = "kua_vault_v1";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.unshift({ id: Date.now(), text: `Felt: ${lang === "fr" ? active.fr : active.en}`, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(arr));
      toast.success(lang === "fr" ? "Ajouté au coffre" : "Saved to your vault");
    } catch {}
  };

  const cx = 220, cy = 220, rIn = 60, rOut = 200;
  const step = 360 / slices.length;

  return (
    <AppShell title={lang === "fr" ? "Roue des émotions" : "Emotion wheel"} subtitle={lang === "fr" ? "Touche un pétale. Écoute. Respire." : "Tap a petal. Listen. Breathe."}>
      <Link to="/communication" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {lang === "fr" ? "Retour" : "Back"}
      </Link>

      <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
        <div className="grid place-items-center">
          <svg viewBox="0 0 440 440" className="h-auto w-full max-w-md">
            {slices.map((s, i) => {
              const a0 = i * step;
              const a1 = (i + 1) * step;
              const mid = a0 + step / 2;
              const labelPos = polar(cx, cy, (rIn + rOut) / 2, mid);
              const isActive = active?.key === s.key;
              return (
                <g key={s.key} className="cursor-pointer" onClick={() => { setActive(s); speak(lang === "fr" ? s.fr : s.en, lang); }}>
                  <path
                    d={arcPath(cx, cy, rIn, rOut, a0, a1)}
                    fill={s.color}
                    stroke="white"
                    strokeWidth={3}
                    style={{ opacity: isActive ? 1 : 0.85, transition: "opacity 300ms, transform 300ms", transformOrigin: `${cx}px ${cy}px`, transform: isActive ? "scale(1.04)" : "scale(1)" }}
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none fill-foreground font-display text-[14px] font-bold"
                    transform={`rotate(${mid > 180 ? mid - 270 : mid - 90} ${labelPos.x} ${labelPos.y})`}
                  >
                    {lang === "fr" ? s.fr : s.en}
                  </text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={rIn - 4} fill="var(--color-card)" stroke="var(--color-border)" />
            <text x={cx} y={cy - 4} textAnchor="middle" className="fill-muted-foreground text-[10px] uppercase tracking-widest">{lang === "fr" ? "je me sens" : "I feel"}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" className="fill-foreground font-display text-[16px] font-extrabold">{active ? (lang === "fr" ? active.fr : active.en) : "…"}</text>
          </svg>
        </div>

        <aside className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          {active ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl font-extrabold">{lang === "fr" ? active.fr : active.en}</h3>
                <button
                  onClick={() => speak(lang === "fr" ? active.fr : active.en, lang)}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
                  aria-label="Speak"
                >
                  <Volume2 className="h-3.5 w-3.5" /> {lang === "fr" ? "Écouter" : "Speak"}
                </button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr" ? "Voici des nuances proches. Touche pour entendre." : "Here are some close nuances. Tap to hear."}
              </p>
              <div className="mt-4 grid gap-2">
                {active.secondaries.map((s) => (
                  <button
                    key={s.en}
                    onClick={() => speak(lang === "fr" ? s.fr : s.en, lang)}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted"
                  >
                    <span>{lang === "fr" ? s.fr : s.en}</span>
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link to="/breathing" className="flex items-center justify-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90">
                  <Wind className="h-4 w-4" /> {t("goBreathe")}
                </Link>
                <button onClick={saveToVault} className="flex items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-4 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90">
                  <BookHeart className="h-4 w-4" /> {t("saveToVault")}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lang === "fr" ? "Touche un pétale de la roue pour commencer." : "Tap a petal on the wheel to begin."}
            </p>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
