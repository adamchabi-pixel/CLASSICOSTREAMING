import React, { useState, useEffect, useRef } from "react";
import { allMoviesData } from "./data/all_movies";
import { importedMoviesData } from "./data/imported_movies";
import { heroMoviesData } from "./data/hero_movies";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Play, Film, Info, Heart, Award, 
  ChevronLeft, ChevronRight, ChevronDown, User,
  Key, Tv, Clock, 
  Sparkles, History, Compass, FilmIcon, BookmarkCheck,
  Star, CheckCircle, AlertCircle, RefreshCw, X, Shield, Menu, Settings, Loader2, Handshake
} from "lucide-react";
import { COLLECTIONS as RAW_COLLECTIONS, Movie, Collection } from "./data";

const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => { if (a.id === "trending-now") return -1; if (b.id === "trending-now") return 1; return a.title.localeCompare(b.title); });

import MovieCard from "./components/MovieCard";
import LibraryView from "./components/LibraryView";
const MovieModal = React.lazy(() => import("./components/MovieModal"));
import MovieDetailView from "./components/MovieDetailView";
const CinemaPlayerView = React.lazy(() => import("./components/CinemaPlayerView"));
import ErrorBoundary from "./components/ErrorBoundary";
import LazyVirtualCard from "./components/LazyVirtualCard";
import HeroSkeleton from "./components/HeroSkeleton";

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Import custom generated cinema assets safely
const CLASSICO_HERO_BACKDROP = "/src/assets/images/classico_hero_backdrop_1781395618793.jpg";
const CLASSICO_ABSTRACT_BANNER = "/src/assets/images/classico_abstract_banner_1781395631739.jpg";

// Hand-crafted high-fidelity collection backgrounds custom-generated
const COLLECTION_BANNERS: Record<string, string> = {
  "john-wick": "/src/assets/images/john_wick_banner_1781396452240.jpg",
  "indiana-jones": "/src/assets/images/indiana_jones_banner_1781396466470.jpg",
  "christopher-nolan": "/src/assets/images/nolan_banner_1781396487471.jpg",
  "tarantino-collection": "/src/assets/images/tarantino_banner_1781396514352.jpg",
  "star-wars": "/src/assets/images/star_wars_banner_fixed_1781396525726.jpg",
  "james-bond": "/src/assets/images/bond_banner_1781396536406.jpg",
  "rocky": "/src/assets/images/rocky_banner_1781396548528.jpg",
  "terminator": "/src/assets/images/terminator_banner_1781396559445.jpg",
  "fast-and-furious": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop",
  "mafia-movies": "https://images.unsplash.com/photo-1574676101235-97e3cefa1212?q=80&w=1200&auto=format&fit=crop",
  "mind-bending-mysteries": "https://images.unsplash.com/photo-1517765371796-58eb241caa36?q=80&w=1200&auto=format&fit=crop",
  "frank-darabont": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop",
  "martin-scorsese": "https://images.unsplash.com/photo-1574676101235-97e3cefa1212?q=80&w=1200&auto=format&fit=crop",
  "the-batman": "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1200&auto=format&fit=crop",
  "godzilla": "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
  "jurassic-park": "https://images.unsplash.com/photo-1551624647-380d99dc0742?q=80&w=1200&auto=format&fit=crop"
};

// -------------------------------------------------------------
// INTELLIGENT MATCHING UTILITIES BETWEEN JELLYFIN & HAND-CRAFTED COLLECTIONS
// -------------------------------------------------------------
function cleanTitle(title: string): string {
  if (!title) return "";
  let t = title.toLowerCase();
  // Remove parenthesized or bracketed years e.g. (2014), [2017]
  t = t.replace(/\(\d{4}\)/g, " ");
  t = t.replace(/\[\d{4}\]/g, " ");
  // Remove freestanding 4-digit years at the end of title, e.g. "John Wick 2014"
  t = t.replace(/\b(19|20)\d{2}\b/g, " ");
  
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")     // replace punctuation with space
    .replace(/\s+/g, " ")           // collapse spaces
    .trim();
}

// -------------------------------------------------------------
// HIGH-PRECISION SAGA & FRANCHISE DOMAIN CLASSIFIER
// -------------------------------------------------------------
interface ClassificationResult {
  sagaIds?: string[];
  franchiseId?: string;
  confidence: "high" | "low" | "none";
}

function classifyMovie(
  title: string, 
  originalTitle?: string, 
  director?: string, 
  genre?: string[],
  studios?: string[]
): ClassificationResult {
  if (!title) return { confidence: "none" };
  const t = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const ot = originalTitle ? originalTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  const d = director ? director.toLowerCase() : "";

  const isCasinoOnly = (t === "casino" || ot === "casino") && !t.includes("royale") && !ot.includes("royale");
  
  const sagaIds = [];
  
  if (d.includes("quentin tarantino")) sagaIds.push("tarantino-collection");
  if (d.includes("christopher nolan")) sagaIds.push("christopher-nolan");
  if (d.includes("frank darabont")) sagaIds.push("frank-darabont");
  if (d.includes("martin scorsese")) sagaIds.push("martin-scorsese");

  const swKeywords = [
    "star wars", "guerre des etoiles", "la menace fantome", "phantom menace", "clones", "revanche des sith",
    "revenge of the sith", "un nouvel espoir", "new hope", "empire contre attaque", "empire strikes back",
    "retour du jedi", "return of the jedi", "reveil de la force", "force awakens", "derniers jedi", "last jedi",
    "ascension de skywalker", "rise of skywalker", "rogue one", "solo a star wars"
  ];
  if (swKeywords.some(kw => t.includes(kw) || ot.includes(kw)) || studios?.some(s => /lucasfilm/i.test(s))) {
    sagaIds.push("star-wars");
  }

  const bondKeywords = [
    "007", "james bond", "dr no", "dr. no", "bons baisers de russie", "from russia with love",
    "goldfinger", "operation tonnerre", "thunderball", "on ne vit que deux fois", "you only live twice",
    "au service secret de sa majeste", "on her majesty's secret service",
    "les diamants sont eternels", "diamonds are forever", "vivre et laisser mourir", "live and let die",
    "l homme au pistolet d or", "the man with the golden gun", "l espion qui m aimait", "the spy who loved me",
    "moonraker", "rien que pour vos yeux", "for your eyes only", "octopussy",
    "dangereusement votre", "a view to a kill", "tuer n est pas jouer", "the living daylights",
    "permis de tuer", "licence to kill", "goldeneye", "demain ne meurt jamais", "tomorrow never dies",
    "le monde ne suffit pas", "the world is not enough", "meurs un autre jour", "die another day",
    "casino royale", "quantum of solace", "skyfall", "spectre", "mourir peut attendre", "no time to die"
  ];
  if (bondKeywords.some(kw => t === kw || ot === kw || t.includes(` ${kw}`) || t.startsWith(`${kw} `) || ot.includes(` ${kw}`) || ot.startsWith(`${kw} `))) {
    if (!isCasinoOnly) sagaIds.push("james-bond");
  }

  if (t.includes("batman") || ot.includes("batman") || t.includes("the dark knight") || ot.includes("the dark knight")) sagaIds.push("the-batman");
  if (t.includes("godzilla") || ot.includes("godzilla")) sagaIds.push("godzilla");
  if (t.includes("jurassic park") || ot.includes("jurassic park") || t.includes("jurassic world") || ot.includes("jurassic world")) sagaIds.push("jurassic-park");

  if (/\bjohn wick\b/i.test(title) || /\bjohn wick\b/i.test(originalTitle || "")) sagaIds.push("john-wick");
  
  const indianaKeywords = ["indiana jones", "les aventuriers de l arche perdue", "raiders of the lost ark", "temple maudit", "temple of doom", "derniere croisade", "last crusade", "royaume du crane de cristal", "crystal skull", "cadran de la destinee", "dial of destiny"];
  if (indianaKeywords.some(kw => t.includes(kw) || ot.includes(kw))) sagaIds.push("indiana-jones");

  const isRockyKeyword = /\brocky\b/i.test(title) || /\brocky\b/i.test(originalTitle || "");
  const isCreed = /\bcreed\b/i.test(title) || /\bcreed\b/i.test(originalTitle || "");
  const notRockyHorror = !t.includes("horror") && !t.includes("picture show");
  if ((isRockyKeyword && notRockyHorror) || isCreed) sagaIds.push("rocky");

  if (/\bterminator\b/i.test(title) || /\bterminator\b/i.test(originalTitle || "")) sagaIds.push("terminator");
  
  let franchiseId = undefined;
  if (/\bmatrix\b/i.test(title) || /\bmatrix\b/i.test(originalTitle || "")) franchiseId = "matrix";

  const lotrKeywords = ["lord of the rings", "seigneur des anneaux", "la communaute de l anneau", "fellowship of the ring", "les deux tours", "the two towers", "le retour du roi", "return of the king", "le hobbit", "the hobbit", "un voyage inattendu", "unexpected journey", "la desolation de smaug", "desolation of smaug", "la bataille des cinq armees", "battle of the five armies"];
  if (lotrKeywords.some(kw => t.includes(kw) || ot.includes(kw))) franchiseId = "lord-of-the-rings";

  const hpKeywords = ["harry potter", "a l ecole des sorciers", "sorcerer's stone", "philosopher's stone", "chambre des secrets", "chamber of secrets", "prisonnier d azkaban", "prisoner of azkaban", "coupe de feu", "goblet of fire", "ordre du phenix", "order of the phoenix", "prince de sang mele", "half-blood prince", "reliques de la mort", "deathly hallows"];
  if (hpKeywords.some(kw => t.includes(kw) || ot.includes(kw))) franchiseId = "harry-potter";

  const isMarvel = /\b(avengers|iron man|captain america|thor|hulk|black widow|black panther|doctor strange|spider-man|guardians of the galaxy|ant-man|marvel)\b/i.test(title) || /\b(avengers|iron man|captain america|thor|hulk|black widow|black panther|doctor strange|spider-man|guardians of the galaxy|ant-man|marvel)\b/i.test(originalTitle || "");
  const notSpiderVerse = !t.includes("spider-verse") && !t.includes("into the spider-verse") && !t.includes("across the spider-verse");
  if (isMarvel && notSpiderVerse && !t.includes("venom") && !t.includes("morbius") && !t.includes("x-men") && !t.includes("deadpool") && !t.includes("wolverine") && !t.includes("logan") && !t.includes("fantastic four")) {
    franchiseId = "marvel-mcu";
  }

  const isPirates = /\b(pirates of the caribbean|pirates des caraibes)\b/i.test(title) || /\b(pirates of the caribbean|pirates des caraibes)\b/i.test(originalTitle || "");
  if (isPirates) franchiseId = "pirates-caribbean";

  const isFast = /\b(fast and furious|fast & furious|furious 7|fast 5|fast x|the fate of the furious|hobbs and shaw|fast five)\b/i.test(title) || /\b(fast and furious|fast & furious|furious 7|fast 5|fast x|the fate of the furious|hobbs and shaw|fast five)\b/i.test(originalTitle || "");
  if (isFast) franchiseId = "fast-and-furious";

  if (sagaIds.length > 0 || franchiseId) {
    return { sagaIds, franchiseId, confidence: "high" };
  }

  return { confidence: "none" };
}

// -------------------------------------------------------------
// REVOLUTIONARY HIGHEST-COMPATIBILITY RECURSIVE SORT ENGINE
// -------------------------------------------------------------
function sortSagaMovies(sagaId: string, movies: Movie[]): Movie[] {
  const list = [...movies];

  const cleanSW = (title: string): string => {
    return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ").trim();
  };

  if (sagaId === "star-wars") {
    const getSWScore = (m: Movie): number => {
      const s = cleanSW(m.title) + " " + cleanSW(m.originalTitle || "");
      if (/\b(episode\s*1|episode\s*i\b|menace\s*fantome|phantom\s*menace)/i.test(s)) return 1;
      if (/\b(episode\s*2|episode\s*ii\b|attaque\s*des\s*clones|attack\s*of\s*the\s*clones)/i.test(s)) return 2;
      if (/\b(episode\s*3|episode\s*iii\b|revanche\s*des\s*sith|revenge\s*of\s*the\s*sith)/i.test(s)) return 3;
      if (/\b(episode\s*4|episode\s*iv\b|un\s*nouvel\s*espoir|new\s*hope)/i.test(s) || (s.includes("star wars") && m.year === 1977) || s === "star wars") return 4;
      if (/\brogue\s*one\b/i.test(s)) return 4.5;
      if (/\b(episode\s*5|episode\s*v\b|empire\s*contre|empire\s*strikes\s*back)/i.test(s)) return 6;
      if (/\b(episode\s*6|episode\s*vi\b|retour\s*du\s*jedi|return\s*of\s*the\s*jedi)/i.test(s)) return 7;
      if (/\b(episode\s*7|episode\s*vii\b|reveil\s*de\s*la\s*force|force\s*awakens)/i.test(s)) return 8;
      if (/\b(episode\s*8|episode\s*viii\b|derniers\s*jedi|last\s*jedi)/i.test(s)) return 9;
      if (/\b(episode\s*9|episode\s*ix\b|ascension\s*de\s*skywalker|rise\s*of\s*skywalker)/i.test(s)) return 10;
      return m.year ? m.year * 10 : 999;
    };
    return list.sort((a, b) => getSWScore(a) - getSWScore(b));
  }

  if (sagaId === "rocky") {
    const getRockyScore = (m: Movie): number => {
      const s = m.title.toLowerCase();
      if (/\bcreed\s*3|creed\s*iii\b/i.test(s)) return 9.3;
      if (/\bcreed\s*2|creed\s*ii\b/i.test(s)) return 9.2;
      if (/\bcreed\b/i.test(s)) return 9.1;
      return m.year;
    };
    return list.sort((a, b) => getRockyScore(a) - getRockyScore(b));
  }

  return list.sort((a, b) => a.year - b.year);
}

