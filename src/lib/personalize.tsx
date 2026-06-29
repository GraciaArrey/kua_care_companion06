import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useChildren } from "@/lib/children";
import { usePrefs, type Lang } from "@/lib/prefs";
import { toast } from "sonner";

const ROLE_LABEL: Record<string, Record<Lang, string>> = {
  mom: { en: "Mom", fr: "Maman" },
  dad: { en: "Dad", fr: "Papa" },
  sibling: { en: "Sibling", fr: "Frère/Sœur" },
  caregiver: { en: "Caregiver", fr: "Aidant·e" },
};

export function useNames() {
  const { profile } = useAuth();
  const { activeChild } = useChildren();
  const { lang } = usePrefs();
  return useMemo(() => {
    const childRaw =
      activeChild?.preferred_name?.trim() ||
      activeChild?.name?.trim() ||
      profile?.child_name?.trim() ||
      profile?.preferred_name?.trim() ||
      "";
    const caregiverRaw = profile?.caregiver_name?.trim() || "";
    const role = profile?.caregiver_role ?? "caregiver";
    const fallbackChild = lang === "fr" ? "votre petit·e" : "your little one";
    const roleLabel = ROLE_LABEL[role]?.[lang] || ROLE_LABEL.caregiver[lang];
    const child = childRaw || fallbackChild;
    const caregiver = caregiverRaw || roleLabel;
    return {
      child,
      childKnown: Boolean(childRaw),
      caregiver,
      caregiverKnown: Boolean(caregiverRaw),
      role,
      roleLabel,
    };
  }, [activeChild?.preferred_name, activeChild?.name, profile?.child_name, profile?.preferred_name, profile?.caregiver_name, profile?.caregiver_role, lang]);
}

export type Names = ReturnType<typeof useNames>;

export function fill(template: string, n: Names) {
  return template
    .replace(/\{child\}/g, n.child)
    .replace(/\{caregiver\}/g, n.caregiver)
    .replace(/\{role\}/g, n.roleLabel);
}

// ---- Pleasant micro-talks. Each context has 6+ lines so they feel fresh. ----

type PoolMap = Record<string, readonly string[]>;

const POOLS_EN = {
  today: [
    "Today is a good day to move slowly with {child}.",
    "{caregiver}, you're showing up - that already counts.",
    "{child} is lucky to have you noticing the small things.",
    "A calm minute for {child} is a calm minute for you, {caregiver}.",
    "Whatever {child} feels today, it's allowed.",
    "You don't have to fix the day - just walk through it with {child}.",
    "{caregiver}, breathe. {child} reads your shoulders before your words.",
  ],
  caregiver: [
    "{caregiver}, this corner is just for you.",
    "Caring for {child} is sacred work - and tiring. Both can be true.",
    "You're allowed to put yourself on the list, {caregiver}.",
    "{child} doesn't need a perfect {role}. They need a present one. You are.",
    "Two slow breaths now is a gift to {child} later.",
    "{caregiver}, the love you pour into {child} is changing how they see the world.",
  ],
  communication: [
    "Every word {child} reaches for is a doorway. Hold it open.",
    "Pictures are language too - {child} is communicating beautifully.",
    "Listen with your whole face. {child} is watching, {caregiver}.",
    "There's no wrong way for {child} to say something today.",
    "Even silence is a sentence when you're listening, {caregiver}.",
  ],
  support: [
    "{caregiver}, you're not searching alone. We've gathered the gentle stuff.",
    "Some days the best help is a quiet article and a warm drink.",
    "Whatever you find here, take only what fits {child} today.",
  ],
  tests: [
    "These are little windows into {child} - never labels.",
    "Answer the way most days look, {caregiver}. There are no wrong answers.",
    "However the result lands, {child} is still wonderfully {child}.",
  ],
  growth: [
    "Growth with {child} is not a ladder - it's a long, soft walk.",
    "Tiny shifts in {child} this month are still shifts. Count them, {caregiver}.",
    "You've been steady, {caregiver}. {child} feels it.",
  ],
  win: [
    "Look at that - {child} did something small and shining today.",
    "{caregiver}, write this one down. Future-you will need it.",
    "A win is a win. Even the quiet ones, {child}.",
  ],
  delight: [
    "{caregiver}, just a tiny note: you're doing more than you think. ✨",
    "Hi {child} 👋 - KUA hopes you have a soft minute today.",
    "{caregiver}, take a sip of water. {child} is okay right now.",
    "Reminder: {child} loves you in their own quiet language. 💛",
    "{caregiver}, the world is gentler because you're in it for {child}.",
    "{child}, you are perfectly, exactly enough today.",
  ],
} as const satisfies PoolMap;

