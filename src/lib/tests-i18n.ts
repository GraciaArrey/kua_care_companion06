import type { Choice, ScoreResult, TestDef } from "@/lib/tests-data";
import type { Lang } from "@/lib/prefs";

const testCopy = {
  asd: {
    title: "Dépistage de l'autisme (AQ-10 enfant)",
    short: "AQ-10",
    blurb:
      "Un questionnaire de 10 questions adapté de l'Autism Spectrum Quotient - Child. Il aide à repérer des signes à discuter avec un professionnel.",
    questions: {
      a1: "Il/elle remarque souvent de petits sons que les autres ne remarquent pas.",
      a2: "Il/elle se concentre plutôt sur l'ensemble de l'image que sur les petits détails.",
      a3: "Dans un groupe, il/elle suit facilement plusieurs conversations.",
      a4: "Il/elle passe facilement d'une activité à une autre.",
      a5: "Il/elle ne sait pas toujours comment continuer une conversation avec ses pairs.",
      a6: "Il/elle est à l'aise dans les petites conversations sociales.",
      a7: "Quand on lui lit une histoire, il/elle a du mal à comprendre les intentions ou émotions des personnages.",
      a8: "Plus jeune, il/elle aimait les jeux de faire-semblant avec d'autres enfants.",
      a9: "Il/elle comprend facilement ce qu'une personne pense ou ressent en regardant son visage.",
      a10: "Il/elle a du mal à se faire de nouveaux amis.",
    },
  },
  personality: {
    title: "Personnalité (Big Five - BFI-10)",
    short: "Big Five",
    blurb:
      "Un court inventaire Big Five adapté aux enfants. Il décrit cinq tendances de personnalité validées par la recherche.",
    questions: {
      p1: "Il/elle fait généralement confiance aux autres.",
      p2: "Il/elle a tendance à critiquer les autres.",
      p3: "Il/elle fait les choses avec soin et termine ce qu'il/elle commence.",
      p4: "Il/elle a tendance à être paresseux/se.",
      p5: "Il/elle est sociable et va vers les autres.",
      p6: "Il/elle est réservé·e et calme.",
      p7: "Il/elle devient nerveux/se facilement.",
      p8: "Il/elle reste détendu·e et gère bien le stress.",
      p9: "Il/elle a beaucoup d'imagination.",
      p10: "Il/elle a peu d'intérêts artistiques ou créatifs.",
    },
  },
  cognitive: {
    title: "Fonctions cognitives et exécutives",
    short: "Cognition",
    blurb:
      "Une courte liste inspirée du BRIEF-2 pour observer mémoire de travail, attention, flexibilité et inhibition.",
    questions: {
      c1: "Il/elle retient les consignes en plusieurs étapes.",
      c2: "Il/elle oublie ce qu'il/elle fait au milieu d'une tâche.",
      c3: "Il/elle peut se concentrer sur une activité choisie pendant 10 minutes ou plus.",
      c4: "Il/elle est facilement distrait·e par les sons ou mouvements autour.",
      c5: "Il/elle s'adapte bien quand les plans changent soudainement.",
      c6: "Il/elle se fâche quand les routines changent.",
      c7: "Il/elle attend son tour sans rappel.",
      c8: "Il/elle agit avant de réfléchir, même après un avertissement.",
      c9: "Il/elle peut planifier une petite tâche seul·e, comme préparer un sac.",
      c10: "Il/elle reste bloqué·e sur une idée et a du mal à passer à autre chose.",
    },
  },
} as const;

const choiceFr: Record<number, string> = {
  1: "Pas du tout d'accord",
  2: "Plutôt pas d'accord",
  3: "Pas sûr·e",
  4: "Plutôt d'accord",
  5: "Tout à fait d'accord",
};

const detailFr: Record<string, string> = {
  "AQ-10 score": "Score AQ-10",
  Agreeableness: "Agréabilité",
  Conscientiousness: "Conscience",
  Extraversion: "Extraversion",
  Neuroticism: "Sensibilité émotionnelle",
  Openness: "Ouverture",
  "Working memory": "Mémoire de travail",
  Attention: "Attention",
  Flexibility: "Flexibilité",
  Inhibition: "Inhibition",
  high: "élevé",
  balanced: "équilibré",
  low: "faible",
  strength: "force",
  developing: "en développement",
  "needs support": "besoin de soutien",
  "Cutoff for referral: ≥ 6": "Seuil de recommandation : ≥ 6",
};

