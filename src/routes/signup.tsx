import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, HeartHandshake } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/prefs";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { GoogleButton } from "@/components/GoogleButton";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your KUA account" }] }),
  component: SignUpPage,
});

function SignUpPage() {
  const t = useT();
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signUp(email, password, {
      caregiverName: "",
      caregiverRole: "caregiver",
      childName: "",
    });
    setBusy(false);
    if (error) return toast.error(error);
    toast.success("Welcome to KUA ✨");
    nav({ to: "/onboarding" });
  };

  return (
    <div className="min-h-screen bg-gradient-hero grid place-items-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-card">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={40} withWordmark />
        </Link>
        <h1 className="mt-6 font-display text-2xl font-extrabold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1.5">
          <HeartHandshake className="h-3.5 w-3.5 text-primary" />
          We'll personalise everything in the next step.
        </p>

        <div className="mt-6">
          <GoogleButton label="Sign up with Google" />
        </div>
        <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">{t("email")}</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">{t("password")} (min 8)</span>
            <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </label>

          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} {busy ? t("signingUp") : t("createAccount")}
          </button>
        </form>

        <Link to="/signin" className="mt-6 block text-center text-sm text-primary hover:underline">
          {t("haveAccount")}
        </Link>
        <div className="mt-4 flex justify-center gap-4 text-[11px] text-muted-foreground">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </div>
      </div>
    </div>
  );
}
