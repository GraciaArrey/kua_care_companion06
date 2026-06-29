// Centralized content for KUA - used by detail pages so links resolve to real content.

export type Article = {
  slug: string;
  title: string;
  category: string;
  read: number;
  excerpt: string;
  body: string[];
};

export type ContentLang = "en" | "fr";

const ARTICLES_EN: Article[] = [
  {
    slug: "name-big-feelings",
    title: "Helping a child name big feelings",
    category: "Featured",
    read: 6,
    excerpt: "A gentle 7-step approach with picture cues, plus a printable feelings wheel.",
    body: [
      "Big feelings move through the body before they reach words. Start by naming what you see - flushed cheeks, fast hands, a quiet voice. Naming is not labelling; it is gentle company.",
      "Offer two soft choices: a quiet space, or a slow breath together. Either is a win. Avoid asking 'why' in the moment - the thinking brain is offline. Wait until the body settles.",
      "Use a feelings wheel with simple icons. Let the child point. Repeat back: 'You are pointing to frustrated. That makes sense.' Stay close. Stay slow.",
      "Afterwards, write a tiny note in the vault: what helped, what did not. Patterns become kindness over time.",
    ],
  },
  { slug: "co-regulation-4-breaths", title: "Co-regulation in 4 breaths", category: "Emotional regulation", read: 4, excerpt: "A pocket script for the hardest minutes of the day.", body: ["Sit beside, not in front. Match their breathing for 4 cycles. Slowly, your nervous system invites theirs to soften.", "Box pattern: in 4, hold 4, out 4, hold 4. Use a small hand on the chest to feel the rise and fall.", "End with one warm sentence: 'I am here. We have time.'"] },
  { slug: "meltdowns-script", title: "When meltdowns arrive: a script", category: "Emotional regulation", read: 7, excerpt: "Words to keep ready when your own go missing.", body: ["Meltdowns are overflow, not behaviour. Lower your voice, lower the lights, lower the demands.", "Script: 'You are safe. I am close. We do not need to talk.' Repeat as a calm loop, not a question.", "Afterwards, offer water, a soft blanket, and quiet. Repair, do not rehearse."] },
  { slug: "naming-without-labels", title: "Naming feelings without labels", category: "Emotional regulation", read: 5, excerpt: "Describe the body, not the verdict.", body: ["Instead of 'You are angry', try 'Your shoulders look tight'. Description respects autonomy.", "Let the child finish the sentence. Their words count more than ours."] },
  { slug: "soft-transitions", title: "Soft transitions between activities", category: "Emotional regulation", read: 3, excerpt: "Bridges, not boundaries.", body: ["Use a 5-minute, 2-minute, now warning. Add a visual timer the child can see.", "Bridge with a beloved object - a card, a song, a small ritual."] },
  { slug: "starter-aac", title: "Building a starter AAC vocabulary", category: "Speech & communication", read: 8, excerpt: "First 30 words that unlock real conversations.", body: ["Start with verbs and feelings, not nouns. 'Want', 'help', 'stop', 'more', 'done' carry a whole day.", "Model on the device yourself. Children copy what they see modelled, not what they are asked to do."] },
  { slug: "aided-language", title: "Modeling: the gentle 'aided language' way", category: "Speech & communication", read: 6, excerpt: "Speak with the cards, not at them.", body: ["When you talk, tap the cards too. No pressure to respond. Exposure is the teacher.", "Aim for 200 models a day; that sounds like a lot, but a snack alone is 20."] },
  { slug: "bilingual-homes", title: "Bilingual homes: when to switch languages", category: "Speech & communication", read: 5, excerpt: "Both languages can grow together.", body: ["Use the language of the heart at home. Keep school language for school. Children sort it out beautifully.", "Picture cards labelled in both languages reduce friction at transitions."] },
  { slug: "stuttering", title: "Stuttering: what helps, what hurts", category: "Speech & communication", read: 7, excerpt: "Soft listening makes more room than coaching.", body: ["Do not finish their sentences. Slow your own speech and pause longer between turns.", "Praise content, not fluency."] },
  { slug: "sensory-diet", title: "A sensory diet that fits real life", category: "Sensory & sleep", read: 9, excerpt: "Tiny inputs across the day, not a checklist.", body: ["Heavy work (carrying, pushing) regulates faster than screens. Two minutes is enough.", "Map the day: morning input, midday calm, evening wind-down."] },
  { slug: "sounds-that-soothe", title: "Sounds that soothe - and which to avoid", category: "Sensory & sleep", read: 4, excerpt: "Pink noise, soft humming, cello low strings.", body: ["Avoid sudden frequency shifts. Loop the same gentle track at bedtime to build a sound anchor.", "Headphones with volume limits are a quiet superpower."] },
  { slug: "little-lamp", title: "Bedtime story: 'The little lamp'", category: "Sensory & sleep", read: 11, excerpt: "A gentle read-aloud about being small and bright.", body: ["The little lamp lived on a windowsill. It was not the brightest lamp, but it was the warmest.", "Each night, it watched the moon and whispered, 'You are not alone.' And the room agreed.", "And so do we."] },
  { slug: "untangle-overstim", title: "Untangling overstimulation early", category: "Sensory & sleep", read: 6, excerpt: "Catch the small signals before the big ones.", body: ["Watch for blink rate, finger tension, breath shortening. Offer a quiet exit before the storm.", "An exit is a kindness, not a defeat."] },
  { slug: "breakfast-plates", title: "Autism-friendly breakfast plates", category: "Recipes & routines", read: 5, excerpt: "Same shapes, same colours, low surprise.", body: ["Predictable plates lower morning friction. Three sections, same colours each day, novelty as an option.", "Let the child plate one item themselves - agency is appetite."] },
  { slug: "brushing-teeth", title: "Brushing teeth in 6 visual steps", category: "Recipes & routines", read: 4, excerpt: "Picture sequence + a soft timer = win.", body: ["1) Wet brush. 2) Tiny pea of paste. 3) Top circles. 4) Bottom circles. 5) Spit. 6) Smile in the mirror.", "Use the same song each time; the brain loves a ritual."] },
  { slug: "calm-laundry", title: "Calm laundry helper routine", category: "Recipes & routines", read: 5, excerpt: "Sorting socks is sensory therapy in disguise.", body: ["Pair socks by colour. Press fabric flat. Carry the basket - gentle heavy work.", "End with a stretch and a sip of water."] },
  { slug: "smoothies", title: "Smooth, sensory-safe smoothies", category: "Recipes & routines", read: 3, excerpt: "Same texture every time.", body: ["Banana, oat milk, a spoon of almond butter, a pinch of cinnamon. Blend until silky.", "Serve in the same cup. Same straw. Calm wins."] },
];

