import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  BookHeart, Headphones, Brain, Ear, Utensils, Moon, MapPin,
  Sparkles, Clock, Heart, Leaf, ClipboardList, ChefHat,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PersonalLine } from "@/lib/personalize";
import { usePrefs } from "@/lib/prefs";
import { useTTS } from "@/lib/tts";
import { articlesForLang } from "@/lib/kua-content";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support Hub - KUA" }, { name: "description", content: "Curated articles, audio stories and printables for caregivers." }] }),
  component: SupportPage,
});

const featured = {
  category: "Featured today",
  slug: "name-big-feelings",
  title: "Helping a child name big feelings",
  excerpt: "A gentle 7-step approach with picture cues, plus a printable feelings wheel.",
  read: 6,
};

const rows = [
  {
    title: "Emotional regulation",
    icon: Heart,
    items: [
      { slug: "co-regulation-4-breaths", title: "Co-regulation in 4 breaths", read: 4, tone: "primary" },
      { slug: "meltdowns-script", title: "When meltdowns arrive: a script", read: 7, tone: "tertiary" },
      { slug: "naming-without-labels", title: "Naming feelings without labels", read: 5, tone: "secondary" },
      { slug: "soft-transitions", title: "Soft transitions between activities", read: 3, tone: "primary" },
    ],
  },
  {
    title: "Speech & communication",
    icon: Brain,
    items: [
      { slug: "starter-aac", title: "Building a starter AAC vocabulary", read: 8, tone: "tertiary" },
      { slug: "aided-language", title: "Modeling: the gentle 'aided language' way", read: 6, tone: "primary" },
      { slug: "bilingual-homes", title: "Bilingual homes: when to switch languages", read: 5, tone: "secondary" },
      { slug: "stuttering", title: "Stuttering: what helps, what hurts", read: 7, tone: "tertiary" },
    ],
  },
  {
    title: "Sensory & sleep",
    icon: Ear,
    items: [
      { slug: "sensory-diet", title: "A sensory diet that fits real life", read: 9, tone: "primary" },
      { slug: "sounds-that-soothe", title: "Sounds that soothe - and which to avoid", read: 4, tone: "secondary" },
      { slug: "little-lamp", title: "Bedtime story: 'The little lamp'", read: 11, tone: "tertiary" },
      { slug: "untangle-overstim", title: "Untangling overstimulation early", read: 6, tone: "primary" },
    ],
  },
  {
    title: "Routines & self-care",
    icon: Utensils,
    items: [
      { slug: "brushing-teeth", title: "Brushing teeth in 6 visual steps", read: 4, tone: "primary" },
      { slug: "calm-laundry", title: "Calm laundry helper routine", read: 5, tone: "tertiary" },
      { slug: "soft-transitions", title: "Soft transitions between activities", read: 3, tone: "primary" },
      { slug: "untangle-overstim", title: "Calm bath-time routine", read: 5, tone: "secondary" },
    ],
  },
];

const recipes = [
  { slug: "breakfast-plates", title: "Autism-friendly breakfast plates", read: 5, tone: "secondary" },
  { slug: "smoothies", title: "Smooth, sensory-safe smoothies", read: 3, tone: "primary" },
  { slug: "breakfast-plates", title: "Snack boards children love", read: 4, tone: "tertiary" },
  { slug: "smoothies", title: "Mild dinners for picky eaters", read: 6, tone: "secondary" },
];

const spirituality = [
  { title: "Christianity", text: "Daily verse, gentle Bible stories, prayers, character lessons and bedtime reflections." },
  { title: "Islam", text: "Daily dua, stories of the prophets, akhlaq, calming dhikr and bedtime duas." },
];

function tone(t: string) {
  if (t === "tertiary") return "bg-tertiary/15 text-tertiary";
  if (t === "secondary") return "bg-secondary/25 text-secondary-foreground";
  return "bg-primary-soft text-primary";
}

