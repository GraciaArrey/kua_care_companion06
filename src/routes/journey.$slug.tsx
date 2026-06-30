import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { journeyBySlug, journeys, journeyForLang, type Journey } from "@/lib/kua-content";
import { usePrefs } from "@/lib/prefs";
import { useAuth } from "@/lib/auth";
import { useChildren } from "@/lib/children";
import { loadChildMilestones, setChildMilestone, milestoneId } from "@/lib/milestones";

export const Route = createFileRoute("/journey/$slug")({
  head: ({ params }) => {
    const j = journeyBySlug(params.slug);
    return { meta: [{ title: `${j?.title ?? "Journey"} - KUA` }, { name: "description", content: j?.intro ?? "Journey details." }] };
  },
  loader: ({ params }) => {
    const j = journeyBySlug(params.slug);
    if (!j) throw notFound();
    return { journey: j };
  },
  notFoundComponent: () => (
    <AppShell title="Journey not found">
      <Link to="/growth" className="text-primary hover:underline">← Back to Growth</Link>
    </AppShell>
  ),
  errorComponent: ({ error }) => <AppShell title="Something went wrong"><p className="text-muted-foreground">{error.message}</p></AppShell>,
  component: JourneyPage,
});

function JourneyPage() {
  const { journey } = Route.useLoaderData() as { journey: Journey };
  const { lang } = usePrefs();
  const { user } = useAuth();
  const { activeChild } = useChildren();
  const localized = journeyForLang(journey, lang);
  const [items, setItems] = useState<Journey["milestones"]>(localized.milestones);

  // When signed in with an active child, milestone state comes from the database
  // (defaulting to not-done). Signed out, we keep the hardcoded demo defaults.
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (user && activeChild) {
        const saved = await loadChildMilestones(activeChild.id);
        if (cancelled) return;
        setItems(localized.milestones.map((m, i) => ({ ...m, done: saved[milestoneId(journey.slug, i)] ?? false })));
      } else {
        setItems((prev) => localized.milestones.map((m, i) => ({ ...m, done: prev[i]?.done ?? m.done })));
      }
    }
    void hydrate();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, journey.slug, user?.id, activeChild?.id]);

  async function toggle(i: number) {
    let nextDone = false;
    setItems((arr) => arr.map((x, j) => {
      if (j !== i) return x;
      nextDone = !x.done;
      return { ...x, done: nextDone };
    }));
    if (user && activeChild) {
      const { error } = await setChildMilestone({ userId: user.id, childId: activeChild.id, slug: journey.slug, key: i, done: nextDone });
      if (error) {
        // revert on failure
        setItems((arr) => arr.map((x, j) => (j === i ? { ...x, done: !nextDone } : x)));
      }
    }
  }

  const done = items.filter((m) => m.done).length;
  const pct = Math.round((done / items.length) * 100);

  const ui = lang === "fr"
    ? { back: "Retour à la croissance", celebrated: "célébrées", along: "% du chemin parcouru", others: "Autres parcours" }
    : { back: "Back to Growth", celebrated: "celebrated", along: "% along the path", others: "Other journeys" };

  return (
    <AppShell title={localized.title} subtitle={localized.intro}>
      <Link to="/growth" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {ui.back}
      </Link>

      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {done} {lang === "fr" ? "sur" : "of"} {items.length} {ui.celebrated}
            </div>
            <h2 className="mt-2 font-display text-2xl font-extrabold">{pct}{ui.along}</h2>
          </div>
          <div className="hidden h-2 w-48 overflow-hidden rounded-full bg-muted md:block">
            <div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <ol className="mt-6 space-y-2">
          {items.map((m, i) => (
            <li key={`${i}-${m.title}`}>
              <button
                onClick={() => void toggle(i)}
                className={`flex w-full items-start gap-4 rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-border hover:bg-muted/40 ${m.done ? "opacity-70" : ""}`}
              >
                {m.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold ${m.done ? "line-through" : ""}`}>{m.title}</div>
                  {m.note && <div className="mt-1 text-xs text-muted-foreground">{m.note}</div>}
                </div>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">{ui.others}</h3>
        <div className="flex flex-wrap gap-2">
          {journeys.filter((j) => j.slug !== journey.slug).map((j) => {
            const lj = journeyForLang(j, lang);
            return (
              <Link key={j.slug} to="/journey/$slug" params={{ slug: j.slug }} className="rounded-full bg-muted px-4 py-2 text-xs font-semibold hover:bg-primary-soft hover:text-primary">
                {lj.title}
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
