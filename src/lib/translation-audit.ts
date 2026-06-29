import { auditKuaContentTranslations } from "@/lib/kua-content";
import { auditTranslationCoverage } from "@/lib/personalize";
import { VERIFIED_SUPPORT_PLACES } from "@/lib/support-map-data";

export function auditApplicationTranslations() {
  const affirmations = auditTranslationCoverage();
  const articles = auditKuaContentTranslations();
  const mapMissing = VERIFIED_SUPPORT_PLACES.flatMap((place) => {
    const missing: string[] = [];
    if (!place.name) missing.push(`map:${place.id}:name`);
    if (!place.note) missing.push(`map:${place.id}:note`);
    if (!place.sourceUrl) missing.push(`map:${place.id}:sourceUrl`);
    return missing;
  });

  const missing = [...affirmations.missing, ...articles.missing, ...mapMissing];
  const mismatched = [...affirmations.mismatched, ...articles.mismatched];

  return {
    ok: affirmations.ok && articles.ok && mapMissing.length === 0,
    missing,
    mismatched,
    sections: { affirmations, articles, supportMap: { ok: mapMissing.length === 0, missing: mapMissing } },
  };
}