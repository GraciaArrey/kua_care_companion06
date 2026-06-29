import { Link, useRouterState } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/useIsAdmin";
import { useT } from "@/lib/prefs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

const links = [
  { to: "/today", label: "Today" },
  { to: "/growth", label: "Growth" },
  { to: "/communication", label: "Communication" },
  { to: "/support", label: "Support" },
  { to: "/caregiver", label: "Caregiver" },
] as const;

export function AppHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const t = useT();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="font-display text-xl font-extrabold tracking-tight">KUA</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = path.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary-soft text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>{l.label}</Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdmin && (
            <Button asChild variant="ghost" className="hidden sm:inline-flex rounded-full gap-1.5">
              <Link to="/admin"><Shield className="h-4 w-4" /> Admin</Link>
            </Button>
          )}
          {user ? (
            <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <Link to="/today">{t("openKua")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex rounded-full">
                <Link to="/signin" search={{ redirect: "/today" }}>{t("signIn")}</Link>
              </Button>
              <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
                <Link to="/signup" search={{ redirect: "/today" }}>{t("openKua")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