export function testTitle(test: TestDef, lang: Lang) {
  return lang === "fr" ? testCopy[test.slug].title : test.title;
}

export function testShort(test: TestDef, lang: Lang) {
  return lang === "fr" ? testCopy[test.slug].short : test.short;
}

export function testBlurb(test: TestDef, lang: Lang) {
  return lang === "fr" ? testCopy[test.slug].blurb : test.blurb;
}

export function questionText(test: TestDef, id: string, fallback: string, lang: Lang) {
  return lang === "fr" ? (testCopy[test.slug].questions as Record<string, string>)[id] ?? fallback : fallback;
}

export function choiceLabel(choice: Choice, lang: Lang) {
  return lang === "fr" ? choiceFr[choice.value] ?? choice.label : choice.label;
}

export function detailLabel(label: string, lang: Lang) {
  return lang === "fr" ? detailFr[label] ?? label : label;
}

export function detailNote(note: string | undefined, lang: Lang) {
  if (!note) return undefined;
  return lang === "fr" ? detailFr[note] ?? note : note;
}

export function translateResult(test: TestDef, result: ScoreResult, lang: Lang): ScoreResult {
  if (lang !== "fr") return result;
  if (test.slug === "asd") {
    const score = result.details[0]?.value ?? 0;
    const summary =
      result.band === "elevated"
        ? "Le score est de 6 ou plus sur 10. C'est un signal de dépistage à discuter avec un pédiatre, psychologue ou spécialiste du développement. Ce n'est pas un diagnostic."
        : result.band === "moderate"
          ? "Le score est proche du seuil. Il reste sous le seuil de recommandation, mais cela peut valoir la peine d'observer l'évolution et de refaire le test plus tard."
          : "Le score est sous le seuil de ce court dépistage aujourd'hui. Continuez à soutenir les forces de l'enfant et à observer les changements.";
    return {
      ...result,
      headline: result.band === "elevated" ? "Score au-dessus du seuil" : result.band === "moderate" ? "Score proche du seuil" : "Score sous le seuil",
      summary,
      details: [{ label: "Score AQ-10", value: score, max: 10, note: "Seuil de recommandation : ≥ 6" }],
      disclaimer: "L'AQ-10 enfant est un court dépistage : il ne peut pas diagnostiquer l'autisme. Seul un clinicien qualifié peut le faire.",
    };
  }
  const details = result.details.map((d) => ({ ...d, label: detailLabel(d.label, lang), note: detailNote(d.note, lang) }));
  if (test.slug === "personality") {
    const top = details.slice().sort((a, b) => b.value - a.value)[0];
    return {
      ...result,
      headline: `Trait le plus visible : ${top.label}`,
      summary: `La dimension la plus forte est ${top.label.toLowerCase()} (${top.value}%). Le Big Five décrit des tendances naturelles : aucune n'est « bonne » ou « mauvaise ».`,
      details,
      disclaimer: "Le BFI-10 est un aperçu bref pour la réflexion. La personnalité des enfants continue d'évoluer.",
    };
  }
  const overall = Math.round(details.reduce((sum, d) => sum + d.value, 0) / details.length);
  return {
    ...result,
    headline: `Fonctions exécutives : ${overall}%`,
    summary:
      result.band === "low"
        ? `Le fonctionnement exécutif semble solide (${overall}%). Continuez à nourrir les forces et à soutenir doucement les domaines plus faibles.`
        : result.band === "moderate"
          ? `Le score global de ${overall}% montre un fonctionnement quotidien généralement stable avec quelques zones à soutenir.`
          : `Le score global de ${overall}% suggère que plusieurs domaines bénéficieraient d'un soutien supplémentaire et de routines visuelles.`,
    details,
    disclaimer: "Cette courte liste est inspirée du BRIEF-2. Ce n'est pas une évaluation clinique.",
  };
}