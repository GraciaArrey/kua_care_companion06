import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, ShieldCheck, Sparkles, Printer, Loader2, History, TrendingUp, TrendingDown, Minus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ALL_TESTS, LIKERT, scoreTest, type TestDef, type ScoreResult } from "@/lib/tests-data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNames } from "@/lib/personalize";
import { useChildren } from "@/lib/children";
import { usePrefs } from "@/lib/prefs";
import { choiceLabel, questionText, testShort, testTitle, translateResult } from "@/lib/tests-i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/tests/$slug")({
  head: ({ params }) => {
    const t = ALL_TESTS.find((x) => x.slug === params.slug);
    const title = t ? `${t.title} - KUA` : "Test - KUA";
    const desc = t?.blurb ?? "Science-backed child screener.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: TestPage,
  notFoundComponent: () => (
    <AppShell title="Not found">
      <Link to="/tests" className="text-sm text-primary">Back to tests</Link>
    </AppShell>
  ),
});

type StoredResult = {
  id: string;
  slug: string;
  score_value: number;
  score_max: number;
  score_band: string;
  headline: string | null;
  summary: string | null;
  details: { label: string; value: number; max: number; note?: string }[];
  created_at: string;
};

function TestPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeChild } = useChildren();
  const { lang } = usePrefs();
  const names = useNames();
  const test = useMemo(() => ALL_TESTS.find((t) => t.slug === slug) as TestDef | undefined, [slug]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState<StoredResult[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load history on mount
  useEffect(() => {
    if (!user || !test) return;
    let q = supabase
      .from("test_results")
      .select("*")
      .eq("slug", test.slug)
      .order("created_at", { ascending: false })
      .limit(5);
    if (activeChild?.id) q = q.eq("child_id", activeChild.id);
    q.then(({ data }) => setHistory(((data ?? []) as unknown) as StoredResult[]));
  }, [user, test, activeChild?.id]);

  if (!test) {
    return (
      <AppShell title="Test not found" subtitle="That screener doesn't exist.">
        <Link to="/tests" className="text-sm text-primary">Back to tests</Link>
      </AppShell>
    );
  }

  const total = test.questions.length;
  const q = test.questions[step];
  const progress = Math.round(((done ? total : step) / total) * 100);

  const select = (value: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    if (step + 1 < total) {
      setTimeout(() => setStep(step + 1), 180);
    } else {
      setTimeout(() => setDone(true), 180);
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
    setSaved(false);
  };

  // Save once we hit the results screen
  const saveResult = async (result: ScoreResult) => {
    if (!user || saved || saving) return;
    setSaving(true);
    const primary = result.details[0];
    const value = test.slug === "asd" ? primary.value : Math.round(result.details.reduce((s, d) => s + d.value, 0) / result.details.length);
    const max = test.slug === "asd" ? primary.max : 100;
    const { data, error } = await supabase
      .from("test_results")
      .insert({
        user_id: user.id,
        child_id: activeChild?.id ?? null,
        slug: test.slug,
        score_value: value,
        score_max: max,
        score_band: result.band,
        headline: result.headline,
        summary: result.summary,
        answers,
        details: result.details,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error(lang === "fr" ? "Impossible d'enregistrer le résultat" : "Could not save result");
      return;
    }
    setSaved(true);
    toast.success(lang === "fr" ? "Résultat enregistré dans l'historique" : "Result saved to your history");
    setHistory((prev) => [(data as unknown) as StoredResult, ...prev].slice(0, 5));
  };

  if (done) {
    const result = translateResult(test, scoreTest(test, answers), lang);
    return (
      <ResultsView
        test={test}
        result={result}
        history={history}
        saving={saving}
        saved={saved}
        userKnown={!!user}
        lang={lang}
        childName={names.child}
        onSave={() => saveResult(result)}
        onRestart={restart}
        onAnother={() => navigate({ to: "/tests" })}
        onDeleteHistory={async (id) => {
          await supabase.from("test_results").delete().eq("id", id);
          setHistory((prev) => prev.filter((h) => h.id !== id));
        }}
      />
    );
  }

  return (
    <AppShell
      title={testTitle(test, lang)}
      subtitle={lang === "fr" ? `Question ${step + 1} sur ${total} - répondez selon la plupart des jours pour ${names.child}.` : `Question ${step + 1} of ${total} - answer the way that fits most days for ${names.child}.`}
    >
      <Link to="/tests" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {lang === "fr" ? "Tous les tests" : "All tests"}
      </Link>

      <div className="mb-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft md:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {test.emoji} {testShort(test, lang)}
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold leading-snug md:text-2xl">{questionText(test, q.id, q.text, lang)}</h2>

        <div className="mt-7 grid gap-3 sm:grid-cols-5">
          {LIKERT.map((c) => {
            const selected = answers[q.id] === c.value;
            return (
              <button
                key={c.value}
                onClick={() => select(c.value)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                  selected
                    ? "border-primary bg-primary-soft shadow-glow"
                    : "border-border/60 bg-background hover:-translate-y-0.5 hover:shadow-soft"
                }`}
              >
                <span className="text-3xl" aria-hidden>{c.emoji}</span>
                <span className="text-[11px] font-semibold leading-tight">{choiceLabel(c, lang)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-xs font-semibold hover:bg-muted/70 disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {lang === "fr" ? "Précédent" : "Previous"}
          </button>
          <span className="text-xs text-muted-foreground">{Object.keys(answers).length} {lang === "fr" ? "sur" : "of"} {total} {lang === "fr" ? "répondues" : "answered"}</span>
        </div>
      </section>

      <p className="mt-4 text-[11px] text-muted-foreground">{lang === "fr" ? "Source" : "Source"}: {test.source}</p>
    </AppShell>
  );
}

function ResultsView({
  test, result, history, saving, saved, userKnown, lang, childName,
  onSave, onRestart, onAnother, onDeleteHistory,
}: {
  test: TestDef;
  result: ScoreResult;
  history: StoredResult[];
  saving: boolean;
  saved: boolean;
  userKnown: boolean;
  lang: "en" | "fr";
  childName: string;
  onSave: () => void;
  onRestart: () => void;
  onAnother: () => void;
  onDeleteHistory: (id: string) => void;
}) {
  // Auto-save once
  useEffect(() => {
    if (userKnown && !saved && !saving) onSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bandColor =
    result.band === "elevated"
      ? "bg-tertiary/20 text-tertiary"
      : result.band === "moderate"
      ? "bg-secondary/30 text-secondary-foreground"
      : "bg-primary-soft text-primary";

  // Compare with previous attempt (history[0] is the just-saved one if saved)
  const prior = saved ? history[1] : history[0];
  const currentValue = test.slug === "asd"
    ? result.details[0].value
    : Math.round(result.details.reduce((s, d) => s + d.value, 0) / result.details.length);
  const delta = prior ? currentValue - Number(prior.score_value) : null;

  const handlePrint = () => window.print();

  return (
    <AppShell title={lang === "fr" ? `${testTitle(test, lang)} - résultats` : `${testTitle(test, lang)} - results`} subtitle={lang === "fr" ? `Un aperçu doux de ${childName}, pas un diagnostic.` : `A gentle snapshot of ${childName}, not a diagnosis.`}>
      <div className="print-hide">
        <Link to="/tests" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {lang === "fr" ? "Tous les tests" : "All tests"}
        </Link>
      </div>

      <section className="printable overflow-hidden rounded-3xl border border-border/60 bg-card p-7 shadow-soft md:p-10">
        <div className="print-only mb-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">KUA · {lang === "fr" ? "Rapport de dépistage" : "Screening report"}</div>
          <div className="mt-1 text-sm">{lang === "fr" ? "Pour" : "For"}: <strong>{childName}</strong> · Date: {new Date().toLocaleDateString()}</div>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${bandColor}`}>
          <Sparkles className="h-3 w-3" /> {testShort(test, lang)} {lang === "fr" ? "résultat" : "result"}
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight md:text-3xl">{result.headline}</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">{result.summary}</p>

        {delta !== null && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
            {delta === 0 ? <Minus className="h-3 w-3" /> : delta > 0 ? <TrendingUp className="h-3 w-3 text-tertiary" /> : <TrendingDown className="h-3 w-3 text-primary" />}
            {delta === 0
              ? (lang === "fr" ? "Comme la dernière fois" : "Same as last time")
              : lang === "fr"
                ? `${Math.abs(delta)} ${test.slug === "asd" ? "pt" : "%"} ${delta > 0 ? "plus haut" : "plus bas"} que la dernière fois`
                : `${Math.abs(delta)} ${test.slug === "asd" ? "pt" : "%"} ${delta > 0 ? "higher" : "lower"} than last attempt`}
            <span className="text-muted-foreground">· {new Date(prior!.created_at).toLocaleDateString()}</span>
          </div>
        )}

        <div className="mt-7 space-y-4">
          {result.details.map((d) => {
            const pct = Math.round((d.value / d.max) * 100);
            return (
              <div key={d.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold">{d.label}</span>
                  <span className="text-muted-foreground">
                    {d.value}{d.max === 100 ? "%" : ` / ${d.max}`}{d.note ? ` · ${d.note}` : ""}
                  </span>
                </div>
                <div className="progress-bar h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{result.disclaimer}</p>
        </div>

        <div className="print-only mt-6 text-[11px] text-muted-foreground">
          {lang === "fr" ? "Source" : "Source"}: {test.source}. {lang === "fr" ? "Généré par KUA. Usage éducatif uniquement - pas un diagnostic clinique." : "Generated by KUA. Educational use only - not a clinical diagnosis."}
        </div>
      </section>

      <div className="print-hide mt-6 flex flex-wrap gap-2">
        <button onClick={onRestart} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-xs font-semibold hover:bg-muted/70">
          <RotateCcw className="h-3.5 w-3.5" /> {lang === "fr" ? "Refaire" : "Retake"}
        </button>
        <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90">
          <Printer className="h-3.5 w-3.5" /> {lang === "fr" ? "Imprimer / PDF" : "Print / Save as PDF"}
        </button>
        {userKnown && !saved && (
          <button disabled={saving} onClick={onSave} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {lang === "fr" ? "Enregistrer" : "Save to history"}
          </button>
        )}
        <button onClick={onAnother} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-xs font-semibold hover:bg-muted/70">
          {lang === "fr" ? "Essayer un autre test" : "Try another test"} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* History & comparison */}
      {userKnown && history.length > 0 && (
        <section className="print-hide mt-10 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary"><History className="h-4 w-4" /></span>
            <div>
              <h3 className="font-display text-lg font-bold">{lang === "fr" ? "Essais précédents" : "Past attempts"}</h3>
              <p className="text-xs text-muted-foreground">{lang === "fr" ? `Comparez l'évolution du dépistage de ${childName}.` : `Compare how ${childName}'s screener has shifted over time.`}</p>
            </div>
          </div>
          <ul className="divide-y divide-border/60">
            {history.map((h) => {
              const pct = h.score_max ? Math.round((Number(h.score_value) / Number(h.score_max)) * 100) : 0;
              return (
                <li key={h.id} className="flex items-center gap-4 py-3">
                  <div className="w-24 shrink-0 text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold">{h.headline ?? `${h.score_value}/${h.score_max}`}</span>
                      <span className="text-muted-foreground">{h.score_value}{test.slug === "asd" ? `/${h.score_max}` : "%"} · {h.score_band}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                  <button onClick={() => onDeleteHistory(h.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!userKnown && (
        <p className="print-hide mt-6 text-xs text-muted-foreground">
          <Link to="/signin" className="font-semibold text-primary hover:underline">{lang === "fr" ? "Connectez-vous" : "Sign in"}</Link> {lang === "fr" ? "pour enregistrer les résultats et comparer avec le temps." : "to save results and compare over time."}
        </p>
      )}

      <p className="print-hide mt-4 text-[11px] text-muted-foreground">{lang === "fr" ? "Source" : "Source"}: {test.source}</p>
    </AppShell>
  );
}
