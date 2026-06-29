import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  HelpCircle,
  Send,
  X,
  Loader2,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  MessageCircleHeart,
} from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/prefs";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  SUGGESTED_PROMPTS,
  offlineAnswer,
  isCrisis,
  crisisBanner,
} from "@/lib/help-knowledge";

type Msg = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  followups?: string[];
  variant?: "normal" | "crisis" | "offline";
  /** DB row id for assistant messages — used to persist rating */
  chatId?: string;
  rating?: "up" | "down";
};

function parseReply(raw: string): { content: string; sources: string[]; followups: string[] } {
  let content = raw.trim();
  const sources = new Set<string>();
  const followups: string[] = [];

  const fuMatch = content.match(/FOLLOWUPS:\s*(.+?)\s*$/im);
  if (fuMatch) {
    fuMatch[1].split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3).forEach((q) => followups.push(q));
    content = content.replace(fuMatch[0], "").trim();
  }
  const srcMatch = content.match(/SOURCES:\s*(.+?)\s*$/im);
  if (srcMatch) {
    srcMatch[1].split("|").map((s) => s.trim()).filter((s) => s.startsWith("/")).forEach((p) => sources.add(p));
    content = content.replace(srcMatch[0], "").trim();
  }
  const linkRe = /\[([^\]]+)\]\((\/[^\s)]*)\)/g;
  let m;
  while ((m = linkRe.exec(content)) !== null) sources.add(m[2]);

  return { content, sources: [...sources], followups };
}

