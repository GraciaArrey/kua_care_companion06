import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Headphones, Pause, Play, Square } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { articleBySlug, articleForLang, articlesForLang, type Article } from "@/lib/kua-content";
import { useTTS } from "@/lib/tts";
import { usePrefs } from "@/lib/prefs";
import { supabase } from "@/integrations/supabase/client";

type LoadedArticle = Article & { _fr?: { title?: string; excerpt?: string; body?: string[] } };

async function loadArticle(slug: string): Promise<LoadedArticle | null> {
  const stat = articleBySlug(slug);
  if (stat) return stat as LoadedArticle;
  const { data } = await supabase
    .from("blog_posts")
    .select("slug,title_en,title_fr,category,read_minutes,excerpt_en,excerpt_fr,body_en,body_fr")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!data) return null;
  return {
    slug: data.slug,
    title: data.title_en,
    category: data.category,
    read: data.read_minutes,
    excerpt: data.excerpt_en ?? "",
    body: data.body_en ?? [],
    _fr: {
      title: data.title_fr ?? undefined,
      excerpt: data.excerpt_fr ?? undefined,
      body: data.body_fr && data.body_fr.length > 0 ? data.body_fr : undefined,
    },
  };
}

export const Route = createFileRoute("/article/$slug")({
  head: ({ loaderData }) => {
    const a = (loaderData as { article?: Article } | undefined)?.article;
    return { meta: [{ title: `${a?.title ?? "Article"} - KUA` }, { name: "description", content: a?.excerpt ?? "" }] };
  },
  loader: async ({ params }) => {
    const a = await loadArticle(params.slug);
    if (!a) throw notFound();
    return { article: a };
  },
  notFoundComponent: () => (
    <AppShell title="Article not found">
      <Link to="/support" className="text-primary hover:underline">← Back to Support Hub</Link>
    </AppShell>
  ),
  errorComponent: ({ error }) => <AppShell title="Something went wrong"><p className="text-muted-foreground">{error.message}</p></AppShell>,
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData() as { article: LoadedArticle };
  const { lang, voiceRate } = usePrefs();
  const { speak, pause, resume, stop, status, supported } = useTTS(lang, voiceRate);
  const fr = article._fr;
  const base = articleForLang(article, lang);
  const localizedArticle: Article = fr && lang === "fr"
    ? { ...base, title: fr.title ?? base.title, excerpt: fr.excerpt ?? base.excerpt, body: fr.body ?? base.body }
    : base;
  const related = articlesForLang(lang).filter((a) => a.category === localizedArticle.category && a.slug !== localizedArticle.slug).slice(0, 3);
  const fullText = `${localizedArticle.title}. ${localizedArticle.body.join(" ")}`;

  return (
    <AppShell title={localizedArticle.title} subtitle={localizedArticle.excerpt}>
      <Link to="/support" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {lang === "fr" ? "Retour au centre de soutien" : "Back to Support Hub"}
      </Link>

      <article className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft md:p-10">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary-soft px-3 py-1 font-semibold text-primary">{localizedArticle.category}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {localizedArticle.read} min {lang === "fr" ? "de lecture" : "read"}</span>
          {supported && (
            <div className="flex items-center gap-1.5" role="group" aria-label={lang === "fr" ? "Contrôles d'écoute" : "Listen controls"}>
              {status === "idle" && (
                <button onClick={() => speak(fullText)} className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground hover:opacity-90">
                  <Headphones className="h-3 w-3" /> {lang === "fr" ? "Écouter" : "Listen"}
                </button>
              )}
              {status === "speaking" && (
                <button onClick={pause} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold hover:bg-muted/70" aria-label={lang === "fr" ? "Mettre l'écoute en pause" : "Pause listening"}>
                  <Pause className="h-3 w-3" /> Pause
                </button>
              )}
              {status === "paused" && (
                <button onClick={resume} className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground hover:opacity-90" aria-label={lang === "fr" ? "Reprendre l'écoute" : "Resume listening"}>
                  <Play className="h-3 w-3" /> {lang === "fr" ? "Reprendre" : "Resume"}
                </button>
              )}
              {status !== "idle" && (
                <button onClick={stop} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold hover:bg-muted/70" aria-label={lang === "fr" ? "Arrêter l'écoute" : "Stop listening"}>
                  <Square className="h-3 w-3" /> {lang === "fr" ? "Arrêter" : "Stop"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="prose prose-neutral mt-6 max-w-none">
          {localizedArticle.body.map((p, i) => (
            <p key={i} className="mt-4 text-base leading-relaxed text-foreground/90">{p}</p>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-4 font-display text-lg font-bold">{lang === "fr" ? `Plus sur ${localizedArticle.category}` : `More on ${localizedArticle.category}`}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} to="/article/$slug" params={{ slug: r.slug }} className="group rounded-3xl border border-border/60 bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
                <h4 className="font-display text-base font-bold leading-snug">{r.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                <div className="mt-4 text-xs font-semibold text-primary group-hover:underline">{lang === "fr" ? "Lire" : "Read"} →</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
