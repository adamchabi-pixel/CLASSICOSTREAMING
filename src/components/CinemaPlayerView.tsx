import React, { useState, useEffect, useRef, useMemo } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "motion/react";

const safeStorage = {
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch(e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch(e) {}
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch(e) {}
  }
};
const safeSession = {
  getItem: (key: string) => {
    try {
      return window.sessionStorage.getItem(key);
    } catch(e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch(e) {}
  },
  removeItem: (key: string) => {
    try {
      window.sessionStorage.removeItem(key);
    } catch(e) {}
  }
};
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Languages, 
  Maximize2, Users, ArrowLeft, Loader2, Sparkles, AlertCircle, Captions, Lock, Menu, Cast, Settings, ChevronRight, ChevronLeft, X, ChevronDown, Film, Tv, Server
} from "lucide-react";
import EmbedPlayer from "./EmbedPlayer";
import { allMoviesData } from "../data/all_movies";
import { importedMoviesData } from "../data/imported_movies";
import { heroMoviesData } from "../data/hero_movies";

interface JfSubtitleCue {
  start: number;
  end: number;
  text: string;
}

const logChrono = (step: string) => {
  const clickTime = (window as any).moviePlayClickTime;
  const now = performance.now();
  const elapsed = clickTime ? ((now - clickTime) / 1000).toFixed(3) : "N/A (mount reference)";
};

const isTextSubtitle = (codec: string) => {
  const c = (codec || "").toLowerCase();
  return ["vtt", "srt", "subrip", "tx3g", "text", "ass", "ssa", "mov_text", "microdvd"].includes(c);
};

export function formatHlsUrl(url: string, id: string, deviceId?: string, apiKey?: string): string {
  if (!url) return url;
  
  if (url.includes("Static=true") || url.includes("static=true")) {
    try {
      const finalDeviceId = deviceId || "CinemaAppClient";
      const finalApiKey = apiKey || safeStorage.getItem("classico_jellyfin_apikey") || "";
      const urlParts = url.split("?");
      const params = new URLSearchParams(urlParts[1] || "");
      if (!params.has("api_key") && finalApiKey) {
        params.set("api_key", finalApiKey);
      }
      if (!params.has("DeviceId")) {
        params.set("DeviceId", finalDeviceId);
      }
      return urlParts[0] + "?" + params.toString();
    } catch (e) {
      return url;
    }
  }
  
  // 3. Vérifie la présence des tokens : Assure-toi que les variables deviceId et apiKey transmises à la fonction ne sont pas undefined.
  const finalDeviceId = deviceId || "CinemaAppClient";
  const finalApiKey = apiKey || safeStorage.getItem("classico_jellyfin_apikey") || "";

  let formatted = url;
  // 1. Remplacement de l'endpoint : Remplace définitivement /api/jellyfin/proxy/main.m3u8 par l'URL officielle : /api/jellyfin/proxy/videos/${id}/master.m3u8
  if (formatted.includes("/api/jellyfin/proxy/main.m3u8")) {
    formatted = formatted.replace("/api/jellyfin/proxy/main.m3u8", `/api/jellyfin/proxy/videos/${id}/master.m3u8`);
  } else if (formatted.includes("/main.m3u8")) {
    formatted = formatted.replace("/main.m3u8", `/videos/${id}/master.m3u8`);
  } else if (formatted.includes("/api/jellyfin/proxy/stream") && !formatted.includes("/videos/")) {
    formatted = formatted.replace("/api/jellyfin/proxy/stream", `/api/jellyfin/proxy/videos/${id}/master.m3u8`);
  }
  
  // S'assurer que le chemin d'accès pointe bien vers /videos/${id}/master.m3u8 s'il s'agit d'une URL de transcodage proxy
  if (formatted.includes("/api/jellyfin/proxy") && !formatted.includes("/videos/") && !formatted.includes("Static=true")) {
    try {
      const urlParts = formatted.split("?");
      const searchStr = urlParts[1] || "";
      formatted = `/api/jellyfin/proxy/videos/${id}/master.m3u8` + (searchStr ? "?" + searchStr : "");
    } catch (e) {
      formatted = `/api/jellyfin/proxy/videos/${id}/master.m3u8`;
    }
  }

  // 2. Nettoyage des doublons d'API Key : Supprime le paramètre dupliqué &api_key=... à la toute fin de la chaîne de requête.
  // Conserve uniquement le paramètre au format standard : &api_key=...
  try {
    const urlParts = formatted.split("?");
    const params = new URLSearchParams(urlParts[1] || "");
    const apiKeyVal = params.get("api_key") || params.get("ApiKey") || finalApiKey;
    
    params.delete("api_key");
    params.delete("ApiKey");
    
    if (apiKeyVal) {
      params.set("api_key", apiKeyVal);
    }
    
    // 1. Ajoute les paramètres manquants : Dans l'URL générée pour /master.m3u8, tu DOIS impérativement réinjecter les query params suivants :
    // - &DeviceId=${deviceId}
    // - &MediaSourceId=${movieId}
    // - &api_key=${apiKey}
    params.set("DeviceId", finalDeviceId);
    params.set("MediaSourceId", id);
    
    // 2. Ne pas imposer de débits ou limites de résolution arbitraires sur le client pour laisser le serveur Jellyfin diffuser le flux natif
    // Nous définissons uniquement le mode HLS dynamique par défaut s'il n'est pas déjà spécifié.
    if (!params.has("Static")) params.set("Static", "false");
    
    formatted = urlParts[0] + "?" + params.toString();
  } catch (err) {
  }

  return formatted;
}

interface CinemaPlayerViewProps {
  isTv?: boolean;
  season?: number;
  episode?: number;
  movieId: string;
  movieTitle: string;
  movieDuration?: string;
  moviePoster?: string;
  movieBackdrop?: string;
  movieData?: any;
  onClose: () => void;
  onSelectMovie?: (movieId: string) => void;
}


const TrackName = ({ track }: { track: any }) => {
  const code = (track.language || "").toLowerCase();
  const lbl = (track.label || "").toLowerCase();
  let flagCode: string | null = null;
  let name = track.language || track.label || "Inconnu";

  if (code.includes("fr") || lbl.includes("french") || lbl.includes("français") || lbl.includes("fre")) { flagCode = "fr"; name = "Français"; }
  else if (code.includes("en") || lbl.includes("english") || lbl.includes("eng")) { flagCode = "us"; name = "English"; }
  else if (code.includes("es") || lbl.includes("spanish") || lbl.includes("español") || lbl.includes("spa")) { flagCode = "es"; name = "Español"; }
  else if (code.includes("de") || lbl.includes("german") || lbl.includes("deutsch") || lbl.includes("ger")) { flagCode = "de"; name = "Deutsch"; }
  else if (code.includes("it") || lbl.includes("italian") || lbl.includes("italiano") || lbl.includes("ita")) { flagCode = "it"; name = "Italiano"; }
  else if (code.includes("ja") || lbl.includes("japanese") || lbl.includes("japonais") || lbl.includes("jpn")) { flagCode = "jp"; name = "日本語"; }
  else if (code.includes("zh") || lbl.includes("chinese") || lbl.includes("chinois") || lbl.includes("chi") || lbl.includes("zho")) { flagCode = "cn"; name = "中文"; }
  else if (code.includes("ko") || lbl.includes("korean") || lbl.includes("coréen") || lbl.includes("kor")) { flagCode = "kr"; name = "한국어"; }
  else if (code.includes("pt") || lbl.includes("portuguese") || lbl.includes("portugais") || lbl.includes("por")) { flagCode = "pt"; name = "Português"; }
  else if (code.includes("ru") || lbl.includes("russian") || lbl.includes("russe") || lbl.includes("rus")) { flagCode = "ru"; name = "Русский"; }
  else if (code.includes("ar") || lbl.includes("arabic") || lbl.includes("arabe") || lbl.includes("ara")) { flagCode = "sa"; name = "العربية"; }
  
  else if (code.includes("nl") || lbl.includes("dutch") || lbl.includes("néerlandais") || lbl.includes("dut") || lbl.includes("nld")) { flagCode = "nl"; name = "Nederlands"; }
  else if (code.includes("pl") || lbl.includes("polish") || lbl.includes("polonais") || lbl.includes("pol")) { flagCode = "pl"; name = "Polski"; }
  else if (code.includes("tr") || lbl.includes("turkish") || lbl.includes("turc") || lbl.includes("tur")) { flagCode = "tr"; name = "Türkçe"; }
  else if (code.includes("sv") || lbl.includes("swedish") || lbl.includes("suédois") || lbl.includes("swe")) { flagCode = "se"; name = "Svenska"; }
  else if (code.includes("da") || lbl.includes("danish") || lbl.includes("danois") || lbl.includes("dan")) { flagCode = "dk"; name = "Dansk"; }
  else if (code.includes("no") || lbl.includes("norwegian") || lbl.includes("norvégien") || lbl.includes("nor")) { flagCode = "no"; name = "Norsk"; }
  else if (code.includes("fi") || lbl.includes("finnish") || lbl.includes("finnois") || lbl.includes("fin")) { flagCode = "fi"; name = "Suomi"; }
  else if (code.includes("cs") || lbl.includes("czech") || lbl.includes("tchèque") || lbl.includes("cze") || lbl.includes("ces")) { flagCode = "cz"; name = "Čeština"; }
  else if (code.includes("hu") || lbl.includes("hungarian") || lbl.includes("hongrois") || lbl.includes("hun")) { flagCode = "hu"; name = "Magyar"; }
  else if (code.includes("ro") || lbl.includes("romanian") || lbl.includes("roumain") || lbl.includes("rum") || lbl.includes("ron")) { flagCode = "ro"; name = "Română"; }
  else if (code.includes("el") || lbl.includes("greek") || lbl.includes("grec") || lbl.includes("gre") || lbl.includes("ell")) { flagCode = "gr"; name = "Ελληνικά"; }
  else if (code.includes("hi") || lbl.includes("hindi") || lbl.includes("hin")) { flagCode = "in"; name = "हिन्दी"; }
  else if (code.includes("th") || lbl.includes("thai") || lbl.includes("thaï") || lbl.includes("tha")) { flagCode = "th"; name = "ไทย"; }
  else if (code.includes("id") || lbl.includes("indonesian") || lbl.includes("indonésien") || lbl.includes("ind")) { flagCode = "id"; name = "Bahasa Indonesia"; }
  else if (code.includes("vi") || lbl.includes("vietnamese") || lbl.includes("vietnamien") || lbl.includes("vie")) { flagCode = "vn"; name = "Tiếng Việt"; }
  else if (code.includes("he") || lbl.includes("hebrew") || lbl.includes("hébreu") || lbl.includes("heb")) { flagCode = "il"; name = "עברית"; }
  else if (code.includes("und") || lbl.includes("und") || code === "") { 
     flagCode = null; 
     name = (track.label && track.label.length > 3 && !track.label.toLowerCase().includes("und")) ? track.label : "Inconnu"; 
  }
  else if (track.label) {
     name = track.label;
  }
  
  return (
    <span className="flex items-center gap-1.5 truncate">
      {flagCode && flagCode.trim() ? (
        <img src={`https://flagcdn.com/w20/${flagCode.trim()}.png`} alt="" className="w-4 h-[11px] object-cover rounded-[1px] opacity-90" />
      ) : (
        <span className="text-[11px] leading-none opacity-80">🏳️</span>
      )}
      <span className="truncate">{name}</span>
    </span>
  );
};

const normalizeEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl) return rawUrl;
  
  // Transform full Frembed movie page (e.g. https://frembed.surf/movies/black-panther/284054 or /movies/284054)
  // into the direct clean embed player: https://frembed.surf/embed/movie/284054
  const frembedMovieMatch = rawUrl.match(/frembed\.[a-z]+\/movies\/(?:[^\/]+\/)?([0-9]+)/i);
  if (frembedMovieMatch) {
    return `https://frembed.surf/embed/movie/${frembedMovieMatch[1]}`;
  }

  // Transform full Frembed TV series page into direct embed
  const frembedTvMatch = rawUrl.match(/frembed\.[a-z]+\/series\/(?:[^\/]+\/)?([0-9]+)/i);
  if (frembedTvMatch) {
    return `https://frembed.surf/embed/serie/${frembedTvMatch[1]}`;
  }

  // Ensure cinemaos routes directly to watch player
  if (rawUrl.includes("cinemaos.live/embed/movie/")) {
    return rawUrl.replace("cinemaos.live/embed/movie/", "cinemaos.live/watch/movie/");
  }
  if (rawUrl.includes("cinemaos.live/movie/")) {
    return rawUrl.replace("cinemaos.live/movie/", "cinemaos.live/watch/movie/");
  }
  if (rawUrl.includes("cinemaos.live/embed/tv/")) {
    return rawUrl.replace("cinemaos.live/embed/tv/", "cinemaos.live/watch/tv/").replace(/\/(\d+)\/(\d+)$/, "?season=$1&episode=$2");
  }
  if (rawUrl.includes("cinemaos.live/tv/")) {
    const match = rawUrl.match(/cinemaos\.live\/tv\/(\d+)-(\d+)-(\d+)/);
    if (match) {
      return `https://cinemaos.live/watch/tv/${match[1]}?season=${match[2]}&episode=${match[3]}`;
    }
  }

  // Support old or alternative frembed.pro/api/film.php?id=...
  if (rawUrl.includes("frembed.pro/api/film.php") || rawUrl.includes("frembed.surf/api/film.php")) {
    try {
      const parsed = new URL(rawUrl);
      const id = parsed.searchParams.get("id");
      if (id) return `https://frembed.surf/embed/movie/${id}`;
    } catch (_) {}
  }

  // Support frembed serie.php
  if (rawUrl.includes("frembed.pro/api/serie.php") || rawUrl.includes("frembed.surf/api/serie.php")) {
    try {
      const parsed = new URL(rawUrl);
      const id = parsed.searchParams.get("id");
      const sa = parsed.searchParams.get("sa") || "1";
      const epi = parsed.searchParams.get("epi") || "1";
      if (id) return `https://frembed.surf/embed/serie/${id}?id=${id}&sa=${sa}&epi=${epi}`;
    } catch (_) {}
  }

  return rawUrl;
};

const generateServers = (lang: string, isTv: boolean, tmdbId: any, season?: any, episode?: any, imdbId?: any, timeParam?: any) => {
  const cleanId = String(tmdbId || "").replace(/(-tv)+$/g, "").replace(/-S\d+E\d+$/, "");
  const s = Number(season) || 1;
  const e = Number(episode) || 1;
  const tParam = timeParam || "";

  if (lang === "fr") {
    // Only FrEmbed for French
    if (isTv) {
      return [ 
        { name: "Server 1", url: `https://frembed.surf/embed/serie/${cleanId}?id=${cleanId}&sa=${s}&epi=${e}`, stars: 3 }
      ];
    } else {
      return [ 
        { name: "Server 1", url: `https://frembed.surf/embed/movie/${cleanId}`, stars: 3 }
      ];
    }
  } else {
    // English servers:
    // 1: CineSrc (events & progress tracking)
    // 2: Peachify (progress tracking)
    // 3: VidSrc (no 404)
    // 4: CinemaOS (no 404 direct routes)
    if (isTv) {
      return [
        { name: "Server 1", url: `https://cinesrc.st/embed/tv/${cleanId}?s=${s}&e=${e}&color=%23f59e0b&continueprompt=false&autonext=true&back=close${tParam}`, stars: 3 },
        { name: "Server 2", url: `https://peachify.pro/embed/tv/${cleanId}/${s}/${e}?accent=FF9900&servers=hide${tParam}`, stars: 3 },
        { name: "Server 3", url: `https://vidsrc.me/embed/tv/${cleanId}/${s}/${e}`, stars: 3 },
        { name: "Server 4", url: `https://cinemaos.live/watch/tv/${cleanId}?season=${s}&episode=${e}`, stars: 3 }
      ];
    } else {
      return [
        { name: "Server 1", url: `https://cinesrc.st/embed/movie/${cleanId}?color=%23f59e0b&continueprompt=false&back=close${tParam}`, stars: 3 },
        { name: "Server 2", url: `https://peachify.pro/embed/movie/${cleanId}?accent=FF9900&servers=hide${tParam}`, stars: 3 },
        { name: "Server 3", url: `https://vidsrc.me/embed/movie/${cleanId}`, stars: 3 },
        { name: "Server 4", url: `https://cinemaos.live/watch/movie/${cleanId}`, stars: 3 }
      ];
    }
  }
};