// -------------------------------------------------------------
// ADVANCED SAGA/FRANCHISE DOMAIN-SPECIFIC MATCHERS
// -------------------------------------------------------------
function isStarWarsEpisodeMatch(t1: string, t2: string): boolean {
  // Check if both titles contain Star Wars style references or known elements
  const isSW1 = /star\s*wars|guerre\s*des\s*etoiles|empire\s*contre|retour\s*du\s*jedi|menace\s*fantome|revanche\s*des\s*sith|reveil\s*de\s*la\s*force|derniers\s*jedi|ascension\s*skywalker|rogue\s*one/i.test(t1);
  const isSW2 = /star\s*wars|guerre\s*des\s*etoiles|empire\s*contre|retour\s*du\s*jedi|menace\s*fantome|revanche\s*des\s*sith|reveil\s*de\s*la\s*force|derniers\s*jedi|ascension\s*skywalker|rogue\s*one/i.test(t2);
  
  if (!isSW1 || !isSW2) return false;

  const clean1 = cleanTitle(t1);
  const clean2 = cleanTitle(t2);

  // Helper to extract Star Wars episode index (1-9)
  const getSWIndex = (s: string): number | null => {
    if (/\b(episode\s*1|episode\s*i\b|menace\s*fantome|phantom\s*menace)/i.test(s)) return 1;
    if (/\b(episode\s*2|episode\s*ii\b|attaque\s*des\s*clones|attack\s*of\s*the\s*clones)/i.test(s)) return 2;
    if (/\b(episode\s*3|episode\s*iii\b|revanche\s*des\s*sith|revenge\s*of\s*the\s*sith)/i.test(s)) return 3;
    if (/\b(episode\s*4|episode\s*iv\b|un\s*nouvel\s*espoir|new\s*hope)/i.test(s)) return 4;
    if (/\b(episode\s*5|episode\s*v\b|empire\s*contre|empire\s*strikes\s*back)/i.test(s)) return 5;
    if (/\b(episode\s*6|episode\s*vi\b|retour\s*du\s*jedi|return\s*of\s*the\s*jedi)/i.test(s)) return 6;
    if (/\b(episode\s*7|episode\s*vii\b|reveil\s*de\s*la\s*force|force\s*awakens)/i.test(s)) return 7;
    if (/\b(episode\s*8|episode\s*viii\b|derniers\s*jedi|last\s*jedi)/i.test(s)) return 8;
    if (/\b(episode\s*9|episode\s*ix\b|ascension\s*de\s*skywalker|rise\s*of\s*skywalker)/i.test(s)) return 9;
    if (/\brogue\s*one\b/i.test(s)) return 10;
    return null;
  };

  const idx1 = getSWIndex(clean1);
  const idx2 = getSWIndex(clean2);

  return idx1 !== null && idx1 === idx2;
}

function isBondMovieMatch(title1: string, title2: string): boolean {
  const t1 = cleanTitle(title1);
  const t2 = cleanTitle(title2);

  const bondKeywords = [
    "007", "james bond", "dr no", "dr. no", "goldfinger", "thunderball", "octopussy", 
    "goldeneye", "skyfall", "spectre", "casino royale", "quantum of solace", "solace",
    "mourir peut attendre", "no time to die", "licence to kill", "permis de tuer"
  ];
  
  const isBond1 = bondKeywords.some(kw => t1.includes(kw)) || /007|bond/i.test(title1);
  const isBond2 = bondKeywords.some(kw => t2.includes(kw)) || /007|bond/i.test(title2);
  
  if (!isBond1 && !isBond2) return false;

  const bondGroups = [
    ["dr no", "dr. no", "doctor no", "contre dr no"],
    ["russia with love", "baisers de russie", "bons baisers de russie"],
    ["goldfinger"],
    ["thunderball", "operation tonnerre"],
    ["live twice", "deux fois", "on ne vit que deux fois"],
    ["her majesty", "secret service", "service secret", "au service secret de sa majeste"],
    ["diamonds are forever", "diamants sont eternels", "les diamants sont eternels"],
    ["live and let die", "vivre et laisser mourir"],
    ["golden gun", "pistolet d or", "l homme au pistolet d or"],
    ["spy who loved me", "espion qui m aimait", "l espion qui m aimait"],
    ["moonraker"],
    ["eyes only", "pour vos yeux", "rien que pour vos yeux"],
    ["octopussy"],
    ["view to a kill", "dangereusement votre", "dangereusement vôtre"],
    ["living daylights", "tuer n est pas jouer"],
    ["licence to kill", "permis de tuer"],
    ["goldeneye"],
    ["tomorrow never dies", "demain ne meurt", "demain ne meurt jamais"],
    ["world is not enough", "monde ne suffit", "le monde ne suffit pas"],
    ["die another day", "meurs un autre jour"],
    ["casino royale"],
    ["quantum of solace", "solace", "quantum"],
    ["skyfall"],
    ["spectre"],
    ["no time to die", "mourir peut attendre"]
  ];

  for (const group of bondGroups) {
    const hasT1 = group.some(term => t1.includes(cleanTitle(term)) || cleanTitle(term) === t1);
    const hasT2 = group.some(term => t2.includes(cleanTitle(term)) || cleanTitle(term) === t2);
    if (hasT1 && hasT2) return true;
  }

  return false;
}

function isMovieMatch(title1: string, title2: string): boolean {
  const t1 = cleanTitle(title1);
  const t2 = cleanTitle(title2);
  
  if (!t1 || !t2) return false;
  
  // Exact match after cleaning
  if (t1 === t2) return true;

  // Star Wars specific match
  if (isStarWarsEpisodeMatch(title1, title2)) {
    return true;
  }

  // James Bond specific match
  if (isBondMovieMatch(title1, title2)) {
    return true;
  }

  const aliasGroups = [
    ["the godfather", "le parrain", "godfather 1", "godfather part 1", "le parrain 1"],
    ["the godfather part ii", "le parrain 2", "godfather 2", "le parrain 2e partie", "le parrain 2e partie", "the godfather part 2"],
    ["the godfather part iii", "le parrain 3", "godfather 3", "le parrain 3e partie", "the godfather part 3"],
    ["the irishman", "irishman"],
    ["american gangster", "american gangster (2007)", "american gangster (version longue)"],
    ["the batman", "batman"],
    ["star wars episode i", "la menace fantome", "star wars: episode i", "star wars 1"],
    ["star wars episode ii", "attaque des clones", "star wars: episode ii", "star wars 2"],
    ["star wars episode iii", "revanche des sith", "star wars: episode iii", "star wars 3"],
    ["star wars episode iv", "un nouvel espoir", "star wars: episode iv", "star wars 4", "guerre des etoiles", "star wars"],
    ["star wars episode v", "empire contre attaque", "star wars: episode v", "star wars 5"],
    ["star wars episode vi", "retour du jedi", "star wars: episode vi", "star wars 6"],
    ["john wick 2", "john wick chapitre 2", "john wick chapter 2", "john wick ii"],
    ["john wick 3", "john wick parabellum", "john wick chapter 3", "john wick iii"],
    ["john wick 4", "john wick chapitre 4", "john wick chapter 4", "john wick iv"],
    ["les aventuriers de l arche perdue", "raiders of the lost ark", "arche perdue", "lost ark"],
    ["indiana jones et le temple maudit", "indiana jones and the temple of doom", "temple maudit", "temple of doom"],
    ["indiana jones et la derniere croisade", "indiana jones and the last crusade", "derniere croisade", "last crusade"],
    ["indiana jones et le royaume du crane de cristal", "indiana jones and the kingdom of the crystal skull", "crane de cristal", "crystal skull"],
    ["indiana jones et le cadran de la destinee", "indiana jones and the dial of destiny", "cadran de la destinee", "dial of destiny"],
    ["kill bill volume 1", "kill bill vol 1", "kill bill 1"],
    ["kill bill volume 2", "kill bill vol 2", "kill bill 2"],
    ["les huit salopards", "the hateful eight", "hateful eight", "hateful 8", "huit salopards"],
    ["dunkerque", "dunkirk"],
    ["rocky", "rocky 1", "rocky i"],
    ["rocky ii la revanche", "rocky 2", "rocky ii", "la revanche"],
    ["rocky iii l oeil du tigre", "rocky 3", "rocky iii", "eye of the tiger", "l oeil du tigre"],
    ["rocky iv", "rocky 4", "rocky iv"],
    ["rocky v", "rocky 5", "rocky v"],
    ["rocky balboa", "rocky 6", "rocky vi"],
    ["the terminator", "terminator", "terminator 1"],
    ["terminator 2 le jugement dernier", "terminator 2", "t2", "judgment day", "jugement dernier"],
    ["terminator 3 le soulevement des machines", "terminator 3", "rise of the machines", "soulevement des machines"],
    ["terminator renaissance", "terminator salvation", "terminator 4", "salvation"],
    ["fast and furious", "the fast and the furious", "fast & furious", "fast and furious 1", "fast & furious 1"],
    ["2 fast 2 furious", "fast and furious 2", "fast & furious 2"],
    ["the fast and the furious tokyo drift", "tokyo drift", "fast and furious 3", "fast & furious 3", "fast and furious tokyo drift"],
    ["fast & furious 4", "fast and furious 4", "fast and furious 2009", "fast & furious 2009"],
    ["fast five", "fast and furious 5", "fast & furious 5", "fast 5"],
    ["fast & furious 6", "fast and furious 6", "fast 6"],
    ["furious 7", "fast and furious 7", "furious vicii", "furious vii", "fast & furious 7", "furious 7"],
    ["the fate of the furious", "fast and furious 8", "fast & furious 8", "fate of the furious", "fast 8"],
    ["f9", "fast and furious 9", "fast & furious 9", "f9 the fast saga", "fast 9"],
    ["fast x", "fast and furious 10", "fast & furious 10", "fast 10"]
  ];

  for (const group of aliasGroups) {
    const hasT1 = group.some(alias => t1 === alias || cleanTitle(alias) === t1);
    const hasT2 = group.some(alias => t2 === alias || cleanTitle(alias) === t2);
    if (hasT1 && hasT2) return true;
  }

  return false;
}

const GENRE_AESTHETICS: Record<string, { gradient: string; accentColor: string; accentHex: string; symbol: string; description: string }> = {
  "action": {
    gradient: "from-slate-900 via-neutral-900 to-amber-950/40",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#f59e0b",
    symbol: "💥🔫🥋",
    description: "Spectacular sequences, intense fights and pure adrenaline."
  },
  "adventure": {
    gradient: "from-neutral-900 via-amber-950/30 to-amber-950/40",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#f59e0b",
    symbol: "🤠🗺️🧭",
    description: "Distant explorations, epic quests and mysteries of history."
  },
  "aventure": {
    gradient: "from-neutral-900 via-amber-950/30 to-amber-950/40",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#f59e0b",
    symbol: "🤠🗺️🧭",
    description: "Distant explorations, epic quests and mysteries of history."
  },
  "science fiction": {
    gradient: "from-neutral-900 via-emerald-950/30 to-teal-950/40",
    accentColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    accentHex: "#34d399",
    symbol: "👽🪐🚀",
    description: "Extraordinary futures, advanced technologies and stellar journeys."
  },
  "science-fiction": {
    gradient: "from-neutral-900 via-emerald-950/30 to-teal-950/40",
    accentColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    accentHex: "#34d399",
    symbol: "👽🪐🚀",
    description: "Extraordinary futures, advanced technologies and stellar journeys."
  },
  "crime": {
    gradient: "from-stone-900 via-neutral-900 to-red-950/50",
    accentColor: "text-neutral-200 border-neutral-400/30 bg-neutral-400/10",
    accentHex: "#e5e5e5",
    symbol: "🕶️🤵🚨",
    description: "Men in the shadows, dark investigations and guilty fates."
  },
  "thriller": {
    gradient: "from-slate-900 via-neutral-900 to-purple-950/40",
    accentColor: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    accentHex: "#c084fc",
    symbol: "🔪🤫🔦",
    description: "Psychological suspense, unsolvable mysteries and dramatic tension."
  },
  "drama": {
    gradient: "from-neutral-900 via-yellow-950/20 to-stone-900",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#ca8a04",
    symbol: "🎭🎭🍷",
    description: "Poignant human stories, complex relationships and life-changing destinies."
  },
  "drame": {
    gradient: "from-neutral-900 via-yellow-950/20 to-stone-900",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#ca8a04",
    symbol: "🎭🎭🍷",
    description: "Poignant human stories, complex relationships and life-changing destinies."
  },
  "comedy": {
    gradient: "from-neutral-900 via-yellow-950/30 to-amber-950/40",
    accentColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    accentHex: "#eab308",
    symbol: "😂🍿🎭",
    description: "Dark humor, incredible situations and guaranteed laughs."
  },
  "comédie": {
    gradient: "from-neutral-900 via-yellow-950/30 to-amber-950/40",
    accentColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    accentHex: "#eab308",
    symbol: "😂🍿🎭",
    description: "Dark humor, incredible situations and guaranteed laughs."
  },
  "animation": {
    gradient: "from-neutral-900 via-blue-950/30 to-indigo-950/40",
    accentColor: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    accentHex: "#60a5fa",
    symbol: "🎨✨🦁",
    description: "Wonderful drawn universes, fantastic adventures for all ages."
  }
};

// -------------------------------------------------------------
// DYNAMIC FRANCHISES & SAGA MATCHING CONFIGURATION
// -------------------------------------------------------------
const FRANCHISES = [
  {
    id: "matrix",
    title: "The Matrix Saga",
    description: "The cyberpunk masterpiece from the Wachowskis that revolutionized visual effects and sci-fi cinema.",
    pattern: /matrix/i,
    gradient: "from-neutral-950 via-emerald-950/40 to-neutral-950",
    accentColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    accentHex: "#34d399",
    symbol: "🔌🟢📟"
  },
  {
    id: "lord-of-the-rings",
    title: "The Lord of the Rings",
    pattern: /\b(lord of the rings|seigneur des anneaux|hobbit)\b/i,
    description: "The legendary adaptation of J.R.R. Tolkien's heroic fantasy by Peter Jackson.",
    gradient: "from-stone-900 via-amber-950/30 to-amber-950/40",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#f59e0b",
    symbol: "💍🧝🏰"
  },
  {
    id: "harry-potter",
    title: "Harry Potter",
    pattern: /harry potter/i,
    description: "Follow the legendary journey of the young bespectacled wizard at the Hogwarts School of Witchcraft and Wizardry.",
    gradient: "from-indigo-950 via-purple-950/30 to-zinc-950",
    accentColor: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    accentHex: "#c084fc",
    symbol: "⚡🦉🔮"
  },
  {
    id: "godfather",
    title: "The Godfather",
    pattern: /\b(godfather|parrain)\b/i,
    description: "Francis Ford Coppola's mythical trilogy on the rise and fall of the Corleone mafia dynasty.",
    gradient: "from-stone-900 via-neutral-950 to-stone-950",
    accentColor: "text-neutral-300 border-zinc-700 bg-zinc-800/10",
    accentHex: "#d4d4d8",
    symbol: "🌹🤵🍷"
  },
  {
    id: "mission-impossible",
    title: "Mission: Impossible",
    pattern: /mission\s*:?\s*impossible/i,
    description: "The craziest stunts in action and spy cinema, led by Tom Cruise.",
    gradient: "from-neutral-900 via-slate-900 to-red-950/30",
    accentColor: "text-red-500 border-red-500/30 bg-red-500/10",
    accentHex: "#ef4444",
    symbol: "🚁🏍️💣"
  },
  {
    id: "spider-man",
    title: "Spider-Man",
    pattern: /spider-?man/i,
    description: "The adventures of the New York spider-man across different eras and dimensions.",
    gradient: "from-blue-950 via-slate-900 to-red-950/30",
    accentColor: "text-red-400 border-red-400/30 bg-red-400/10",
    accentHex: "#f87171",
    symbol: "🕸️🕷️🏙️"
  },
  {
    id: "alien",
    title: "Alien",
    pattern: /\balien\b/i,
    description: "The pinnacle of space survival horror and sci-fi terror.",
    gradient: "from-zinc-950 via-neutral-900 to-[#0e1c15]",
    accentColor: "text-lime-400 border-lime-400/30 bg-lime-400/10",
    accentHex: "#a3e635",
    symbol: "👽🪐📦"
  },
  {
    id: "back-to-the-future",
    title: "Back to the Future",
    pattern: /\b(back to the future|retour vers le futur)\b/i,
    description: "The mythical time travel of Marty McFly and Doc Brown aboard the legendary DeLorean.",
    gradient: "from-blue-950 via-amber-950/20 to-neutral-950",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#ca8a04",
    symbol: "🚗⚡🕰️"
  },
  {
    id: "fast-and-furious",
    title: "Fast and Furious",
    pattern: /\b(fast\s*(and|&)?\s*furious|tokyo\s*drift|fast\s*(five|5|6|7|8|9|10)|furious\s*(7|8)|hobbs\s*(&|and)\s*shaw)\b/i,
    description: "Speed, big engines, family and spectacular stunts. The entire legendary action saga driven by Justin Lin.",
    gradient: "from-neutral-900 via-amber-950/40 to-neutral-950",
    accentColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    accentHex: "#fb923c",
    symbol: "🚗💨🔥"
  }
];

