import { Link, useRouterState } from "@tanstack/react-router";
import { Sun, Sprout, MessageCircle, BookHeart, HeartHandshake } from "lucide-react";
import { useT, type DictKey } from "@/lib/prefs";

const items: { to: string; key: DictKey; icon: any }[] = [
  { to: "/today", key: "today", icon: Sun },
  { to: "/growth", key: "growth", icon: Sprout },
  { to: "/communication", key: "talk", icon: MessageCircle },
  { to: "/support", key: "support", icon: BookHeart },
  { to: "/caregiver", key: "you", icon: HeartHandshake },
];

export function MobileNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  return (
    <nav className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/90 p-1.5 shadow-card backdrop-blur md:hidden">
      {items.map(({ to, key, icon: Icon }) => {
        const active = path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex min-w-[58px] flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[11px] font-medium transition ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
