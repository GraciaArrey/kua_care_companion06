import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Lang = "en" | "fr";
export type Theme = "light" | "dark";
export type TextScale = "sm" | "md" | "lg" | "xl";
export type LineSpacing = "cozy" | "regular" | "airy";
export type Tone = "warm" | "plain" | "playful";

type Prefs = {
  lang: Lang;
  setLang: (l: Lang) => void;
  calm: boolean;
  setCalm: (b: boolean) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  favorites: string[];
  toggleFav: (key: string) => void;
  isFav: (key: string) => boolean;
  textScale: TextScale;
  setTextScale: (s: TextScale) => void;
  reduceMotion: boolean;
  setReduceMotion: (b: boolean) => void;
  highContrast: boolean;
  setHighContrast: (b: boolean) => void;
  voiceRate: number;
  setVoiceRate: (n: number) => void;
  dyslexic: boolean;
  setDyslexic: (b: boolean) => void;
  lineSpacing: LineSpacing;
  setLineSpacing: (l: LineSpacing) => void;
  readingMode: boolean;
  setReadingMode: (b: boolean) => void;
  tone: Tone;
  setTone: (t: Tone) => void;
};

const Ctx = createContext<Prefs | null>(null);
const KEY = "kua_prefs_v3";

type Persisted = {
  lang: Lang; calm: boolean; theme: Theme; favorites: string[];
  textScale: TextScale; reduceMotion: boolean; highContrast: boolean; voiceRate: number;
  dyslexic: boolean; lineSpacing: LineSpacing; readingMode: boolean; tone: Tone;
};

const DEFAULTS: Persisted = {
  lang: "en", calm: false, theme: "light", favorites: [],
  textScale: "md", reduceMotion: false, highContrast: false, voiceRate: 0.92,
  dyslexic: false, lineSpacing: "regular", readingMode: false, tone: "warm",
};