const ARTICLES_FR: Record<string, Omit<Article, "slug" | "read">> = {
  "name-big-feelings": {
    title: "Aider un enfant à nommer les grandes émotions",
    category: "À la une",
    excerpt: "Une approche douce en 7 étapes avec des images, plus une roue des émotions imprimable.",
    body: [
      "Les grandes émotions traversent le corps avant d'arriver aux mots. Commencez par nommer ce que vous voyez : joues rouges, mains rapides, voix très basse. Nommer n'est pas coller une étiquette ; c'est tenir compagnie avec douceur.",
      "Proposez deux choix calmes : un espace tranquille ou une respiration lente ensemble. L'un ou l'autre est déjà une victoire. Évitez de demander « pourquoi » sur le moment : le cerveau qui réfléchit est en pause. Attendez que le corps redescende.",
      "Utilisez une roue des émotions avec des icônes simples. Laissez l'enfant pointer. Répondez doucement : « Tu montres frustré. Ça se comprend. » Restez proche. Restez lent.",
      "Après, notez une toute petite observation dans le coffre : ce qui a aidé, ce qui n'a pas aidé. Avec le temps, les schémas deviennent de la tendresse.",
    ],
  },
  "co-regulation-4-breaths": { title: "Co-régulation en 4 respirations", category: "Régulation émotionnelle", excerpt: "Un petit script pour les minutes les plus difficiles de la journée.", body: ["Asseyez-vous à côté, pas en face. Accordez votre respiration à la sienne pendant 4 cycles. Peu à peu, votre système nerveux invite le sien à s'apaiser.", "Rythme carré : inspirez 4, retenez 4, expirez 4, retenez 4. Une petite main sur la poitrine peut sentir le mouvement.", "Terminez par une phrase chaude : « Je suis là. Nous avons le temps. »"] },
  "meltdowns-script": { title: "Quand la crise arrive : un script", category: "Régulation émotionnelle", excerpt: "Des mots à garder prêts quand les vôtres disparaissent.", body: ["Une crise est un débordement, pas un mauvais comportement. Baissez la voix, baissez la lumière, baissez les demandes.", "Script : « Tu es en sécurité. Je suis près de toi. Nous n'avons pas besoin de parler. » Répétez comme une boucle calme, pas comme une question.", "Après, proposez de l'eau, une couverture douce et du silence. Réparez, ne rejouez pas la scène."] },
  "naming-without-labels": { title: "Nommer les émotions sans étiquettes", category: "Régulation émotionnelle", excerpt: "Décrire le corps, pas rendre un verdict.", body: ["Au lieu de « Tu es fâché », essayez « Tes épaules ont l'air tendues ». La description respecte l'autonomie.", "Laissez l'enfant finir la phrase. Ses mots comptent plus que les nôtres."] },
  "soft-transitions": { title: "Transitions douces entre activités", category: "Régulation émotionnelle", excerpt: "Des ponts, pas des barrières.", body: ["Annoncez 5 minutes, puis 2 minutes, puis maintenant. Ajoutez un minuteur visuel que l'enfant peut voir.", "Faites le pont avec un objet aimé : une carte, une chanson, un petit rituel."] },
  "starter-aac": { title: "Construire un premier vocabulaire CAA", category: "Parole et communication", excerpt: "Les 30 premiers mots qui ouvrent de vraies conversations.", body: ["Commencez par les verbes et les émotions, pas seulement les noms. « veux », « aide », « stop », « encore », « fini » portent toute une journée.", "Montrez vous-même l'usage de l'outil. Les enfants copient ce qu'ils voient modélisé, pas seulement ce qu'on leur demande."] },
  "aided-language": { title: "Modéliser avec douceur en langage assisté", category: "Parole et communication", excerpt: "Parler avec les cartes, pas vers l'enfant.", body: ["Quand vous parlez, touchez aussi les cartes. Aucune pression pour répondre. L'exposition enseigne.", "Visez beaucoup de modèles dans la journée ; cela paraît énorme, mais un goûter en offre déjà plusieurs."] },
  "bilingual-homes": { title: "Maisons bilingues : quand changer de langue", category: "Parole et communication", excerpt: "Les deux langues peuvent grandir ensemble.", body: ["Utilisez à la maison la langue du cœur. Gardez la langue de l'école pour l'école si cela aide. Les enfants organisent souvent cela avec beauté.", "Des cartes illustrées dans les deux langues réduisent les frictions pendant les transitions."] },
  "stuttering": { title: "Bégaiement : ce qui aide, ce qui blesse", category: "Parole et communication", excerpt: "Une écoute douce ouvre plus d'espace que le coaching.", body: ["Ne terminez pas ses phrases. Ralentissez votre propre parole et laissez plus de pauses entre les tours.", "Valorisez le message, pas la fluidité."] },
  "sensory-diet": { title: "Une diète sensorielle qui tient dans la vraie vie", category: "Sensoriel et sommeil", excerpt: "De petits apports dans la journée, pas une liste de contrôle.", body: ["Le travail lourd — porter, pousser — régule souvent plus vite que les écrans. Deux minutes peuvent suffire.", "Cartographiez la journée : apport le matin, calme à midi, descente douce le soir."] },
  "sounds-that-soothe": { title: "Les sons qui apaisent — et ceux à éviter", category: "Sensoriel et sommeil", excerpt: "Bruit rose, fredonnement doux, cordes graves de violoncelle.", body: ["Évitez les changements brusques de fréquence. Bouclez la même piste douce au coucher pour créer une ancre sonore.", "Un casque à volume limité est un petit super-pouvoir calme."] },
  "little-lamp": { title: "Histoire du soir : « La petite lampe »", category: "Sensoriel et sommeil", excerpt: "Une lecture douce sur le fait d'être petit et lumineux.", body: ["La petite lampe vivait sur le rebord d'une fenêtre. Elle n'était pas la plus brillante, mais elle était la plus chaude.", "Chaque nuit, elle regardait la lune et murmurait : « Tu n'es pas seul·e. » Et la chambre était d'accord.", "Et nous aussi."] },
  "untangle-overstim": { title: "Démêler tôt la surstimulation", category: "Sensoriel et sommeil", excerpt: "Repérer les petits signaux avant les grands.", body: ["Observez le clignement des yeux, la tension des doigts, la respiration qui raccourcit. Proposez une sortie calme avant la tempête.", "Sortir est une gentillesse, pas un échec."] },
  "breakfast-plates": { title: "Assiettes de petit-déjeuner adaptées à l'autisme", category: "Recettes et routines", excerpt: "Même formes, mêmes couleurs, peu de surprise.", body: ["Des assiettes prévisibles baissent les frottements du matin. Trois sections, les mêmes couleurs chaque jour, la nouveauté comme option.", "Laissez l'enfant placer lui-même un aliment : l'autonomie nourrit aussi l'appétit."] },
  "brushing-teeth": { title: "Se brosser les dents en 6 étapes visuelles", category: "Recettes et routines", excerpt: "Une séquence d'images + un minuteur doux = victoire.", body: ["1) Mouiller la brosse. 2) Un petit pois de dentifrice. 3) Cercles en haut. 4) Cercles en bas. 5) Cracher. 6) Sourire au miroir.", "Utilisez la même chanson à chaque fois ; le cerveau aime les rituels."] },
  "calm-laundry": { title: "Routine calme pour aider au linge", category: "Recettes et routines", excerpt: "Trier les chaussettes est une thérapie sensorielle déguisée.", body: ["Associez les chaussettes par couleur. Aplatissez le tissu. Portez le panier : un travail lourd tout doux.", "Terminez par un étirement et une gorgée d'eau."] },
  "smoothies": { title: "Smoothies lisses et sensoriellement sûrs", category: "Recettes et routines", excerpt: "La même texture à chaque fois.", body: ["Banane, lait d'avoine, une cuillère de beurre d'amande, une pincée de cannelle. Mixez jusqu'à obtenir une texture soyeuse.", "Servez dans le même verre. La même paille. Le calme gagne."] },
};

