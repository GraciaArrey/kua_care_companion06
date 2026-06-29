import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles, Heart, MessageCircle, Sprout, BookHeart, HeartHandshake,
  ShieldCheck, Languages, Moon, Volume2, ArrowRight, Star, Wand2,
  UserPlus, Compass, CalendarHeart, Smile, Map as MapIcon, BookOpen, ChevronDown,
  Sun,
} from "lucide-react";
import heroImg from "@/assets/hero-companion.jpg";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { aiHero } from "@/lib/ai-client";
import { usePrefs, type Lang } from "@/lib/prefs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KUA - A calm companion for caregivers and autistic children" },
      {
        name: "description",
        content:
          "KUA helps caregivers and autistic children navigate emotional growth, communication, routines and developmental milestones through a calm, supportive digital experience.",
      },
      { property: "og:title", content: "KUA - Calm developmental companion" },
      { property: "og:description", content: "Emotional growth, communication, routines and milestones - for every caregiver and child." },
    ],
  }),
  component: Landing,
});

type Copy = {
  heroBadge: string;
  heroTitle: string;
  heroLead: string;
  begin: string;
  exploreSupport: string;
  builtWith: string;
  wcag: string;
  bilingual: string;
  todaysMood: string;
  calmCurious: string;
  smallWin: string;
  brushed: string;
  ecoLabel: string;
  ecosystems: string[];
  whyTitle: string;
  whyLead: string;
  features: { title: string; text: string; tone: string }[];
  promiseEyebrow: string;
  promiseTitle: string;
  promiseLead: string;
  promises: { title: string; text: string }[];
  howEyebrow: string;
  howTitle: string;
  howLead: string;
  steps: { title: string; text: string }[];
  insideEyebrow: string;
  insideTitle: string;
  insideLead: string;
  openComm: string;
  faith: string;
  tiles: { label: string; tone: string }[];
  storiesTitle: string;
  storiesLead: string;
  testimonials: { name: string; role: string; quote: string }[];
  faqEyebrow: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  ctaTitle: string;
  ctaLead: string;
  openToday: string;
  tryBoard: string;
  footerTag: string;
  footerCols: { title: string; links: { label: string; to: string }[] }[];
  rights: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    heroBadge: "For caregivers and parents",
    heroTitle: "Supporting every step of your child's journey.",
    heroLead:
      "KUA is a calm digital companion for autistic children and the people who love them - guiding emotional growth, communication, routines and developmental milestones with warmth and dignity.",
    begin: "Begin gently",
    exploreSupport: "Explore Support Hub",
    builtWith: "Built with caregivers and families",
    wcag: "· WCAG-aware",
    bilingual: "· Bilingual EN/FR",
    todaysMood: "Today's mood",
    calmCurious: "Calm and curious",
    smallWin: "Small win",
    brushed: "Brushed teeth alone ✨",
    ecoLabel: "Five gentle ecosystems",
    ecosystems: ["Today", "Growth", "Communication", "Support", "Caregiver"],
    whyTitle: "A companion, not a dashboard.",
    whyLead:
      "KUA is built around what the child and caregiver need right now - not endless metrics. Every screen is calm, predictable and emotionally safe.",
    features: [
      { title: "Mood Support", text: "Daily check-ins with a soft, adaptive interface that gentles itself when needed.", tone: "primary" },
      { title: "Communication", text: "AAC-style cards, an emotion wheel and bilingual voice playback to help every voice be heard.", tone: "tertiary" },
      { title: "Growth Journey", text: "Milestones across communication, regulation, learning and independence - celebrated, never graded.", tone: "secondary" },
      { title: "Support Hub", text: "Curated articles, audio stories and printables for sensory, speech and bedtime needs.", tone: "primary" },
      { title: "Caregiver Wellness", text: "How are YOU feeling today? Stress check-ins, notes vault and gentle daily tools.", tone: "tertiary" },
      { title: "Today's Small Win", text: "Every day deserves one celebration - KUA helps you notice and honor it.", tone: "secondary" },
    ],
    promiseEyebrow: "Our accessibility promise",
    promiseTitle: "Designed for the people who use it.",
    promiseLead:
      "KUA is built with neurodivergent users at the center - soft motion, sensory-safe color, predictable navigation and language that respects every child.",
    promises: [
      { title: "Sensory-safe by design", text: "Low-stimulation layouts, soft motion, no harsh colors." },
      { title: "Bilingual support", text: "English & French interface and voice playback." },
      { title: "Calm Mode", text: "One tap softens visuals when the day feels like a lot." },
      { title: "Audio-assisted nav", text: "Read-aloud guidance and screen-reader friendly throughout." },
    ],
    howEyebrow: "A gentle weekly rhythm",
    howTitle: "How KUA fits your week.",
    howLead: "No setup marathon. Open it once and it grows with you.",
    steps: [
      { title: "Create a child profile", text: "Add your child's name, photo and a few preferences. You can add siblings later from Caregiver." },
      { title: "Choose what matters today", text: "Pick a routine, a feeling, or one milestone. KUA never asks for everything at once." },
      { title: "Notice the small wins", text: "Each evening, KUA gently surfaces what went well for the child and for you." },
      { title: "Rest, then begin again", text: "Sundays soften. KUA suggests a quiet reset so the next week starts from a calm place." },
    ],
    insideEyebrow: "A peek inside",
    insideTitle: "Everything in one calm place.",
    insideLead:
      "Move between routines, feelings, learning and rest without losing your place. Each section is its own quiet room.",
    openComm: "Open Communication",
    faith: "Faith & Guidance",
    tiles: [
      { label: "Mood & rhythm", tone: "primary" },
      { label: "Picture cards", tone: "tertiary" },
      { label: "Growth", tone: "secondary" },
      { label: "Wins log", tone: "primary" },
      { label: "Faith stories", tone: "secondary" },
      { label: "Calm places", tone: "tertiary" },
    ],
    storiesTitle: "Stories from gentle homes.",
    storiesLead: "Caregivers and clinicians across Cameroon, sharing what changed.",
    testimonials: [
      { name: "Sandrine Takang", role: "Mother of two", quote: "For the first time, mornings don't feel like a battle. The visual routines made everything click for my son." },
      { name: "Dr. Eyenga Nkoa", role: "Speech therapist", quote: "The communication board is the most thoughtful AAC experience I've recommended to a family this year." },
      { name: "Mireille Mbong", role: "Caregiver", quote: "That one question, how are YOU feeling today, changed how I see my own week." },
    ],
    faqEyebrow: "Questions, gently answered",
    faqTitle: "Before you begin.",
    faqs: [
      { q: "Is KUA a medical or diagnostic tool?", a: "No. KUA is a calm companion for everyday support. The screening tools in /tests are reflective, not clinical, and we always point to qualified professionals for medical questions." },
      { q: "Does it work in French?", a: "Yes. The whole app — Today, Communication, Faith & Guidance, Caregiver — switches between English and French from Settings, including voice playback." },
      { q: "Can more than one child use the same account?", a: "Yes. Add as many children as you need from Caregiver. Switching the active child instantly updates the home, routine, profile and growth pages." },
      { q: "Is my family's data private?", a: "Yes. Every entry — moods, notes, places, test results — is scoped to your account with row-level security and never shared." },
      { q: "What does it cost?", a: "KUA is free to begin. Premium care tools may be added later, but the core companion will always remain accessible." },
    ],
    ctaTitle: "Begin gently. Stay gently.",
    ctaLead: "Set up a child profile in minutes and shape KUA around your family's rhythm.",
    openToday: "Open my Today",
    tryBoard: "Try the board",
    footerTag: "A calm digital companion for caregivers and autistic children.",
    footerCols: [
      { title: "Product", links: [
        { label: "Today", to: "/today" }, { label: "Growth", to: "/growth" },
        { label: "Communication", to: "/communication" }, { label: "Support", to: "/support" },
      ]},
      { title: "Care", links: [
        { label: "Caregiver wellness", to: "/caregiver" }, { label: "Notes vault", to: "/vault" },
        { label: "Emotion wheel", to: "/wheel" }, { label: "Breathing", to: "/breathing" },
      ]},
      { title: "Explore", links: [
        { label: "Support map", to: "/map" }, { label: "Small wins", to: "/wins" },
        { label: "Article: Big feelings", to: "/article/name-big-feelings" },
        { label: "Learn: Mathematics", to: "/learn/mathematics" },
      ]},
    ],
    rights: "Built with care.",
  },
  fr: {
    heroBadge: "Pour les aidants et les parents",
    heroTitle: "Accompagner chaque pas du parcours de votre enfant.",
    heroLead:
      "KUA est un compagnon numérique apaisant pour les enfants autistes et celles et ceux qui les aiment - guidant la croissance émotionnelle, la communication, les routines et les étapes de développement avec chaleur et dignité.",
    begin: "Commencer doucement",
    exploreSupport: "Explorer le centre de soutien",
    builtWith: "Conçu avec les familles et les aidants",
    wcag: "· Accessible WCAG",
    bilingual: "· Bilingue EN/FR",
    todaysMood: "Humeur du jour",
    calmCurious: "Calme et curieux·se",
    smallWin: "Petite victoire",
    brushed: "S'est brossé les dents seul·e ✨",
    ecoLabel: "Cinq écosystèmes doux",
    ecosystems: ["Aujourd'hui", "Croissance", "Communication", "Soutien", "Aidant·e"],
    whyTitle: "Un compagnon, pas un tableau de bord.",
    whyLead:
      "KUA est pensé autour de ce dont l'enfant et l'aidant·e ont besoin maintenant - pas de métriques sans fin. Chaque écran est calme, prévisible et émotionnellement sûr.",
    features: [
      { title: "Soutien émotionnel", text: "Des check-ins quotidiens avec une interface douce qui s'adoucit encore au besoin.", tone: "primary" },
      { title: "Communication", text: "Cartes type CAA, roue des émotions et lecture vocale bilingue pour que chaque voix soit entendue.", tone: "tertiary" },
      { title: "Parcours de croissance", text: "Des étapes en communication, régulation, apprentissage et autonomie - célébrées, jamais notées.", tone: "secondary" },
      { title: "Centre de soutien", text: "Articles, histoires audio et imprimables pour les besoins sensoriels, langagiers et du coucher.", tone: "primary" },
      { title: "Bien-être de l'aidant·e", text: "Comment allez-VOUS aujourd'hui ? Check-ins, journal privé et outils doux du quotidien.", tone: "tertiary" },
      { title: "La petite victoire du jour", text: "Chaque journée mérite une célébration - KUA vous aide à la remarquer.", tone: "secondary" },
    ],
    promiseEyebrow: "Notre promesse d'accessibilité",
    promiseTitle: "Pensé pour celles et ceux qui l'utilisent.",
    promiseLead:
      "KUA est conçu avec les utilisateurs neurodivergents au centre - mouvement doux, couleurs sûres pour les sens, navigation prévisible et langage qui respecte chaque enfant.",
    promises: [
      { title: "Sécurité sensorielle", text: "Mises en page peu stimulantes, mouvement doux, pas de couleurs agressives." },
      { title: "Support bilingue", text: "Interface et lecture vocale en français et anglais." },
      { title: "Mode calme", text: "Un toucher adoucit l'écran quand la journée est trop chargée." },
      { title: "Navigation audio", text: "Lecture à voix haute et compatibilité lecteurs d'écran partout." },
    ],
    howEyebrow: "Un rythme hebdomadaire doux",
    howTitle: "Comment KUA s'intègre à votre semaine.",
    howLead: "Pas de marathon de configuration. Ouvrez-le une fois, il grandit avec vous.",
    steps: [
      { title: "Créer un profil enfant", text: "Ajoutez le prénom, la photo et quelques préférences. Vous pourrez ajouter les frères et sœurs depuis Aidant·e." },
      { title: "Choisir ce qui compte aujourd'hui", text: "Une routine, une émotion, une étape. KUA ne demande jamais tout d'un coup." },
      { title: "Remarquer les petites victoires", text: "Chaque soir, KUA fait remonter doucement ce qui s'est bien passé pour l'enfant et pour vous." },
      { title: "Se reposer, puis recommencer", text: "Les dimanches s'adoucissent. KUA propose une pause calme pour repartir d'un bon pied." },
    ],
    insideEyebrow: "Un aperçu",
    insideTitle: "Tout dans un seul endroit calme.",
    insideLead:
      "Naviguez entre routines, émotions, apprentissage et repos sans perdre votre place. Chaque section est sa propre pièce calme.",
    openComm: "Ouvrir Communication",
    faith: "Foi & Guidance",
    tiles: [
      { label: "Humeur & rythme", tone: "primary" },
      { label: "Cartes images", tone: "tertiary" },
      { label: "Croissance", tone: "secondary" },
      { label: "Journal des victoires", tone: "primary" },
      { label: "Histoires de foi", tone: "secondary" },
      { label: "Lieux calmes", tone: "tertiary" },
    ],
    storiesTitle: "Histoires de foyers doux.",
    storiesLead: "Aidants et cliniciens à travers le Cameroun, partageant ce qui a changé.",
    testimonials: [
      { name: "Sandrine Takang", role: "Mère de deux enfants", quote: "Pour la première fois, les matins ne sont plus une bataille. Les routines visuelles ont tout changé pour mon fils." },
      { name: "Dr. Eyenga Nkoa", role: "Orthophoniste", quote: "Le tableau de communication est l'expérience CAA la plus réfléchie que j'aie recommandée cette année." },
      { name: "Mireille Mbong", role: "Aidante", quote: "Cette simple question, comment allez-VOUS aujourd'hui, a changé ma façon de voir ma semaine." },
    ],
    faqEyebrow: "Vos questions, en douceur",
    faqTitle: "Avant de commencer.",
    faqs: [
      { q: "KUA est-il un outil médical ou de diagnostic ?", a: "Non. KUA est un compagnon calme pour le quotidien. Les outils de /tests sont réflexifs, pas cliniques, et nous renvoyons toujours vers des professionnels qualifiés." },
      { q: "Fonctionne-t-il en français ?", a: "Oui. Toute l'application — Aujourd'hui, Communication, Foi & Guidance, Aidant·e — bascule entre français et anglais depuis les Réglages, lecture vocale incluse." },
      { q: "Plusieurs enfants peuvent-ils partager un compte ?", a: "Oui. Ajoutez autant d'enfants que nécessaire depuis Aidant·e. Le changement d'enfant actif met à jour l'accueil, la routine, le profil et la croissance." },
      { q: "Les données de ma famille sont-elles privées ?", a: "Oui. Chaque entrée — humeurs, notes, lieux, résultats — est rattachée à votre compte avec sécurité au niveau ligne, et jamais partagée." },
      { q: "Combien ça coûte ?", a: "KUA est gratuit pour commencer. Des outils premium pourront s'ajouter, mais le compagnon central restera toujours accessible." },
    ],
    ctaTitle: "Commencer en douceur. Rester en douceur.",
    ctaLead: "Créez un profil enfant en quelques minutes et façonnez KUA au rythme de votre famille.",
    openToday: "Ouvrir mon Aujourd'hui",
    tryBoard: "Essayer le tableau",
    footerTag: "Un compagnon numérique apaisant pour les aidants et les enfants autistes.",
    footerCols: [
      { title: "Produit", links: [
        { label: "Aujourd'hui", to: "/today" }, { label: "Croissance", to: "/growth" },
        { label: "Communication", to: "/communication" }, { label: "Soutien", to: "/support" },
      ]},
      { title: "Soin", links: [
        { label: "Bien-être aidant·e", to: "/caregiver" }, { label: "Journal privé", to: "/vault" },
        { label: "Roue des émotions", to: "/wheel" }, { label: "Respiration", to: "/breathing" },
      ]},
      { title: "Explorer", links: [
        { label: "Carte de soutien", to: "/map" }, { label: "Petites victoires", to: "/wins" },
        { label: "Article : Grandes émotions", to: "/article/name-big-feelings" },
        { label: "Apprendre : Mathématiques", to: "/learn/mathematics" },
      ]},
    ],
    rights: "Conçu avec soin.",
  },
};