function load(): Persisted {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const sysDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      const sysReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      return { ...DEFAULTS, theme: sysDark ? "dark" : "light", reduceMotion: sysReduce };
    }
    const p = JSON.parse(raw);
    return {
      lang: p.lang === "fr" ? "fr" : "en",
      calm: !!p.calm,
      theme: p.theme === "dark" ? "dark" : "light",
      favorites: Array.isArray(p.favorites) ? p.favorites : [],
      textScale: ["sm","md","lg","xl"].includes(p.textScale) ? p.textScale : "md",
      reduceMotion: !!p.reduceMotion,
      highContrast: !!p.highContrast,
      voiceRate: typeof p.voiceRate === "number" ? p.voiceRate : 0.92,
      dyslexic: !!p.dyslexic,
      lineSpacing: ["cozy","regular","airy"].includes(p.lineSpacing) ? p.lineSpacing : "regular",
      readingMode: !!p.readingMode,
      tone: ["warm","plain","playful"].includes(p.tone) ? p.tone : "warm",
    };
  } catch {
    return DEFAULTS;
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [calm, setCalmState] = useState(false);
  const [theme, setThemeState] = useState<Theme>("light");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [textScale, setTextScaleState] = useState<TextScale>("md");
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);
  const [voiceRate, setVoiceRateState] = useState(0.92);
  const [dyslexic, setDyslexicState] = useState(false);
  const [lineSpacing, setLineSpacingState] = useState<LineSpacing>("regular");
  const [readingMode, setReadingModeState] = useState(false);
  const [tone, setToneState] = useState<Tone>("warm");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = load();
    setLangState(p.lang); setCalmState(p.calm); setThemeState(p.theme); setFavorites(p.favorites);
    setTextScaleState(p.textScale); setReduceMotionState(p.reduceMotion);
    setHighContrastState(p.highContrast); setVoiceRateState(p.voiceRate);
    setDyslexicState(p.dyslexic); setLineSpacingState(p.lineSpacing);
    setReadingModeState(p.readingMode); setToneState(p.tone);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("calm", calm);
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("reduce-motion", reduceMotion);
    root.classList.toggle("high-contrast", highContrast);
    root.classList.toggle("dyslexic", dyslexic);
    root.classList.toggle("reading-mode", readingMode);
    root.dataset.spacing = lineSpacing;
    root.lang = lang;
    root.style.colorScheme = theme;
    const scale = { sm: "14px", md: "16px", lg: "18px", xl: "20px" }[textScale];
    root.style.fontSize = scale;
  }, [calm, lang, theme, textScale, reduceMotion, highContrast, dyslexic, lineSpacing, readingMode]);

  useEffect(() => {
    if (!hydrated) return;
    let unsub: any;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) syncFromProfile(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (sess?.user) syncFromProfile(sess.user.id);
    });
    unsub = sub;
    return () => unsub?.subscription?.unsubscribe?.();
  }, [hydrated]);

  const syncFromProfile = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("lang,theme,calm").eq("id", uid).maybeSingle();
    if (!data) return;
    if (data.lang === "fr" || data.lang === "en") setLangState(data.lang);
    if (data.theme === "dark" || data.theme === "light") setThemeState(data.theme);
    if (typeof data.calm === "boolean") setCalmState(data.calm);
    persist({ lang: data.lang as Lang, theme: data.theme as Theme, calm: data.calm });
  };

  const persist = (next: Partial<Persisted>) => {
    if (typeof window === "undefined") return;
    const cur = load();
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...next }));
  };

  const persistRemote = async (patch: { lang?: Lang; theme?: Theme; calm?: boolean }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return;
    await supabase.from("profiles").update(patch).eq("id", data.session.user.id);
  };

  const setLang = (l: Lang) => { setLangState(l); persist({ lang: l }); persistRemote({ lang: l }); };
  const setCalm = (b: boolean) => { setCalmState(b); persist({ calm: b }); persistRemote({ calm: b }); };
  const setTheme = (t: Theme) => { setThemeState(t); persist({ theme: t }); persistRemote({ theme: t }); };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const setTextScale = (s: TextScale) => { setTextScaleState(s); persist({ textScale: s }); };
  const setReduceMotion = (b: boolean) => { setReduceMotionState(b); persist({ reduceMotion: b }); };
  const setHighContrast = (b: boolean) => { setHighContrastState(b); persist({ highContrast: b }); };
  const setVoiceRate = (n: number) => { setVoiceRateState(n); persist({ voiceRate: n }); };
  const setDyslexic = (b: boolean) => { setDyslexicState(b); persist({ dyslexic: b }); };
  const setLineSpacing = (l: LineSpacing) => { setLineSpacingState(l); persist({ lineSpacing: l }); };
  const setReadingMode = (b: boolean) => { setReadingModeState(b); persist({ readingMode: b }); };
  const setTone = (t: Tone) => { setToneState(t); persist({ tone: t }); };
  const toggleFav = (key: string) => {
    setFavorites((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      persist({ favorites: next });
      return next;
    });
  };
  const isFav = (key: string) => favorites.includes(key);

  return (
    <Ctx.Provider value={{
      lang, setLang, calm, setCalm, theme, setTheme, toggleTheme,
      favorites, toggleFav, isFav,
      textScale, setTextScale, reduceMotion, setReduceMotion,
      highContrast, setHighContrast, voiceRate, setVoiceRate,
      dyslexic, setDyslexic, lineSpacing, setLineSpacing,
      readingMode, setReadingMode, tone, setTone,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePrefs() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePrefs must be used inside PrefsProvider");
  return v;
}

// --- Bilingual dictionary ---------------------------------------------------
const dict = {
  en: {
    home: "Home", today: "Today", growth: "Growth", communication: "Communication",
    support: "Support Hub", caregiver: "Caregiver", talk: "Talk", you: "You",
    backHome: "← Back to home", calmMode: "Calm mode",
    calmHint: "Soften visuals when things feel like a lot.",
    turnOn: "Turn on", turnOff: "Turn off", language: "Language",
    profile: "Profile", settings: "Settings", signOut: "Sign out", signIn: "Sign in",
    openKua: "Open KUA", openMenu: "Open menu", closeMenu: "Close menu",
    favorites: "Favorites", emotionWheel: "Emotion wheel", openWheel: "Open the emotion wheel",
    theme: "Theme", light: "Light", dark: "Dark",
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    friend: "friend",
    todaySubtitle: "Here is a gentle map of your day. Take it one breath at a time.",
    moodPrompt: "How are you feeling right now?",
    moodHint: "Pick the closest one. KUA will adapt softly.",
    todayRhythm: "Today's rhythm",
    rhythmHint: "{a} of {b} steps done - gently does it.",
    smallWin: "Today's small win", addWin: "+ Add a win",
    suggested: "Suggested for now", suggestedHint: "Soft, optional. Skip anytime.",
    caregiverPause: "Caregiver pause",
    youHeading: "How are YOU feeling today?",
    youSub: "A 90-second breathing exercise, just for you. The day will keep - you matter.",
    startBreathing: "Start breathing",
    overwhelmTip: "That's okay. Visuals are softened. Try the calming toolkit below - no pressure.",
    mood_calm: "Calm", mood_happy: "Happy", mood_tired: "Tired", mood_sad: "Sad",
    mood_meh: "Just okay", mood_overwhelm: "Overwhelmed", mood_energetic: "Energetic",
    welcomeBack: "Welcome back", createAccount: "Create your account",
    email: "Email", password: "Password", preferredName: "Preferred name",
    namePlaceholder: "What should we call you?",
    needAccount: "New here? Create an account",
    haveAccount: "Already have an account? Sign in",
    signingIn: "Signing in…", signingUp: "Creating…",
    twoFactor: "Two-factor authentication",
    enable2fa: "Enable 2FA", disable2fa: "Disable 2FA",
    enterCode: "Enter the 6-digit code from your authenticator",
    verify: "Verify", scanQr: "Scan this QR with your authenticator app, then enter the code.",
    settingsSaved: "Saved.",
    useThisFeeling: "Use this feeling", goBreathe: "Take a breath", saveToVault: "Save to my vault",
    save: "Save", cancel: "Cancel",
    navHintToday: "Your day", navHintGrowth: "Milestones", navHintCommunication: "Express",
    navHintSupport: "Resources", navHintCaregiver: "For you",
    forYou: "For you", caringIs: "Caring for", isSacred: "is sacred work. Here is your quiet corner.",
    wellnessCheckIn: "Wellness check-in", howAreYou: "How are YOU feeling today",
    yourWeek: "Your week", weekFromCheckins: "Built from your daily check-ins above.",
    signInForWeek: "Sign in to build your weekly view.",
    aNoteForMe: "A note for me", profileUpdated: "Profile updated", profileAdded: "Profile added",
    thankYouNoticing: "Thank you for noticing", checkinSaved: "Your check-in is saved to this week.",
    yourSpace: "Your personal space", childSpaceFor: "A space tuned to",
  },
  fr: {
    home: "Accueil", today: "Aujourd'hui", growth: "Croissance", communication: "Communication",
    support: "Soutien", caregiver: "Aidant", talk: "Parler", you: "Vous",
    backHome: "← Retour à l'accueil", calmMode: "Mode calme",
    calmHint: "Adoucir l'écran quand c'est beaucoup.",
    turnOn: "Activer", turnOff: "Désactiver", language: "Langue",
    profile: "Profil", settings: "Réglages", signOut: "Déconnexion", signIn: "Connexion",
    openKua: "Ouvrir KUA", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu",
    favorites: "Favoris", emotionWheel: "Roue des émotions", openWheel: "Ouvrir la roue des émotions",
    theme: "Thème", light: "Clair", dark: "Sombre",
    goodMorning: "Bonjour", goodAfternoon: "Bon après-midi", goodEvening: "Bonsoir",
    friend: "ami·e",
    todaySubtitle: "Voici une carte douce de ta journée. Une respiration à la fois.",
    moodPrompt: "Comment te sens-tu maintenant ?",
    moodHint: "Choisis la plus proche. KUA s'adapte doucement.",
    todayRhythm: "Le rythme du jour",
    rhythmHint: "{a} sur {b} étapes - tout doux.",
    smallWin: "La petite victoire du jour", addWin: "+ Ajouter une victoire",
    suggested: "Suggéré maintenant", suggestedHint: "Doux, optionnel. Passe quand tu veux.",
    caregiverPause: "Pause aidant",
    youHeading: "Comment te sens-tu, TOI, aujourd'hui ?",
    youSub: "Un exercice de respiration de 90 secondes, rien que pour toi.",
    startBreathing: "Commencer à respirer",
    overwhelmTip: "C'est ok. L'écran s'adoucit. Essaie la trousse calmante ci-dessous, sans pression.",
    mood_calm: "Calme", mood_happy: "Heureux", mood_tired: "Fatigué", mood_sad: "Triste",
    mood_meh: "Juste ok", mood_overwhelm: "Submergé", mood_energetic: "Énergique",
    welcomeBack: "Bon retour", createAccount: "Créer ton compte",
    email: "Courriel", password: "Mot de passe", preferredName: "Prénom préféré",
    namePlaceholder: "Comment veux-tu qu'on t'appelle ?",
    needAccount: "Nouveau ? Crée un compte",
    haveAccount: "Déjà un compte ? Se connecter",
    signingIn: "Connexion…", signingUp: "Création…",
    twoFactor: "Authentification à deux facteurs",
    enable2fa: "Activer la 2FA", disable2fa: "Désactiver la 2FA",
    enterCode: "Entre le code à 6 chiffres de ton authentificateur",
    verify: "Vérifier", scanQr: "Scanne ce QR avec ton authentificateur, puis entre le code.",
    settingsSaved: "Enregistré.",
    useThisFeeling: "Utiliser ce sentiment", goBreathe: "Prendre une respiration", saveToVault: "Garder dans mon coffre",
    save: "Enregistrer", cancel: "Annuler",
    navHintToday: "Ta journée", navHintGrowth: "Étapes", navHintCommunication: "S'exprimer",
    navHintSupport: "Ressources", navHintCaregiver: "Pour toi",
    forYou: "Pour toi", caringIs: "Prendre soin de", isSacred: "est un travail sacré. Voici ton coin tranquille.",
    wellnessCheckIn: "Bilan bien-être", howAreYou: "Comment te sens-tu, TOI, aujourd'hui",
    yourWeek: "Ta semaine", weekFromCheckins: "Construit à partir de tes bilans quotidiens.",
    signInForWeek: "Connecte-toi pour voir ta semaine.",
    aNoteForMe: "Une note pour moi", profileUpdated: "Profil mis à jour", profileAdded: "Profil ajouté",
    thankYouNoticing: "Merci d'avoir remarqué", checkinSaved: "Ton bilan est enregistré.",
    yourSpace: "Ton espace personnel", childSpaceFor: "Un espace pour",
  },
} as const;

export type DictKey = keyof typeof dict["en"];
export function useT() {
  const { lang } = usePrefs();
  return <K extends DictKey>(k: K): typeof dict["en"][K] => (dict[lang] as any)[k] ?? (dict.en as any)[k];
}