export const articles: Article[] = ARTICLES_EN;

export function articleForLang(article: Article, lang: ContentLang): Article {
  if (lang !== "fr") return article;
  const fr = ARTICLES_FR[article.slug];
  return fr ? { ...article, ...fr } : article;
}

export const articlesForLang = (lang: ContentLang) => articles.map((a) => articleForLang(a, lang));

export const articleBySlug = (slug: string, lang: ContentLang = "en") => {
  const article = articles.find((a) => a.slug === slug);
  return article ? articleForLang(article, lang) : undefined;
};

export function auditKuaContentTranslations() {
  const missing: string[] = [];
  const mismatched: string[] = [];
  for (const article of ARTICLES_EN) {
    const fr = ARTICLES_FR[article.slug];
    if (!fr) {
      missing.push(`article:${article.slug}`);
      continue;
    }
    for (const field of ["title", "category", "excerpt"] as const) {
      if (!fr[field]) missing.push(`article:${article.slug}:${field}`);
    }
    if (!Array.isArray(fr.body) || fr.body.length === 0) missing.push(`article:${article.slug}:body`);
    if (fr.body.length !== article.body.length) mismatched.push(`article:${article.slug}:body (en=${article.body.length}, fr=${fr.body.length})`);
  }
  return { ok: missing.length === 0 && mismatched.length === 0, missing, mismatched };
}

