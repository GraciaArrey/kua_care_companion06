import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { usePrefs } from "@/lib/prefs";

type Reminder = {
  id: string;
  title: string;
  time_of_day: string | null;
  enabled: boolean;
};

type Ctx = {
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<NotificationPermission | "unsupported">;
  testNotify: () => void;
};

const RemindersCtx = createContext<Ctx | null>(null);
const FIRED_KEY = "kua_reminder_fired_v1";

function getFiredMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(FIRED_KEY) ?? "{}"); } catch { return {}; }
}
function setFired(id: string, dateKey: string) {
  const m = getFiredMap();
  m[id] = dateKey;
  localStorage.setItem(FIRED_KEY, JSON.stringify(m));
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function fireNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/favicon.ico", tag: `kua-${title}`, silent: false });
    } catch {
      // ignore
    }
  }
  // In-app toast fallback (always)
  import("sonner").then(({ toast }) => {
    toast(title, { description: body, duration: 8000 });
  });
}

export function RemindersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { lang } = usePrefs();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const remindersRef = useRef<Reminder[]>([]);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) setPermission("unsupported");
    else setPermission(Notification.permission);
  }, []);

  const loadReminders = useCallback(async () => {
    if (!user) { remindersRef.current = []; return; }
    const { data } = await supabase
      .from("reminders")
      .select("id,title,time_of_day,enabled")
      .eq("user_id", user.id);
    remindersRef.current = (data as Reminder[]) ?? [];
  }, [user]);

  // Initial load + realtime subscription
  useEffect(() => {
    if (!user) return;
    loadReminders();
    const ch = supabase
      .channel(`reminders-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reminders", filter: `user_id=eq.${user.id}` },
        () => { loadReminders(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loadReminders]);

  // Tick every 30s, fire any due reminders that haven't fired today
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const now = new Date();
      const hh = now.getHours();
      const mm = now.getMinutes();
      const key = todayKey();
      const fired = getFiredMap();
      for (const r of remindersRef.current) {
        if (!r.enabled || !r.time_of_day) continue;
        const [rh, rm] = r.time_of_day.split(":").map((n) => parseInt(n, 10));
        if (isNaN(rh) || isNaN(rm)) continue;
        const dueMin = rh * 60 + rm;
        const nowMin = hh * 60 + mm;
        // fire if we're at or past the time, within a 30-min window, and not yet fired today
        if (nowMin >= dueMin && nowMin - dueMin <= 30 && fired[r.id] !== key) {
          const body = lang === "fr"
            ? "Un doux rappel pour toi."
            : "A gentle nudge for you.";
          fireNotification(r.title, body);
          setFired(r.id, key);
        }
      }
    };
    check();
    tickRef.current = window.setInterval(check, 30_000) as unknown as number;
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [lang]);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  const testNotify = useCallback(() => {
    fireNotification(
      lang === "fr" ? "Rappel test" : "Test reminder",
      lang === "fr" ? "Les rappels doux sont actifs." : "Gentle reminders are active.",
    );
  }, [lang]);

  return (
    <RemindersCtx.Provider value={{ permission, requestPermission, testNotify }}>
      {children}
    </RemindersCtx.Provider>
  );
}

export function useReminders() {
  const v = useContext(RemindersCtx);
  if (!v) throw new Error("useReminders must be used inside RemindersProvider");
  return v;
}