function isBondMovie(m: Movie): boolean {
  const result = classifyMovie(m.title, m.originalTitle || "", m.director || "", m.genre || [], m.studios || []);
  return result.confidence === "high" && result.sagaIds && result.sagaIds.includes("james-bond");
}

function getDynamicSagaIds(m: Movie): string[] {
  const result = classifyMovie(m.title, m.originalTitle || "", m.director || "", m.genre || [], m.studios || []);
  if (result.confidence === "high" && result.sagaIds) {
    return result.sagaIds;
  }
  return [];
}

function enrichDynamicMovie(m: Movie, contextID: string): Movie {
  if (!m.title) m.title = "Untitled";
  const primaryGenre = (m.genre && m.genre.filter(Boolean)[0]) || "Drama";
  const aesthetic = GENRE_AESTHETICS[primaryGenre.toLowerCase()] || {
    gradient: "from-slate-900 via-neutral-900 to-zinc-950/40",
    accentColor: "text-zinc-400 border-zinc-500/30 bg-zinc-900/10",
    accentHex: "#71717a",
    symbol: "🎬"
  };

  const titleLower = m.title.toLowerCase();
  let tagline = m.tagline || "An indisputable legendary film.";
  
  if (titleLower.includes("quantum of solace")) {
    tagline = "Personal revenge is a matter of state.";
  } else if (titleLower.includes("spectre")) {
    tagline = "A cryptic message from the past sends James Bond on a rogue mission.";
  } else if (titleLower.includes("reloaded")) {
    tagline = "The truth is a weapon.";
  } else if (titleLower.includes("revolutions")) {
    tagline = "Everything that has a beginning has an end.";
  } else if (titleLower.includes("resurrections")) {
    tagline = "Return to the source.";
  } else if (titleLower.includes("matrix")) {
    tagline = "Free your mind.";
  }

  // Choose appropriate franchise style if matched
  let customGradient = m.gradient || aesthetic.gradient;
  let customAccent = m.accentColor || aesthetic.accentColor;
  let customHex = m.accentHex || aesthetic.accentHex;
  let customSymbol = m.symbol || aesthetic.symbol;

  if (contextID === "matrix") {
    customGradient = "from-neutral-950 via-emerald-950/30 to-neutral-950";
    customAccent = "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    customHex = "#34d399";
    customSymbol = "🟢";
  } else if (contextID === "james-bond") {
    customGradient = "from-neutral-900 via-neutral-950 to-red-950/20";
    customAccent = "text-rose-500 border-rose-500/30 bg-rose-500/10";
    customHex = "#f43f5e";
    customSymbol = "🤵";
  }

  return {
    ...m,
    gradient: customGradient,
    accentColor: customAccent,
    accentHex: customHex,
    symbol: customSymbol,
    tagline};
}


const isAnimeOrAdult = (m: any) => {
  if (m.adult) return true;
  const hasBannedGenre = m.genre?.some((g: string) => {
    const lower = g.toLowerCase();
    return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult') || lower.includes('japanimation');
  });
  const lowerTitle = (m.title || (m as any).name || m.originalTitle || '').toLowerCase();
  const mId = String(m.id || m.tmdbId || '');
  const hasBannedTitle = 
    lowerTitle.includes('hentai') || lowerTitle.includes('naruto') || lowerTitle.includes('boruto') || 
    lowerTitle.includes('dragon ball') || lowerTitle.includes('one piece') || lowerTitle.includes('bleach') || 
    lowerTitle.includes('attack on titan') || lowerTitle.includes('jujutsu kaisen') || lowerTitle.includes('demon slayer') || 
    lowerTitle.includes('my hero academia') || lowerTitle.includes('game of thrones') || lowerTitle.includes('house of the dragon') || 
    lowerTitle.includes('wolf of wall street') || lowerTitle.includes('american psycho') || lowerTitle.includes('pamela anderson') ||
    mId === '1399' || mId === '1399-tv' || mId === '94997' || mId === '94997-tv' || mId === '296206';
  const hasTmdbAnime = m.providerIds?.Tmdb && m.originalLanguage === 'ja' && m.genre?.includes('Animation');
  return hasBannedGenre || hasBannedTitle || hasTmdbAnime;
};

const isAnimeOrAdultKeyword = (q: string) => {
  const term = q.toLowerCase();
  const banned = [
    'anime', 'animé', 'hentai', 'manga', 'japanimation', 'ecchi', 
    'naruto', 'boruto', 'dragon ball', 'one piece', 'bleach', 'attack on titan', 
    'jujutsu kaisen', 'demon slayer', 'my hero academia', 'game of thrones', 
    'house of the dragon', 'wolf of wall street', 'american psycho', 'pamela anderson'
  ];
  return banned.some(b => term.includes(b));
};

