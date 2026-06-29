export const CENTER_CATEGORIES = [
  "special_school",
  "inclusive_school",
  "therapy_center",
  "ngo",
  "psychologist",
  "speech_therapist",
  "occupational_therapist",
  "pediatrician",
  "support_group",
] as const;

export type CenterCategory = (typeof CENTER_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CenterCategory, { en: string; fr: string }> = {
  special_school: { en: "Special school", fr: "École spécialisée" },
  inclusive_school: { en: "Inclusive school", fr: "École inclusive" },
  therapy_center: { en: "Therapy center", fr: "Centre de thérapie" },
  ngo: { en: "NGO", fr: "ONG" },
  psychologist: { en: "Psychologist", fr: "Psychologue" },
  speech_therapist: { en: "Speech therapist", fr: "Orthophoniste" },
  occupational_therapist: { en: "Occupational therapist", fr: "Ergothérapeute" },
  pediatrician: { en: "Pediatrician", fr: "Pédiatre" },
  support_group: { en: "Support group", fr: "Groupe de soutien" },
};

export const CATEGORY_COLORS: Record<CenterCategory, string> = {
  special_school: "#0ea5e9",
  inclusive_school: "#22c55e",
  therapy_center: "#a855f7",
  ngo: "#f59e0b",
  psychologist: "#ec4899",
  speech_therapist: "#14b8a6",
  occupational_therapist: "#6366f1",
  pediatrician: "#ef4444",
  support_group: "#84cc16",
};

export type AutismCenter = {
  id: string;
  name: string;
  category: CenterCategory;
  description: string | null;
  services_offered: string[];
  address: string | null;
  city: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  opening_hours: string | null;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
  updated_at: string;
};

export type CenterFilters = {
  query: string;
  category: CenterCategory | "all";
};

// Cameroon bounding box (approximate national borders)
export const CAMEROON_CENTER: [number, number] = [5.96, 12.67];
export const CAMEROON_BOUNDS: [[number, number], [number, number]] = [
  [1.65, 8.4],
  [13.1, 16.3],
];

export function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
