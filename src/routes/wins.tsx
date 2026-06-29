import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, Trash2, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PersonalLine, useNames } from "@/lib/personalize";

type Win = { id: string; text: string; at: number };
const KEY = "kua_wins";

export const Route = createFileRoute("/wins")({
  head: () => ({ meta: [{ title: "Small wins - KUA" }, { name: "description", content: "Celebrate the moments that matter." }] }),
  component: WinsPage,
});

function WinsPage() {
  const [wins, setWins] = useState<Win[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setWins(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  }, []);

  const persist = (next: Win[]) => {
    setWins(next);
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = () => {
    if (!text.trim()) return;
    persist([{ id: crypto.randomUUID(), text: text.trim(), at: Date.now() }, ...wins]);
    setText("");
  };

  const names = useNames();
  return (
    <AppShell title={`${names.child}'s small wins`} subtitle="Worth celebrating. Every single one.">
      <Link to="/today" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Today
      </Link>
      <PersonalLine pool="win" className="mb-6" />

      <section className="rounded-3xl bg-gradient-warm p-6 shadow-soft">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground/70">
          <Sparkles className="h-3.5 w-3.5" /> Add a win
        </label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="e.g. Asked for water with a card."
          className="mt-3 w-full rounded-2xl border border-border bg-card p-4 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex justify-end">
          <button onClick={add} disabled={!text.trim()} className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background disabled:opacity-40">
            Celebrate
          </button>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {wins.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">No wins yet. The first one is on its way.</div>
        )}
        {wins.map((w) => (
          <article key={w.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary/30 text-secondary-foreground"><Star className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm">{w.text}</p>
              <div className="mt-1 text-[11px] text-muted-foreground">{new Date(w.at).toLocaleString()}</div>
            </div>
            <button onClick={() => persist(wins.filter((x) => x.id !== w.id))} className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-tertiary" aria-label="Remove">
              <Trash2 className="h-4 w-4" />
            </button>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