export default function App() {


  const [asyncData, setAsyncData] = useState<{all: any[], imported: any[], hero: any} | null>(null);

  useEffect(() => {
    Promise.all([
      import('./data/all_movies'),
      import('./data/imported_movies'),
      import('./data/hero_movies')
    ]).then(([all, imported, hero]) => {
      setAsyncData({
        all: all.allMoviesData,
        imported: imported.importedMoviesData,
        hero: hero.heroMoviesData
      });
      if (typeof window !== 'undefined') {
        setTimeout(() => sessionStorage.removeItem('returning_from_ad'), 100);
      }
    });
  }, []);

  const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem("classico_tmdb_cache");
      if (saved) {
         const parsed = JSON.parse(saved);
         if (Array.isArray(parsed)) return parsed.filter(Boolean);
      }
      return [];
    } catch (e) {
      return [];
    }
  });
  const allMoviesBase = React.useMemo(() => {
    const combined = (asyncData ? [...asyncData.imported, ...asyncData.all] : []).filter(m => m && !isAnimeOrAdult(m as unknown as Movie));
    const groups = new Map();
    
    const cleanTitle = (t: string) => t ? t.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    
    combined.forEach(m => {
      let key = null;
      if (m.tmdbId) key = `tmdb_${m.tmdbId}`;
      else if ((m as any).providerIds && (m as any).providerIds.Tmdb) key = `tmdb_${(m as any).providerIds.Tmdb}`;
      else if (m.id && /^\d+$/.test(m.id)) key = `tmdb_${m.id}`; // Assuming numeric IDs are TMDB
      else key = `title_${cleanTitle(m.title)}`;
      
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    });
    
    const finalMovies: Movie[] = [];
    
    groups.forEach(group => {
      // Prioritize Jellyfin object as the base so we keep the streamUrl and Jellyfin ID
      let baseMovie = group.find((m: Movie) => false) || group[0];
      let merged = { ...baseMovie };
      
      group.forEach((m: Movie) => {
        if (m === baseMovie) return;
        merged = {
          ...m,
          ...merged, // Base overrides m for top-level fields (like id, streamUrl, title)
          hasLogo: merged.hasLogo || m.hasLogo,
          logoUrl: merged.logoUrl || m.logoUrl,
          castDetails: (merged.castDetails && merged.castDetails.length > 0) ? merged.castDetails : m.castDetails,
          similar: (merged.similar && merged.similar.length > 0) ? merged.similar : m.similar,
          director: merged.director || m.director,
          tagline: merged.tagline || m.tagline,
          rating: (merged.rating && merged.rating !== "N/A") ? merged.rating : m.rating,
          description: merged.description || m.description,
          seasons: (merged.seasons && merged.seasons.length > 0) ? merged.seasons : m.seasons,
          voteAverage: merged.voteAverage || m.voteAverage,
          backdropUrl: merged.backdropUrl || m.backdropUrl,
          posterUrl: merged.posterUrl || m.posterUrl
        };
      });
      
      finalMovies.push(merged);
    });
    
    return finalMovies;
  }, [asyncData]);
  
  
  const initialPath = window.location.pathname;
  let initialTab: "accueil" | "collections" | "series" | "profil" | "collection-detail" | "movie" | "player" = "accueil";
  if (initialPath === "/collections") initialTab = "collections";
  else if (initialPath === "/series") initialTab = "series";
  else if (initialPath === "/profil") initialTab = "profil";
  else if (initialPath.startsWith("/collection/")) initialTab = "collection-detail";
  else if (initialPath.startsWith("/player/")) initialTab = "player";
  else if (initialPath.startsWith("/movie/")) initialTab = "movie";

  const [activeTab, setActiveTab ] = useState<"accueil" | "collections" | "series" | "profil" | "collection-detail" | "movie" | "player">(initialTab);
  const [routePath, setRoutePath] = useState(initialPath);
  const [isScrolled, setIsScrolled] = useState(false);

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  // Library specific states
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryGenre, setLibraryGenre] = useState<string>("All");
  const [libraryYear, setLibraryYear] = useState<string>("All");
  const [libraryType, setLibraryType] = useState<"all" | "movie" | "tv">("all");
  const [librarySort, setLibrarySort] = useState<"popularity" | "rating" | "year" | "title">("popularity");
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const isHeroLoading = !asyncData;

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [routeScrollPositions, setRouteScrollPositions] = useState<Record<string, number>>({});
    
    const heroMovies = asyncData ? asyncData.hero.heroes : [];
  const heroMovie = heroMovies[currentHeroIndex] || null;
  const useTextTitleForHero = false;
  const setUseTextTitleForHero = (val: boolean) => {};
  const isJellyfinLoading = false;
  const jellyfinConfig = null;

  const loadProgress = () => {
    const savedProgress = localStorage.getItem("classico_progress");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress) || {};
        const newProgressData: Record<string, number> = {};
        Object.keys(parsed || {}).forEach(k => {
           let pct = 0;
           if (typeof parsed[k] === 'number') pct = parsed[k];
           else if (parsed[k] && parsed[k].type === "tv" && parsed[k].show_progress) {
             const s = parsed[k].last_season_watched || 1;
             const e = parsed[k].last_episode_watched || 1;
             const epProg = parsed[k].show_progress[`s${s}e${e}`];
             if (epProg && epProg.progress) {
                 const duration = epProg.progress.duration || 0;
                 pct = duration > 0 ? (epProg.progress.watched / duration) : (epProg.progress.watched > 0 ? 0.5 : 0);
             }
           }
           else if (parsed[k] && parsed[k].currentTime !== undefined) {
             const duration = parsed[k].duration || 0;
             pct = duration > 0 ? (parsed[k].currentTime / duration) : (parsed[k].currentTime > 0 ? 0.5 : 0);
           } else if (parsed[k] && parsed[k].duration) {
             pct = parsed[k].currentTime / parsed[k].duration;
           }
           
           if (pct > (newProgressData[k] || 0) || !newProgressData[k]) newProgressData[k] = pct;
           if (!k.endsWith("-tv")) {
               if (pct > (newProgressData[k + "-tv"] || 0) || !newProgressData[k + "-tv"]) newProgressData[k + "-tv"] = pct;
           }
           if (k.endsWith("-tv")) {
               if (pct > (newProgressData[k.replace("-tv", "")] || 0) || !newProgressData[k.replace("-tv", "")]) newProgressData[k.replace("-tv", "")] = pct;
           }
        });
        setProgressData(newProgressData);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const navigateTo = (path: string) => {
    if (!path.startsWith("/player/")) {
      loadProgress();
      
      // Also reload history/watchlist just in case
      const savedHistory = localStorage.getItem("classico_history");
      if (savedHistory) {
        try {
          const h = JSON.parse(savedHistory);
          if (Array.isArray(h)) setHistory(h);
        } catch (e) {}
      }
    }
    setRouteScrollPositions(prev => ({ ...prev, [activeTab]: window.scrollY }));
    window.history.pushState({}, "", path);
    setRoutePath(path);
    if (path === "/") setActiveTab("accueil");
    else if (path === "/collections") setActiveTab("collections");
      else if (path === "/series") setActiveTab("series");
    else if (path === "/series") setActiveTab("series");
    else if (path === "/profil") setActiveTab("profil");
    else if (path.startsWith("/collection/")) {
      setSelectedCollectionId(path.split("/")[2]);
      setActiveTab("collection-detail");
    }
    else if (path.startsWith("/player/")) {
      setActiveTab("player");
    }
    else if (path.startsWith("/movie/")) {
      setActiveTab("movie");
    }
    window.scrollTo(0, 0);
  };

  

  // Connection form states
      const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);

  const [collectionMods, setCollectionMods] = useState({ deletedCollections: [], addedMovies: {}, removedMovies: {} });

  // Dynamically map movies into collections & genres by checking server presence
  const mappedCollections = React.useMemo(() => {

    if (!allMoviesBase || allMoviesBase.length === 0) return [];

    const matchedServersMovieIds = new Set<string>();

    const titleToMovieMap = new Map<string, Movie>();
    allMoviesBase.forEach(jf => {
      const ct = cleanTitle(jf.title);
      if (ct) titleToMovieMap.set(ct, jf);
    });

    const fastFindMatch = (movie: Movie) => {
       const ct = cleanTitle(movie.title);
       if (ct && titleToMovieMap.has(ct)) return titleToMovieMap.get(ct);
       return allMoviesBase.find((jf) => isMovieMatch(movie.title, jf.title));
    };

    // 1. Process standard Saga Collections (Christopher Nolan, John Wick, etc.)
    // Keep ONLY movies actually found on the server, and drop empty collections
    const curatedSagaCollections = COLLECTIONS.map((collection) => {
      const enrichedMovies = collection.movies
        .map((movie) => {
          const match = fastFindMatch(movie);
          if (match) {
            matchedServersMovieIds.add(match.id);
            return {
              ...match,
              ...movie,
              id: match.id, // Use server id to play correctly
              tmdbId: match.tmdbId || movie.tmdbId,
              imdbId: match.imdbId || movie.imdbId,
              providerIds_unused: match.providerIds || movie.providerIds,
              isTv: match.isTv !== undefined ? match.isTv : movie.isTv,
              streamUrl: match.streamUrl,
              posterUrl: match.posterUrl || movie.posterUrl,
              backdropUrl: match.backdropUrl || movie.backdropUrl,
              year: match.year || movie.year,
              originalTitle: match.originalTitle || movie.originalTitle,
              studios: match.studios || movie.studios,
              director: movie.director || match.director,
              genre: (movie.genre && movie.genre.length > 0) ? movie.genre : match.genre,
              description: movie.description || match.description,
              cast: (movie.cast && movie.cast.length > 0) ? movie.cast : match.cast,
              castDetails: match.castDetails || movie.castDetails,
              logoUrl: match.logoUrl || movie.logoUrl,
              hasLogo: match.hasLogo || movie.hasLogo,
              similar: match.similar || movie.similar,
              isIframeEmbed: match.isIframeEmbed,
              iframeSrc: match.iframeSrc,
              tagline: movie.tagline || match.tagline,
              rating: movie.rating && movie.rating !== "N/A" ? movie.rating : match.rating
            } as Movie;
          }
          // Always return the TMDB movie so the collection is full, even if not found locally
          return {
            ...movie,
            isIframeEmbed: true,
            iframeSrc: ""
          };
        })
        .filter((m): m is Movie => m !== null);

      // Dynamically load unmatched movies from Jellyfin that belong to this saga!
      allMoviesBase.forEach((jf) => {
        const sagaIds = getDynamicSagaIds(jf);
        if (sagaIds.includes(collection.id)) {
          // Check if it's already represented to prevent duplicate titles
          if (!enrichedMovies.some(m => isMovieMatch(m.title, jf.title))) {
            const enriched = enrichDynamicMovie(jf, collection.id);
            enrichedMovies.push(enriched);
            matchedServersMovieIds.add(jf.id);
          }
        }
      });

      // SORT ACCORDING TO RECOMMENDED CHRONOLOGICAL OR OFFICIAL RELEASE ORDER
      const sortedMovies = sortSagaMovies(collection.id, enrichedMovies);

      return {
        ...collection,
        movies: sortedMovies};
    }).filter((col) => col.movies.length > 0);

    // 2. Classify other remaining server movies into custom franchise dynamic collections (like Matrix) using high-confidence classification
    const dynamicFranchiseCollections: any[] = [];
    FRANCHISES.forEach((franchise) => {
      const franchiseMovies = allMoviesBase
        .filter((m) => {
          if (matchedServersMovieIds.has(m.id)) return false;
          const classification = classifyMovie(m.title, m.originalTitle || "", m.director || "", m.genre || [], m.studios || []);
          return classification.confidence === "high" && classification.franchiseId === franchise.id;
        })
        .map((m) => {
          matchedServersMovieIds.add(m.id);
          return enrichDynamicMovie(m, franchise.id);
        });

      if (franchiseMovies.length >= 1) {
        const sortedFranchise = franchiseMovies.sort((a, b) => a.year - b.year);
        dynamicFranchiseCollections.push({
          id: `franchise-${franchise.id}`,
          title: franchise.title,
          description: franchise.description,
          movies: sortedFranchise});
      }
    });

    // 3. Classify other remaining server movies into dynamic director retrospectives
    const dynamicDirectorCollections: any[] = [];
    const remainingAfterFranchises = allMoviesBase.filter((m) => !matchedServersMovieIds.has(m.id));
    
    const directorGroups: Record<string, Movie[]> = {};
    remainingAfterFranchises.forEach((m) => {
      if (m.director && m.director.trim() !== "" && !/unknown|inconnu|divers|various|various directors/i.test(m.director)) {
        const dName = m.director.trim();
        // Skip directors already in main sagas (Quentin Tarantino and Christopher Nolan)
        if (!/tarantino|nolan|avildsen|stallone|stalonne|fincher|wingard|wingrad|coogler|spielberg|horvath|gareth edwards|justin lin/i.test(dName)) {
          if (!directorGroups[dName]) {
            directorGroups[dName] = [];
          }
          directorGroups[dName].push(m);
        }
      }
    });

    Object.entries(directorGroups).forEach(([directorName, movies]) => {
      if (movies.length >= 2) {
        const enrichedMovies = movies.map((m) => {
          matchedServersMovieIds.add(m.id);
          return enrichDynamicMovie(m, "director");
        });

        const slug = directorName.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "-");
        dynamicDirectorCollections.push({
          id: `director-${slug}`,
          title: directorName,
          description: `Retrospective dedicated to the exceptional work of director: ${directorName}.`,
          movies: enrichedMovies});
      }
    });

    // Sort dynamic director collections A-Z
    dynamicDirectorCollections.sort((a, b) => a.title.localeCompare(b.title));

    // 4. Classify leftover unmatched movies into genre categories (shelf rows)
    const finalUnmatchedMovies = allMoviesBase.filter((m) => {
      if (matchedServersMovieIds.has(m.id)) return false;
      const t = m.title.toLowerCase();
      if (t.includes("john wick")) return false;
      if (t.includes("batman begins")) return false;
      if (t.includes("fast and furious") || t.includes("fast & furious") || t.includes("furious 7") || t.includes("fast 5") || t.includes("fast x")) return false;
      if (t.includes("devil wears prada 2") || t.includes("le diable s'habille en prada 2")) return false;
      if (t.includes("bronx tale") || t.includes("il était une fois dans le bronx")) return false;
      if (t.includes("21 jump street") || t.includes("22 jump street") || t.includes("superbad") || t.includes("grown ups") || t.includes("white chicks")) return false;
      if (t.includes("memories of murder")) return false;
      return true;
    });

    const genreGroupsMap: Record<string, { title: string, movies: Movie[] }> = {};
    finalUnmatchedMovies.forEach((movie) => {
      const genres = movie.genre && movie.genre.length > 0 ? movie.genre : ["Divers"];
      genres.forEach((genreName) => {
        const title = genreName.trim();
        const idClean = title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "-");
        
        if (!genreGroupsMap[idClean]) {
          genreGroupsMap[idClean] = { title, movies: [] };
        }
        if (!genreGroupsMap[idClean].movies.some((m) => m.id === movie.id)) {
          genreGroupsMap[idClean].movies.push({
            ...movie,
            gradient: GENRE_AESTHETICS[title.toLowerCase()]?.gradient || "from-slate-900 via-neutral-900 to-zinc-950/40",
            accentColor: GENRE_AESTHETICS[title.toLowerCase()]?.accentColor || "text-zinc-400 border-zinc-800 bg-zinc-900/10",
            accentHex: GENRE_AESTHETICS[title.toLowerCase()]?.accentHex || "#71717a",
            symbol: GENRE_AESTHETICS[title.toLowerCase()]?.symbol || "🎬🎥"
          });
        }
      });
    });

    // Construct dynamic genre collections
    const genreCollections = Object.values(genreGroupsMap).map(({ title, movies }) => {
      const idClean = title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "-");
      const config = GENRE_AESTHETICS[title.toLowerCase()] || {
        description: `Selection of auteur films cataloged under the ${title} theme.`
      };
      return {
        id: `genre-${idClean}`,
        title: `Cinéma ${title}`,
        description: config.description,
        movies: movies
      };
    }).filter((g) => g.movies.length > 0);

        const finalCollections = [
      ...curatedSagaCollections,
      ...dynamicFranchiseCollections,
      ...dynamicDirectorCollections
    ];

    // APPLY COLLECTION MODS
    const mods = collectionMods || { deletedCollections: [], addedMovies: {}, removedMovies: {} };
    
    // INJECT CUSTOM CATEGORY MOVIES
    allMoviesBase.forEach(m => {
      if (m.customCategory && m.customCategory !== "none") {
        let target = finalCollections.find(c => c.title === m.customCategory);
        if (target) {
          // Avoid duplicate pushing
          if (!target.movies.some(existing => existing.id === m.id)) {
            target.movies.push({ ...m});
          }
        } else {
          finalCollections.push({
            id: `custom-${m.customCategory.toLowerCase().replace(/[^a-z]/g, '-')}`,
            title: m.customCategory,
            description: "Catégorie Personnalisée",
            movies: [{ ...m}]
          });
        }
      }
    });

    
    let filteredCollections = finalCollections.filter(c => !mods.deletedCollections.some(d => d === c.id || d === c.title || d === c.title.toLowerCase().replace(/\s+/g, "-")));
    
    
    const ids = new Set();
    filteredCollections.forEach(c => {
      if (ids.has(c.id)) {
        console.warn("DUPLICATE ID FOUND IN FINAL COLLECTIONS:", c.id);
      }
      ids.add(c.id);
    });
    return filteredCollections.map((col) => {
      // Apply manual movie additions from mods (assuming movie exists in allMoviesBase or allMoviesBaseData)
      let customAdded = (mods.addedMovies[col.id] || []).map(id => allMoviesBase.find(m => String(m.id) === String(id)) || tmdbCache.find(m => String(m.id) === String(id))).filter(Boolean);
      col.movies = [...col.movies, ...customAdded];
      
      // Apply manual movie removals
      if (mods.removedMovies[col.id]) {
        col.movies = col.movies.filter(m => !mods.removedMovies[col.id].includes(String(m.id)));
      }
      

      // Nettoyer et éliminer tout doublon de film (doublons par ID ou par titre identique)
      const seenIds = new Set<string>();
      const seenTitles = new Set<string>();
      const uniqueMovies = col.movies.filter((movie) => {
        if (!movie) return false;
        const idKey = String(movie.id);
        const titleKey = movie.title.toLowerCase().trim();
        if (seenIds.has(idKey) || seenTitles.has(titleKey)) {
          return false;
        }
        seenIds.add(idKey);
        seenTitles.add(titleKey);
        return true;
      });
      return {
        ...col,
        movies: uniqueMovies
      };
    }).filter((col) => col.movies.length > 0);
  }, [allMoviesBase, collectionMods]);

  // SAGA COMPLETENESS CHECKLIST VALIDATION ENGINE
  const sagaCompletenessList = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];

    const titleToMovieMap = new Map<string, Movie>();
    allMoviesBase.forEach(jf => {
      const ct = cleanTitle(jf.title);
      if (ct) titleToMovieMap.set(ct, jf);
    });

    const fastCheckOwned = (expectedMovie: Movie) => {
       const ct = cleanTitle(expectedMovie.title);
       if (ct && titleToMovieMap.has(ct)) return true;
       return allMoviesBase.some(jf => isMovieMatch(expectedMovie.title, jf.title));
    };

    return COLLECTIONS.map(collection => {
      const ownedTitles: string[] = [];
      const missingMovies: Array<{ title: string; year: number }> = [];

      collection.movies.forEach(expectedMovie => {
        const isOwned = fastCheckOwned(expectedMovie);
        if (isOwned) {
          ownedTitles.push(expectedMovie.title);
        } else {
          missingMovies.push({ title: expectedMovie.title, year: expectedMovie.year });
        }
      });

      const totalExpected = collection.movies.length;
      const countOwned = ownedTitles.length;
      const percentage = totalExpected > 0 ? Math.round((countOwned / totalExpected) * 100) : 100;

      return {
        id: collection.id,
        title: collection.title,
        countOwned,
        totalExpected,
        percentage,
        missingMovies
      };
    });
  }, [allMoviesBase]);

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
  };

  const expandCollection = (collectionId: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: true
    }));
  };

  // References to horizontal carousel containers for navigation buttons
  const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const hoveredCarousels = useRef<Record<string, boolean>>({});
  const scrollPositions = useRef<Record<string, number>>({});
  const rowSpeedMultipliers = useRef<Record<string, number>>({});
  const heroTouchStartX = useRef<number | null>(null);


  const [isTestingOdyssey, setIsTestingOdyssey] = useState(false);
        
  
  const handleRecalculateSagas = async () => {
    setIsRecalculating(true);
    try {
      const res = await fetch("/api/jellyfin/recalculate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await Promise.all([loadJellyfinLibrary(), loadJellyfinHeroMovie()]);
      }
    } catch (err) {
      console.error("Error recalculating sagas:", err);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Load library movies from backend
    
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setRoutePath(path);
      
      if (!path.startsWith("/player/")) {
        loadProgress();
        const savedHistory = localStorage.getItem("classico_history");
        if (savedHistory) {
          try {
            const h = JSON.parse(savedHistory);
            if (Array.isArray(h)) setHistory(h);
          } catch (e) {}
        }
      }
      if (path === "/") setActiveTab("accueil");
      else if (path === "/collections") setActiveTab("collections");
      else if (path === "/series") setActiveTab("series");
      else if (path === "/profil") setActiveTab("profil");
      else if (path.startsWith("/collection/")) {
        setSelectedCollectionId(path.split("/")[2]);
        setActiveTab("collection-detail");
      }
      else if (path.startsWith("/player/")) {
        setActiveTab("player");
      }
      else if (path.startsWith("/movie/")) {
        setActiveTab("movie");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const loadJellyfinLibrary = async () => {};

  useEffect(() => {
    loadJellyfinLibrary();
  }, []);

  const loadJellyfinHeroMovie = async () => {};

  // Reset title display preferences when user slides to a different hero film
  useEffect(() => {
    setUseTextTitleForHero(false);
  }, [currentHeroIndex]);

  // Automatic advances interval for dynamic Jellyfin Hero banner collection (10s loops)
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

// Load Jellyfin Hero effect removed

  // Listen for background full library updates (especially useful on deployed/Netlify environments)
  useEffect(() => {
    const handleMoviesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && Array.isArray(customEvent.detail.movies)) {
        console.log("[CLIENT EVENT] Received updated movies list via event listener");
        
      }
    };
    window.addEventListener("classico-movies-updated", handleMoviesUpdated);
    return () => {
      window.removeEventListener("classico-movies-updated", handleMoviesUpdated);
    };
  }, []);

  

  

  // Load watchlist and search default spotlight film
  useEffect(() => {
    // Watchlist persistence
    const savedWatchlist = localStorage.getItem("classico_watchlist");
    if (savedWatchlist) {
      try {
        const w = JSON.parse(savedWatchlist); if (Array.isArray(w)) setWatchlist(w);
      } catch (e) {
        console.error(e);
      }
    }

    // History persistence
    const savedHistory = localStorage.getItem("classico_history");
    if (savedHistory) {
      try {
        const h = JSON.parse(savedHistory); if (Array.isArray(h)) setHistory(h);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Progress persistence
    const savedProgress = localStorage.getItem("classico_progress");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress) || {};
        const newProgressData: Record<string, number> = {};
        Object.keys(parsed || {}).forEach(k => {
           let pct = 0;
           if (typeof parsed[k] === 'number') pct = parsed[k];
           else if (parsed[k] && parsed[k].type === "tv" && parsed[k].show_progress) {
             const s = parsed[k].last_season_watched || 1;
             const e = parsed[k].last_episode_watched || 1;
             const epProg = parsed[k].show_progress[`s${s}e${e}`];
             if (epProg && epProg.progress) {
                 const duration = epProg.progress.duration || 0;
                 pct = duration > 0 ? (epProg.progress.watched / duration) : (epProg.progress.watched > 0 ? 0.5 : 0);
             }
           }
           else if (parsed[k] && parsed[k].currentTime !== undefined) {
             const duration = parsed[k].duration || 0;
             pct = duration > 0 ? (parsed[k].currentTime / duration) : (parsed[k].currentTime > 0 ? 0.5 : 0);
           } else if (parsed[k] && parsed[k].duration) {
             pct = parsed[k].currentTime / parsed[k].duration;
           }
           
           if (pct > (newProgressData[k] || 0) || !newProgressData[k]) newProgressData[k] = pct;
           if (!k.endsWith("-tv")) {
               if (pct > (newProgressData[k + "-tv"] || 0) || !newProgressData[k + "-tv"]) newProgressData[k + "-tv"] = pct;
           }
           if (k.endsWith("-tv")) {
               if (pct > (newProgressData[k.replace("-tv", "")] || 0) || !newProgressData[k.replace("-tv", "")]) newProgressData[k.replace("-tv", "")] = pct;
           }
        });
        setProgressData(newProgressData);
      } catch (e) {
        console.error(e);
      }
    }

    // Check Jellyfin server configuration status
    

  }, []);

  const handleToggleWatchlist = (movieID: string) => {
    const updated = watchlist.includes(movieID)
      ? watchlist.filter(id => id !== movieID)
      : [...watchlist, movieID];
    setWatchlist(updated);
    localStorage.setItem("classico_watchlist", JSON.stringify(updated));
  };

  const handleAddToHistory = (movieID: string) => {
    const updated = [movieID, ...history.filter(id => id !== movieID)].slice(0, 15);
    setHistory(updated);
    localStorage.setItem("classico_history", JSON.stringify(updated));
  };

    const goBackOrHome = () => {
    // If we have history within the app, let's go back
    if (window.history.state !== null || window.history.length > 2) {
        window.history.back();
    } else {
        navigateTo("/");
    }
  };

  const handleOpenMovie = (movie: Movie, immediatePlay = false) => {
    setSearchQuery(""); setSearchInput("");
    setIsMobileSearchOpen(false);
    if (immediatePlay) {
      // Enregistrer le temps du clic initial
      (window as any).moviePlayClickTime = performance.now();
      console.log("%c[CHRONO LECTEUR] Clic sur le film : 0.000s (Début du flux)", "color: #a855f7; font-weight: bold; font-size: 13px;");
      
      let pId = movie.id;
      if (movie.isTv) {
        try {
          const tvState = (JSON.parse(localStorage.getItem("classico_tv_state") || "{}") || {});
          const state = tvState[movie.id];
          const s = state ? state.season : 1;
          const e = state ? state.episode : 1;
          pId = `${movie.id}-S${s}E${e}`;
        } catch(e) {
          pId = `${movie.id}-S1E1`;
        }
      }
      
      // Préchargement immédiat de l'API de playback au clic pour devancer la navigation de la page
      const prefetches = (window as any).playbackPrefetches || {};
      prefetches[pId] = fetch(`/api/playback/${encodeURIComponent(pId)}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const ct = res.headers.get("content-type");
          if (!ct || !ct.includes("application/json")) throw new Error("Not JSON");
          return res.json();
        })
        .catch(err => {
          console.warn("[PLAYBACK PREFETCH ERROR]", err);
          return null;
        });
      (window as any).playbackPrefetches = prefetches;

      navigateTo("/player/" + pId);
    } else {
      navigateTo("/movie/" + movie.id);
    }
    handleAddToHistory(movie.id);
  };

  // Carousel smooth scrolling helper
  const scrollCarousel = (collectionId: string, direction: "left" | "right") => {
    const container = carouselRefs.current[collectionId];
    if (container) {
      const scrollAmt = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

  // Continuous scroll animation removed for max-fluidity, standard native sub-millisecond scrolling with chevrons is retained.
  // Avoids any background CPU/GPU thread starvation or memory consumption.

  // Keyboard controls for carousels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is active, let it handle its own controls
      if (selectedMovie) return;
      if (e.key === "Escape") {
        setSearchQuery(""); setSearchInput("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMovie]);

  // Filter movies globally based on search query
  const [tmdbSearchResults, setTmdbSearchResults] = useState<Movie[]>([]);
  const [movieLoadError, setMovieLoadError] = useState<string | null>(null);


  const allMovies = React.useMemo(() => {

    const map = new Map<string, Movie>();
    
    // Add custom mapped collection movies first (they have beautiful gradients, symbols, etc., and are now enriched with Jellyfin dynamic streams!)
    mappedCollections.flatMap(c => c.movies).forEach(m => {
      map.set(m.id, m);
    });

    // Add Jellyfin-only library movies that did not match any of the hand-crafted collections
    allMoviesBase.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, { ...m});
      }
    });
    
    // Add TMDB cache movies
    tmdbCache.forEach(m => {
      if (true) {
        if (!map.has(m.id)) {
          map.set(m.id, m);
        } else {
          // Merge in missing details (like seasons)
          const existing = map.get(m.id)!;
          map.set(m.id, { ...existing, ...m });
        }
      }
    });

    return Array.from(map.values()).filter(m => !isAnimeOrAdult(m));
  }, [mappedCollections, allMoviesBase, tmdbCache]);

    const unmatchedMovies = React.useMemo(() => {
    if (!allMovies || allMovies.length === 0) return [];
    
    const inCollections = new Set<string>();
    mappedCollections.forEach(c => c.movies.forEach(m => inCollections.add(m.id)));

    return allMovies.filter(m => {
      if (inCollections.has(m.id)) return false;
      const t = m.title.toLowerCase();
      if (t.includes("john wick")) return false;
      if (t.includes("batman begins")) return false;
      if (t.includes("fast and furious") || t.includes("fast & furious") || t.includes("furious 7") || t.includes("fast 5") || t.includes("fast x")) return false;
      if (t.includes("devil wears prada 2") || t.includes("le diable s'habille en prada 2")) return false;
      if (t.includes("bronx tale") || t.includes("il était une fois dans le bronx")) return false;
      if (t.includes("21 jump street") || t.includes("22 jump street") || t.includes("superbad") || t.includes("grown ups") || t.includes("white chicks")) return false;
      if (t.includes("memories of murder")) return false;
      return true;
    });
  }, [allMovies, mappedCollections]);


  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
        const response = await fetch('/api/trending');
        if (!response.ok) return;
        const data = await response.json();
        const results = (data.results || []).map((m: any) => {
          const title = m.title || m.name || m.original_title || m.original_name;
          const isTv = m.media_type === "tv";
          return {
            id: isTv ? `${m.id}-tv` : String(m.id),
            tmdbId: String(m.id),
            isTv,
            title,
            originalTitle: m.original_title || m.original_name,
            description: m.overview || "",
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
            backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
            year: parseInt((m.release_date || m.first_air_date || "0").split("-")[0]) || 0,
            voteAverage: m.vote_average,
            director: "Unknown",
            cast: [],
            genre: [],
            isIframeEmbed: true,
            iframeSrc: ""
          };
        });

        if (results.length > 0) {
          setTmdbCache(prev => {
            const data = { results };
            const map = new Map(prev.map(m => [m.id, m]));
            data.results.forEach((m: any) => map.set(m.id, m));
            const newCache = Array.from(map.values());
            localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
            return newCache;
          });
          return;
        }
      } catch (e) {
        console.error("Trending API failed, trying TMDB fallback:", e);
      }
      
      // Fallback for static deployments
      const tmdbToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
      try {
        const res = await fetch('https://api.tmdb.org/3/trending/all/day?language=en-US', {
            headers: {
                "Authorization": `Bearer ${tmdbToken}`,
                "Accept": "application/json"
            }
        });
        if (res.ok) {
          const m = await res.json();
          if (m.results) {
            const isAnimeOrAdult = (r: any) => {
              if (r.adult) return true;
              if (r.original_language === 'ja' || r.original_language === 'ko' || r.original_language === 'zh') return true;
              if (r.origin_country && (r.origin_country.includes('JP') || r.origin_country.includes('KR') || r.origin_country.includes('CN'))) return true;
              
              const title = (r.title || r.name || r.original_title || r.original_name || '').toLowerCase();
              if (title.includes('naruto') || title.includes('boruto') || title.includes('dragon ball') || title.includes('one piece') || title.includes('bleach') || title.includes('attack on titan')) return true;
              
              if (r.genre_ids && r.genre_ids.includes(16)) {
                if (r.origin_country && r.origin_country.includes('JP')) return true;
                if (r.original_language === 'ja') return true;
              }
              return false;
            };
            const validResults = m.results.filter((r: any) => !isAnimeOrAdult(r));
            const formatted = validResults.map((r: any) => {
              const isTv = r.media_type === "tv";
              return {
                id: String(r.id) + (isTv ? "-tv" : ""),
                tmdbId: String(r.id),
                isTv,
                title: isTv ? r.name : r.title,
                originalTitle: isTv ? r.original_name : r.original_title,
                description: r.overview,
                posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : "",
                backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/w780${r.backdrop_path}` : "",
                year: r.release_date ? parseInt(r.release_date.split("-")[0]) : (r.first_air_date ? parseInt(r.first_air_date.split("-")[0]) : 0),
                voteAverage: r.vote_average,
                isIframeEmbed: true,
                iframeSrc: ""
              };
            });
            setTmdbCache(prev => {
              const map = new Map(prev.map((item: any) => [item.id, item]));
              formatted.forEach((item: any) => map.set(item.id, item));
              const newCache = Array.from(map.values());
              localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
              return newCache;
            });
          }
        }
      } catch (err) {
        console.error("TMDB Fallback failed:", err);
      }
    };
    fetchTrending();
  }, []);

  


  useEffect(() => {
    if (!searchQuery.trim() || isAnimeOrAdultKeyword(searchQuery)) {
      setTmdbSearchResults([]);
      return;
    }
    
    setIsSearchingTmdb(true);
    const delayDebounceFn = setTimeout(() => {
      const url = `https://api.tmdb.org/3/search/multi?query=${encodeURIComponent(searchQuery)}&language=en-US&page=1&include_adult=false`;
      const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
      fetch(url, { headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`, Accept: "application/json" } })
        .then(res => res.json())
        .then(data => {
          if (data && data.results) {
            // Re-format TMDB results to Movie type
            const results = data.results
                .filter((r: any) => (r.media_type === 'movie' || r.media_type === 'tv') && !r.adult && !isAnimeOrAdult(r))
                .map((r: any) => ({
                  id: r.media_type === 'tv' ? `${r.id}-tv` : r.id,
                  title: r.title || r.name,
                  posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : "",
                  year: parseInt((r.release_date || r.first_air_date || "0").substring(0, 4)) || 0,
                  genre: [],
                  type: r.media_type === 'tv' ? "serie" : "movie",
                  overview: r.overview,
                  rating: r.vote_average,
                  isTmdb: true
                }));
            setTmdbSearchResults(results);
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              results.forEach((m: Movie) => map.set(m.id, m));
              const newCache = Array.from(map.values());
              localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
              return newCache;
            });
          }
        })
        .finally(() => setIsSearchingTmdb(false));
    }, 15);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const libraryGenres = React.useMemo(() => {
    const genres = new Set<string>();
    allMovies.forEach(m => m.genre?.forEach(g => genres.add(g)));
    return ["All", ...Array.from(genres).sort()];
  }, [allMovies]);

  const libraryYears = React.useMemo(() => {
    const years = new Set<string>();
    allMovies.forEach(m => { if(m.year) years.add(m.year.toString()); });
    return ["All", ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [allMovies]);

  const filteredLibraryMovies = React.useMemo(() => {
    const map = new Map<string, Movie>();
    mappedCollections.flatMap(c => c.movies).forEach(m => map.set(m.id, m));
    allMoviesBase.forEach(m => { if (!map.has(m.id)) map.set(m.id, m); });
    let filtered = Array.from(map.values()).filter(m => !isAnimeOrAdult(m));

    if (librarySearch.trim() !== "") {
      const q = librarySearch.toLowerCase();
      filtered = filtered.filter(m => 
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q))
      );
    }

    if (libraryGenre !== "All") {
      filtered = filtered.filter(m => m.genre?.includes(libraryGenre));
    }

    if (libraryYear !== "All") {
      filtered = filtered.filter(m => m.year?.toString() === libraryYear);
    }

    if (libraryType !== "all") {
      filtered = filtered.filter(m => libraryType === "tv" ? !!m.isTv : !m.isTv);
    }

    // Filter out movies without posters to clean up the library
    filtered = filtered.filter(m => m.posterUrl && m.posterUrl.trim() !== "");

    // Sort
    return [...filtered].sort((a, b) => {
      if (librarySort === "popularity") {
        // Better mock popularity: prioritize trending/curated movies, then vote average
        const isCuratedA = mappedCollections.some(c => c.movies.some(cm => cm.id === a.id)) ? 1000 : 0;
        const isCuratedB = mappedCollections.some(c => c.movies.some(cm => cm.id === b.id)) ? 1000 : 0;
        
        const popA = isCuratedA + (a.voteAverage || 0) * 10 + ((a.year && a.year > 2015) ? (a.year - 2015) * 2 : 0);
        const popB = isCuratedB + (b.voteAverage || 0) * 10 + ((b.year && b.year > 2015) ? (b.year - 2015) * 2 : 0);
        return popB - popA;
      } else if (librarySort === "rating") {
        return (b.voteAverage || 0) - (a.voteAverage || 0);
      } else if (librarySort === "year") {
        return (b.year || 0) - (a.year || 0);
      } else if (librarySort === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [allMoviesBase, mappedCollections, librarySearch, libraryGenre, libraryYear, libraryType, librarySort]);

  const searchedMovies = React.useMemo(() => {
    if (searchQuery.trim() === "") return [];
    
    const localMatches = isAnimeOrAdultKeyword(searchQuery) ? [] : allMovies.filter(m => 
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.genre && m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    
    // Merge local and TMDB, avoiding duplicates by id
    const merged = [...localMatches];
    const localIds = new Set(localMatches.map(m => String(m.id)));
    
    tmdbSearchResults.filter(m => {
      const title = (m.title || (m as any).name || '').toLowerCase();
      return !isAnimeOrAdultKeyword(title);
    }).forEach(tmdbMovie => {
      // Check if we already have this TMDB id in local (local might use imdbId as id, but tmdbMovie has tmdbId)
      // We check both id and tmdbId
      const existsLocal = merged.some(m => m && (String(m.tmdbId) === String(tmdbMovie.tmdbId) || String(m.id) === String(tmdbMovie.id) || String(m.imdbId) === String(tmdbMovie.tmdbId) || (m.providerIds && m.providerIds.Tmdb && String(m.providerIds.Tmdb) === String(tmdbMovie.tmdbId)) || (m.title && tmdbMovie.title && m.title.toLowerCase() === tmdbMovie.title.toLowerCase() && m.year === tmdbMovie.year)));
      if (!existsLocal) {
        merged.push(tmdbMovie);
      }
    });
    
    
    const uniqueMerged = [];
    const seenTmdbIds = new Set();
    const seenTitles = new Set();
    
    for (const m of merged) {
      const isTvStr = m.isTv ? 'tv' : 'movie';
      
      const tmdbKey = m.tmdbId ? `${m.tmdbId}-${isTvStr}` : null;
      const titleKey = `${(m.title || '').toLowerCase()}-${m.year}-${isTvStr}`;
      
      const hasTmdb = tmdbKey && seenTmdbIds.has(tmdbKey);
      const hasTitle = seenTitles.has(titleKey);
      
      if (!hasTmdb && !hasTitle) {
        if (tmdbKey) seenTmdbIds.add(tmdbKey);
        seenTitles.add(titleKey);
        uniqueMerged.push(m);
      }
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    uniqueMerged.sort((a, b) => {
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      const aExact = aTitle === lowerQuery;
      const bExact = bTitle === lowerQuery;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aStarts = aTitle.startsWith(lowerQuery);
      const bStarts = bTitle.startsWith(lowerQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return 0; // preserve original order (tmdb is already popularity sorted)
    });

    return uniqueMerged;
  }, [searchQuery, allMovies, tmdbSearchResults]);

  const targetMovieId = React.useMemo(() => {
    let targetId = "";
    if (routePath.startsWith("/movie/")) {
      targetId = routePath.slice("/movie/".length);
    } else if (routePath.startsWith("/player/")) {
      targetId = routePath.slice("/player/".length);
    }
    const tvMatch = targetId.match(/^(.*-tv)-S\d+E\d+$/);
    if (tvMatch) {
      targetId = tvMatch[1];
    }
    return targetId;
  }, [routePath]);

  const activeMovie = React.useMemo(() => {
    if (!targetMovieId) return null;
    return allMovies.find(m => m.id === targetMovieId) || null;
  }, [targetMovieId, allMovies]);

  // Fetch missing movie data if navigated directly
  useEffect(() => {
    if (targetMovieId && (!activeMovie || !activeMovie.director || activeMovie.tagline === undefined || !activeMovie.castDetails || (activeMovie.isTv && !activeMovie.seasons))) {
      setMovieLoadError(null);
      const tmdbId = activeMovie?.tmdbId || activeMovie?.providerIds?.Tmdb;
      fetch(`/api/movie/${tmdbId ? (activeMovie?.isTv ? tmdbId + "-tv" : tmdbId) : targetMovieId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.movie) {
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              map.set(targetMovieId, { ...(activeMovie || {}), ...data.movie, id: targetMovieId });
              const newCache = Array.from(map.values());
              localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
              return newCache;
            });
          } else {
            if (!activeMovie) {
              setMovieLoadError(data.error || "Failed to load movie data.");
            }
          }
        })
        .catch(err => {
          console.error("Error fetching missing movie data:", err);
          if (!activeMovie) {
            setMovieLoadError(err.message);
          }
        });
    }
  }, [targetMovieId, activeMovie]);

  // Fetch missing history movies on mount so Resume Watching is preserved
  useEffect(() => {
    if (history.length > 0 && allMovies.length > 0) {
      const missingIds = history.filter(id => !allMovies.find(m => m.id === id || m.id === String(id) + "-tv" || m.id === String(id).replace("-tv", "")));
      if (missingIds.length > 0) {
        missingIds.forEach(id => {
          const tmdbId = String(id).replace("-tv", "");
          fetch(`/api/movie/${id}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.movie) {
                setTmdbCache(prev => {
                  if (prev.find(m => m.id === id)) return prev;
                  const map = new Map(prev.map(m => [m.id, m]));
                  map.set(id, { ...data.movie, id });
                  const newCache = Array.from(map.values());
                  localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
                  return newCache;
                });
              }
            })
            .catch(err => console.error("Failed to fetch missing history movie:", err));
        });
      }
    }
  }, [history, allMovies.length]); // allMovies.length is used so it runs initially when loaded

  // Intercept and return the standalone full-screen cinema view with zero overlay UI
  if (activeTab === "player") {
    const pId = routePath.startsWith("/player/") ? routePath.slice("/player/".length) : "";
    

    
    return (
      <ErrorBoundary 
        fallbackTitle="Interruption de la lecture du film"
        onReset={() => navigateTo("/movie/" + pId)}
      >
        {(() => {
          let actualId = pId;
          let season, episode;
          const tvMatch = pId.match(/^(.*-tv)-S(\d+)E(\d+)$/);
          if (tvMatch) {
            actualId = tvMatch[1];
            season = parseInt(tvMatch[2]);
            episode = parseInt(tvMatch[3]);
          }
          return (
            <CinemaPlayerView
              movieId={actualId}
              isTv={!!tvMatch}
              season={season}
              episode={episode}
              movieTitle={activeMovie?.title || "Cult Classic"}
              movieDuration={activeMovie?.duration}
              moviePoster={activeMovie?.posterUrl || (activeMovie as any)?.poster}
              movieBackdrop={activeMovie?.backdropUrl || (activeMovie as any)?.backdrop}
              onClose={() => navigateTo("/movie/" + actualId)}
            />
          );
        })()}
      </ErrorBoundary>
    );
  }

  const getProgress = (id: string) => {
    let pct = progressData[id] || 0;
    if (pct === 0) {
      const m = allMovies.find(m => m.id === id || m.id === String(id) + "-tv" || m.id === String(id).replace("-tv", ""));
      if (m && m.tmdbId && progressData[m.tmdbId]) {
         pct = progressData[m.tmdbId];
      }
    }
    return pct;
  };

  if (!asyncData) {
    if (typeof window !== 'undefined' && sessionStorage.getItem('returning_from_ad') === 'true') {
      return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#FFD700] border-t-transparent animate-spin drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"></div>
        </div>
      );
    }
    return (
      <div id="startup-screen" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'100vh',backgroundColor:'#000',pointerEvents:'none',userSelect:'none'}}>
        <div style={{position:'relative',overflow:'hidden',display:'flex',alignItems:'center'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:'1.875rem',letterSpacing:'0.22em',textTransform:'uppercase',lineHeight:1,background:'linear-gradient(135deg, #bf953f 0%, #fcf6ba 15%, #b38728 35%, #fbf5b7 55%, #aa771c 75%, #fcf6ba 90%, #bf953f 100%)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            CLASSICO
          </span>
        </div>
        <span style={{fontFamily:"'Pinyon Script',cursive",display:'block',fontSize:'1.25rem',color:'#f4ecd8',lineHeight:1,marginTop:'-2px',userSelect:'none',textAlign:'center',transform:'translateX(-3px)',filter:'drop-shadow(0 0 4px rgba(244,236,216,0.2))'}}>
          The Best
        </span>
        <div id="startup-screen" style={{display:'flex',gap:'8px',marginTop:'32px'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#fcf6ba',boxShadow:'0 0 10px rgba(252,246,186,0.8)',animation:'illuminate 1.5s infinite ease-in-out both',animationDelay:'0s'}}></div>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#fcf6ba',boxShadow:'0 0 10px rgba(252,246,186,0.8)',animation:'illuminate 1.5s infinite ease-in-out both',animationDelay:'-1.0s'}}></div>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#fcf6ba',boxShadow:'0 0 10px rgba(252,246,186,0.8)',animation:'illuminate 1.5s infinite ease-in-out both',animationDelay:'-0.5s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-stone-100 font-sans selection:bg-amber-500 selection:text-black antialiased overflow-x-hidden font-sans">
      
      {/* ========================================================== */}
      {/* 1. FIXED GLASS HEADER BAR                                 */}
      {/* ========================================================== */}
      <header className={`fixed top-0 left-0 right-0 z-[9999] pt-[env(safe-area-inset-top)] transition-all duration-300 ease-in-out border-b ${isScrolled ? "bg-black border-white/5" : "bg-black border-transparent"}`}>
        <div className="max-w-[2000px] mx-auto px-4 sm:px-8 py-0.5 md:py-1 flex flex-row items-center justify-between gap-2.5 md:gap-4 font-sans w-full">
          
          {/* Logo CLASSICO with Metallic Gold Reflection */}
          <div 
            className="flex flex-col items-center cursor-pointer group select-none py-0.5 md:py-1 shrink-0"
            onClick={() => {
              navigateTo("/");
              setSearchQuery(""); setSearchInput("");
            }}
          >
            <div className="relative overflow-hidden flex items-center">
              <span className="font-cinzel font-bold text-[17px] sm:text-lg md:text-xl tracking-[0.22em] gold-metallic-text uppercase leading-none transition-all duration-300 group-hover:scale-102">
                CLASSICO
              </span>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
            </div>
            <span className="block font-signature text-[10px] sm:text-[12px] md:text-[14px] text-[#f4ecd8] leading-none mt-[-2px] sm:mt-[-1px] select-none text-center translate-x-[-3px] filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature">
              The Best
            </span>
          </div>

          {/* Desktop Search & Nav (hidden on mobile), Mobile Action Buttons */}
          <div className="flex items-center gap-3 w-full justify-end">
            
            {/* Interactive Search Field Bar (Desktop always, Mobile conditionally visible) */}
            <div className={`relative w-full md:max-w-xs lg:max-w-sm group font-sans transition-all duration-300 ${isMobileSearchOpen ? 'block' : 'hidden md:block'}`}>
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-400 transition-colors duration-200">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                id="global-search-input"
                type="text"
                placeholder="Search for a movie, director..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                  }
                }}
                className="w-full bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 text-stone-100 placeholder-zinc-500 text-[11px] sm:text-xs pl-9 pr-4 py-1.5 md:py-2 rounded-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 shadow-inner group-hover:border-zinc-700/80 font-sans"
              />
              { (searchQuery || searchInput) && (
                <button
                  id="clear-search-btn"
                  onClick={() => { setSearchQuery(""); setSearchInput(""); }}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-white text-[10px] font-mono"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Mobile Actions: Search Toggle & Hamburger (hidden on md) */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              {!isMobileSearchOpen && (
                <button 
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2 text-zinc-400 hover:text-amber-400 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-zinc-300 hover:text-amber-400 transition-colors z-50 relative"
              >
                {isMobileMenuOpen ? <X strokeWidth={1.5} className="w-7 h-7" /> : <Menu strokeWidth={1.5} className="w-7 h-7" />}
              </button>
            </div>

            {/* Desktop Navigation Controls Menu */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2 font-sans">
              {[
                { id: "accueil", label: "Home", icon: Compass },
                { id: "collections", label: "Movies", icon: FilmIcon },
                { id: "series", label: "Series", icon: Tv },
                { id: "animco", label: "Animco", icon: Handshake, external: "https://www.animcostreaming.com" },
                { id: "profil", label: "My Profile", icon: User }
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id && searchQuery === "";
                return (
                  <button
                    id={`nav-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => {
                      if (tab.external) {
                        window.location.href = tab.external;
                        return;
                      }
                      navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                      setSearchQuery(""); setSearchInput("");
                    }}
                    className={`relative flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-none text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-250 font-sans ${
                      isActive
                        ? "text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {tab.label}
                    {tab.id === "profil" && watchlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] text-white font-mono rounded-full flex items-center justify-center border border-black font-extrabold shadow-sm animate-pulse">
                        {watchlist.length}
                      </span>
                    )}
                    {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden absolute top-[calc(100%+0.5rem)] right-4 w-48 bg-black/75 backdrop-blur-md overflow-hidden border border-white/5 rounded-2xl shadow-2xl origin-top-right"
            >
              <nav className="flex flex-col py-2 px-2 gap-1">
                {[
                  { id: "accueil", label: "Home", icon: Compass },
                  { id: "collections", label: "Movies", icon: FilmIcon },
                  { id: "series", label: "Series", icon: Tv },
                  { id: "animco", label: "Animco", icon: Handshake, external: "https://www.animcostreaming.com" },
                  { id: "profil", label: "My Profile", icon: User }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id && searchQuery === "";
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (tab.external) {
                          window.location.href = tab.external;
                          return;
                        }
                        navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                        setSearchQuery(""); setSearchInput("");
                      }}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium tracking-wide transition-all duration-300 w-full text-left ${
                        isActive
                          ? "text-white"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <IconComp strokeWidth={2} className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                      {tab.label}
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ALERT BANNER */}
        
      </header>

      {/* Spacing for Fixed Header - Hidden for the home tab's Hero section to allow full screen 100vh display */}
      {(activeTab !== "accueil" || searchQuery.trim() !== "") && (
        <div className="h-[64px] md:h-[60px]" />
      )}

      {/* ========================================================== */}
      {/* 2. MAIN VIEWER CONTENT CONTAINER                           */}
      {/* ========================================================== */}
      <main className={(activeTab === "collections" || activeTab === "series") ? "min-h-screen" : "pb-16 min-h-[75vh]"}>
        <AnimatePresence mode="wait">

          {/* SEARCH RESULTS SHOWCASE GRID OVERLAY */}
          {searchQuery.trim() !== "" ? (
            <motion.div
              key="search-results-pane"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-[2000px] mx-auto px-4 sm:px-8 py-8 space-y-8"
            >
              <div className="space-y-2 text-left">
                <p className="text-xs font-mono uppercase tracking-[3px] text-zinc-500">SEARCH ENGINE</p>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                  Results for: <span className="text-amber-400 italic">"{searchQuery}"</span>
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                    {searchedMovies.length} cinematic masterpiece{searchedMovies.length > 1 ? "s" : ""} found
                  </p>
                  {isSearchingTmdb && (
                    <div className="w-4 h-4 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {searchedMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 pt-2 justify-items-center">
                  {searchedMovies.map((movie, idx) => (
                    <LazyVirtualCard key={`${movie.id}-search-${idx}`} priority={idx < 10}>
                      <MovieCard
                        movie={movie}
                        onSelect={(m) => handleOpenMovie(m, false)}
                        onPlay={(m) => handleOpenMovie(m, true)}
                      />
                    </LazyVirtualCard>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto text-zinc-600">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">No matches found</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans">
                    Some of our classic movies are grouped by director or themes. Try for example: <span className="text-amber-400 font-mono">Tarantino</span>, <span className="text-amber-400 font-mono">Nolan</span>, <span className="text-amber-400 font-mono">Star Wars</span> or <span className="text-amber-400 font-mono">Action</span>.
                  </p>
                </div>
              )}

              {/* Discord Request Banner */}
              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-[#1e1f24] to-zinc-900 border border-[#5865F2]/30 shadow-lg max-w-2xl mx-auto w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2]">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 127.14 96.36">
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z"/>
                      </svg>
                    </div>
                    <p className="text-sm sm:text-base font-sans font-medium text-zinc-200 text-center sm:text-left">
                      Can't find your movie? <span className="text-white font-semibold">Request it on our discord server</span>
                    </p>
                  </div>
                  <a
                    href="https://discord.gg/bGmAvKdWA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-sans font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:shadow-[0_0_25px_rgba(88,101,242,0.5)] shrink-0"
                  >
                    Request on Discord
                  </a>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "accueil" ? (
            /* ========================================================== */
            /* VIEW A: ACCUEIL - DISCOVER & SPOTLIGHT SECTIONS             */
            /* ========================================================== */
            <motion.div
              key="tab-accueil"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-12"
            >
              {/* Grand Showcase Spotlight Hero Section (Premium Netflix/Apple TV style) */}
              {isHeroLoading ? (
                <HeroSkeleton />
              ) : heroMovies.length > 0 && heroMovie ? (
                <div 
                  className="relative w-full h-[85vh] [@media(max-height:500px)_and_(orientation:landscape)]:h-[100vh] md:h-screen bg-black overflow-hidden flex items-end select-none"
                  onTouchStart={(e) => {
                    heroTouchStartX.current = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    if (heroTouchStartX.current === null) return;
                    const touchEndX = e.changedTouches[0].clientX;
                    const diff = heroTouchStartX.current - touchEndX;
                    
                    if (Math.abs(diff) > 50) { // threshold for swipe
                      if (diff > 0 && heroMovies.length > 1) {
                        // Swiped left, go to next
                        setDirection(1);
                        setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
                      } else if (diff < 0 && heroMovies.length > 1) {
                        // Swiped right, go to prev
                        setDirection(-1);
                        setCurrentHeroIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
                      }
                    }
                    heroTouchStartX.current = null;
                  }}
                >
                  
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={heroMovie.id}
                      custom={direction}
                      variants={{
                        enter: (dir: number) => ({
                          x: dir > 0 ? "100%" : "-100%",
                          opacity: 0}),
                        center: {
                          x: 0,
                          opacity: 1},
                        exit: (dir: number) => ({
                          x: dir < 0 ? "100%" : "-100%",
                          opacity: 0,
                          zIndex: 0})}}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 220, damping: 25, mass: 0.8 },
                        opacity: { duration: 0.4, ease: "easeInOut" }
                      }}
                      style={{ willChange: "transform" }}
                      className="absolute inset-0 w-full h-full flex items-end"
                    >
                      {/* Cinematic background image wrapper covering the full width */}
                      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                        <motion.img
                          src={heroMovie.backdropUrl || CLASSICO_HERO_BACKDROP}
                          alt={heroMovie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center md:object-top"
                          style={{ willChange: "transform" }}
                          animate={{ 
                            scale: [1.02, 1.05, 1.02],
                            x: [0, 4, 0],
                            y: [0, -2, 0]
                          }}
                          transition={{
                            duration: 40,
                            repeat: Infinity,
                            ease: "linear"}}
                        />
                      </div>

                      {/* Progressive cinematic bottom-to-top black gradient that separates the hero from the thematic library below */}
                      <div 
                        className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_top,#000_0%,#000_10%,rgba(0,0,0,0.9)_30%,rgba(0,0,0,0.4)_60%,transparent_100%)] md:!bg-[linear-gradient(to_top,#000_0%,#000_10%,rgba(0,0,0,0.95)_25%,rgba(0,0,0,0.6)_50%,transparent_100%)]" 
                      />

                      {/* Spotlight Content and Description Box with high contrast text drop-shadows */}
                      <div className="relative z-20 max-w-[2000px] mx-auto w-full px-4 sm:px-12 pb-14 sm:pb-28 pt-20 sm:pt-36 md:pt-28 flex flex-col items-start text-left [@media(max-height:500px)_and_(orientation:landscape)]:pb-4 [@media(max-height:500px)_and_(orientation:landscape)]:pt-16">
                        
                        {/* Fade-in Text Section Wrapper */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                          className="space-y-4 sm:space-y-5 w-full md:max-w-[35%] lg:max-w-[35%] min-w-[280px] sm:min-w-[360px] md:min-w-[0px] z-20 [@media(max-height:500px)_and_(orientation:landscape)]:space-y-2"
                        >
                          {/* Poster Style Cinematic Title or Logo with dynamic fallback to text based styling */}
                          {heroMovie.hasLogo && heroMovie.logoUrl && !useTextTitleForHero ? (
                            <div className="scale-75 sm:scale-100 origin-left select-none my-2 relative group uppercase italic leading-[0.9]">
                              <img 
                                src={heroMovie.logoUrl} 
                                alt={heroMovie.title}
                                className="h-12 xs:h-16 sm:h-20 lg:h-24 object-contain max-w-[85%] sm:max-w-[75%] select-none pointer-events-none filter brightness-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
                                referrerPolicy="no-referrer"
                                onError={() => {
                                  setUseTextTitleForHero(true);
                                }}
                              />
                              {/* Subtle user feedback action to bypass logo if it's white or unreadable */}
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUseTextTitleForHero(true);
                                }}
                                className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 text-[9.5px] font-sans text-zinc-400 hover:text-white transition-opacity bg-black/80 px-2 py-0.5 rounded border border-white/10"
                              >
                                Logo peu lisible ? Passer au format texte 🗸
                              </button>
                            </div>
                          ) : (
                            <div className="relative group my-1">
                              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black tracking-tight text-white uppercase italic leading-[1.05] filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] transform -skew-x-2">
                                {heroMovie.title}
                              </h1>
                              {heroMovie.hasLogo && heroMovie.logoUrl && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUseTextTitleForHero(false);
                                  }}
                                  className="mt-1.5 inline-flex items-center gap-1 opacity-60 hover:opacity-100 text-[9px] text-amber-400/90 hover:text-amber-300 bg-stone-900/60 hover:bg-stone-900 border border-white/5 hover:border-amber-400/20 px-2.5 py-0.5 rounded transition-all cursor-pointer font-mono"
                                >
                                  🖼️ Voir logo officiel
                                </button>
                              )}
                            </div>
                          )}

                          {/* Premium Discrete Pills / Badges for movie tags */}
                           <div className="flex w-full justify-start items-center gap-1.5 text-[10px] md:text-[9.5px] font-mono uppercase tracking-[0.08em] pb-1 md:pb-0">
                            <div className="hidden md:flex items-center gap-1.5">
                              {heroMovie.genre && heroMovie.genre.slice(0, 4).map((g: string) => (
                                <span key={g} className="whitespace-nowrap px-1.5 py-0.5 bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 rounded-full font-sans font-bold tracking-wider transition-colors duration-200">
                                  {g}
                                </span>
                              ))}
                            </div>
                            <span className="whitespace-nowrap px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold tracking-wider rounded-full">
                              {heroMovie.year}
                            </span>
                            <span className="whitespace-nowrap px-1.5 py-0.5 bg-white/5 border border-white/10 text-zinc-400 tracking-wider rounded-full">
                              {heroMovie.duration}
                            </span>
                            {heroMovie.rating && heroMovie.rating !== "N/A" && (
                              <span className="whitespace-nowrap px-1.5 py-0.5 bg-white/5 border border-white/10 text-zinc-300 font-bold tracking-wider rounded-full">
                                <span className="text-amber-500 font-extrabold mr-0.5">★</span>{heroMovie.rating}
                              </span>
                            )}
                          </div>

                          {/* Movie Description: Stricter clamping for a lighter card feeling (max 2/3 lines limit) */}
                          <p 
                            className="text-zinc-300 text-[11px] sm:text-xs md:text-sm leading-relaxed font-sans filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] line-clamp-2 md:line-clamp-3 overflow-hidden text-ellipsis whitespace-normal max-w-[70%] md:max-w-full"
                            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)" }}
                          >
                            {heroMovie.description}
                          </p>

                          {/* Netflix & Apple TV Styled Fluid Selection Buttons */}
                          <div className="flex items-center gap-2.5 pt-1.5">
                            <button
                              id="hero-play-btn"
                              onClick={() => handleOpenMovie(heroMovie, true)}
                              className="group flex items-center justify-center gap-1.5 sm:gap-2 bg-white hover:bg-neutral-100 text-stone-950 font-sans font-black px-4.5 py-2.5 sm:px-8 sm:py-3.5 rounded-full text-[10.5px] sm:text-xs md:text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] hover:scale-103 active:scale-95 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-stone-950 group-hover:scale-110 transition-transform duration-250" />
                              Play
                            </button>

                            <button
                              id="hero-info-btn"
                              onClick={() => handleOpenMovie(heroMovie, false)}
                              className="group flex items-center justify-center gap-1.5 sm:gap-2 bg-transparent hover:bg-white/10 border border-white/40 hover:border-white text-white font-sans font-black px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-full text-[10.5px] sm:text-xs md:text-sm tracking-widest uppercase transition-all duration-300 hover:scale-102 active:scale-95 cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:scale-110 transition-transform duration-250" />
                              More Info
                            </button>
                          </div>
                        </motion.div>

                      </div>

                    </motion.div>
                  </AnimatePresence>

                  {/* Carousel Dots Navigation Indicator at the bottom center */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-lg">
                    {heroMovies.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDirection(idx > currentHeroIndex ? 1 : -1);
                          setCurrentHeroIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentHeroIndex 
                            ? "w-4 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] shadow-[0_0_10px_rgba(252,246,186,0.8)]" 
                            : "w-1.5 bg-zinc-500/75 hover:bg-zinc-400"
                        }`}
                        title={`Aller au film ${idx + 1}`}
                        aria-label={`Aller au film ${idx + 1}`}
                      />
                    ))}
                  </div>

                </div>
              ) : null}
              

               {/* Collections Segment block - Horizontal Carousels grouped by Collection */}
              <div className="max-w-[2000px] mx-auto px-4 sm:px-8 space-y-12 pb-16">
                
                {/* Reprendre la lecture Section */}
                {(history.filter(id => getProgress(id) > 0 && getProgress(id) < 0.95).map(id => allMovies.find(m => m.id === id || m.id === String(id) + "-tv" || m.id === String(id).replace("-tv", ""))).filter(m => !!m).length > 0) && (
                  <div className="space-y-4 text-left pt-6 sm:pt-8">
                    <div className="flex flex-row items-center sm:items-end justify-between gap-2 sm:gap-3 border-b border-zinc-900 pb-2 sm:pb-3">
                      <div className="space-y-0.5 max-w-[80%]">
                        <span className="text-[8px] sm:text-[9px] font-mono tracking-[2px] sm:tracking-[3px] text-amber-500 uppercase font-bold">
                          CONTINUE WATCHING
                        </span>
                        <h3 className="text-base sm:text-2xl font-cinzel font-bold text-white uppercase tracking-widest leading-tight truncate">
                          Resume Watching
                        </h3>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      {/* Optional Overlay Carousel Arrows */}
                      <div className="hidden sm:flex absolute inset-y-0 -left-6 items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <button
                          onClick={() => scrollCarousel('resume-lecture', "left")}
                          className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                          title="Previous"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="hidden sm:flex absolute inset-y-0 -right-6 items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <button
                          onClick={() => scrollCarousel('resume-lecture', "right")}
                          className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                          title="Next"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Horizontal movie items flex row with ultra-fast virtualization */}
                      <div
                        id={`carousel-container-resume-lecture`}
                        ref={(el) => {
                          carouselRefs.current['resume-lecture'] = el;
                        }}
                        className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10"
                      >
                        {Array.from(new Set([...history, ...Object.keys(progressData).map(k => k.replace("-tv", ""))]))
                          .map(id => allMovies.find(m => m.id === id || m.id === String(id) + "-tv" || m.id === String(id).replace("-tv", "")))
                          .filter((m, idx, self) => !!m && self.findIndex(t => t?.id === m?.id) === idx)
                          .filter(m => {
                              const p = getProgress(m.id);
                              if (p <= 0) return false;
                              if (m.isTv) return true;
                              return p < 0.95;
                          })
                          .map((movie, idx) => (
                            <LazyVirtualCard key={`resume-${movie.id}-${idx}`} priority={idx < 6}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                                progressPercent={getProgress(movie.id)}
                              />
                            </LazyVirtualCard>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {(
                  <>
                    {/* Premium Discord Community Banner */}
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-zinc-900 via-[#1e1f24] to-zinc-900 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group">
                      {/* Subtle Background Glow */}
                      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#5865F2]/10 to-transparent opacity-50 pointer-events-none blur-3xl"></div>
                      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#5865F2]/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#5865F2]/30 transition-colors duration-700"></div>

                      <div className="relative px-4 py-4 sm:px-8 sm:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                        <div className="flex flex-row items-center gap-4 sm:gap-6 w-full">
                          {/* Discord Logo Container */}
                          <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 shadow-[0_0_20px_rgba(88,101,242,0.15)] group-hover:scale-105 group-hover:bg-[#5865F2]/20 group-hover:border-[#5865F2]/40 transition-all duration-300">
                            <svg className="w-6 h-6 sm:w-9 sm:h-9 text-[#5865F2]" fill="currentColor" viewBox="0 0 127.14 96.36">
                              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z"/>
                            </svg>
                          </div>

                          {/* Text Content */}
                          <div className="space-y-0.5 sm:space-y-2">
                            <h3 className="text-[15px] leading-tight sm:text-xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
                              Join Classico's community!
                            </h3>
                            <p className="text-[11px] sm:text-[15px] text-zinc-400 font-sans leading-snug sm:leading-relaxed max-w-2xl">
                              Connect with other movie lovers, report bugs, get updates, suggest movies, and be part of the Classico community.
                            </p>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                          <a
                            href="https://discord.gg/bGmAvKdWA"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full md:w-auto gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-sans font-bold px-4 py-2.5 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl text-[13px] sm:text-[14px] tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:shadow-[0_0_25px_rgba(88,101,242,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                          >
                            Join Discord
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="text-left py-1 select-none">
                      <h2 className="font-cinzel font-bold text-[17px] sm:text-2xl tracking-[0.1em] sm:tracking-[0.22em] gold-metallic-text uppercase leading-none whitespace-nowrap">
                        STRAIGHT BANGERS
                      </h2>
                      <span className="block font-signature text-[18px] sm:text-[23px] text-[#f4ecd8] leading-none mt-1 filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)]">
                        Cinematic Selections
                      </span>
                    </div>

                <div className="flex flex-col gap-6 sm:gap-8 divide-y divide-zinc-700/60">
                  {mappedCollections.map((collection, idx) => (
                    <div key={collection.id} className={`space-y-4 text-left ${idx > 0 ? "pt-6 sm:pt-8" : ""}`}>
                      {/* Collection Header with name and 'View All' button */}
                      <div className="flex flex-row items-center sm:items-end justify-between gap-2 sm:gap-3 border-b border-zinc-900 pb-2 sm:pb-3">
                        <div className="space-y-0.5 max-w-[80%]">
                          <span className="text-[8px] sm:text-[9px] font-mono tracking-[2px] sm:tracking-[3px] text-zinc-500 uppercase font-bold">
                            CINEMATIC COLLECTION • {collection.movies.length} MOVIES
                          </span>
                          <h3 className="text-base sm:text-2xl font-cinzel font-bold text-white uppercase tracking-widest leading-tight truncate">
                            {collection.title}
                          </h3>
                        </div>

                        <button
                          onClick={() => {
                            navigateTo("/collection-detail/" + collection.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="shrink-0 inline-flex items-center justify-center gap-1.5 text-[#e5c158] hover:text-white transition-all duration-200 sm:bg-[#BF953F]/5 sm:hover:bg-[#BF953F]/15 sm:border sm:border-[#BF953F]/40 sm:hover:border-[#FCF6BA]/60 sm:px-3.5 sm:py-1.5 sm:rounded-full cursor-pointer p-1.5 sm:p-0"
                        >
                          <span className="hidden sm:inline text-[10px] font-mono font-bold tracking-[1.5px] uppercase">
                            TOUT COMPRENDRE
                          </span>
                          <ChevronRight className="w-5 h-5 sm:w-3 sm:h-3" />
                        </button>
                      </div>

                      {/* Smooth Horizontal Carousel Row of Movies */}
                      <div 
                        className="relative group/carousel"
                        onMouseEnter={() => { hoveredCarousels.current[collection.id] = true; }}
                        onMouseLeave={() => { hoveredCarousels.current[collection.id] = false; }}
                      >
                        {/* Soft ambient mask on edges */}
                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />

                        {/* Navigation chevron triggers */}
                        <div className="absolute inset-y-0 left-2 flex items-center z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <button
                            onClick={() => scrollCarousel(collection.id, "left")}
                            className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                            title="Previous"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="absolute inset-y-0 right-2 flex items-center z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <button
                            onClick={() => scrollCarousel(collection.id, "right")}
                            className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                            title="Next"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Horizontal movie items flex row with ultra-fast virtualization */}
                        <div
                          id={`carousel-container-${collection.id}`}
                          ref={(el) => {
                            carouselRefs.current[collection.id] = el;
                          }}
                          className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10"
                        >
                          {collection.movies.slice(0, 40).map((movie, idx) => (
                            <LazyVirtualCard 
                              key={`${collection.id}-${movie.id}`}
                              priority={idx < 6}
                              className={collection.id === "trending-now" ? "w-[200px] min-[400px]:w-[240px] sm:w-[300px] aspect-[2/3] mr-12 sm:mr-20" : undefined}
                            >
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                                trendingIndex={collection.id === "trending-now" ? idx + 1 : undefined}
                              />
                            </LazyVirtualCard>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* OTHER BANGERS Section Removed */}
                  </>
                )}
              </div>
            </motion.div>
          ) : activeTab === "collections" ? (
            /* ========================================================== */
            /* VIEW B: LIBRARY (GRID VIEW)                                */
            /* ========================================================== */
            <LibraryView 
              key="library-movies"
              type="movie"
              onSelect={(m) => handleOpenMovie(m, false)}
              onPlay={(m) => handleOpenMovie(m, true)}
              getProgress={getProgress}
            />
          ) : activeTab === "series" ? (
            /* ========================================================== */
            /* VIEW B2: LIBRARY SERIES (GRID VIEW)                        */
            /* ========================================================== */
            <LibraryView 
              key="library-series"
              type="tv"
              onSelect={(m) => handleOpenMovie(m, false)}
              onPlay={(m) => handleOpenMovie(m, true)}
              getProgress={getProgress}
            />
          ) : activeTab === "collection-detail" ? (
            /* ========================================================== */
            /* VIEW D: COLLECTION DETAIL PAGE VIEW                        */
            /* ========================================================== */
            (() => {
              const selectedCollection = mappedCollections.find(c => c.id === selectedCollectionId) || mappedCollections[0];
              const bannerBg = COLLECTION_BANNERS[selectedCollection.id] || CLASSICO_ABSTRACT_BANNER;

              return (
                <motion.div
                  key={`collection-detail-${selectedCollection.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6 sm:space-y-10"
                >
                  {/* Top breadcrumb / navigation bar */}
                  <div className="hidden sm:block max-w-[2000px] mx-auto px-4 sm:px-8 pt-4">
                    <button
                      id="back-to-collections"
                      onClick={() => {
                        navigateTo("/collections");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-400 hover:text-amber-400 group/back py-2 px-3 bg-neutral-900/40 rounded-full border border-zinc-800 hover:border-amber-400/20 transition-all duration-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover/back:text-amber-400 transition-colors transform group-hover/back:-translate-x-0.5" />
                      BACK TO COLLECTIONS
                    </button>
                  </div>

                  {/* Content and details wrapper */}
                  <div className="max-w-[2000px] mx-auto w-full px-4 sm:px-8 pt-2 sm:pt-6 flex flex-col items-center text-center gap-3 sm:gap-4">
                    <div className="w-full flex justify-start sm:hidden mb-1">
                      <button
                        onClick={() => {
                          navigateTo("/collections");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="p-1.5 -ml-1.5 bg-neutral-900/40 rounded-full border border-zinc-800 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>

                    <h1 className="text-xl sm:text-3xl md:text-4xl font-cinzel font-bold tracking-wider uppercase leading-snug text-white flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
                      <span className="text-amber-400 text-lg sm:text-2xl md:text-3xl">★</span>
                      <span className="max-w-full break-words">{selectedCollection.title}</span>
                      <span className="text-amber-400 text-lg sm:text-2xl md:text-3xl">★</span>
                    </h1>

                    <p className="text-zinc-200 text-[11px] sm:text-base max-w-3xl leading-relaxed font-sans drop-shadow-md">
                      {selectedCollection.description}
                    </p>
                  </div>

                  {/* Grid presentation of films nested inside this collection */}
                  <div className="max-w-[2000px] mx-auto px-4 sm:px-8 pb-10 space-y-4 sm:space-y-6 mt-5 sm:mt-8">
                    <div className="border-t border-zinc-700/60 pt-4 sm:pt-6 text-left">
                      <h2 className="text-[13px] sm:text-base font-cinzel font-bold text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] truncate">
                        MOVIE CATALOG
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-8 justify-items-center">
                      {selectedCollection.movies.map((movie, idx) => (
                        <LazyVirtualCard key={`${movie.id}-detail-${idx}`} priority={idx < 8}>
                          <MovieCard
                            movie={movie}
                            onSelect={(m) => handleOpenMovie(m, false)}
                            onPlay={(m) => handleOpenMovie(m, true)}
                          />
                        </LazyVirtualCard>
                      ))}
                    </div>
                  </div>

                </motion.div>
              );
            })()
          ) : activeTab === "movie" ? (
            <motion.div
              key="tab-movie-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {activeMovie ? (
                <MovieDetailView
                  movie={activeMovie}
                  onBack={goBackOrHome}
                  onSimilarClick={(id) => navigateTo("/movie/" + id)}
                  onPlay={(id) => {
                    (window as any).moviePlayClickTime = performance.now();
                    console.log("%c[CHRONO LECTEUR] Clic sur le film : 0.000s (Début du flux via Détails)", "color: #a855f7; font-weight: bold; font-size: 13px;");
                    const prefetches = (window as any).playbackPrefetches || {};
                    prefetches[id] = fetch(`/api/playback/${encodeURIComponent(id)}`)
                      .then(res => {
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const ct = res.headers.get("content-type");
                        if (!ct || !ct.includes("application/json")) throw new Error("Not JSON");
                        return res.json();
                      })
                      .catch(err => {
                        console.warn("[PLAYBACK PREFETCH ERROR]", err);
                        return null;
                      });
                    (window as any).playbackPrefetches = prefetches;
                    navigateTo("/player/" + id);
                  }}
                />
              ) : movieLoadError ? (
                <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 mb-4"><AlertCircle className="w-8 h-8" /></div>
                  <p className="text-red-400 font-mono text-sm tracking-widest uppercase">{movieLoadError}</p>
                  <button onClick={() => navigateTo("/")} className="mt-6 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700">Go Back</button>
                </div>
              ) : (
                <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                  <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Loading movie data...</p>
                </div>
              )}
            </motion.div>
          ) :
          activeTab === "profil" ? (
            /* ========================================================== */
            /* VIEW C: MON PROFIL & WATCHLIST PERSISTENCE                   */
            /* ========================================================== */
            <motion.div
              key="tab-profil"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-[2000px] mx-auto px-4 sm:px-8 py-8 space-y-12"
            >
              
                            {/* Profile Header */}
              <div className="pb-4 border-b border-zinc-800">
                <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-white uppercase tracking-widest">
                  My Profile
                </h2>
              </div>

              
              {/* Profile Card Deck */}
              <div className="space-y-8 text-left">
                
                {/* Film Library & Watchlists */}
                <div className="space-y-12">
                  
                  {/* Watch History displaying viewed films */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                      <History className="w-4 h-4 text-zinc-400" />
                      Recently Viewed ({history.length})
                    </h3>

                    {history.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 justify-items-center">
                        {history
                          .filter(id => typeof id === 'string')
                          .map(id => allMovies.find(m => m.id === id || m.id === String(id) + "-tv" || m.id === String(id).replace("-tv", "")))
                          .filter((m): m is Movie => !!m)
                          .map((movie, idx) => (
                            <LazyVirtualCard key={`${movie.id}-history-${idx}`} priority={idx < 8}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                              />
                            </LazyVirtualCard>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 font-mono italic">No recent watch history available.</p>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          ) : null}

        </AnimatePresence>
      </main>

      {/* ========================================================== */}
      {/* 3. FOOTER SIGNATORIES                                      */}
      {/* ========================================================== */}
      <footer className="bg-neutral-950 border-t border-zinc-900 py-12 px-4 sm:px-8 text-center text-xs text-zinc-500 font-mono space-y-4">
        <div className="flex justify-center items-center gap-2 gold-metallic-text font-cinzel font-extrabold tracking-widest text-sm uppercase">
          CLASSICO
        </div>
        <p className="max-w-md mx-auto leading-relaxed text-[11px] text-zinc-400/80">
          CLASSICO is a streaming site dedicated to cult movies and legendary cinema collections. All images, metadata, and playback simulators are purely artistic and fictional.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] pt-2">
          <p className="text-zinc-600 font-sans tracking-wide">
            © {new Date().getFullYear()} CLASSICO Streaming Inc. • All rights reserved.
          </p>
        </div>
      </footer>

      {/* ========================================================== */}
      {/* 4. DETAILS & VIDEO SIMULATION POPUP MODAL SCREEN           */}
      {/* ========================================================== */}
      <MovieModal
        movie={selectedMovie}
        onPlay={(id) => navigateTo("/player/" + id)}
        onSimilarClick={(id) => { setSelectedMovie(null); navigateTo("/movie/" + id); }}
        onClose={() => {
          setSelectedMovie(null);
          const savedProgress = localStorage.getItem("classico_progress");
          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress) || {};
              const newProgressData: Record<string, number> = {};
              Object.keys(parsed || {}).forEach(k => {
                 let pct = 0;
                 if (typeof parsed[k] === 'number') pct = parsed[k];
                 else if (parsed[k] && parsed[k].type === "tv" && parsed[k].show_progress) {
                   const s = parsed[k].last_season_watched || 1;
                   const e = parsed[k].last_episode_watched || 1;
                   const epProg = parsed[k].show_progress[`s${s}e${e}`];
                   if (epProg && epProg.progress) {
                       const duration = epProg.progress.duration || 0;
                       pct = duration > 0 ? (epProg.progress.watched / duration) : (epProg.progress.watched > 0 ? 0.5 : 0);
                   }
                 }
                 else if (parsed[k] && parsed[k].currentTime !== undefined) {
                   const duration = parsed[k].duration || 0;
                   pct = duration > 0 ? (parsed[k].currentTime / duration) : (parsed[k].currentTime > 0 ? 0.5 : 0);
                 } else if (parsed[k] && parsed[k].duration) {
                   pct = parsed[k].currentTime / parsed[k].duration;
                 }
                 
                 if (pct > (newProgressData[k] || 0) || !newProgressData[k]) newProgressData[k] = pct;
                 if (!k.endsWith("-tv")) {
                     if (pct > (newProgressData[k + "-tv"] || 0) || !newProgressData[k + "-tv"]) newProgressData[k + "-tv"] = pct;
                 }
                 if (k.endsWith("-tv")) {
                     if (pct > (newProgressData[k.replace("-tv", "")] || 0) || !newProgressData[k.replace("-tv", "")]) newProgressData[k.replace("-tv", "")] = pct;
                 }
              });
              setProgressData(newProgressData);
            } catch (e) {}
          }
        }}
      />

      

      </div>
  );
}
