import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/prefs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { GoogleButton } from "@/components/GoogleButton";

export const Route = createFileRoute("/signin")({
  validateSearch: (s) => ({ redirect: (s.redirect as string) || "/today" }),
  head: () => ({ meta: [{ title: "Sign in - KUA" }] }),
  component: SignInPage,
});

function SignInPage() {
  const t = useT();
  const { signIn } = useAuth();
  const nav = useNavigate();
  const search = useSearch({ from: "/signin" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfa, setMfa] = useState<{ factorId: string; challengeId: string } | null>(null);
  const [code, setCode] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await signIn(email, password);
    setBusy(false);
    if (r.error) return toast.error(r.error);
    if (r.mfaRequired) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (!totp) return toast.error("No 2FA factor found");
      const { data: ch, error } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (error || !ch) return toast.error(error?.message || "MFA challenge failed");
      setMfa({ factorId: totp.id, challengeId: ch.id });
      return;
    }
    toast.success("Welcome back ✨");
    nav({ to: search.redirect });
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfa) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.verify({ ...mfa, code });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back ✨");
    nav({ to: search.redirect });
  };

  return (
    <div className="min-h-screen bg-gradient-hero grid place-items-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-card">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={40} withWordmark />
        </Link>
        <h1 className="mt-6 font-display text-2xl font-extrabold">{mfa ? t("twoFactor") : t("welcomeBack")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mfa ? t("enterCode") : "Sign in to continue."}</p>

        {!mfa ? (
          <>
            <div className="mt-6">
              <GoogleButton label="Sign in with Google" />
            </div>
            <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={submit} className="space-y-4">
              <Field label={t("email")} type="email" value={email} onChange={setEmail} />
              <Field label={t("password")} type="password" value={password} onChange={setPassword} />
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} {busy ? t("signingIn") : t("signIn")}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={verify} className="mt-6 space-y-4">
            <input
              autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric" pattern="[0-9]{6}" placeholder="123456"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center text-2xl tracking-[0.4em] font-bold outline-none focus:border-primary"
            />
            <button disabled={busy || code.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
              {t("verify")}
            </button>
          </form>
        )}

        <Link to="/signup" className="mt-6 block text-center text-sm text-primary hover:underline">
          {t("needAccount")}
        </Link>
        <div className="mt-4 flex justify-center gap-4 text-[11px] text-muted-foreground">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        required type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
