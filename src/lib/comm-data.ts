// Categorized AAC-style cards for the Communication page.
// All cards now use uniform black-line African illustrations (no emojis as primary visuals).
// Colour cards intentionally render as solid colour swatches in the UI.

import imgFood from "@/assets/comm/food.png";
import imgBath from "@/assets/comm/bath.png";
import imgHelp from "@/assets/comm/help.png";
import imgBreak from "@/assets/comm/break.png";
import imgWater from "@/assets/comm/water.png";
import imgSleep from "@/assets/comm/sleep.png";
import imgPlay from "@/assets/comm/play.png";
import imgPain from "@/assets/comm/pain.png";
import imgQuiet from "@/assets/comm/quiet.png";
import imgHug from "@/assets/comm/hug.png";
import imgHappy from "@/assets/comm/happy.png";

// Body parts
import bodyHead from "@/assets/comm/body-head.png";
import bodyStomach from "@/assets/comm/body-stomach.png";
import bodyBack from "@/assets/comm/body-back.png";
import bodyToes from "@/assets/comm/body-toes.png";
import bodyLegs from "@/assets/comm/body-legs.png";
import bodyEyes from "@/assets/comm/body-eyes.png";
import bodyMouth from "@/assets/comm/body-mouth.png";
import bodyEars from "@/assets/comm/body-ears.png";
import bodyHands from "@/assets/comm/body-hands.png";
import bodyArm from "@/assets/comm/body-arm.png";
import bodyNeck from "@/assets/comm/body-neck.png";
import bodyElbow from "@/assets/comm/body-elbow.png";
import bodyKnee from "@/assets/comm/body-knee.png";
import bodyFingers from "@/assets/comm/body-fingers.png";
import bodyFeet from "@/assets/comm/body-feet.png";

// Emotions
import emoSad from "@/assets/comm/emo-sad.png";
import emoTired from "@/assets/comm/emo-tired.png";
import emoAngry from "@/assets/comm/emo-angry.png";
import emoBored from "@/assets/comm/emo-bored.png";
import emoShy from "@/assets/comm/emo-shy.png";
import emoScared from "@/assets/comm/emo-scared.png";
import emoDisgusted from "@/assets/comm/emo-disgusted.png";
import emoSurprised from "@/assets/comm/emo-surprised.png";
import emoDizzy from "@/assets/comm/emo-dizzy.png";
import emoProud from "@/assets/comm/emo-proud.png";
import emoConfused from "@/assets/comm/emo-confused.png";
import emoSick from "@/assets/comm/emo-sick.png";

// Wants
import wantToy from "@/assets/comm/want-toy.png";
import wantBag from "@/assets/comm/want-bag.png";
import wantClothes from "@/assets/comm/want-clothes.png";
import wantShoes from "@/assets/comm/want-shoes.png";
import wantMedicine from "@/assets/comm/want-medicine.png";
import wantTv from "@/assets/comm/want-tv.png";
import wantMusic from "@/assets/comm/want-music.png";
import wantToothbrush from "@/assets/comm/want-toothbrush.png";

// Self care
import scBrushTeeth from "@/assets/comm/sc-brush-teeth.png";
import scWashHands from "@/assets/comm/sc-wash-hands.png";
import scWashHair from "@/assets/comm/sc-wash-hair.png";
import scBath from "@/assets/comm/sc-bath.png";
import scWashFace from "@/assets/comm/sc-wash-face.png";
import scCleanEars from "@/assets/comm/sc-clean-ears.png";
import scCleanFeet from "@/assets/comm/sc-clean-feet.png";
import scClipNails from "@/assets/comm/sc-clip-nails.png";

// Places
import placeHome from "@/assets/comm/place-home.png";
import placeSchool from "@/assets/comm/place-school.png";
import placePark from "@/assets/comm/place-park.png";
import placeHospital from "@/assets/comm/place-hospital.png";
import placeCinema from "@/assets/comm/place-cinema.png";
import placeSupermarket from "@/assets/comm/place-supermarket.png";
import placeZoo from "@/assets/comm/place-zoo.png";
import placeStadium from "@/assets/comm/place-stadium.png";
import placeAirport from "@/assets/comm/place-airport.png";
import placeMuseum from "@/assets/comm/place-museum.png";
import placeBusStop from "@/assets/comm/place-bus-stop.png";
import placeForest from "@/assets/comm/place-forest.png";
import placeBeach from "@/assets/comm/place-beach.png";
import placeMountain from "@/assets/comm/place-mountain.png";

