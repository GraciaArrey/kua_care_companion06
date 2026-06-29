// Bilingual content for the Faith & Guidance section.
// Tone: compassionate, calm, hopeful, gentle, emotionally reassuring.

export type Bi = { en: string; fr: string };

export type Verse = {
  ref: Bi;
  verse: Bi;
  meaning: Bi;
  forChildren: Bi;
  reminder: Bi;
  reflection: Bi;
  affirmation: Bi;
};

export type Story = {
  title: Bi;
  summary: Bi;
  takeaway: Bi;
  prompt: Bi;
};

export type Lesson = { title: Bi; text: Bi };
export type Routine = { title: Bi; steps: Bi[] };

// ───────────────────────────── CHRISTIANITY ─────────────────────────────
export const christianity = {
  verses: [
    {
      ref: { en: "1 John 4:16", fr: "1 Jean 4:16" },
      verse: {
        en: "God is love. Whoever lives in love lives in God.",
        fr: "Dieu est amour. Celui qui demeure dans l'amour demeure en Dieu.",
      },
      meaning: {
        en: "God's love is steady and gentle. It does not run out.",
        fr: "L'amour de Dieu est doux et constant. Il ne s'épuise jamais.",
      },
      forChildren: {
        en: "You are loved, exactly as you are today.",
        fr: "Tu es aimé·e, exactement comme tu es aujourd'hui.",
      },
      reminder: {
        en: "Place a hand on your heart and breathe slowly three times.",
        fr: "Pose une main sur ton cœur et respire lentement trois fois.",
      },
      reflection: {
        en: "Who can I show kind love to today?",
        fr: "À qui puis-je montrer un amour doux aujourd'hui ?",
      },
      affirmation: { en: "I am loved. I am safe.", fr: "Je suis aimé·e. Je suis en sécurité." },
    },
    {
      ref: { en: "Philippians 4:6-7", fr: "Philippiens 4:6-7" },
      verse: {
        en: "Do not be anxious. Bring everything to God, and his peace will guard your heart.",
        fr: "Ne sois pas anxieux. Confie tout à Dieu, et sa paix gardera ton cœur.",
      },
      meaning: { en: "We can give our worries to God and feel calmer.", fr: "Nous pouvons confier nos soucis à Dieu et nous sentir plus calmes." },
      forChildren: { en: "When something feels too big, you can talk to God.", fr: "Quand une chose semble trop grande, tu peux parler à Dieu." },
      reminder: { en: "Whisper one worry. Then breathe out slowly.", fr: "Chuchote un souci. Puis expire doucement." },
      reflection: { en: "What worry can I let go of right now?", fr: "Quel souci puis-je laisser partir maintenant ?" },
      affirmation: { en: "Peace is near to me.", fr: "La paix est près de moi." },
    },
    {
      ref: { en: "Ephesians 4:32", fr: "Éphésiens 4:32" },
      verse: { en: "Be kind to one another, forgiving each other.", fr: "Soyez bons les uns envers les autres, pardonnant-vous." },
      meaning: { en: "Kindness and forgiveness make our hearts lighter.", fr: "La bonté et le pardon allègent notre cœur." },
      forChildren: { en: "Saying sorry and forgiving are brave, kind acts.", fr: "Dire pardon et pardonner sont des actes courageux et doux." },
      reminder: { en: "Think of one person to be extra gentle with today.", fr: "Pense à une personne envers qui être très doux aujourd'hui." },
      reflection: { en: "How does kindness feel inside my body?", fr: "Comment la bonté se sent-elle dans mon corps ?" },
      affirmation: { en: "I choose kindness today.", fr: "Je choisis la bonté aujourd'hui." },
    },
  ] as Verse[],

  stories: [
    { title: { en: "Noah and Listening Carefully", fr: "Noé et l'écoute attentive" },
      summary: { en: "Noah listened patiently and built a safe place for his family and animals.", fr: "Noé a écouté patiemment et a construit un refuge sûr pour sa famille et les animaux." },
      takeaway: { en: "Listening helps us feel safe.", fr: "Écouter nous aide à nous sentir en sécurité." },
      prompt: { en: "When did listening help you feel calm?", fr: "Quand l'écoute t'a-t-elle aidé·e à te sentir calme ?" } },
    { title: { en: "David and Courage", fr: "David et le courage" },
      summary: { en: "Even though David was small, he was brave with a gentle heart.", fr: "Bien que petit, David fut courageux avec un cœur doux." },
      takeaway: { en: "Courage can be quiet.", fr: "Le courage peut être discret." },
      prompt: { en: "What is one brave thing you can try today?", fr: "Quelle action courageuse peux-tu essayer aujourd'hui ?" } },
    { title: { en: "Jesus Calming the Storm", fr: "Jésus apaise la tempête" },
      summary: { en: "When the waves felt too big, Jesus brought peace with a gentle word.", fr: "Quand les vagues semblaient trop grandes, Jésus apporta la paix d'un mot doux." },
      takeaway: { en: "Big feelings can soften.", fr: "Les grandes émotions peuvent s'apaiser." },
      prompt: { en: "What helps your storm feel calmer?", fr: "Qu'est-ce qui apaise ta tempête ?" } },
    { title: { en: "The Good Samaritan", fr: "Le bon Samaritain" },
      summary: { en: "A traveler stopped to help a stranger with patience and care.", fr: "Un voyageur s'arrêta pour aider un inconnu avec patience et soin." },
      takeaway: { en: "Helping is a gift.", fr: "Aider est un cadeau." },
      prompt: { en: "Who could use a helping hand today?", fr: "Qui pourrait avoir besoin d'aide aujourd'hui ?" } },
    { title: { en: "The Lost Sheep", fr: "La brebis perdue" },
      summary: { en: "A shepherd searched for one little sheep until it was safe again.", fr: "Un berger chercha une petite brebis jusqu'à ce qu'elle soit en sécurité." },
      takeaway: { en: "You are never forgotten.", fr: "Tu n'es jamais oublié·e." },
      prompt: { en: "Where do you feel safest?", fr: "Où te sens-tu le plus en sécurité ?" } },
    { title: { en: "Feeding the Multitude", fr: "La multiplication des pains" },
      summary: { en: "A small lunch shared with care fed many people.", fr: "Un petit repas partagé avec soin a nourri beaucoup de personnes." },
      takeaway: { en: "Sharing makes things grow.", fr: "Partager fait grandir les choses." },
      prompt: { en: "What can you share today?", fr: "Que peux-tu partager aujourd'hui ?" } },
    { title: { en: "Zacchaeus and Honesty", fr: "Zachée et l'honnêteté" },
      summary: { en: "Zacchaeus chose honesty and made things right.", fr: "Zachée a choisi l'honnêteté et a réparé ses torts." },
      takeaway: { en: "Truth makes hearts lighter.", fr: "La vérité allège les cœurs." },
      prompt: { en: "How does telling the truth feel?", fr: "Que ressens-tu en disant la vérité ?" } },
    { title: { en: "Joseph and Forgiveness", fr: "Joseph et le pardon" },
      summary: { en: "Joseph chose to forgive and to keep his heart soft.", fr: "Joseph a choisi de pardonner et de garder un cœur doux." },
      takeaway: { en: "Forgiveness is a gentle strength.", fr: "Le pardon est une force douce." },
      prompt: { en: "Is there something small to forgive today?", fr: "Y a-t-il une petite chose à pardonner aujourd'hui ?" } },
    { title: { en: "Daniel and Bravery", fr: "Daniel et la bravoure" },
      summary: { en: "Daniel stayed kind and brave, even when it was hard.", fr: "Daniel resta bon et courageux, même quand c'était difficile." },
      takeaway: { en: "We can be brave and kind.", fr: "On peut être courageux·se et doux·ce." },
      prompt: { en: "When did you feel brave recently?", fr: "Quand t'es-tu senti·e courageux·se récemment ?" } },
    { title: { en: "Esther and Confidence", fr: "Esther et la confiance" },
      summary: { en: "Esther spoke up gently to help her people.", fr: "Esther a pris la parole avec douceur pour aider son peuple." },
      takeaway: { en: "Quiet voices matter.", fr: "Les voix douces comptent." },
      prompt: { en: "What would you like to say today?", fr: "Qu'aimerais-tu dire aujourd'hui ?" } },
  ] as Story[],

  values: [
    { title: { en: "Speaking Gently", fr: "Parler avec douceur" }, text: { en: "Soft voices help others feel safe.", fr: "Les voix douces apaisent les autres." } },
    { title: { en: "Helping Others", fr: "Aider les autres" }, text: { en: "Small help can mean a lot.", fr: "Un petit geste peut beaucoup signifier." } },
    { title: { en: "Being Honest", fr: "Être honnête" }, text: { en: "The truth keeps hearts at ease.", fr: "La vérité apaise les cœurs." } },
    { title: { en: "Respecting Parents", fr: "Respecter ses parents" }, text: { en: "Listening with love builds trust.", fr: "Écouter avec amour bâtit la confiance." } },
    { title: { en: "Sharing", fr: "Partager" }, text: { en: "Sharing turns small joys into big ones.", fr: "Partager rend les petites joies plus grandes." } },
    { title: { en: "Loving Neighbors", fr: "Aimer son prochain" }, text: { en: "Everyone we meet deserves kindness.", fr: "Toute personne mérite notre bonté." } },
    { title: { en: "Self-Control", fr: "La maîtrise de soi" }, text: { en: "Pause first, then choose with care.", fr: "Faire une pause, puis choisir avec soin." } },
    { title: { en: "Patience", fr: "La patience" }, text: { en: "Good things grow slowly.", fr: "Les bonnes choses poussent lentement." } },
    { title: { en: "Compassion", fr: "La compassion" }, text: { en: "Notice others with a soft heart.", fr: "Remarquer les autres avec un cœur tendre." } },
    { title: { en: "Thankfulness", fr: "La gratitude" }, text: { en: "Saying thank you brightens the day.", fr: "Dire merci illumine la journée." } },
  ] as Lesson[],

  regulation: [
    { title: { en: "What To Do When Angry", fr: "Que faire en colère" }, text: { en: "Pause, breathe, and whisper a small prayer for calm.", fr: "Pause, respire, et murmure une petite prière pour le calme." } },
    { title: { en: "Praying During Worry", fr: "Prier dans l'inquiétude" }, text: { en: "Tell God what feels heavy. Let the breath out slowly.", fr: "Dis à Dieu ce qui pèse. Expire lentement." } },
    { title: { en: "Deep Breathing and Calmness", fr: "Respiration profonde et calme" }, text: { en: "Breathe in for 4, hold for 4, breathe out for 6.", fr: "Inspire 4, retiens 4, expire 6." } },
    { title: { en: "God Understands Sadness", fr: "Dieu comprend la tristesse" }, text: { en: "It is okay to feel sad. You are not alone.", fr: "C'est ok d'être triste. Tu n'es pas seul·e." } },
    { title: { en: "Handling Big Feelings", fr: "Gérer les grandes émotions" }, text: { en: "Name it, breathe it, share it.", fr: "Nomme-la, respire, partage-la." } },
    { title: { en: "Quiet Time With God", fr: "Temps calme avec Dieu" }, text: { en: "Sit softly. Listen with your heart for two minutes.", fr: "Assieds-toi doucement. Écoute avec ton cœur deux minutes." } },
    { title: { en: "Rest During Overwhelm", fr: "Repos quand c'est trop" }, text: { en: "Lie down, dim the lights, hand on heart.", fr: "Allonge-toi, baisse la lumière, main sur le cœur." } },
    { title: { en: "Asking for Help", fr: "Demander de l'aide" }, text: { en: "Asking is brave. Trusted grown-ups want to help.", fr: "Demander est courageux. Les adultes de confiance veulent aider." } },
  ] as Lesson[],

  bedtime: [
    { title: { en: "God Watches Over You", fr: "Dieu veille sur toi" }, text: { en: "You are held safely tonight.", fr: "Tu es tenu·e en sécurité ce soir." } },
    { title: { en: "Safe and Loved", fr: "En sécurité et aimé·e" }, text: { en: "Soft hearts sleep peacefully.", fr: "Les cœurs doux dorment paisiblement." } },
    { title: { en: "Peaceful Hearts", fr: "Cœurs paisibles" }, text: { en: "Let go of the day with one slow breath.", fr: "Laisse partir le jour d'un souffle lent." } },
    { title: { en: "Tomorrow Is a New Day", fr: "Demain est un nouveau jour" }, text: { en: "Each morning brings fresh light.", fr: "Chaque matin apporte une lumière nouvelle." } },
    { title: { en: "Thank You for Today", fr: "Merci pour aujourd'hui" }, text: { en: "Name one small good thing from today.", fr: "Nomme une petite belle chose d'aujourd'hui." } },
  ] as Lesson[],

  prayers: [
    { title: { en: "A Morning Prayer", fr: "Prière du matin" }, text: { en: "Thank you, God, for this new day. Help me be kind and brave.", fr: "Merci, Dieu, pour ce nouveau jour. Aide-moi à être bon et courageux." } },
    { title: { en: "A Calm-Down Prayer", fr: "Prière pour se calmer" }, text: { en: "Lord, my heart feels big. Please help it feel soft again.", fr: "Seigneur, mon cœur est grand. Aide-le à redevenir doux." } },
    { title: { en: "A Gratitude Prayer", fr: "Prière de gratitude" }, text: { en: "Thank you for the people who love me and the small joys today.", fr: "Merci pour ceux qui m'aiment et pour les petites joies du jour." } },
    { title: { en: "A Bedtime Prayer", fr: "Prière du soir" }, text: { en: "Watch over me as I sleep. Bring peaceful dreams.", fr: "Veille sur moi pendant que je dors. Apporte de doux rêves." } },
    { title: { en: "A Caregiver Prayer", fr: "Prière pour l'aidant·e" }, text: { en: "Give me patience, gentleness, and rest today.", fr: "Donne-moi patience, douceur et repos aujourd'hui." } },
  ] as Lesson[],

  caregiver: [
    { title: { en: "Patience During Hard Days", fr: "La patience les jours difficiles" }, text: { en: "Hard days end. You are doing enough.", fr: "Les jours difficiles passent. Tu fais déjà beaucoup." } },
    { title: { en: "Small Progress Matters", fr: "Les petits progrès comptent" }, text: { en: "Tiny steps still move forward.", fr: "Les petits pas avancent quand même." } },
    { title: { en: "Parenting With Grace", fr: "Élever avec grâce" }, text: { en: "Be gentle with yourself, too.", fr: "Sois doux·ce envers toi-même aussi." } },
    { title: { en: "Rest for Caregivers", fr: "Repos pour les aidants" }, text: { en: "Rest is sacred. It is not laziness.", fr: "Le repos est sacré. Ce n'est pas de la paresse." } },
    { title: { en: "Finding Strength Through Faith", fr: "Trouver la force par la foi" }, text: { en: "You are held even when you feel tired.", fr: "Tu es soutenu·e même fatigué·e." } },
    { title: { en: "You Are Not Alone", fr: "Tu n'es pas seul·e" }, text: { en: "There is a quiet community walking with you.", fr: "Une communauté discrète marche avec toi." } },
  ] as Lesson[],

  routines: [
    { title: { en: "Morning Prayer Routine", fr: "Routine de prière matinale" }, steps: [
      { en: "Sit calmly for 30 seconds.", fr: "Assieds-toi calmement 30 secondes." },
      { en: "Whisper a thank-you prayer.", fr: "Murmure une prière de gratitude." },
      { en: "Set one kind intention for today.", fr: "Choisis une intention douce pour aujourd'hui." },
    ]},
    { title: { en: "Gratitude Routine", fr: "Routine de gratitude" }, steps: [
      { en: "Name three small good things.", fr: "Nomme trois petites belles choses." },
      { en: "Say thank you out loud or quietly.", fr: "Dis merci, à voix haute ou en silence." },
    ]},
    { title: { en: "Kindness Challenge", fr: "Défi bonté" }, steps: [
      { en: "Pick one kind action for today.", fr: "Choisis une action bonne pour aujourd'hui." },
      { en: "Notice how it feels afterwards.", fr: "Remarque ce que tu ressens après." },
    ]},
    { title: { en: "Bedtime Reflection Routine", fr: "Routine de réflexion du soir" }, steps: [
      { en: "Breathe slowly three times.", fr: "Respire lentement trois fois." },
      { en: "Share one good moment from today.", fr: "Partage un bon moment du jour." },
      { en: "Whisper a short bedtime prayer.", fr: "Murmure une courte prière du soir." },
    ]},
  ] as Routine[],

  activities: [
    { title: { en: "Coloring Bible Stories", fr: "Colorier des récits bibliques" }, text: { en: "Color a quiet scene while listening to a story.", fr: "Colorie une scène calme en écoutant une histoire." } },
    { title: { en: "Kindness Chart", fr: "Tableau de bonté" }, text: { en: "Track small kind acts during the week.", fr: "Note les petites bontés de la semaine." } },
    { title: { en: "Gratitude Tree", fr: "Arbre de gratitude" }, text: { en: "Add a leaf for each thing you are thankful for.", fr: "Ajoute une feuille pour chaque gratitude." } },
    { title: { en: "Emotion Journaling", fr: "Journal des émotions" }, text: { en: "Draw or write how today felt.", fr: "Dessine ou écris comment tu te sens." } },
    { title: { en: "Storytelling Prompts", fr: "Idées d'histoires" }, text: { en: "Tell a short story about being brave or kind.", fr: "Raconte une histoire sur le courage ou la bonté." } },
  ] as Lesson[],
};

