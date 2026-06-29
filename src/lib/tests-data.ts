// Scientifically-grounded screening instruments adapted for in-app use.
// IMPORTANT: These are educational screeners, NOT diagnostic tools.
// References:
//  - AQ-10 (Child): Allison, Auyeung & Baron-Cohen (2012), J Am Acad Child Adolesc Psychiatry.
//  - Big Five Inventory short (BFI-10): Rammstedt & John (2007), J Res Personality - child-adapted wording.
//  - BRIEF-2 / Executive function checklist items: Gioia et al. (2015) - short adaptation.

export type Choice = {
  label: string;
  emoji: string;
  value: number; // 1..5 (Likert)
};

export const LIKERT: Choice[] = [
  { label: "Definitely disagree", emoji: "😞", value: 1 },
  { label: "Slightly disagree", emoji: "🙁", value: 2 },
  { label: "Not sure", emoji: "😐", value: 3 },
  { label: "Slightly agree", emoji: "🙂", value: 4 },
  { label: "Definitely agree", emoji: "😄", value: 5 },
];

export type Question = {
  id: string;
  text: string;
  // For ASD AQ-10: "agree" = scored when respondent agrees; "disagree" = scored when respondent disagrees.
  // For Big Five: trait + reversed flag.
  // For cognitive: domain + reversed flag (reversed means agreeing indicates difficulty).
  meta: Record<string, string | boolean>;
};

export type TestDef = {
  slug: "asd" | "personality" | "cognitive";
  title: string;
  short: string;
  blurb: string;
  source: string;
  estMinutes: number;
  emoji: string;
  questions: Question[];
};

// ---- ASD: AQ-10 Child (Allison, Auyeung & Baron-Cohen, 2012) ----
// Score 1 if agree on items marked "agree", 1 if disagree on items marked "disagree".
// Cutoff ≥ 6/10 → consider specialist referral.
export const ASD_TEST: TestDef = {
  slug: "asd",
  title: "Autism screening (AQ-10 Child)",
  short: "AQ-10",
  blurb:
    "A 10-question screener adapted from the Autism Spectrum Quotient - Child by Allison, Auyeung & Baron-Cohen (2012). Used by the UK NHS as a first step.",
  source: "Allison et al., J Am Acad Child Adolesc Psychiatry (2012)",
  estMinutes: 3,
  emoji: "🧩",
  questions: [
    { id: "a1", text: "S/he often notices small sounds when others do not.", meta: { score: "agree" } },
    { id: "a2", text: "S/he usually concentrates more on the whole picture, rather than the small details.", meta: { score: "disagree" } },
    { id: "a3", text: "In a social group, s/he can easily keep track of several different people's conversations.", meta: { score: "disagree" } },
    { id: "a4", text: "S/he finds it easy to go back and forth between different activities.", meta: { score: "disagree" } },
    { id: "a5", text: "S/he doesn't know how to keep a conversation going with his/her peers.", meta: { score: "agree" } },
    { id: "a6", text: "S/he is good at social chit-chat.", meta: { score: "disagree" } },
    { id: "a7", text: "When s/he is read a story, s/he finds it difficult to work out the character's intentions or feelings.", meta: { score: "agree" } },
    { id: "a8", text: "When s/he was younger, s/he used to enjoy playing games involving pretending with other children.", meta: { score: "disagree" } },
    { id: "a9", text: "S/he finds it easy to work out what someone is thinking or feeling just by looking at their face.", meta: { score: "disagree" } },
    { id: "a10", text: "S/he finds it hard to make new friends.", meta: { score: "agree" } },
  ],
};

