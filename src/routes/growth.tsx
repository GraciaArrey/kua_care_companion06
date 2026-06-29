import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageCircle, HeartHandshake, Users, Backpack, Brain, GraduationCap, Activity,
  Calculator, Globe2, Leaf, Landmark, Palette, Music, Trophy, BookOpen, Languages, PencilLine, Apple, Scale,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PersonalLine, useNames } from "@/lib/personalize";
import learningPathsImg from "@/assets/learning-paths.jpg";
import { richSubjects, pickLang } from "@/lib/subjects-content";
import { usePrefs } from "@/lib/prefs";

export const Route = createFileRoute("/growth")({
  head: () => ({ meta: [{ title: "Growth - KUA" }, { name: "description", content: "Developmental milestones celebrated, never graded - for children 12 and under." }] }),
  component: GrowthPage,
});

const journeysEn = [
  { slug: "communication", icon: MessageCircle, title: "Communication", progress: 64, milestones: 12, done: 7, tone: "primary" },
  { slug: "emotional-regulation", icon: HeartHandshake, title: "Emotional Regulation", progress: 48, milestones: 10, done: 5, tone: "tertiary" },
  { slug: "social-skills", icon: Users, title: "Social Skills", progress: 32, milestones: 8, done: 3, tone: "secondary" },
  { slug: "independence", icon: Backpack, title: "Independence", progress: 70, milestones: 9, done: 6, tone: "primary" },
  { slug: "cognitive-skills", icon: Brain, title: "Cognitive Skills", progress: 41, milestones: 11, done: 4, tone: "tertiary" },
  { slug: "physical-coordination", icon: Activity, title: "Physical Coordination", progress: 55, milestones: 7, done: 4, tone: "secondary" },
];

const journeysFr: Record<string, string> = {
  "communication": "Communication",
  "emotional-regulation": "Régulation émotionnelle",
  "social-skills": "Habiletés sociales",
  "independence": "Autonomie",
  "cognitive-skills": "Habiletés cognitives",
  "physical-coordination": "Coordination physique",
};

const subjectIcons: Record<string, any> = {
  "languages": Languages, "arithmetic": Calculator, "writing": PencilLine, "reading": BookOpen,
  "art": Palette, "music": Music, "pe": Trophy, "health-education": Apple,
  "civics": Scale, "cultural-studies": Landmark, "geography": Globe2, "environmental-science": Leaf,
};

function tone(t: string) {
  if (t === "tertiary") return "from-tertiary/15 to-tertiary/5 text-tertiary";
  if (t === "secondary") return "from-secondary/30 to-secondary/10 text-secondary-foreground";
  return "from-primary/20 to-primary/5 text-primary";
}

function Ring({ value, color }: { value: number; color: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (value / 100) * c}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" className="fill-foreground text-[14px] font-bold">{value}%</text>
    </svg>
  );
}

const ringColors: Record<string, string> = {
  primary: "var(--color-primary)",
  tertiary: "var(--color-tertiary)",
  secondary: "oklch(0.85 0.13 85)",
};

function GrowthPage() {
  const names = useNames();
  const { lang } = usePrefs();

  const ui = lang === "fr"
    ? {
        title: `Parcours de croissance de ${names.child}`,
        subtitle: "Étapes en communication, régulation, apprentissage et autonomie — célébrées, jamais notées.",
        milestonesCelebrated: (a: number, b: number) => `${a} sur ${b} étapes célébrées`,
        openJourney: "Ouvrir le parcours",
        learningTitle: "Parcours d'apprentissage formels",
        learningSub: "Micro-leçons sensorielles adaptées aux apprenants du primaire (5–12 ans).",
      }
    : {
        title: `${names.child}'s growth journey`,
        subtitle: "Milestones across communication, regulation, learning and independence - celebrated, never graded.",
        milestonesCelebrated: (a: number, b: number) => `${a} of ${b} milestones celebrated`,
        openJourney: "Open journey",
        learningTitle: "Formal learning paths",
        learningSub: "Sensory-friendly micro-lessons and printables, shaped for primary-school learners (ages 5–12).",
      };

  return (
    <AppShell title={ui.title} subtitle={ui.subtitle}>
      <PersonalLine pool="growth" className="mb-6" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {journeysEn.map((j) => {
          const title = lang === "fr" ? journeysFr[j.slug] ?? j.title : j.title;
          return (
            <article key={j.slug} className={`rounded-3xl border border-border/60 bg-gradient-to-br ${tone(j.tone)} p-6 shadow-soft transition hover:-translate-y-0.5`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-card shadow-soft">
                    <j.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{ui.milestonesCelebrated(j.done, j.milestones)}</p>
                </div>
                <Ring value={j.progress} color={ringColors[j.tone]} />
              </div>

              <div className="mt-5 flex items-center gap-1.5">
                {Array.from({ length: j.milestones }).map((_, i) => (
                  <span key={i} className={`h-2 flex-1 rounded-full ${i < j.done ? "bg-foreground/70" : "bg-card/70"}`} />
                ))}
              </div>

              <Link
                to="/journey/$slug"
                params={{ slug: j.slug }}
                className="mt-5 inline-block rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-foreground shadow-soft hover:opacity-90"
              >
                {ui.openJourney}
              </Link>
            </article>
          );
        })}
      </div>

      <section className="mt-10 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
        <div className="relative h-44 w-full overflow-hidden sm:h-56">
          <img
            src={learningPathsImg}
            alt="A primary-school desk with open notebooks, colored pencils, a globe and workbooks"
            loading="lazy"
            width={1536}
            height={768}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold">{ui.learningTitle}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{ui.learningSub}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {richSubjects.map((s) => {
              const Icon = subjectIcons[s.slug] ?? BookOpen;
              return (
                <Link
                  key={s.slug}
                  to="/learn/$slug"
                  params={{ slug: s.slug }}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4 text-left transition hover:bg-muted"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-tight break-words">{pickLang(s.title, lang)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
