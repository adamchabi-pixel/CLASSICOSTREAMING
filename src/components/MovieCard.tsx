import React from "react";
import { Star, Play, Clock, CheckCircle, Info } from "lucide-react";
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
}

export default function MovieCard({ movie, onSelect, onPlay, progressPercent, trendingIndex, variant = "portrait" }: MovieCardProps) {
  if (!movie) return null;

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
    const posterSrc = (movie.posterUrl && movie.posterUrl.trim()) || (movie.backdropUrl && movie.backdropUrl.trim()) || null;

    return (
      <div
        id={`movie-card-${movie.id || 'item'}`}
        style={{
          "--hover-glow": `${movie.accentHex || "#fbbf24"}40`
        } as React.CSSProperties}
        className="relative w-full cursor-pointer group/card flex flex-col transition-all duration-300 ease-out"
        onClick={() => onSelect(movie)}
      >
        {/* Vertical Rectangle Poster Container with sharp corners (no border-radius) */}
        <div className="relative w-full aspect-[2/3] bg-neutral-900 border border-neutral-800/80 group-hover/card:border-amber-500/60 rounded-none overflow-hidden shadow-lg transition-all duration-300 will-change-transform group-hover/card:scale-[1.03]">
          {/* Status Badges */}
          {progressState === 'watched' && (
             <div className="absolute top-2 right-2 z-30 bg-black/75 rounded-none p-1 backdrop-blur-sm border border-green-500/40 shadow-md" title="Watched">
               <CheckCircle className="w-3.5 h-3.5 text-green-500" />
             </div>
          )}
          {progressState === 'ongoing' && (
             <div className="absolute top-2 right-2 z-30 bg-black/75 rounded-none p-1 backdrop-blur-sm border border-amber-500/40 shadow-md" title="In progress">
               <Clock className="w-3.5 h-3.5 text-amber-500" />
             </div>
          )}

          {/* Cinematic Poster Image */}
          {posterSrc ? (
            <img
              src={posterSrc}
              alt={movie.title || "Title"}
              className="w-full h-full object-cover rounded-none transition-transform duration-500 ease-out group-hover/card:scale-105"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (movie.backdropUrl && e.currentTarget.src !== movie.backdropUrl) {
                  e.currentTarget.src = movie.backdropUrl;
                } else {
                  e.currentTarget.style.display = 'none';
                }
              }}
            />
          ) : null}

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

          {/* Action buttons on hover */}
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
            {directorText && <span className="truncate">{directorText}</span>}
            {directorText && dateText && <span className="text-zinc-600 font-bold">•</span>}
            {dateText && <span className="shrink-0">{dateText}</span>}
            {!directorText && !dateText && <span>{movie.isTv ? "Series" : "Movie"}</span>}
          </p>
        </div>
      </div>
    );
  }

  const posterSrc = typeof movie.posterUrl === "string" && movie.posterUrl.trim().length > 0 ? movie.posterUrl.trim() : null;

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
          
          {progressState === 'watched' && (
             <div className="absolute top-2 right-2 z-30 bg-black/60 rounded-full p-1 backdrop-blur-sm border border-green-500/30" title="Watched">
               <CheckCircle className="w-4 h-4 text-green-500" />
             </div>
          )}
          {progressState === 'ongoing' && (
             <div className="absolute top-2 right-2 z-30 bg-black/60 rounded-full p-1 backdrop-blur-sm border border-amber-500/30" title="In progress">
               <Clock className="w-4 h-4 text-amber-500" />
             </div>
          )}

          {posterSrc ? (
            <img
              src={posterSrc}
              alt={movie.title || "Title"}
              className="w-full h-full object-cover transition-transform duration-700 ease-out "
              loading="lazy"
              decoding="async" referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          
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
                {getSubtitle()}
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