export default function CinemaPlayerView({
  isTv,
  season,
  episode,
  movieId,
  movieTitle,
  movieDuration,
  moviePoster,
  movieBackdrop,
  movieData: passedMovieData,
  onClose,
  onSelectMovie
}: CinemaPlayerViewProps) {
  const deviceId = "CinemaAppClient";
  const apiKey = safeStorage.getItem("classico_jellyfin_apikey") || "";

  const [fetchedDetails, setFetchedDetails] = useState<any>(null);
  const [showAllCast, setShowAllCast] = useState(false);
  const [detailsTab, setDetailsTab] = useState<"episodes" | "synopsis" | "similar" | "info" | "all">("synopsis");

  const isSeries = Boolean(
    isTv ||
    String(movieId || "").includes("-tv") ||
    (String(movieId || "").includes("-S") && String(movieId || "").includes("E")) ||
    (passedMovieData as any)?.isTv ||
    (passedMovieData as any)?.genre?.includes("TV Series") ||
    (fetchedDetails as any)?.isTv ||
    (fetchedDetails?.seasons && fetchedDetails.seasons.length > 0) ||
    (passedMovieData?.seasons && passedMovieData.seasons.length > 0) ||
    season !== undefined
  );

  const [currentSeason, setCurrentSeason] = useState<number>(() => {
    if (season) return season;
    try {
      const tvState = JSON.parse(safeStorage.getItem("classico_tv_state") || "{}");
      if (tvState[movieId]?.season) return tvState[movieId].season;
    } catch(e) {}
    return 1;
  });

  const [currentEpisode, setCurrentEpisode] = useState<number>(() => {
    if (episode) return episode;
    try {
      const tvState = JSON.parse(safeStorage.getItem("classico_tv_state") || "{}");
      if (tvState[movieId]?.episode) return tvState[movieId].episode;
    } catch(e) {}
    return 1;
  });

  const seasonsList = useMemo(() => {
    const s = fetchedDetails?.seasons || passedMovieData?.seasons;
    if (Array.isArray(s) && s.length > 0) {
      return s.filter((item: any) => item.season_number > 0);
    }
    return [];
  }, [fetchedDetails?.seasons, passedMovieData?.seasons]);

  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isMobileServerModalOpen, setIsMobileServerModalOpen] = useState(false);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);

  const displaySeasons = useMemo(() => {
    if (seasonsList.length > 0) return seasonsList;
    const num = (fetchedDetails as any)?.number_of_seasons || (passedMovieData as any)?.number_of_seasons || Math.max(currentSeason, 1);
    const count = Math.max(num, 3);
    return Array.from({ length: count }, (_, i) => ({
      season_number: i + 1,
      name: `Saison ${i + 1}`,
      episode_count: undefined
    }));
  }, [seasonsList, fetchedDetails, passedMovieData, currentSeason]);

  useEffect(() => {
    if (movieId) {
      let cleanId = String(movieId).replace(/-S\d+E\d+$/, "");
      if ((isTv || isSeries || cleanId.endsWith("-tv")) && !cleanId.endsWith("-tv")) {
        cleanId = `${cleanId}-tv`;
      }
      fetch(`/api/movie/${cleanId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.movie) {
            setFetchedDetails(data.movie);
          }
        })
        .catch(err => console.error("Error fetching cinema movie details:", err));
    }
  }, [movieId, isTv, isSeries]);

  useEffect(() => {
    setDetailsTab("synopsis");
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [movieId, isSeries]);

  useEffect(() => {
    if (!isSeries) return;
    const tmdbCandidate = passedMovieData?.tmdbId || fetchedDetails?.tmdbId || String(movieId || "").replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
    const cleanId = String(tmdbCandidate).replace("-tv", "");
    
    setIsLoadingEpisodes(true);
    fetch(`/api/tv/${cleanId}/season/${currentSeason}`)
      .then(res => res.json())
      .then(data => {
        setIsLoadingEpisodes(false);
        if (data.success && Array.isArray(data.episodes) && data.episodes.length > 0) {
          setEpisodesList(data.episodes);
        } else {
          const seasonObj = seasonsList.find((s: any) => s.season_number === currentSeason);
          const count = seasonObj?.episode_count || 10;
          setEpisodesList(Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            episode_number: i + 1,
            name: `Épisode ${i + 1}`,
            overview: "",
            stillUrl: ""
          })));
        }
      })
      .catch(() => {
        setIsLoadingEpisodes(false);
        setEpisodesList(Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          episode_number: i + 1,
          name: `Épisode ${i + 1}`,
          overview: "",
          stillUrl: ""
        })));
      });
  }, [isSeries, movieId, currentSeason, fetchedDetails?.tmdbId, seasonsList]);

  const [playbackInfo, setPlaybackInfo] = useState<{
    id: string;
    streamUrl: string;
    duration: number;
    isIframeEmbed?: boolean;
    iframeSrc?: string;

    container: string;
    title: string;
    isDirect: boolean;
    videoCodec?: string;
    audioCodec?: string;
    chosenPath?: string;
    audios?: any[];
    subtitles?: {
      index: number;
      language: string;
      label: string;
      isDefault: boolean;
      isForced: boolean;
      codec: string;
      deliveryMethod: string;
      url: string;
    }[];
  } | null>(null);

  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [subtitlesOn, setSubtitlesOn] = useState<boolean>(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsView, setSettingsView] = useState<"main" | "audio" | "subtitles">("main");
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const [cinemaCues, setCinemaCues] = useState<JfSubtitleCue[]>([]);
  const [activeCinemaCue, setActiveCinemaCue] = useState<string | null>(null);
  const cinemaCuesRef = useRef<JfSubtitleCue[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isStreamLoading, setIsStreamLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(() => Date.now());
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const matchedMovie = useMemo(() => {
    if (passedMovieData) return passedMovieData;
    if (fetchedDetails) return fetchedDetails;
    const cleanId = String(movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
    const combined = [...importedMoviesData, ...allMoviesData];
    return combined.find((m: any) => {
      const mIsTv = Boolean(m.isTv || String(m.id || "").endsWith("-tv"));
      if (isSeries !== mIsTv) return false;
      return m.id === movieId || m.id === cleanId || String(m.tmdbId) === cleanId;
    }) || combined.find((m: any) => m.id === movieId || String(m.tmdbId) === cleanId);
  }, [movieId, passedMovieData, fetchedDetails, isSeries]);

  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [forceJellyfin, setForceJellyfin] = useState(false);
    const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [serverSelected, setServerSelected] = useState(true);
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [availableServers, setAvailableServers] = useState<{name: string, url: string, stars?: number}[]>(() => {
    const cleanId = String(movieId || "").replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
    if (!cleanId) return [];
    const isTvInitial = Boolean(isTv || String(movieId).includes("-tv") || season !== undefined);
    return generateServers("en", isTvInitial, cleanId, season || 1, episode || 1, cleanId, "");
  });
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (isIframeLoading) {
      const timer = setTimeout(() => {
        setIsIframeLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isIframeLoading, iframeKey]);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const isInitialAutoplayRef = useRef<boolean>(true);
  const rebufferStartTimeRef = useRef<number>(0);
  const fragLoadStartTimeRef = useRef<number>(0);
  const ttfbTimeRef = useRef<number>(0);
  
  const [progress, setProgress] = useState(0);
  const [seekOffset, setSeekOffset] = useState(0);
  const [duration, setDuration] = useState<number>(() => {
    if (movieDuration) {
      const minutes = parseInt(movieDuration);
      if (!isNaN(minutes) && minutes > 0) {
        return minutes * 60;
      }
    }
    return 0;
  });
  const [volume, setVolume] = useState(85);
  const [muted, setMuted] = useState(false); // Commencer non-muet par défaut
  const [fullscreen, setFullscreen] = useState(false);
  const [objectFit, setObjectFit] = useState<"contain" | "cover">("contain");

  // Buffer and Safety Timeout States
  const [isBuffering, setIsBuffering] = useState(false);
  const [isTimeoutReached, setIsTimeoutReached] = useState(false);
  const [forceTranscode, setForceTranscode] = useState(false);
  const [isLowQuality, setIsLowQuality] = useState(false);
  const [estimatedBitrate, setEstimatedBitrate] = useState<number | null>(null);
  const [initialBufferingTime, setInitialBufferingTime] = useState<number | null>(null);
  const [isAutoDowngraded, setIsAutoDowngraded] = useState(false);
  const streamLoadStartRef = useRef<number | null>(null);
  const [playbackAttempts, setPlaybackAttempts] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [playTimeoutMessage, setPlayTimeoutMessage] = useState<string | null>(null);

  // Mobile player initialization && on-screen logs states
  const [isInitialized, setIsInitialized] = useState(true);
  const [playerLogs, setPlayerLogs] = useState<string[]>([]);
  const [adClicks, setAdClicks] = useState<number>(0);

  useEffect(() => {
    // Re-enforce adwall on movie open and clear any stored click tokens
    setAdClicks(0);
    try {
      localStorage.removeItem("classico_ad_clicks_" + movieId);
      sessionStorage.removeItem("classico_ad_clicks_" + movieId);
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("classico_ad_clicks")) {
          sessionStorage.removeItem(key);
        }
      }
    } catch(e) {}
  }, [movieId]);

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { window.open("https://omg10.com/4/11192957", "_blank"); } catch(err) {}
    setAdClicks(prev => prev + 1);
  };

  const handleSelectServer = (idx: number, customServers?: {name: string, url: string, stars?: number}[]) => {
    setActiveServerIndex(idx);
    const serversList = customServers || availableServers;
    const server = serversList[idx];
    if (!server) return;
    const isProxyStream = server.url.startsWith("/api/stream-proxy") || server.url.startsWith("/api/extract-stream-view");
    let targetUrl = isProxyStream ? server.url : server.url.replace(/[&?]t=\d+/, "");
    if (!isProxyStream && savedRestoreTimeRef.current > 0) {
      const sep = targetUrl.includes("?") ? "&" : "?";
      targetUrl += `${sep}t=${Math.floor(savedRestoreTimeRef.current)}`;
    }
    
    if (isProxyStream) {
      setServerSelected(true);
      setIsLoading(true);
      const searchParams = new URLSearchParams(server.url.split("?")[1]);
      fetch(`/api/extract-stream?${searchParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          setIsLoading(false);
          if (data.success && data.extractedUrl) {
            setPlaybackInfo({
              ...playbackInfo!,
              isIframeEmbed: false,
              iframeSrc: "",
              streamUrl: data.extractedUrl
            });
          } else {
            alert(data.error || "Impossible d'extraire le flux brut pour ce film.");
          }
        })
        .catch(() => {
          setIsLoading(false);
          alert("Erreur lors de la tentative d'extraction du flux.");
        });
    } else {
      const cleanUrl = normalizeEmbedUrl(targetUrl);
      if (playbackInfo) {
        setPlaybackInfo({
          ...playbackInfo,
          isIframeEmbed: true,
          iframeSrc: cleanUrl,
          streamUrl: cleanUrl
        });
      }
      safeStorage.setItem("classico_global_server_index", String(idx));
      setServerSelected(true);
      setIsIframeLoading(true);
      setIframeKey(prev => prev + 1);
    }
  };

  const handleEpisodeSelect = (seasonNum: number, episodeNum: number) => {
    setCurrentSeason(seasonNum);
    setCurrentEpisode(episodeNum);

    try {
      const tvState = JSON.parse(safeStorage.getItem("classico_tv_state") || "{}");
      tvState[movieId] = { season: seasonNum, episode: episodeNum };
      safeStorage.setItem("classico_tv_state", JSON.stringify(tvState));
    } catch(e) {}

    try {
      const baseId = String(movieId || "").replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
      window.history.replaceState(null, "", `/player/${baseId}-tv-S${seasonNum}E${episodeNum}`);
    } catch(e) {}

    const cleanTmdb = String(passedMovieData?.tmdbId || fetchedDetails?.tmdbId || movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
    const timeParam = "";
    const newServers = generateServers(language, true, cleanTmdb, seasonNum, episodeNum, cleanTmdb, timeParam);
    setAvailableServers(newServers);

    const safeIdx = activeServerIndex >= newServers.length ? 0 : activeServerIndex;
    setActiveServerIndex(safeIdx);
    const targetUrl = normalizeEmbedUrl(newServers[safeIdx]?.url || newServers[0]?.url);

    setPlaybackInfo(prev => ({
      ...(prev || {
        id: movieId,
        streamUrl: targetUrl,
        duration: 0,
        container: "iframe",
        title: currentTitle,
        isDirect: false,
      }),
      isIframeEmbed: true,
      iframeSrc: targetUrl,
      streamUrl: targetUrl,
      allServers: newServers
    }));
    setIsIframeLoading(true);
    setIframeKey(k => k + 1);
  };

  const currentSeasonIdx = displaySeasons.findIndex((s: any) => s.season_number === currentSeason);
  const canPrevSeason = currentSeasonIdx > 0 || currentSeason > 1;
  const canNextSeason = currentSeasonIdx >= 0 && currentSeasonIdx < displaySeasons.length - 1;

  const handlePrevSeason = () => {
    if (currentSeasonIdx > 0) {
      handleSeasonSelect(displaySeasons[currentSeasonIdx - 1].season_number);
    } else if (currentSeason > 1) {
      handleSeasonSelect(currentSeason - 1);
    }
  };

  const handleNextSeason = () => {
    if (currentSeasonIdx >= 0 && currentSeasonIdx < displaySeasons.length - 1) {
      handleSeasonSelect(displaySeasons[currentSeasonIdx + 1].season_number);
    } else {
      handleSeasonSelect(currentSeason + 1);
    }
  };

  const handleSeasonSelect = (seasonNum: number) => {
    if (seasonNum === currentSeason) return;
    setCurrentSeason(seasonNum);
    handleEpisodeSelect(seasonNum, 1);
  };


  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setPlayerLogs(prev => [...prev, `[${timestamp}] ${msg}`].slice(-8));
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastLoadedSourceRef = useRef<string | null>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [measuredPlayerHeight, setMeasuredPlayerHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height || entry.target.clientHeight;
        if (height > 50) {
          setMeasuredPlayerHeight(Math.round(height));
        }
      }
    });

    ro.observe(el);
    if (el.clientHeight > 50) {
      setMeasuredPlayerHeight(Math.round(el.clientHeight));
    }

    return () => ro.disconnect();
  }, []);

  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const firstFrameLoggedRef = useRef<boolean>(false);
  
  const isIOS = useMemo(() => {
    return /iPad|iPhone|iPod/i.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
           /CriOS/i.test(navigator.userAgent) || 
           /FxiOS/i.test(navigator.userAgent);
  }, []);
  const lastFetchedMovieIdRef = useRef<string | null>(null);
  const savedRestoreTimeRef = useRef<number>(0);
  const lastFetchedParamsRef = useRef<{
    movieId: string | null;
    forceTranscode: boolean;
    playbackAttempts: number;
    isLowQuality: boolean;
    activeServerIndex: number;
    language?: string;
  }>({ movieId: null, forceTranscode: false, playbackAttempts: 0, isLowQuality: false, activeServerIndex: 0, language: "en" });

  const isResettingRef = useRef<boolean>(false);

  const eventsTrackerRef = useRef<{
    metadataStart: { fired: boolean; time: number | null };
    metadataEnd: { fired: boolean; time: number | null };
    streamUrlStart: { fired: boolean; time: number | null };
    serverResponse: { fired: boolean; time: number | null };
    ttfb: { fired: boolean; time: number | null };
    loadedmetadata: { fired: boolean; time: number | null };
    loadeddata: { fired: boolean; time: number | null };
    canplay: { fired: boolean; time: number | null };
    play: { fired: boolean; time: number | null };
    playing: { fired: boolean; time: number | null };
    firstFrame: { fired: boolean; time: number | null };
  }>({
    metadataStart: { fired: false, time: null },
    metadataEnd: { fired: false, time: null },
    streamUrlStart: { fired: false, time: null },
    serverResponse: { fired: false, time: null },
    ttfb: { fired: false, time: null },
    loadedmetadata: { fired: false, time: null },
    loadeddata: { fired: false, time: null },
    canplay: { fired: false, time: null },
    play: { fired: false, time: null },
    playing: { fired: false, time: null },
    firstFrame: { fired: false, time: null },
  });

  const trackEventFired = (key: keyof typeof eventsTrackerRef.current, stepName: string) => {
    if (!eventsTrackerRef.current[key].fired) {
      const now = performance.now();
      eventsTrackerRef.current[key] = { fired: true, time: now };
      logChrono(stepName);

      if (key === "playing") {
        const clickTime = (window as any).moviePlayClickTime || now;
        const formatTimeDiff = (t: number | null) => t !== null ? `${((t - clickTime) / 1000).toFixed(3)}s` : "N/A";
        const formatDuration = (start: number | null, end: number | null) => {
          if (start !== null && end !== null) {
            return `${((end - start) / 1000).toFixed(3)}s`;
          }
          return "N/A";
        };

      }
    }
  };

  const logMissingEvents = (reason: string) => {
    const clickTime = (window as any).moviePlayClickTime;
    const now = performance.now();
    const elapsed = clickTime ? ((now - clickTime) / 1000).toFixed(3) : "N/A";
    
    const events = [
      { key: "metadataStart" as const, name: "Début de récupération des métadonnées" },
      { key: "serverResponse" as const, name: "Réponse du serveur" },
      { key: "metadataEnd" as const, name: "Fin de récupération des métadonnées" },
      { key: "streamUrlStart" as const, name: "Début de récupération de l'URL de streaming" },
      { key: "ttfb" as const, name: "Réception du premier octet (TTFB)" },
      { key: "loadedmetadata" as const, name: "loadedmetadata" },
      { key: "loadeddata" as const, name: "loadeddata" },
      { key: "canplay" as const, name: "canplay" },
      { key: "play" as const, name: "play" },
      { key: "playing" as const, name: "playing" },
      { key: "firstFrame" as const, name: "première frame affichée" },
    ];

    events.forEach(evt => {
    });
  };

  // --- GLOBAL POPUNDER & AD FIX ---
  // Objectif: Désactiver les popunders uniquement pendant la lecture vidéo
  useEffect(() => {
    // window.open override removed because iframe sandbox handles it

    const rootElement = document.getElementById('root');
    const stopPopunderBubble = (e: MouseEvent) => {
      e.stopPropagation();
    };
    if (rootElement) {
      rootElement.addEventListener('click', stopPopunderBubble);
    }

    const blockPopunderLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        const link = target.closest('a');
        if (link && link.target === '_blank' && !link.classList.contains('allow-popunder')) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };
    document.addEventListener('click', blockPopunderLinks, true);

    return () => {
      if (rootElement) {
        rootElement.removeEventListener('click', stopPopunderBubble);
      }
      document.removeEventListener('click', blockPopunderLinks, true);
    };
  }, []);

  // Set moviePlayClickTime on mount if accessed directly / not set

  // 4. REPRISE DE LA LECTURE: Inject saved progress on mount
  useEffect(() => {
    if (movieId) {
      try {
        const saved = (JSON.parse(safeStorage.getItem("classico_progress") || "{}") || {});
        let restoredTime = 0;
        if (isTv && season && episode) {
          const baseId = String(movieId || "").replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
          if (saved[baseId] && saved[baseId].type === "tv" && saved[baseId].show_progress) {
             const epProg = saved[baseId].show_progress[`s${season}e${episode}`];
             if (epProg && epProg.progress && epProg.progress.watched > 0) {
                 restoredTime = epProg.progress.watched;
             }
          }
        } else if (saved[movieId] && saved[movieId].currentTime > 0) {
           restoredTime = saved[movieId].currentTime;
        }
        if (restoredTime > 0) {
           savedRestoreTimeRef.current = restoredTime;
        }
      } catch(e) {}
    }
  }, [movieId, isTv, season, episode]);
  useEffect(() => {
    if (!(window as any).moviePlayClickTime) {
      (window as any).moviePlayClickTime = performance.now();
    }
    return () => {
      logMissingEvents("Rechargement du composant ou fermeture du lecteur");
      try {
        window.dispatchEvent(new CustomEvent("classico_progress_updated"));
      } catch(e) {}
    };
  }, []);

  // Reset first frame logged when movie changes
  useEffect(() => {
    firstFrameLoggedRef.current = false;
  }, [movieId]);

  // Reset events tracker on source replacement or new attempts
  useEffect(() => {
    if (eventsTrackerRef.current.loadedmetadata.fired || eventsTrackerRef.current.play.fired) {
      logMissingEvents("Source vidéo remplacée ou nouvelle tentative de lecture");
    }
    eventsTrackerRef.current = {
      metadataStart: { fired: false, time: null },
      metadataEnd: { fired: false, time: null },
      streamUrlStart: { fired: false, time: null },
      serverResponse: { fired: false, time: null },
      ttfb: { fired: false, time: null },
      loadedmetadata: { fired: false, time: null },
      loadeddata: { fired: false, time: null },
      canplay: { fired: false, time: null },
      play: { fired: false, time: null },
      playing: { fired: false, time: null },
      firstFrame: { fired: false, time: null },
    };
  }, [movieId, playbackAttempts]);

  // Convertit les secondes ou minutes en format hh:mm (ex: "2h 07m" ou "1h 45m" ou "45m")
  const getFormattedDuration = () => {
    let totalSecs = 0;

    // 1. Source de vérité Jellyfin metadata (après chargement de l'API de lecture)
    if (playbackInfo && playbackInfo?.duration || 0 > 0) {
      totalSecs = playbackInfo?.duration || 0;
    }
    // 2. Initialisation immédiate via la prop movieDuration ("169 min")
    else if (movieDuration) {
      const minsDecimal = parseInt(movieDuration);
      if (!isNaN(minsDecimal) && minsDecimal > 0) {
        totalSecs = minsDecimal * 60;
      }
    }
    // 3. Fallback en cas d'absence complète : la durée vidéo réelle du lecteur du navigateur
    else if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
      totalSecs = videoRef.current.duration;
    }

    if (totalSecs > 0) {
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      if (h > 0) {
        return `${h}h ${m.toString().padStart(2, "0")}m`;
      }
      return `${m}m`;
    }

    return "chargement...";
  };

  const handleClosePlayer = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    window.dispatchEvent(new CustomEvent("classico_progress_updated"));
    onClose();
  };

  // LOGIQUE DE VALIDATION ET SYNC DE LA DURÉE AUDIOVISUELLE (NAVIGATEUR && JELLYFIN METADATA)
  const validateAndSetDuration = (liveDur: number, jellyfinDurRaw: number) => {
    // Conversion RunTimeTicks si Jellyfin envoie des Ticks (ex: plus de 100 millions pour quelques secondes)
    let jellyfinDuration = jellyfinDurRaw || (playbackInfo?.duration || 0);
    let conversionType = "secondes";
    if (jellyfinDuration > 100000000) {
      jellyfinDuration = jellyfinDuration / 10000000;
      conversionType = "Ticks convertis en secondes (ticks / 10 000 000)";
    }

    const currentVideoEl = videoRef.current;
    const videoDuration = currentVideoEl ? currentVideoEl.duration : liveDur;
    const sourceUrl = currentVideoEl ? currentVideoEl.src : (playbackInfo?.streamUrl || "");

    // -----------------------------------------------------
    // TEMPORARY DIAGNOSTIC CONSOLE LOGS AS REQUESTED
    // -----------------------------------------------------
    // -----------------------------------------------------

    let finalSecs = 0;
    let source = "Aucune source";

    // Netflix / Disney+ rule: metadata is the source of truth
    if (jellyfinDuration > 0) {
      finalSecs = jellyfinDuration;
      source = "Jellyfin Metadata (Règle Netflix : Source de vérité prioritaire)";
    } 
    // Fallback if Jellyfin metadata is absent
    else if (videoDuration && !isNaN(videoDuration) && isFinite(videoDuration) && videoDuration > 0) {
      finalSecs = videoDuration;
      source = "Vidéo réelle (Fallback car Jellyfin duration absente)";
    }


    // Synchronize slider state scale
    if (finalSecs > 0) {
      setDuration(finalSecs);
    }
  };



  // Keep ref synchronized with cinemaCues to bypass closures in high frequency listeners
  useEffect(() => {
    cinemaCuesRef.current = cinemaCues;
  }, [cinemaCues]);

  // Parser de WebVTT robuste identique à VideoPlayer.tsx
  const parseVTT = (text: string): JfSubtitleCue[] => {
    const list: JfSubtitleCue[] = [];
    const cleanLines = text.split(/\r?\n/);
    
    const parseTime = (timeStr: string): number => {
      const cleanTimeStr = timeStr.trim().split(/\s+/)[0].replace(/,/g, ".");
      const parts = cleanTimeStr.split(":");
      let h = 0, m = 0, s = 0;
      if (parts.length === 3) {
        h = parseFloat(parts[0]) || 0;
        m = parseFloat(parts[1]) || 0;
        s = parseFloat(parts[2]) || 0;
      } else if (parts.length === 2) {
        m = parseFloat(parts[0]) || 0;
        s = parseFloat(parts[1]) || 0;
      } else {
        s = parseFloat(parts[0]) || 0;
      }
      return h * 3600 + m * 60 + s;
    };

    let i = 0;
    while (i < cleanLines.length) {
      const line = cleanLines[i].trim();
      if (line.includes("-->")) {
        const times = line.split("-->");
        if (times.length === 2) {
          const start = parseTime(times[0]);
          const end = parseTime(times[1]);
          
          let textLines: string[] = [];
          i++;
          
          while (i < cleanLines.length) {
            const nextLine = cleanLines[i].trim();
            if (nextLine === "") {
              break;
            }
            if (nextLine.includes("-->")) {
              i--;
              break;
            }
            if (/^\d+$/.test(nextLine) && i + 1 < cleanLines.length && cleanLines[i + 1].trim().includes("-->")) {
              break;
            }
            textLines.push(nextLine);
            i++;
          }
          
          const textBuffer = textLines.join("\n");
          const textCleaned = textBuffer.replace(/<[^>]+>/g, "").trim();
          if (textCleaned) {
            list.push({ start, end, text: textCleaned });
          }
        }
      } else {
        i++;
      }
    }
    return list;
  };

  // Charger les sous-titres sélectionnés via fetch
  useEffect(() => {
    if (!subtitlesOn || activeSubtitleIndex === null || !playbackInfo) {
      setCinemaCues([]);
      setActiveCinemaCue(null);
      return;
    }

    const activeTrack = playbackInfo.subtitles?.find(s => s.index === activeSubtitleIndex);
    if (!activeTrack || !isTextSubtitle(activeTrack.codec)) {
      setCinemaCues([]);
      setActiveCinemaCue(null);
      return;
    }

    let isSubscribed = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchSubtitles = async () => {
      try {
        const res = await fetch(activeTrack.url);
        if (res.ok) {
          const vttText = await res.text();
          if (isSubscribed) {
            const parsed = parseVTT(vttText);
            if (parsed.length > 0) {
            }
            setCinemaCues(parsed);
          }
        } else if (res.status === 404 || res.status === 401) {
          if (isSubscribed) {
            setCinemaCues([]);
            setActiveCinemaCue(null);
            setSubtitlesOn(false);
            setActiveSubtitleIndex(null);
          }
        } else {
          throw new Error(`Code HTTP ${res.status}`);
        }
      } catch (err) {
        if (isSubscribed && retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchSubtitles, 1500 * retryCount);
        } else if (isSubscribed) {
          setCinemaCues([]);
          setActiveCinemaCue(null);
          setSubtitlesOn(false);
          setActiveSubtitleIndex(null);
        }
      }
    };

    fetchSubtitles();

    return () => {
      isSubscribed = false;
    };
  }, [activeSubtitleIndex, subtitlesOn, playbackInfo]);

  useEffect(() => {
    if (!showServerMenu) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#cinema-server-btn") && !target.closest("#cinema-server-menu")) {
        setShowServerMenu(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [showServerMenu]);

  // Detector to click away closes subtitle menu nicely
  useEffect(() => {
    if (!showSubtitleMenu) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#cinema-subtitle-btn") && !target.closest("#cinema-subtitle-menu")) {
        setShowSubtitleMenu(false);
      }
      if (!target.closest("#cinema-settings-btn") && !target.closest("#cinema-settings-menu")) {
        setShowSettingsMenu(false);
        setTimeout(() => setSettingsView("main"), 200);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [showSubtitleMenu]);

  // Robust seek mechanism supporting native seeking for both Direct Play && HLS transcode (m3u8)
  const seekTo = (newTime: number) => {
    const video = videoRef.current;
    if (!video || !playbackInfo) return;

    // Boundary protection
    const targetTime = Math.max(0, Math.min(newTime, duration || 999999));


    // Native HTML5 seek remains identical for both Direct Play and HLS:
    // setting video.currentTime will trigger Hls.js segment-seeking behind the scenes!
    video.currentTime = targetTime;
    setSeekOffset(0);
    setProgress(targetTime);


    // Ensure we trigger play if we were in playing state or if video was paused by seek side effects
    if (playing) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
            setIsAutoplayBlocked(false);
          })
          .catch((err) => {
            setIsAutoplayBlocked(true);
            setPlaying(false);
          });
      } else {
        setPlaying(true);
      }
    }
  };

  // 1. FETCH PLAYBACK DETAILS FROM BACKEND API (Supports Ultra-Fast Prefetch cache)
  useEffect(() => {
    const lastOpts = lastFetchedParamsRef.current;
    if (
      playbackInfo &&       lastOpts.movieId === movieId &&       lastOpts.forceTranscode === forceTranscode &&       lastOpts.playbackAttempts === playbackAttempts &&       lastOpts.isLowQuality === isLowQuality && lastOpts.activeServerIndex === activeServerIndex && lastOpts.language === language
    ) {
      return;
    }

    let active = true;
    console.log("fetchPlayback triggered", {movieId, forceTranscode, playbackAttempts, isLowQuality, forceJellyfin});
    const fetchPlayback = async () => {
      if (!movieId || movieId === "undefined") {
        setIsLoading(false);
        setIsStreamLoading(false);
        setVideoError("No valid movie ID was provided to the cinema player.");
        return;
      }
      setIsLoading(true);
      setIsIframeLoading(true);
      setIsStreamLoading(true);
      setIsActuallyPlaying(false);
      trackEventFired("metadataStart", "Début de récupération des métadonnées");
      setVideoError(null);
      setIsTimeoutReached(false);
      try {
        const prefetches = (window as any).playbackPrefetches || {};
        
        // Nettoyage complet du click prefetch pour forcer un démarrage sur un état totalement neuf
        if (prefetches[movieId]) {
          delete prefetches[movieId];
        }
        
        let data: any;

        
        // Fallback if prefetch was null or failed (now always runs since we cleared it)
        if (!data) {
          const isNumeric = /^\d+$/.test(String(movieId || ""));
          
          // Look up the movie in passedMovieData, fetchedDetails, heroMoviesData, or combined data to get its tmdbId or imdbId
          const cleanMovieId = String(movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
          const heroMatch = heroMoviesData?.heroes?.find((m: any) => m.id === movieId || String(m.tmdbId) === cleanMovieId);
          const combined = [...importedMoviesData, ...allMoviesData];
          const matchedMovie = passedMovieData || fetchedDetails || heroMatch || combined.find((m: any) => {
            const mIsTv = Boolean(m.isTv || String(m.id || "").endsWith("-tv"));
            if (isSeries !== mIsTv) return false;
            return m.id === movieId || m.id === cleanMovieId || String(m.tmdbId) === cleanMovieId;
          }) || combined.find((m: any) => m.id === movieId || String(m.tmdbId) === cleanMovieId);
          let actualTmdbId = passedMovieData?.tmdbId || fetchedDetails?.tmdbId || heroMatch?.tmdbId || matchedMovie?.tmdbId || (matchedMovie?.providerIds?.Tmdb) || cleanMovieId;
          
          if (!forceJellyfin) {
            // ALWAYS use videasy now, even for jellyfin uuids, by using the looked up tmdbId
            console.log("Videasy ID resolution", {movieId, actualTmdbId, matchedMovie});
            let finalTmdbId = String(actualTmdbId);
            if (finalTmdbId.startsWith('tt') && matchedMovie?.tmdbId) {
                finalTmdbId = String(matchedMovie.tmdbId);
            }

            let cleanId = finalTmdbId;
            if (cleanId.endsWith('-tv')) cleanId = cleanId.replace('-tv', '');
            let imdbId = matchedMovie?.imdbId || (matchedMovie?.providerIds?.Imdb) || cleanId;
            const timeParam = savedRestoreTimeRef.current > 0 ? `&t=${Math.floor(savedRestoreTimeRef.current)}` : "";
            const tvState = isTv ? JSON.parse(safeStorage.getItem("classico_tv_state") || "{}")[movieId] || {} : {};
            const targetSeason = isSeries ? (currentSeason || season || tvState.season || 1) : (season || tvState.season || 1);
            const targetEpisode = isSeries ? (currentEpisode || episode || tvState.episode || 1) : (episode || tvState.episode || 1);
            const newServers = generateServers(language, isSeries, cleanId, targetSeason, targetEpisode, imdbId, timeParam);
            setAvailableServers(newServers);
            
            const safeActiveIndex = activeServerIndex >= newServers.length ? 0 : activeServerIndex;

            const iframeResult = {
              id: movieId,
              streamUrl: newServers[safeActiveIndex].url,
              duration: 0,
              container: "iframe",
              title: movieTitle || matchedMovie?.title || "Film (Embed)",
              isDirect: true,
              isIframeEmbed: true,
              iframeSrc: newServers[safeActiveIndex].url,
              subtitles: [],
              audios: []
            };
            setPlaybackInfo(iframeResult);
            setIsLoading(false);
            setIsStreamLoading(false);
            setIsIframeLoading(false);
            setIsMetadataLoaded(true);
            lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex, language };
            return;
          }
          
// Unreachable iframe fallback removed

          const needsTranscodeParam = forceTranscode || playbackAttempts > 0 || isLowQuality;
          
          const isNetlify = false; // Forced false to bypass Jellyfin
          
          if (isNetlify) {
            const serverUrl = safeStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud";
            const currentApiKey = safeStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb";
            
            // Bypass google proxy entirely
            const streamUrl = `${serverUrl}/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&SegmentLength=3&MinSegments=1&BreakOnNonKeyFrames=True&VideoBitrate=140000000&MaxVideoBitrate=140000000&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}`;
            
            data = {
              id: movieId,
              streamUrl: streamUrl,
              duration: 0,
              container: "m3u8",
              title: movieTitle || "Film",
              isDirect: false,
              videoCodec: "h264",
              audioCodec: "aac",
              chosenPath: "Direct Bypass",
              subtitles: [],
              audios: []
            };
            
            try {
              let itemData: any = null;
              // Try direct Items endpoint first (does not require a userId)
              const itemRes = await fetch(`${serverUrl}/Items/${movieId}?api_key=${currentApiKey}`);
              if (itemRes.ok) {
                itemData = await itemRes.json();
              } else {
                // Try fetching users first to resolve userId, then query the item
                const usersRes = await fetch(`${serverUrl}/Users?api_key=${currentApiKey}`);
                if (usersRes.ok) {
                  const users = await usersRes.json();
                  if (users && users.length > 0) {
                    const userId = users[0].Id;
                    const userItemRes = await fetch(`${serverUrl}/Users/${userId}/Items/${movieId}?api_key=${currentApiKey}`);
                    if (userItemRes.ok) {
                      itemData = await userItemRes.json();
                    }
                  }
                }
              }

              if (itemData) {
                if (itemData.RunTimeTicks) {
                  data.duration = Math.round(itemData?.RunTimeTicks / 10000000);
                }
                
                if (!forceJellyfin && itemData.ProviderIds) {
                  if (itemData.ProviderIds.Tmdb) {
                    data.isIframeEmbed = true;

                    const tmdbId = itemData.ProviderIds.Tmdb;
                    const imdbId = itemData.ProviderIds.Imdb || tmdbId;
                    const timeParam = savedRestoreTimeRef.current > 0 ? `&t=${Math.floor(savedRestoreTimeRef.current)}` : "";
                    const srvs = generateServers(language, itemData.Type === "Episode", tmdbId, itemData.ParentIndexNumber, itemData.IndexNumber, imdbId, timeParam);
                    setAvailableServers(srvs);
                    const safeIndex = activeServerIndex >= srvs.length ? 0 : activeServerIndex;
                    data.iframeSrc = srvs[safeIndex].url;
                  }
                }
                // Fallback for testing if jellyfin bugs and no provider IDs are found
                if (!forceJellyfin && !data.isIframeEmbed) {
                   data.isIframeEmbed = true;
                   data.iframeSrc = "https://111movies.net/movie/1368337";
                }

                const mediaSources = itemData.MediaSources || [];
                if (mediaSources.length > 0) {
                  const source = mediaSources[0];
                  const streams = source.MediaStreams || [];
                  
                  // Extract subtitle streams with direct external VTT urls
                  const subtitleStreams = streams.filter((s: any) => s.Type === "Subtitle");
                  data.subtitles = subtitleStreams.map((s: any) => {
                    const subtitleUrl = `${serverUrl}/Videos/${movieId}/${source.Id}/Subtitles/${s.Index}/Stream.vtt?api_key=${currentApiKey}`;
                    return {
                      index: s.Index,
                      language: s.Language || "",
                      label: s.DisplayTitle || s.Title || s.Language || `Piste ${s.Index}`,
                      isDefault: s.IsDefault === true || s.DeliveryKey === "Default",
                      isForced: s.IsForced === true,
                      codec: s.Codec || "",
                      deliveryMethod: s.DeliveryMethod || "External",
                      url: subtitleUrl
                    };
                  });
                  
                  // Extract audio streams
                  const audioStreams = streams.filter((s: any) => s.Type === "Audio");
                  data.audios = audioStreams.map((s: any) => ({
                    index: s.Index,
                    language: s.Language || "",
                    label: s.DisplayTitle || s.Title || s.Language || `Audio ${s.Index}`,
                    isDefault: s.IsDefault === true,
                    codec: s.Codec || ""
                  }));
                }
              }
            } catch (e) {
            }
          } else {
            let url = `/api/playback/${encodeURIComponent(movieId)}?`;
            const params = new URLSearchParams();
            if (needsTranscodeParam) params.set("forceTranscode", "true");
            if (isLowQuality) params.set("lowQuality", "true");
            if (forceJellyfin) params.set("forceJellyfin", "true");
            url += params.toString();

            trackEventFired("metadataStart", "Début de récupération des métadonnées");
            const res = await fetch(url);
            trackEventFired("serverResponse", "Réponse du serveur (métadonnées reçues)");
            if (!res.ok) {
              throw new Error(`Erreur de lecture (Code ${res.status})`);
            }
            data = await res.json();
            trackEventFired("metadataEnd", "Fin de récupération des métadonnées");
          }
        }

        if (active) {
          if (data && data.streamUrl) {
            const isNetlify = false; // Forced false to bypass Jellyfin
            if (!isNetlify) {
              data = {
                ...data,
                streamUrl: formatHlsUrl(data.streamUrl, movieId, deviceId, apiKey)
              };
            }
            trackEventFired("streamUrlStart", "Début de récupération de l'URL de streaming");
          }
          setPlaybackInfo(data);
          setIsLoading(false);
          lastFetchedMovieIdRef.current = movieId;
          lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex, language };
          // Initialisation immédiate et stable avec la métadonnée Jellyfin
          if (data && data?.duration || 0 && data?.duration || 0 > 0) {
            setDuration(data?.duration || 0);
          }
          if (data && data.audios && data.audios.length > 0) {
            // Chercher une piste audio en anglais par défaut, sinon celle par défaut du serveur, sinon la première
            const englishAudio = data.audios.find((t: any) => {
              const lang = (t.language || "").toLowerCase();
              const lbl = (t.label || "").toLowerCase();
              return lang.includes("en") || lang.includes("eng") || lbl.includes("english") || lbl.includes("eng");
            });
            const defaultAudioTrack = englishAudio || data.audios.find((t: any) => t.isDefault) || data.audios[0];
            if (defaultAudioTrack) {
              setActiveAudioIndex(defaultAudioTrack.index);
            }
          }
          if (data && data.subtitles && data.subtitles.length > 0) {
            // Chercher une piste de sous-titres en anglais par défaut (uniquement texte), sinon celle par défaut du serveur, sinon la première textuelle, sinon la première tout court
            const englishSub = data.subtitles.find((t: any) => {
              const lang = (t.language || "").toLowerCase();
              const lbl = (t.label || "").toLowerCase();
              return (lang.includes("en") || lang.includes("eng") || lbl.includes("english") || lbl.includes("eng")) && isTextSubtitle(t.codec);
            });
            
            const serverDefaultTrack = data.subtitles.find((t: any) => (t.isDefault || t.isForced) && isTextSubtitle(t.codec));
            const firstTextTrack = data.subtitles.find((t: any) => isTextSubtitle(t.codec));
            const firstTrack = data.subtitles[0];
            
            const selectedTrack = englishSub || serverDefaultTrack || firstTextTrack || firstTrack;
            if (selectedTrack) {
              setActiveSubtitleIndex(selectedTrack.index);
              // Activer automatiquement les sous-titres si c'est la piste en anglais préférée ou marquée par défaut/forcée par le serveur
              const shouldBeOn = englishSub ? true : (serverDefaultTrack ? true : false);
              setSubtitlesOn(shouldBeOn);
            } else {
              setActiveSubtitleIndex(null);
              setSubtitlesOn(false);
            }
          } else {
            setActiveSubtitleIndex(null);
            setSubtitlesOn(false);
          }
        }
      } catch (err: any) {
        if (active) {
          if (playbackAttempts < 3) {
            const nextAttempt = playbackAttempts + 1;
            setTimeout(() => {
              if (active) {
                setPlaybackAttempts(nextAttempt);
                if (nextAttempt === 1) {
                  setForceTranscode(true);
                } else if (nextAttempt === 2) {
                  setIsLowQuality(true);
                }
              }
            }, 1500 * nextAttempt);
          } else {
            const isTvSeries = isSeries || String(movieId || "").includes("-tv");
            const heroMatch = heroMoviesData?.heroes?.find((m: any) => m.id === movieId || String(m.tmdbId) === String(movieId));
            const matchedMovie = passedMovieData || fetchedDetails || heroMatch || allMoviesData.find(m => m.id === movieId || String(m.tmdbId) === String(movieId));
            const resolvedTmdb = passedMovieData?.tmdbId || fetchedDetails?.tmdbId || heroMatch?.tmdbId || matchedMovie?.tmdbId || String(movieId || "").replace("-tv", "");
            const cleanId = String(resolvedTmdb).replace("-tv", "");
            const timeParam = savedRestoreTimeRef.current > 0 ? `&t=${Math.floor(savedRestoreTimeRef.current)}` : "";
            
            const tvState = isTvSeries ? JSON.parse(safeStorage.getItem("classico_tv_state") || "{}")[movieId] || {} : {};
            const targetSeason = isSeries ? (currentSeason || season || tvState.season || 1) : (season || tvState.season || 1);
            const targetEpisode = isSeries ? (currentEpisode || episode || tvState.episode || 1) : (episode || tvState.episode || 1);
            const newServers = generateServers(language, isTvSeries, cleanId, targetSeason, targetEpisode, cleanId, timeParam);
            setAvailableServers(newServers);

            const fallbackData = {
              id: movieId,
              streamUrl: "",
              duration: 0,
              container: "iframe",
              title: movieTitle || "Film",
              isDirect: false,
              isIframeEmbed: true,
              iframeSrc: newServers[0]?.url || "",
              allServers: newServers,
              videoCodec: "h264",
              audioCodec: "aac",
              chosenPath: "Iframe Fallback",
              subtitles: [],
              audios: []
            };
            setPlaybackInfo(fallbackData as any);
            lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex, language };
            setVideoError(null);
            setIsLoading(false);
            setIsStreamLoading(false);
            setIsIframeLoading(false);
            setIsMetadataLoaded(true);
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
          setIsStreamLoading(false);
        }
      }
    };

    fetchPlayback();

    return () => {
      active = false;
    };
  }, [movieId, forceTranscode, playbackAttempts, isLowQuality, forceJellyfin, activeServerIndex, language, currentSeason, currentEpisode, isSeries]);

  // Handle Audio && non-text Subtitle Track changes by reloading stream
  useEffect(() => {
    if (!playbackInfo) return;
    
    let currentUrl = playbackInfo.streamUrl;
    if (!currentUrl) return;

    let needsBurnIn = false;
    if (activeSubtitleIndex !== null && subtitlesOn) {
      const activeSub = playbackInfo.subtitles.find((s: any) => s.index === activeSubtitleIndex);
      if (activeSub && !isTextSubtitle(activeSub.codec)) {
        needsBurnIn = true;
      }
    }
    
    try {
      const baseOrigin = "http://localhost:3000";
      const urlObj = new URL(currentUrl, baseOrigin);
      
      let changed = false;

      const defaultAudio = playbackInfo.audios.find((a: any) => a.isDefault) || playbackInfo.audios[0];
      const defaultAudioIndex = defaultAudio ? defaultAudio.index : null;

      if (activeAudioIndex !== null) {
        const currentAudioIndex = urlObj.searchParams.get("AudioStreamIndex");
        if (currentAudioIndex !== activeAudioIndex.toString()) {
          // Si le paramètre d'URL est absent, le serveur lit la piste par défaut.
          // On évite un rechargement inutile si l'index demandé correspond à la piste par défaut.
          const isUrlDefault = currentAudioIndex === null;
          const isRequestingDefault = activeAudioIndex === defaultAudioIndex;
          
          if (!(isUrlDefault && isRequestingDefault)) {
            urlObj.searchParams.set("AudioStreamIndex", activeAudioIndex.toString());
            changed = true;
          }
        }
      }

      const currentSubIndex = urlObj.searchParams.get("SubtitleStreamIndex");
      if (needsBurnIn) {
        if (currentSubIndex !== activeSubtitleIndex!.toString()) {
          urlObj.searchParams.set("SubtitleStreamIndex", activeSubtitleIndex!.toString());
          urlObj.searchParams.set("SubtitleMethod", "Encode");
          changed = true;
        }
      } else {
        // Si aucun burn-in n'est nécessaire (ex: pas de sous-titres, ou sous-titres textuels),
        // l'absence de paramètre ou "-1" signifient tous deux "pas de burn-in".
        // On n'effectue de changement destructeur que si l'URL contient un véritable ID de sous-titre actif.
        if (currentSubIndex !== null && currentSubIndex !== "-1") {
          urlObj.searchParams.delete("SubtitleStreamIndex");
          urlObj.searchParams.delete("SubtitleMethod");
          changed = true;
        }
      }

      
      // If we are DirectPlay but we NEED to change audio or burn-in subtitle, we must switch to Transcoding
      
      const isChangingAudio = activeAudioIndex !== null && (!defaultAudio || activeAudioIndex !== defaultAudio.index);
      
      // Only convert to transcoding if we ACTUALLY need a non-default audio or burned in subtitles
      if (playbackInfo.isDirect && (isChangingAudio || needsBurnIn)) {
        const isNetlify = false; // Forced false to bypass Jellyfin
        const currentApiKey = isNetlify ? (safeStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : "";
        const serverUrl = isNetlify ? (safeStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
        const hlsParams = `Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&SegmentLength=3&MinSegments=1&BreakOnNonKeyFrames=True&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
        
        let transcodeUrl = "";
        if (isNetlify) {
            transcodeUrl = `${serverUrl}/Videos/${playbackInfo.id}/master.m3u8?${hlsParams}&api_key=${currentApiKey}&DeviceId=CinemaAppClient&MediaSourceId=${playbackInfo.id}`;
        } else {
            transcodeUrl = formatHlsUrl(`/api/jellyfin/proxy/videos/${playbackInfo.id}/master.m3u8?${hlsParams}`, playbackInfo.id, "CinemaAppClient", "");
        }
        
        const transcodeObj = new URL(transcodeUrl, baseOrigin);
        transcodeObj.searchParams.set("PlaySessionId", playbackInfo?.id || Date.now().toString());
        if (activeAudioIndex !== null) transcodeObj.searchParams.set("AudioStreamIndex", activeAudioIndex.toString());
        if (needsBurnIn) {
            transcodeObj.searchParams.set("SubtitleStreamIndex", activeSubtitleIndex!.toString());
            transcodeObj.searchParams.set("SubtitleMethod", "Encode");
        }
        
        let newUrl = transcodeUrl.startsWith("/") ? transcodeObj.pathname + transcodeObj.search : transcodeObj.toString();
        
        if (videoRef.current && videoRef.current.currentTime > 0) {
            savedRestoreTimeRef.current = videoRef.current.currentTime;
        }
        
        setPlaybackInfo(prev => ({
            ...prev!,
            isDirect: false,
            streamUrl: newUrl
        }));
        return; // Early return to avoid setting it again below
      }

      if (changed) {
        urlObj.searchParams.set("PlaySessionId", playbackInfo?.id || Date.now().toString());
        let newUrl = "";
        if (currentUrl.startsWith("/")) {
          newUrl = urlObj.pathname + urlObj.search;
        } else {
          newUrl = urlObj.toString();
        }
        
        
        if (videoRef.current && videoRef.current.currentTime > 0) {
            savedRestoreTimeRef.current = videoRef.current.currentTime;
        }
        
        setPlaybackInfo(prev => ({
            ...prev!,
            streamUrl: newUrl
        }));
      }
    } catch (e) {
      console.error("Error updating stream url params:", e);
    }
  }, [activeAudioIndex, activeSubtitleIndex, subtitlesOn, playbackInfo]);

  // Real-time console diagnostics logger for Cinema
  useEffect(() => {
    if (playbackInfo && playbackInfo.streamUrl) {
    }
  }, [playbackInfo]);

  // Estimate connection speed if navigator.connection is available
  useEffect(() => {
    const updateConnectionSpeed = () => {
      const conn = (navigator as any).connection;
      if (conn && conn.downlink) {
        setEstimatedBitrate(conn.downlink * 1000000);
      }
    };

    updateConnectionSpeed();
    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener("change", updateConnectionSpeed);
      return () => conn.removeEventListener("change", updateConnectionSpeed);
    }
  }, []);



  // Measure initial buffering time before playback starts
  useEffect(() => {
    if (playbackInfo?.streamUrl) {
      streamLoadStartRef.current = performance.now();
      setInitialBufferingTime(null);
    }
  }, [playbackInfo?.streamUrl]);

  useEffect(() => {
    if (isMetadataLoaded && streamLoadStartRef.current !== null) {
      const durationMs = performance.now() - streamLoadStartRef.current;
      setInitialBufferingTime(durationMs / 1000);
      streamLoadStartRef.current = null;
    }
  }, [isMetadataLoaded]);

  // 1b. Progressive load timeout system (3s, 8s, 12s) - Disabled to guarantee stream stability
  useEffect(() => {
    // Disabled to prevent progressive timeouts and automatic stream reloads
    return;
  }, []);

  // 1c. Buffer safety retry system (Check every 2 seconds if no buffer is loaded or playback stalls) - Disabled to guarantee stream stability
  useEffect(() => {
    // Disabled to prevent automatic buffering retries or reloads
    return;
  }, []);

  // 2. AUTOMATIC FULLSCREEN TRIGGER ON MOUNT REMOVED (Replaced by direct user gesture on play click)

  // Monitor document change for ESC key or native exit-fullscreen actions
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 3. AUTO-HIDE MOUSE CURSOR AND CONTROLS ON INACTIVITY
  const resetInactivityTimer = () => {
    setControlsVisible(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (playing) {
        setControlsVisible(false);
        setShowSettingsMenu(false);
        setTimeout(() => setSettingsView("main"), 200);
      }
    }, 3000);
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, [playing]);

  // Fix BFCache and infinite loader issues when returning from ads
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted || safeSession.getItem('returning_from_ad') === 'true') {
        setIsIframeLoading(false);
        setIsStreamLoading(false);
        setIsLoading(false);
        setIframeKey(Date.now());
        

      }
    };
    window.addEventListener('pageshow', handlePageShow);
    
    // Also run it on mount just in case we missed the event
    if (safeSession.getItem('returning_from_ad') === 'true') {
        setIsIframeLoading(false);
    }
    
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [movieId]);

  // 4. INTERACTION RECOVERY CONTROLLER
  const handleUserPlayInteraction = () => {
    handlePlayPauseClick();
  };

  const handlePlayPauseClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      resetInactivityTimer();
    }
    
    const video = videoRef.current;
    if (!video) return;

    // Capture the current playing state
    const wasPlaying = playing;

    if (wasPlaying) {
      video.pause();
      setPlaying(false);
    } else {
      // 3. Mise à jour des états : Assure-toi que l'état isPlaying passe immédiatement à true et que l'overlay disparaisse complètement du DOM dès que le clic est détecté
      setPlaying(true);
      setIsAutoplayBlocked(false);
      setIsInitialized(true);

      const streamUrl = playbackInfo?.streamUrl;
      const isDirect = playbackInfo?.isDirect;

      // 1. Force l'attachement du média : Dans la fonction déclenchée par le bouton de lecture, assure-toi que hls.attachMedia(videoRef.current) soit explicitement exécuté AVANT de lancer hls.loadSource(streamUrl)
      if (!isDirect && streamUrl && Hls.isSupported()) {
        if (loadedUrlRef.current !== streamUrl) {
          let hls = hlsRef.current;
          if (!hls) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90,
              maxBufferLength: 60,
              maxMaxBufferLength: 120,
              maxBufferSize: 120 * 1024 * 1024,
              maxBufferHole: 0.5,
              highBufferWatchdogPeriod: 3,
              nudgeMaxRetry: 8,
              maxStarvationDelay: 4,
              abrEwmaDefaultEstimate: 5000000,
              capLevelToPlayerSize: true,
              manifestLoadingTimeOut: 10000,
              manifestLoadingMaxRetry: 5,
              manifestLoadingRetryDelay: 500,
              levelLoadingTimeOut: 10000,
              levelLoadingMaxRetry: 5,
              levelLoadingRetryDelay: 500,
              fragLoadingTimeOut: 10000,
              fragLoadingMaxRetry: 5,
              fragLoadingRetryDelay: 500,
            });
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsMetadataLoaded(true);
              const liveDur = video?.duration || 0;
              const jellyfinDur = playbackInfo?.duration || 0;
              validateAndSetDuration(liveDur, jellyfinDur);
              // Safe deferred play when manifest is parsed
              video.play().catch((err) => {
                video.muted = true;
                setMuted(true);
                video.play().catch((err2) => {
                });
              });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.details === "bufferSeekOverHole") {
                // Ignore completely in silence
                return;
              }
              if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
                if (data.details !== "bufferStalledError") {
                  hls.recoverMediaError();
                }
                return;
              }
              if (data.fatal) {
                const isNetlify = false; // Forced false to bypass Jellyfin
                const currentApiKey = isNetlify ? (safeStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : apiKey;
                const serverUrl = isNetlify ? (safeStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
                const fallbackPath = `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&SegmentLength=3&MinSegments=1&BreakOnNonKeyFrames=True&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
                const fallbackUrl = isNetlify ? `${serverUrl}${fallbackPath}&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}` : formatHlsUrl(`/api/jellyfin/proxy${fallbackPath}&DeviceId=${deviceId}&MediaSourceId=${movieId}`, movieId, deviceId, apiKey);
                setPlaybackInfo({
                  id: movieId,
                  streamUrl: fallbackUrl,
                  duration: duration,
                  container: "m3u8",
                  title: playbackInfo?.title || "Film",
                  isDirect: false,
                  chosenPath: `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&SegmentLength=3&MinSegments=1&BreakOnNonKeyFrames=True&`,
                  videoCodec: "h264",
                  audioCodec: "aac",
                  subtitles: [],
                  audios: []
                } as any);
                hls.destroy();
                hlsRef.current = null;
                setVideoError(null);
                setIsMetadataLoaded(false);
              }
            });
          }

          hls.attachMedia(video);
          hls.loadSource(streamUrl);
          lastLoadedSourceRef.current = streamUrl;
          loadedUrlRef.current = streamUrl;
        } else {
        }
      } else if (streamUrl) {
        if (loadedUrlRef.current !== streamUrl) {
          video.src = streamUrl;
          video.load();
          lastLoadedSourceRef.current = streamUrl;
          loadedUrlRef.current = streamUrl;
        } else {
        }
      }

      // 4. Sécurise le .play() : Assure-toi que la promesse de lecture ne soit appelée qu'une fois que l'événement HLS MANIFEST_PARSED a été totalement validé par le lecteur.
      // 2. Déclenchement direct du Play : Une fois le média attaché, force la lecture avec une promesse propre seulement si les métadonnées sont chargées ou si c'est du Direct Play (qui gère sa propre synchro de chargement)
      if (isDirect || isMetadataLoaded) {
        video.play().catch((err) => {
          video.muted = true;
          setMuted(true);
          video.play().catch((err2) => {
          });
        });
      } else {
      }

      // Request fullscreen on explicit user gesture/click
      if (viewportRef.current) {
        if (viewportRef.current.requestFullscreen) {
          viewportRef.current.requestFullscreen()
            .then(() => setFullscreen(true))
        }
      }
    }
  };

  
  // 5. VIDEO SOURCE TRANSITION MANAGER WITH SEAMLESS HLS.JS INTEGRATION
  useEffect(() => {
    if (isLoading) return;
    
    // Pour les iframes, on n'a pas besoin de l'élément video
    if (playbackInfo?.isIframeEmbed) {
      setIsMetadataLoaded(true);
      setPlaying(true);
      setIsActuallyPlaying(true);
      setIsLoading(false);
      setIsStreamLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video || !playbackInfo?.streamUrl) return;
    // Prevent destructive stream reset if the URL is already loaded (State Stabilization)
    if (loadedUrlRef.current === playbackInfo.streamUrl) {

      return;
    }
    
    // 3. Mise à jour unique : Ne mets à jour loadedUrlRef.current = streamUrl que la toute première fois où le film est injecté.
    loadedUrlRef.current = playbackInfo.streamUrl;
    lastLoadedSourceRef.current = playbackInfo.streamUrl;

    // Reset video player stream state
    video.pause();
    if (hlsRef.current) {
      hlsRef.current = null;
    }
    video.removeAttribute("src");
    try {
      video.load();
    } catch (e) {
    }

    setIsMetadataLoaded(false);
    setIsAutoplayBlocked(false);
    setPlaying(true);
    setIsActuallyPlaying(false);
    setSeekOffset(0);
    isInitialAutoplayRef.current = true;

    // Set properties for unmuted autoplay in the HTML5 backend ref
    video.muted = false;
    video.autoplay = true;
    setMuted(false);

    const handleLoadedMetadata = () => {
      trackEventFired("loadedmetadata", "Événement loadedmetadata");
      setIsMetadataLoaded(true);
      const liveDur = video?.duration || 0;
      const jellyfinDur = playbackInfo?.duration || 0;
      validateAndSetDuration(liveDur, jellyfinDur);
      if (savedRestoreTimeRef.current > 0) {
        video.currentTime = savedRestoreTimeRef.current;
        savedRestoreTimeRef.current = 0;
      }
      // Transition smoothly into play state
      setPlaying(true);
    };

    const handleCanPlay = () => {
      trackEventFired("canplay", "Événement canplay");
      const liveDur = video?.duration || 0;
      const jellyfinDur = playbackInfo?.duration || 0;
      validateAndSetDuration(liveDur, jellyfinDur);
      if (savedRestoreTimeRef.current > 0) {
        video.currentTime = savedRestoreTimeRef.current;
        savedRestoreTimeRef.current = 0;
      }
      setPlaying(true);
    };

    const handleLoadedData = () => {
      trackEventFired("loadeddata", "Événement loadeddata");
      setPlaying(true);
      setIsLoading(false);
      setIsStreamLoading(false);
    };

    let lastSaveTime = 0;
    const handleTimeUpdate = () => {
      setProgress(video.currentTime);
      const now = Date.now();
      if (now - lastSaveTime > 1000) {
        lastSaveTime = now;
        try {
          const saved = (JSON.parse(safeStorage.getItem("classico_progress") || "{}") || {});
          if (isTv && season && episode) {
              const baseId = movieId ? String(movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;
              if (baseId) {
                if (!saved[baseId] || saved[baseId].type !== "tv") {
                   saved[baseId] = {
                       id: baseId,
                       type: "tv",
                       last_season_watched: season,
                       last_episode_watched: episode,
                       show_progress: {}
                   };
                }
                saved[baseId].last_season_watched = season;
                saved[baseId].last_episode_watched = episode;
                saved[baseId].server_index = activeServerIndex;
                if (!saved[baseId].show_progress) saved[baseId].show_progress = {};
                saved[baseId].show_progress[`s${season}e${episode}`] = {
                    season: season,
                    episode: episode,
                    progress: { watched: video.currentTime, duration: video.duration || playbackInfo?.duration || 0 }
                };
              }
          } else if (movieId) {
              saved[movieId] = { 
                currentTime: video.currentTime, 
                timestamp: now,
                duration: video.duration || playbackInfo?.duration || 0,
                server_index: activeServerIndex
              };
          }
          safeStorage.setItem("classico_progress", JSON.stringify(saved));
          window.dispatchEvent(new CustomEvent("classico_progress_updated"));
          
          if (isTv && season && episode) {
             const baseId = movieId ? String(movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;
             if (baseId) {
                 try {
                     const tvState = (JSON.parse(safeStorage.getItem("classico_tv_state") || "{}") || {});
                     tvState[baseId] = { season: season, episode: episode };
                     safeStorage.setItem("classico_tv_state", JSON.stringify(tvState));
                 } catch(e) {}
             }
          }
        } catch(e) {}
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);

    const streamMode = playbackInfo.isDirect ? "DirectPlay" : "Transcoding / HLS";

    if (streamMode === "DirectPlay") {
      // 1. BRANCHING LOGIC CRITIQUE: Si mode === "DirectPlay", bypass HLS entirely
      addLog("Stream attached (Direct Play)");
      video.src = playbackInfo.streamUrl;
      video.load();

      // play() immédiat seulement si l'utilisateur a débloqué
      if (adClicks >= 3) {
        video.play().catch((err) => {
        });
      }
    } else {
      // Si mode === "Transcoding / HLS", initialiser Hls.js s'il est supporté
      addLog("Stream attached (HLS)");
      // Detect Apple devices to prioritize native HLS for AirPlay support
      const isApple = /Mac|iPod|iPhone|iPad/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const preferNativeHLS = (isApple || isSafari) && video.canPlayType("application/vnd.apple.mpegurl");

      if (preferNativeHLS) {
        // Native support (Safari iOS/macOS) prioritizes AirPlay compatibility
        logChrono("Attribution du src vidéo");
        video.src = playbackInfo.streamUrl;
        video.load();
      } else if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          maxBufferSize: 120 * 1024 * 1024,
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 3,
          nudgeMaxRetry: 8,
          maxStarvationDelay: 4,
          abrEwmaDefaultEstimate: 5000000,
          capLevelToPlayerSize: true,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 5,
          manifestLoadingRetryDelay: 500,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 5,
          levelLoadingRetryDelay: 500,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 5,
          fragLoadingRetryDelay: 500,
        });

        logChrono("Attribution du src vidéo");
        hls.attachMedia(video);
        hls.loadSource(playbackInfo.streamUrl);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsMetadataLoaded(true);
          const liveDur = video?.duration || 0;
          const jellyfinDur = playbackInfo?.duration || 0;
          validateAndSetDuration(liveDur, jellyfinDur);
          // Auto-play HLS stream gracefully managed by React effect sync and HTML5 autoplay
          setPlaying(true);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.details === "bufferSeekOverHole") {
            // Ignore completely in silence
            return;
          }
          if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
            if (data.details !== "bufferStalledError") {
              hls.recoverMediaError();
            }
            return;
          }
          if (data.fatal) {
            // Instant fallback (0ms) to alternative safe stream
            if (progress > 0) {
              savedRestoreTimeRef.current = progress;
            }
            const fallbackPath = `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&SegmentLength=3&MinSegments=1&BreakOnNonKeyFrames=True&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
            const isNetlify = false; // Forced false to bypass Jellyfin
            const currentApiKey = isNetlify ? (safeStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : apiKey;
            const serverUrl = isNetlify ? (safeStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
            const fallbackUrl = isNetlify ? `${serverUrl}${fallbackPath}&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}` : formatHlsUrl(`/api/jellyfin/proxy${fallbackPath}&DeviceId=${deviceId}&MediaSourceId=${movieId}`, movieId, deviceId, apiKey);
            setPlaybackInfo({
              id: movieId,
              streamUrl: fallbackUrl,
              duration: duration,
              container: "m3u8",
              title: playbackInfo?.title || "Film",
              isDirect: false,
              chosenPath: fallbackPath,
              videoCodec: "h264",
              audioCodec: "aac",
              subtitles: [],
              audios: []
            } as any);
            hls.destroy();
            hlsRef.current = null;
            setVideoError(null);
            setIsMetadataLoaded(false);
          }
        });
      } else {
        // Fallback Native HLS if Hls.js is not supported but native is
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playbackInfo.streamUrl;
        } else {
            video.src = playbackInfo.streamUrl;
        }
        logChrono("Attribution du src vidéo");
        video.load();
      }
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackInfo?.streamUrl, isInitialized, isLoading, activeServerIndex]);

  // 4. SYNC PLAY ACTIONS WITH HTML5 VIDEO ELEMENT (For subsequent user play/pause button actions)
  useEffect(() => {
    if (playbackInfo?.isIframeEmbed) return;
    const video = videoRef.current;
    if (!video) return;

    if (adClicks < 3) {
      video.pause();
      if (playing) setPlaying(false);
      return;
    }

    if (playing) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAutoplayBlocked(false);

            if (isInitialAutoplayRef.current) {
              isInitialAutoplayRef.current = false;
            }
          })
          .catch((err) => {
            video.muted = true;
            setMuted(true);
            video.play()
              .then(() => {
                setIsAutoplayBlocked(false);
                setPlaying(true);
              })
              .catch((err2) => {
                setIsAutoplayBlocked(false); // Do not block UI with an overlay
                setPlaying(false);
              });
          });
      } else {
        setIsAutoplayBlocked(false);
        if (isInitialAutoplayRef.current) {
          isInitialAutoplayRef.current = false;
        }
      }
    } else {
      // Avoid calling pause() if initial loading of metadata has just completed and we're about to auto-play,
      // or if it's already paused.
      if (!video.paused) {
        video.pause();
      }
    }
  }, [playing, isMetadataLoaded]);

  // 5. UPDATE VOLUME ACTIONS
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    if (!playbackInfo?.isIframeEmbed) return;
    
    const handleMessage = (event: MessageEvent) => {
      let parsedData: any = event.data;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch (_) {
          // not a JSON string
        }
      }
      if (!parsedData || typeof parsedData !== 'object') return;

      // 1. CineSrc events
      if (event.origin === 'https://cinesrc.st' || (typeof parsedData.type === 'string' && parsedData.type.startsWith('cinesrc:'))) {
        switch (parsedData.type) {
          case 'cinesrc:ready':
          case 'cinesrc:play':
            setIsIframeLoading(false);
            setPlaying(true);
            break;
          case 'cinesrc:pause':
            setPlaying(false);
            break;
          case 'cinesrc:loadedmetadata':
            if (parsedData.duration && Number(parsedData.duration) > 0) {
              setDuration(Number(parsedData.duration));
            }
            break;
          case 'cinesrc:close':
            onClose?.();
            break;
          case 'cinesrc:nextepisode':
            if (parsedData.season && parsedData.episode) {
              const pTmdbId = movieId ? String(movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;
              if (pTmdbId) {
                try {
                  const tvState = JSON.parse(safeStorage.getItem("classico_tv_state") || "{}") || {};
                  tvState[pTmdbId] = { season: parsedData.season, episode: parsedData.episode };
                  tvState[`${pTmdbId}-tv`] = { season: parsedData.season, episode: parsedData.episode };
                  safeStorage.setItem("classico_tv_state", JSON.stringify(tvState));
                } catch (e) {}
                setCurrentSeason(parsedData.season);
                setCurrentEpisode(parsedData.episode);
                onSelectMovie?.(`${pTmdbId}-tv-S${parsedData.season}E${parsedData.episode}`);
              }
            }
            break;
        }
      }

      // 2. Peachify loading / play screen logic
      if (event.origin === 'https://peachify.pro' || (parsedData.type === 'PLAYER_EVENT' && parsedData.data?.event === 'play')) {
        setIsIframeLoading(false);
      }

      // 3. Unified progress tracking logic (Peachify, CineSrc, and others)
      let currentTime: number | undefined = undefined;
      let durationValue: number | undefined = undefined;
      let pSeason = season;
      let pEpisode = episode;
      let pIsTv = isTv;
      let pTmdbId = movieId ? String(movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;

      // CineSrc time update events
      if (parsedData.type === 'cinesrc:timeupdate' || parsedData.type === 'cinesrc:seeking' || parsedData.type === 'cinesrc:seeked') {
        if (parsedData.currentTime !== undefined) {
          currentTime = Number(parsedData.currentTime);
          durationValue = parsedData.duration ? Number(parsedData.duration) : (duration || 0);
        }
      }

      // Peachify & standard PLAYER_EVENT
      if (parsedData.type === 'PLAYER_EVENT') {
        const payload = parsedData.data || parsedData;
        if (payload.currentTime !== undefined) {
          currentTime = Number(payload.currentTime);
          durationValue = payload.duration ? Number(payload.duration) : (duration || 0);
          if (payload.mediaType === 'tv') pIsTv = true;
          if (payload.tmdbId || payload.id) pTmdbId = String(payload.tmdbId || payload.id);
          if (payload.season) pSeason = payload.season;
          if (payload.episode) pEpisode = payload.episode;
        }
      }

      // MEDIA_DATA event
      if (parsedData.type === 'MEDIA_DATA' && parsedData.data) {
        if (parsedData.data.watched !== undefined || parsedData.data.currentTime !== undefined) {
          currentTime = Number(parsedData.data.watched ?? parsedData.data.currentTime);
          durationValue = parsedData.data.duration ? Number(parsedData.data.duration) : (duration || 0);
          if (parsedData.data.mediaType === 'tv') pIsTv = true;
          if (parsedData.data.tmdbId || parsedData.data.id) pTmdbId = String(parsedData.data.tmdbId || parsedData.data.id);
          if (parsedData.data.season) pSeason = parsedData.data.season;
          if (parsedData.data.episode) pEpisode = parsedData.data.episode;
        }
      }

      // Generic timeupdate event
      if (parsedData.event === 'timeupdate' || parsedData.type === 'timeupdate' || parsedData.type === 'peachify:timeupdate' || parsedData.event === 'progress' || parsedData.type === 'progress') {
        const time = parsedData.currentTime ?? parsedData.data?.currentTime ?? parsedData.watched ?? parsedData.data?.watched ?? parsedData.time ?? parsedData.data?.time ?? parsedData.seconds ?? parsedData.data?.seconds;
        if (time !== undefined) {
          currentTime = Number(time);
          const dur = parsedData.duration ?? parsedData.data?.duration ?? parsedData.totalDuration ?? parsedData.data?.totalDuration;
          if (dur) durationValue = Number(dur);
        }
      }

      // Fallback: any message with currentTime / duration fields or data.currentTime
      if (currentTime === undefined) {
        const rawTime = parsedData.currentTime ?? parsedData.data?.currentTime ?? parsedData.watched ?? parsedData.data?.watched;
        if (rawTime !== undefined) {
          currentTime = Number(rawTime);
          const dur = parsedData.duration ?? parsedData.data?.duration;
          if (dur) durationValue = Number(dur);
        }
      }

      if (currentTime !== undefined && !isNaN(currentTime) && currentTime >= 0) {
        try {
          savedRestoreTimeRef.current = currentTime;
          setProgress(currentTime);
          if (durationValue && durationValue > 0) {
            setDuration(durationValue);
          }

          const saved = (JSON.parse(safeStorage.getItem("classico_progress") || "{}") || {});
          if (pIsTv && pSeason && pEpisode && pTmdbId) {
            if (!saved[pTmdbId] || saved[pTmdbId].type !== "tv") {
              saved[pTmdbId] = {
                id: pTmdbId,
                type: "tv",
                last_season_watched: pSeason,
                last_episode_watched: pEpisode,
                show_progress: {}
              };
            }
            saved[pTmdbId].last_season_watched = pSeason;
            saved[pTmdbId].last_episode_watched = pEpisode;
            saved[pTmdbId].server_index = activeServerIndex;
            if (!saved[pTmdbId].show_progress) saved[pTmdbId].show_progress = {};
            saved[pTmdbId].show_progress[`s${pSeason}e${pEpisode}`] = {
              season: pSeason,
              episode: pEpisode,
              progress: { watched: currentTime, duration: durationValue || duration || 0 }
            };
          } else if (movieId) {
            saved[movieId] = { 
              currentTime: currentTime, 
              timestamp: Date.now(),
              duration: durationValue || duration || 0,
              server_index: activeServerIndex
            };
          }
          safeStorage.setItem("classico_progress", JSON.stringify(saved));
          try {
            window.dispatchEvent(new CustomEvent("classico_progress_updated"));
          } catch(e) {}
          
          // Also maintain legacy classico_tv_state for App.tsx and MovieDetailView.tsx compatibility
          if (pIsTv && pSeason && pEpisode && pTmdbId) {
            try {
              const tvState = (JSON.parse(safeStorage.getItem("classico_tv_state") || "{}") || {});
              tvState[pTmdbId] = { season: pSeason, episode: pEpisode };
              safeStorage.setItem("classico_tv_state", JSON.stringify(tvState));
            } catch(e) {}
          }
        } catch(e) {}
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playbackInfo, movieId, activeServerIndex, isTv, season, episode, onClose, duration]);

  // Format second timestamps to MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Scrubber percent progress
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Toggle Fullscreen explicitly
  const toggleFullscreen = () => {
    if (!viewportRef.current || !videoRef.current) return;
    
    const vid = videoRef.current as any;
    const isIPhone = /iPhone|iPod/i.test(navigator.userAgent);
    
    // 1. Force Apple's native player on iPhone/iPod ONLY
    if (isIPhone && vid.webkitEnterFullscreen) {
      try {
        vid.webkitEnterFullscreen();
      } catch (e) {
      }
      return;
    }
    
    // 2. For all other devices (iPad, Mac, PC, Android), use standard fullscreen on the wrapper
    const doc = document as any;
    const viewport = viewportRef.current as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (viewport.requestFullscreen) {
      } else if (viewport.webkitRequestFullscreen) {
      }
    } else {
      if (doc.exitFullscreen) {
      } else if (doc.webkitExitFullscreen) {
      }
    }
  };

  // Find TMDB data for extra details
  const localMovieData = allMoviesData.find(m => m.id === movieId) || matchedMovie;
  const movieData = fetchedDetails || passedMovieData || localMovieData;
  const cast = movieData?.cast || [];
  const castDetails = (movieData as any)?.castDetails || [];
  const logo = movieData?.logoUrl && movieData.logoUrl.trim() ? movieData.logoUrl.trim() : null;
  const hasLogo = Boolean(logo);
  const currentTitle = movieData?.title || movieTitle;
  const effectiveBackdrop = (movieData?.backdropUrl && movieData.backdropUrl.trim()) || (movieBackdrop && movieBackdrop.trim()) || null;
  const effectivePoster = (movieData?.posterUrl && movieData.posterUrl.trim()) || (moviePoster && moviePoster.trim()) || null;

  const similarMovies = useMemo(() => {
    if ((movieData as any)?.similar && (movieData as any).similar.length > 0) {
      return (movieData as any).similar;
    }
    const genres: string[] = movieData?.genre || [];
    return allMoviesData
      .filter(m => m.id !== movieId && m.genre?.some((g: string) => genres.includes(g)))
      .slice(0, 8)
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        posterUrl: m.posterUrl || m.poster,
        backdropUrl: m.backdropUrl || m.backdrop,
        year: m.year,
        voteAverage: m.voteAverage || m.rating
      }));
  }, [movieData, movieId]);

  if (videoError) {
    return (
      <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error</h3>
        <p className="text-zinc-400 max-w-md">{videoError}</p>
        <button
          onClick={handleClosePlayer}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (availableServers.length === 0 && !isMetadataLoaded) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] bg-black flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  const handleSelectSimilar = (simId: string | number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onSelectMovie) {
      onSelectMovie(String(simId));
    } else {
      window.location.hash = `/player/${simId}`;
    }
  };

  const isCineSrc = (language === "en" && activeServerIndex === 0) || (playbackInfo?.iframeSrc ? playbackInfo.iframeSrc.includes("cinesrc.st") : false);
  const isCinemaOS = (language === "en" && activeServerIndex === 3) || (playbackInfo?.iframeSrc ? playbackInfo.iframeSrc.includes("cinemaos.live") : false);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-stone-100 flex flex-col select-none relative animate-in fade-in duration-300">
      
      {/* Background Backdrop with Gradient */}
      {effectiveBackdrop && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={effectiveBackdrop} alt="" className="w-full h-[60vh] object-cover opacity-[0.15] mask-image-gradient" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }} />
        </div>
      )}
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-0 left-0 right-0 h-[100vh] bg-cover bg-top opacity-30"
          style={{ 
            backgroundImage: (effectiveBackdrop || effectivePoster) ? `url("${effectiveBackdrop || effectivePoster}")` : 'none',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 90%)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]"></div>
      </div>

      {/* AdGate Overlay */}
      {serverSelected && adClicks < 3 && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
          <div className="max-w-md w-full bg-neutral-900 border border-amber-500/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-cinzel font-bold text-amber-500 mb-4 tracking-widest uppercase">Support Classico</h2>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed font-sans">
              Classico is free and will stay that way, but our servers cost a lot to maintain. The only way we can compensate is by including three ads per movie.
              <br /><br />
              <strong className="text-white">Please disable your ad-blocker to support us.</strong> Thank you immensely!
            </p>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 w-full mb-6">
              <p className="text-rose-400 text-[11px] font-mono uppercase tracking-wider">
                Don't click anything on the ads, just close the new tab.
              </p>
            </div>
            
            <button
              onClick={handleAdClick}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer"
            >
              <span className="font-sans text-base">Click Ad ({adClicks + 1}/3)</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Progress</span>
              <span className="text-amber-500 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded">{adClicks}/3</span>
            </div>
          </div>
          <button
            onClick={handleClosePlayer}
            className="absolute top-6 left-6 p-3 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white transition-all cursor-pointer border border-white/10"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-[calc(2rem+env(safe-area-inset-top))] pb-16">
        
        {/* Top Bar with Back Button */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleClosePlayer}
            className="flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors font-sans text-sm uppercase tracking-wider"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Title & Meta Above Player & Sidebars */}
        <div className="w-full flex flex-col items-center text-center gap-3.5 mb-8">
          {hasLogo && logo ? (
            <div className="flex items-center justify-center py-1">
              <img 
                src={logo} 
                alt={currentTitle} 
                className="h-16 sm:h-20 md:h-24 max-h-28 w-auto max-w-[85%] sm:max-w-[70%] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] filter transition-transform duration-300 hover:scale-[1.02]" 
              />
            </div>
          ) : (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold text-white tracking-wider uppercase drop-shadow-lg text-balance leading-tight max-w-2xl">
              {currentTitle}
            </h1>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs uppercase tracking-widest font-sans text-zinc-400">
            {movieData?.voteAverage && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <span className="text-amber-400 text-xs">★</span> 
                <span className="text-amber-300 font-semibold">{movieData.voteAverage.toFixed(1)}</span>
              </div>
            )}
            {movieData?.year && <span className="text-zinc-300 font-medium">{movieData.year}</span>}
            {movieData?.duration && <span className="text-zinc-400">{movieData.duration}{String(movieData.duration).includes('m') ? '' : 'm'}</span>}
            {movieData?.director && <span className="text-zinc-400">DIR. <strong className="text-zinc-300 font-normal">{movieData.director}</strong></span>}
            {movieData?.genre && movieData.genre.length > 0 && (
              <span className="text-zinc-500 hidden sm:inline">• {movieData.genre.slice(0, 2).join(", ")}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 lg:gap-10 justify-center items-start">
          
          {/* Left Column: Cast */}
          <div 
            style={measuredPlayerHeight ? { height: `${measuredPlayerHeight}px` } : undefined}
            className="w-full xl:w-[250px] shrink-0 order-3 xl:order-1 bg-[#101010]/85 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex flex-col gap-2 relative xl:self-start overflow-hidden max-h-[472px] xl:max-h-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <h3 className="text-zinc-200 font-sans text-xs uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Main Cast
              </h3>
              <span className="text-[10px] font-sans font-medium text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                {castDetails.length > 0 ? castDetails.length : cast.length} actors
              </span>
            </div>
            <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto scrollbar-hide pr-0.5">
              {castDetails.length > 0 ? (
                (showAllCast ? castDetails : castDetails.slice(0, 7)).map((actor: any, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 py-1 px-1.5 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-amber-400/40 transition-colors shadow-sm">
                      {actor.imageUrl && actor.imageUrl.trim() ? (
                        <img src={actor.imageUrl.trim()} alt={actor.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <span className="text-xs font-sans font-medium text-zinc-400">{actor.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-sans text-zinc-200 group-hover:text-white font-medium truncate">{actor.name}</span>
                      {actor.role && (
                        <span className="text-[10px] font-sans text-zinc-400 truncate">{actor.role}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                (showAllCast ? cast : cast.slice(0, 7)).map((actor: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 py-1 px-1.5 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-amber-400/40 transition-colors shadow-sm">
                      <span className="text-xs font-sans font-medium text-zinc-400">{actor.charAt(0)}</span>
                    </div>
                    <span className="text-xs font-sans text-zinc-200 group-hover:text-white font-medium truncate">{actor}</span>
                  </div>
                ))
              )}
            </div>

            {/* See more toggle */}
            {(castDetails.length > 7 || cast.length > 7) && (
              <button
                type="button"
                onClick={() => setShowAllCast(!showAllCast)}
                className="w-full mt-auto py-1.5 px-2.5 text-[11px] font-sans font-medium text-amber-400/90 hover:text-amber-300 hover:bg-white/[0.05] rounded-lg transition-all text-center border border-white/5 flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                <span>{showAllCast ? "Show less" : "See more"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllCast ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Center Column: Player, Synopsis & Details */}
          <div className="w-full xl:max-w-[840px] flex-1 order-1 xl:order-2 flex flex-col items-center">
            
            {/* Player Container */}
            <div className="w-full flex flex-col gap-6">
              <div ref={viewportRef} className="w-full aspect-video bg-[#050505] rounded-xl overflow-hidden shadow-2xl border border-white/5 relative group">
                {!serverSelected ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                      <Play className="w-6 h-6 text-zinc-600 ml-1" />
                    </div>
                    <p className="text-zinc-500 font-sans text-sm">Select a source.</p>
                  </div>
                ) : (isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-[45]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
                    <p className="text-amber-500/50 font-mono tracking-widest uppercase text-[10px]">Connecting...</p>
                  </div>
                ) : null}

                {serverSelected && adClicks >= 3 && (playbackInfo?.iframeSrc || (!isLoading && !isStreamLoading && !playbackInfo?.isIframeEmbed)) ? (
                  <div className="absolute inset-0 w-full h-full z-40 opacity-100 pointer-events-auto overflow-hidden bg-black">
                    {playbackInfo?.iframeSrc && playbackInfo.iframeSrc.trim() && normalizeEmbedUrl(playbackInfo.iframeSrc.trim()) ? (
                      <iframe
                        key={`${playbackInfo.iframeSrc.trim()}-${iframeKey}`}
                        src={normalizeEmbedUrl(playbackInfo.iframeSrc.trim())}
                        allowFullScreen={true}
                        scrolling="no"
                        sandbox={isCineSrc ? "allow-scripts allow-same-origin allow-forms" : undefined}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        onLoad={() => setIsIframeLoading(false)}
                        className={`border-0 absolute transition-all duration-300 ${
                          isCinemaOS 
                            ? "w-full -top-16 sm:-top-18 h-[calc(100%+120px)] left-0" 
                            : "w-full h-full inset-0"
                        }`}
                        style={{ overflow: 'hidden' }}
                        // @ts-ignore
                        webkitallowfullscreen="true"
                        // @ts-ignore
                        mozallowfullscreen="true"
                      ></iframe>
                    ) : (
                      <video
                        ref={videoRef}
                        className="w-full h-full object-contain absolute inset-0 bg-black"
                        playsInline
                        controls
                        autoPlay
                        crossOrigin="anonymous"
                      />
                    )}
                  </div>
                ) : null}
              </div>

              {/* Mobile Server Selector Button (Under the film - mobile only) */}
              <div className="xl:hidden w-full mt-3 flex items-center justify-between gap-3 bg-[#111111]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-sans text-zinc-400 tracking-wider font-semibold">Serveur</span>
                    <span className="text-xs font-sans font-bold text-amber-300 truncate">
                      {availableServers[activeServerIndex]?.name?.split(' (')[0] || `Server ${activeServerIndex + 1}`} ({language.toUpperCase()})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileServerModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span>Changer de serveur</span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>

              {/* SERIES ONLY: Minimalist Season & Episode Selector Bars */}
              {isSeries && (
                <div className="w-full mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative">
                  {/* BARRE 1: SAISON */}
                  <div className="relative flex-1 sm:max-w-[280px]">
                    <div className="px-3 py-2 bg-[#121212]/95 border border-white/10 rounded-xl flex items-center justify-between gap-2 shadow-md">
                      {/* Bouton Précédent */}
                      <button
                        type="button"
                        disabled={!canPrevSeason}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevSeason();
                        }}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer border border-white/5 shrink-0"
                        title="Saison précédente"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Clic central pour ouvrir la liste des saisons */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSeasonModalOpen(prev => !prev);
                          setIsEpisodeModalOpen(false);
                        }}
                        className="flex-1 flex items-center justify-between gap-2 px-2 py-1 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer min-w-0 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                            <Tv className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-[10px] uppercase font-sans text-zinc-400 font-semibold tracking-wider">Saison</span>
                            <span className="text-xs font-sans font-bold text-amber-300 truncate">
                              Saison {currentSeason}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-transform duration-200 shrink-0 ml-1 ${isSeasonModalOpen ? 'rotate-180 text-amber-400' : ''}`} />
                      </button>

                      {/* Bouton Suivant */}
                      <button
                        type="button"
                        disabled={!canNextSeason}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextSeason();
                        }}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer border border-white/5 shrink-0"
                        title="Saison suivante"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Menu déroulant minimaliste Saison */}
                    {isSeasonModalOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsSeasonModalOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#141414] border border-white/15 rounded-xl shadow-2xl p-1.5 max-h-64 overflow-y-auto">
                          {displaySeasons.map((s: any) => {
                            const isSelected = s.season_number === currentSeason;
                            return (
                              <button
                                key={s.season_number}
                                type="button"
                                onClick={() => {
                                  handleSeasonSelect(s.season_number);
                                  setIsSeasonModalOpen(false);
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-xs font-sans flex items-center justify-between text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500 text-black font-bold'
                                    : 'text-zinc-200 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <span>{s.name || `Saison ${s.season_number}`}</span>
                                {s.episode_count ? (
                                  <span className={`text-[10px] ${isSelected ? 'text-black/70' : 'text-zinc-400'}`}>
                                    {s.episode_count} eps
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* BARRE 2: ÉPISODE */}
                  <div className="relative flex-1">
                    <div className="px-3 py-2 bg-[#121212]/95 border border-white/10 rounded-xl flex items-center justify-between gap-2 shadow-md">
                      {/* Bouton Précédent */}
                      <button
                        type="button"
                        disabled={currentEpisode <= 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEpisodeSelect(currentSeason, currentEpisode - 1);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer border border-white/5 shrink-0"
                        title="Épisode précédent"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Clic central pour ouvrir la liste des épisodes */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsEpisodeModalOpen(prev => !prev);
                          setIsSeasonModalOpen(false);
                        }}
                        className="flex-1 flex items-center justify-between gap-2 px-2 py-1 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer min-w-0 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                            <Film className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-[10px] uppercase font-sans text-zinc-400 font-semibold tracking-wider">Épisode</span>
                            <span className="text-xs font-sans font-bold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                              Ép. {currentEpisode} : {episodesList.find((ep: any) => ep.episode_number === currentEpisode)?.name || `Épisode ${currentEpisode}`}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-transform duration-200 shrink-0 ml-1 ${isEpisodeModalOpen ? 'rotate-180 text-amber-400' : ''}`} />
                      </button>

                      {/* Bouton Suivant */}
                      <button
                        type="button"
                        disabled={episodesList.length > 0 && currentEpisode >= episodesList.length}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEpisodeSelect(currentSeason, currentEpisode + 1);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer border border-white/5 shrink-0"
                        title="Épisode suivant"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Menu déroulant minimaliste Épisode */}
                    {isEpisodeModalOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsEpisodeModalOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#141414] border border-white/15 rounded-xl shadow-2xl p-1.5 max-h-64 overflow-y-auto">
                          {isLoadingEpisodes ? (
                            <div className="py-4 text-center text-xs text-zinc-400">Chargement...</div>
                          ) : episodesList.length > 0 ? (
                            episodesList.map((ep: any) => {
                              const isSelected = ep.episode_number === currentEpisode;
                              return (
                                <button
                                  key={ep.episode_number}
                                  type="button"
                                  onClick={() => {
                                    handleEpisodeSelect(currentSeason, ep.episode_number);
                                    setIsEpisodeModalOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 rounded-lg text-xs font-sans flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-500 text-black font-bold'
                                      : 'text-zinc-200 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <span className="truncate">
                                    {ep.episode_number}. {ep.name || `Épisode ${ep.episode_number}`}
                                  </span>
                                  {ep.runtime ? (
                                    <span className={`text-[10px] shrink-0 ${isSelected ? 'text-black/70' : 'text-zinc-400'}`}>
                                      {ep.runtime} min
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })
                          ) : (
                            <div className="py-3 text-center text-xs text-zinc-500">Aucun épisode</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Rich Details Section Below Player (Scroll view) */}
              <div className="w-full mt-4 flex flex-col gap-6 text-left">
                
                {/* Tabs Header Navigation */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-hide">
                  {isSeries && (
                    <button
                      type="button"
                      onClick={() => setDetailsTab("episodes")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        detailsTab === "episodes"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5 text-amber-400" />
                      <span>Saisons & Épisodes</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-semibold">
                        S{currentSeason} E{currentEpisode}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailsTab("synopsis")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                      detailsTab === "synopsis"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <span>Overview & Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailsTab("similar")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                      detailsTab === "similar"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>More Like This</span>
                    {similarMovies.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${detailsTab === "similar" ? "bg-amber-400/20 text-amber-200" : "bg-white/10 text-zinc-400"}`}>
                        {similarMovies.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailsTab("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer shrink-0 ${
                      detailsTab === "all"
                        ? "bg-white/10 text-white border border-white/15"
                        : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                    }`}
                  >
                    <span>View All</span>
                  </button>
                </div>

                {/* TAB: Saisons & Épisodes (FOR SERIES ONLY) */}
                {isSeries && (detailsTab === "episodes" || detailsTab === "all") && (
                  <div className="w-full flex flex-col gap-4 pt-1">
                    {/* Season Selector Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101010]/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 relative">
                        <span className="text-xs uppercase font-sans text-zinc-400 font-semibold tracking-wider">Saison:</span>
                        
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                            className="flex items-center gap-2 bg-neutral-900 border border-amber-500/30 hover:border-amber-500/60 px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold text-amber-300 transition-colors cursor-pointer shadow-md"
                          >
                            <span>Saison {currentSeason}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isSeasonDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-44 bg-[#141414] border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 max-h-56 overflow-y-auto scrollbar-hide">
                              {seasonsList.length > 0 ? (
                                seasonsList.map((s: any) => (
                                  <button
                                    key={s.season_number}
                                    type="button"
                                    onClick={() => {
                                      setCurrentSeason(s.season_number);
                                      setIsSeasonDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-sans flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                                      currentSeason === s.season_number ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-zinc-300'
                                    }`}
                                  >
                                    <span>{s.name || `Saison ${s.season_number}`}</span>
                                    {s.episode_count ? (
                                      <span className="text-[10px] text-zinc-500">{s.episode_count} eps</span>
                                    ) : null}
                                  </button>
                                ))
                              ) : (
                                [1, 2, 3, 4, 5].map((sNum) => (
                                  <button
                                    key={sNum}
                                    type="button"
                                    onClick={() => {
                                      setCurrentSeason(sNum);
                                      setIsSeasonDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-sans flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                                      currentSeason === sNum ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-zinc-300'
                                    }`}
                                  >
                                    <span>Saison {sNum}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-xs font-sans text-zinc-400">
                        {isLoadingEpisodes ? (
                          <span className="flex items-center gap-1.5 text-zinc-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                            Chargement...
                          </span>
                        ) : (
                          <span>{episodesList.length} épisodes disponibles</span>
                        )}
                      </div>
                    </div>

                    {/* Episodes Grid/List */}
                    <div className="flex flex-col gap-2.5">
                      {isLoadingEpisodes ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 bg-[#101010]/40 rounded-xl border border-white/5">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                          <span className="text-xs text-zinc-400 font-sans">Chargement des épisodes de la saison {currentSeason}...</span>
                        </div>
                      ) : episodesList.length > 0 ? (
                        episodesList.map((ep: any) => {
                          const isPlayingThis = ep.episode_number === currentEpisode;
                          return (
                            <div
                              key={ep.episode_number}
                              onClick={() => handleEpisodeSelect(currentSeason, ep.episode_number)}
                              className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 rounded-xl border transition-all cursor-pointer ${
                                isPlayingThis
                                  ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/30"
                                  : "bg-[#111111]/70 hover:bg-[#181818] border-white/5 hover:border-white/15"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="relative shrink-0 w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-white/10">
                                {ep.stillUrl && ep.stillUrl.trim() ? (
                                  <img 
                                    src={ep.stillUrl.trim()} 
                                    alt={ep.name} 
                                    referrerPolicy="no-referrer" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                                    <Film className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-white/10">
                                  EP {ep.episode_number}
                                </div>
                                {isPlayingThis && (
                                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-black text-[11px] font-sans font-bold shadow-lg">
                                      <Play className="w-3 h-3 fill-black" /> En lecture
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className={`text-sm font-sans font-semibold truncate transition-colors ${isPlayingThis ? 'text-amber-300 font-bold' : 'text-zinc-200 group-hover:text-amber-400'}`}>
                                    {ep.episode_number}. {ep.name || `Épisode ${ep.episode_number}`}
                                  </h4>
                                  {ep.runtime ? (
                                    <span className="text-[11px] font-sans text-zinc-400 shrink-0">{ep.runtime} min</span>
                                  ) : null}
                                </div>
                                {ep.overview ? (
                                  <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                                    {ep.overview}
                                  </p>
                                ) : (
                                  <p className="text-xs text-zinc-500 italic font-sans">Pas de description disponible pour cet épisode.</p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-zinc-500 text-xs font-sans bg-[#101010]/40 rounded-xl border border-white/5">
                          Aucun épisode disponible pour cette saison.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 1: Synopsis & Vertical Details Card Side by Side */}
                {(detailsTab === "synopsis" || detailsTab === "all") && (
                  <div className="w-full flex flex-col lg:flex-row gap-5 items-stretch pt-1">
                    
                    {/* Left block: Story & Synopsis */}
                    <div className="flex-1 bg-[#101010]/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <h3 className="text-zinc-200 font-cinzel text-xs uppercase tracking-[2px] font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
                            Story & Synopsis
                          </h3>
                          {movieData?.tagline && (
                            <span className="text-xs text-amber-300/80 italic hidden sm:inline max-w-xs truncate font-sans">
                              "{movieData.tagline}"
                            </span>
                          )}
                        </div>
                        
                        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-sans font-normal">
                          {movieData?.description || "No synopsis available for this title."}
                        </p>
                      </div>

                      {/* Genre pills under synopsis */}
                      {movieData?.genre && movieData.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                          {movieData.genre.map((g: string, i: number) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/5 font-sans font-medium">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right block: Vertical Box for Specifications & Details */}
                    <div className="w-full lg:w-[260px] shrink-0 bg-[#101010]/85 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg flex flex-col gap-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <h3 className="text-zinc-200 font-cinzel text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold">
                          <Film className="w-3.5 h-3.5 text-amber-400" />
                          Details
                        </h3>
                        <span className="text-[10px] font-sans font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          4K UHD
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5 text-left font-sans">
                        {/* Director */}
                        <div className="flex items-center justify-between py-1 border-b border-white/5">
                          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Director</span>
                          <span className="text-xs font-sans font-semibold text-zinc-200 truncate max-w-[140px]" title={movieData?.director || "Not specified"}>
                            {movieData?.director || "Not specified"}
                          </span>
                        </div>

                        {/* Release Date */}
                        <div className="flex items-center justify-between py-1 border-b border-white/5">
                          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Release</span>
                          <span className="text-xs font-sans font-medium text-zinc-200">
                            {movieData?.releaseDate || movieData?.year || "Not specified"}
                          </span>
                        </div>

                        {/* Runtime */}
                        <div className="flex items-center justify-between py-1 border-b border-white/5">
                          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Runtime</span>
                          <span className="text-xs font-sans font-medium text-zinc-200">
                            {movieData?.duration ? `${movieData.duration}${String(movieData.duration).includes('m') ? '' : ' min'}` : "Standard"}
                          </span>
                        </div>

                        {/* TMDB Rating */}
                        <div className="flex items-center justify-between py-1 border-b border-white/5">
                          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Rating</span>
                          <div className="flex items-center gap-1">
                            <span className="text-amber-400 text-xs">★</span>
                            <span className="text-xs font-semibold text-amber-300">
                              {movieData?.voteAverage ? Number(movieData.voteAverage).toFixed(1) : (movieData?.rating || "8.2")}/10
                            </span>
                          </div>
                        </div>

                        {/* Audio / Quality */}
                        <div className="flex flex-col gap-1.5 pt-1">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Formats & Audio</span>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10 font-mono">HDR10</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10 font-mono">DOLBY 5.1</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10 font-mono">EN / FR SUB</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: More Like This (Horizontal Smooth Scrolling Carousel matching MovieDetailView) */}
                {(detailsTab === "similar" || detailsTab === "all" || detailsTab === "synopsis") && (
                  <div className="w-full space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-zinc-100 font-cinzel text-sm sm:text-base uppercase tracking-[2px] font-bold flex items-center gap-2">
                          <Film className="w-4 h-4 text-amber-400" />
                          More Like This
                        </h3>
                        <span className="text-[10px] font-sans font-semibold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          {similarMovies.length} titles
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          type="button"
                          onClick={() => { 
                            const el = document.getElementById('cinema-similar-scroll'); 
                            if (el) el.scrollBy({ left: -280, behavior: 'smooth' }); 
                          }} 
                          className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:text-amber-400 transition-colors cursor-pointer text-white"
                          title="Previous"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => { 
                            const el = document.getElementById('cinema-similar-scroll'); 
                            if (el) el.scrollBy({ left: 280, behavior: 'smooth' }); 
                          }} 
                          className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:text-amber-400 transition-colors cursor-pointer text-white"
                          title="Next"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {similarMovies.length > 0 ? (
                      <div 
                        id="cinema-similar-scroll"
                        className="flex overflow-x-auto gap-3 sm:gap-4 pb-3 no-scrollbar scroll-smooth w-full"
                      >
                        {similarMovies.map((sim: any) => (
                          <button
                            key={sim.id}
                            type="button"
                            onClick={() => handleSelectSimilar(sim.id)}
                            className="shrink-0 w-32 sm:w-36 group cursor-pointer text-left flex flex-col"
                          >
                            <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 relative border border-white/10 group-hover:border-amber-400/40 transition-all duration-300 shadow-lg">
                              {sim.posterUrl && sim.posterUrl.trim() ? (
                                <img 
                                  src={sim.posterUrl.trim()} 
                                  alt={sim.title} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <Film className="w-8 h-8" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                <span className="flex items-center gap-1.5 text-xs font-sans font-medium text-amber-400">
                                  <Play className="w-3.5 h-3.5 fill-amber-400" /> Watch
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-col min-w-0">
                              <h4 className="text-xs font-sans font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                                {sim.title}
                              </h4>
                              <div className="flex items-center justify-between text-[10px] font-sans text-zinc-400 mt-0.5">
                                <span>{sim.year || 'N/A'}</span>
                                {sim.voteAverage > 0 && (
                                  <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                                    ★ {Number(sim.voteAverage).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-zinc-500 font-sans text-xs">
                        No similar titles available.
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Right Column: Server Selection Sidebar (Desktop Only) */}
          <div 
            style={measuredPlayerHeight ? { height: `${measuredPlayerHeight}px` } : undefined}
            className="hidden xl:flex w-[250px] shrink-0 order-3 bg-[#101010]/85 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex-col gap-2 relative overflow-hidden self-start max-h-[472px] xl:max-h-none"
          >
            
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <h3 className="text-zinc-200 font-sans text-xs uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                Sources
              </h3>
              <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-white/10">
                <button 
                  onClick={() => {
                    setLanguage("en");
                    const cleanTmdb = String(passedMovieData?.tmdbId || fetchedDetails?.tmdbId || movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
                    const newServers = generateServers("en", isSeries, cleanTmdb, currentSeason, currentEpisode, cleanTmdb, "");
                    setAvailableServers(newServers);
                    handleSelectServer(0, newServers);
                  }} 
                  className={"w-5 h-3.5 rounded flex items-center justify-center transition-all cursor-pointer " + (language === "en" ? "opacity-100 ring-1 ring-amber-400/70 scale-105" : "opacity-35 hover:opacity-100")} 
                  title="English"
                >
                  <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-full h-full object-cover rounded-sm" />
                </button>
                <button 
                  onClick={() => {
                    setLanguage("fr");
                    const cleanTmdb = String(passedMovieData?.tmdbId || fetchedDetails?.tmdbId || movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
                    const newServers = generateServers("fr", isSeries, cleanTmdb, currentSeason, currentEpisode, cleanTmdb, "");
                    setAvailableServers(newServers);
                    handleSelectServer(0, newServers);
                  }} 
                  className={"w-5 h-3.5 rounded flex items-center justify-center transition-all cursor-pointer " + (language === "fr" ? "opacity-100 ring-1 ring-amber-400/70 scale-105" : "opacity-35 hover:opacity-100")} 
                  title="French"
                >
                  <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-full h-full object-cover rounded-sm" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-y-auto pr-0.5 scrollbar-hide">
              {availableServers && availableServers.length > 0 ? (
                availableServers.map((server, idx) => {
                  let serverName = server.name.split(' (')[0];
                  const isActive = serverSelected && activeServerIndex === idx;
                  return (
                    <button 
                      key={idx}
                      onClick={() => handleSelectServer(idx)}
                      className={`relative w-full flex items-center justify-between py-2 px-2.5 rounded-lg border transition-all duration-200 group overflow-hidden cursor-pointer ${
                        isActive 
                          ? 'bg-amber-500/15 border-amber-500/30 text-white shadow-sm' 
                          : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Play className={`w-3 h-3 transition-colors ${isActive ? 'text-amber-400 fill-amber-400' : 'text-zinc-500 group-hover:text-amber-400/80'}`} />
                        <span className={`text-xs font-sans transition-colors ${isActive ? 'text-amber-200 font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{serverName || `Server ${idx + 1}`}</span>
                      </div>
                      <span className={`text-[9px] tracking-wide font-sans transition-colors px-1.5 py-0.5 rounded font-medium ${isActive ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 bg-white/5'}`}>
                        HD
                      </span>

                      {/* Golden indicator line like the navbar active tab */}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                      )}
                    </button>
                  )
                })
              ) : null}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Server Selection Modal / Drawer */}
      {isMobileServerModalOpen && (
        <div className="fixed inset-0 z-[150] xl:hidden bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-[#121212] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                <h3 className="text-sm font-sans font-bold text-zinc-100 uppercase tracking-wider">Choisir un serveur</h3>
              </div>
              <div className="flex items-center gap-3">
                {/* Language selector in modal */}
                <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => {
                      setLanguage("en");
                      const cleanTmdb = String(passedMovieData?.tmdbId || fetchedDetails?.tmdbId || movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
                      const newServers = generateServers("en", isSeries, cleanTmdb, currentSeason, currentEpisode, cleanTmdb, "");
                      setAvailableServers(newServers);
                      handleSelectServer(0, newServers);
                    }} 
                    className={"w-6 h-4 rounded flex items-center justify-center transition-all cursor-pointer " + (language === "en" ? "opacity-100 ring-1 ring-amber-400/70 scale-105" : "opacity-40 hover:opacity-100")} 
                    title="English"
                  >
                    <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-full h-full object-cover rounded-sm" />
                  </button>
                  <button 
                    onClick={() => {
                      setLanguage("fr");
                      const cleanTmdb = String(passedMovieData?.tmdbId || fetchedDetails?.tmdbId || movieId).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
                      const newServers = generateServers("fr", isSeries, cleanTmdb, currentSeason, currentEpisode, cleanTmdb, "");
                      setAvailableServers(newServers);
                      handleSelectServer(0, newServers);
                    }} 
                    className={"w-6 h-4 rounded flex items-center justify-center transition-all cursor-pointer " + (language === "fr" ? "opacity-100 ring-1 ring-amber-400/70 scale-105" : "opacity-40 hover:opacity-100")} 
                    title="French"
                  >
                    <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-full h-full object-cover rounded-sm" />
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsMobileServerModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto py-1">
              {availableServers && availableServers.length > 0 ? (
                availableServers.map((server, idx) => {
                  let serverName = server.name.split(' (')[0];
                  const isActive = serverSelected && activeServerIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleSelectServer(idx);
                        setIsMobileServerModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold shadow-sm'
                          : 'bg-white/[0.03] border-white/5 text-zinc-300 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Play className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                        <span className="text-sm font-sans">{serverName || `Server ${idx + 1}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-sans font-semibold ${isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-zinc-400'}`}>
                          HD • {language.toUpperCase()}
                        </span>
                        {isActive && (
                          <span className="text-xs text-amber-400 font-sans font-medium">Actif</span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center text-zinc-500 text-xs font-sans">
                  Aucun serveur disponible pour cette configuration.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsMobileServerModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-sans text-xs font-semibold cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
