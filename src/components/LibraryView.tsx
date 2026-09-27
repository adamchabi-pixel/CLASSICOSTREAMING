import React, { useState, useEffect } from "react";
import { Search, Film as FilmIcon, Target, Compass, Sparkles, Smile, Shield, Video, Activity, Users, Wand2, Landmark, Ghost, Heart, Rocket, Eye, Star, Globe, Calendar, ChevronRight } from "lucide-react";
import { Movie } from "../data";
import MovieCard from "./MovieCard";
import LazyVirtualCard from "./LazyVirtualCard";
import { motion } from "framer-motion";
import { PLATFORMS_LIST } from "./PlatformShowcase";

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";

const LANGUAGES = [
  { id: "fr", name: "French", icon: Globe },
  { id: "en", name: "English", icon: Globe },
  { id: "ja", name: "Japanese", icon: Globe },
  { id: "es", name: "Spanish", icon: Globe },
  { id: "ko", name: "Korean", icon: Globe },
  { id: "it", name: "Italian", icon: Globe },
  { id: "de", name: "German", icon: Globe }
];

const YEARS = [
  { id: 2024, name: "2024", icon: Calendar },
  { id: 2023, name: "2023", icon: Calendar },
  { id: 2022, name: "2022", icon: Calendar },
  { id: 2021, name: "2021", icon: Calendar },
  { id: 2020, name: "2020", icon: Calendar },
  { id: 2010, name: "2010s", icon: Calendar },
  { id: 2000, name: "2000s", icon: Calendar }
];

const GENRES = [
  { id: 28, name: "Action", icon: Target },
  { id: 12, name: "Adventure", icon: Compass },
  { id: 16, name: "Animation", icon: Sparkles },
  { id: 35, name: "Comedy", icon: Smile },
  { id: 80, name: "Crime", icon: Shield },
  { id: 99, name: "Documentary", icon: Video },
  { id: 18, name: "Drama", icon: Activity },
  { id: 10751, name: "Family", icon: Users },
  { id: 14, name: "Fantasy", icon: Wand2 },
  { id: 36, name: "History", icon: Landmark },
  { id: 27, name: "Horror", icon: Ghost },
  { id: 9648, name: "Mystery", icon: Search },
  { id: 10749, name: "Romance", icon: Heart },
  { id: 878, name: "Sci-Fi", icon: Rocket },
  { id: 53, name: "Thriller", icon: Eye },
  { id: 10752, name: "War", icon: Target },
  { id: 37, name: "Western", icon: Star }
];
const TV_GENRES = [
  { id: 10759, name: "Action", icon: Target },
  { id: 16, name: "Animation", icon: Sparkles },
  { id: 35, name: "Comedy", icon: Smile },
  { id: 80, name: "Crime", icon: Shield },
  { id: 99, name: "Documentary", icon: Video },
  { id: 18, name: "Drama", icon: Activity },
  { id: 10751, name: "Family", icon: Users },
  { id: 10762, name: "Kids", icon: Smile },
  { id: 9648, name: "Mystery", icon: Search },
  { id: 10763, name: "News", icon: Globe },
  { id: 10764, name: "Reality", icon: Video },
  { id: 10765, name: "Sci-Fi", icon: Rocket },
  { id: 10766, name: "Soap", icon: Heart },
  { id: 10767, name: "Talk Show", icon: Users },
  { id: 10768, name: "War & Politics", icon: Landmark },
  { id: 37, name: "Western", icon: Star }
];

interface LibraryViewProps {
  onSelect: (m: Movie) => void;
  onPlay: (m: Movie) => void;
  getProgress: (id: string) => number;
  type?: 'movie' | 'tv';
  activePlatform?: number | null;
  onPlatformChange?: (platformId: number | null) => void;
}

