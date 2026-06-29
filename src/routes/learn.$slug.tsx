import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, BookOpen, Sparkles, Lightbulb, ListChecks } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  richSubjectBySlug,
  richSubjects,
  pickLang,
  pickList,
  type RichSubject,
  type Topic,
} from "@/lib/subjects-content";
import { usePrefs } from "@/lib/prefs";
import { supabase } from "@/integrations/supabase/client";

type DbTopic = {
  title_en: string;
  title_fr?: string;
  minutes: number;
  definition_en: string;
  definition_fr?: string;
  explanation_en: string;
  explanation_fr?: string;
  examples_en: string[];
  examples_fr?: string[];
};

function topicFromDb(t: DbTopic): Topic {
  return {
    title: { en: t.title_en, fr: t.title_fr || t.title_en },
    definition: { en: t.definition_en, fr: t.definition_fr || t.definition_en },
    explanation: { en: t.explanation_en, fr: t.explanation_fr || t.explanation_en },
    examples: { en: t.examples_en ?? [], fr: t.examples_fr && t.examples_fr.length > 0 ? t.examples_fr : (t.examples_en ?? []) },
    minutes: t.minutes ?? 5,
  };
}

async function loadSubject(slug: string): Promise<RichSubject | null> {
  const stat = richSubjectBySlug(slug);
  if (stat) return stat;
  const { data } = await supabase
    .from("lesson_notes")
    .select("slug,title_en,title_fr,blurb_en,blurb_fr,topics")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!data) return null;
  const topics = Array.isArray(data.topics) ? (data.topics as unknown as DbTopic[]) : [];
  return {
    slug: data.slug,
    title: { en: data.title_en, fr: data.title_fr || data.title_en },
    blurb: { en: data.blurb_en ?? "", fr: data.blurb_fr || data.blurb_en || "" },
    topics: topics.map(topicFromDb),
  };
}

export const Route = createFileRoute("/learn/$slug")({
  head: ({ loaderData }) => {
    const s = (loaderData as { subject?: RichSubject } | undefined)?.subject;
    return {
      meta: [
        { title: `${s?.title.en ?? "Learn"} - KUA` },
        { name: "description", content: s?.blurb.en ?? "" },
      ],
    };
  },
  loader: async ({ params }) => {
    const s = await loadSubject(params.slug);
    if (!s) throw notFound();
    return { subject: s };
  },
  notFoundComponent: () => (
    <AppShell title="Subject not found">
      <Link to="/growth" className="text-primary hover:underline">← Back to Growth</Link>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell title="Something went wrong">
      <p className="text-muted-foreground">{error.message}</p>
    </AppShell>
  ),
  component: LearnPage,
});

function LearnPage() {
  const { subject } = Route.useLoaderData() as { subject: RichSubject };
  const { lang } = usePrefs();

  const labels = lang === "fr"
    ? { back: "← Retour à Croissance", topics: "Sujets", topic: "Sujet", definition: "Définition", explanation: "Explication", examples: "Exemples", min: "min", other: "Autres matières" }
    : { back: "← Back to Growth", topics: "Topics", topic: "Topic", definition: "Definition", explanation: "Explanation", examples: "Examples", min: "min", other: "Other subjects" };

  return (
    <AppShell title={pickLang(subject.title, lang)} subtitle={pickLang(subject.blurb, lang)}>
      <Link to="/growth" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {labels.back}
      </Link>

      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
        <BookOpen className="h-3.5 w-3.5" /> {subject.topics.length} {labels.topics}
      </div>

      <section className="grid gap-5">
        {subject.topics.map((t, i) => (
          <article key={i} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <header className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft font-display text-base font-bold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold leading-snug">{pickLang(t.title, lang)}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {t.minutes} {labels.min}
                </div>
              </div>
            </header>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-background p-4">
                <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> {labels.definition}
                </div>
                <p className="text-sm leading-relaxed text-foreground">{pickLang(t.definition, lang)}</p>
              </div>
              <div className="rounded-2xl bg-background p-4">
                <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Lightbulb className="h-3.5 w-3.5" /> {labels.explanation}
                </div>
                <p className="text-sm leading-relaxed text-foreground">{pickLang(t.explanation, lang)}</p>
              </div>
              <div className="rounded-2xl bg-background p-4">
                <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <ListChecks className="h-3.5 w-3.5" /> {labels.examples}
                </div>
                <ul className="space-y-1.5 text-sm leading-relaxed text-foreground">
                  {pickList(t.examples, lang).map((ex, j) => (
                    <li key={j} className="flex gap-2"><span className="text-primary">•</span><span>{ex}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">{labels.other}</h3>
        <div className="flex flex-wrap gap-2">
          {richSubjects.filter((s) => s.slug !== subject.slug).map((s) => (
            <Link key={s.slug} to="/learn/$slug" params={{ slug: s.slug }} className="rounded-full bg-muted px-4 py-2 text-xs font-semibold hover:bg-primary-soft hover:text-primary">
              {pickLang(s.title, lang)}
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
