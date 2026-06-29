import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sun, Sparkles, CheckCircle2, Circle, Wind, HeartHandshake,
  MessageCircle, Headphones, Coffee, Moon, Smile, Frown, Meh, Cloud, Zap, Wand2, Loader2,
  Plus, Pencil, Trash2, Check, X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { usePrefs, useT } from "@/lib/prefs";
import { aiReflection } from "@/lib/ai-client";
import { PersonalLine, useNames } from "@/lib/personalize";

export const Route = createFileRoute("/today")({
  head: () => ({ meta: [{ title: "Today - KUA" }, { name: "description", content: "Your gentle, personalized day with KUA." }] }),
  component: TodayPage,
});

type RhythmItem = { id: string; time: string; title: string; titleFr?: string; done: boolean };

const DEFAULT_ROUTINE: RhythmItem[] = [
  { id: "r1", time: "07:30", title: "Soft wake-up", titleFr: "Réveil en douceur", done: false },
  { id: "r2", time: "08:00", title: "Brush teeth", titleFr: "Brosser les dents", done: false },
  { id: "r3", time: "08:30", title: "Quiet breakfast", titleFr: "Petit-déjeuner calme", done: false },
  { id: "r4", time: "10:00", title: "Reading corner", titleFr: "Coin lecture", done: false },
  { id: "r5", time: "13:00", title: "Calm walk outside", titleFr: "Promenade tranquille", done: false },
  { id: "r6", time: "19:30", title: "Bedtime story", titleFr: "Histoire du soir", done: false },
];

const RHYTHM_KEY = "kua_today_rhythm_v1";

function tone(t: string) {
  if (t === "tertiary") return "bg-tertiary/10 text-tertiary";
  if (t === "secondary") return "bg-secondary/25 text-secondary-foreground";
  return "bg-primary-soft text-primary";
}

