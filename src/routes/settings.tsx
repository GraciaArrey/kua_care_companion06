import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Languages, SunMoon, LogOut, Type, Activity, Eye, Volume2, Play,
  ShieldCheck, Download, Trash2, KeyRound, Bell, Palette, ChevronRight, Check,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePrefs, useT, type TextScale } from "@/lib/prefs";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTTS } from "@/lib/tts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings - KUA" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const t = useT();
  const {
    lang, setLang, calm, setCalm, theme, setTheme,
    textScale, setTextScale, reduceMotion, setReduceMotion,
    highContrast, setHighContrast, voiceRate, setVoiceRate,
    dyslexic, setDyslexic, lineSpacing, setLineSpacing,
    readingMode, setReadingMode, tone, setTone,
  } = usePrefs();
  const { user, signOut, loading } = useAuth();
  const nav = useNavigate();
  const { speak, stop, supported: ttsOk } = useTTS(lang, voiceRate);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/signin", search: { redirect: "/settings" } }); }, [loading, user]);
  useEffect(() => { if (user?.email) setResetEmail(user.email); }, [user]);
  if (loading || !user) return null;

  const sections = [
    { id: "appearance",    label: lang === "fr" ? "Apparence"     : "Appearance",       icon: <Palette className="h-4 w-4" /> },
    { id: "accessibility", label: lang === "fr" ? "Accessibilité" : "Accessibility",    icon: <Eye className="h-4 w-4" /> },
    { id: "voice",         label: lang === "fr" ? "Voix"          : "Voice & reading",  icon: <Volume2 className="h-4 w-4" /> },
    { id: "language",      label: lang === "fr" ? "Langue"        : "Language",         icon: <Languages className="h-4 w-4" /> },
    { id: "notifications", label: lang === "fr" ? "Rappels"       : "Reminders",        icon: <Bell className="h-4 w-4" /> },
    { id: "security",      label: lang === "fr" ? "Sécurité"      : "Security",         icon: <ShieldCheck className="h-4 w-4" /> },
    { id: "data",          label: lang === "fr" ? "Mes données"   : "My data",          icon: <Download className="h-4 w-4" /> },
    { id: "account",       label: lang === "fr" ? "Compte"        : "Account",          icon: <LogOut className="h-4 w-4" /> },
  ];

  const scrollTo = (id: string) => sectionRefs.current[id]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

  const sendReset = async () => {
    if (!resetEmail) return;
    setResetBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/signin`,
    });
    setResetBusy(false);
    if (error) return toast.error(error.message);
    toast.success(lang === "fr" ? "Lien de réinitialisation envoyé 💌" : "Reset link sent 💌");
  };

  const exportData = async () => {
    setExportBusy(true);
    try {
      const [{ data: prof }, { data: moods }, { data: rems }, { data: kids }, { data: tests }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("mood_entries").select("*").order("entry_date", { ascending: false }),
        supabase.from("reminders").select("*"),
        supabase.from("children").select("*"),
        supabase.from("test_results").select("*").order("created_at", { ascending: false }),
      ]);
      const wins = JSON.parse(localStorage.getItem("kua_wins") || "[]");
      const vault = [
        ...JSON.parse(localStorage.getItem("kua_vault_notes") || "[]"),
        ...JSON.parse(localStorage.getItem("kua_vault_v1") || "[]"),
      ];

      const esc = (s: any) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
      const moodList = (moods ?? []).slice(0, 90).map((m: any) => `<tr><td>${esc(m.entry_date)}</td><td>${esc(m.mood)}</td><td>${esc(m.note ?? "")}</td></tr>`).join("");
      const remList = (rems ?? []).map((r: any) => `<tr><td>${esc(r.title)}</td><td>${esc(r.time_of_day ?? "")}</td><td>${r.enabled ? "✓" : "·"}</td></tr>`).join("");
      const childList = (kids ?? []).map((c: any) => `<tr><td>${esc(c.preferred_name || c.name)}</td><td>${esc(c.age ?? "")}</td><td>${esc(c.notes ?? "")}</td></tr>`).join("");
      const testList = (tests ?? []).map((t: any) => `<tr><td>${esc(new Date(t.created_at).toLocaleDateString())}</td><td>${esc(t.test_slug)}</td><td>${esc(t.score ?? "")}</td><td>${esc(t.band ?? "")}</td></tr>`).join("");
      const winList = (wins as any[]).map((w) => `<li>${esc(w.text || w.title || JSON.stringify(w))}</li>`).join("");
      const vaultList = (vault as any[]).map((v) => `<li><strong>${esc(v.title || "Note")}</strong><br/>${esc(v.body || v.text || "")}</li>`).join("");

      const html = `<!doctype html><html><head><meta charset="utf-8"><title>KUA Export ${new Date().toISOString().slice(0,10)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; line-height: 1.5; }
  h1 { font-size: 28px; margin: 0 0 4px; color: #6b3fa0; }
  h2 { font-size: 16px; margin: 28px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #e9d8fd; color: #6b3fa0; }
  .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #faf5ff; font-weight: 600; }
  ul { padding-left: 18px; font-size: 12px; }
  li { margin-bottom: 6px; }
  .empty { color: #999; font-style: italic; font-size: 12px; }
</style></head><body>
  <h1>KUA - Personal Export</h1>
  <p class="meta">Generated ${new Date().toLocaleString()} for ${esc(prof?.preferred_name || prof?.caregiver_name || user.email)}</p>

  <h2>Profile</h2>
  <table>
    <tr><th>Email</th><td>${esc(user.email)}</td></tr>
    <tr><th>Caregiver</th><td>${esc(prof?.caregiver_name ?? "")} (${esc(prof?.caregiver_role ?? "")})</td></tr>
    <tr><th>Child name</th><td>${esc(prof?.child_name ?? "")}</td></tr>
  </table>

  <h2>Children (${(kids ?? []).length})</h2>
  ${childList ? `<table><thead><tr><th>Name</th><th>Age</th><th>Notes</th></tr></thead><tbody>${childList}</tbody></table>` : `<p class="empty">No child profiles.</p>`}

  <h2>Mood entries (${(moods ?? []).length})</h2>
  ${moodList ? `<table><thead><tr><th>Date</th><th>Mood</th><th>Note</th></tr></thead><tbody>${moodList}</tbody></table>` : `<p class="empty">No moods logged yet.</p>`}

  <h2>Reminders (${(rems ?? []).length})</h2>
  ${remList ? `<table><thead><tr><th>Title</th><th>Time</th><th>On</th></tr></thead><tbody>${remList}</tbody></table>` : `<p class="empty">No reminders.</p>`}

  <h2>Test results (${(tests ?? []).length})</h2>
  ${testList ? `<table><thead><tr><th>Date</th><th>Test</th><th>Score</th><th>Band</th></tr></thead><tbody>${testList}</tbody></table>` : `<p class="empty">No test results.</p>`}

  <h2>Wins (${(wins as any[]).length})</h2>
  ${winList ? `<ul>${winList}</ul>` : `<p class="empty">No wins captured.</p>`}

  <h2>Vault notes (${(vault as any[]).length})</h2>
  ${vaultList ? `<ul>${vaultList}</ul>` : `<p class="empty">Vault is empty.</p>`}

  <p class="meta" style="margin-top:32px">KUA - calm digital companion. This document contains only your personal data.</p>
  <script>window.onload = () => { setTimeout(() => window.print(), 300); };</script>
</body></html>`;
      const w = window.open("", "_blank");
      if (!w) throw new Error(lang === "fr" ? "Veuillez autoriser les pop-ups" : "Please allow pop-ups");
      w.document.write(html);
      w.document.close();
      toast.success(lang === "fr" ? "PDF prêt à imprimer" : "PDF ready - use 'Save as PDF'");
    } catch (e: any) { toast.error(String(e?.message ?? e)); }
    finally { setExportBusy(false); }
  };

  const clearLocal = () => {
    if (!confirm(lang === "fr" ? "Effacer les données locales (favoris, journal, victoires) ?" : "Clear local data (favorites, journal, wins)?")) return;
    ["kua_wins", "kua_vault_notes", "kua_vault_v1", "kua_prefs_v2"].forEach((k) => localStorage.removeItem(k));
    toast.success(lang === "fr" ? "Données locales effacées" : "Local data cleared");
    setTimeout(() => location.reload(), 600);
  };

  const sample = lang === "fr"
    ? "Voici un aperçu de ma voix douce. Respirons ensemble."
    : "Here's a preview of my gentle voice. Let's breathe together.";

  return (
    <AppShell title={t("settings")} subtitle={lang === "fr" ? "Réglez KUA pour qu'il vous ressemble." : "Tune KUA to feel right today."}>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sticky in-page nav */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 rounded-3xl border border-border/60 bg-card p-3 shadow-soft">
            {sections.map((s) => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className="group flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground">
                {s.icon}<span className="flex-1">{s.label}</span>
                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          {/* Quick toggles hero */}
          <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary-soft via-card to-card p-6 shadow-soft">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-primary opacity-20 blur-3xl" aria-hidden />
            <h2 className="font-display text-xl font-bold">{lang === "fr" ? "Réglages rapides" : "Quick tune"}</h2>
            <p className="text-sm text-muted-foreground">{lang === "fr" ? "Tout est privé et ne quitte pas votre compte." : "Everything is private and stays with your account."}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Toggle on={calm} onClick={() => setCalm(!calm)} icon={<Sparkles className="h-4 w-4" />} label={t("calmMode")} />
              <Toggle on={reduceMotion} onClick={() => setReduceMotion(!reduceMotion)} icon={<Activity className="h-4 w-4" />} label={lang === "fr" ? "Moins d'animations" : "Less motion"} />
              <Toggle on={highContrast} onClick={() => setHighContrast(!highContrast)} icon={<Eye className="h-4 w-4" />} label={lang === "fr" ? "Contraste élevé" : "High contrast"} />
              <Toggle on={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} icon={<SunMoon className="h-4 w-4" />} label={theme === "dark" ? t("dark") : t("light")} />
            </div>
          </section>

          {/* Appearance */}
          <Section refCb={(el) => (sectionRefs.current["appearance"] = el)} icon={<Palette className="h-5 w-5 text-primary" />} title={lang === "fr" ? "Apparence" : "Appearance"}>
            <Row label={t("theme")}>
              <div className="flex items-center gap-2">
                {(["light","dark"] as const).map((th) => (
                  <Pill key={th} active={theme===th} onClick={() => setTheme(th)}>{th === "light" ? t("light") : t("dark")}</Pill>
                ))}
                <ThemeToggle className="ml-2" />
              </div>
            </Row>
            <Row label={t("calmMode")} hint={t("calmHint")}>
              <Pill active={calm} onClick={() => setCalm(!calm)}>{calm ? t("turnOff") : t("turnOn")}</Pill>
            </Row>
          </Section>

          {/* Accessibility */}
          <Section refCb={(el) => (sectionRefs.current["accessibility"] = el)} icon={<Eye className="h-5 w-5 text-primary" />} title={lang === "fr" ? "Accessibilité" : "Accessibility"}>
            <Row label={lang === "fr" ? "Taille du texte" : "Text size"} hint={lang === "fr" ? "S'applique partout dans KUA." : "Applies everywhere in KUA."}>
              <div className="flex items-center gap-1">
                {(["sm","md","lg","xl"] as TextScale[]).map((s) => (
                  <Pill key={s} active={textScale===s} onClick={() => setTextScale(s)}>
                    <Type className="h-3 w-3" style={{ transform: `scale(${0.8 + (["sm","md","lg","xl"].indexOf(s)*0.15)})` }} />
                    <span className="ml-1 uppercase">{s}</span>
                  </Pill>
                ))}
              </div>
            </Row>
            <Row label={lang === "fr" ? "Réduire les animations" : "Reduce motion"} hint={lang === "fr" ? "Coupe les transitions et flottements." : "Stops transitions and floaty motion."}>
              <Switch on={reduceMotion} onChange={setReduceMotion} />
            </Row>
            <Row label={lang === "fr" ? "Contraste élevé" : "High contrast"} hint={lang === "fr" ? "Bordures et focus plus marqués." : "Stronger borders and focus rings."}>
              <Switch on={highContrast} onChange={setHighContrast} />
            </Row>
            <Row label={lang === "fr" ? "Police lisible (dyslexie)" : "Dyslexia-friendly font"} hint={lang === "fr" ? "Utilise Lexend, plus aérée." : "Switches to Lexend with looser spacing."}>
              <Switch on={dyslexic} onChange={setDyslexic} />
            </Row>
            <Row label={lang === "fr" ? "Espacement des lignes" : "Line spacing"} hint={lang === "fr" ? "Plus d'air entre les lignes." : "Add breathing room between lines."}>
              <div className="flex items-center gap-1">
                {(["cozy","regular","airy"] as const).map((s) => (
                  <Pill key={s} active={lineSpacing===s} onClick={() => setLineSpacing(s)}>{s}</Pill>
                ))}
              </div>
            </Row>
            <Row label={lang === "fr" ? "Mode lecture" : "Reading mode"} hint={lang === "fr" ? "Colonne étroite, fond crème." : "Narrow column, cream surface for long-form."}>
              <Switch on={readingMode} onChange={setReadingMode} />
            </Row>
            <Row label={lang === "fr" ? "Ton des messages" : "Message tone"} hint={lang === "fr" ? "Comment KUA te parle." : "How KUA talks to you."}>
              <div className="flex items-center gap-1">
                {(["warm","plain","playful"] as const).map((s) => (
                  <Pill key={s} active={tone===s} onClick={() => setTone(s)}>{s}</Pill>
                ))}
              </div>
            </Row>
          </Section>

          {/* Voice */}
          <Section refCb={(el) => (sectionRefs.current["voice"] = el)} icon={<Volume2 className="h-5 w-5 text-primary" />} title={lang === "fr" ? "Voix & lecture" : "Voice & reading"}>
            <Row label={lang === "fr" ? "Vitesse de la voix" : "Voice speed"} hint={`${voiceRate.toFixed(2)}×`}>
              <input type="range" min={0.6} max={1.4} step={0.02} value={voiceRate}
                onChange={(e) => setVoiceRate(Number(e.target.value))} className="w-48 accent-[var(--color-primary)]" />
            </Row>
            <Row label={lang === "fr" ? "Tester la voix" : "Test the voice"} hint={lang === "fr" ? "Écoute un court échantillon." : "Listen to a short sample."}>
              <div className="flex gap-2">
                <button disabled={!ttsOk} onClick={() => speak(sample)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
                  <Play className="h-3.5 w-3.5" /> {lang === "fr" ? "Écouter" : "Listen"}
                </button>
                <button onClick={stop} className="rounded-full bg-muted px-4 py-2 text-sm font-semibold">{lang === "fr" ? "Stop" : "Stop"}</button>
              </div>
            </Row>
          </Section>

          {/* Language */}
          <Section refCb={(el) => (sectionRefs.current["language"] = el)} icon={<Languages className="h-5 w-5 text-primary" />} title={t("language")}>
            <Row label={lang === "fr" ? "Langue de l'interface" : "Interface language"}>
              <div className="flex gap-2">
                {(["en","fr"] as const).map((l) => (
                  <Pill key={l} active={lang===l} onClick={() => setLang(l)}>
                    <span className="mr-1">{l === "en" ? "🇬🇧" : "🇫🇷"}</span>{l === "en" ? "English" : "Français"}
                  </Pill>
                ))}
              </div>
            </Row>
          </Section>

          {/* Notifications / reminders */}
          <Section refCb={(el) => (sectionRefs.current["notifications"] = el)} icon={<Bell className="h-5 w-5 text-primary" />} title={lang === "fr" ? "Rappels" : "Reminders"}>
            <p className="text-sm text-muted-foreground">{lang === "fr" ? "Gérez vos rituels doux depuis votre profil." : "Manage your gentle rituals from your profile."}</p>
            <Link to="/profile" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">
              {lang === "fr" ? "Ouvrir mes rappels" : "Open my reminders"} <ChevronRight className="h-4 w-4" />
            </Link>
          </Section>

          {/* Security */}
          <Section refCb={(el) => (sectionRefs.current["security"] = el)} icon={<ShieldCheck className="h-5 w-5 text-primary" />} title={lang === "fr" ? "Sécurité" : "Security"}>
            <Row label={lang === "fr" ? "Authentification à deux facteurs" : "Two-factor authentication"} hint={lang === "fr" ? "Configurez la 2FA depuis votre profil." : "Configure 2FA on your profile."}>
              <Link to="/profile" className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" /> {lang === "fr" ? "Gérer" : "Manage"}
              </Link>
            </Row>
            <Row label={lang === "fr" ? "Réinitialiser le mot de passe" : "Reset password"} hint={lang === "fr" ? "Recevez un lien sécurisé par email." : "Receive a secure link by email."}>
              <div className="flex flex-wrap items-center gap-2">
                <input value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary" />
                <button onClick={sendReset} disabled={resetBusy}
                  className="inline-flex items-center gap-1 rounded-full bg-card px-4 py-2 text-sm font-semibold ring-1 ring-border hover:bg-accent disabled:opacity-50">
                  <KeyRound className="h-4 w-4" /> {lang === "fr" ? "Envoyer" : "Send link"}
                </button>
              </div>
            </Row>
          </Section>

          {/* Data */}
          <Section refCb={(el) => (sectionRefs.current["data"] = el)} icon={<Download className="h-5 w-5 text-primary" />} title={lang === "fr" ? "Mes données" : "My data"}>
            <Row label={lang === "fr" ? "Exporter (PDF)" : "Export (PDF)"} hint={lang === "fr" ? "Profil, enfants, humeurs, rappels, tests, victoires, coffre - prêt à imprimer." : "Profile, children, moods, reminders, tests, wins, vault - print or save as PDF."}>
              <button onClick={exportData} disabled={exportBusy}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
                <Download className="h-4 w-4" /> {lang === "fr" ? "Télécharger PDF" : "Download PDF"}
              </button>
            </Row>
            <Row label={lang === "fr" ? "Effacer les données locales" : "Clear local data"} hint={lang === "fr" ? "Favoris, brouillons, préférences sur cet appareil." : "Favorites, drafts, preferences on this device."}>
              <button onClick={clearLocal} className="inline-flex items-center gap-1.5 rounded-full bg-tertiary/15 px-4 py-2 text-sm font-semibold text-tertiary hover:bg-tertiary/25">
                <Trash2 className="h-4 w-4" /> {lang === "fr" ? "Effacer" : "Clear"}
              </button>
            </Row>
            <Row label={lang === "fr" ? "Politique de confidentialité" : "Privacy policy"} hint={lang === "fr" ? "Comment vos données sont protégées." : "How your data is protected."}>
              <Link to="/privacy" className="inline-flex items-center gap-1 rounded-full bg-card px-4 py-2 text-sm font-semibold ring-1 ring-border hover:bg-accent">
                <ShieldCheck className="h-4 w-4" /> {lang === "fr" ? "Lire" : "Read"}
              </Link>
            </Row>
            <Row label={lang === "fr" ? "Conditions d'utilisation" : "Terms & conditions"} hint={lang === "fr" ? "L'accord entre vous et KUA." : "The agreement between you and KUA."}>
              <Link to="/terms" className="inline-flex items-center gap-1 rounded-full bg-card px-4 py-2 text-sm font-semibold ring-1 ring-border hover:bg-accent">
                <ChevronRight className="h-4 w-4" /> {lang === "fr" ? "Lire" : "Read"}
              </Link>
            </Row>
          </Section>

          {/* Account */}
          <Section refCb={(el) => (sectionRefs.current["account"] = el)} icon={<LogOut className="h-5 w-5 text-tertiary" />} title={lang === "fr" ? "Compte" : "Account"}>
            <Row label="Email" hint={user.email ?? ""}>
              <Link to="/profile" className="inline-flex items-center gap-1 rounded-full bg-card px-4 py-2 text-sm font-semibold ring-1 ring-border hover:bg-accent">
                {lang === "fr" ? "Voir le profil" : "View profile"} <ChevronRight className="h-4 w-4" />
              </Link>
            </Row>
            <Row label={lang === "fr" ? "Se déconnecter" : "Sign out"} hint={lang === "fr" ? "À bientôt" : "See you soon"}>
              <button onClick={async () => { await signOut(); nav({ to: "/" }); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-tertiary/15 px-4 py-2 text-sm font-semibold text-tertiary hover:bg-tertiary/25">
                <LogOut className="h-4 w-4" /> {t("signOut")}
              </button>
            </Row>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ refCb, icon, title, children }: {
  refCb: (el: HTMLElement | null) => void;
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <section ref={refCb} className="scroll-mt-24 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2">{icon}<h2 className="font-display text-lg font-bold">{title}</h2></div>
      <div className="mt-4 divide-y divide-border/50">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-foreground hover:bg-accent"}`}>
      {children}
    </button>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (b: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} aria-pressed={on}
      className={`relative h-7 w-12 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow transition ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

function Toggle({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} aria-pressed={on}
      className={`flex items-center gap-2 rounded-2xl border p-3 text-left text-sm font-semibold transition ${on ? "border-primary bg-primary-soft text-primary shadow-glow" : "border-border bg-background hover:bg-accent"}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-full ${on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
        {on ? <Check className="h-4 w-4" /> : icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}
