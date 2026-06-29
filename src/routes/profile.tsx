import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck, Loader2, Trash2, Camera, Sparkles, Flame, Pencil, Plus, Bell, BellOff,
  CheckCircle2, BookHeart, Trophy, HeartHandshake, Download, Wand2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AvatarCropper } from "@/components/AvatarCropper";
import { useAuth } from "@/lib/auth";
import { usePrefs, useT } from "@/lib/prefs";
import { useNames } from "@/lib/personalize";
import { useChildren } from "@/lib/children";
import { useReminders } from "@/lib/reminders";
import { supabase } from "@/integrations/supabase/client";
import { aiInsights, type InsightsResp } from "@/lib/ai-client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile - KUA" }] }),
  component: ProfilePage,
});

type MoodEntry = { id: string; entry_date: string; mood: string; note: string | null };
type Reminder = { id: string; title: string; time_of_day: string | null; enabled: boolean };

const MOODS: { key: string; label: string; fr: string; emoji: string; color: string }[] = [
  { key: "calm",      label: "Calm",      fr: "Calme",     emoji: "🌿", color: "#9bd4b6" },
  { key: "joyful",    label: "Joyful",    fr: "Joyeux",    emoji: "🌞", color: "#f5c97a" },
  { key: "tender",    label: "Tender",    fr: "Tendre",    emoji: "💗", color: "#f4a8c4" },
  { key: "tired",     label: "Tired",     fr: "Fatigué",   emoji: "🌙", color: "#a9b4d6" },
  { key: "anxious",   label: "Anxious",   fr: "Anxieux",   emoji: "🌧️", color: "#b8c0cc" },
  { key: "frustrated",label: "Frustrated",fr: "Frustré",   emoji: "🌋", color: "#e89a8a" },
];

function moodMeta(key: string) {
  return MOODS.find((m) => m.key === key) ?? { key, label: key, fr: key, emoji: "·", color: "var(--muted)" };
}

