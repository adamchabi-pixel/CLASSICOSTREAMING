import React from "react";
import { Star, Play, Clock, CheckCircle, Info, RotateCcw, Calendar } from "lucide-react";
import { Movie } from "../data";

interface MovieCardProps {
  key?: string;
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  layoutId?: string;
  progressPercent?: number; // Optional progress (0-1)
  trendingIndex?: number;
  variant?: "portrait" | "rectangular";
  hideBadge?: boolean;
  expandOnHover?: boolean;
  cardWidthClass?: string;
  priority?: boolean;
  onFinishWatching?: (movie: Movie) => void;
  onRestartWatching?: (movie: Movie) => void;
}

const optimizePosterUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // If it's a TMDB image that is requesting original, w1280, or w500, scale down to w342 for posters to dramatically speed up loading
  if (trimmed.includes("image.tmdb.org/t/p/original/")) {
    return trimmed.replace("/t/p/original/", "/t/p/w342/");
  }
  if (trimmed.includes("image.tmdb.org/t/p/w1280/")) {
    return trimmed.replace("/t/p/w1280/", "/t/p/w342/");
  }
  if (trimmed.includes("image.tmdb.org/t/p/w500/")) {
    return trimmed.replace("/t/p/w500/", "/t/p/w342/");
  }
  return trimmed;
};

const getMoviePoster = (movie: Movie): string | null => {
  if (!movie) return null;
  const title = (movie.title || (movie as any).name || "").toLowerCase().trim();
  const idStr = String(movie.id || "").toLowerCase();
  if (title === "lanterns" || idStr.includes("lanterns") || String(movie.tmdbId) === "95350") {
    return "https://image.tmdb.org/t/p/w500/gpC7h43xPMEV3goYMQShfJbTtLq.jpg";
  }
  return optimizePosterUrl(movie.posterUrl) || optimizePosterUrl(movie.backdropUrl) || null;
};

// Known future unreleased movies with verified ISO release dates (YYYY-MM-DD)
export const KNOWN_UPCOMING_DATES: Record<string, string> = {
  "avengers: doomsday": "2026-12-15",
  "werwulf": "2026-12-25",
  "the batman: part ii": "2028-02-17",
  "the batman part ii": "2028-02-17",
  "shrek 5": "2027-06-30",
  "avengers: secret wars": "2027-12-15",
  "dune: messiah": "2026-12-18",
};

export const formatReleaseDate = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split("-");
    if (parts.length >= 1) {
      const year = parseInt(parts[0], 10);
      const month = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : null;
      const day = parts.length >= 3 ? parseInt(parts[2], 10) : null;
      if (month !== null && !isNaN(month)) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        if (day !== null && !isNaN(day)) {
          return `${day} ${monthNames[month]} ${year}`;
        }
        return `${monthNames[month]} ${year}`;
      }
      return String(year);
    }
  } catch {
    return dateStr;
  }
  return dateStr;
};