// ---- Personality: Big Five (BFI-10), child-adapted wording (Rammstedt & John, 2007) ----
// 2 items per trait, one reversed.
export const PERSONALITY_TEST: TestDef = {
  slug: "personality",
  title: "Personality (Big Five - BFI-10)",
  short: "Big Five",
  blurb:
    "A short Big Five inventory based on Rammstedt & John (2007), adapted for children. Maps personality across five well-validated dimensions.",
  source: "Rammstedt & John, J Res Personality (2007)",
  estMinutes: 4,
  emoji: "🌱",
  questions: [
    { id: "p1", text: "S/he is generally trusting.", meta: { trait: "Agreeableness", reversed: false } },
    { id: "p2", text: "S/he tends to find fault with others.", meta: { trait: "Agreeableness", reversed: true } },
    { id: "p3", text: "S/he does a thorough job and finishes what s/he starts.", meta: { trait: "Conscientiousness", reversed: false } },
    { id: "p4", text: "S/he tends to be lazy.", meta: { trait: "Conscientiousness", reversed: true } },
    { id: "p5", text: "S/he is outgoing and sociable.", meta: { trait: "Extraversion", reversed: false } },
    { id: "p6", text: "S/he is reserved and quiet.", meta: { trait: "Extraversion", reversed: true } },
    { id: "p7", text: "S/he gets nervous easily.", meta: { trait: "Neuroticism", reversed: false } },
    { id: "p8", text: "S/he is relaxed and handles stress well.", meta: { trait: "Neuroticism", reversed: true } },
    { id: "p9", text: "S/he has an active imagination.", meta: { trait: "Openness", reversed: false } },
    { id: "p10", text: "S/he has few artistic or creative interests.", meta: { trait: "Openness", reversed: true } },
  ],
};

// ---- Cognitive / Executive Function checklist (BRIEF-2 inspired, short form) ----
// Items map to four domains. Reversed = agreement indicates difficulty.
export const COGNITIVE_TEST: TestDef = {
  slug: "cognitive",
  title: "Cognitive & executive function",
  short: "Cognition",
  blurb:
    "A short executive-function checklist inspired by BRIEF-2 (Gioia et al., 2015). Highlights working memory, attention, flexibility and inhibition.",
  source: "Gioia et al., BRIEF-2 (2015)",
  estMinutes: 4,
  emoji: "🧠",
  questions: [
    { id: "c1", text: "S/he remembers multi-step instructions (e.g., 'put on shoes, grab bag, come here').", meta: { domain: "Working memory", reversed: false } },
    { id: "c2", text: "S/he forgets what s/he is doing in the middle of a task.", meta: { domain: "Working memory", reversed: true } },
    { id: "c3", text: "S/he can focus on a chosen activity for 10+ minutes.", meta: { domain: "Attention", reversed: false } },
    { id: "c4", text: "S/he is easily distracted by sounds or movement around her/him.", meta: { domain: "Attention", reversed: true } },
    { id: "c5", text: "S/he adapts well when plans suddenly change.", meta: { domain: "Flexibility", reversed: false } },
    { id: "c6", text: "S/he becomes upset when routines are disrupted.", meta: { domain: "Flexibility", reversed: true } },
    { id: "c7", text: "S/he waits her/his turn without prompting.", meta: { domain: "Inhibition", reversed: false } },
    { id: "c8", text: "S/he acts before thinking, even after being warned.", meta: { domain: "Inhibition", reversed: true } },
    { id: "c9", text: "S/he can plan a small task (e.g., packing a bag) on her/his own.", meta: { domain: "Working memory", reversed: false } },
    { id: "c10", text: "S/he gets stuck on one idea and can't move on.", meta: { domain: "Flexibility", reversed: true } },
  ],
};

export const ALL_TESTS: TestDef[] = [ASD_TEST, PERSONALITY_TEST, COGNITIVE_TEST];

// ---- Scoring ----

export type ScoreResult = {
  headline: string;
  band: "low" | "moderate" | "elevated";
  summary: string;
  details: { label: string; value: number; max: number; note?: string }[];
  disclaimer: string;
};

export function scoreTest(test: TestDef, answers: Record<string, number>): ScoreResult {
  if (test.slug === "asd") return scoreAsd(test, answers);
  if (test.slug === "personality") return scorePersonality(test, answers);
  return scoreCognitive(test, answers);
}

