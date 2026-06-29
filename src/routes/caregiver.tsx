import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  HeartHandshake, Smile, Frown, Meh, Cloud, Sun,
  Bell, Shield, FileText, Users, NotebookPen, Sparkles, Loader2,
  Plus, Check, Pencil,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { useChildren } from "@/lib/children";
import { PersonalLine, useDelight } from "@/lib/personalize";
import { supabase } from "@/integrations/supabase/client";
import { useT, usePrefs } from "@/lib/prefs";
import { toast } from "sonner";

const ROLE_LABEL: Record<string, string> = {
  mom: "Mom", dad: "Dad", sibling: "Sibling", caregiver: "Caregiver",
};

export const Route = createFileRoute("/caregiver")({
  head: () => ({ meta: [{ title: "Caregiver - KUA" }, { name: "description", content: "Caregiver wellness, child profiles and gentle daily tools." }] }),
  component: CaregiverPage,
});

const moods = [
  { key: "calm", label: "Calm", labelFr: "Calme", icon: Smile, weight: 80 },
  { key: "tired", label: "Exhausted", labelFr: "Épuisé", icon: Cloud, weight: 30 },
  { key: "happy", label: "Hopeful", labelFr: "Plein d'espoir", icon: Sun, weight: 90 },
  { key: "stressed", label: "Stressed", labelFr: "Stressé", icon: Frown, weight: 25 },
  { key: "okay", label: "Just okay", labelFr: "Juste ok", icon: Meh, weight: 55 },
];