export type Journey = {
  slug: string;
  title: string;
  intro: string;
  milestones: { title: string; done: boolean; note: string }[];
};

export const journeys: Journey[] = [
  {
    slug: "communication",
    title: "Communication",
    intro: "Every gesture, sound and tap is communication. We celebrate them all.",
    milestones: [
      { title: "Points to ask for an item", done: true, note: "First seen at the park, asking for a swing." },
      { title: "Uses a single AAC card unprompted", done: true, note: "'Water' at lunch - beautiful." },
      { title: "Combines two cards", done: true, note: "'More + play' on the carpet." },
      { title: "Greets a familiar adult", done: true, note: "Waved at grandma." },
      { title: "Says or signs 'help'", done: true, note: "Reached for the puzzle, signed help." },
      { title: "Uses a feeling word", done: true, note: "Tapped 'tired' after school." },
      { title: "Builds a 3-card sentence", done: true, note: "'I want hug.'" },
      { title: "Asks a question", done: false, note: "" },
      { title: "Tells a small story", done: false, note: "" },
      { title: "Uses the toilet word independently", done: false, note: "" },
      { title: "Initiates a play invitation", done: false, note: "" },
      { title: "Comforts another with words", done: false, note: "" },
    ],
  },
  {
    slug: "emotional-regulation",
    title: "Emotional Regulation",
    intro: "Naming, breathing, repairing. Soft skills, strong roots.",
    milestones: [
      { title: "Notices a body signal", done: true, note: "" },
      { title: "Accepts co-regulation", done: true, note: "" },
      { title: "Uses a calming corner", done: true, note: "" },
      { title: "Picks a feeling card", done: true, note: "" },
      { title: "Tries a breath together", done: true, note: "" },
      { title: "Names a feeling out loud", done: false, note: "" },
      { title: "Asks for a break", done: false, note: "" },
      { title: "Repairs after a meltdown", done: false, note: "" },
      { title: "Helps a peer settle", done: false, note: "" },
      { title: "Reflects on a hard moment later", done: false, note: "" },
    ],
  },
  {
    slug: "social-skills",
    title: "Social Skills",
    intro: "Connection at one's own pace, on one's own terms.",
    milestones: [
      { title: "Plays alongside another child", done: true, note: "" },
      { title: "Shares an object briefly", done: true, note: "" },
      { title: "Takes a turn with support", done: true, note: "" },
      { title: "Greets a peer", done: false, note: "" },
      { title: "Joins a familiar game", done: false, note: "" },
      { title: "Invites a peer to play", done: false, note: "" },
      { title: "Resolves a small conflict", done: false, note: "" },
      { title: "Notices a friend's feeling", done: false, note: "" },
    ],
  },
  {
    slug: "independence",
    title: "Independence",
    intro: "Small autonomies, daily wins.",
    milestones: [
      { title: "Puts on shoes with help", done: true, note: "" },
      { title: "Brushes teeth with cues", done: true, note: "" },
      { title: "Pours water from a small jug", done: true, note: "" },
      { title: "Packs the school bag", done: true, note: "" },
      { title: "Sets the table", done: true, note: "" },
      { title: "Gets dressed alone", done: true, note: "" },
      { title: "Prepares a simple snack", done: false, note: "" },
      { title: "Crosses the street with rules", done: false, note: "" },
      { title: "Manages laundry basket", done: false, note: "" },
    ],
  },
  {
    slug: "cognitive-skills",
    title: "Cognitive Skills",
    intro: "Curiosity, sequencing, focus. The thinking garden.",
    milestones: [
      { title: "Sorts by colour", done: true, note: "" },
      { title: "Sorts by shape", done: true, note: "" },
      { title: "Counts to 10", done: true, note: "" },
      { title: "Completes a 6-piece puzzle", done: true, note: "" },
      { title: "Follows a 3-step instruction", done: false, note: "" },
      { title: "Recognises name in print", done: false, note: "" },
      { title: "Matches letter to sound", done: false, note: "" },
      { title: "Understands 'first/then'", done: false, note: "" },
      { title: "Solves a simple if/then", done: false, note: "" },
      { title: "Plans a 2-step activity", done: false, note: "" },
      { title: "Tells time on the hour", done: false, note: "" },
    ],
  },
  {
    slug: "physical-coordination",
    title: "Physical Coordination",
    intro: "Whole-body confidence, calm hands.",
    milestones: [
      { title: "Walks up stairs with rail", done: true, note: "" },
      { title: "Hops on one foot", done: true, note: "" },
      { title: "Throws a soft ball", done: true, note: "" },
      { title: "Catches a soft ball", done: true, note: "" },
      { title: "Rides a balance bike", done: false, note: "" },
      { title: "Cuts along a line", done: false, note: "" },
      { title: "Writes own name", done: false, note: "" },
    ],
  },
];

