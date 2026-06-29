import type { MapPlace } from "@/components/LeafletMap";

export const CAMEROON_CENTER: [number, number] = [5.96, 12.67];

export const CAMEROON_BOUNDS = {
  minLat: 1.65,
  maxLat: 13.1,
  minLng: 8.4,
  maxLng: 16.3,
};

export function isWithinCameroon([lat, lng]: [number, number]) {
  return lat >= CAMEROON_BOUNDS.minLat && lat <= CAMEROON_BOUNDS.maxLat && lng >= CAMEROON_BOUNDS.minLng && lng <= CAMEROON_BOUNDS.maxLng;
}

export const VERIFIED_SUPPORT_PLACES: MapPlace[] = [
  {
    id: "verified-ray-of-hope-academy",
    name: "Ray of Hope Academy Douala",
    category: "Schools",
    note: "Inclusive nursery and primary school with a special-needs department. Neighborhood-level pin; confirm before visiting.",
    noteFr: "École maternelle et primaire inclusive avec un département besoins spécifiques. Point de quartier ; confirmez avant de vous déplacer.",
    address: "Denver neighborhood, Bonamousadi, Douala V, Cameroon",
    phone: "+237243811496",
    lat: 4.0888,
    lng: 9.7397,
    sourceLabel: "Ray of Hope Academy contact/about pages",
    sourceLabelFr: "Pages contact/présentation de Ray of Hope Academy",
    sourceUrl: "https://rayofhope-academy.org/contact",
    verified: true,
  },
  {
    id: "verified-alted-cross",
    name: "ALTED CROSS Autisme Cameroun",
    category: "Therapists",
    note: "CROSS provides autism awareness, screening, care and parent capacity-building. Neighborhood-level pin; confirm before visiting.",
    noteFr: "CROSS propose sensibilisation à l'autisme, dépistage, prise en charge et capacitation des parents. Point de quartier ; confirmez avant de vous déplacer.",
    address: "Tropicana, Yaoundé, Cameroon",
    phone: "+237655590119",
    lat: 3.9009,
    lng: 11.5427,
    sourceLabel: "ALTED CROSS contact page",
    sourceLabelFr: "Page contact d'ALTED CROSS",
    sourceUrl: "https://altedcross.org/contact/",
    verified: true,
  },
  {
    id: "verified-la-voix-des-autistes",
    name: "La Voix des Autistes",
    category: "Therapists",
    note: "Specialized health, education, accommodation and autism-awareness support. City-level pin; call first.",
    noteFr: "Soutien spécialisé en santé, éducation, hébergement et sensibilisation à l'autisme. Point de ville ; appelez d'abord.",
    address: "Douala, Cameroon",
    phone: "+237693238130",
    lat: 4.0511,
    lng: 9.7679,
    sourceLabel: "La Voix des Autistes official site",
    sourceLabelFr: "Site officiel de La Voix des Autistes",
    sourceUrl: "https://www.la-voix-des-autistes.com/",
    verified: true,
  },
  {
    id: "verified-miyamba-academy",
    name: "Ss. Mary and Elizabeth Nursery and Primary Academy",
    category: "Schools",
    note: "Inclusive education project serving children in the Buea area. City-level pin; confirm before visiting.",
    noteFr: "Projet d'éducation inclusive pour les enfants de la région de Buea. Point de ville ; confirmez avant de vous déplacer.",
    address: "Buea, Cameroon",
    lat: 4.1534,
    lng: 9.2423,
    sourceLabel: "Miyamba / MARELI Academy site",
    sourceLabelFr: "Site Miyamba / MARELI Academy",
    sourceUrl: "https://www.miyamba.org/",
    verified: true,
  },
  {
    id: "verified-cameroon-emergency",
    name: "Cameroon emergency numbers",
    category: "Emergency",
    note: "SAMU 119, Fire brigade 118, Police 17/117/1500, Gendarmerie 113, Civil protection 114.",
    noteFr: "SAMU 119, pompiers 118, police 17/117/1500, gendarmerie 113, protection civile 114.",
    address: "Nationwide, Cameroon",
    phone: "119",
    lat: CAMEROON_CENTER[0],
    lng: CAMEROON_CENTER[1],
    sourceLabel: "MTN Group Cameroon emergency numbers",
    sourceLabelFr: "Numéros d'urgence Cameroun — MTN Group",
    sourceUrl: "https://www.mtn.com/country/cameroon/",
    verified: true,
  },
];