const featureIcons = [Heart, MessageCircle, Sprout, BookHeart, HeartHandshake, Sparkles];
const promiseIcons = [ShieldCheck, Languages, Moon, Volume2];
const stepIcons = [UserPlus, Compass, CalendarHeart, Sun];
const tileIcons = [Heart, MessageCircle, Sprout, Smile, BookOpen, MapIcon];
const tileTos = ["/today", "/communication", "/growth", "/wins", "/faith", "/map"];

function toneClasses(tone: string) {
  if (tone === "tertiary") return "bg-tertiary/10 text-tertiary";
  if (tone === "secondary") return "bg-secondary/20 text-secondary-foreground";
  return "bg-primary-soft text-primary";
}

function Landing() {
  const { lang } = usePrefs();
  const t = COPY[lang];
  const [affirmation, setAffirmation] = useState<string | null>(null);
  useEffect(() => {
    setAffirmation(null);
    aiHero(lang).then((r) => setAffirmation(r.text)).catch(() => {});
  }, [lang]);
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="absolute -left-20 top-20 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-breathe" />
        <div className="absolute -right-20 top-40 -z-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl animate-breathe" style={{ animationDelay: "1.5s" }} />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t.heroBadge}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t.heroLead}
            </p>
            {affirmation && (
              <div className="mt-5 inline-flex max-w-xl items-start gap-2 rounded-2xl border border-secondary/30 bg-gradient-warm px-4 py-3 text-sm font-medium leading-relaxed shadow-soft animate-fade-up">
                <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
                <span>"{affirmation}"</span>
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-gradient-primary px-7 text-base font-semibold text-primary-foreground shadow-glow hover:opacity-95">
                <Link to="/today">
                  {t.begin} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 rounded-full px-6 text-base">
                <Link to="/support">{t.exploreSupport}</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary" />)}
                <span className="ml-1">{t.builtWith}</span>
              </div>
              <span>{t.wcag}</span>
              <span>{t.bilingual}</span>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-warm blur-2xl opacity-70" />
            <div className="overflow-hidden rounded-[2rem] bg-card shadow-card">
              <img
                src={heroImg}
                alt="A caregiver and child sitting together surrounded by gentle illustrations"
                width={1536}
                height={1280}
                className="h-auto w-full"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border bg-card p-4 shadow-card md:block animate-float">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Heart className="h-4 w-4" /></span>
                <div>
                  <div className="text-xs text-muted-foreground">{t.todaysMood}</div>
                  <div className="text-sm font-semibold">{t.calmCurious}</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-8 hidden rounded-2xl border border-border bg-card p-4 shadow-card md:block animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/30 text-secondary-foreground"><Sparkles className="h-4 w-4" /></span>
                <div>
                  <div className="text-xs text-muted-foreground">{t.smallWin}</div>
                  <div className="text-sm font-semibold">{t.brushed}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULL-BLEED ACCENT BAR */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-2 bg-primary" />

      {/* ECOSYSTEMS STRIP */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-6 md:px-8">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.ecoLabel}</span>
          <div className="flex flex-wrap gap-3">
            {t.ecosystems.map((e) => (
              <span key={e} className="rounded-full bg-background px-4 py-1.5 text-sm font-medium text-foreground shadow-soft">{e}</span>
            ))}
          </div>
        </div>
      </section>

      {/* WHY KUA */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{t.whyTitle}</h2>
          <p className="mt-4 text-muted-foreground">{t.whyLead}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {t.features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <article
                key={f.title}
                className="group rounded-3xl border border-border/60 bg-card p-7 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${toneClasses(f.tone)}`}>
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ACCESSIBILITY PROMISE */}
      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.promiseEyebrow}</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{t.promiseTitle}</h2>
              <p className="mt-4 max-w-lg text-muted-foreground">{t.promiseLead}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {t.promises.map((p, i) => {
                const Icon = promiseIcons[i];
                return (
                  <div key={p.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="mt-3 text-sm font-semibold">{p.title}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.howEyebrow}</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{t.howTitle}</h2>
          <p className="mt-4 text-muted-foreground">{t.howLead}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((s, i) => {
            const Icon = stepIcons[i];
            return (
              <article
                key={s.title}
                className="relative rounded-3xl border border-border/60 bg-card p-7 shadow-soft animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* INSIDE KUA */}
      <section className="bg-gradient-warm py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.insideEyebrow}</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{t.insideTitle}</h2>
              <p className="mt-4 max-w-md text-muted-foreground">{t.insideLead}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link to="/communication">{t.openComm}</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link to="/faith">{t.faith}</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {t.tiles.map((tile, i) => {
                const Icon = tileIcons[i];
                return (
                  <Link
                    key={tile.label}
                    to={tileTos[i]}
                    className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClasses(tile.tone)}`}>
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{tile.label}</span>
                    <span className="mt-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition group-hover:text-primary">
                      {lang === "fr" ? "Ouvrir" : "Open"} <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{t.storiesTitle}</h2>
          <p className="mt-4 text-muted-foreground">{t.storiesLead}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3 md:pl-[8.333%]">
          {t.testimonials.map((tm) => (
            <figure key={tm.name} className="flex h-full flex-col rounded-3xl border border-border/60 bg-card p-7 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
              <div className="flex gap-1">{[...Array(5)].map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary"/>)}</div>
              <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/90">"{tm.quote}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/50 pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{tm.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground">{tm.name}</div>
                  <div className="text-xs text-muted-foreground">{tm.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.faqEyebrow}</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{t.faqTitle}</h2>
          </div>
          <div className="mt-10 space-y-3">
            {t.faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition open:shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-semibold text-foreground">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-primary p-10 text-primary-foreground shadow-glow md:p-16">
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-extrabold md:text-4xl">{t.ctaTitle}</h2>
              <p className="mt-3 max-w-lg text-primary-foreground/85">{t.ctaLead}</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild size="lg" className="h-12 rounded-full bg-card px-7 text-base font-semibold text-foreground hover:bg-card/90">
                <Link to="/today">{t.openToday}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 rounded-full bg-primary-foreground/10 px-7 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/20">
                <Link to="/communication">{t.tryBoard}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"><Heart className="h-4 w-4"/></span>
                <span className="font-display text-lg font-extrabold">KUA</span>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground max-w-xs">{t.footerTag}</p>
            </div>
            {t.footerCols.map((c) => (
              <div key={c.title}>
                <div className="text-sm font-semibold">{c.title}</div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="hover:text-foreground">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} KUA. {t.rights}</span>
            <span>EN · FR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