export const journeyBySlug = (slug: string) => journeys.find((j) => j.slug === slug);

const JOURNEYS_FR: Record<string, { title: string; intro: string; milestones: { title: string; note?: string }[] }> = {
  "communication": {
    title: "Communication",
    intro: "Chaque geste, son et tape est une communication. Nous les célébrons tous.",
    milestones: [
      { title: "Pointe pour demander un objet", note: "Vu au parc, demandant la balançoire." },
      { title: "Utilise une carte CAA sans incitation", note: "« Eau » au déjeuner — magnifique." },
      { title: "Combine deux cartes", note: "« Encore + jouer » sur le tapis." },
      { title: "Salue un adulte familier", note: "A salué grand-mère." },
      { title: "Dit ou signe « aide »", note: "A tendu la main vers le puzzle, a signé aide." },
      { title: "Utilise un mot de ressenti", note: "A tapé « fatigué » après l'école." },
      { title: "Construit une phrase de 3 cartes", note: "« Je veux câlin. »" },
      { title: "Pose une question" },
      { title: "Raconte une petite histoire" },
      { title: "Utilise le mot pour les toilettes seul" },
      { title: "Initie une invitation à jouer" },
      { title: "Réconforte un autre avec des mots" },
    ],
  },
  "emotional-regulation": {
    title: "Régulation émotionnelle",
    intro: "Nommer, respirer, réparer. Compétences douces, racines fortes.",
    milestones: [
      { title: "Remarque un signal corporel" },
      { title: "Accepte la co-régulation" },
      { title: "Utilise un coin calme" },
      { title: "Choisit une carte de ressenti" },
      { title: "Essaie une respiration ensemble" },
      { title: "Nomme une émotion à voix haute" },
      { title: "Demande une pause" },
      { title: "Répare après une crise" },
      { title: "Aide un pair à s'apaiser" },
      { title: "Réfléchit à un moment difficile plus tard" },
    ],
  },
  "social-skills": {
    title: "Habiletés sociales",
    intro: "Connexion à son propre rythme, selon ses propres termes.",
    milestones: [
      { title: "Joue à côté d'un autre enfant" },
      { title: "Partage un objet brièvement" },
      { title: "Prend un tour avec soutien" },
      { title: "Salue un pair" },
      { title: "Rejoint un jeu familier" },
      { title: "Invite un pair à jouer" },
      { title: "Résout un petit conflit" },
      { title: "Remarque l'émotion d'un ami" },
    ],
  },
  "independence": {
    title: "Autonomie",
    intro: "Petites autonomies, victoires quotidiennes.",
    milestones: [
      { title: "Met ses chaussures avec aide" },
      { title: "Se brosse les dents avec rappels" },
      { title: "Verse de l'eau d'un petit pichet" },
      { title: "Prépare le sac d'école" },
      { title: "Met la table" },
      { title: "S'habille seul" },
      { title: "Prépare une collation simple" },
      { title: "Traverse la rue avec les règles" },
      { title: "Gère le panier à linge" },
    ],
  },
  "cognitive-skills": {
    title: "Habiletés cognitives",
    intro: "Curiosité, séquençage, concentration. Le jardin de la pensée.",
    milestones: [
      { title: "Trie par couleur" },
      { title: "Trie par forme" },
      { title: "Compte jusqu'à 10" },
      { title: "Complète un puzzle de 6 pièces" },
      { title: "Suit une consigne en 3 étapes" },
      { title: "Reconnaît son nom écrit" },
      { title: "Associe lettre et son" },
      { title: "Comprend « d'abord/ensuite »" },
      { title: "Résout un simple si/alors" },
      { title: "Planifie une activité en 2 étapes" },
      { title: "Lit l'heure pile" },
    ],
  },
  "physical-coordination": {
    title: "Coordination physique",
    intro: "Confiance corporelle complète, mains apaisées.",
    milestones: [
      { title: "Monte les escaliers avec rampe" },
      { title: "Saute sur un pied" },
      { title: "Lance une balle souple" },
      { title: "Attrape une balle souple" },
      { title: "Fait du vélo d'équilibre" },
      { title: "Coupe le long d'une ligne" },
      { title: "Écrit son nom" },
    ],
  },
};