// ───────────────────────────── ISLAM ─────────────────────────────
export const islam = {
  duas: [
    { ref: { en: "A morning intention", fr: "Une intention du matin" },
      verse: { en: "Bismillah - In the name of Allah, the Most Gentle, the Most Merciful.", fr: "Bismillah - Au nom d'Allah, le Tout Doux, le Très Miséricordieux." },
      meaning: { en: "We start the day calmly, asking for gentleness.", fr: "Nous commençons la journée avec calme, en demandant la douceur." },
      forChildren: { en: "Allah is near. He hears every soft whisper.", fr: "Allah est proche. Il entend chaque murmure doux." },
      reminder: { en: "Take three slow breaths before you begin.", fr: "Prends trois respirations lentes avant de commencer." },
      reflection: { en: "What kind action can I do first today?", fr: "Quelle action douce puis-je faire en premier ?" },
      affirmation: { en: "Allah loves quiet, kind hearts.", fr: "Allah aime les cœurs doux et bons." } },
    { ref: { en: "A patience dua", fr: "Une dua pour la patience" },
      verse: { en: "Rabbi zidni ilma - My Lord, increase me in calm understanding.", fr: "Rabbi zidni ilma - Mon Seigneur, augmente-moi en compréhension paisible." },
      meaning: { en: "We ask for patience and understanding.", fr: "Nous demandons patience et compréhension." },
      forChildren: { en: "Slow down. It's okay to wait.", fr: "Ralentis. C'est ok d'attendre." },
      reminder: { en: "Count five soft breaths before you respond.", fr: "Compte cinq respirations douces avant de répondre." },
      reflection: { en: "When does waiting feel easier?", fr: "Quand attendre est-il plus facile ?" },
      affirmation: { en: "Patience makes my heart strong.", fr: "La patience rend mon cœur fort." } },
    { ref: { en: "A gratitude dua", fr: "Une dua de gratitude" },
      verse: { en: "Alhamdulillah - All praise is for Allah.", fr: "Alhamdulillah - Toute louange est à Allah." },
      meaning: { en: "We thank Allah for the small good things.", fr: "Nous remercions Allah pour les petites belles choses." },
      forChildren: { en: "Notice one small joy and say thank you.", fr: "Remarque une petite joie et dis merci." },
      reminder: { en: "Place a hand on your heart and smile softly.", fr: "Pose une main sur ton cœur et souris doucement." },
      reflection: { en: "What am I grateful for right now?", fr: "Pour quoi suis-je reconnaissant·e maintenant ?" },
      affirmation: { en: "Shukr brings calm to my heart.", fr: "Le shukr apaise mon cœur." } },
  ] as Verse[],

  stories: [
    { title: { en: "Prophet Muhammad and Kindness", fr: "Le Prophète Muhammad et la bonté" },
      summary: { en: "He spoke softly, smiled often and made room for everyone.", fr: "Il parlait doucement, souriait souvent et faisait place à chacun." },
      takeaway: { en: "A smile is a small act of kindness.", fr: "Un sourire est une petite bonté." },
      prompt: { en: "Who can you smile at today?", fr: "À qui peux-tu sourire aujourd'hui ?" } },
    { title: { en: "Prophet Nuh and Patience", fr: "Le Prophète Nuh et la patience" },
      summary: { en: "He kept going gently, even when it took a long time.", fr: "Il a continué doucement, même quand c'était long." },
      takeaway: { en: "Patience is quiet strength.", fr: "La patience est une force discrète." },
      prompt: { en: "What helps you keep going?", fr: "Qu'est-ce qui t'aide à continuer ?" } },
    { title: { en: "Prophet Yusuf and Forgiveness", fr: "Le Prophète Yusuf et le pardon" },
      summary: { en: "He chose to forgive and welcomed his family with care.", fr: "Il choisit de pardonner et accueillit sa famille avec soin." },
      takeaway: { en: "Forgiveness frees the heart.", fr: "Le pardon libère le cœur." },
      prompt: { en: "How does forgiving feel?", fr: "Que ressens-tu en pardonnant ?" } },
    { title: { en: "Prophet Musa and Courage", fr: "Le Prophète Musa et le courage" },
      summary: { en: "He was nervous, yet he asked Allah for help and kept going.", fr: "Il avait peur, mais il a demandé l'aide d'Allah et a continué." },
      takeaway: { en: "We can be scared and brave at once.", fr: "On peut être peureux·se et courageux·se en même temps." },
      prompt: { en: "What brave step can you take today?", fr: "Quel pas courageux peux-tu faire aujourd'hui ?" } },
    { title: { en: "Prophet Ibrahim and Trust", fr: "Le Prophète Ibrahim et la confiance" },
      summary: { en: "He trusted Allah even when the path was unclear.", fr: "Il a fait confiance à Allah même quand le chemin était flou." },
      takeaway: { en: "Trust softens worry.", fr: "La confiance apaise l'inquiétude." },
      prompt: { en: "What is one thing you can trust today?", fr: "Quelle chose peux-tu confier aujourd'hui ?" } },
    { title: { en: "Prophet Yunus and Hope", fr: "Le Prophète Yunus et l'espoir" },
      summary: { en: "Even in darkness, he turned to Allah and found light.", fr: "Même dans l'obscurité, il s'est tourné vers Allah et a trouvé la lumière." },
      takeaway: { en: "Hope finds us in quiet moments.", fr: "L'espoir nous trouve dans les moments calmes." },
      prompt: { en: "What gives you hope?", fr: "Qu'est-ce qui te donne de l'espoir ?" } },
    { title: { en: "Prophet Isa and Compassion", fr: "Le Prophète Isa et la compassion" },
      summary: { en: "He cared gently for those who felt alone.", fr: "Il prenait soin avec douceur de ceux qui se sentaient seuls." },
      takeaway: { en: "Compassion makes the world softer.", fr: "La compassion adoucit le monde." },
      prompt: { en: "Who could use a kind word?", fr: "Qui aurait besoin d'un mot doux ?" } },
  ] as Story[],

  values: [
    { title: { en: "Smiling Is Kindness", fr: "Sourire est une bonté" }, text: { en: "A smile is sadaqah.", fr: "Un sourire est une sadaqa." } },
    { title: { en: "Speaking Respectfully", fr: "Parler avec respect" }, text: { en: "Soft words open doors.", fr: "Les mots doux ouvrent les portes." } },
    { title: { en: "Sharing With Others", fr: "Partager avec les autres" }, text: { en: "Sharing brings barakah.", fr: "Partager apporte la barakah." } },
    { title: { en: "Cleanliness", fr: "La propreté" }, text: { en: "Cleanliness brings calm.", fr: "La propreté apporte le calme." } },
    { title: { en: "Patience (Sabr)", fr: "La patience (Sabr)" }, text: { en: "Sabr is a quiet strength.", fr: "Le sabr est une force discrète." } },
    { title: { en: "Honesty", fr: "L'honnêteté" }, text: { en: "Truth makes hearts steady.", fr: "La vérité stabilise les cœurs." } },
    { title: { en: "Respect for Elders", fr: "Respect des aînés" }, text: { en: "Listen with a soft heart.", fr: "Écoute avec un cœur doux." } },
    { title: { en: "Helping Others", fr: "Aider les autres" }, text: { en: "Helping is a kind ibadah.", fr: "Aider est une douce ibadah." } },
    { title: { en: "Good Manners", fr: "Bonnes manières" }, text: { en: "Akhlaq begins with small kindness.", fr: "L'akhlaq commence par les petites bontés." } },
  ] as Lesson[],

  regulation: [
    { title: { en: "Calming Down Before Speaking", fr: "Se calmer avant de parler" }, text: { en: "Sit, breathe, then speak softly.", fr: "Assieds-toi, respire, puis parle doucement." } },
    { title: { en: "Deep Breathing and Dhikr", fr: "Respiration et dhikr" }, text: { en: "SubhanAllah on the in-breath, Alhamdulillah on the out-breath.", fr: "SubhanAllah à l'inspiration, Alhamdulillah à l'expiration." } },
    { title: { en: "Allah Understands Difficult Feelings", fr: "Allah comprend les émotions difficiles" }, text: { en: "Your feelings are seen and heard.", fr: "Tes émotions sont vues et entendues." } },
    { title: { en: "Rest During Overwhelm", fr: "Repos quand c'est trop" }, text: { en: "Lie down. Soften the lights. Whisper Bismillah.", fr: "Allonge-toi. Baisse la lumière. Murmure Bismillah." } },
    { title: { en: "Patience During Frustration", fr: "Patience face à la frustration" }, text: { en: "Pause. Count to seven. Choose a soft word.", fr: "Pause. Compte jusqu'à sept. Choisis un mot doux." } },
    { title: { en: "Gentle Responses", fr: "Réponses douces" }, text: { en: "A soft answer cools a hot moment.", fr: "Une réponse douce apaise un moment chaud." } },
    { title: { en: "Asking Allah for Help", fr: "Demander l'aide d'Allah" }, text: { en: "Whisper your worry. Breathe out slowly.", fr: "Murmure ton souci. Expire lentement." } },
  ] as Lesson[],

  bedtime: [
    { title: { en: "Allah Protects You", fr: "Allah te protège" }, text: { en: "You are held in mercy tonight.", fr: "Tu es tenu·e dans la miséricorde ce soir." } },
    { title: { en: "Peaceful Sleep", fr: "Sommeil paisible" }, text: { en: "Soft heart, soft sleep.", fr: "Cœur doux, doux sommeil." } },
    { title: { en: "Gratitude Before Rest", fr: "Gratitude avant le repos" }, text: { en: "Name one good thing from today.", fr: "Nomme une belle chose du jour." } },
    { title: { en: "Calm Hearts", fr: "Cœurs calmes" }, text: { en: "Let go of the day with one slow breath.", fr: "Laisse partir le jour d'un souffle lent." } },
    { title: { en: "Mercy and Comfort", fr: "Miséricorde et réconfort" }, text: { en: "Allah's mercy is wider than the sky.", fr: "La miséricorde d'Allah est plus vaste que le ciel." } },
  ] as Lesson[],

  prayers: [
    { title: { en: "Bismillah", fr: "Bismillah" }, text: { en: "In the name of Allah, the Most Gentle, the Most Merciful.", fr: "Au nom d'Allah, le Tout Doux, le Très Miséricordieux." } },
    { title: { en: "A Calm Dhikr", fr: "Un dhikr apaisant" }, text: { en: "SubhanAllah · Alhamdulillah · Allahu Akbar.", fr: "SubhanAllah · Alhamdulillah · Allahu Akbar." } },
    { title: { en: "A Sleep Dua", fr: "Une dua avant le sommeil" }, text: { en: "Bismika Allahumma amutu wa ahya - In Your name, O Allah, I sleep and rise.", fr: "Bismika Allahumma amutu wa ahya - En Ton nom, ô Allah, je dors et je me lève." } },
    { title: { en: "A Caregiver Dua", fr: "Une dua pour l'aidant·e" }, text: { en: "Ya Allah, grant me patience, gentleness and rest.", fr: "Ô Allah, accorde-moi patience, douceur et repos." } },
    { title: { en: "A Gratitude Dua", fr: "Une dua de gratitude" }, text: { en: "Alhamdulillah for every small mercy today.", fr: "Alhamdulillah pour chaque petite miséricorde aujourd'hui." } },
  ] as Lesson[],

  caregiver: [
    { title: { en: "Parenting With Patience", fr: "Élever avec patience" }, text: { en: "Sabr with yourself, too.", fr: "Le sabr aussi pour toi-même." } },
    { title: { en: "Mercy in Caregiving", fr: "Miséricorde dans le soin" }, text: { en: "Be gentle. Allah is Ar-Rahman.", fr: "Sois doux·ce. Allah est Ar-Rahman." } },
    { title: { en: "Allah Rewards Compassion", fr: "Allah récompense la compassion" }, text: { en: "Soft choices are not invisible.", fr: "Les choix doux ne sont pas invisibles." } },
    { title: { en: "Rest and Self-Care", fr: "Repos et soin de soi" }, text: { en: "Rest is part of worship.", fr: "Le repos fait partie de l'adoration." } },
    { title: { en: "Small Progress Matters", fr: "Les petits progrès comptent" }, text: { en: "Quiet steps still count.", fr: "Les pas discrets comptent aussi." } },
    { title: { en: "Gentle Discipline", fr: "Discipline douce" }, text: { en: "Speak softly. Repeat with kindness.", fr: "Parle doucement. Répète avec bonté." } },
  ] as Lesson[],

  routines: [
    { title: { en: "Morning Duas", fr: "Duas du matin" }, steps: [
      { en: "Whisper Bismillah.", fr: "Murmure Bismillah." },
      { en: "Set one gentle intention.", fr: "Choisis une intention douce." },
      { en: "Breathe slowly three times.", fr: "Respire lentement trois fois." },
    ]},
    { title: { en: "Bedtime Duas", fr: "Duas du soir" }, steps: [
      { en: "Soften the lights.", fr: "Baisse la lumière." },
      { en: "Recite a short sleep dua.", fr: "Récite une courte dua du soir." },
      { en: "Name one gratitude.", fr: "Nomme une gratitude." },
    ]},
    { title: { en: "Kindness Routine", fr: "Routine de bonté" }, steps: [
      { en: "Choose one kind act for today.", fr: "Choisis une bonté pour aujourd'hui." },
      { en: "Smile - it is sadaqah.", fr: "Souris - c'est une sadaqa." },
    ]},
    { title: { en: "Calm-Down Dhikr Routine", fr: "Routine de dhikr apaisant" }, steps: [
      { en: "Inhale: SubhanAllah.", fr: "Inspire : SubhanAllah." },
      { en: "Exhale: Alhamdulillah.", fr: "Expire : Alhamdulillah." },
      { en: "Repeat seven times.", fr: "Répète sept fois." },
    ]},
  ] as Routine[],

  activities: [
    { title: { en: "Islamic Coloring Pages", fr: "Pages à colorier islamiques" }, text: { en: "Color soft geometric patterns calmly.", fr: "Colorie des motifs géométriques doux." } },
    { title: { en: "Kindness Calendar", fr: "Calendrier de bonté" }, text: { en: "One small kind act per day.", fr: "Une petite bonté par jour." } },
    { title: { en: "Gratitude Crafts", fr: "Bricolages de gratitude" }, text: { en: "Make a small thank-you card.", fr: "Crée une petite carte de merci." } },
    { title: { en: "Storytelling Cards", fr: "Cartes-récits" }, text: { en: "Pick a card and share a soft story.", fr: "Choisis une carte et raconte une histoire douce." } },
    { title: { en: "Emotion Reflection Prompts", fr: "Idées de réflexion sur les émotions" }, text: { en: "Draw how today felt.", fr: "Dessine ce que tu as ressenti aujourd'hui." } },
  ] as Lesson[],
};

