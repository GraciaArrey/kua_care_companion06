import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sun, Moon, BookOpen, Heart, Sparkles, Leaf, HandHeart, Bed,
  Feather, Music, ListChecks, Palette, Quote, Volume2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePrefs } from "@/lib/prefs";
import {
  christianity, islam, sharedValues, type Bi, type Verse, type Story, type Lesson, type Routine,
} from "@/lib/faith-data";
import heroChristianity from "@/assets/faith/hero-christianity.jpg";
import heroIslam from "@/assets/faith/hero-islam.jpg";
import heroShared from "@/assets/faith/hero-shared.jpg";

export const Route = createFileRoute("/faith")({
  head: () => ({
    meta: [
      { title: "Faith & Guidance - KUA" },
      {
        name: "description",
        content:
          "A gentle faith-centered companion for children and caregivers - daily reflections, stories, prayers and calm routines.",
      },
    ],
  }),
  component: FaithPage,
});

type Tab = "christianity" | "islam" | "shared";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function useBi() {
  const { lang } = usePrefs();
  return (b: Bi) => (lang === "fr" ? b.fr : b.en);
}

function FaithPage() {
  const { lang } = usePrefs();
  const [tab, setTab] = useState<Tab>("christianity");

  const T = (en: string, fr: string) => (lang === "fr" ? fr : en);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "christianity", label: T("Christianity", "Christianisme"), icon: Sun },
    { key: "islam", label: T("Islam", "Islam"), icon: Moon },
    { key: "shared", label: T("Shared values", "Valeurs partagées"), icon: HandHeart },
  ];

  return (
    <AppShell
      title={T("Faith & Guidance", "Foi et accompagnement")}
      subtitle={T(
        "A gentle, faith-centered space for children and caregivers.",
        "Un espace doux, centré sur la foi, pour enfants et aidants.",
      )}
    >
      <nav
        aria-label={T("Faith tradition", "Tradition de foi")}
        className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-muted/60 p-1.5"
      >
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={active}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "christianity" && <ChristianitySection />}
      {tab === "islam" && <IslamSection />}
      {tab === "shared" && <SharedSection />}
    </AppShell>
  );
}

