import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowLeft, Clock, Sparkles, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ALL_TESTS } from "@/lib/tests-data";
import { PersonalLine } from "@/lib/personalize";
import { usePrefs } from "@/lib/prefs";
import { testBlurb, testTitle } from "@/lib/tests-i18n";

export const Route = createFileRoute("/tests")({
  head: () => ({
    meta: [
      { title: "Child screening tests - KUA" },
      {
        name: "description",
        content:
          "Three short, science-backed screeners for caregivers: AQ-10 autism screen, Big Five personality, and an executive-function checklist.",
      },
      { property: "og:title", content: "Child screening tests - KUA" },
      {
        property: "og:description",
        content: "Calm, science-backed screeners - autism (AQ-10), Big Five personality and executive function.",
      },
    ],
  }),
  component: TestsIndex,
});

function TestsIndex() {
  const { lang } = usePrefs();
  const location = useLocation();
  if (location.pathname !== "/tests") return <Outlet />;

  return (
    <AppShell
      title={lang === "fr" ? "Tests" : "Tests"}
      subtitle={lang === "fr" ? "Trois courts dépistages scientifiques pour les aidants - doux, jamais diagnostiques." : "Three short, science-backed screeners for caregivers - gentle, never diagnostic."}
    >
      <Link to="/support" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {lang === "fr" ? "Retour au soutien" : "Back to Support Hub"}
      </Link>
      <PersonalLine pool="tests" className="mb-6" />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/15 p-4 text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
        <p className="text-muted-foreground">
          {lang === "fr" ? (
            <>Ces dépistages sont <strong>éducatifs</strong>, pas diagnostiques. Ils aident à remarquer des tendances. Pour un avis clinique, consultez un professionnel qualifié.</>
          ) : (
            <>These screeners are <strong>educational</strong>, not diagnostic. They help you notice patterns. For a clinical opinion, please consult a qualified professional.</>
          )}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {ALL_TESTS.map((t) => (
          <Link
            key={t.slug}
            to="/tests/$slug"
            params={{ slug: t.slug }}
            className="group flex flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-2xl">{t.emoji}</span>
            <h3 className="mt-4 font-display text-lg font-bold leading-snug">{testTitle(t, lang)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{testBlurb(t, lang)}</p>
            <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {t.estMinutes} min · {t.questions.length} {lang === "fr" ? "questions" : "questions"}
              </span>
              <span className="font-semibold text-primary group-hover:underline">{lang === "fr" ? "Commencer" : "Begin"} →</span>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3 w-3" /> {t.source}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
