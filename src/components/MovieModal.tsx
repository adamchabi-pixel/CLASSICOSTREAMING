import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Play, Star, Clock, User, Film, Info, 
  Volume2, VolumeX, Pause, RotateCcw, Captions,
  Maximize2, Check, Plus, AlertCircle, Sparkles, ArrowLeft, Loader2
} from "lucide-react";
import { Movie } from "../data";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  startAsPlaying?: boolean;
  onPlay: (id: string) => void;
  onSimilarClick?: (id: string) => void;
}

export default function MovieModal({ 
  movie, 
  onClose, 
   
  
  startAsPlaying = false,
  onPlay,
  onSimilarClick
}: MovieModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fullMovie, setFullMovie] = useState<Movie | null>(null);

  useEffect(() => {
    setFullMovie(movie);
    if (!movie) return;
    const tmdbIdCandidate = movie.providerIds?.Tmdb || movie.tmdbId;
    const isTvCandidate = movie.isTv;
    
    const fetchMovieDetails = async () => {
      let data = null;
      try {
        const movieIdToFetch = tmdbIdCandidate ? (isTvCandidate ? tmdbIdCandidate + "-tv" : tmdbIdCandidate) : movie.id;
        if (movieIdToFetch) {
          const res = await fetch(`/api/movie/${movieIdToFetch}`);
          if (!res.ok) throw new Error("HTTP " + res.status);
          const text = await res.text();
          data = JSON.parse(text);
          if (data && data.success && data.movie) {
            setFullMovie(prev => prev ? {...prev, ...data.movie} : data.movie);
            return;
          }
        }
      } catch (err) {
        console.error("Movie API failed, trying direct TMDB fallback:", err);
      }
      
      // Fallback for static deployments
      if (tmdbIdCandidate) {
        const actualId = tmdbIdCandidate.toString();
        const tmdbToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
        const url = isTvCandidate 
          ? `https://api.tmdb.org/3/tv/${actualId}?append_to_response=credits,similar,images&include_image_language=en,null&language=en-US` 
          : `https://api.tmdb.org/3/movie/${actualId}?append_to_response=credits,similar,images&include_image_language=en,null&language=en-US`;
        try {
          const tmdbRes = await fetch(url, { headers: { Authorization: `Bearer ${tmdbToken}`, Accept: "application/json" } });
          if (!tmdbRes.ok) return;
          const m = await tmdbRes.json();
          if (m.id) {
            const castDetails = m.credits?.cast?.slice(0, 8).map((c: any) => ({
               id: String(c.id),
               name: c.name,
               role: c.character,
               imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : undefined
            })) || [];
            const similar = m.similar?.results?.slice(0, 8).map((sm: any) => ({
               id: String(sm.id) + (isTvCandidate ? "-tv" : ""),
               tmdbId: String(sm.id),
               isTv: isTvCandidate,
               title: isTvCandidate ? sm.name : sm.title,
               description: sm.overview,
               posterUrl: sm.poster_path ? `https://image.tmdb.org/t/p/w500${sm.poster_path}` : "",
               backdropUrl: sm.backdrop_path ? `https://image.tmdb.org/t/p/w780${sm.backdrop_path}` : "",
               year: sm.release_date ? parseInt(sm.release_date.split("-")[0]) : (sm.first_air_date ? parseInt(sm.first_air_date.split("-")[0]) : 0)
            })) || [];
            const logos = m.images?.logos || [];
            const bestLogo = logos.find((l: any) => l.iso_639_1 === 'en') || logos[0];
            const logoUrl = bestLogo ? `https://image.tmdb.org/t/p/w500${bestLogo.file_path}` : "";
            const director = m.credits?.crew?.find((c: any) => c.job === 'Director')?.name;
            const tagline = m.tagline || "";
            const rating = m.vote_average ? m.vote_average.toFixed(1) : undefined;
            const duration = m.runtime ? `${m.runtime} min` : undefined;
            
            setFullMovie(prev => prev ? {...prev, castDetails, similar, logoUrl, hasLogo: !!logoUrl, director: director || prev.director, tagline: tagline || prev.tagline, rating: rating || prev.rating, duration: duration || prev.duration} : null);
          }
        } catch (e) {
          console.error("TMDB Fallback failed:", e);
        }
      }
    };
    
    fetchMovieDetails();
  }, [movie]);

  const displayMovie = fullMovie || movie;

  const [jellyfinStreamUrl, setJellyfinStreamUrl] = useState<string | null>(null);
  const [checkingJellyfin, setCheckingJellyfin] = useState(false);

  // Sync Jellyfin connection matching to local curated items
  useEffect(() => {
    if (!movie) return;
    
    // Reset play and checking states
    setIsPlaying(startAsPlaying);
    setJellyfinStreamUrl(null);
    setCheckingJellyfin(false);

    // If movie already has a direct streamUrl (comes from our library section)
    if (movie.streamUrl) {
      setJellyfinStreamUrl(movie.streamUrl);
      return;
    }

    // Search Jellyfin matching titles in background
    const searchMatchInJellyfin = async () => {
      setCheckingJellyfin(true);
      try {
        const configRes = await fetch("/api/jellyfin/config");
        if (!configRes.ok) return;
        const configData = await configRes.json();
        
        if (configData.configured) {
          const searchRes = await fetch(`/api/jellyfin/search?title=${encodeURIComponent(movie.title)}`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.success && searchData.movies && searchData.movies.length > 0) {
              // Get the top matched result
              const firstMatch = searchData.movies[0];
              setJellyfinStreamUrl(firstMatch.streamUrl);
            }
          }
        }
      } catch (err) {
        console.error("Jellyfin match background error:", err);
      } finally {
        setCheckingJellyfin(false);
      }
    };

    searchMatchInJellyfin();
  }, [movie, startAsPlaying]);

  if (!movie) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Dark Cinematic Backdrop Mask */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Outer Container */}
        <motion.div
          layoutId={`card-container-${displayMovie.id}`}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`relative w-full max-w-4xl bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 max-h-[92vh] flex flex-col z-10`}
        >
          {/* Top Back Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Top Hero Section */}
          <div className="relative w-full h-64 sm:h-96 md:h-[400px]">
            <img referrerPolicy="no-referrer"
              src={displayMovie.backdropUrl || displayMovie.posterUrl}
              alt={displayMovie.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            
            {/* Title & Play Button Overlay */}
            <div className="absolute inset-x-0 bottom-0 px-6 pb-4 sm:px-10 sm:pb-6 pt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                {displayMovie.hasLogo && displayMovie.logoUrl ? (
                  <motion.img referrerPolicy="no-referrer"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    src={displayMovie.logoUrl}
                    alt={displayMovie.title}
                    className="max-w-[200px] sm:max-w-[300px] max-h-[100px] object-contain drop-shadow-2xl"
                  />
                ) : (
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  >
                    {displayMovie.title}
                  </motion.h2>
                )}
                {displayMovie.tagline && (
                  <p className="text-white font-sans text-sm md:text-base leading-relaxed max-w-xl font-light opacity-95 mt-1 mb-2">
                    {displayMovie.tagline}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono tracking-widest text-zinc-300 pt-1 uppercase">
                  <span className="text-amber-400 font-extrabold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                    {displayMovie.rating || displayMovie.voteAverage}
                  </span>
                  {displayMovie.isTv && displayMovie.seasons && (
                    <>
                      <span>•</span>
                      <span>{displayMovie.seasons.length} Seasons</span>
                    </>
                  )}
                  {displayMovie.originalLanguage && (
                    <>
                      <span>•</span>
                      <span>{displayMovie.originalLanguage.toUpperCase()}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-zinc-400">{Array.isArray(displayMovie.genre) ? displayMovie.genre.join(", ") : displayMovie.genre}</span>
                </div>
                
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans font-light line-clamp-3 sm:line-clamp-4 mt-2">
                  {displayMovie.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlay(displayMovie.id)}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-bold font-display uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {checkingJellyfin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin opacity-70" />
                      Loading
                    </>
                  ) : (
                    "Play Now"
                  )}
                </button>
              </div>
            </div>
          </div>
              {/* Movie Details Block */}
              <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left bg-stone-950">
                
                {/* Left Column: Description */}
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-forum font-bold text-[#f4ecd8] tracking-wide uppercase flex items-center gap-1.5 border-b border-zinc-800/80 pb-2">
                      <Info className="w-4 h-4 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
                      Synopsis
                    </h3>
                    <p className="text-zinc-300 text-base leading-relaxed font-sans first-letter:text-3xl first-letter:font-bold first-letter:text-[#f4ecd8] first-letter:mr-2 first-letter:float-left">
                      {displayMovie.description}
                    </p>
                  </div>

                  {/* Cast Card Grid */}
                                    <div className="space-y-3">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-[#f4ecd8] font-bold">
                      Main Cast
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {displayMovie.castDetails && displayMovie.castDetails.length > 0 ? displayMovie.castDetails.map((actor, idx) => (
                        <div key={idx} className="bg-neutral-900/60 border border-zinc-800/40 rounded-lg overflow-hidden text-center hover:bg-neutral-900 transition-colors duration-200">
                          <div className="aspect-[2/3] bg-zinc-800 w-full relative">
                            {actor.imageUrl ? (
                              <img src={actor.imageUrl} referrerPolicy="no-referrer" alt={actor.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <User className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs text-white font-medium truncate">{actor.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{actor.role || 'Role'}</p>
                          </div>
                        </div>
                      )) : displayMovie.cast.map((actor, idx) => (
                        <div key={idx} className="bg-neutral-900/60 border border-zinc-800/40 rounded-lg p-3 text-center hover:bg-neutral-900 transition-colors duration-200">
                          <User className="w-4 h-4 text-zinc-500 mx-auto mb-1.5" />
                          <p className="text-xs text-white font-medium truncate">{actor}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Key Role</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Spec Sheet */}
                <div className="space-y-6 bg-neutral-900/40 p-5 sm:p-6 rounded-xl border border-neutral-800/60">
                  <h3 className="text-lg font-forum font-bold text-white tracking-wide uppercase pb-2 border-b border-zinc-800/50">
                    Technical Sheet
                  </h3>

                  <div className="space-y-4 text-sm">
                    {/* Rating Banner */}
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 font-medium">Classico Rating</span>
                      <span className="flex items-center gap-1.5 font-mono text-white text-base font-bold bg-[#f4ecd8]/10 px-2.5 py-1 rounded-md border border-[#f4ecd8]/30 shadow-md">
                        <Star className="w-4 h-4 text-[#f4ecd8] fill-[#f4ecd8]" />
                        {displayMovie.rating} <span className="text-zinc-500 text-xs">/10</span>
                      </span>
                    </div>

                    {/* Director */}
                    <div className="space-y-1 py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 block text-xs">Director</span>
                      <span className="text-white font-semibold font-display text-base">{displayMovie.director || "Unknown Director"}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Duration</span>
                      <span className="flex items-center gap-1.5 text-zinc-200 font-mono">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        {displayMovie.duration}
                      </span>
                    </div>

                    {/* Year */}
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Release Year</span>
                      <span className="text-zinc-200 font-semibold font-mono">{displayMovie.year}</span>
                    </div>

                    {/* Genre Tags */}
                    <div className="space-y-2 pt-1">
                      <span className="text-zinc-400 block text-xs">Genres</span>
                      <div className="flex overflow-x-auto no-scrollbar flex-nowrap md:flex-wrap gap-1.5 pb-1 md:pb-0">
                        {(Array.isArray(displayMovie.genre) ? displayMovie.genre : []).map((g, idx) => (
                          <span key={idx} className="whitespace-nowrap bg-zinc-800/60 text-zinc-300 text-[11px] font-mono px-2 py-1 md:px-2.5 md:py-1 rounded-md border border-zinc-700/30">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              
              </div>
              
              {/* Similar Content */}
              {displayMovie.similar && displayMovie.similar.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-[#f4ecd8] font-bold pb-2 border-b border-zinc-800/50">
                    Similar Content
                  </h3>
                  <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar scroll-smooth">
                    {displayMovie.similar.map((sim, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onClose();
                          if (onSimilarClick) { onSimilarClick(sim.id); }
                        }}
                        className="shrink-0 w-28 sm:w-32 group cursor-pointer text-left"
                      >
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 relative border border-zinc-800/50 group-hover:border-zinc-500/50 transition-colors">
                          {sim.posterUrl ? (
                            <img src={sim.posterUrl} referrerPolicy="no-referrer" alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900">
                              <Film className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs sm:text-sm font-bold text-white group-hover:text-[#f4ecd8] transition-colors truncate">
                          {sim.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