function ymd(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function calcStreak(dates: Set<string>) {
  let n = 0;
  const cur = new Date();
  // Allow streak to start today OR yesterday (forgiving)
  if (!dates.has(ymd(cur))) cur.setDate(cur.getDate() - 1);
  while (dates.has(ymd(cur))) { n++; cur.setDate(cur.getDate() - 1); }
  return n;
}


function ProfilePage() {
  const t = useT();
  const { lang } = usePrefs();
  const { permission: notifPerm, requestPermission: requestNotif, testNotify } = useReminders();
  const { user, profile, updateProfile, loading } = useAuth();
  const names = useNames();
  const { activeChild, updateChild } = useChildren();
  const nav = useNavigate();

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");

  // Avatar
  const [cropOpen, setCropOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  // AI Insights
  const [insights, setInsights] = useState<InsightsResp | null>(null);
  const [insightsBusy, setInsightsBusy] = useState(false);

  // 2FA
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [factor, setFactor] = useState<{ id: string; status: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Activity
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [winsCount, setWinsCount] = useState(0);
  const [vaultCount, setVaultCount] = useState(0);

  // Reminder form
  const [rTitle, setRTitle] = useState("");
  const [rTime, setRTime] = useState("");

  useEffect(() => { if (!loading && !user) nav({ to: "/signin", search: { redirect: "/profile" } }); }, [loading, user]);
  useEffect(() => { if (profile) setName(profile.preferred_name ?? ""); }, [profile]);

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const f = data?.totp?.[0];
      if (f) setFactor({ id: f.id, status: f.status });
    });
  }, []);

  // Load moods (last 90 days, scoped to active child) + reminders
  useEffect(() => {
    if (!user) return;
    const since = new Date(); since.setDate(since.getDate() - 90);
    let q = supabase.from("mood_entries").select("*").gte("entry_date", ymd(since)).order("entry_date", { ascending: false });
    q = activeChild?.id ? q.eq("child_id", activeChild.id) : q.is("child_id", null);
    q.then(({ data }) => setMoods((data as MoodEntry[]) ?? []));
    supabase.from("reminders").select("*").order("created_at", { ascending: true })
      .then(({ data }) => setReminders((data as Reminder[]) ?? []));
  }, [user, activeChild?.id]);

  // localStorage activity
  useEffect(() => {
    try { setWinsCount((JSON.parse(localStorage.getItem("kua_wins") || "[]") as unknown[]).length); } catch {}
    try {
      const a = (JSON.parse(localStorage.getItem("kua_vault_notes") || "[]") as unknown[]).length;
      const b = (JSON.parse(localStorage.getItem("kua_vault_v1") || "[]") as unknown[]).length;
      setVaultCount(a + b);
    } catch {}
  }, []);

  const moodSet = useMemo(() => new Set(moods.map((m) => m.entry_date)), [moods]);
  const streak = useMemo(() => calcStreak(moodSet), [moodSet]);
  const today = ymd(new Date());
  const todayMood = moods.find((m) => m.entry_date === today);

  // Build month calendar
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthDays: (MoodEntry | null)[] = [];
  for (let d = 1; d <= monthEnd.getDate(); d++) {
    const key = ymd(new Date(now.getFullYear(), now.getMonth(), d));
    monthDays.push(moods.find((m) => m.entry_date === key) ?? null);
  }
  const leadBlanks = (monthStart.getDay() + 6) % 7; // Monday-first

  const monthName = now.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { month: "long", year: "numeric" });
  const greeting = names.child;

  const saveName = async () => {
    setBusy(true);
    await updateProfile({ preferred_name: name.trim() || null });
    setBusy(false); setEditingName(false);
    toast.success(t("settingsSaved"));
  };

  const saveAvatar = async (dataUrl: string) => {
    if (!user) return;
    setAvatarBusy(true);
    try {
      if (activeChild?.id) {
        await updateChild(activeChild.id, { avatar_url: dataUrl });
      } else {
        await updateProfile({ avatar_url: dataUrl });
      }
      toast.success(lang === "fr" ? "Photo mise à jour" : "Photo updated");
    } catch {
      toast.error(lang === "fr" ? "Échec du téléchargement" : "Upload failed");
    } finally { setAvatarBusy(false); }
  };

  const runInsights = async () => {
    if (!moods.length) return toast.error(lang === "fr" ? "Pas encore d'humeurs" : "No moods yet");
    setInsightsBusy(true);
    try {
      const entries = moods.slice(0, 30).map((m) => `${m.entry_date}:${m.mood}`);
      const r = await aiInsights(entries, lang);
      setInsights(r);
    } catch (e: any) {
      toast.error(e?.message === "credits-exhausted"
        ? (lang === "fr" ? "Crédits IA épuisés" : "AI credits exhausted")
        : (lang === "fr" ? "Échec IA" : "AI failed"));
    } finally { setInsightsBusy(false); }
  };

  const exportProfile = async () => {
    if (!user) return;
    const payload = {
      exported_at: new Date().toISOString(),
      profile,
      moods,
      reminders,
      wins: JSON.parse(localStorage.getItem("kua_wins") || "[]"),
      vault: [
        ...JSON.parse(localStorage.getItem("kua_vault_notes") || "[]"),
        ...JSON.parse(localStorage.getItem("kua_vault_v1") || "[]"),
      ],
      insights,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kua-profile-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "fr" ? "Profil exporté" : "Profile exported");
  };

  const logMood = async (key: string) => {
    if (!user) return;
    const { data, error } = await supabase.from("mood_entries")
      .upsert({ user_id: user.id, child_id: activeChild?.id ?? null, entry_date: today, mood: key }, { onConflict: "user_id,child_id,entry_date" })
      .select().maybeSingle();
    if (error) return toast.error(error.message);
    setMoods((prev) => {
      const others = prev.filter((m) => m.entry_date !== today);
      return data ? [data as MoodEntry, ...others] : others;
    });
    toast.success(lang === "fr" ? "Humeur notée 💛" : "Mood noted 💛");
  };

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rTitle.trim()) return;
    const { data, error } = await supabase.from("reminders").insert({
      user_id: user.id, title: rTitle.trim(), time_of_day: rTime || null, enabled: true,
    }).select().maybeSingle();
    if (error) return toast.error(error.message);
    if (data) setReminders((p) => [...p, data as Reminder]);
    setRTitle(""); setRTime("");
  };

  const toggleReminder = async (r: Reminder) => {
    const { data } = await supabase.from("reminders").update({ enabled: !r.enabled }).eq("id", r.id).select().maybeSingle();
    if (data) setReminders((p) => p.map((x) => x.id === r.id ? (data as Reminder) : x));
  };

  const deleteReminder = async (id: string) => {
    await supabase.from("reminders").delete().eq("id", id);
    setReminders((p) => p.filter((x) => x.id !== id));
  };

  const startEnroll = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "KUA" });
    if (error || !data) return toast.error(error?.message || "Enroll failed");
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };
  const finishEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolling) return;
    setBusy(true);
    const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
    if (e1 || !ch) { setBusy(false); return toast.error(e1?.message || "challenge failed"); }
    const { error: e2 } = await supabase.auth.mfa.verify({ factorId: enrolling.id, challengeId: ch.id, code });
    setBusy(false);
    if (e2) return toast.error(e2.message);
    toast.success(lang === "fr" ? "2FA activée 🔒" : "Two-factor enabled 🔒");
    setFactor({ id: enrolling.id, status: "verified" });
    setEnrolling(null); setCode("");
  };
  const removeFactor = async () => {
    if (!factor) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) return toast.error(error.message);
    setFactor(null); toast.success(lang === "fr" ? "2FA désactivée" : "Two-factor disabled");
  };

  if (loading || !user) return null;

  // Avatar URL: Supabase storage URL OR data URL
  const avatarUrl = activeChild?.avatar_url ?? profile?.avatar_url ?? null;
  const initials = greeting.slice(0, 2).toUpperCase();

  const monthMoodCount = monthDays.filter(Boolean).length;
  const dominant = (() => {
    const counts: Record<string, number> = {};
    monthDays.forEach((d) => { if (d) counts[d.mood] = (counts[d.mood] ?? 0) + 1; });
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    return top ? moodMeta(top[0]) : null;
  })();

  return (
    <AppShell title={lang === "fr" ? "Profil" : "Profile"} subtitle={`${t("childSpaceFor")} ${names.child}.`}>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary-soft via-card to-card p-6 shadow-soft md:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-primary opacity-20 blur-3xl" aria-hidden />
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-end">
          <div className="relative">
            <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-3xl bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow ring-4 ring-card md:h-36 md:w-36">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <span>{initials}</span>}
            </div>
            <button
              onClick={() => setCropOpen(true)}
              disabled={avatarBusy}
              className="absolute -bottom-2 -right-2 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-card ring-1 ring-border hover:bg-accent disabled:opacity-60"
              aria-label={lang === "fr" ? "Changer la photo" : "Change picture"}
            >
              {avatarBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              {lang === "fr" ? "Photo" : "Photo"}
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            {editingName ? (
              <div className="flex flex-col items-center gap-2 md:flex-row">
                <input
                  value={name} onChange={(e) => setName(e.target.value)} autoFocus
                  className="rounded-2xl border border-border bg-background px-3 py-2 text-lg font-semibold outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <button onClick={saveName} disabled={busy} className="rounded-full bg-gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">{t("save")}</button>
                  <button onClick={() => { setEditingName(false); setName(profile?.preferred_name ?? ""); }} className="rounded-full bg-muted px-4 py-1.5 text-sm font-semibold">{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <h1 className="font-display text-3xl font-bold md:text-4xl">{greeting}</h1>
                <button onClick={() => setEditingName(true)} className="rounded-full p-2 text-muted-foreground hover:bg-accent" aria-label="edit name"><Pencil className="h-4 w-4" /></button>
              </div>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-semibold ring-1 ring-border">
                <Flame className="h-3.5 w-3.5 text-tertiary" /> {streak} {lang === "fr" ? "jours d'affilée" : "day streak"}
              </span>
              {factor?.status === "verified" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" /> 2FA
                </span>
              )}
              {dominant && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-semibold ring-1 ring-border">
                  {dominant.emoji} {lang === "fr" ? "Ce mois-ci :" : "This month:"} {lang === "fr" ? dominant.fr : dominant.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Activity Summary */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={<Flame className="h-5 w-5" />} value={streak} label={lang === "fr" ? "Jours d'affilée" : "Day streak"} />
        <StatCard icon={<Sparkles className="h-5 w-5" />} value={moods.length} label={lang === "fr" ? "Humeurs notées" : "Moods logged"} />
        <Link to="/wins"><StatCard icon={<Trophy className="h-5 w-5" />} value={winsCount} label={lang === "fr" ? "Victoires" : "Wins"} /></Link>
        <Link to="/vault"><StatCard icon={<BookHeart className="h-5 w-5" />} value={vaultCount} label={lang === "fr" ? "Notes du coffre" : "Vault notes"} /></Link>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Today's mood */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">{lang === "fr" ? `Comment se sent ${names.child} aujourd'hui ?` : `How is ${names.child} feeling today?`}</h2>
              <p className="text-sm text-muted-foreground">{lang === "fr" ? "Une touche par jour. Doucement." : "One tap a day. Gently."}</p>
            </div>
            {todayMood && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" /> {moodMeta(todayMood.mood).emoji}
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {MOODS.map((m) => {
              const active = todayMood?.mood === m.key;
              return (
                <button key={m.key} onClick={() => logMood(m.key)}
                  className={`group flex flex-col items-center gap-1 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${active ? "border-primary bg-primary-soft shadow-glow" : "border-border bg-background hover:bg-accent"}`}>
                  <span className="text-2xl" aria-hidden style={{ filter: active ? "none" : undefined }}>{m.emoji}</span>
                  <span className="text-[11px] font-semibold">{lang === "fr" ? m.fr : m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Reminders */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold">{lang === "fr" ? "Rappels doux" : "Gentle reminders"}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{lang === "fr" ? "Petits rituels pour traverser la journée." : "Tiny rituals to carry your day."}</p>
          <div className="mt-3 rounded-2xl border border-border/60 bg-muted/30 p-3 text-xs">
            {notifPerm === "unsupported" ? (
              <p className="text-muted-foreground">{lang === "fr" ? "Les notifications ne sont pas prises en charge par ce navigateur. Les rappels apparaîtront dans l'application." : "Notifications aren't supported in this browser. Reminders will still show inside the app."}</p>
            ) : notifPerm === "granted" ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{lang === "fr" ? "Notifications activées." : "Notifications are on."}</span>
                <button type="button" onClick={testNotify} className="rounded-full border border-border bg-background px-3 py-1 font-semibold">
                  {lang === "fr" ? "Tester" : "Test"}
                </button>
              </div>
            ) : notifPerm === "denied" ? (
              <p className="text-muted-foreground">{lang === "fr" ? "Notifications bloquées. Autorisez-les dans les réglages du navigateur pour recevoir des rappels doux." : "Notifications blocked. Allow them in your browser settings to receive gentle nudges."}</p>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{lang === "fr" ? "Activez les notifications pour des rappels doux." : "Turn on notifications for gentle reminders."}</span>
                <button type="button" onClick={() => requestNotif()} className="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground">
                  {lang === "fr" ? "Activer" : "Enable"}
                </button>
              </div>
            )}
          </div>
          <form onSubmit={addReminder} className="mt-4 flex flex-col gap-2">
            <input value={rTitle} onChange={(e) => setRTitle(e.target.value)} placeholder={lang === "fr" ? "Boire de l'eau" : "Drink water"}
              className="rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <div className="flex gap-2">
              <input type="time" value={rTime} onChange={(e) => setRTime(e.target.value)}
                className="flex-1 rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <button className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </form>
          <ul className="mt-4 space-y-2">
            {reminders.length === 0 && <li className="text-xs text-muted-foreground">{lang === "fr" ? "Aucun rappel pour l'instant." : "No reminders yet."}</li>}
            {reminders.map((r) => (
              <li key={r.id} className={`flex items-center gap-2 rounded-2xl border border-border/60 p-3 ${r.enabled ? "bg-background" : "bg-muted/40 opacity-60"}`}>
                <button onClick={() => toggleReminder(r)} className="text-primary" aria-label="toggle">
                  {r.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{r.title}</p>
                  {r.time_of_day && <p className="text-xs text-muted-foreground">{r.time_of_day.slice(0,5)}</p>}
                </div>
                <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-tertiary" aria-label="delete"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Mood Board */}
      <section className="mt-6 rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-primary-soft/40 p-6 shadow-soft md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">{lang === "fr" ? "Tableau d'humeur" : "Mood board"}</p>
            <h2 className="mt-1 font-display text-2xl font-bold capitalize">{monthName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{monthMoodCount}</span> {lang === "fr" ? "jours notés ce mois" : "days logged this month"}
            </p>
          </div>
          {dominant && (
            <div className="rounded-2xl bg-card px-4 py-2.5 text-right ring-1 ring-border shadow-soft">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{lang === "fr" ? "Humeur dominante" : "Most felt"}</p>
              <p className="font-display text-base font-bold">{dominant.emoji} {lang === "fr" ? dominant.fr : dominant.label}</p>
            </div>
          )}
        </header>

        <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {(lang === "fr" ? ["L","M","M","J","V","S","D"] : ["M","T","W","T","F","S","S"]).map((d, i) => (
            <div key={i} className="pb-1 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: leadBlanks }).map((_, i) => <div key={`b${i}`} className="aspect-square" />)}
          {monthDays.map((entry, i) => {
            const day = i + 1;
            const meta = entry ? moodMeta(entry.mood) : null;
            const isToday = ymd(new Date(now.getFullYear(), now.getMonth(), day)) === today;
            return (
              <div
                key={day}
                title={entry ? `${day}: ${meta!.label}` : `${day}`}
                className={`group relative flex aspect-square flex-col items-center justify-between rounded-2xl p-1.5 transition hover:scale-[1.06] hover:shadow-glow ${
                  isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "ring-1 ring-border/50"
                } ${meta ? "shadow-soft" : ""}`}
                style={{ background: meta ? meta.color : "color-mix(in oklab, var(--muted) 50%, transparent)" }}
              >
                <span className={`self-start text-[10px] font-bold leading-none ${meta ? "text-foreground/70" : "text-muted-foreground"}`}>{day}</span>
                <span className="grid flex-1 place-items-center text-lg sm:text-xl">{meta ? meta.emoji : ""}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{lang === "fr" ? "Légende" : "Legend"}</span>
          {MOODS.map((m) => (
            <span key={m.key} className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold ring-1 ring-border">
              <span className="h-3 w-3 rounded-full ring-1 ring-border/40" style={{ background: m.color }} />
              <span>{m.emoji}</span>
              <span>{lang === "fr" ? m.fr : m.label}</span>
            </span>
          ))}
        </div>
      </section>

      {/* 2FA */}
      <section className="mt-6 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold">{t("twoFactor")}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{lang === "fr" ? "Ajoutez un code à 6 chiffres lors de la connexion." : "Add a 6-digit code from an authenticator app at sign-in."}</p>
        {factor?.status === "verified" ? (
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary-soft p-4">
            <span className="text-sm font-semibold text-accent-foreground">{lang === "fr" ? "2FA activée 🔒" : "2FA is active 🔒"}</span>
            <button onClick={removeFactor} className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-tertiary">
              <Trash2 className="h-3.5 w-3.5" /> {t("disable2fa")}
            </button>
          </div>
        ) : enrolling ? (
          <form onSubmit={finishEnroll} className="mt-5 max-w-sm space-y-4">
            <div className="grid place-items-center rounded-2xl bg-background p-4" dangerouslySetInnerHTML={{ __html: enrolling.qr }} />
            <p className="text-xs text-muted-foreground break-all">Secret: <code>{enrolling.secret}</code></p>
            <p className="text-xs text-muted-foreground">{t("scanQr")}</p>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0,6))}
              inputMode="numeric" placeholder="123456"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center text-xl tracking-[0.3em] font-bold outline-none focus:border-primary" />
            <button disabled={busy || code.length !== 6} className="w-full rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
              {t("verify")}
            </button>
          </form>
        ) : (
          <button onClick={startEnroll} className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            {t("enable2fa")}
          </button>
        )}
      </section>

      {/* AI Monthly Insights */}
      <section className="mt-6 rounded-3xl border border-border/60 bg-gradient-to-br from-secondary/20 via-card to-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-secondary-foreground" />
            <h2 className="font-display text-lg font-bold">{lang === "fr" ? "Aperçu IA du mois" : "AI insights for the month"}</h2>
          </div>
          <button
            onClick={runInsights}
            disabled={insightsBusy || moods.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {insightsBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {insights ? (lang === "fr" ? "Régénérer" : "Regenerate") : (lang === "fr" ? "Générer" : "Generate")}
          </button>
        </div>
        {!insights && !insightsBusy && (
          <p className="mt-3 text-sm text-muted-foreground">
            {lang === "fr"
              ? "Une lecture douce et bienveillante des humeurs récentes de l'enfant, avec des suggestions concrètes."
              : "A gentle, warm read of the child's recent moods, with concrete suggestions."}
          </p>
        )}
        {insights && (
          <div className="mt-5 space-y-5">
            <p className="rounded-2xl bg-card/70 p-4 text-sm leading-relaxed">{insights.summary}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{lang === "fr" ? "Faits marquants" : "Highlights"}</h3>
                <ul className="space-y-2">
                  {insights.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2 text-sm"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary-foreground" />{h}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{lang === "fr" ? "Suggestions douces" : "Gentle suggestions"}</h3>
                <ul className="space-y-2">
                  {insights.suggestions.map((h, i) => (
                    <li key={i} className="flex gap-2 text-sm"><HeartHandshake className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{h}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Export */}
      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div>
          <h2 className="font-display text-lg font-bold">{lang === "fr" ? "Exporter mon profil" : "Export my profile"}</h2>
          <p className="text-sm text-muted-foreground">{lang === "fr" ? "Télécharge un fichier JSON avec toutes tes données KUA." : "Download a JSON file with all your KUA data."}</p>
        </div>
        <button onClick={exportProfile} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
          <Download className="h-4 w-4" /> {lang === "fr" ? "Exporter (JSON)" : "Export (JSON)"}
        </button>
      </section>

      <AvatarCropper open={cropOpen} onClose={() => setCropOpen(false)} onSave={saveAvatar} />
    </AppShell>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="group rounded-3xl border border-border/60 bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span></div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