export const getNotOutYetInfo = (movie: Movie): { isNotOut: boolean; releaseLabel: string | null } => {
  if (!movie) return { isNotOut: false, releaseLabel: null };

  // If already available on the streaming server (e.g. Jellyfin) or streamable, it is definitely already out!
  if (movie.isJellyfin || movie.streamUrl) {
    return { isNotOut: false, releaseLabel: null };
  }

  // Get current date string in YYYY-MM-DD format dynamically
  const now = new Date();
  const yearStr = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, "0");
  const dayStr = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yearStr}-${monthStr}-${dayStr}`;

  const titleLower = (movie.title || (movie as any).name || "").toLowerCase().trim();
  const statusLower = (movie.status || "").toLowerCase().trim();

  // If status is "Released", the film is released unless an explicit future releaseDate is provided
  if (statusLower === "released") {
    if (!movie.releaseDate || movie.releaseDate <= todayStr) {
      return { isNotOut: false, releaseLabel: null };
    }
  }

  // 1. Check exact movie releaseDate dynamically against todayStr:
  // If releaseDate has passed or is today, it is OUT -> automatically returns isNotOut: false!
  if (movie.releaseDate) {
    if (movie.releaseDate > todayStr) {
      return { isNotOut: true, releaseLabel: formatReleaseDate(movie.releaseDate) };
    }
    return { isNotOut: false, releaseLabel: null };
  }

  // 2. Check known upcoming future releases map
  for (const [key, dateStr] of Object.entries(KNOWN_UPCOMING_DATES)) {
    if (titleLower === key || titleLower.includes(key)) {
      if (dateStr > todayStr) {
        return { isNotOut: true, releaseLabel: formatReleaseDate(dateStr) };
      }
      return { isNotOut: false, releaseLabel: null };
    }
  }

  // 3. Check explicitly unreleased production status
  if (["in production", "post production", "planned", "upcoming", "unreleased"].includes(statusLower)) {
    if (movie.year && movie.year > now.getFullYear()) {
      return { isNotOut: true, releaseLabel: String(movie.year) };
    }
    return { isNotOut: true, releaseLabel: "Coming Soon" };
  }

  return { isNotOut: false, releaseLabel: null };
};

export default function MovieCard({
  movie,
  onSelect,
  onPlay,
  progressPercent,
  trendingIndex,
  variant = "rectangular",
  hideBadge = false,
  expandOnHover = false,
  cardWidthClass,
  priority = false,
  onFinishWatching,
  onRestartWatching
}: MovieCardProps) {
  if (!movie) return null;

  const [isHovered, setIsHovered] = React.useState(false);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const { isNotOut, releaseLabel } = React.useMemo(() => getNotOutYetInfo(movie), [movie]);

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!expandOnHover) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!expandOnHover) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  React.useEffect(() => {
    if (!isHovered) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const cardEl = document.getElementById(`movie-card-${movie.id || 'item'}`);
      if (cardEl && !cardEl.contains(e.target as Node)) {
        setIsHovered(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isHovered, movie.id]);

  const progressState = React.useMemo(() => {
    if (typeof progressPercent === "number") {
      if (progressPercent >= 0.95) return 'watched';
      if (progressPercent > 0) return 'ongoing';
      return 'none';
    }
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = movie.id ? String(movie.id).replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;
      if (baseId && saved[baseId]) {
         if (movie.isTv) {
            return 'none';
         } else {
            const duration = saved[baseId].duration || 0;
            const current = saved[baseId].currentTime || 0;
            if (duration > 0) {
               if (current / duration >= 0.95) return 'watched';
               if (current / duration > 0) return 'ongoing';
            }
         }
      }
    } catch(e) {}
    return 'none';
  }, [movie.id, movie.isTv, progressPercent]);

  const getSubtitle = () => {
    if (movie.director && typeof movie.director === "string" && movie.director.trim() !== "" && movie.director !== "Unknown") {
      return movie.director;
    }
    return movie.isTv ? "Series" : "Movie";
  };

  const directorText = movie.director && typeof movie.director === "string" && movie.director.trim() !== "" && movie.director !== "Unknown"
    ? movie.director.trim()
    : "";

  const dateText = movie.year
    ? String(movie.year)
    : ((movie as any).releaseDate ? (movie as any).releaseDate.split("-")[0] : "");

  // If rectangular variant, vertical rectangle with sharp corners (unrounded / rounded-none)
  // With title in white below, and director and date directly underneath
  if (variant === "rectangular") {
    const posterSrc = getMoviePoster(movie);
    const baseWidth = cardWidthClass || "w-[145px] min-[400px]:w-[165px] sm:w-[195px] md:w-[215px]";

    return (
      <div
        id={`movie-card-${movie.id || 'item'}`}
        style={{
          "--hover-glow": `${movie.accentHex || "#fbbf24"}40`
        } as React.CSSProperties}
        className={`relative ${expandOnHover ? "flex flex-row items-start" : "w-full flex flex-col"} select-none`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Main Movie Poster Column */}
        <div
          className={`${expandOnHover ? baseWidth : "w-full"} shrink-0 cursor-pointer group/card flex flex-col transition-all duration-300 ease-out`}
          onClick={(e) => {
            if (expandOnHover && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
              if (!isHovered) {
                e.stopPropagation();
                setIsHovered(true);
                return;
              }
            }
            onSelect(movie);
          }}
        >
          {/* Vertical Rectangle Poster Container with sharp corners (no border-radius) */}
          <div className="relative w-full aspect-[2/3] bg-neutral-900 border border-neutral-800/80 group-hover/card:border-amber-500/60 rounded-none overflow-hidden shadow-lg transition-all duration-300 will-change-transform group-hover/card:scale-[1.02]">
            {/* Status Badges */}
            {!hideBadge && progressState === 'watched' && (
               <div className="absolute top-2 right-2 z-30 bg-black/75 rounded-none p-1 backdrop-blur-sm border border-green-500/40 shadow-md" title="Watched">
                 <CheckCircle className="w-3.5 h-3.5 text-green-500" />
               </div>
            )}
            {!hideBadge && progressState === 'ongoing' && (
               <div className="absolute top-2 right-2 z-30 bg-black/75 rounded-none p-1 backdrop-blur-sm border border-amber-500/40 shadow-md" title="In progress">
                 <Clock className="w-3.5 h-3.5 text-amber-500" />
               </div>
            )}

            {/* Subtle animated skeleton background while image is downloading */}
            {!isImageLoaded && posterSrc && (
              <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-amber-500/40 text-[10px] font-mono">
                  ★
                </div>
              </div>
            )}

            {/* Cinematic Poster Image */}
            {posterSrc ? (
              <img
                src={posterSrc}
                alt={movie.title || "Title"}
                className={`w-full h-full object-cover rounded-none transition-all duration-300 ease-out group-hover/card:scale-105 ${
                  isImageLoaded 
                    ? (isNotOut ? "opacity-75 grayscale-[35%] contrast-[0.95] group-hover/card:opacity-90 group-hover/card:grayscale-[15%]" : "opacity-100") 
                    : "opacity-0"
                }`}
                loading="eager"
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setIsImageLoaded(true)}
                onError={(e) => {
                  setIsImageLoaded(true);
                  const currentSrc = e.currentTarget.src;
                  const title = (movie.title || (movie as any).name || "").toLowerCase().trim();
                  if (title === "lanterns" || String(movie.id).includes("lanterns")) {
                    if (!currentSrc.includes("j9PTWG0Xn0NeIRhGGFJbciNYWvS")) {
                      e.currentTarget.src = "https://image.tmdb.org/t/p/w500/j9PTWG0Xn0NeIRhGGFJbciNYWvS.jpg";
                      return;
                    }
                  }
                  if (movie.backdropUrl && currentSrc !== movie.backdropUrl) {
                    e.currentTarget.src = optimizePosterUrl(movie.backdropUrl) || movie.backdropUrl;
                  } else if (movie.posterUrl && currentSrc !== movie.posterUrl) {
                    e.currentTarget.src = optimizePosterUrl(movie.posterUrl) || movie.posterUrl;
                  }
                }}
              />
            ) : null}

            {/* NOT OUT YET Overlay Badge */}
            {isNotOut && (
              <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="px-2.5 py-1.5 bg-black/85 backdrop-blur-md border border-amber-500/60 shadow-[0_4px_25px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center gap-0.5 rounded-none max-w-[95%]">
                  <span className="text-[10px] min-[400px]:text-[11px] font-black tracking-widest text-amber-400 font-['Montserrat',sans-serif] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
                    NOT OUT YET
                  </span>
                  {releaseLabel && (
                    <span className="text-[8.5px] min-[400px]:text-[9.5px] font-semibold tracking-wide text-zinc-300 flex items-center gap-1 font-mono whitespace-nowrap">
                      <Calendar className="w-2.5 h-2.5 text-amber-400/90 shrink-0" />
                      <span>{releaseLabel}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder if no image */}
            <div className={`absolute inset-0 flex flex-col justify-between rounded-none ${!posterSrc ? (movie.gradient || 'bg-gradient-to-br from-zinc-900 to-neutral-950') : ''}`}>
              {!posterSrc && (
                <div className="flex flex-col items-center justify-center flex-grow py-4 text-center">
                  <div className="w-12 h-12 rounded-none flex items-center justify-center bg-black/30 border border-white/10 shadow-inner">
                    <span className="text-lg font-bold tracking-tighter text-white/40">C</span>
                  </div>
                </div>
              )}
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000" />

            {/* Darkened overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/35 transition-colors duration-200 pointer-events-none" />

            {/* Action buttons on hover if expandOnHover is disabled */}
            {!expandOnHover && (
              <div className="absolute inset-0 z-25 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(movie);
                    }}
                    className="pointer-events-auto p-2.5 rounded-none bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                    title="Play"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(movie);
                    }}
                    className="pointer-events-auto p-2.5 rounded-none bg-black/80 hover:bg-black text-white border border-white/20 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                    title="Details & Info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick action bar directly on poster hover for resume watching items */}
            {(onFinishWatching || onRestartWatching) && (
              <div className="absolute inset-x-0 bottom-2 z-30 flex items-center justify-center gap-1.5 px-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 pointer-events-none">
                {onFinishWatching && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFinishWatching(movie);
                    }}
                    className="pointer-events-auto flex-1 py-1 px-1 bg-black/90 hover:bg-emerald-950 border border-emerald-500/80 text-emerald-300 hover:text-white text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg backdrop-blur-sm active:scale-95 cursor-pointer"
                    title="Finish Watching"
                  >
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Finish</span>
                  </button>
                )}
                {onRestartWatching && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestartWatching(movie);
                    }}
                    className="pointer-events-auto flex-1 py-1 px-1 bg-black/90 hover:bg-amber-950 border border-amber-500/80 text-amber-300 hover:text-white text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg backdrop-blur-sm active:scale-95 cursor-pointer"
                    title="Restart"
                  >
                    <RotateCcw className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span className="truncate">Restart</span>
                  </button>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {typeof progressPercent === 'number' && progressPercent > 0 && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-zinc-800 z-30">
                <div 
                  className="h-full bg-amber-500 rounded-none shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.min(Math.max(progressPercent * 100, 0), 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Trending Number Indicator at corner */}
          {trendingIndex !== undefined && (
            <div
              className={`absolute bottom-10 ${trendingIndex === 1 ? "-right-4 sm:-right-6" : "-right-6 sm:-right-8"} z-30 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,1)] transition-transform duration-300 origin-bottom-right pr-2 pb-1`}
              style={{
                fontSize: "clamp(3.5rem, 5vw, 5.5rem)",
                lineHeight: "0.8"
              }}
            >
              {trendingIndex}
            </div>
          )}

          {/* Underneath: Title in pure white, Director & Date just below */}
          <div className="pt-2 px-0.5 text-left select-none space-y-0.5">
            <h4 
              className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-1 group-hover/card:text-amber-400 transition-colors drop-shadow-sm font-sans"
              title={movie.title || movie.originalTitle}
            >
              {movie.title || movie.originalTitle || "Movie"}
            </h4>
            <p className="text-xs text-zinc-400 font-sans truncate flex items-center gap-1.5">
              <span className="truncate">{directorText || (movie.isTv ? "Series" : "Movie")}</span>
              <span className="text-zinc-600 font-bold">•</span>
              {isNotOut ? (
                <span className="text-amber-400/95 font-mono text-[10px] tracking-wider uppercase font-semibold shrink-0">
                  {releaseLabel ? releaseLabel : "Coming Soon"}
                </span>
              ) : (
                dateText && <span className="shrink-0">{dateText}</span>
              )}
            </p>
          </div>
        </div>

        {/* Expandable Description Rectangle on Hover - exact same size as poster */}
        {expandOnHover && (
          <div
            className={`transition-[width,opacity,margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex flex-col shrink-0 will-change-[width,opacity] transform-gpu pointer-events-none ${
              isHovered
                ? `${baseWidth} opacity-100 ml-2 sm:ml-3 !pointer-events-auto`
                : "w-0 opacity-0 ml-0"
            }`}
          >
            <div
              onClick={() => onSelect(movie)}
              className={`${baseWidth} aspect-[2/3] shrink-0 bg-[#121214] border border-amber-500/40 hover:border-amber-400/80 rounded-none shadow-[0_10px_35px_rgba(0,0,0,0.9)] p-2 sm:p-2.5 flex flex-col justify-between text-left cursor-pointer relative overflow-hidden group/detail transition-colors`}
            >
              {/* Top reflection sheen line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

              {/* Header: Genre, Rating & Title */}
              <div className="space-y-0.5 shrink-0">
                <div className="flex items-center justify-between gap-1 text-[9px] font-mono text-zinc-400">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[8px] sm:text-[9px] truncate">
                    {Array.isArray(movie.genre) ? movie.genre[0] : (movie.genre || (movie.isTv ? "Series" : "Movie"))}
                  </span>
                  {(movie.voteAverage || movie.rating) && (
                    <span className="flex items-center gap-0.5 font-bold text-zinc-200 shrink-0 text-[8px] sm:text-[9px]">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {movie.voteAverage || movie.rating}
                    </span>
                  )}
                </div>

                <h4 className="text-[11px] sm:text-xs font-bold text-white font-cinzel line-clamp-1 leading-tight tracking-wide group-hover/detail:text-amber-400 transition-colors">
                  {movie.title}
                </h4>

                <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] font-mono text-zinc-400">
                  {dateText && <span>{dateText}</span>}
                  {movie.duration && <span>• {movie.duration}</span>}
                  {movie.isTv && <span>• Series</span>}
                </div>
              </div>

              {/* Middle: Description with ellipsis if too long */}
              <div className="my-auto py-0.5 overflow-hidden">
                <p className={`text-[9px] sm:text-[10px] text-zinc-300 leading-snug font-sans overflow-hidden text-ellipsis ${
                  (onFinishWatching || onRestartWatching) ? "line-clamp-2" : "line-clamp-4 sm:line-clamp-5"
                }`}>
                  {movie.description || (movie as any).overview || "No synopsis available."}
                </p>
              </div>

              {/* Bottom: Quick Play & Info Buttons */}
              <div className="pt-1.5 flex flex-col gap-1 border-t border-white/10 shrink-0 w-full">
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlay) onPlay(movie);
                      else onSelect(movie);
                    }}
                    className="flex-1 py-1 px-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1 transition-colors shadow-md active:scale-95 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current shrink-0" />
                    <span>Watch</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(movie);
                    }}
                    className="p-1 sm:p-1.5 bg-neutral-800 hover:bg-neutral-700 text-zinc-300 hover:text-white rounded-none border border-white/10 transition-colors cursor-pointer shrink-0"
                    title="Details & Info"
                  >
                    <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                {/* Les deux encadrés: Finish Watching & Restart Buttons requested by user */}
                {(onFinishWatching || onRestartWatching) && (
                  <div className="flex flex-col gap-1 w-full pt-0.5">
                    {onFinishWatching && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFinishWatching(movie);
                        }}
                        className="w-full py-0.5 sm:py-1 px-1.5 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/80 hover:border-emerald-400 text-emerald-300 hover:text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                        title="Finish Watching"
                      >
                        <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                        <span className="whitespace-nowrap">Finish Watching</span>
                      </button>
                    )}
                    {onRestartWatching && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestartWatching(movie);
                        }}
                        className="w-full py-0.5 sm:py-1 px-1.5 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/80 hover:border-amber-400 text-amber-300 hover:text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                        title="Restart from Beginning"
                      >
                        <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
                        <span className="whitespace-nowrap">Restart</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom glowing golden signature line */}
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_rgba(245,158,11,0.7)] pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    );
  }

  const posterSrc = getMoviePoster(movie);

  return (
    <div
      id={`movie-card-${movie.id || 'item'}`}
      style={{
        "--hover-glow": `${movie.accentHex || "#fbbf24"}40`
      } as React.CSSProperties}
      className="relative w-full h-full cursor-pointer group/card transition-all duration-300 ease-out will-change-transform hover:scale-[1.05]"
      onClick={() => onSelect(movie)}
    >
      {/* Poster Container */}
      <div className="absolute inset-0 z-10 bg-neutral-900 border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg transition-all duration-300">
        
        {/* Cinematic Poster Image or Gradient Placeholder */}
        <div className="absolute inset-0 select-none">
          
          {!hideBadge && progressState === 'watched' && (
             <div className="absolute top-2 right-2 z-30 bg-black/60 rounded-full p-1 backdrop-blur-sm border border-green-500/30" title="Watched">
               <CheckCircle className="w-4 h-4 text-green-500" />
             </div>
          )}
          {!hideBadge && progressState === 'ongoing' && (
             <div className="absolute top-2 right-2 z-30 bg-black/60 rounded-full p-1 backdrop-blur-sm border border-amber-500/30" title="In progress">
               <Clock className="w-4 h-4 text-amber-500" />
             </div>
          )}

          {/* Subtle animated skeleton background while image is downloading */}
          {!isImageLoaded && posterSrc && (
            <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-amber-500/40 text-[10px] font-mono">
                ★
              </div>
            </div>
          )}

          {posterSrc ? (
            <img
              src={posterSrc}
              alt={movie.title || "Title"}
              className={`w-full h-full object-cover transition-all duration-300 ease-out ${
                isImageLoaded 
                  ? (isNotOut ? "opacity-75 grayscale-[35%] contrast-[0.95] group-hover/card:opacity-90 group-hover/card:grayscale-[15%]" : "opacity-100") 
                  : "opacity-0"
              }`}
              loading="eager"
              fetchPriority={priority ? "high" : "auto"}
              decoding="async" referrerPolicy="no-referrer"
              onLoad={() => setIsImageLoaded(true)}
              onError={(e) => {
                setIsImageLoaded(true);
                const currentSrc = e.currentTarget.src;
                const title = (movie.title || (movie as any).name || "").toLowerCase().trim();
                if (title === "lanterns" || String(movie.id).includes("lanterns")) {
                  if (!currentSrc.includes("j9PTWG0Xn0NeIRhGGFJbciNYWvS")) {
                    e.currentTarget.src = "https://image.tmdb.org/t/p/w500/j9PTWG0Xn0NeIRhGGFJbciNYWvS.jpg";
                    return;
                  }
                }
                if (movie.backdropUrl && currentSrc !== movie.backdropUrl) {
                  e.currentTarget.src = optimizePosterUrl(movie.backdropUrl) || movie.backdropUrl;
                } else if (movie.posterUrl && currentSrc !== movie.posterUrl) {
                  e.currentTarget.src = optimizePosterUrl(movie.posterUrl) || movie.posterUrl;
                }
              }}
            />
          ) : null}

          {/* NOT OUT YET Badge Overlay */}
          {isNotOut && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-25 flex flex-col items-center justify-center text-center pointer-events-none">
              <div className="w-auto max-w-[90%] px-3 py-1.5 bg-black/85 backdrop-blur-md border border-amber-500/60 shadow-[0_4px_25px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center gap-0.5 rounded-lg">
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-400 font-['Montserrat',sans-serif] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
                  NOT OUT YET
                </span>
                {releaseLabel && (
                  <span className="text-[8.5px] sm:text-[9.5px] font-semibold tracking-wide text-zinc-300 flex items-center gap-1 font-mono whitespace-nowrap">
                    <Calendar className="w-2.5 h-2.5 text-amber-400/90 shrink-0" />
                    <span>{releaseLabel}</span>
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className={`absolute inset-0 flex flex-col justify-between ${!posterSrc ? (movie.gradient || 'bg-gradient-to-br from-zinc-900 to-neutral-950') : ''}`}>
            
            {!posterSrc && (
              <div className="flex flex-col items-center justify-center flex-grow py-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-black/30 border border-white/5 shadow-inner">
                  <span className="text-xl font-bold tracking-tighter text-white/40">C</span>
                </div>
              </div>
            )}
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000" />
          
          {/* Persistent Gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Quick Info/Details Button Overlay */}
          <div className="absolute inset-0 z-25 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(movie);
              }}
              className="pointer-events-auto px-3.5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all duration-200 hover:scale-105 cursor-pointer font-['Montserrat',sans-serif]"
              title="View details and information"
            >
              <Info className="w-3.5 h-3.5 fill-current" />
              <span>Details & Info</span>
            </button>
          </div>

          {/* Info Layer */}
          <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 z-20">
            {/* Always visible base info */}
            <div className="space-y-1 transform transition-transform duration-300">
              <p className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {isNotOut ? (releaseLabel ? `Unreleased • ${releaseLabel}` : "NOT OUT YET") : getSubtitle()}
              </p>
              <h3 className="text-sm sm:text-base font-display font-extrabold text-white leading-tight line-clamp-2 drop-shadow-lg">
                {movie.title || movie.originalTitle || "Movie"}
              </h3>
            </div>


          </div>
        </div>
                
        {/* Progress Bar */}
        {typeof progressPercent === 'number' && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-zinc-800 z-30">
            <div 
              className="h-full bg-amber-500 rounded-r-sm shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${Math.min(Math.max(progressPercent * 100, 0), 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Trending Number Indicator */}
      {trendingIndex !== undefined && (
        <div className={`absolute -bottom-1 sm:-bottom-2 ${trendingIndex === 1 ? "-right-6 sm:-right-10" : "-right-8 sm:-right-12"} z-50 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,1)] transition-transform duration-300 origin-bottom-right pr-3 pb-2`}
             style={{
                fontSize: "clamp(5.5rem, 8vw, 9rem)",
                lineHeight: "0.8"
             }}>
          {trendingIndex}
        </div>
      )}
    </div>
  );
}
