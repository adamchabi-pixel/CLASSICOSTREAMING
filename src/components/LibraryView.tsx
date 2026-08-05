import React, { useState, useEffect } from "react";
import { Search, Film as FilmIcon, Target, Compass, Sparkles, Smile, Shield, Video, Activity, Users, Wand2, Landmark, Ghost, Heart, Rocket, Eye, Star, Globe, Calendar, ChevronRight } from "lucide-react";
import { Movie } from "../data";
import MovieCard from "./MovieCard";
import LazyVirtualCard from "./LazyVirtualCard";
import { motion } from "framer-motion";

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";

const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/jbe4gVSfRlbPTdESXhEKpornsfu.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitnhR8xLG1QymTE.jpg" }
];

const LANGUAGES = [
  { id: "en", name: "English", icon: Globe },
  { id: "fr", name: "French", icon: Globe },
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
  { id: 10767, name: "Talk", icon: Users },
  { id: 10768, name: "Politics", icon: Landmark },
  { id: 37, name: "Western", icon: Star }
];

interface LibraryViewProps {
  onSelect: (m: Movie) => void;
  onPlay: (m: Movie) => void;
  getProgress: (id: string) => number;
  type?: 'movie' | 'tv';
}

export default function LibraryView({ onSelect, onPlay, getProgress, type = 'movie' }: LibraryViewProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        let queryParams = new URLSearchParams({
            type: type || 'movie',
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
               throw new Error("Le serveur a retourné une réponse invalide (peut-être en cours de rafraichissement).");
           }
           
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

           if (data && data.results) {
               const mapped = data.results.filter((r: any) => !isAnimeOrAdult(r)).map((r: any) => {
                   return {
                       id: (type === "tv" || r.media_type === "tv") ? String(r.id) + "-tv" : String(r.id),
                       tmdbId: String(r.id),
                       title: r.title || r.name,
                       originalTitle: r.original_title || r.original_name,
                       description: r.overview,
                       posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : "",
                       backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : "",
                       year: r.release_date ? parseInt(r.release_date.split("-")[0]) : (r.first_air_date ? parseInt(r.first_air_date.split("-")[0]) : 0),
                       releaseDate: r.release_date || r.first_air_date,
                       voteAverage: r.vote_average,
                       rating: r.vote_average ? r.vote_average.toFixed(1) : "?",
                       language: r.original_language,
                       isTv: type === "tv" || r.media_type === "tv",
                       duration: "Unknown",
                       director: "Unknown",
                       cast: [],
                       genre: []
                   } as unknown as Movie;
               });
               setMovies(mapped);
               if (mapped.length === 0 && data.results.length > 0) {
                   setErrorMsg("All results were filtered out.");
               }
               setTotalPages(Math.min(data.total_pages || 1, 500));
           } else {
               setErrorMsg("API returned ok, but no data.results.");
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
  }, [activePlatform, activeGenre, activeLanguage, activeYear, type, page]);

  return (
    <motion.div
      key={"tab-collections-" + type}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex flex-col md:flex-row h-screen pt-[48px] md:pt-[48px] px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto overflow-hidden gap-4 md:gap-8"
    >
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

      <div className="flex-1 flex flex-col gap-8 w-full min-w-0 h-full overflow-y-auto no-scrollbar pb-32">


          {/* Grid */}
             {loading ? (
                 <div className="flex items-center justify-center py-32">
                     <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                 </div>
             ) : errorMsg ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-80">
                    <FilmIcon className="w-16 h-16 text-red-500" />
                    <h3 className="text-xl font-bold text-red-400">Error Loading Movies</h3>
                    <p className="text-zinc-400 max-w-md">{errorMsg}</p>
                 </div>
             ) : movies.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                    <FilmIcon className="w-16 h-16 text-zinc-600" />
                    <h3 className="text-xl font-bold text-white">No Results</h3>
                    <p className="text-zinc-400">Try changing your filters.</p>
                  </div>
             ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
                    {movies.map(movie => (
                       <LazyVirtualCard key={movie.id} className="w-full aspect-[2/3]">
                          <MovieCard
                            movie={movie}
                            onSelect={onSelect}
                            onPlay={onPlay}
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
    </motion.div>
  );
}