export default function LibraryView({
  onSelect,
  onPlay,
  getProgress,
  type = 'movie',
  activePlatform: activePlatformProp,
  onPlatformChange
}: LibraryViewProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [internalPlatform, setInternalPlatform] = useState<number | null>(activePlatformProp ?? null);
  const [contentType, setContentType] = useState<'all' | 'movie' | 'tv'>('all');
  const [activeGenre, setActiveGenre] = useState<number | string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activePlatformProp !== undefined) {
      setInternalPlatform(activePlatformProp);
    }
  }, [activePlatformProp]);

  const activePlatform = activePlatformProp !== undefined ? activePlatformProp : internalPlatform;

  const handleTogglePlatform = (id: number) => {
    const next = activePlatform === id ? null : id;
    setInternalPlatform(next);
    if (onPlatformChange) onPlatformChange(next);
    setPage(1);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const isAnimeOrAdult = (m: any) => {
          if (m.adult) return true;
          if (m.original_language === 'ja' || m.original_language === 'ko' || m.original_language === 'zh') return true;
          if (m.origin_country && (m.origin_country.includes('JP') || m.origin_country.includes('KR') || m.origin_country.includes('CN'))) return true;
          const title = (m.title || m.name || m.original_title || m.original_name || '').toLowerCase();
          if (title.includes('naruto') || title.includes('boruto') || title.includes('dragon ball') || title.includes('one piece') || title.includes('bleach') || title.includes('attack on titan')) return true;
          if (m.genre_ids && m.genre_ids.includes(16)) {
            if (m.origin_country && m.origin_country.includes('JP')) return true;
            if (m.original_language === 'ja') return true;
          }
          return false;
        };

        const mapMediaItem = (r: any, isSeries: boolean) => ({
          id: isSeries ? `${r.id}-tv` : String(r.id),
          tmdbId: String(r.id),
          title: r.title || r.name,
          originalTitle: r.original_title || r.original_name,
          description: r.overview,
          posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : "",
          backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : "",
          year: r.release_date ? parseInt(r.release_date.split("-")[0]) : (r.first_air_date ? parseInt(r.first_air_date.split("-")[0]) : 0),
          releaseDate: r.release_date || r.first_air_date,
          voteAverage: r.vote_average,
          rating: r.vote_average ? r.vote_average.toFixed(1) : "?",
          language: r.original_language,
          isTv: isSeries,
          duration: isSeries ? "Series" : "Movie",
          director: "Unknown",
          cast: [],
          genre: [],
          isIframeEmbed: true,
          iframeSrc: ""
        } as unknown as Movie);

        // When a platform is active and 'all' is selected: fetch both movies and TV shows of this platform
        if (activePlatform && contentType === 'all') {
          const paramsMovies = new URLSearchParams({
            type: 'movie',
            activePlatform: activePlatform.toString(),
            page: (page || 1).toString()
          });
          const paramsTv = new URLSearchParams({
            type: 'tv',
            activePlatform: activePlatform.toString(),
            page: (page || 1).toString()
          });
          if (activeGenre) {
            paramsMovies.append('activeGenre', activeGenre.toString());
            paramsTv.append('activeGenre', activeGenre.toString());
          }
          if (activeLanguage) {
            paramsMovies.append('activeLanguage', activeLanguage.toString());
            paramsTv.append('activeLanguage', activeLanguage.toString());
          }
          if (activeYear) {
            paramsMovies.append('activeYear', activeYear.toString());
            paramsTv.append('activeYear', activeYear.toString());
          }

          const [resM, resT] = await Promise.all([
            fetch(`/api/discover?${paramsMovies.toString()}`),
            fetch(`/api/discover?${paramsTv.toString()}`)
          ]);

          const [dataM, dataT] = await Promise.all([
            resM.ok ? resM.json() : { results: [] },
            resT.ok ? resT.json() : { results: [] }
          ]);

          const resultsM = (dataM?.data?.results || dataM?.results || []).filter((r: any) => !isAnimeOrAdult(r)).map((r: any) => mapMediaItem(r, false));
          const resultsT = (dataT?.data?.results || dataT?.results || []).filter((r: any) => !isAnimeOrAdult(r)).map((r: any) => mapMediaItem(r, true));

          // Combine interleaved
          const combined: Movie[] = [];
          const maxLen = Math.max(resultsM.length, resultsT.length);
          for (let i = 0; i < maxLen; i++) {
            if (i < resultsM.length) combined.push(resultsM[i]);
            if (i < resultsT.length) combined.push(resultsT[i]);
          }

          setMovies(combined);
          setTotalPages(Math.min(Math.max(dataM?.total_pages || 1, dataT?.total_pages || 1), 500));
          setLoading(false);
          return;
        }

        // Standard single type query (movie or tv)
        const activeType = activePlatform ? (contentType === 'tv' ? 'tv' : 'movie') : (type || 'movie');
        let queryParams = new URLSearchParams({
          type: activeType,
          page: (page || 1).toString()
        });
        if (activePlatform) queryParams.append('activePlatform', activePlatform.toString());
        if (activeGenre) queryParams.append('activeGenre', activeGenre.toString());
        if (activeLanguage) queryParams.append('activeLanguage', activeLanguage.toString());
        if (activeYear) queryParams.append('activeYear', activeYear.toString());
        
        const res = await fetch(`/api/discover?${queryParams.toString()}`);
        
        if (res.ok) {
           let data;
           try {
               const j = await res.json();
               data = j.data || j;
           } catch (parseError) {
               throw new Error("Server returned an invalid response.");
           }

           if (data && data.results) {
               const mapped = data.results.filter((r: any) => !isAnimeOrAdult(r)).map((r: any) => mapMediaItem(r, activeType === "tv" || r.media_type === "tv"));
               const seenIds = new Set<string>();
               const uniqueMapped = mapped.filter((m: any) => {
                 if (seenIds.has(m.id)) return false;
                 seenIds.add(m.id);
                 return true;
               });
               setMovies(uniqueMapped);
               setTotalPages(Math.min(data.total_pages || 1, 500));
           } else {
               setErrorMsg("No results found.");
           }
        } else {
           const errText = await res.text();
           setErrorMsg(`API Error ${res.status}: ${errText}`);
        }
      } catch (err: any) {
         console.error(err);
         setErrorMsg(`Fetch failed: ${err.message}`);
      } finally {
         setLoading(false);
      }
    };
    fetchMovies();
  }, [activePlatform, contentType, activeGenre, activeLanguage, activeYear, type, page]);

  return (
    <motion.div
      key={"tab-collections-" + type}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex flex-col h-screen pt-[48px] px-3 sm:px-6 md:px-8 max-w-[2000px] mx-auto overflow-hidden gap-3 sm:gap-4"
    >
      {/* Platforms Encadrés - TOUT EN HAUT, Symmetrically Centered across FULL WIDTH on mobile, tablet, and desktop */}
      <div className="w-full shrink-0 flex items-center justify-center pt-2 pb-1">
        <div className="flex w-full items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3.5 px-0.5 sm:px-1">
          {/* ALL encadré */}
          <button
            type="button"
            onClick={() => {
              setInternalPlatform(null);
              if (onPlatformChange) onPlatformChange(null);
              setPage(1);
            }}
            className={`relative flex-1 min-w-0 h-11 sm:h-13 md:h-16 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer select-none group border-2 ${
              !activePlatform
                ? "border-amber-400 bg-amber-400/15 shadow-[0_0_24px_rgba(245,158,11,0.4)] scale-[1.02] z-10"
                : "border-zinc-700/80 bg-neutral-900/90 hover:border-amber-400/70 hover:bg-neutral-800/90 opacity-90 hover:opacity-100"
            }`}
            title="All Platforms"
          >
            <span
              className={`font-black tracking-widest text-xs sm:text-sm md:text-base uppercase transition-all duration-200 ${
                !activePlatform
                  ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-105"
                  : "text-zinc-300 group-hover:text-white group-hover:scale-105"
              }`}
            >
              ALL
            </span>

            {/* Golden active indicator bar underneath */}
            {!activePlatform && (
              <span className="absolute bottom-0 inset-x-2 sm:inset-x-4 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
            )}
          </button>

          {PLATFORMS_LIST.map((platform) => {
            const isSelected = activePlatform === platform.id;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => handleTogglePlatform(platform.id)}
                className={`relative flex-1 min-w-0 h-11 sm:h-13 md:h-16 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer select-none group border-2 ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/15 shadow-[0_0_24px_rgba(245,158,11,0.4)] scale-[1.02] z-10"
                    : "border-zinc-700/80 bg-neutral-900/90 hover:border-amber-400/70 hover:bg-neutral-800/90 opacity-90 hover:opacity-100"
                }`}
                title={isSelected ? `Clear ${platform.name} filter` : `Filter by ${platform.name}`}
              >
                {/* Logo Image: pure white vector, NO background; white when inactive, rich refined gold with glow when active */}
                <div className="relative flex flex-col items-center justify-center">
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    className={`h-4 sm:h-5 md:h-6 w-auto max-w-[82%] object-contain select-none pointer-events-none transition-all duration-200 ${
                      isSelected
                        ? "[filter:brightness(0)_saturate(100%)_invert(80%)_sepia(55%)_saturate(700%)_hue-rotate(355deg)_brightness(105%)] drop-shadow-[0_0_8px_rgba(245,158,11,0.7)] scale-105"
                        : "brightness-0 invert opacity-90 group-hover:opacity-100 group-hover:scale-105"
                    }`}
                    loading="eager"
                    decoding="async"
                  />
                  {/* Golden line underneath the logo inside the frame */}
                  {isSelected && (
                    <span className="w-6 sm:w-8 md:w-10 h-[2px] mt-1 sm:mt-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.9)] rounded-full animate-in fade-in duration-200" />
                  )}
                </div>

                {/* Golden active indicator bar underneath */}
                {isSelected && (
                  <span className="absolute bottom-0 inset-x-2 sm:inset-x-4 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main split: Sidebar & Content Grid */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden gap-4 md:gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-44 xl:w-52 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-8 border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4 h-auto md:h-full">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 hidden md:block px-3">Filters</div>
          
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1 hidden md:block px-3">Categories</div>
          <button
              onClick={() => { setActiveGenre(null); setPage(1); }}
              className={`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap ${activeGenre === null ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
          >
              <Compass className={`w-4 h-4 ${activeGenre === null ? 'text-amber-500' : 'text-zinc-500'}`} />
              <span>Popular</span>
              {activeGenre === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
          </button>
          <button
              onClick={() => { setActiveGenre('top_rated'); setPage(1); }}
              className={`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap ${activeGenre === 'top_rated' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
          >
              <Star className={`w-4 h-4 ${activeGenre === 'top_rated' ? 'text-amber-500' : 'text-zinc-500'}`} />
              <span>Top Rated</span>
              {activeGenre === 'top_rated' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
          </button>

          <div className="hidden md:block w-full h-px bg-zinc-800/50 my-3" />
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1 hidden md:block px-3">Genres</div>
          
          {GENRES.map(g => {
              const IconComp = g.icon;
              const isActive = activeGenre === g.id;
              return (
                  <button
                      key={g.id}
                      onClick={() => { setActiveGenre(g.id); setPage(1); }}
                      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                      <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />
                      <span>{g.name}</span>
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
                  </button>
              );
          })}

          <div className="hidden md:block w-full h-px bg-zinc-800/50 my-4" />
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1 hidden md:block px-3">Languages</div>
          
          <button
              onClick={() => { setActiveLanguage(null); setPage(1); }}
              className={`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap ${activeLanguage === null ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
          >
              <Globe className={`w-4 h-4 ${activeLanguage === null ? 'text-amber-500' : 'text-zinc-500'}`} />
              <span>All Languages</span>
              {activeLanguage === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
          </button>
          {LANGUAGES.map(l => {
              const IconComp = l.icon;
              const isActive = activeLanguage === l.id;
              return (
                  <button
                      key={l.id}
                      onClick={() => { setActiveLanguage(l.id); setPage(1); }}
                      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                      <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />
                      <span>{l.name}</span>
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
                  </button>
              );
          })}

          <div className="hidden md:block w-full h-px bg-zinc-800/50 my-4" />
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1 hidden md:block px-3">Release Years</div>
          
          <button
              onClick={() => { setActiveYear(null); setPage(1); }}
              className={`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap ${activeYear === null ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
          >
              <Calendar className={`w-4 h-4 ${activeYear === null ? 'text-amber-500' : 'text-zinc-500'}`} />
              <span>All Years</span>
              {activeYear === null && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
          </button>
          {YEARS.map(y => {
              const IconComp = y.icon;
              const isActive = activeYear === y.id;
              return (
                  <button
                      key={y.id}
                      onClick={() => { setActiveYear(y.id); setPage(1); }}
                      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-none text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                      <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />
                      <span>{y.name}</span>
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent block" />}
                  </button>
              );
          })}
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full min-w-0 h-full overflow-y-auto no-scrollbar pb-32">
          {/* Grid */}
             {loading ? (
                 <div className="flex items-center justify-center py-32">
                     <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                 </div>
             ) : errorMsg ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-80">
                    <FilmIcon className="w-16 h-16 text-red-500" />
                    <h3 className="text-xl font-bold text-red-400">Loading Error</h3>
                    <p className="text-zinc-400 max-w-md">{errorMsg}</p>
                 </div>
             ) : movies.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                    <FilmIcon className="w-16 h-16 text-zinc-600" />
                    <h3 className="text-xl font-bold text-white">No Results</h3>
                    <p className="text-zinc-400">Try adjusting your filters.</p>
                  </div>
             ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                    {movies.map(movie => (
                       <LazyVirtualCard 
                          key={movie.id} 
                          className="w-full flex flex-col"
                          placeholderClassName="w-full aspect-[2/3] rounded-none bg-neutral-900 border border-neutral-800/40 opacity-30"
                       >
                          <MovieCard
                            movie={movie}
                            variant="rectangular"
                            onSelect={onSelect}
                            onPlay={onSelect}
                            progressPercent={getProgress(movie.id)}
                          />
                       </LazyVirtualCard>
                    ))}
                 </div>
             )}
             
             {!loading && movies.length > 0 && totalPages > 1 && (
                 <div className="flex items-center justify-center gap-4 mt-12 mb-8">
                     <button 
                         onClick={() => setPage(p => Math.max(1, p - 1))} 
                         disabled={page === 1} 
                         className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                     >
                         Previous
                     </button>
                     <span className="text-zinc-500 font-mono text-sm tracking-wider">
                         PAGE <span className="text-amber-500 font-bold">{page}</span> OF {totalPages}
                     </span>
                     <button 
                         onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                         disabled={page === totalPages} 
                         className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                     >
                         Next
                     </button>
                 </div>
             )}
      </div>
      </div>
    </motion.div>
  );
}