// ────────── shared sub-components ──────────
function SectionHeader({
  icon: Icon, title, subtitle, accent = "primary",
}: { icon: any; title: string; subtitle?: string; accent?: "primary" | "gold" | "teal" | "emerald" }) {
  const tone =
    accent === "gold" ? "bg-amber-100 text-amber-700"
    : accent === "teal" ? "bg-teal-100 text-teal-700"
    : accent === "emerald" ? "bg-emerald-100 text-emerald-700"
    : "bg-primary-soft text-primary";
  return (
    <div className="mt-10 mb-4 flex items-start gap-3">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h3 className="font-display text-xl font-bold">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function VerseCard({ v, accent }: { v: Verse; accent: "gold" | "emerald" }) {
  const bi = useBi();
  const { lang } = usePrefs();
  const T = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const ring = accent === "gold" ? "ring-amber-200/60" : "ring-emerald-200/60";
  return (
    <article className={`rounded-3xl border border-border/60 bg-card p-6 shadow-soft ring-1 ${ring}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {bi(v.ref)}
        </span>
        <button
          onClick={() => speak(`${bi(v.ref)}. ${bi(v.verse)}. ${bi(v.meaning)}.`)}
          className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold hover:bg-muted/70"
          aria-label={T("Listen", "Écouter")}
        >
          <Volume2 className="h-3 w-3" /> {T("Listen", "Écouter")}
        </button>
      </div>
      <blockquote className="mt-3 flex gap-2 font-display text-lg italic leading-snug text-foreground">
        <Quote className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        <span>{bi(v.verse)}</span>
      </blockquote>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {T("Simple meaning", "Sens simple")}
          </dt>
          <dd className="mt-1 text-foreground/90">{bi(v.meaning)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {T("For children", "Pour les enfants")}
          </dt>
          <dd className="mt-1 text-foreground/90">{bi(v.forChildren)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {T("Today's gentle reminder", "Rappel doux du jour")}
          </dt>
          <dd className="mt-1 text-foreground/90">{bi(v.reminder)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {T("Reflection", "Réflexion")}
          </dt>
          <dd className="mt-1 text-foreground/90">{bi(v.reflection)}</dd>
        </div>
      </dl>
      <p className="mt-4 rounded-2xl bg-gradient-warm px-4 py-3 text-sm font-semibold text-foreground/90">
        {T("Affirmation", "Affirmation")}: {bi(v.affirmation)}
      </p>
    </article>
  );
}

function StoryCard({ s }: { s: Story }) {
  const bi = useBi();
  const { lang } = usePrefs();
  const T = (en: string, fr: string) => (lang === "fr" ? fr : en);
  return (
    <article className="flex flex-col rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-base font-bold">{bi(s.title)}</h4>
        <button
          onClick={() => speak(`${bi(s.title)}. ${bi(s.summary)}. ${bi(s.takeaway)}.`)}
          className="rounded-full bg-muted p-2 hover:bg-muted/70"
          aria-label={T("Listen", "Écouter")}
        >
          <Volume2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-sm text-foreground/80">{bi(s.summary)}</p>
      <div className="mt-3 rounded-2xl bg-muted/60 px-3 py-2 text-xs text-foreground/80">
        <span className="font-semibold">{T("Takeaway", "À retenir")}:</span> {bi(s.takeaway)}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="font-semibold">{T("Discuss", "Discuter")}:</span> {bi(s.prompt)}
      </div>
    </article>
  );
}

function LessonGrid({ items, icon: Icon, accent }: { items: Lesson[]; icon: any; accent: string }) {
  const bi = useBi();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
      {items.map((l, i) => (
        <div key={i} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${accent}`}>
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h5 className="font-semibold">{bi(l.title)}</h5>
            <p className="mt-0.5 text-sm text-muted-foreground">{bi(l.text)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoutineList({ items, accent }: { items: Routine[]; accent: string }) {
  const bi = useBi();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((r, i) => (
        <div key={i} className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${accent}`}>
              <ListChecks className="h-4 w-4" />
            </span>
            <h5 className="font-display text-base font-bold">{bi(r.title)}</h5>
          </div>
          <ol className="mt-3 space-y-2 pl-2 text-sm text-foreground/85">
            {r.steps.map((s, j) => (
              <li key={j} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                <span>{bi(s)}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

// ────────── Christianity ──────────
function ChristianitySection() {
  const { lang } = usePrefs();
  const T = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const verseOfDay = useMemo(() => {
    const i = new Date().getDate() % christianity.verses.length;
    return christianity.verses[i];
  }, []);

  return (
    <div className="space-y-2" style={{ backgroundColor: "transparent" }}>
      <section className="overflow-hidden rounded-3xl border border-amber-200/50 bg-amber-50/60">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:items-center md:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              <Sparkles className="h-3.5 w-3.5" /> {T("Today's verse", "Verset du jour")}
            </div>
            <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-foreground">
              {T("A gentle word for today", "Une parole douce pour aujourd'hui")}
            </h2>
            <p className="mt-2 text-sm text-foreground/75">
              {T(
                "Read it slowly. Let it settle in your heart.",
                "Lis-le lentement. Laisse-le se déposer dans ton cœur.",
              )}
            </p>
          </div>
          <img
            src={heroChristianity}
            alt={T("Open book with sunlight and a dove", "Livre ouvert avec lumière du soleil et colombe")}
            width={1280}
            height={720}
            className="h-40 w-full rounded-2xl object-cover md:h-48"
          />
        </div>
        <div className="border-t border-amber-200/50 bg-card p-6">
          <VerseCard v={verseOfDay} accent="gold" />
        </div>
      </section>

      <SectionHeader
        icon={BookOpen}
        title={T("Bible stories for emotional growth", "Histoires bibliques pour grandir")}
        subtitle={T("Short, gentle stories with a soft takeaway.", "Histoires courtes et douces avec une morale tendre.")}
        accent="gold"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {christianity.stories.map((s, i) => <StoryCard key={i} s={s} />)}
      </div>

      <SectionHeader icon={Heart} title={T("Character & values lessons", "Leçons de caractère et de valeurs")} accent="teal" />
      <LessonGrid items={christianity.values} icon={Heart} accent="bg-teal-100 text-teal-700" />

      <SectionHeader icon={Feather} title={T("Emotional regulation through faith", "Régulation émotionnelle par la foi")} accent="primary" />
      <LessonGrid items={christianity.regulation} icon={Feather} accent="bg-primary-soft text-primary" />

      <SectionHeader icon={Bed} title={T("Bedtime reflections", "Réflexions du soir")} accent="primary" />
      <LessonGrid items={christianity.bedtime} icon={Moon} accent="bg-primary-soft text-primary" />

      <SectionHeader icon={HandHeart} title={T("Prayer corner", "Coin prière")} accent="gold" />
      <div className="grid gap-3 sm:grid-cols-2">
        {christianity.prayers.map((p, i) => {
          const bi = (b: Bi) => (lang === "fr" ? b.fr : b.en);
          return (
            <div key={i} className="rounded-2xl border border-amber-200/50 bg-amber-50/40 p-4">
              <div className="flex items-center justify-between">
                <h5 className="font-semibold">{bi(p.title)}</h5>
                <button
                  onClick={() => speak(`${bi(p.title)}. ${bi(p.text)}.`)}
                  className="rounded-full bg-card p-2 shadow-soft hover:opacity-90"
                  aria-label={T("Listen", "Écouter")}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-foreground/80">{bi(p.text)}</p>
            </div>
          );
        })}
      </div>

      <SectionHeader icon={HandHeart} title={T("Caregiver encouragement", "Encouragement pour l'aidant·e")} accent="teal" />
      <LessonGrid items={christianity.caregiver} icon={HandHeart} accent="bg-teal-100 text-teal-700" />

      <SectionHeader icon={Music} title={T("Worship & gratitude", "Adoration et gratitude")} accent="gold" />
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <p className="text-sm text-foreground/85">
          {T("Today I am thankful for...", "Aujourd'hui, je suis reconnaissant·e pour...")}
        </p>
        <textarea
          rows={3}
          placeholder={T("Three small good things", "Trois petites belles choses")}
          className="mt-2 w-full resize-none rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <SectionHeader icon={Sun} title={T("Gentle Christian routines", "Routines chrétiennes douces")} accent="gold" />
      <RoutineList items={christianity.routines} accent="bg-amber-100 text-amber-700" />

      <SectionHeader icon={Palette} title={T("Faith-based activities", "Activités de foi")} accent="teal" />
      <LessonGrid items={christianity.activities} icon={Palette} accent="bg-teal-100 text-teal-700" />
    </div>
  );
}

// ────────── Islam ──────────
function IslamSection() {
  const { lang } = usePrefs();
  const T = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const duaOfDay = useMemo(() => {
    const i = new Date().getDate() % islam.duas.length;
    return islam.duas[i];
  }, []);

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-3xl border border-emerald-200/50 bg-emerald-50/50">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:items-center md:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> {T("Today's dua", "Dua du jour")}
            </div>
            <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-foreground">
              {T("A peaceful word for today", "Une parole paisible pour aujourd'hui")}
            </h2>
            <p className="mt-2 text-sm text-foreground/75">
              {T("Whisper it softly. Breathe slowly.", "Murmure-la doucement. Respire lentement.")}
            </p>
          </div>
          <img
            src={heroIslam}
            alt={T("Calm moonlight scene", "Scène apaisante au clair de lune")}
            width={1280}
            height={720}
            className="h-40 w-full rounded-2xl object-cover md:h-48"
          />
        </div>
        <div className="border-t border-emerald-200/50 bg-card p-6">
          <VerseCard v={duaOfDay} accent="emerald" />
        </div>
      </section>

      <SectionHeader
        icon={BookOpen}
        title={T("Stories of the Prophets", "Histoires des Prophètes")}
        subtitle={T("Gentle lessons of patience, courage and mercy.", "Leçons douces de patience, courage et miséricorde.")}
        accent="emerald"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:pl-[8.333%]">
        {islam.stories.map((s, i) => <StoryCard key={i} s={s} />)}
      </div>

      <SectionHeader icon={Heart} title={T("Akhlaq - character & manners", "Akhlaq - caractère et manières")} accent="teal" />
      <LessonGrid items={islam.values} icon={Heart} accent="bg-teal-100 text-teal-700" />

      <SectionHeader icon={Feather} title={T("Emotional regulation through Islam", "Régulation émotionnelle par l'Islam")} accent="emerald" />
      <LessonGrid items={islam.regulation} icon={Feather} accent="bg-emerald-100 text-emerald-700" />

      <SectionHeader icon={Bed} title={T("Bedtime reflections", "Réflexions du soir")} accent="emerald" />
      <LessonGrid items={islam.bedtime} icon={Moon} accent="bg-primary-soft text-primary" />

      <SectionHeader icon={HandHeart} title={T("Dua corner", "Coin dua")} accent="emerald" />
      <div className="grid gap-3 sm:grid-cols-2">
        {islam.prayers.map((p, i) => {
          const bi = (b: Bi) => (lang === "fr" ? b.fr : b.en);
          return (
            <div key={i} className="rounded-2xl border border-emerald-200/50 bg-emerald-50/40 p-4">
              <div className="flex items-center justify-between">
                <h5 className="font-semibold">{bi(p.title)}</h5>
                <button
                  onClick={() => speak(`${bi(p.title)}. ${bi(p.text)}.`)}
                  className="rounded-full bg-card p-2 shadow-soft hover:opacity-90"
                  aria-label={T("Listen", "Écouter")}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-foreground/80">{bi(p.text)}</p>
            </div>
          );
        })}
      </div>

      <SectionHeader icon={HandHeart} title={T("Caregiver encouragement", "Encouragement pour l'aidant·e")} accent="teal" />
      <LessonGrid items={islam.caregiver} icon={HandHeart} accent="bg-teal-100 text-teal-700" />

      <SectionHeader icon={Leaf} title={T("Gratitude & mercy", "Gratitude et miséricorde")} accent="emerald" />
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <p className="text-sm text-foreground/85">
          {T("What made me smile today?", "Qu'est-ce qui m'a fait sourire aujourd'hui ?")}
        </p>
        <textarea
          rows={3}
          placeholder={T("One small mercy I noticed", "Une petite miséricorde remarquée")}
          className="mt-2 w-full resize-none rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300/40"
        />
      </div>

      <SectionHeader icon={Sun} title={T("Gentle Islamic routines", "Routines islamiques douces")} accent="emerald" />
      <RoutineList items={islam.routines} accent="bg-emerald-100 text-emerald-700" />

      <SectionHeader icon={Palette} title={T("Faith-based activities", "Activités de foi")} accent="teal" />
      <LessonGrid items={islam.activities} icon={Palette} accent="bg-teal-100 text-teal-700" />
    </div>
  );
}

// ────────── Shared ──────────
function SharedSection() {
  const { lang } = usePrefs();
  const T = (en: string, fr: string) => (lang === "fr" ? fr : en);
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
        <img
          src={heroShared}
          alt={T("Hands holding a glowing heart", "Mains tenant un cœur lumineux")}
          width={1280}
          height={720}
          className="h-44 w-full object-cover"
        />
        <div className="p-6 md:p-8">
          <h2 className="font-display text-2xl font-extrabold">
            {T("Universal values that bring us together", "Des valeurs universelles qui nous rassemblent")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-foreground/75">
            {T(
              "A peaceful, inclusive space - kindness, patience and compassion belong to everyone.",
              "Un espace paisible et inclusif - la bonté, la patience et la compassion appartiennent à chacun.",
            )}
          </p>
        </div>
      </section>
      <LessonGrid items={sharedValues} icon={Sparkles} accent="bg-gradient-warm text-foreground" />
    </div>
  );
}
