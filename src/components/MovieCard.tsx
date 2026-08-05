import React from "react";
import { Star, Play, Clock, CheckCircle } from "lucide-react";
import { Movie } from "../data";

interface MovieCardProps {
  key?: string;
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  layoutId?: string;
  progressPercent?: number; // Optional progress (0-1)
  trendingIndex?: number;
}

export default function MovieCard({ movie, onSelect, onPlay, progressPercent, trendingIndex }: MovieCardProps) {
  
  const progressState = React.useMemo(() => {
    if (typeof progressPercent === "number") {
      if (progressPercent >= 0.95) return 'watched';
      if (progressPercent > 0) return 'ongoing';
      return 'none';
    }
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = movie.id ? movie.id.replace(/-tv$/, "").replace(/-S\d+E\d+$/, "") : null;
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
    if (movie.director && movie.director.trim() !== "" && movie.director !== "Unknown") {
      return movie.director;
    }
    return movie.isTv ? "Série" : "Film";
  };

  return (
    <div
      id={`movie-card-${movie.id}`}
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

          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out "
              loading="lazy"
              decoding="async" referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          
          <div className={`absolute inset-0 flex flex-col justify-between ${!movie.posterUrl ? (movie.gradient || 'bg-gradient-to-br from-zinc-900 to-neutral-950') : ''}`}>
            
            {!movie.posterUrl && (
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

          {/* Info Layer */}
          <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 z-20">
            {/* Always visible base info */}
            <div className="space-y-1 transform transition-transform duration-300">
              <p className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {getSubtitle()}
              </p>
              <h3 className="text-sm sm:text-base font-display font-extrabold text-white leading-tight line-clamp-2 drop-shadow-lg">
                {movie.title}
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
