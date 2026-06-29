import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePrefs } from "@/lib/prefs";

export const Route = createFileRoute("/breathing")({
  head: () => ({ meta: [{ title: "Breathing - KUA" }, { name: "description", content: "A 90-second guided box-breathing exercise." }] }),
  component: BreathingPage,
});

const PHASES_EN = [
  { label: "Breathe in", seconds: 4, scale: 1.6 },
  { label: "Hold", seconds: 4, scale: 1.6 },
  { label: "Breathe out", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 4, scale: 1 },
] as const;

const PHASES_FR = [
  { label: "Inspirez", seconds: 4, scale: 1.6 },
  { label: "Retenez", seconds: 4, scale: 1.6 },
  { label: "Expirez", seconds: 4, scale: 1 },
  { label: "Retenez", seconds: 4, scale: 1 },
] as const;

function BreathingPage() {
  const { lang } = usePrefs();
  const PHASES = lang === "fr" ? PHASES_FR : PHASES_EN;
  const ui = lang === "fr"
    ? {
        title: "Une respiration, juste pour vous",
        subtitle: "90 secondes de respiration carrée douce. Rien à faire, sinon suivre.",
        back: "Retour à Aujourd'hui",
        ready: "Prêt ?",
        pause: "Pause",
        resume: "Reprendre",
        start: "Commencer",
        reset: "Recommencer",
        of: (e: number) => `${e}s sur 90s`,
      }
    : {
        title: "A breath, just for you",
        subtitle: "90 seconds of soft box breathing. Nothing to do but follow.",
        back: "Back to Today",
        ready: "Ready?",
        pause: "Pause",
        resume: "Resume",
        start: "Start",
        reset: "Reset",
        of: (e: number) => `${e}s of 90s`,
      };

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState<number>(PHASES[0].seconds);
  const [elapsed, setElapsed] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPhase((p) => (p + 1) % PHASES.length);
        return PHASES[(phase + 1) % PHASES.length].seconds;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [running, phase, PHASES]);

  useEffect(() => { if (elapsed >= 90) setRunning(false); }, [elapsed]);

  const reset = () => { setRunning(false); setPhase(0); setCount(PHASES[0].seconds); setElapsed(0); };
  const current = PHASES[phase];

  return (
    <AppShell title={ui.title} subtitle={ui.subtitle}>
      <Link to="/today" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {ui.back}
      </Link>

      <section className="grid place-items-center rounded-3xl border border-border/60 bg-gradient-to-b from-primary-soft to-card p-10 shadow-soft">
        <div className="relative grid h-72 w-72 place-items-center">
          <div
            className="absolute inset-0 rounded-full bg-gradient-primary opacity-80 transition-transform duration-[4000ms] ease-in-out"
            style={{ transform: `scale(${running ? current.scale * 0.6 : 0.6})` }}
          />
          <div className="relative text-center text-primary-foreground">
            <div className="font-display text-3xl font-extrabold drop-shadow">{running ? current.label : ui.ready}</div>
            <div className="mt-2 text-5xl font-bold tabular-nums drop-shadow">{running ? count : "•"}</div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-glow"
          >
            {running ? <><Pause className="h-4 w-4" /> {ui.pause}</> : <><Play className="h-4 w-4" /> {elapsed ? ui.resume : ui.start}</>}
          </button>
          <button onClick={reset} className="flex items-center gap-2 rounded-full bg-card px-5 py-3 text-sm font-semibold shadow-soft hover:opacity-90">
            <RotateCcw className="h-4 w-4" /> {ui.reset}
          </button>
        </div>

        <div className="mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-primary transition-all" style={{ width: `${(elapsed / 90) * 100}%` }} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{ui.of(elapsed)}</p>
      </section>
    </AppShell>
  );
}