function TodayPage() {
  const t = useT();
  const { lang } = usePrefs();
  const { profile } = useAuth();
  const [mood, setMood] = useState<string | null>(null);
  const [tasks, setTasks] = useState<RhythmItem[]>(DEFAULT_ROUTINE);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ time: "12:00", title: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ time: "", title: "" });
  const [reflection, setReflection] = useState<string | null>(null);
  const [reflBusy, setReflBusy] = useState(false);

  // Load rhythm from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(RHYTHM_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setTasks(parsed);
      }
    } catch {}
  }, []);

  const persist = (next: RhythmItem[]) => {
    setTasks(next);
    try { localStorage.setItem(RHYTHM_KEY, JSON.stringify(next)); } catch {}
  };

  const moods = useMemo(() => ([
    { key: "calm", label: lang === "fr" ? "Calme" : "Calm", icon: Smile, tint: "bg-primary-soft text-primary" },
    { key: "happy", label: lang === "fr" ? "Heureux" : "Happy", icon: Sun, tint: "bg-secondary/30 text-secondary-foreground" },
    { key: "tired", label: lang === "fr" ? "Fatigué" : "Tired", icon: Moon, tint: "bg-info/15 text-info" },
    { key: "sad", label: lang === "fr" ? "Triste" : "Sad", icon: Frown, tint: "bg-tertiary/15 text-tertiary" },
    { key: "meh", label: lang === "fr" ? "Juste ok" : "Just okay", icon: Meh, tint: "bg-muted text-muted-foreground" },
    { key: "overwhelm", label: lang === "fr" ? "Submergé" : "Overwhelmed", icon: Cloud, tint: "bg-tertiary/20 text-tertiary" },
    { key: "energetic", label: lang === "fr" ? "Énergique" : "Energetic", icon: Zap, tint: "bg-warning/20 text-foreground" },
  ]), [lang]);

  const done = tasks.filter((x) => x.done).length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("goodMorning");
    if (h < 18) return t("goodAfternoon");
    return t("goodEvening");
  })();
  const timeOfDay = (() => {
    const h = new Date().getHours();
    return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  })();

  const ROLE_LABEL_EN: Record<string, string> = { mom: "Mom", dad: "Dad", sibling: "Sibling", caregiver: "Caregiver" };
  const ROLE_LABEL_FR: Record<string, string> = { mom: "Maman", dad: "Papa", sibling: "Frère/Sœur", caregiver: "Aidant" };
  const roleMap = lang === "fr" ? ROLE_LABEL_FR : ROLE_LABEL_EN;
  const names = useNames();
  const caregiverName = profile?.caregiver_name?.trim() || roleMap[profile?.caregiver_role ?? "caregiver"] || (lang === "fr" ? "Aidant" : "Caregiver");
  const childName = names.child;
  const rhythm = t("rhythmHint").replace("{a}", String(done)).replace("{b}", String(tasks.length));

  useEffect(() => {
    let cancel = false;
    setReflBusy(true); setReflection(null);
    aiReflection({ mood, done, total: tasks.length, timeOfDay }, lang)
      .then((r) => { if (!cancel) setReflection(r.text); })
      .catch(() => {})
      .finally(() => { if (!cancel) setReflBusy(false); });
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, done, lang]);

  const tr = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const itemTitle = (it: RhythmItem) => (lang === "fr" && it.titleFr ? it.titleFr : it.title);

  const addItem = () => {
    if (!draft.title.trim()) return;
    const next: RhythmItem[] = [
      ...tasks,
      { id: `r${Date.now()}`, time: draft.time, title: draft.title.trim(), done: false },
    ].sort((a, b) => a.time.localeCompare(b.time));
    persist(next);
    setDraft({ time: "12:00", title: "" });
    setAdding(false);
  };

  const startEdit = (it: RhythmItem) => {
    setEditingId(it.id);
    setEditDraft({ time: it.time, title: itemTitle(it) });
  };
  const saveEdit = (id: string) => {
    if (!editDraft.title.trim()) return;
    const next = tasks
      .map((x) => x.id === id ? { ...x, time: editDraft.time, title: editDraft.title.trim(), titleFr: undefined } : x)
      .sort((a, b) => a.time.localeCompare(b.time));
    persist(next);
    setEditingId(null);
  };
  const removeItem = (id: string) => persist(tasks.filter((x) => x.id !== id));
  const toggleDone = (id: string) => persist(tasks.map((x) => x.id === id ? { ...x, done: !x.done } : x));

  return (
    <AppShell title={`${greeting}, ${caregiverName}.`} subtitle={tr(`How is ${childName} doing right now?`, `Comment va ${childName} en ce moment ?`)}>
      <PersonalLine pool="today" className="mb-6" />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mood check-in */}
        <section className="lg:col-span-2 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold">
              {tr(`How are you feeling right now, ${names.child}?`, `Comment te sens-tu maintenant, ${names.child} ?`)}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("moodHint")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {moods.map((m) => {
              const active = mood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={`group flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-glow"
                      : `border-transparent ${m.tint} hover:scale-[1.02]`
                  }`}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </button>
              );
            })}
          </div>
          {mood === "overwhelm" && (
            <div className="mt-5 rounded-2xl bg-tertiary/10 p-4 text-sm text-tertiary animate-fade-up">
              {t("overwhelmTip")}
            </div>
          )}
          <div className="mt-5 rounded-2xl border border-secondary/30 bg-gradient-warm p-4">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Wand2 className="h-3 w-3" /> {tr("AI reflection", "Réflexion IA")}
            </div>
            {reflBusy ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {tr("A gentle thought is coming…", "Une douce pensée arrive…")}
              </div>
            ) : (
              <p className="text-sm leading-relaxed">
                {reflection ?? tr("Pick a mood for a personalized thought.", "Choisis une humeur pour une pensée personnalisée.")}
              </p>
            )}
          </div>
        </section>

        {/* Today's small win */}
        <section className="rounded-3xl bg-gradient-warm p-6 shadow-soft">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {tr(`${names.child}'s small win`, `La petite victoire de ${names.child}`)}
          </div>
          <p className="mt-3 font-display text-xl font-extrabold leading-tight">
            {tr("\u201CAsked for water with a card.\u201D", "« A demandé de l'eau avec une carte. »")}
          </p>
          <p className="mt-3 text-sm text-foreground/80">
            {tr(`Worth celebrating, ${names.caregiver}. Tap to add another.`, `À célébrer, ${names.caregiver}. Touche pour en ajouter une.`)}
          </p>
          <Link to="/wins" className="mt-5 inline-block rounded-full bg-card px-4 py-2 text-xs font-semibold shadow-soft hover:opacity-90">
            {t("addWin")}
          </Link>
        </section>

        {/* Routine timeline (editable) */}
        <section className="lg:col-span-2 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">{t("todayRhythm")}</h2>
              <p className="text-sm text-muted-foreground">{rhythm}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-2 w-40 overflow-hidden rounded-full bg-muted md:block">
                <div className="h-full bg-gradient-primary transition-all" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }} />
              </div>
              <button
                onClick={() => setAdding((v) => !v)}
                className="flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
              >
                <Plus className="h-3.5 w-3.5" /> {tr("Add step", "Ajouter")}
              </button>
            </div>
          </div>

          {adding && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-muted/40 p-3">
              <input
                type="time"
                value={draft.time}
                onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              />
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder={tr("Step name (e.g. Snack time)", "Étape (ex. Goûter)")}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
              />
              <button onClick={addItem} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                <Check className="h-3.5 w-3.5" /> {t("save")}
              </button>
              <button onClick={() => { setAdding(false); setDraft({ time: "12:00", title: "" }); }} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
                <X className="h-3.5 w-3.5" /> {t("cancel")}
              </button>
            </div>
          )}

          <ol className="mt-6 space-y-2">
            {tasks.map((it) => {
              const isEdit = editingId === it.id;
              return (
                <li key={it.id}>
                  {isEdit ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border px-3 py-2">
                      <input
                        type="time"
                        value={editDraft.time}
                        onChange={(e) => setEditDraft((d) => ({ ...d, time: e.target.value }))}
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                      />
                      <input
                        value={editDraft.title}
                        onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
                      />
                      <button onClick={() => saveEdit(it.id)} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                        <Check className="h-3.5 w-3.5" /> {t("save")}
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
                        <X className="h-3.5 w-3.5" /> {t("cancel")}
                      </button>
                    </div>
                  ) : (
                    <div className={`group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:border-border hover:bg-muted/40 ${it.done ? "opacity-60" : ""}`}>
                      <button onClick={() => toggleDone(it.id)} className="shrink-0">
                        {it.done
                          ? <CheckCircle2 className="h-5 w-5 text-primary" />
                          : <Circle className="h-5 w-5 text-muted-foreground" />}
                      </button>
                      <span className="w-14 text-xs text-muted-foreground">{it.time}</span>
                      <span className={`flex-1 text-sm font-medium ${it.done ? "line-through" : ""}`}>{itemTitle(it)}</span>
                      <button onClick={() => startEdit(it)} aria-label={tr("Edit", "Modifier")} className="rounded-full p-1.5 text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground group-hover:opacity-100">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeItem(it.id)} aria-label={tr("Delete", "Supprimer")} className="rounded-full p-1.5 text-muted-foreground opacity-0 hover:bg-muted hover:text-tertiary group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
            {tasks.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border bg-card/60 p-4 text-center text-sm text-muted-foreground">
                {tr("No steps yet. Add the first one.", "Aucune étape. Ajoutez la première.")}
              </li>
            )}
          </ol>
        </section>

        {/* Suggestions */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">{t("suggested")}</h2>
          <p className="text-sm text-muted-foreground">{t("suggestedHint")}</p>
          <div className="mt-5 space-y-3">
            {[
              { to: "/breathing", icon: Wind, title: tr("Box breathing (3 min)", "Respiration carrée (3 min)"), text: tr("A gentle inhale-hold-exhale pattern.", "Inspire, retiens, expire en douceur."), tone: "primary" as const },
              { to: "/communication", icon: MessageCircle, title: tr("Try a feelings card", "Essayer une carte émotion"), text: tr("Use the emotion wheel together.", "Utilisez la roue des émotions ensemble."), tone: "tertiary" as const },
              { to: "/article/little-lamp", icon: Headphones, title: tr("Bedtime story audio", "Histoire du soir audio"), text: tr("Soft narration under 6 minutes.", "Narration douce de moins de 6 minutes."), tone: "secondary" as const },
              { to: "/caregiver", icon: Coffee, title: tr("Caregiver pause", "Pause aidant"), text: tr("Two minutes for you. You earned it.", "Deux minutes pour vous. Vous le méritez."), tone: "primary" as const },
            ].map((s) => (
              <Link key={s.title} to={s.to} className="flex items-start gap-3 rounded-2xl bg-muted/40 p-3 transition hover:bg-muted">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone(s.tone)}`}>
                  <s.icon className="h-4 w-4" />
                </span>
                <div className="leading-snug">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.text}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Calming toolkit */}
        <section className="lg:col-span-3 rounded-3xl bg-gradient-primary p-8 text-primary-foreground shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary-foreground/80">
                <HeartHandshake className="h-3.5 w-3.5" /> {t("caregiverPause")}
              </div>
              <h2 className="mt-2 font-display text-2xl font-extrabold">
                {tr(`How are YOU feeling today, ${names.caregiver}?`, `Comment te sens-tu, TOI, aujourd'hui ${names.caregiver} ?`)}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-primary-foreground/85">
                {tr(`A 90-second breathing exercise, just for you. ${names.child} will be okay - you matter too.`, `Un exercice de respiration de 90 secondes, rien que pour toi. ${names.child} ira bien - tu comptes aussi.`)}
              </p>
            </div>
            <Link to="/breathing" className="rounded-full bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-soft hover:opacity-95">
              {t("startBreathing")}
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
