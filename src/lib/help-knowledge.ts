// Local knowledge for the HelpBot: suggested prompts, offline FAQ, crisis terms.
// Keep this file string-only so it's safe to ship to the browser.

export type Lang = "en" | "fr";

export const SUGGESTED_PROMPTS: Record<Lang, string[]> = {
  en: [
    "How do I add a second child?",
    "How does the communication board work?",
    "Where do I switch language to French?",
    "What is Calm Mode?",
    "How do I track milestones?",
  ],
  fr: [
    "Comment ajouter un deuxième enfant ?",
    "Comment fonctionne le tableau de communication ?",
    "Où changer la langue en anglais ?",
    "Qu'est-ce que le Mode Calme ?",
    "Comment suivre les étapes du développement ?",
  ],
};

type FaqEntry = { match: RegExp; en: string; fr: string };

// Curated answers used when the user is offline or the gateway fails.
// Each answer can include markdown-style links like [Today](/today) — the
// HelpBot turns those into source link chips.
export const OFFLINE_FAQ: FaqEntry[] = [
  {
    match: /(add|new|second|another).*(child|kid|enfant)/i,
    en: "Open [Caregiver](/caregiver) and scroll to the child profile section to add another child. Switch the active child from the same place.",
    fr: "Ouvre [Aidant](/caregiver) et descends jusqu'à la section profil enfant pour en ajouter un. Tu peux aussi y changer l'enfant actif.",
  },
  {
    match: /(switch|change).*(child|kid|enfant|active)/i,
    en: "Switch the active child from [Caregiver](/caregiver). The home, [Today](/today), [Profile](/profile) and [Growth](/growth) pages update immediately.",
    fr: "Change l'enfant actif depuis [Aidant](/caregiver). L'accueil, [Aujourd'hui](/today), [Profil](/profile) et [Croissance](/growth) se mettent à jour immédiatement.",
  },
  {
    match: /(language|french|english|français|francais|langue|french)/i,
    en: "Open [Settings](/settings) and choose Language. The whole app, including [Today](/today) and [Faith](/faith), follows the choice.",
    fr: "Ouvre [Paramètres](/settings) et choisis la langue. Toute l'application, y compris [Aujourd'hui](/today) et [Foi](/faith), suit ce choix.",
  },
  {
    match: /(calm mode|mode calme|sensory|sensoriel)/i,
    en: "Calm Mode softens colour, motion and sound. Toggle it in [Settings](/settings). It's safe to leave on all day.",
    fr: "Le Mode Calme adoucit les couleurs, le mouvement et le son. Active-le dans [Paramètres](/settings). Tu peux le laisser actif toute la journée.",
  },
  {
    match: /(communication|aac|board|cards|cartes|tableau)/i,
    en: "Use [Communication](/communication) to tap picture cards (emotions, wants, places, people…) and build a sentence at the top of the screen.",
    fr: "Utilise [Communication](/communication) pour taper sur les cartes (émotions, envies, lieux, personnes…) et composer une phrase en haut de l'écran.",
  },
  {
    match: /(routine|today|rythme|rythm|aujourd|jour)/i,
    en: "Edit your child's daily rhythm from [Today](/today). Steps are editable and reorderable; mood check-ins and reflections sit at the top.",
    fr: "Modifie le rythme du jour de ton enfant depuis [Aujourd'hui](/today). Les étapes sont modifiables et réordonnables ; les humeurs et réflexions sont en haut.",
  },
  {
    match: /(milestone|growth|développement|developpement|croissance)/i,
    en: "Open [Growth](/growth) to see milestones for the active child. Mark progress gently — KUA never grades.",
    fr: "Ouvre [Croissance](/growth) pour voir les étapes du développement de l'enfant actif. Avance doucement — KUA ne note jamais.",
  },
  {
    match: /(faith|spiritual|prayer|verse|story|histoire|prière|religion|christian|islam|muslim|chrétien)/i,
    en: "Find calm verses, duas and gentle stories in [Faith & Guidance](/faith). It's bilingual and non-divisive.",
    fr: "Retrouve des versets, des duas et des histoires douces dans [Foi & Guidance](/faith). C'est bilingue et non clivant.",
  },
  {
    match: /(test|screen|questionnaire|évaluation|evaluation)/i,
    en: "Screening questionnaires live in [Tests](/tests). Each result is saved per child and stays private to your account.",
    fr: "Les questionnaires de dépistage sont dans [Tests](/tests). Chaque résultat est enregistré par enfant et reste privé.",
  },
  {
    match: /(reminder|notification|alert|rappel)/i,
    en: "Reminders are set per caregiver. Open [Settings](/settings) to manage them.",
    fr: "Les rappels sont réglés par aidant. Ouvre [Paramètres](/settings) pour les gérer.",
  },
  {
    match: /(map|place|clinic|school|carte|lieu)/i,
    en: "Save calm spots, schools and clinics in [Map](/map). They're private to your profile.",
    fr: "Enregistre des lieux calmes, écoles et cliniques dans [Carte](/map). Ils restent privés à ton profil.",
  },
  {
    match: /(privacy|data|secure|sécurité|securite|confidentialité)/i,
    en: "Your data is scoped to your account with row-level security. See [Privacy](/privacy) for details.",
    fr: "Tes données sont liées à ton compte avec une sécurité par ligne. Voir [Confidentialité](/privacy) pour les détails.",
  },
];

export function offlineAnswer(question: string, lang: Lang): string {
  const found = OFFLINE_FAQ.find((f) => f.match.test(question));
  if (found) return found[lang];
  return lang === "fr"
    ? "Je suis hors ligne pour le moment. Essaie [Paramètres](/settings), [Aidant](/caregiver) ou [Soutien](/support), ou réessaie quand la connexion revient."
    : "I'm offline right now. Try [Settings](/settings), [Caregiver](/caregiver) or [Support](/support), or ask again once you're back online.";
}

// Crisis / safety detection. Conservative — only triggers on explicit
// self-harm, harm-to-child, or emergency wording in EN/FR.
const CRISIS_RE = /\b(suicide|suicidal|kill (myself|me|my child|him|her)|hurt (myself|my child|him|her)|self[- ]harm|end my life|abuse|beaten|beating|emergency|overdose|seizure|not breathing|unconscious|bleeding|me tuer|me suicider|tuer mon enfant|frapper mon enfant|maltraitance|urgence|évanoui|inconscient|saigne|crise convulsive)\b/i;

export function isCrisis(text: string): boolean {
  return CRISIS_RE.test(text);
}

export function crisisBanner(lang: Lang): string {
  return lang === "fr"
    ? "Si toi ou ton enfant êtes en danger immédiat, appelle les secours locaux (Cameroun : 112 ou 117). Tu peux aussi contacter un médecin ou un service d'urgence le plus proche. Je peux ensuite t'aider avec l'app."
    : "If you or your child are in immediate danger, please call your local emergency number (in Cameroon: 112 or 117). You can also reach a doctor or your nearest emergency service. I can help with the app once you're safe.";
}
