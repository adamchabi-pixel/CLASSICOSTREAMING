import React, { useState, useEffect, useRef, useMemo } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "motion/react";

const safeStorage = {
  getItem: (key: string) => {
    try {
      return safeStorage.getItem(key);
    } catch(e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      safeStorage.setItem(key, value);
    } catch(e) {}
  },
  removeItem: (key: string) => {
    try {
      safeStorage.removeItem(key);
    } catch(e) {}
  }
};
const safeSession = {
  getItem: (key: string) => {
    try {
      return safeSession.getItem(key);
    } catch(e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      safeSession.setItem(key, value);
    } catch(e) {}
  },
  removeItem: (key: string) => {
    try {
      safeSession.removeItem(key);
    } catch(e) {}
  }
};
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Languages, 
  Maximize2, ArrowLeft, Loader2, Sparkles, AlertCircle, Captions, Lock, Menu, Cast, Settings, ChevronRight, ChevronLeft, X, ChevronDown
} from "lucide-react";
import EmbedPlayer from "./EmbedPlayer";
import { allMoviesData } from "../data/all_movies";

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
  onClose: () => void;
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
      {flagCode ? (
        <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt="" className="w-4 h-[11px] object-cover rounded-[1px] opacity-90" />
      ) : (
        <span className="text-[11px] leading-none opacity-80">🏳️</span>
      )}
      <span className="truncate">{name}</span>
    </span>
  );
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
  onClose
}: CinemaPlayerViewProps) {
  const deviceId = "CinemaAppClient";
  const apiKey = safeStorage.getItem("classico_jellyfin_apikey") || "";

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
  const [showServerNotice, setShowServerNotice] = useState(true);
  
  
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [forceJellyfin, setForceJellyfin] = useState(false);
    const [activeServerIndex, setActiveServerIndex] = useState(() => {
    try {
      // Check for per-movie/show server preference
      const savedStr = safeStorage.getItem("classico_progress");
      if (savedStr) {
        const saved = JSON.parse(savedStr) || {};
        let baseId = movieId;
        if (movieId && movieId.endsWith('-tv')) {
            baseId = movieId.replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
        }
        if (saved[baseId] && typeof saved[baseId].server_index === 'number') {
            return saved[baseId].server_index;
        }
        if (movieId && saved[movieId] && typeof saved[movieId].server_index === 'number') {
            return saved[movieId].server_index;
        }
      }
      
      const globalServer = safeStorage.getItem("classico_global_server_index");
      if (globalServer !== null) {
          const parsed = parseInt(globalServer, 10);
          return isNaN(parsed) ? 0 : parsed;
      }
    } catch(e) {}
    return 0;
  });
  const [serverSelected, setServerSelected] = useState(false);
  const [availableServers, setAvailableServers] = useState<{name: string, url: string, stars?: number}[]>([]);
  const [playing, setPlaying] = useState(true);
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
  const [adClicks, setAdClicks] = useState(0);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setPlayerLogs(prev => [...prev, `[${timestamp}] ${msg}`].slice(-8));
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastLoadedSourceRef = useRef<string | null>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
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
  }>({ movieId: null, forceTranscode: false, playbackAttempts: 0, isLowQuality: false, activeServerIndex: 0 });

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
          const baseId = movieId.replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
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
      playbackInfo &&       lastOpts.movieId === movieId &&       lastOpts.forceTranscode === forceTranscode &&       lastOpts.playbackAttempts === playbackAttempts &&       lastOpts.isLowQuality === isLowQuality && lastOpts.activeServerIndex === activeServerIndex
    ) {
      return;
    }

    let active = true;
    console.log("fetchPlayback triggered", {movieId, forceTranscode, playbackAttempts, isLowQuality, forceJellyfin});
    const fetchPlayback = async () => {
      if (!movieId || movieId === "undefined") {
        setIsLoading(false);
        setIsStreamLoading(false);
        setVideoError("Aucun ID de film valide n'a été fourni au lecteur cinéma.");
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
          const isNumeric = /^\d+$/.test(movieId);
          
          // Look up the movie in allMoviesData to get its tmdbId or imdbId
          let actualTmdbId = movieId;
          const matchedMovie = allMoviesData.find(m => m.id === movieId);
          if (matchedMovie) {
            actualTmdbId = matchedMovie.tmdbId || (matchedMovie.providerIds?.Tmdb) || movieId;
          }
          
          if (!forceJellyfin) {
            // ALWAYS use videasy now, even for jellyfin uuids, by using the looked up tmdbId
            console.log("Videasy ID resolution", {movieId, actualTmdbId, matchedMovie});
            let finalTmdbId = String(actualTmdbId);
            if (finalTmdbId.startsWith('tt') && matchedMovie?.tmdbId) {
                finalTmdbId = String(matchedMovie.tmdbId);
            }
            
            let iframeUrlVidrock = "";
            let iframeUrlPeach = "";
            let iframeUrlVideasy = "";
            let iframeUrlCinemaos = "";
            let cleanId = finalTmdbId;
            if (cleanId.endsWith('-tv')) cleanId = cleanId.replace('-tv', '');
            const timeParam = savedRestoreTimeRef.current > 0 ? `&t=${Math.floor(savedRestoreTimeRef.current)}` : "";
            
            if (isTv && season && episode) {
              iframeUrlVidrock = `https://vidlink.pro/tv/${cleanId}/${season}/${episode}?dummy=1${timeParam}`;
              iframeUrlPeach = `https://peachify.pro/embed/tv/${cleanId}/${season}/${episode}?accent=FF9900&servers=hide${timeParam}`;
              iframeUrlVideasy = `https://player.videasy.net/tv/${cleanId}/${season}/${episode}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true${timeParam}`;
              iframeUrlCinemaos = `https://cinemaos.live/watch/tv/${cleanId}?season=${season}&episode=${episode}${timeParam}`;
            } else {
              iframeUrlVidrock = `https://vidlink.pro/movie/${cleanId}?dummy=1${timeParam}`;
              iframeUrlPeach = `https://peachify.pro/embed/movie/${cleanId}?accent=FF9900&servers=hide${timeParam}`;
              iframeUrlVideasy = `https://player.videasy.net/movie/${cleanId}?color=FF9900&overlay=true${timeParam}`;
              iframeUrlCinemaos = `https://cinemaos.live/watch/movie/${cleanId}?dummy=1${timeParam}`;
            }
            const newServers = [
              { name: "Server 1", url: iframeUrlCinemaos, stars: 3 },
              { name: "Server 2", url: iframeUrlPeach, stars: 2 },
              { name: "Server 3", url: iframeUrlVideasy, stars: 2 },
              { name: "Server 4", url: iframeUrlVidrock, stars: 1 }
            ];
            setAvailableServers(newServers);
            
            const safeActiveIndex = activeServerIndex >= newServers.length ? 0 : activeServerIndex;

            const iframeResult = {
              id: movieId,
              streamUrl: newServers[safeActiveIndex].url,
              duration: 0,
              container: "iframe",
              title: "Film (Embed)",
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
            lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex };
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
                    let u1 = "", u2 = "", u3 = "", u4 = "";
                    const timeParam = savedRestoreTimeRef.current > 0 ? `&t=${Math.floor(savedRestoreTimeRef.current)}` : "";
                    if (itemData.Type === "Episode" && itemData.ParentIndexNumber && itemData.IndexNumber) {
                        u1 = `https://peachify.pro/embed/tv/${itemData.ProviderIds.Tmdb}/${itemData.ParentIndexNumber}/${itemData.IndexNumber}?accent=FF9900&servers=hide${timeParam}`;
                        u2 = `https://111movies.net/tv/${itemData.ProviderIds.Tmdb}/${itemData.ParentIndexNumber}/${itemData.IndexNumber}?dummy=1${timeParam}`; // Just in case, add ?dummy=1 for timeParam &t=
                        u3 = `https://player.videasy.net/tv/${itemData.ProviderIds.Tmdb}/${itemData.ParentIndexNumber}/${itemData.IndexNumber}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true${timeParam}`;
                        u4 = `https://cinemaos.live/watch/tv/${itemData.ProviderIds.Tmdb}?season=${itemData.ParentIndexNumber}&episode=${itemData.IndexNumber}${timeParam}`;
                    } else {
                        u1 = `https://peachify.pro/embed/movie/${itemData.ProviderIds.Tmdb}?accent=FF9900&servers=hide${timeParam}`;
                        u2 = `https://111movies.net/movie/${itemData.ProviderIds.Tmdb}?dummy=1${timeParam}`;
                        u3 = `https://player.videasy.net/movie/${itemData.ProviderIds.Tmdb}?color=FF9900&overlay=true${timeParam}`;
                        u4 = `https://cinemaos.live/watch/movie/${itemData.ProviderIds.Tmdb}?dummy=1${timeParam}`;
                    }
                    const srvs = [
                      { name: "Server 1", url: u3, stars: 3 },
                      { name: "Server 2", url: u4, stars: 2 },
                      { name: "Server 3", url: u1, stars: 2 },
                      { name: "Server 4", url: u2, stars: 1 }
                    ];
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
          lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex };
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
            const isTv = movieId.includes("-tv");
            const cleanId = movieId.replace("-tv", "");
            const timeParam = savedRestoreTimeRef.current > 0 ? `&t=${Math.floor(savedRestoreTimeRef.current)}` : "";
            
            let iframeUrlVidrock = "";
            let iframeUrlPeach = "";
            let iframeUrlVideasy = "";
            let iframeUrlCinemaos = "";
            
            if (isTv) {
              const tvState = JSON.parse(safeStorage.getItem("classico_tv_state") || "{}")[movieId] || {};
              const season = tvState.season || 1;
              const episode = tvState.episode || 1;
              iframeUrlVidrock = `https://vidlink.pro/tv/${cleanId}/${season}/${episode}?dummy=1${timeParam}`;
              iframeUrlPeach = `https://peachify.pro/embed/tv/${cleanId}/${season}/${episode}?accent=FF9900&servers=hide${timeParam}`;
              iframeUrlVideasy = `https://player.videasy.net/tv/${cleanId}/${season}/${episode}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true${timeParam}`;
              iframeUrlCinemaos = `https://cinemaos.live/watch/tv/${cleanId}?season=${season}&episode=${episode}${timeParam}`;
            } else {
              iframeUrlVidrock = `https://vidlink.pro/movie/${cleanId}?dummy=1${timeParam}`;
              iframeUrlPeach = `https://peachify.pro/embed/movie/${cleanId}?accent=FF9900&servers=hide${timeParam}`;
              iframeUrlVideasy = `https://player.videasy.net/movie/${cleanId}?color=FF9900&overlay=true${timeParam}`;
              iframeUrlCinemaos = `https://cinemaos.live/watch/movie/${cleanId}?dummy=1${timeParam}`;
            }
            
            const newServers = [
              { name: "Server 1", url: iframeUrlCinemaos, stars: 3 },
              { name: "Server 2", url: iframeUrlPeach, stars: 2 },
              { name: "Server 3", url: iframeUrlVideasy, stars: 2 },
              { name: "Server 4", url: iframeUrlVidrock, stars: 1 }
            ];

            const fallbackData = {
              id: movieId,
              streamUrl: "",
              duration: 0,
              container: "iframe",
              title: movieTitle || "Film",
              isDirect: false,
              iframeSrc: newServers[0].url,
              allServers: newServers,
              videoCodec: "h264",
              audioCodec: "aac",
              chosenPath: "Iframe Fallback",
              subtitles: [],
              audios: []
            };
            setPlaybackInfo(fallbackData as any);
            lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality, activeServerIndex };
            setVideoError(null);
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
  }, [movieId, forceTranscode, playbackAttempts, isLowQuality, forceJellyfin, activeServerIndex]);

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
              const baseId = movieId ? movieId.replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;
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
          
          if (isTv && season && episode) {
             const baseId = movieId ? movieId.replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;
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
      // 1. Peachify loading screen logic
      if (event.origin === 'https://peachify.pro') {
        if (event.data?.type === 'PLAYER_EVENT' && event.data.data?.event === 'play') {
          setIsIframeLoading(false);
        }
      }

      // 2. Existing progress tracking logic
      if (event.data && event.data.data) {
        let currentTime = undefined;
        let durationValue = undefined;
        let pSeason = season;
        let pEpisode = episode;
        let pIsTv = isTv;
        let pTmdbId = movieId ? movieId.replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;

        if (event.data.type === 'PLAYER_EVENT' && event.data.data && event.data.data.currentTime !== undefined) {
            currentTime = event.data.data.currentTime;
            durationValue = event.data.data.duration || duration || 0;
            if (event.data.data.mediaType === 'tv') pIsTv = true;
            if (event.data.data.tmdbId || event.data.data.id) pTmdbId = event.data.data.tmdbId || event.data.data.id;
            if (event.data.data.season) pSeason = event.data.data.season;
            if (event.data.data.episode) pEpisode = event.data.data.episode;
        } else if (event.data.type === 'MEDIA_DATA' && event.data.data && event.data.data.watched !== undefined) {
            currentTime = event.data.data.watched;
            durationValue = event.data.data.duration || duration || 0;
            if (event.data.data.mediaType === 'tv') pIsTv = true;
            if (event.data.data.tmdbId || event.data.data.id) pTmdbId = event.data.data.tmdbId || event.data.data.id;
            if (event.data.data.season) pSeason = event.data.data.season;
            if (event.data.data.episode) pEpisode = event.data.data.episode;
        }
        
        if (currentTime !== undefined) {
          try {
            savedRestoreTimeRef.current = currentTime;
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
                    progress: { watched: currentTime, duration: durationValue }
                };
            } else if (movieId) {
                saved[movieId] = { 
                  currentTime: currentTime, 
                  timestamp: Date.now(),
                  duration: durationValue,
                  server_index: activeServerIndex
                };
            }
            safeStorage.setItem("classico_progress", JSON.stringify(saved));
            
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
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playbackInfo, movieId, activeServerIndex]);

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



  if (!serverSelected && playbackInfo?.isIframeEmbed !== false) {
    if (availableServers.length === 0) {
      if (!isLoading && isMetadataLoaded) {
          // If we finished loading and still have no servers, just bypass to avoid hanging
          // BUT do not return null, instead pretend server is selected so we show player & ads
          setServerSelected(true);
          return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          );
      }
      return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      );
    }
    return (
      <div className="fixed inset-0 z-50 bg-neutral-900 flex flex-col justify-center items-center select-none cursor-default bg-cover bg-center" style={{ backgroundImage: `url(${movieBackdrop || ''})`}}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />
        
        {/* UPPER DECK (GO BACK) */}
        <div className="absolute top-0 left-0 right-0 p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] flex items-center justify-between z-[60] pointer-events-none">
          <div className="flex items-center gap-2"></div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClosePlayer}
              className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer backdrop-blur-md"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="z-10 w-full max-w-md bg-neutral-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 backdrop-blur-md relative pointer-events-auto mx-4">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Server Selection</h2>
            <p className="text-sm text-neutral-400">Choose a streaming server to launch the video.</p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-2 flex items-start gap-3">
              <div className="text-amber-500 mt-0.5">⚠️</div>
              <p className="text-xs text-amber-500/90 text-left leading-relaxed">
                For the best experience, we strongly recommend using an <strong>adblocker</strong> (like uBlock Origin or Brave Browser) to avoid unwanted popups.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {availableServers.map((server, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveServerIndex(idx);
                  
                  let targetUrl = server.url.replace(/&t=\d+/, "");
                  if (savedRestoreTimeRef.current > 0) {
                      targetUrl += `&t=${Math.floor(savedRestoreTimeRef.current)}`;
                  }
                  
                  if (playbackInfo) {
                    setPlaybackInfo({
                      ...playbackInfo,
                      iframeSrc: targetUrl,
                      streamUrl: targetUrl
                    });
                  }
                  setServerSelected(true);
                  safeStorage.setItem("classico_global_server_index", String(idx));
                  setIsIframeLoading(true);
                  setIframeKey(prev => prev + 1);
                }}
                className={`w-full p-4 rounded-xl flex items-center justify-between transition-all group border ${idx === 0 ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-white'}`}>
                    <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                  </div>
                  <span className={`font-medium ${idx === 0 ? 'text-amber-500' : 'text-white group-hover:text-amber-500'}`}>
                    {server.name}
                    {server.stars && <span className="ml-2 text-amber-500">{'★'.repeat(server.stars)}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-neutral-500'}`}></div>
                </div>
              </button>
            ))}
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center select-none overflow-hidden cursor-default">
      {/* AdGate Overlay (Shows after server is selected, hiding iframe until 3 clicks) */}
      {adClicks < 3 && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center pointer-events-auto overflow-y-auto">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-700/50 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-bold text-amber-500 mb-4 font-forum tracking-wide">Support Classico</h2>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
              Classico is free and will stay that way, but our servers cost a lot to maintain. The only way we can compensate is by including three ads per movie.
              <br /><br />
              <strong className="text-white">Please disable your ad-blocker to support us.</strong> Thank you immensely!
            </p>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 w-full mb-6">
              <p className="text-rose-400 text-xs font-mono uppercase tracking-wider">
                Don't click anything on the ads, just click on the X or change the tab.
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  window.open("https://omg10.com/4/11192957", "_blank");
                } catch(err) {}
                const newVal = adClicks + 1;
                setAdClicks(newVal);
              }}
              className="allow-popunder w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4 cursor-pointer block text-center"
            >
              <span>Click Ad</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Progress</span>
              <span className="text-amber-500 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded">{adClicks}/3</span>
            </div>
          </div>
          
          <button
            onClick={handleClosePlayer}
            className="absolute top-6 left-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-all backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      )}


      {/* INTERCEPTOR OVERLAY TO WAKE UP CONTROLS (IFRAME ONLY) */}
      {!controlsVisible && playbackInfo?.isIframeEmbed && (
        <div 
          className="absolute inset-0 z-[55] cursor-default pointer-events-auto"
          onPointerDown={() => {
            resetInactivityTimer();
          }}
        />
      )}
      
      {/* UPPER DECK (GO BACK & SERVERS) */}
      <div className={`absolute top-0 left-0 right-0 p-4 sm:p-6 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:pt-[calc(1.5rem+env(safe-area-inset-top))] flex items-center justify-between z-[60] pointer-events-none transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* LEFT: BACK + SERVER */}
        <div className="flex items-center gap-2 relative z-10 w-1/3">
          <button
            onClick={handleClosePlayer}
            className="pointer-events-auto p-2 sm:p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-all cursor-pointer flex items-center justify-center backdrop-blur-md"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {availableServers && availableServers.length > 1 && (
            <div className="relative">
              <button
                id="cinema-server-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowServerMenu(!showServerMenu);
                }}
                className={`pointer-events-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md bg-black/50 hover:bg-black/80 text-white border border-transparent`}
                title="Change Server"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap flex items-center gap-1">
                  {availableServers[activeServerIndex]?.name || 'Server'}
                  {availableServers[activeServerIndex]?.stars && <span className="text-amber-500">{'★'.repeat(availableServers[activeServerIndex]?.stars || 0)}</span>}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
              
              {showServerMenu && (
                <div id="cinema-server-menu" className="absolute top-full left-0 mt-2 min-w-[200px] bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl pointer-events-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-white/10 text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Playback Server
                  </div>
                  <div className="flex flex-col py-1">
                    {availableServers.map((server, idx) => (
                      <button
                        key={idx}
                                                onClick={(e) => {
                          e.stopPropagation();
                          setActiveServerIndex(idx);
                          
                          let targetUrl = server.url.replace(/&t=\d+/, "");
                          if (savedRestoreTimeRef.current > 0) {
                              targetUrl += `&t=${Math.floor(savedRestoreTimeRef.current)}`;
                          }
                          
                          if (playbackInfo) {
                            setPlaybackInfo({
                              ...playbackInfo,
                              iframeSrc: targetUrl,
                              streamUrl: targetUrl
                            });
                          }
                          safeStorage.setItem("classico_global_server_index", String(idx));
                          setServerSelected(true);
                          setIsIframeLoading(true);
                          setIframeKey(prev => prev + 1);
                          setShowServerMenu(false);
                        }}
                        className={`px-4 py-3 text-sm flex items-center gap-3 transition-colors ${activeServerIndex === idx ? 'bg-amber-500/10 text-amber-500' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${activeServerIndex === idx ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                        {server.name}
                        {server.stars && <span className="ml-auto text-amber-500 tracking-widest text-[10px]">{'★'.repeat(server.stars)}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* CENTER: TITLE (Removed) */}
        <div className="flex-1 flex justify-center items-center pointer-events-none w-1/3 absolute left-1/2 -translate-x-1/2">
        </div>
        
        {/* RIGHT: EMPTY / SPACING FOR AIRPLAY */}
        <div className="w-1/3 flex justify-end"></div>
      </div>

      {/* Loader overlay */}
      <div 
        className={`absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center gap-4 text-amber-500 transition-opacity duration-1000 ease-in-out ${(adClicks >= 3 && (isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading))) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={() => {
            setIsLoading(false);
            setIsStreamLoading(false);
            setIsIframeLoading(false);
            setServerSelected(false);
            setShowServerMenu(true);
          }}
          className="absolute top-6 left-6 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white transition-all cursor-pointer z-[70] border border-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Loader2 className={`w-10 h-10 ${(isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) ? 'animate-spin' : ''}`} />
        <div className="text-sm font-mono tracking-widest text-amber-500/80 uppercase">
          Connecting to server...
        </div>
      </div>
      
            {/* Server Notice */}
      {showServerNotice && adClicks >= 3 && playbackInfo && !isLoading && !isStreamLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[55] w-11/12 max-w-md pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 shadow-2xl">
            <div className="p-2 bg-amber-500/20 rounded-full text-amber-500 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-white/90 text-sm leading-snug font-medium">
                If the screen is black, buffering, or missing subtitles, try changing the server.
              </p>
            </div>
            <button 
              onClick={() => setShowServerNotice(false)}
              className="p-1.5 -mr-1.5 -mt-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Actual player/iframe */}
      {playbackInfo?.iframeSrc ? (
        <div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center pt-[max(env(safe-area-inset-top),44px)] md:pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${adClicks >= 3 ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
          <iframe
            key={`${playbackInfo.iframeSrc}-${iframeKey}`}
            src={playbackInfo.iframeSrc}
            sandbox={playbackInfo.iframeSrc?.includes('cinemaos.live') ? "allow-scripts allow-same-origin allow-forms" : undefined}
            referrerPolicy="no-referrer"
            allowFullScreen={true}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            onLoad={() => {
              setIsIframeLoading(false);
            }}
            className="w-full h-full border-0"
            // @ts-ignore
            webkitallowfullscreen="true"
            // @ts-ignore
            mozallowfullscreen="true"
            
          ></iframe>
        </div>
      ) : !isLoading && !isStreamLoading ? (
        <div className={`absolute inset-0 w-full h-full bg-black z-40 flex items-center justify-center ${adClicks >= 3 ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} ref={viewportRef}>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            controls
            autoPlay
            crossOrigin="anonymous"
          />
        </div>
      ) : null}
    </div>
  );
}