// Social
import socHello from "@/assets/comm/soc-hello.png";
import socGoodbye from "@/assets/comm/soc-goodbye.png";
import socThanks from "@/assets/comm/soc-thanks.png";
import socSorry from "@/assets/comm/soc-sorry.png";
import socPlease from "@/assets/comm/soc-please.png";
import socGive from "@/assets/comm/soc-give.png";
import socReceive from "@/assets/comm/soc-receive.png";
import socStop from "@/assets/comm/soc-stop.png";
import socNo from "@/assets/comm/soc-no.png";
import socYes from "@/assets/comm/soc-yes.png";

// People
import pplMum from "@/assets/comm/ppl-mum.png";
import pplDad from "@/assets/comm/ppl-dad.png";
import pplSister from "@/assets/comm/ppl-sister.png";
import pplBrother from "@/assets/comm/ppl-brother.png";
import pplUncle from "@/assets/comm/ppl-uncle.png";
import pplAunty from "@/assets/comm/ppl-aunty.png";
import pplGrandma from "@/assets/comm/ppl-grandma.png";
import pplGrandpa from "@/assets/comm/ppl-grandpa.png";
import pplTeacher from "@/assets/comm/ppl-teacher.png";
import pplFriend from "@/assets/comm/ppl-friend.png";

// Professions
import proDoctor from "@/assets/comm/pro-doctor.png";
import proNurse from "@/assets/comm/pro-nurse.png";
import proPilot from "@/assets/comm/pro-pilot.png";
import proTeacher from "@/assets/comm/pro-teacher.png";
import proChef from "@/assets/comm/pro-chef.png";
import proLawyer from "@/assets/comm/pro-lawyer.png";
import proJournalist from "@/assets/comm/pro-journalist.png";
import proArchitect from "@/assets/comm/pro-architect.png";
import proFarmer from "@/assets/comm/pro-farmer.png";
import proBuilder from "@/assets/comm/pro-builder.png";
import proEngineer from "@/assets/comm/pro-engineer.png";
import proMechanic from "@/assets/comm/pro-mechanic.png";

export type CommCard = {
  key: string;
  label: string;
  fr: string;
  emoji: string;
  img?: string;
  swatch?: string;
  tone: "primary" | "secondary" | "tertiary" | "info";
  category: CategoryKey;
};

export type CategoryKey =
  | "emotions"
  | "wants"
  | "selfcare"
  | "places"
  | "body"
  | "colours"
  | "social"
  | "people"
  | "professions";

export const CATEGORIES: { key: CategoryKey; label: string; fr: string; emoji: string }[] = [
  { key: "emotions", label: "Emotions & feelings", fr: "Émotions", emoji: "" },
  { key: "wants", label: "Wants", fr: "Besoins", emoji: "" },
  { key: "selfcare", label: "Self care", fr: "Hygiène", emoji: "" },
  { key: "places", label: "Places", fr: "Lieux", emoji: "" },
  { key: "body", label: "Body parts", fr: "Corps", emoji: "" },
  { key: "colours", label: "Colours", fr: "Couleurs", emoji: "" },
  { key: "social", label: "Social", fr: "Social", emoji: "" },
  { key: "people", label: "People", fr: "Personnes", emoji: "" },
  { key: "professions", label: "Professions", fr: "Métiers", emoji: "" },
];

const c = (
  key: string,
  label: string,
  fr: string,
  emoji: string,
  category: CategoryKey,
  tone: CommCard["tone"] = "primary",
  img?: string,
  swatch?: string,
): CommCard => ({ key, label, fr, emoji, category, tone, img, swatch });