function scoreAsd(test: TestDef, answers: Record<string, number>): ScoreResult {
  let score = 0;
  for (const q of test.questions) {
    const a = answers[q.id];
    if (!a) continue;
    const direction = q.meta.score === "agree";
    // "Definitely / Slightly agree" = values 4,5 → 1 pt for agree-scored items
    // "Definitely / Slightly disagree" = values 1,2 → 1 pt for disagree-scored items
    if (direction && a >= 4) score += 1;
    if (!direction && a <= 2) score += 1;
  }
  const band: ScoreResult["band"] = score >= 6 ? "elevated" : score >= 4 ? "moderate" : "low";
  const headline =
    band === "elevated"
      ? "Score above the screening threshold"
      : band === "moderate"
      ? "Score near the screening threshold"
      : "Score below the screening threshold";
  const summary =
    band === "elevated"
      ? "Your child scored 6 or more out of 10 on the AQ-10 Child screener. The original study recommends discussing this result with a paediatrician or child psychologist for a fuller assessment. This is a screening signal, not a diagnosis."
      : band === "moderate"
      ? "Your child scored 4–5 out of 10. This is below the recommended referral threshold but worth keeping an eye on. Re-take in a few months if behaviours change."
      : "Your child scored below 4 out of 10 on this short screener. The screener did not flag autism-related traits today. Continue to support strengths and watch for changes over time.";
  return {
    headline,
    band,
    summary,
    details: [{ label: "AQ-10 score", value: score, max: 10, note: "Cutoff for referral: ≥ 6" }],
    disclaimer:
      "The AQ-10 Child is a brief screener - it cannot diagnose autism. Only a qualified clinician can. If results concern you, please consult your child's GP or a developmental specialist.",
  };
}

function scorePersonality(test: TestDef, answers: Record<string, number>): ScoreResult {
  const traits = ["Agreeableness", "Conscientiousness", "Extraversion", "Neuroticism", "Openness"];
  const sums: Record<string, { sum: number; n: number }> = {};
  for (const t of traits) sums[t] = { sum: 0, n: 0 };
  for (const q of test.questions) {
    const a = answers[q.id];
    if (!a) continue;
    const trait = q.meta.trait as string;
    const reversed = q.meta.reversed === true;
    const v = reversed ? 6 - a : a;
    sums[trait].sum += v;
    sums[trait].n += 1;
  }
  const details = traits.map((t) => {
    const avg = sums[t].n ? sums[t].sum / sums[t].n : 0;
    const pct = Math.round(((avg - 1) / 4) * 100);
    return {
      label: t,
      value: pct,
      max: 100,
      note: pct >= 70 ? "high" : pct >= 40 ? "balanced" : "low",
    };
  });
  const top = [...details].sort((a, b) => b.value - a.value)[0];
  return {
    headline: `Most prominent trait: ${top.label}`,
    band: "low",
    summary: `Your child's strongest dimension is ${top.label.toLowerCase()} (${top.value}%). The Big Five describes natural tendencies - none are 'good' or 'bad'.`,
    details,
    disclaimer:
      "BFI-10 is a brief personality snapshot for self-reflection. Children's personalities continue developing - re-take every 6–12 months.",
  };
}

function scoreCognitive(test: TestDef, answers: Record<string, number>): ScoreResult {
  const domains = ["Working memory", "Attention", "Flexibility", "Inhibition"];
  const sums: Record<string, { sum: number; n: number }> = {};
  for (const d of domains) sums[d] = { sum: 0, n: 0 };
  for (const q of test.questions) {
    const a = answers[q.id];
    if (!a) continue;
    const domain = q.meta.domain as string;
    const reversed = q.meta.reversed === true;
    // Higher value = stronger functioning. Reversed items: agreement = difficulty, so flip.
    const v = reversed ? 6 - a : a;
    sums[domain].sum += v;
    sums[domain].n += 1;
  }
  const details = domains.map((d) => {
    const avg = sums[d].n ? sums[d].sum / sums[d].n : 0;
    const pct = Math.round(((avg - 1) / 4) * 100);
    return {
      label: d,
      value: pct,
      max: 100,
      note: pct >= 70 ? "strength" : pct >= 40 ? "developing" : "needs support",
    };
  });
  const overall = Math.round(details.reduce((s, d) => s + d.value, 0) / details.length);
  const band: ScoreResult["band"] = overall >= 65 ? "low" : overall >= 40 ? "moderate" : "elevated";
  const summary =
    band === "low"
      ? `Overall executive functioning looks solid (${overall}%). Keep nurturing strengths and gently stretch the lower domains.`
      : band === "moderate"
      ? `Overall score of ${overall}% suggests typical day-to-day functioning with one or two stretch areas. Look at the lowest domain below for focus.`
      : `Overall score of ${overall}% suggests several executive-function areas would benefit from extra support and routine scaffolding.`;
  return {
    headline: `Executive function overall: ${overall}%`,
    band,
    summary,
    details,
    disclaimer:
      "This short checklist is inspired by BRIEF-2. It is not a clinical assessment. Speak to an OT or psychologist if you'd like a deeper evaluation.",
  };
}