function RichText({
  text,
  onLinkBlocked,
  blocked,
}: {
  text: string;
  onLinkBlocked?: (path: string) => void;
  blocked?: boolean;
}) {
  const parts = useMemo(() => {
    const out: Array<{ type: "text" | "link"; value: string; to?: string }> = [];
    const re = /\[([^\]]+)\]\((\/[^\s)]*)\)/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
      out.push({ type: "link", value: m[1], to: m[2] });
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ type: "text", value: text.slice(last) });
    return out;
  }, [text]);

  return (
    <>
      {parts.map((p, i) =>
        p.type === "link" ? (
          blocked ? (
            <button
              key={i}
              type="button"
              onClick={() => onLinkBlocked?.(p.to as string)}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {p.value}
            </button>
          ) : (
            <Link
              key={i}
              to={p.to as string}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {p.value}
            </Link>
          )
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </>
  );
}

function pathLabel(path: string): string {
  const seg = path.replace(/^\//, "").split("/")[0] || "home";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export function HelpBot() {
  const { lang } = usePrefs();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const intro = lang === "fr"
    ? "Bonjour. Je suis l'aide de KUA. Posez-moi une question sur l'app ou sur l'accompagnement de votre enfant."
    : "Hi. I'm KUA's help assistant. Ask me anything about the app or about caring for your child.";

  const navigate = useNavigate();

  // Reset transcript when the user signs out, or when user changes.
  useEffect(() => {
    const reset = () => {
      setMessages([]);
      setInput("");
      setOpen(false);
    };
    window.addEventListener("kua:signout", reset);
    return () => window.removeEventListener("kua:signout", reset);
  }, []);

  useEffect(() => {
    // When user identity changes (login/logout), clear local transcript so
    // the next person on a shared device starts fresh.
    setMessages([]);
  }, [user?.id]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: intro }]);
    }
  }, [open, intro, messages.length]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    const goOn = () => setOnline(true);
    const goOff = () => setOnline(false);
    window.addEventListener("online", goOn);
    window.addEventListener("offline", goOff);
    return () => {
      window.removeEventListener("online", goOn);
      window.removeEventListener("offline", goOff);
    };
  }, []);

  function gateLink(path: string) {
    if (user) {
      navigate({ to: path });
      return;
    }
    toast(
      lang === "fr" ? "Connectez-vous pour continuer" : "Sign in to continue",
      {
        description:
          lang === "fr"
            ? "Créez un compte ou connectez-vous pour ouvrir cette section."
            : "Create an account or sign in to open this section.",
      },
    );
    navigate({ to: "/signin", search: { redirect: path } as never });
  }

  /** Persist a Q&A to help_chats and return the row id (or null on failure). */
  async function logChat(prompt: string, response: string, source: "gateway" | "offline" | "crisis") {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("help_chats")
        .insert({ user_id: user.id, prompt, response, lang, source })
        .select("id")
        .single();
      if (error) return null;
      return data?.id ?? null;
    } catch {
      return null;
    }
  }

  async function rate(idx: number, value: "up" | "down") {
    const msg = messages[idx];
    if (!msg || msg.role !== "assistant" || msg.rating) return;
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, rating: value } : m)));

    if (msg.chatId) {
      try {
        await supabase
          .from("help_chats")
          .update({ rating: value, rated_at: new Date().toISOString() })
          .eq("id", msg.chatId);
      } catch {
        // non-blocking
      }
    }

    if (value === "up") {
      toast.success(
        lang === "fr"
          ? "Merci ! Heureux d'avoir pu aider."
          : "Thank you! Glad that was helpful.",
        { description: lang === "fr" ? "Vos retours nous aident à nous améliorer." : "Your feedback helps us improve." },
      );
    } else {
      toast(
        lang === "fr"
          ? "Merci pour votre retour."
          : "Thank you for your feedback.",
        { description: lang === "fr" ? "Nous en tiendrons compte pour améliorer les réponses." : "We will take it into consideration." },
      );
    }
  }

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const next: Msg[] = [...messages, userMsg];

    if (isCrisis(trimmed)) {
      const content = crisisBanner(lang);
      const chatId = await logChat(trimmed, content, "crisis");
      const banner: Msg = { role: "assistant", content, variant: "crisis", chatId: chatId ?? undefined };
      setMessages([...next, banner]);
      setInput("");
      return;
    }

    setMessages(next);
    setInput("");

    if (!navigator.onLine) {
      const reply = offlineAnswer(trimmed, lang);
      const parsed = parseReply(reply);
      const chatId = await logChat(trimmed, parsed.content, "offline");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: parsed.content, sources: parsed.sources, variant: "offline", chatId: chatId ?? undefined },
      ]);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    setBusy(true);
    try {
      const r = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          lang,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as { text: string };
      const parsed = parseReply(j.text || "…");
      const chatId = await logChat(trimmed, parsed.content, "gateway");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: parsed.content,
          sources: parsed.sources,
          followups: parsed.followups,
          chatId: chatId ?? undefined,
        },
      ]);
    } catch {
      const reply = offlineAnswer(trimmed, lang);
      const parsed = parseReply(reply);
      const content =
        (lang === "fr"
          ? "Je n'ai pas pu joindre le service. Voici une réponse hors ligne :\n\n"
          : "I couldn't reach the service. Here's an offline answer:\n\n") + parsed.content;
      const chatId = await logChat(trimmed, content, "offline");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content,
          sources: parsed.sources,
          variant: "offline",
          chatId: chatId ?? undefined,
        },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  }

  const showSuggestions = messages.length <= 1 && !busy;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <>
      <button
        type="button"
        aria-label={lang === "fr" ? "Ouvrir l'aide" : "Open help"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-20 right-4 z-50 grid h-14 w-14 place-items-center rounded-full shadow-2xl ring-4 ring-primary/15 transition-all duration-300 md:bottom-6",
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:scale-110 hover:ring-primary/25",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircleHeart className="h-6 w-6" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={lang === "fr" ? "Aide KUA" : "KUA help"}
          className="fixed bottom-36 right-4 z-50 flex h-[34rem] w-[26rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl md:bottom-24 animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          <header className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {lang === "fr" ? "Aide KUA" : "KUA Help"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {lang === "fr" ? "Réponses précises sur l'app" : "Precise answers about the app"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={lang === "fr" ? "Fermer" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Persistent safety banner */}
          <div className="flex items-start gap-2 border-b border-border/60 bg-amber-50 px-5 py-2 text-[11px] leading-snug text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {lang === "fr"
                ? "Ceci n'est pas un avis médical. En cas d'urgence au Cameroun, appelle le 112 ou le 117."
                : "This isn't medical advice. In a Cameroon emergency, call 112 or 117."}
            </span>
          </div>

          {!online && (
            <div className="border-b border-border/60 bg-muted px-5 py-1.5 text-[11px] text-muted-foreground">
              {lang === "fr"
                ? "Hors ligne — réponses limitées depuis la base locale."
                : "Offline — answering from the local knowledge base."}
            </div>
          )}

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[88%] whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    m.role === "user" && "rounded-tr-md bg-gradient-to-br from-primary to-primary/85 text-primary-foreground",
                    m.role === "assistant" && m.variant === "crisis" && "rounded-tl-md border border-destructive/40 bg-destructive/10 text-foreground",
                    m.role === "assistant" && m.variant !== "crisis" && "rounded-tl-md border border-border/60 bg-muted/50 text-foreground",
                  )}
                >
                  {m.role === "assistant" && m.variant === "crisis" && (
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Sécurité d'abord" : "Safety first"}
                    </div>
                  )}
                  <RichText text={m.content} blocked={!user} onLinkBlocked={gateLink} />
                </div>

                {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {lang === "fr" ? "Sources" : "Sources"}
                    </span>
                    {m.sources.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => gateLink(s)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] text-foreground transition hover:bg-muted hover:scale-105"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {pathLabel(s)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Rating buttons — only on assistant replies (not the intro) */}
                {m.role === "assistant" && i > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {!m.rating ? (
                      <>
                        <span className="text-[10px] text-muted-foreground">
                          {lang === "fr" ? "Utile ?" : "Helpful?"}
                        </span>
                        <button
                          type="button"
                          onClick={() => rate(i, "up")}
                          aria-label={lang === "fr" ? "Pouce en haut" : "Thumbs up"}
                          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-muted-foreground transition hover:scale-110 hover:border-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => rate(i, "down")}
                          aria-label={lang === "fr" ? "Pouce en bas" : "Thumbs down"}
                          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-muted-foreground transition hover:scale-110 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          m.rating === "up"
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {m.rating === "up" ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
                        {lang === "fr" ? "Merci" : "Thanks"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {lang === "fr" ? "Je réfléchis…" : "Thinking…"}
              </div>
            )}

            {showSuggestions && (
              <div className="pt-1">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  {lang === "fr" ? "Suggestions" : "Suggested prompts"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS[lang].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => ask(q)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition hover:scale-105 hover:border-primary/40 hover:bg-primary/5"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!busy && lastAssistant?.followups && lastAssistant.followups.length > 0 && (
              <div className="pt-1">
                <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                  {lang === "fr" ? "Pour aller plus loin" : "Follow-up"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lastAssistant.followups.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => ask(q)}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary transition hover:scale-105 hover:bg-primary/20"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/60 bg-card/80 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder={lang === "fr" ? "Posez une question…" : "Ask a question…"}
                className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => ask(input)}
                disabled={busy || !input.trim()}
                aria-label={lang === "fr" ? "Envoyer" : "Send"}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md transition hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