// ───────────────────────────── SHARED VALUES ─────────────────────────────
export const sharedValues: Lesson[] = [
  { title: { en: "Kindness", fr: "Bonté" }, text: { en: "Soft words and small acts that lift others.", fr: "Mots doux et petits gestes qui élèvent les autres." } },
  { title: { en: "Patience", fr: "Patience" }, text: { en: "The quiet strength of waiting well.", fr: "La force tranquille d'attendre avec douceur." } },
  { title: { en: "Gratitude", fr: "Gratitude" }, text: { en: "Noticing the good that is already here.", fr: "Remarquer le bien déjà présent." } },
  { title: { en: "Respect", fr: "Respect" }, text: { en: "Honoring others as we wish to be honored.", fr: "Honorer les autres comme on souhaite l'être." } },
  { title: { en: "Compassion", fr: "Compassion" }, text: { en: "Feeling with, not just feeling for.", fr: "Ressentir avec, pas seulement pour." } },
  { title: { en: "Helping Others", fr: "Aider les autres" }, text: { en: "Small helps, big hearts.", fr: "Petits gestes, grands cœurs." } },
  { title: { en: "Honesty", fr: "Honnêteté" }, text: { en: "Truth told with care.", fr: "Vérité dite avec soin." } },
  { title: { en: "Emotional Understanding", fr: "Compréhension des émotions" }, text: { en: "Naming what we feel softens it.", fr: "Nommer ce qu'on ressent l'apaise." } },
  { title: { en: "Calmness", fr: "Calme" }, text: { en: "A breath at a time, again and again.", fr: "Un souffle à la fois, encore et encore." } },
  { title: { en: "Forgiveness", fr: "Pardon" }, text: { en: "Letting the heart soften and rest.", fr: "Laisser le cœur s'adoucir et se reposer." } },
];