export function journeyForLang(j: Journey, lang: "en" | "fr"): Journey {
  if (lang !== "fr") return j;
  const fr = JOURNEYS_FR[j.slug];
  if (!fr) return j;
  return {
    ...j,
    title: fr.title,
    intro: fr.intro,
    milestones: j.milestones.map((m, i) => ({
      ...m,
      title: fr.milestones[i]?.title ?? m.title,
      note: fr.milestones[i]?.note ?? m.note,
    })),
  };
}

export type Subject = {
  slug: string;
  title: string;
  blurb: string;
  lessons: { title: string; minutes: number }[];
};

export const subjects: Subject[] = [
  { slug: "languages", title: "Languages (English & French)", blurb: "Two tongues, one calm voice - playful bilingual practice.", lessons: [
    { title: "Greetings: Hello / Bonjour", minutes: 5 },
    { title: "Family names in both languages", minutes: 7 },
    { title: "Colours and numbers 1–10", minutes: 8 },
    { title: "Reading a short bilingual story", minutes: 10 },
    { title: "Songs and rhymes (FR/EN)", minutes: 6 },
  ]},
  { slug: "arithmetic", title: "Arithmetic", blurb: "Number sense built through soft, repeatable patterns.", lessons: [
    { title: "Counting with quiet objects", minutes: 6 },
    { title: "Patterns of two and three", minutes: 8 },
    { title: "Adding with picture sums", minutes: 10 },
    { title: "Taking away, gently", minutes: 8 },
    { title: "Shapes around the home", minutes: 7 },
  ]},
  { slug: "writing", title: "Writing", blurb: "Pencil grip, letters, words - one calm stroke at a time.", lessons: [
    { title: "Pre-writing lines and curves", minutes: 6 },
    { title: "Tracing the alphabet", minutes: 9 },
    { title: "Writing my own name", minutes: 7 },
    { title: "Short sentences about today", minutes: 10 },
  ]},
  { slug: "reading", title: "Reading", blurb: "From sounds to stories, never rushed.", lessons: [
    { title: "Letter sounds (phonics)", minutes: 8 },
    { title: "Blending simple words", minutes: 9 },
    { title: "Sight words for everyday life", minutes: 7 },
    { title: "Reading a picture book together", minutes: 12 },
  ]},
  { slug: "art", title: "Art & Craft", blurb: "Hands, colours and texture as quiet self-expression.", lessons: [
    { title: "Colour mixing with three paints", minutes: 8 },
    { title: "Drawing my family", minutes: 9 },
    { title: "Paper-folding shapes", minutes: 7 },
    { title: "Nature collage with leaves", minutes: 10 },
  ]},
  { slug: "music", title: "Music", blurb: "Sound as friend, not stimulus.", lessons: [
    { title: "Soft drums on the lap", minutes: 6 },
    { title: "Humming a familiar tune", minutes: 5 },
    { title: "Loud and quiet, naming both", minutes: 7 },
    { title: "Lullabies from many homes", minutes: 9 },
  ]},
  { slug: "pe", title: "Physical Education (PE)", blurb: "Movement that fits the body of the day.", lessons: [
    { title: "Gentle warm-up routine", minutes: 5 },
    { title: "Balance games at home", minutes: 7 },
    { title: "Throwing and catching softly", minutes: 8 },
    { title: "Cooling down with stretches", minutes: 6 },
  ]},
  { slug: "health-education", title: "Health Education", blurb: "Caring for body and mind, day by day.", lessons: [
    { title: "Naming the food groups", minutes: 7 },
    { title: "Washing hands the right way", minutes: 5 },
    { title: "Why sleep matters", minutes: 6 },
    { title: "Big feelings and what helps", minutes: 9 },
  ]},
  { slug: "civics", title: "Civics & Values", blurb: "Kindness, fairness and belonging - learned together.", lessons: [
    { title: "Rules at home and at school", minutes: 6 },
    { title: "Sharing and taking turns", minutes: 7 },
    { title: "My country and its flag", minutes: 8 },
    { title: "Helpers in our community", minutes: 7 },
  ]},
  { slug: "cultural-studies", title: "Cultural Studies", blurb: "Stories, food and traditions of our many homes.", lessons: [
    { title: "Festivals across Africa", minutes: 9 },
    { title: "Family languages and names", minutes: 7 },
    { title: "Food we share at home", minutes: 6 },
    { title: "Folktales told softly", minutes: 11 },
  ]},
  { slug: "geography", title: "Geography", blurb: "From our room to the wider world, gently.", lessons: [
    { title: "My room is a map", minutes: 5 },
    { title: "Continents in seven cards", minutes: 9 },
    { title: "Rivers, lakes, oceans", minutes: 8 },
    { title: "Where does the rain go?", minutes: 6 },
  ]},
  { slug: "environmental-science", title: "Environmental Science", blurb: "Care for the earth as a daily practice.", lessons: [
    { title: "Seeds, soil, sunlight", minutes: 8 },
    { title: "Where does our water start?", minutes: 9 },
    { title: "Sorting and reusing at home", minutes: 6 },
    { title: "Trees as quiet helpers", minutes: 7 },
  ]},
];

export const subjectBySlug = (slug: string) => subjects.find((s) => s.slug === slug);