const POOLS_FR: Record<keyof typeof POOLS_EN, readonly string[]> = {
  today: [
    "Aujourd'hui est une belle journée pour avancer doucement avec {child}.",
    "{caregiver}, tu es là - ça compte déjà beaucoup.",
    "{child} a de la chance que tu remarques les petites choses.",
    "Une minute de calme pour {child} est une minute de calme pour toi, {caregiver}.",
    "Quoi que ressente {child} aujourd'hui, c'est permis.",
    "Tu n'as pas à réparer la journée - juste à la traverser avec {child}.",
    "{caregiver}, respire. {child} lit tes épaules avant tes mots.",
  ],
  caregiver: [
    "{caregiver}, ce coin est juste pour toi.",
    "Prendre soin de {child} est un travail sacré - et fatigant. Les deux peuvent être vrais.",
    "Tu as le droit de te mettre sur la liste, {caregiver}.",
    "{child} n'a pas besoin d'un·e {role} parfait·e. Il/elle a besoin de ta présence. Tu l'es.",
    "Deux respirations lentes maintenant, c'est un cadeau pour {child} plus tard.",
    "{caregiver}, l'amour que tu donnes à {child} change sa façon de voir le monde.",
  ],
  communication: [
    "Chaque mot que {child} cherche est une porte. Garde-la ouverte.",
    "Les images sont aussi un langage - {child} communique magnifiquement.",
    "Écoute avec tout ton visage. {child} te regarde, {caregiver}.",
    "Il n'y a pas de mauvaise façon pour {child} de s'exprimer aujourd'hui.",
    "Même le silence est une phrase quand tu écoutes, {caregiver}.",
  ],
  support: [
    "{caregiver}, tu ne cherches pas seul·e. Nous avons rassemblé le doux.",
    "Certains jours, la meilleure aide est un article tranquille et une boisson chaude.",
    "Prends ici seulement ce qui convient à {child} aujourd'hui.",
  ],
  tests: [
    "Ce sont de petites fenêtres sur {child} - jamais des étiquettes.",
    "Réponds comme sont la plupart des jours, {caregiver}. Pas de mauvaise réponse.",
    "Quel que soit le résultat, {child} reste merveilleusement {child}.",
  ],
  growth: [
    "Grandir avec {child} n'est pas une échelle - c'est une longue marche douce.",
    "Les petits changements chez {child} ce mois-ci sont aussi des changements. Compte-les, {caregiver}.",
    "Tu as été constant·e, {caregiver}. {child} le ressent.",
  ],
  win: [
    "Regarde - {child} a fait quelque chose de petit et lumineux aujourd'hui.",
    "{caregiver}, note ça quelque part. Le futur-toi en aura besoin.",
    "Une victoire reste une victoire. Même les silencieuses, {child}.",
  ],
  delight: [
    "{caregiver}, juste un petit mot : tu fais plus que tu ne le penses. ✨",
    "Coucou {child} 👋 - KUA te souhaite une minute douce aujourd'hui.",
    "{caregiver}, bois une gorgée d'eau. {child} va bien là.",
    "Rappel : {child} t'aime dans sa propre langue silencieuse. 💛",
    "{caregiver}, le monde est plus doux parce que tu y es pour {child}.",
    "{child}, tu es parfaitement, exactement assez aujourd'hui.",
  ],
};

const POOLS: Record<Lang, Record<keyof typeof POOLS_EN, readonly string[]>> = {
  en: POOLS_EN,
  fr: POOLS_FR,
};

export type PoolKey = keyof typeof POOLS_EN;

// Tone overrides per language. Falls back to warm (POOLS) when missing.
const TONE_OVERRIDES: Record<Lang, Partial<Record<"plain" | "playful", Partial<Record<PoolKey, readonly string[]>>>>> = {
  en: {
    plain: {
      today: [
        "{child}'s day, one step at a time.",
        "{caregiver}, today's plan is on the right.",
        "Pick a mood and KUA will adjust.",
      ],
      caregiver: [
        "{caregiver}, your tools are below.",
        "Quick stats and reminders for {child}.",
      ],
      delight: [
        "{caregiver}: hydration check. {child} is fine.",
        "Reminder: {child} had a quiet moment recently.",
      ],
    },
    playful: {
      today: [
        "Heeeey {child}! ✨ Let's make today a soft win.",
        "{caregiver} + {child} = unstoppable today 💛",
        "Mini quest unlocked: one calm breath with {child}.",
      ],
      caregiver: [
        "{caregiver}! Your tiny league of one - checking in 🦸",
        "Pep talk: {child} thinks you're cool. They just don't say it 😉",
      ],
      delight: [
        "Pop! 🎉 {child} sends you a virtual high-five, {caregiver}.",
        "{caregiver}, this is your sign to dance for 10 seconds. {child} will laugh.",
        "{child} 🌟 today is a sparkle day, even if it doesn't feel like it.",
      ],
    },
  },
  fr: {
    plain: {
      today: [
        "La journée de {child}, un pas à la fois.",
        "{caregiver}, le plan d'aujourd'hui est à droite.",
        "Choisis une humeur, KUA s'adapte.",
      ],
      caregiver: [
        "{caregiver}, tes outils sont ci-dessous.",
        "Stats rapides et rappels pour {child}.",
      ],
      delight: [
        "{caregiver} : pense à boire. {child} va bien.",
        "Rappel : {child} a eu un moment calme récemment.",
      ],
    },
    playful: {
      today: [
        "Heeey {child} ! ✨ Faisons d'aujourd'hui une douce victoire.",
        "{caregiver} + {child} = imbattables aujourd'hui 💛",
        "Mini quête débloquée : une respiration calme avec {child}.",
      ],
      caregiver: [
        "{caregiver} ! Ta petite ligue à toi - check-in 🦸",
        "Pep talk : {child} te trouve cool. Iel ne le dit juste pas 😉",
      ],
      delight: [
        "Pop ! 🎉 {child} t'envoie un high-five virtuel, {caregiver}.",
        "{caregiver}, c'est ton signe pour danser 10 secondes. {child} va rire.",
        "{child} 🌟 aujourd'hui est un jour à paillettes, même si ça ne se sent pas.",
      ],
    },
  },
};