export const CARDS: CommCard[] = [
  // Emotions & feelings
  c("happy", "Happy", "Heureux", "", "emotions", "secondary", imgHappy),
  c("sad", "Sad", "Triste", "", "emotions", "info", emoSad),
  c("tired", "Tired", "Fatigué", "", "emotions", "info", emoTired),
  c("angry", "Angry", "Fâché", "", "emotions", "tertiary", emoAngry),
  c("bored", "Bored", "Ennuyé", "", "emotions", "secondary", emoBored),
  c("shy", "Shy", "Timide", "", "emotions", "secondary", emoShy),
  c("scared", "Scared", "Peur", "", "emotions", "tertiary", emoScared),
  c("disgusted", "Disgusted", "Dégoûté", "", "emotions", "tertiary", emoDisgusted),
  c("surprised", "Surprised", "Surpris", "", "emotions", "primary", emoSurprised),
  c("dizzy", "Dizzy", "Étourdi", "", "emotions", "info", emoDizzy),
  c("proud", "Proud", "Fier", "", "emotions", "secondary", emoProud),
  c("confused", "Confused", "Confus", "", "emotions", "info", emoConfused),
  c("sick", "Sick", "Malade", "", "emotions", "tertiary", emoSick),
  c("pain", "Pain", "Douleur", "", "emotions", "tertiary", imgPain),

  // Wants
  c("water", "Water", "Eau", "", "wants", "info", imgWater),
  c("food", "Food", "Manger", "", "wants", "primary", imgFood),
  c("toy", "Toy", "Jouet", "", "wants", "secondary", wantToy),
  c("bag", "Bag", "Sac", "", "wants", "primary", wantBag),
  c("clothes", "Clothes", "Vêtements", "", "wants", "secondary", wantClothes),
  c("bathroom", "Bathroom", "Toilettes", "", "wants", "info", imgBath),
  c("shoes", "Shoes", "Chaussures", "", "wants", "primary", wantShoes),
  c("medicine", "Medicine", "Médicament", "", "wants", "tertiary", wantMedicine),
  c("tv", "TV", "Télé", "", "wants", "info", wantTv),
  c("music", "Music", "Musique", "", "wants", "secondary", wantMusic),
  c("toothbrush", "Toothbrush", "Brosse", "", "wants", "info", wantToothbrush),
  c("sleep", "Sleep", "Dormir", "", "wants", "info", imgSleep),
  c("play", "Play", "Jouer", "", "wants", "secondary", imgPlay),
  c("break", "Break", "Pause", "", "wants", "secondary", imgBreak),
  c("quiet", "Quiet time", "Calme", "", "wants", "primary", imgQuiet),
  c("hug", "Hug", "Câlin", "", "wants", "tertiary", imgHug),
  c("help", "Help", "Aide", "", "wants", "tertiary", imgHelp),

  // Self care
  c("brush-teeth", "Brush teeth", "Brosser les dents", "", "selfcare", "info", scBrushTeeth),
  c("wash-hands", "Wash hands", "Laver les mains", "", "selfcare", "info", scWashHands),
  c("wash-hair", "Wash hair", "Laver les cheveux", "", "selfcare", "primary", scWashHair),
  c("take-bath", "Take a bath", "Prendre un bain", "", "selfcare", "info", scBath),
  c("wash-face", "Wash face", "Laver le visage", "", "selfcare", "info", scWashFace),
  c("clean-ears", "Clean ears", "Nettoyer les oreilles", "", "selfcare", "secondary", scCleanEars),
  c("clean-feet", "Clean feet", "Laver les pieds", "", "selfcare", "info", scCleanFeet),
  c("clip-nails", "Clip nails", "Couper les ongles", "", "selfcare", "secondary", scClipNails),

  // Places
  c("home", "Home", "Maison", "", "places", "primary", placeHome),
  c("school", "School", "École", "", "places", "primary", placeSchool),
  c("park", "Park", "Parc", "", "places", "secondary", placePark),
  c("hospital", "Hospital", "Hôpital", "", "places", "tertiary", placeHospital),
  c("cinema", "Cinema", "Cinéma", "", "places", "info", placeCinema),
  c("supermarket", "Supermarket", "Supermarché", "", "places", "primary", placeSupermarket),
  c("zoo", "Zoo", "Zoo", "", "places", "secondary", placeZoo),
  c("stadium", "Stadium", "Stade", "", "places", "primary", placeStadium),
  c("airport", "Airport", "Aéroport", "", "places", "info", placeAirport),
  c("museum", "Museum", "Musée", "", "places", "secondary", placeMuseum),
  c("bus-stop", "Bus stop", "Arrêt de bus", "", "places", "primary", placeBusStop),
  c("forest", "Forest", "Forêt", "", "places", "secondary", placeForest),
  c("beach", "Beach", "Plage", "", "places", "info", placeBeach),
  c("mountain", "Mountain", "Montagne", "", "places", "primary", placeMountain),

  // Body parts
  c("head", "Head", "Tête", "", "body", "primary", bodyHead),
  c("stomach", "Stomach", "Ventre", "", "body", "secondary", bodyStomach),
  c("back", "Back", "Dos", "", "body", "primary", bodyBack),
  c("toes", "Toes", "Orteils", "", "body", "secondary", bodyToes),
  c("legs", "Legs", "Jambes", "", "body", "primary", bodyLegs),
  c("eyes", "Eyes", "Yeux", "", "body", "info", bodyEyes),
  c("mouth", "Mouth", "Bouche", "", "body", "tertiary", bodyMouth),
  c("ears", "Ears", "Oreilles", "", "body", "secondary", bodyEars),
  c("hands", "Hands", "Mains", "", "body", "primary", bodyHands),
  c("arm", "Arm", "Bras", "", "body", "secondary", bodyArm),
  c("neck", "Neck", "Cou", "", "body", "primary", bodyNeck),
  c("elbow", "Elbow", "Coude", "", "body", "secondary", bodyElbow),
  c("knee", "Knee", "Genou", "", "body", "primary", bodyKnee),
  c("fingers", "Fingers", "Doigts", "", "body", "info", bodyFingers),
  c("feet", "Feet", "Pieds", "", "body", "primary", bodyFeet),

  // Colours — rendered as solid swatches via the `swatch` field
  c("red", "Red", "Rouge", "", "colours", "tertiary", undefined, "#E63946"),
  c("black", "Black", "Noir", "", "colours", "primary", undefined, "#111111"),
  c("blue", "Blue", "Bleu", "", "colours", "info", undefined, "#1D4ED8"),
  c("green", "Green", "Vert", "", "colours", "primary", undefined, "#16A34A"),
  c("pink", "Pink", "Rose", "", "colours", "tertiary", undefined, "#F472B6"),
  c("orange", "Orange", "Orange", "", "colours", "secondary", undefined, "#F97316"),
  c("purple", "Purple", "Violet", "", "colours", "tertiary", undefined, "#8B5CF6"),
  c("brown", "Brown", "Marron", "", "colours", "secondary", undefined, "#92400E"),
  c("yellow", "Yellow", "Jaune", "", "colours", "secondary", undefined, "#FACC15"),
  c("grey", "Grey", "Gris", "", "colours", "primary", undefined, "#9CA3AF"),
  c("white", "White", "Blanc", "", "colours", "primary", undefined, "#FFFFFF"),

  // Social
  c("hello", "Hello", "Bonjour", "", "social", "primary", socHello),
  c("goodbye", "Goodbye", "Au revoir", "", "social", "secondary", socGoodbye),
  c("thank-you", "Thank you", "Merci", "", "social", "primary", socThanks),
  c("sorry", "Sorry", "Pardon", "", "social", "tertiary", socSorry),
  c("please", "Please", "S'il te plaît", "", "social", "secondary", socPlease),
  c("give", "Give", "Donner", "", "social", "primary", socGive),
  c("receive", "Receive", "Recevoir", "", "social", "secondary", socReceive),
  c("stop", "Stop", "Stop", "", "social", "tertiary", socStop),
  c("no", "No", "Non", "", "social", "tertiary", socNo),
  c("yes", "Yes", "Oui", "", "social", "primary", socYes),

  // People
  c("mum", "Mum", "Maman", "", "people", "tertiary", pplMum),
  c("dad", "Dad", "Papa", "", "people", "primary", pplDad),
  c("sister", "Sister", "Sœur", "", "people", "secondary", pplSister),
  c("brother", "Brother", "Frère", "", "people", "primary", pplBrother),
  c("uncle", "Uncle", "Oncle", "", "people", "primary", pplUncle),
  c("aunty", "Aunty", "Tante", "", "people", "secondary", pplAunty),
  c("grandma", "Grandma", "Grand-mère", "", "people", "tertiary", pplGrandma),
  c("grandpa", "Grandpa", "Grand-père", "", "people", "primary", pplGrandpa),
  c("teacher", "Teacher", "Maître", "", "people", "info", pplTeacher),
  c("friend", "Friend", "Ami", "", "people", "secondary", pplFriend),

  // Professions
  c("doctor", "Doctor", "Médecin", "", "professions", "tertiary", proDoctor),
  c("nurse", "Nurse", "Infirmier", "", "professions", "tertiary", proNurse),
  c("pilot", "Pilot", "Pilote", "", "professions", "info", proPilot),
  c("teacher-pro", "Teacher", "Enseignant", "", "professions", "primary", proTeacher),
  c("chef", "Chef", "Cuisinier", "", "professions", "secondary", proChef),
  c("lawyer", "Lawyer", "Avocat", "", "professions", "primary", proLawyer),
  c("journalist", "Journalist", "Journaliste", "", "professions", "info", proJournalist),
  c("architect", "Architect", "Architecte", "", "professions", "primary", proArchitect),
  c("farmer", "Farmer", "Fermier", "", "professions", "secondary", proFarmer),
  c("builder", "Builder", "Bâtisseur", "", "professions", "secondary", proBuilder),
  c("engineer", "Engineer", "Ingénieur", "", "professions", "primary", proEngineer),
  c("mechanic", "Mechanic", "Mécanicien", "", "professions", "primary", proMechanic),
];

export function toneClass(t: CommCard["tone"]) {
  if (t === "tertiary") return "bg-tertiary/15 text-tertiary";
  if (t === "secondary") return "bg-secondary/30 text-secondary-foreground";
  if (t === "info") return "bg-info/15 text-info";
  return "bg-primary-soft text-primary";
}
