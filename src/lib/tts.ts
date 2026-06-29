import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "speaking" | "paused";

function pickVoice(lang: "en" | "fr"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const target = lang === "fr" ? "fr" : "en";
  const inLang = voices.filter((v) => v.lang.toLowerCase().startsWith(target));
  const pool = inLang.length ? inLang : voices;
  const preferred = [
    /samantha/i, /victoria/i, /serena/i, /ava/i, /allison/i, /karen/i,
    /amelie/i, /amélie/i, /audrey/i, /marie/i, /thomas/i,
    /google.*(female|natural|neural)/i, /microsoft.*(aria|jenny|natasha|denise)/i,
    /natural/i, /neural/i, /female/i,
  ];
  for (const re of preferred) {
    const v = pool.find((v) => re.test(v.name));
    if (v) return v;
  }
  return pool[0] ?? null;
}

/**
 * useTTS - soothing speech synthesis with reliable pause/resume.
 *
 * Workaround for the well-known Chrome bug where speechSynthesis.resume()
 * silently fails after ~14s of pause: we remember the full text and the last
 * spoken character index (via the `boundary` event). On resume, we cancel and
 * re-speak the remaining slice, which works in every modern browser.
 */
export function useTTS(lang: "en" | "fr", rate: number = 0.92) {
  const [status, setStatus] = useState<Status>("idle");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fullTextRef = useRef<string>("");
  const charIndexRef = useRef<number>(0);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    const sync = () => window.speechSynthesis.getVoices();
    sync();
    window.speechSynthesis.onvoiceschanged = sync;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [supported]);

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  const buildAndSpeak = useCallback((text: string, fromIndex: number) => {
    const slice = text.slice(fromIndex);
    const u = new SpeechSynthesisUtterance(slice);
    u.lang = lang === "fr" ? "fr-FR" : "en-US";
    u.rate = rate;
    u.pitch = 1.0;
    u.volume = 1.0;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.onstart = () => setStatus("speaking");
    u.onend = () => {
      // Only mark idle if not paused (a manual pause may interrupt)
      if (!window.speechSynthesis.paused) setStatus("idle");
    };
    u.onerror = () => setStatus("idle");
    u.onboundary = (e) => {
      // charIndex is relative to the slice; track absolute position
      charIndexRef.current = fromIndex + (e.charIndex ?? 0);
    };
    utterRef.current = u;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [lang, rate]);

  const speak = useCallback((text: string) => {
    if (!supported || !text) return;
    fullTextRef.current = text;
    charIndexRef.current = 0;
    buildAndSpeak(text, 0);
  }, [supported, buildAndSpeak]);

  const pause = useCallback(() => {
    if (!supported) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    // Re-speak from last boundary - bypasses Chrome's broken resume()
    if (fullTextRef.current && charIndexRef.current < fullTextRef.current.length) {
      buildAndSpeak(fullTextRef.current, charIndexRef.current);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus("speaking");
    }
  }, [supported, buildAndSpeak]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    fullTextRef.current = "";
    charIndexRef.current = 0;
    setStatus("idle");
  }, [supported]);

  return { speak, pause, resume, stop, status, supported };
}