function SupportPage() {
  const { lang, voiceRate } = usePrefs();
  const { speak, supported } = useTTS(lang, voiceRate);
  const localizedArticles = useMemo(() => articlesForLang(lang), [lang]);
  const articleIndex = useMemo(() => Object.fromEntries(localizedArticles.map((a) => [a.slug, a])), [localizedArticles]);
  const featuredArticle = articleIndex[featured.slug] ?? featured;
  const categoryTitle = (title: string) => ({
    "Emotional regulation": "Régulation émotionnelle",
    "Speech & communication": "Parole et communication",
    "Sensory & sleep": "Sensoriel et sommeil",
    "Routines & self-care": "Routines et soin de soi",
  }[title] ?? title);
  return (
    <AppShell title={lang === "fr" ? "Centre de soutien" : "Support Hub"} subtitle={lang === "fr" ? "Des conseils calmes et choisis pour les aidants." : "Calm, curated guidance - like Netflix for caregiver support, but quieter."}>
      <PersonalLine pool="support" className="mb-6" />
      {/* Featured */}
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-warm p-1 shadow-soft">
        <div className="grid gap-6 rounded-[1.4rem] bg-card p-7 md:grid-cols-[1.5fr_1fr] md:items-center md:p-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {lang === "fr" ? "À la une aujourd'hui" : featured.category}
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight">{featuredArticle.title}</h2>
            <p className="mt-3 max-w-lg text-muted-foreground">{featuredArticle.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/article/$slug"
                params={{ slug: featured.slug }}
                className="rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                {lang === "fr" ? "Lire l'article" : "Read article"}
              </Link>
              <button
                onClick={() => speak(featuredArticle.title + ". " + featuredArticle.excerpt)}
                disabled={!supported}
                className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2.5 text-xs font-semibold hover:bg-muted/70"
              >
                <Headphones className="h-3.5 w-3.5" /> {lang === "fr" ? "Écouter" : "Listen"} ({featured.read} min)
              </button>
            </div>
          </div>
          <div className="grid place-items-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-primary/10 blur-2xl animate-breathe" />
              <span className="relative grid h-32 w-32 place-items-center rounded-full bg-card shadow-card">
                <BookHeart className="h-12 w-12 text-primary" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tests */}
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-tertiary/15 text-tertiary"><ClipboardList className="h-4 w-4" /></span>
          <h3 className="font-display text-xl font-bold">{lang === "fr" ? "Tests pour votre enfant" : "Tests for your child"}</h3>
        </div>
        <div className="group grid gap-5 overflow-hidden rounded-3xl border border-border/60 bg-card p-7 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card md:grid-cols-[1.4fr_1fr] md:items-center md:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-tertiary">
              <Sparkles className="h-3.5 w-3.5" /> {lang === "fr" ? "Dépistages appuyés par la science" : "Science-backed screeners"}
            </div>
            <h4 className="mt-3 font-display text-2xl font-extrabold leading-tight">
              {lang === "fr" ? "Autisme (AQ-10), personnalité et cognition" : "Autism (AQ-10), personality & cognitive screens"}
            </h4>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {lang === "fr" ? "Trois tests courts et doux avec réponses emoji, inspirés d'instruments publiés. Résultats en langage clair. Éducatif, jamais diagnostique." : "Three short, gentle tests with emoji answers - calmly built from real published instruments. Results in plain language. Educational, never diagnostic."}
            </p>
            <Link
              to="/tests"
              className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
            >
              {lang === "fr" ? "Ouvrir tous les tests" : "Open all tests"} →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { e: "🧩", l: "ASD", slug: "asd" as const },
              { e: "🌱", l: "Big Five", slug: "personality" as const },
              { e: "🧠", l: "Cognition", slug: "cognitive" as const },
            ].map((c) => (
              <Link
                key={c.l}
                to="/tests/$slug"
                params={{ slug: c.slug }}
                className="rounded-2xl border border-border/60 bg-background p-4 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-soft"
              >
                <div className="text-3xl">{c.e}</div>
                <div className="mt-1 text-[11px] font-semibold text-muted-foreground">{c.l}</div>
                <div className="mt-1 text-[10px] font-semibold text-primary">{lang === "fr" ? "Démarrer" : "Start"} →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Rows */}
      {rows.map((row) => (
        <section key={row.title} className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary"><row.icon className="h-4 w-4" /></span>
            <h3 className="font-display text-xl font-bold">{lang === "fr" ? categoryTitle(row.title) : row.title}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {row.items.map((it) => (
              <Link
                key={it.slug}
                to="/article/$slug"
                params={{ slug: it.slug }}
                className="group flex flex-col rounded-3xl border border-border/60 bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone(it.tone)}`}><Leaf className="h-4 w-4" /></span>
                <h4 className="mt-4 font-display text-base font-bold leading-snug">{articleIndex[it.slug]?.title ?? it.title}</h4>
                <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {it.read} min</span>
                  <span className="font-semibold text-primary group-hover:underline">{lang === "fr" ? "Lire" : "Read"} →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Support map */}
      <section className="mt-12 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
        <div className="grid md:grid-cols-[1.2fr_1fr]">
          <div className="p-7 md:p-10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-tertiary">
              <MapPin className="h-3.5 w-3.5" /> Support map
            </div>
            <h3 className="mt-3 font-display text-2xl font-extrabold">{lang === "fr" ? "Trouver de l'aide vérifiée près de vous." : "Find verified care nearby."}</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {lang === "fr" ? "Écoles inclusives, centres d'appui et numéros d'urgence au Cameroun — avec sources vérifiables." : "Inclusive schools, support centres and emergency lines in Cameroon — with verifiable sources."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(lang === "fr" ? ["Écoles", "Centres d'appui", "Urgence"] : ["Schools", "Support centres", "Emergency"]).map((c) => (
                <span key={c} className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">{c}</span>
              ))}
            </div>
            <Link to="/map" className="mt-6 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
              {lang === "fr" ? "Ouvrir la carte" : "Open the map"}
            </Link>
          </div>
          <div className="relative min-h-[240px] bg-[radial-gradient(circle_at_30%_30%,oklch(0.95_0.04_165)_0%,transparent_60%),radial-gradient(circle_at_70%_70%,oklch(0.94_0.06_85)_0%,transparent_60%)]">
            {[
              { top: "20%", left: "30%" },
              { top: "55%", left: "60%" },
              { top: "70%", left: "25%" },
              { top: "35%", left: "70%" },
            ].map((p, i) => (
              <span key={i} className="absolute" style={p}>
                <span className="absolute inset-0 -m-3 animate-breathe rounded-full bg-primary/30" />
                <span className="relative grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Recipes - own section */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/30 text-secondary-foreground"><ChefHat className="h-4 w-4" /></span>
          <h3 className="font-display text-xl font-bold">{lang === "fr" ? "Recettes" : "Recipes"}</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{lang === "fr" ? "Repas et collations sensoriellement sûrs, pensés pour les mangeurs sélectifs." : "Sensory-safe meals and snacks designed with picky eaters in mind."}</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recipes.map((it, i) => (
            <Link
              key={`${it.slug}-${i}`}
              to="/article/$slug"
              params={{ slug: it.slug }}
              className="group flex flex-col rounded-3xl border border-border/60 bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone(it.tone)}`}><Utensils className="h-4 w-4" /></span>
              <h4 className="mt-4 font-display text-base font-bold leading-snug">{articleIndex[it.slug]?.title ?? it.title}</h4>
              <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {it.read} min</span>
                <span className="font-semibold text-primary group-hover:underline">{lang === "fr" ? "Lire" : "Read"} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Faith & Guidance */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700"><Heart className="h-4 w-4" /></span>
          <h3 className="font-display text-xl font-bold">{lang === "fr" ? "Foi et guidance" : "Faith & Guidance"}</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{lang === "fr" ? "Un accompagnement spirituel doux — réflexions, histoires, prières et routines calmes." : "A gentle faith-centered companion - daily reflections, stories, prayers and calm routines."}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {spirituality.map((c) => (
            <Link
              key={c.title}
              to="/faith"
              className="group rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700"><Heart className="h-4 w-4" /></span>
              <h4 className="mt-4 font-display text-lg font-bold">{lang === "fr" ? (c.title === "Christianity" ? "Christianisme" : "Islam") : c.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{lang === "fr" ? (c.title === "Christianity" ? "Verset du jour, histoires bibliques douces, prières, leçons de caractère et réflexions du soir." : "Dua du jour, histoires des prophètes, akhlaq, dhikr apaisant et duas du coucher.") : c.text}</p>
              <span className="mt-3 inline-block text-xs font-semibold text-primary group-hover:underline">{lang === "fr" ? "Ouvrir" : "Open"} →</span>
            </Link>
          ))}
          <Link
            to="/faith"
            className="group rounded-3xl border border-border/60 bg-gradient-warm p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-card text-foreground"><Sparkles className="h-4 w-4" /></span>
            <h4 className="mt-4 font-display text-lg font-bold">{lang === "fr" ? "Valeurs partagées" : "Shared values"}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{lang === "fr" ? "Bienveillance, patience et compassion qui appartiennent à tout le monde." : "Kindness, patience and compassion that belong to everyone."}</p>
            <span className="mt-3 inline-block text-xs font-semibold text-primary group-hover:underline">{lang === "fr" ? "Ouvrir" : "Open"} →</span>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
