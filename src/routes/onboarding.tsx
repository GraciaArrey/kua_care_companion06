import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, HeartHandshake, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useAuth, type CaregiverRole } from "@/lib/auth";
import { useChildren } from "@/lib/children";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome to KUA" }] }),
  component: OnboardingPage,
});

const ROLES: { key: CaregiverRole; label: string; emoji: string }[] = [
  { key: "mom", label: "Mom", emoji: "🌸" },
  { key: "dad", label: "Dad", emoji: "🌟" },
  { key: "sibling", label: "Sibling", emoji: "🌈" },
  { key: "caregiver", label: "Caregiver", emoji: "💛" },
];

const OBJECTIVES = [
  { key: "communication", label: "Help my child communicate", emoji: "💬" },
  { key: "emotions", label: "Understand emotions together", emoji: "💖" },
  { key: "routines", label: "Build calmer routines", emoji: "🌿" },
  { key: "milestones", label: "Track growth and milestones", emoji: "🌱" },
  { key: "selfcare", label: "Care for myself as a caregiver", emoji: "🫖" },
  { key: "community", label: "Find resources and community", emoji: "🤝" },
];

type ChildDraft = { name: string; preferred: string };

function OnboardingPage() {
  const { user, profile, loading, updateProfile, refreshProfile } = useAuth();
  const { addChild, refresh: refreshChildren } = useChildren();
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<CaregiverRole>("mom");
  const [caregiverName, setCaregiverName] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [drafts, setDrafts] = useState<ChildDraft[]>([{ name: "", preferred: "" }]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/signin" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (profile?.caregiver_name) setCaregiverName(profile.caregiver_name);
    if (profile?.caregiver_role) setRole(profile.caregiver_role);
  }, [profile?.caregiver_name, profile?.caregiver_role]);

  useEffect(() => {
    setDrafts((cur) => {
      const next = [...cur];
      while (next.length < count) next.push({ name: "", preferred: "" });
      while (next.length > count) next.pop();
      return next;
    });
  }, [count]);

  const toggleObj = (k: string) =>
    setObjectives((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (!caregiverName.trim()) return toast.error("Please enter your name");
    const cleaned = drafts.map((d) => ({ name: d.name.trim(), preferred: d.preferred.trim() })).filter((d) => d.name);
    if (cleaned.length === 0) return toast.error("Please add at least one child");
    setBusy(true);

    // Create children
    const created: { id: string; name: string }[] = [];
    for (const c of cleaned) {
      const row = await addChild({ name: c.name, preferred_name: c.preferred || c.name });
      if (row) created.push({ id: row.id, name: c.preferred || c.name });
    }

    await updateProfile({
      caregiver_name: caregiverName.trim(),
      caregiver_role: role,
      caregiver_objectives: objectives,
      child_name: cleaned[0]?.preferred || cleaned[0]?.name || null,
      preferred_name: cleaned[0]?.preferred || cleaned[0]?.name || null,
      active_child_id: created[0]?.id ?? null,
      onboarded: true,
    } as any);

    await refreshProfile();
    await refreshChildren();
    setBusy(false);
    toast.success(`Welcome, ${caregiverName.trim()} ✨`);
    nav({ to: "/today" });
  };

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const steps = ["You", "Goals", "Children", "Confirm"];

  return (
    <div className="min-h-screen bg-gradient-hero p-4 py-10">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-border/60 bg-card p-8 shadow-card">
        <div className="flex items-center justify-between">
          <Logo size={40} withWordmark />
          <span className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span>
        </div>

        <div className="mt-4 flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <h1 className="mt-6 font-display text-2xl font-extrabold inline-flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" />
          {step === 0 && "Tell us a little about you"}
          {step === 1 && "What do you hope KUA helps with?"}
          {step === 2 && "Now, your children"}
          {step === 3 && "All set?"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 0 && "We'll personalise KUA for you and your family."}
          {step === 1 && "Pick as many as feel right. You can change these later."}
          {step === 2 && "Each child becomes their own profile inside KUA."}
          {step === 3 && "You can update everything later in Settings."}
        </p>

        {step === 0 && (
          <div className="mt-6 space-y-5">
            <div>
              <span className="mb-2 block text-xs font-semibold text-muted-foreground">I am a...</span>
              <div className="grid grid-cols-4 gap-2">
                {ROLES.map((r) => (
                  <button key={r.key} type="button" onClick={() => setRole(r.key)}
                    className={`rounded-2xl border px-2 py-3 text-xs font-semibold transition ${
                      role === r.key ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-background hover:border-primary/40"
                    }`}>
                    <div className="text-lg leading-none">{r.emoji}</div>
                    <div className="mt-1">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">Your name</span>
              <input value={caregiverName} onChange={(e) => setCaregiverName(e.target.value)} placeholder="e.g. Amina"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {OBJECTIVES.map((o) => {
              const on = objectives.includes(o.key);
              return (
                <button key={o.key} type="button" onClick={() => toggleObj(o.key)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    on ? "border-primary bg-primary-soft text-foreground" : "border-border bg-background hover:border-primary/40"
                  }`}>
                  <span className="text-xl">{o.emoji}</span>
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">How many children?</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} type="button" onClick={() => setCount(n)}
                    className={`h-11 w-11 rounded-2xl border text-sm font-bold transition ${
                      count === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"
                    }`}>{n}</button>
                ))}
                <button type="button" onClick={() => setCount((c) => c + 1)}
                  className="inline-flex h-11 items-center gap-1 rounded-2xl border border-border bg-background px-3 text-sm hover:border-primary/40">
                  <Plus className="h-3.5 w-3.5" /> add
                </button>
              </div>
            </label>
            <div className="space-y-3">
              {drafts.map((d, i) => (
                <div key={i} className="rounded-2xl border border-border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Child {i + 1}</span>
                    {drafts.length > 1 && (
                      <button type="button" onClick={() => { setDrafts((arr) => arr.filter((_, idx) => idx !== i)); setCount((c) => Math.max(1, c - 1)); }}
                        className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                        <Trash2 className="h-3 w-3" /> remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input value={d.name} onChange={(e) => setDrafts((arr) => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                      placeholder="Full name" className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
                    <input value={d.preferred} onChange={(e) => setDrafts((arr) => arr.map((x, idx) => idx === i ? { ...x, preferred: e.target.value } : x))}
                      placeholder="Preferred name (optional)" className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-3 text-sm">
            <Row label="You" value={`${caregiverName || "(unnamed)"} - ${ROLES.find((r) => r.key === role)?.label}`} />
            <Row label="Goals" value={objectives.length ? objectives.map((k) => OBJECTIVES.find((o) => o.key === k)?.label).join(", ") : "(none picked)"} />
            <Row label="Children" value={drafts.filter((d) => d.name.trim()).map((d) => d.preferred || d.name).join(", ") || "(none yet)"} />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button onClick={back} disabled={step === 0} className="text-sm text-muted-foreground disabled:opacity-30 hover:text-foreground">Back</button>
          {step < 3 ? (
            <button onClick={next} className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={finish} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Finish setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background p-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}
