import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Play, ChevronDown, Award, Users, Film, ArrowLeft, Star, Clock, Heart, X, User, ChevronLeft, ChevronRight, Download, CheckCircle } from "lucide-react";
import { Movie } from "../data";

interface MovieDetailViewProps {
  movie: Movie;
  onBack: () => void;
  onPlay: (movieId: string) => void;
  onSimilarClick?: (id: any) => void;
}

export default function MovieDetailView({
  movie,
  onBack,
  onPlay,
  onSimilarClick,
}: MovieDetailViewProps) {
  const [fullMovie, setFullMovie] = React.useState<Movie>(movie);
  React.useEffect(() => {
    setFullMovie(movie);
  }, [movie]);
  const [selectedSeason, setSelectedSeason] = React.useState(fullMovie.seasons && fullMovie.seasons.length > 0 ? fullMovie.seasons[0].season_number : 1);
  const [episodes, setEpisodes] = React.useState<any[]>([]);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = React.useState(false);
    
  React.useEffect(() => {
    console.log("Fetching TMDB data for movie ID:", movie.id, "TMDB ID:", movie.tmdbId, "ProviderIds:", movie.providerIds);
    fetch(`/api/movie/${movie.providerIds?.Tmdb ? (movie.isTv ? movie.providerIds.Tmdb + "-tv" : movie.providerIds.Tmdb) : (movie.tmdbId ? (movie.isTv ? movie.tmdbId + "-tv" : movie.tmdbId) : movie.id)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.movie) {
          setFullMovie(prev => ({...prev, ...data.movie}));
        }
      })
      .catch(console.error);
  }, [movie.id]);
  const [lastWatched, setLastWatched] = React.useState<{season: number, episode: number} | null>(null);

  React.useEffect(() => {
    if (fullMovie.isTv) {
      try {
        const tvState = JSON.parse(localStorage.getItem("classico_tv_state") || "{}");
        if (tvState[movie.id]) {
          setLastWatched(tvState[movie.id]);
          if (!selectedSeason || fullMovie.seasons?.length && selectedSeason === fullMovie.seasons[0].season_number) {
            setSelectedSeason(tvState[movie.id].season);
          }
        }
      } catch (e) {}
    }
  }, [fullMovie.id, fullMovie.isTv]);

  React.useEffect(() => {
    if (fullMovie.isTv && selectedSeason) {
      fetch(`/api/tv/${fullMovie.id}/season/${selectedSeason}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setEpisodes(data.episodes);
          }
        });
    }
  }, [fullMovie.id, fullMovie.isTv, selectedSeason]);
  React.useEffect(() => {
    if (fullMovie.seasons && fullMovie.seasons.length > 0 && !fullMovie.seasons.find((s: any) => s.season_number === selectedSeason)) {
      setSelectedSeason(fullMovie.seasons[0].season_number);
    }
  }, [fullMovie.seasons]);
  
  const handlePlayEpisode = (seasonNum: number, episodeNum: number) => {
    try {
      const tvState = JSON.parse(localStorage.getItem("classico_tv_state") || "{}");
      tvState[movie.id] = { season: seasonNum, episode: episodeNum };
      localStorage.setItem("classico_tv_state", JSON.stringify(tvState));
      setLastWatched({ season: seasonNum, episode: episodeNum });
    } catch (e) {}
    onPlay(fullMovie.id + "-S" + seasonNum + "E" + episodeNum);
  };
  
  const [watchedEpisodes, setWatchedEpisodes] = React.useState<Record<string, boolean>>({});
  
  React.useEffect(() => {
     try {
        const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
        const baseId = fullMovie.id.replace(/-tv$/, "").replace(/-S\d+E\d+$/, "");
        if (saved[baseId] && saved[baseId].show_progress) {
            const we: Record<string, boolean> = {};
            for (const key in saved[baseId].show_progress) {
                if (saved[baseId].show_progress[key].progress && saved[baseId].show_progress[key].progress.watched > 0) {
                    we[key] = true;
                }
            }
            setWatchedEpisodes(we);
        }
     } catch(e) {}
  }, [fullMovie.id, isSeasonDropdownOpen, episodes]);

  const getDownloadUrl = () => {
    const tmdbId = fullMovie.providerIds?.Tmdb || fullMovie.tmdbId || fullMovie.id;
    const cleanId = String(tmdbId).replace('-tv', '');
    if (fullMovie.isTv) {
       const s = lastWatched ? lastWatched.season : (selectedSeason || 1);
       const e = lastWatched ? lastWatched.episode : 1;
       return `https://mediatv.trendingpie.com/?id=${cleanId}&s=${s}&e=${e}`;
    }
    return `https://mediatv.trendingpie.com/?id=${cleanId}`;
  };

  const getEpisodeDownloadUrl = (s: number, e: number) => {
    const tmdbId = fullMovie.providerIds?.Tmdb || fullMovie.tmdbId || fullMovie.id;
    const cleanId = String(tmdbId).replace('-tv', '');
    return `https://mediatv.trendingpie.com/?id=${cleanId}&s=${s}&e=${e}`;
  };

  const formatDuration = (val: number | string) => {
    if (!val) return "";
    let minutes = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) : val;
    if (isNaN(minutes)) return val as string;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m > 0 ? m + 'm' : ''}`;
    return `${m}m`;
  };
  const [expandedSection, setExpandedSection] = useState<"casting" | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [downloadUrlToConfirm, setDownloadUrlToConfirm] = useState<string | null>(null);


  // Safe backdrop selection
  const backdrop = fullMovie.backdropUrl || "/src/assets/images/classico_hero_backdrop_1781395618793.jpg";
  const poster = fullMovie.posterUrl || "";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased pb-20">
      
      {/* 1. TOP SECURE HEADER & NAVIGATION BREADCRUMB */}
      <div className="absolute top-28 md:top-32 left-4 sm:left-8 z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center p-2.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SPECTACULAR NETFLIX-STYLE HERO SECTION */}
      <div className="relative w-full min-h-[75vh] md:min-h-[85vh] [@media(max-height:500px)_and_(orientation:landscape)]:min-h-0 [@media(max-height:500px)_and_(orientation:landscape)]:h-[100vh] bg-black overflow-hidden flex flex-col justify-end pt-32 sm:pt-40 [@media(max-height:500px)_and_(orientation:landscape)]:justify-center [@media(max-height:500px)_and_(orientation:landscape)]:pt-10">
        
        {/* Blurry panoramic backdrop with absolute dark mask */}
        <div className="absolute inset-0 z-0">
          <img
            src={backdrop}
            alt={fullMovie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_top,#0c0a09_0%,#0c0a09_10%,rgba(12,10,9,0.9)_30%,rgba(12,10,9,0.4)_60%,transparent_100%)] md:!bg-[linear-gradient(to_top,#0c0a09_0%,#0c0a09_10%,rgba(12,10,9,0.95)_25%,rgba(12,10,9,0.6)_50%,transparent_100%)] [@media(max-height:500px)_and_(orientation:landscape)]:bg-stone-950/80" />
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 max-w-[2000px] mx-auto w-full px-4 sm:px-8 pb-8 sm:pb-12 [@media(max-height:500px)_and_(orientation:landscape)]:pb-2 flex flex-col [@media(max-height:500px)_and_(orientation:landscape)]:flex-row items-start [@media(max-height:500px)_and_(orientation:landscape)]:items-center gap-4 sm:gap-6 [@media(max-height:500px)_and_(orientation:landscape)]:gap-6 text-left [@media(max-height:500px)_and_(orientation:landscape)]:h-auto ">
          
          <img src={poster} referrerPolicy="no-referrer" alt={fullMovie.title} className="hidden [@media(max-height:500px)_and_(orientation:landscape)]:block h-[80vh] max-h-[280px] w-auto object-contain rounded-lg shadow-2xl shrink-0" />

          {/* Core Text & CTAs Details Box */}
          <div className="flex flex-col items-start max-w-3xl space-y-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:space-y-2 [@media(max-height:500px)_and_(orientation:landscape)]:h-[80vh] [@media(max-height:500px)_and_(orientation:landscape)]:max-h-[280px] [@media(max-height:500px)_and_(orientation:landscape)]:overflow-y-auto [@media(max-height:500px)_and_(orientation:landscape)]:pr-2 no-scrollbar">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-zinc-900/80 border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded text-[11px] font-mono tracking-widest uppercase shadow-sm">
                {fullMovie.year}
              </span>
              <span className="bg-zinc-900/80 border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded text-[11px] font-mono tracking-widest uppercase shadow-sm">
                {formatDuration(fullMovie.duration)}
              </span>
            </div>

            {fullMovie.hasLogo && fullMovie.logoUrl ? (
              <img src={fullMovie.logoUrl} referrerPolicy="no-referrer" alt={fullMovie.title} className="max-w-[200px] sm:max-w-[300px] max-h-[100px] object-contain drop-shadow-2xl" />
            ) : (
              <h1 className="text-4xl sm:text-5xl md:text-6xl [@media(max-height:500px)_and_(orientation:landscape)]:text-3xl font-forum font-bold tracking-wider text-white uppercase drop-shadow-xl leading-tight">
                {fullMovie.title}
              </h1>
            )}

            {fullMovie.tagline && (
              <p className="text-white font-sans text-sm md:text-base leading-relaxed max-w-xl font-light opacity-95">
                {fullMovie.tagline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono tracking-widest text-zinc-300 pt-1 uppercase">
              <span className="text-amber-400 font-extrabold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                {fullMovie.rating || fullMovie.voteAverage}
              </span>
              {fullMovie.isTv && fullMovie.seasons && (
                <>
                  <span>•</span>
                  <span>{fullMovie.seasons.length} Seasons</span>
                </>
              )}
              {fullMovie.originalLanguage && (
                <>
                  <span>•</span>
                  <span>{fullMovie.originalLanguage.toUpperCase()}</span>
                </>
              )}
              <span>•</span>
              <span className="text-zinc-400">{Array.isArray(fullMovie.genre) ? fullMovie.genre.join(", ") : fullMovie.genre}</span>
            </div>
            
            <p className="text-zinc-300 text-[11px] sm:text-xs leading-relaxed max-w-2xl font-sans font-light line-clamp-3 mt-2">
              {fullMovie.description}
            </p>

            {/* Main Interactive CTA Button Area */}
            <div className="flex items-center gap-3.5 pt-3 [@media(max-height:500px)_and_(orientation:landscape)]:pt-1">
                <button
                  onClick={() => {
                    if (fullMovie.isTv) {
                      const s = lastWatched ? lastWatched.season : (selectedSeason || 1);
                      const e = lastWatched ? lastWatched.episode : 1;
                      handlePlayEpisode(s, e);
                    } else {
                      onPlay(fullMovie.id);
                    }
                  }}
                  className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {fullMovie.isTv ? (lastWatched ? `PLAY S${String(lastWatched.season).padStart(2, '0')}E${String(lastWatched.episode).padStart(2, '0')}` : `PLAY S${String(selectedSeason || 1).padStart(2, '0')}E01`) : 'Play'}
                </button>
                
                <button onClick={() => setShowTrailerModal(true)} className="inline-flex items-center gap-2.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-white px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold border border-zinc-700/50 hover:border-zinc-500/50">
                  <Film className="w-4 h-4" />
                  TRAILER
                </button>
                
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDownloadUrlToConfirm(getDownloadUrl()); }} className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-zinc-800/80 hover:bg-zinc-700/80 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-zinc-700/50 hover:border-zinc-500/50 shrink-0" title="Télécharger">
                  <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button onClick={() => console.log('Added to list')} className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-neutral-800/80 hover:bg-neutral-700/80 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-neutral-700/50 hover:border-neutral-500/50 shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              {/* NEW CASTING BUTTON LOCATION */}
              {((fullMovie.castDetails && fullMovie.castDetails.length > 0) || (fullMovie.cast && fullMovie.cast.length > 0)) && (
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'casting' ? null : 'casting')}
                  className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 rounded-lg cursor-pointer border border-zinc-800/50 backdrop-blur-sm w-fit"
                >
                  CASTING
                  <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${expandedSection === 'casting' ? 'rotate-180' : ''}`} />
                </button>
              )}

            {/* Synopsis for landscape mode */}
            <p className="hidden [@media(max-height:500px)_and_(orientation:landscape)]:block text-zinc-300 text-[11px] leading-relaxed font-sans font-light pt-2">
              {fullMovie.description}
            </p>
          </div>

        </div>
      </div>
      {fullMovie.isTv && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-4 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-2 relative z-20">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest">Episodes</h3>
            <div className="relative">
              <button 
                onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                className="flex items-center gap-2 text-zinc-300 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors border border-zinc-800 hover:border-zinc-700 font-bold text-sm tracking-widest uppercase cursor-pointer"
              >
                Season {selectedSeason} <ChevronDown className={`w-4 h-4 transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSeasonDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSeasonDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar py-1">
                      {fullMovie.seasons?.map((s: any) => (
                        <button
                          key={s.season_number}
                          onClick={() => {
                            setSelectedSeason(s.season_number);
                            setIsSeasonDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-zinc-800 ${selectedSeason === s.season_number ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-300'}`}
                        >
                          Season {s.season_number}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            {episodes.length > 0 ? (
              episodes.map((ep, i) => (
                <button
                  key={ep.episode_number}
                  onClick={() => handlePlayEpisode(selectedSeason, ep.episode_number)}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/30 hover:bg-zinc-800/80 rounded-xl p-3 transition-colors text-left border border-transparent hover:border-zinc-700/50"
                >
                  <div className="relative shrink-0 w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                    {ep.stillUrl ? (
                      <img src={ep.stillUrl} referrerPolicy="no-referrer" alt={ep.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border border-white/20">
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    {ep.runtime > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                        {ep.runtime}m
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                        <span className="truncate">{ep.episode_number}. {ep.name}</span>
                        {watchedEpisodes[`s${selectedSeason}e${ep.episode_number}`] && (
                            <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded border border-green-500/30 flex items-center gap-1 shrink-0"><CheckCircle className="w-3 h-3"/> Watched</span>
                        )}
                      </h4>

                    </div>
                    
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-1">
                      {ep.overview || "No description available."}
                    </p>
                  </div>
                    <div className="shrink-0 pl-2">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDownloadUrlToConfirm(getEpisodeDownloadUrl(selectedSeason, ep.episode_number)); }}
                        className="p-2 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center border border-amber-500/20 hover:scale-110"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                </button>
              ))
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CASTING SECTION */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-2 sm:mt-4 text-left">
                {expandedSection === 'casting' && ((fullMovie.castDetails && fullMovie.castDetails.length > 0) || (fullMovie.cast && fullMovie.cast.length > 0)) && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 pt-2">
            {fullMovie.castDetails && fullMovie.castDetails.length > 0 ? fullMovie.castDetails.map((actor, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="aspect-[2/3] bg-zinc-800 w-full relative">
                  {actor.imageUrl ? (
                    <img src={actor.imageUrl} referrerPolicy="no-referrer" alt={actor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="p-1.5 sm:p-2 flex flex-col text-center">
                  <span className="font-bold text-white text-[11px] sm:text-xs truncate">{actor.role || 'Role'}</span>
                  <span className="text-zinc-400 text-[9px] sm:text-[10px] truncate mt-0.5">{actor.name}</span>
                </div>
              </div>
            )) : fullMovie.cast?.map((actorStr, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="aspect-[2/3] bg-zinc-800 w-full relative">
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <User className="w-10 h-10" />
                  </div>
                </div>
                <div className="p-1.5 sm:p-2 flex flex-col text-center">
                  <span className="font-bold text-white text-[11px] sm:text-xs truncate">{actorStr}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIMILAR CONTENT (MOVIES ONLY) */}
      {fullMovie.similar && fullMovie.similar.length > 0 && (
        <div className="max-w-[2000px] w-full mx-auto px-4 sm:px-8 mt-6 sm:mt-12 mb-20 space-y-2 text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-widest">Similar Content</h3>
            <div className="flex gap-2">
              <button onClick={() => { const el = document.getElementById('similar-scroll'); if (el) el.scrollBy({ left: -300, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer text-white"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => { const el = document.getElementById('similar-scroll'); if (el) el.scrollBy({ left: 300, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer text-white"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div id="similar-scroll" className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar scroll-smooth">
            {fullMovie.similar.map((sim) => (
              <button
                key={sim.id}
                onClick={() => {
                  window.scrollTo(0, 0);
                  if (onSimilarClick) {
                    onSimilarClick(sim.id);
                  } else {
                    window.location.hash = "/movie/" + sim.id;
                  }
                }}
                className="shrink-0 w-32 sm:w-40 group cursor-pointer text-left"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 relative border border-zinc-800/50 group-hover:border-zinc-500/50 transition-colors">
                  {sim.posterUrl ? (
                    <img src={sim.posterUrl} referrerPolicy="no-referrer" alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <h4 className="text-white font-bold text-sm truncate mt-2 group-hover:text-amber-400 transition-colors">{sim.title}</h4>
                <p className="text-zinc-500 text-xs">{sim.year || 'N/A'}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {showTrailerModal && (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
            <button 
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            {fullMovie.trailerUrl ? (
              <iframe 
                src={fullMovie.trailerUrl.includes('youtube.com/watch?v=') ? fullMovie.trailerUrl.replace('watch?v=', 'embed/') : fullMovie.trailerUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                <Film className="w-12 h-12 opacity-50" />
                <p className="font-mono text-sm">Trailer not available for this title</p>
              </div>
            )}
          </div>
        </div>
      )}

      {downloadUrlToConfirm && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-forum tracking-wide">External Link</h3>
            <p className="text-zinc-400 text-sm mb-6">
              These links are provided by external services. Use at your own discretion.
            </p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setDownloadUrlToConfirm(null)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <a 
                href={downloadUrlToConfirm} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setDownloadUrlToConfirm(null)}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
              >
                Proceed
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