const moodWeight = (k: string) => moods.find((m) => m.key === k)?.weight ?? 50;
const moodLabel = (k: string, fr = false) => { const m = moods.find((x) => x.key === k); return m ? (fr ? m.labelFr : m.label) : k; };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(): Date {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

type Reminder = { id: string; title: string; time_of_day: string | null; enabled: boolean };

function CaregiverPage() {
  const t = useT();
  const { lang } = usePrefs();
  const [mood, setMood] = useState<string | null>(null);
  const [savingMood, setSavingMood] = useState(false);
  const { profile, user } = useAuth();
  const { children, activeChild, setActive, addChild, updateChild, removeChild } = useChildren();
  const display = profile?.caregiver_name?.trim() || ROLE_LABEL[profile?.caregiver_role ?? "caregiver"] || "Caregiver";
  const childRef = activeChild?.preferred_name || activeChild?.name || profile?.child_name?.trim() || "your child";
  const { pop } = useDelight();

  const [week, setWeek] = useState<{ value: number | null; mood: string | null }[]>(
    Array(7).fill({ value: null, mood: null })
  );
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [generating, setGenerating] = useState(false);

  const loadWeek = async () => {
    if (!user) return;
    setLoadingWeek(true);
    const start = startOfWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const { data } = await supabase
      .from("mood_entries")
      .select("entry_date, mood")
      .eq("user_id", user.id)
      .is("child_id", null)
      .gte("entry_date", start.toISOString().slice(0, 10))
      .lt("entry_date", end.toISOString().slice(0, 10));
    const arr: { value: number | null; mood: string | null }[] = Array(7).fill(0).map(() => ({ value: null, mood: null }));
    let todayMood: string | null = null;
    const todayStr = new Date().toISOString().slice(0, 10);
    (data ?? []).forEach((row: any) => {
      const d = parseLocalDate(row.entry_date);
      const idx = (d.getDay() + 6) % 7;
      arr[idx] = { value: moodWeight(row.mood), mood: row.mood };
      if (row.entry_date === todayStr) todayMood = row.mood;
    });
    setWeek(arr);
    setMood(todayMood);
    setLoadingWeek(false);
  };

  const loadReminders = async () => {
    if (!user) return;
    const { data } = await supabase.from("reminders").select("*").eq("user_id", user.id).order("created_at");
    setReminders((data as Reminder[]) ?? []);
  };

  useEffect(() => { loadWeek(); loadReminders(); /* eslint-disable-next-line */ }, [user]);

  const pickMood = async (key: string) => {
    setMood(key);
    if (!user) return;
    setSavingMood(true);
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("mood_entries").upsert(
      { user_id: user.id, child_id: null, entry_date: today, mood: key },
      { onConflict: "user_id,child_id,entry_date" },
    );
    setSavingMood(false);
    loadWeek();
  };

  const max = Math.max(10, ...week.map((w) => w.value ?? 0));

  // ---- Printable report ----
  const generateReport = async () => {
    if (!user) return toast.error("Sign in first");
    setGenerating(true);

    const start = new Date();
    start.setDate(start.getDate() - 30);
    const startStr = start.toISOString().slice(0, 10);

    const [{ data: moodRows }, { data: testRows }] = await Promise.all([
      supabase.from("mood_entries").select("entry_date, mood, note").eq("user_id", user.id).gte("entry_date", startStr).order("entry_date", { ascending: false }),
      supabase.from("test_results")
        .select("slug, score_value, score_max, score_band, headline, summary, created_at, child_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const childTests = (testRows ?? []).filter((t: any) => !activeChild || t.child_id === activeChild.id || t.child_id === null);

    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>KUA Progress Report - ${childRef}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color:#1a1a1a; margin:40px; line-height:1.5; }
  h1 { color:#6b46c1; margin:0 0 4px; font-size: 28px; }
  .sub { color:#666; margin-bottom: 32px; }
  h2 { font-size: 18px; margin: 28px 0 8px; border-bottom: 2px solid #eee; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
  th { background: #fafafa; font-weight: 600; }
  .badge { display:inline-block; padding: 2px 10px; border-radius: 999px; background:#f3eaff; color:#6b46c1; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .empty { color:#888; font-style: italic; padding: 8px 0; }
  .meta { display:flex; gap:24px; flex-wrap:wrap; margin-bottom:8px; font-size:13px; color:#444; }
  .meta b { color:#1a1a1a; }
  footer { margin-top: 48px; color:#888; font-size: 11px; text-align:center; }
  @media print { body { margin: 20px; } button { display: none; } }
</style></head><body>
  <button onclick="window.print()" style="float:right; padding:8px 16px; border-radius:8px; border:1px solid #ddd; background:#6b46c1; color:white; cursor:pointer;">Print / Save as PDF</button>
  <h1>KUA Progress Report</h1>
  <div class="sub">A gentle 30-day summary - ${new Date().toLocaleDateString()}</div>
  <div class="meta">
    <div><b>Child:</b> ${escapeHtml(childRef)}</div>
    <div><b>Caregiver:</b> ${escapeHtml(display)}</div>
    <div><b>Window:</b> ${startStr} to ${new Date().toISOString().slice(0,10)}</div>
  </div>

  <h2>Caregiver wellness check-ins</h2>
  ${(moodRows ?? []).length === 0 ? `<div class="empty">No mood entries yet. Tap a mood on the Caregiver page to start your week.</div>` :
    `<table><thead><tr><th>Date</th><th>Mood</th><th>Note</th></tr></thead><tbody>
      ${(moodRows ?? []).map((r: any) => `<tr><td>${r.entry_date}</td><td><span class="badge">${escapeHtml(moodLabel(r.mood))}</span></td><td>${escapeHtml(r.note ?? "")}</td></tr>`).join("")}
    </tbody></table>`}

  <h2>Test results for ${escapeHtml(childRef)}</h2>
  ${childTests.length === 0 ? `<div class="empty">No tests completed yet. Try one in the Tests section.</div>` :
    `<table><thead><tr><th>Date</th><th>Test</th><th>Score</th><th>Band</th><th>Summary</th></tr></thead><tbody>
      ${childTests.map((t: any) => `<tr>
        <td>${new Date(t.created_at).toLocaleDateString()}</td>
        <td>${escapeHtml(t.slug)}</td>
        <td>${t.score_value} / ${t.score_max}</td>
        <td><span class="badge">${escapeHtml(t.score_band)}</span></td>
        <td>${escapeHtml(t.headline ?? t.summary ?? "")}</td>
      </tr>`).join("")}
    </tbody></table>`}

  <footer>Generated by KUA - private to ${escapeHtml(display)}. Not a clinical assessment.</footer>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) { toast.error("Allow pop-ups to view the report"); setGenerating(false); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    setGenerating(false);
    toast.success("Report ready - print or save as PDF");
  };

  // ---- Children management ----
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const beginEdit = (id: string, current: string) => { setEditingChildId(id); setEditName(current); };
  const saveEdit = async () => {
    if (!editingChildId || !editName.trim()) return setEditingChildId(null);
    await updateChild(editingChildId, { preferred_name: editName.trim() });
    setEditingChildId(null);
    toast.success(t("profileUpdated"));
  };
  const onAdd = async () => {
    if (!newName.trim()) return;
    await addChild({ name: newName.trim(), preferred_name: newName.trim() });
    setNewName("");
    setShowAdd(false);
    toast.success(t("profileAdded"));
  };

  return (
    <AppShell title={`${t("forYou")}, ${display}.`} subtitle={`${t("caringIs")} ${childRef} ${t("isSacred")}`}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <PersonalLine pool="caregiver" />
        <button onClick={pop} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold hover:bg-muted/70">
          <Sparkles className="h-3 w-3" /> {t("aNoteForMe")}
        </button>
      </div>

      <section className="rounded-3xl bg-gradient-primary p-8 text-primary-foreground shadow-glow">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary-foreground/80">
          <HeartHandshake className="h-3.5 w-3.5" /> {t("wellnessCheckIn")}
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold md:text-3xl">{t("howAreYou")}, {display}?</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {moods.map((m) => {
            const active = mood === m.key;
            return (
              <button key={m.key} onClick={() => pickMood(m.key)} disabled={savingMood}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                  active ? "border-card bg-card text-foreground shadow-soft" : "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                }`}>
                <m.icon className="h-4 w-4" /> {m.label}
              </button>
            );
          })}
        </div>
        {mood && (
          <p className="mt-5 max-w-xl text-sm text-primary-foreground/85 animate-fade-up">
            {t("thankYouNoticing")}, {display}. {t("checkinSaved")}
          </p>
        )}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">{t("yourWeek")}</h3>
              <p className="text-sm text-muted-foreground">
                {user ? t("weekFromCheckins") : t("signInForWeek")}
              </p>
            </div>
            {loadingWeek && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="mt-6 flex h-44 items-end gap-3">
            {week.map((w, i) => {
              const h = w.value === null ? 6 : Math.max(8, Math.round((w.value / max) * 100));
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-full w-full items-end overflow-hidden rounded-2xl bg-muted">
                    <div className={`w-full rounded-2xl transition-all ${w.value === null ? "bg-muted-foreground/15" : "bg-gradient-primary"}`}
                      style={{ height: `${h}%` }}
                      title={w.value === null ? (lang === "fr" ? "Aucune entrée" : "No entry") : `${moodLabel(w.mood ?? "")}`} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{DAYS[i]}</span>
                  {w.mood && <span className="text-[10px] font-semibold text-primary">{moodLabel(w.mood)}</span>}
                </div>
              );
            })}
          </div>
          {week.every((w) => w.value === null) && (
            <p className="mt-3 text-xs text-muted-foreground">{lang === "fr" ? "Pas de données cette semaine. Choisis une humeur pour commencer." : "No data yet this week. Pick a mood above to fill the first bar."}</p>
          )}
        </div>

        <div className="rounded-3xl bg-gradient-warm p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold">{lang === "fr" ? "Une note pour aujourd'hui" : "A note for today"}</h3>
          <p className="mt-3 text-sm text-foreground/80">
            {lang === "fr" ? "« Tu fais bien plus que ce qui se voit. La douceur est une force. La lenteur est de l'amour. »" : "\"You are doing more than anyone can see. Soft is strong. Slow is loving.\""}
          </p>
          <p className="mt-4 text-[11px] text-muted-foreground">{lang === "fr" ? "Une réflexion quotidienne." : "A daily reflection."}</p>
        </div>
      </section>

      {/* Children profiles */}
      <section className="mt-10 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold inline-flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {lang === "fr" ? "Profils des enfants" : "Children profiles"}</h3>
            <p className="text-sm text-muted-foreground">{lang === "fr" ? "Change l'enfant actif pour cibler les tests et rapports." : "Switch the active child to scope tests and reports."}</p>
          </div>
          <button onClick={() => setShowAdd((s) => !s)} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft/70">
            <Plus className="h-3 w-3" /> {lang === "fr" ? "Ajouter" : "Add child"}
          </button>
        </div>

        {showAdd && (
          <div className="mt-4 flex gap-2">
            <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={lang === "fr" ? "Prénom préféré" : "Preferred name"}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={onAdd} className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("save")}</button>
          </div>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {children.length === 0 && <p className="text-sm text-muted-foreground">{lang === "fr" ? "Aucun enfant pour l'instant." : "No children yet. Add one above."}</p>}
          {children.map((c) => {
            const isActive = activeChild?.id === c.id;
            const display = c.preferred_name || c.name;
            const editing = editingChildId === c.id;
            return (
              <div key={c.id} className={`rounded-2xl border p-4 ${isActive ? "border-primary bg-primary-soft/30" : "border-border bg-background"}`}>
                {editing ? (
                  <div className="flex gap-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 rounded-lg border border-border bg-card px-2 py-1 text-sm" autoFocus />
                    <button onClick={saveEdit} className="rounded-lg bg-primary px-2 text-xs font-semibold text-primary-foreground"><Check className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="font-display font-bold">{display}</p>
                      <button onClick={() => beginEdit(c.id, display)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {isActive ? (
                        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">{lang === "fr" ? "Actif" : "Active"}</span>
                      ) : (
                        <button onClick={() => setActive(c.id)} className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-semibold hover:border-primary">{lang === "fr" ? "Activer" : "Make active"}</button>
                      )}
                      <button onClick={() => { if (confirm(`${lang === "fr" ? "Retirer" : "Remove"} ${display}?`)) removeChild(c.id); }} className="text-[10px] text-muted-foreground hover:text-destructive">{lang === "fr" ? "Retirer" : "Remove"}</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Care tools */}
      <section className="mt-10">
        <h3 className="mb-4 font-display text-lg font-bold">{lang === "fr" ? "Outils de soin" : "Care tools"}</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <button onClick={generateReport} disabled={generating} className="text-left rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><FileText className="h-5 w-5" /></span>
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">{lang === "fr" ? "30 jours" : "30 days"}</span>
            </div>
            <h4 className="mt-4 font-display text-base font-bold inline-flex items-center gap-2">{lang === "fr" ? "Rapports" : "Reports"} {generating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{lang === "fr" ? `Résumé imprimable pour ${childRef}.` : `Printable progress summary for ${childRef}.`}</p>
          </button>

          <Link to="/settings" className="block rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><Bell className="h-5 w-5" /></span>
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">{reminders.filter((r) => r.enabled).length} {lang === "fr" ? "actifs" : "on"}</span>
            </div>
            <h4 className="mt-4 font-display text-base font-bold">{lang === "fr" ? "Notifications" : "Notifications"}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{lang === "fr" ? "Rappels doux, jamais bruyants." : "Soft reminders, never noisy."}</p>
          </Link>

          <Link to="/settings" className="block rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><Shield className="h-5 w-5" /></span>
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">{lang === "fr" ? "Activé" : "On"}</span>
            </div>
            <h4 className="mt-4 font-display text-base font-bold">{lang === "fr" ? "Accessibilité" : "Accessibility"}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{lang === "fr" ? "Réglages sensoriels et de mouvement." : "Sensory-safe and motion settings."}</p>
          </Link>

          <Link to="/vault" className="block rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><NotebookPen className="h-5 w-5" /></span>
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">{lang === "fr" ? "Ouvrir" : "Open"}</span>
            </div>
            <h4 className="mt-4 font-display text-base font-bold">{lang === "fr" ? "Coffre de notes" : "Notes vault"}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{lang === "fr" ? `Notes privées pour ${childRef}.` : `Private notes for ${childRef}.`}</p>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function escapeHtml(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