function pickIndex(seed: number, len: number) {
  return Math.abs(Math.floor(seed)) % len;
}

function poolFor(lang: Lang, tone: string, key: PoolKey): readonly string[] {
  const override = (TONE_OVERRIDES[lang] as any)?.[tone]?.[key];
  if (override && override.length) return override;
  return POOLS[lang][key] ?? POOLS.en[key];
}

// --- Translation coverage audit (dev tool) ---
// Returns missing pool keys / mismatched lengths between EN and FR.
// Use from a dev surface or test: `auditTranslationCoverage()`.
export function auditTranslationCoverage() {
  const missing: string[] = [];
  const mismatched: string[] = [];
  for (const k of Object.keys(POOLS_EN) as PoolKey[]) {
    if (!POOLS_FR[k] || POOLS_FR[k].length === 0) {
      missing.push(`pool:${k}`);
      continue;
    }
    if (POOLS_FR[k].length !== POOLS_EN[k].length) {
      mismatched.push(`pool:${k} (en=${POOLS_EN[k].length}, fr=${POOLS_FR[k].length})`);
    }
  }
  for (const tone of ["plain", "playful"] as const) {
    const en = TONE_OVERRIDES.en[tone] ?? {};
    const fr = TONE_OVERRIDES.fr[tone] ?? {};
    for (const k of Object.keys(en) as PoolKey[]) {
      if (!fr[k]) missing.push(`tone:${tone}:${k}`);
    }
  }
  const ok = missing.length === 0 && mismatched.length === 0;
  return { ok, missing, mismatched };
}

export function usePersonalLine(pool: PoolKey, opts?: { rotateMs?: number }) {
  const names = useNames();
  const { tone, lang } = usePrefs();
  const lines = poolFor(lang, tone, pool);
  const today = new Date();
  const dailySeed = today.getUTCFullYear() * 1000 + today.getUTCMonth() * 50 + today.getUTCDate() + pool.length + tone.length;
  const [tick, setTick] = useState(0);
  const idx = pickIndex(dailySeed + tick * 7, lines.length);

  useEffect(() => {
    if (!opts?.rotateMs) return;
    const id = setInterval(() => setTick((t) => t + 1), opts.rotateMs);
    return () => clearInterval(id);
  }, [opts?.rotateMs]);

  const text = fill(lines[idx], names);
  const next = useCallback(() => setTick((t) => t + 1), []);
  return { text, next, names };
}

export function PersonalLine({ pool, className = "" }: { pool: PoolKey; className?: string }) {
  const { text } = usePersonalLine(pool);
  return (
    <p className={`flex items-start gap-2 text-sm text-muted-foreground ${className}`}>
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <span>{text}</span>
    </p>
  );
}

// ---- Delight: one sweet pop per session, gently surprising ----

type DelightCtx = { pop: () => void };
const Ctx = createContext<DelightCtx | null>(null);

const SESSION_KEY = "kua-delight-shown";

export function DelightProvider({ children }: { children: ReactNode }) {
  const names = useNames();
  const { tone, lang } = usePrefs();
  const fired = useRef(false);

  const pop = useCallback(() => {
    const lines = poolFor(lang, tone, "delight");
    const msg = fill(lines[Math.floor(Math.random() * lines.length)], names);
    toast(msg, { duration: 6000, icon: "✨" });
  }, [names, tone, lang]);

  useEffect(() => {
    if (fired.current) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (!names.childKnown && !names.caregiverKnown) return;
    fired.current = true;
    const t = setTimeout(() => {
      pop();
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 3500);
    return () => clearTimeout(t);
  }, [names.childKnown, names.caregiverKnown, pop]);

  return <Ctx.Provider value={{ pop }}>{children}</Ctx.Provider>;
}

export function useDelight() {
  const ctx = useContext(Ctx);
  return ctx ?? { pop: () => {} };
}
