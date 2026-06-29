import { Link, useRouterState } from "@tanstack/react-router";
import {
  Settings, User, Menu, Languages, Sparkles, LogIn,
} from "lucide-react";
import { useState } from "react";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { usePrefs, useT, type DictKey } from "@/lib/prefs";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/useIsAdmin";
import { Logo } from "./Logo";
import { SignOutDialog } from "./SignOutDialog";
import { Sun, Sprout, MessageCircle, BookHeart, HeartHandshake, Heart, Shield } from "lucide-react";

const nav: { to: string; key: DictKey; icon: any; hintKey: DictKey }[] = [
  { to: "/today", key: "today", icon: Sun, hintKey: "navHintToday" },
  { to: "/growth", key: "growth", icon: Sprout, hintKey: "navHintGrowth" },
  { to: "/communication", key: "communication", icon: MessageCircle, hintKey: "navHintCommunication" },
  { to: "/support", key: "support", icon: BookHeart, hintKey: "navHintSupport" },
  { to: "/caregiver", key: "caregiver", icon: HeartHandshake, hintKey: "navHintCaregiver" },
];

const secondary: { to: string; key: DictKey; icon: any }[] = [
  { to: "/profile", key: "profile", icon: User },
  { to: "/settings", key: "settings", icon: Settings },
];

function LangSwitch() {
  const { lang, setLang } = usePrefs();
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted p-1 text-[11px] font-semibold">
      <button onClick={() => setLang("en")} className={`rounded-full px-2.5 py-1 ${lang === "en" ? "bg-card shadow-soft" : "text-muted-foreground"}`} aria-pressed={lang === "en"}>EN</button>
      <button onClick={() => setLang("fr")} className={`rounded-full px-2.5 py-1 ${lang === "fr" ? "bg-card shadow-soft" : "text-muted-foreground"}`} aria-pressed={lang === "fr"}>FR</button>
    </div>
  );
}

function CalmToggle() {
  const { calm, setCalm } = usePrefs();
  const t = useT();
  return (
    <div className="rounded-2xl bg-gradient-warm p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
        <Sparkles className="h-3.5 w-3.5" /> {t("calmMode")}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{t("calmHint")}</p>
      <button
        onClick={() => setCalm(!calm)}
        className={`mt-3 w-full rounded-full px-3 py-1.5 text-xs font-semibold shadow-soft transition ${
          calm ? "bg-foreground text-background" : "bg-card hover:opacity-90"
        }`}
        aria-pressed={calm}
      >
        {calm ? t("turnOff") : t("turnOn")}
      </button>
    </div>
  );
}

function NavList({ onPick }: { onPick?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, key, icon: Icon, hintKey }) => {
        const active = path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onPick}
            className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
              active ? "bg-primary-soft text-accent-foreground shadow-soft" : "text-foreground/80 hover:bg-muted"
            }`}
          >
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-card text-primary shadow-soft" : "bg-muted text-muted-foreground group-hover:text-foreground"}`}>
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{t(key)}</div>
              <div className="text-[11px] text-muted-foreground">{t(hintKey)}</div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [signOutOpen, setSignOutOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex w-full max-w-[1480px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-border/60 bg-sidebar p-5 md:flex">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <Logo size={40} />
            <div className="leading-tight">
              <div className="font-display text-xl font-extrabold tracking-tight">KUA</div>
              <div className="text-[11px] text-muted-foreground">Calm companion</div>
            </div>
          </Link>

          <NavList />

          <div className="mt-8 border-t border-border/60 pt-4">
            {secondary.map(({ to, key, icon: Icon }) => (
              <Link key={key} to={to} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <Icon className="h-4 w-4" />
                {t(key)}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
            {user ? (
              <button onClick={() => setSignOutOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <LogIn className="h-4 w-4 rotate-180" /> {t("signOut")}
              </button>
            ) : (
              <Link to="/signin" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <LogIn className="h-4 w-4" /> {t("signIn")}
              </Link>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Languages className="h-3.5 w-3.5" /> {t("language")}
            </div>
            <LangSwitch />
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
            <div className="text-xs text-muted-foreground">{t("theme")}</div>
            <ThemeToggle />
          </div>

          <div className="mt-4">
            <CalmToggle />
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-4 md:px-10 md:pt-10 md:pb-12">
          {/* Mobile top bar */}
          <div className="-mx-4 mb-4 flex items-center justify-between border-b border-border/60 bg-card/60 px-4 py-3 backdrop-blur md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground" aria-label={t("openMenu")}>
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-5 pb-2">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"><Heart className="h-4 w-4" /></span>
                    <span className="font-display text-lg font-extrabold">KUA</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <NavList onPick={() => setOpen(false)} />
                  <div className="mt-4 space-y-1 border-t border-border/60 pt-4">
                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><User className="h-4 w-4" /> {t("profile")}</Link>
                    <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><Settings className="h-4 w-4" /> {t("settings")}</Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><Shield className="h-4 w-4" /> Admin</Link>
                    )}
                    {user ? (
                      <button onClick={() => { setOpen(false); setSignOutOpen(true); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><LogIn className="h-4 w-4 rotate-180" /> {t("signOut")}</button>
                    ) : (
                      <Link to="/signin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><LogIn className="h-4 w-4" /> {t("signIn")}</Link>
                    )}
                  </div>
                  <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Languages className="h-3.5 w-3.5" /> {t("language")}</div>
                    <LangSwitch />
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                    <div className="text-xs text-muted-foreground">{t("theme")}</div>
                    <ThemeToggle />
                  </div>
                  <div className="mt-4"><CalmToggle /></div>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <Logo size={36} />
              <span className="font-display text-base font-extrabold">KUA</span>
            </Link>
            <div className="flex items-center gap-2"><ThemeToggle /><LangSwitch /></div>
          </div>

          <header className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
            </div>
            <Link to="/" className="hidden text-xs text-muted-foreground hover:text-foreground md:block">
              {t("backHome")}
            </Link>
          </header>
          {children}
        </main>
      </div>
      <MobileNav />
      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </div>
  );
}
