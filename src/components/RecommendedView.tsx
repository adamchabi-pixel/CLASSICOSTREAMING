import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Film as FilmIcon, 
  Tv, 
  Star, 
  Play, 
  Info, 
  Bookmark, 
  BookmarkCheck, 
  Compass, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Movie } from "../data";
import MovieCard from "./MovieCard";
import LazyVirtualCard from "./LazyVirtualCard";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendedViewProps {
  allMovies: Movie[];
  onSelect: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  getProgress: (id: string) => number;
  history: string[];
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
  favoriteGenre?: string;
  activeProfileName?: string;
  onOpenSignUp?: () => void;
  isLoggedIn?: boolean;
}

interface ScoredMovie {
  movie: Movie;
  matchScore: number;
  reason: string;
}

export default function RecommendedView({
  allMovies,
  onSelect,
  onPlay,
  getProgress,
  history,
  watchlist,
  toggleWatchlist,
  favoriteGenre,
  activeProfileName,
  onOpenSignUp,
  isLoggedIn = true
}: RecommendedViewProps) {
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");
  const [selectedTasteGenre, setSelectedTasteGenre] = useState<string | null>(null);

  // 1. Build a quick lookup map of movies
  const movieMap = useMemo(() => {
    const map = new Map<string, Movie>();
    allMovies.forEach(m => {
      if (m && m.id) {
        map.set(String(m.id).toLowerCase(), m);
        if (m.tmdbId) map.set(String(m.tmdbId), m);
      }
    });
    return map;
  }, [allMovies]);

  // 2. Identify movies user has actually engaged with (history + progress > 0)
  const watchedMovies = useMemo(() => {
    const list: Movie[] = [];
    const seenIds = new Set<string>();

    history.forEach(id => {
      const cleanId = String(id).toLowerCase();
      const found = movieMap.get(cleanId);
      if (found && !seenIds.has(found.id)) {
        seenIds.add(found.id);
        list.push(found);
      }
    });

    // Also check watchlist items
    watchlist.forEach(id => {
      const cleanId = String(id).toLowerCase();
      const found = movieMap.get(cleanId);
      if (found && !seenIds.has(found.id)) {
        seenIds.add(found.id);
        list.push(found);
      }
    });

    return list;
  }, [history, watchlist, movieMap]);

  // 3. Compute Taste Profile weights
  const tasteProfile = useMemo(() => {
    const genreWeights: Record<string, number> = {};
    const directorWeights: Record<string, number> = {};
    const actorWeights: Record<string, number> = {};

    // Boost chosen favorite genre if defined
    if (favoriteGenre) {
      // e.g. "Crime & Mafia" -> Crime, Mafia, Drama
      const parts = favoriteGenre.toLowerCase().split(/[&/,]+/).map(p => p.trim());
      parts.forEach(p => {
        genreWeights[p] = (genreWeights[p] || 0) + 12;
      });
      genreWeights[favoriteGenre.toLowerCase()] = 15;
    }

    if (selectedTasteGenre) {
      genreWeights[selectedTasteGenre.toLowerCase()] = (genreWeights[selectedTasteGenre.toLowerCase()] || 0) + 20;
    }

    watchedMovies.forEach(m => {
      // Genres
      if (Array.isArray(m.genre)) {
        m.genre.forEach(g => {
          const gNorm = g.toLowerCase().trim();
          genreWeights[gNorm] = (genreWeights[gNorm] || 0) + 4;
        });
      }

      // Directors
      if (m.director && m.director !== "Unknown") {
        const dNorm = m.director.toLowerCase().trim();
        directorWeights[dNorm] = (directorWeights[dNorm] || 0) + 6;
      }

      // Actors
      if (Array.isArray(m.cast)) {
        m.cast.slice(0, 3).forEach(actor => {
          const aNorm = actor.toLowerCase().trim();
          actorWeights[aNorm] = (actorWeights[aNorm] || 0) + 3;
        });
      }
    });

    // Sort top genres
    const topGenres = Object.entries(genreWeights)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return {
      genreWeights,
      directorWeights,
      actorWeights,
      topGenres
    };
  }, [watchedMovies, favoriteGenre, selectedTasteGenre]);

  // 4. Score every non-watched candidate movie
  const scoredMovies = useMemo<ScoredMovie[]>(() => {
    const watchedIds = new Set(watchedMovies.map(m => m.id));

    return allMovies
      .filter(m => m && m.id && m.title)
      .map(m => {
        let score = 65; // base baseline score
        let mainReason = "Must-watch masterpiece";

        const movieGenres = (m.genre || []).map(g => g.toLowerCase().trim());
        const movieDirector = (m.director || "").toLowerCase().trim();
        const movieCast = (m.cast || []).map(c => c.toLowerCase().trim());

        // Favorite genre match
        if (favoriteGenre) {
          const favLower = favoriteGenre.toLowerCase();
          if (movieGenres.some(g => favLower.includes(g) || g.includes(favLower))) {
            score += 15;
            mainReason = `Matches your favorite genre: ${favoriteGenre}`;
          }
        }

        // Selected interactive taste tag match
        if (selectedTasteGenre && movieGenres.some(g => g.includes(selectedTasteGenre.toLowerCase()))) {
          score += 20;
          mainReason = `Selected for ${selectedTasteGenre}`;
        }

        // Genre affinity
        let genreMatchCount = 0;
        movieGenres.forEach(g => {
          const w = tasteProfile.genreWeights[g];
          if (w) {
            score += Math.min(w * 2, 12);
            genreMatchCount++;
          }
        });

        if (genreMatchCount > 0 && mainReason === "Must-watch masterpiece") {
          const topG = movieGenres.find(g => tasteProfile.genreWeights[g]);
          if (topG) {
            mainReason = `Because you love ${topG.charAt(0).toUpperCase() + topG.slice(1)}`;
          }
        }

        // Director affinity
        if (movieDirector && tasteProfile.directorWeights[movieDirector]) {
          score += 15;
          mainReason = `Directed by ${m.director}`;
        }

        // Actor affinity
        const matchedActor = movieCast.find(a => tasteProfile.actorWeights[a]);
        if (matchedActor) {
          score += 10;
          if (mainReason === "Must-watch masterpiece") {
            const prettyActor = (m.cast || []).find(c => c.toLowerCase().trim() === matchedActor);
            mainReason = `Starring ${prettyActor || matchedActor}`;
          }
        }

        // Quality rating boost (voteAverage / rating)
        const numRating = m.voteAverage || parseFloat(m.rating || "0");
        if (numRating >= 8.5) score += 8;
        else if (numRating >= 7.8) score += 5;

        // Reduce slightly if user already watched it to prioritize fresh discoveries
        if (watchedIds.has(m.id)) {
          score -= 10;
        }

        // Clamp between 70% and 99%
        const finalScore = Math.min(99, Math.max(72, Math.round(score)));

        return {
          movie: m,
          matchScore: finalScore,
          reason: mainReason
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [allMovies, watchedMovies, tasteProfile, favoriteGenre, selectedTasteGenre]);

  // Filtered lists
  const filteredScored = useMemo(() => {
    return scoredMovies.filter(item => {
      if (filterType === "movie") return !item.movie.isTv;
      if (filterType === "tv") return !!item.movie.isTv;
      return true;
    });
  }, [scoredMovies, filterType]);

  // 5. Spotlight Hero: Best Recommendation
  const spotlightItem = useMemo(() => {
    return filteredScored.find(item => item.movie.backdropUrl && item.movie.description) || filteredScored[0];
  }, [filteredScored]);

  // 6. Rail: "Because you watched [Recent Movie]"
  const becauseYouWatched = useMemo(() => {
    if (watchedMovies.length === 0) return null;
    const sourceMovie = watchedMovies[0];
    const sourceGenres = (sourceMovie.genre || []).map(g => g.toLowerCase());
    
    const candidates = allMovies.filter(m => {
      if (m.id === sourceMovie.id) return false;
      if (filterType === "movie" && m.isTv) return false;
      if (filterType === "tv" && !m.isTv) return false;
      const mg = (m.genre || []).map(g => g.toLowerCase());
      return (
        (m.director && m.director === sourceMovie.director) ||
        mg.some(g => sourceGenres.includes(g))
      );
    });

    return {
      sourceMovie,
      recommendations: candidates.slice(0, 18)
    };
  }, [watchedMovies, allMovies, filterType]);

  // 7. Rail: "Top Picks for You" (highest match score)
  const topPicks = useMemo(() => {
    const list = spotlightItem ? filteredScored.filter(i => i.movie.id !== spotlightItem.movie.id) : filteredScored;
    return list.slice(0, 20);
  }, [filteredScored, spotlightItem]);

  // 8. Rail: "Binge-Worthy Series" or "Legendary Sagas"
  const seriesPicks = useMemo(() => {
    return scoredMovies
      .filter(item => !!item.movie.isTv)
      .slice(0, 16);
  }, [scoredMovies]);

  // 9. Rail: "High Octane Cinema Masterpieces" (Ratings 8.4+)
  const masterpiecesPicks = useMemo(() => {
    return scoredMovies
      .filter(item => {
        const rating = item.movie.voteAverage || parseFloat(item.movie.rating || "0");
        return rating >= 8.3;
      })
      .slice(0, 16);
  }, [scoredMovies]);

  // Interactive Quick Genre Filter options
  const popularTastePills = [
    { label: "Crime & Gangster", genre: "Crime" },
    { label: "Science Fiction", genre: "Science Fiction" },
    { label: "Action & Adrenaline", genre: "Action" },
    { label: "Unforgettable Drama", genre: "Drama" },
    { label: "Thrillers & Suspense", genre: "Thriller" }
  ];

  // 1. If not logged in, prompt user to create an account for personalized recommendations
  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center space-y-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-pulse" />
          </div>
          <div className="absolute -inset-4 bg-amber-500/10 blur-2xl -z-10 rounded-full" />
        </div>

        <div className="space-y-3 max-w-xl">
          <span className="text-[11px] font-mono uppercase tracking-[3px] text-amber-400 font-bold">
            Personalized For You
          </span>
          <h1 className="text-3xl sm:text-5xl font-cinzel font-black uppercase text-white tracking-wide leading-tight">
            Create an Account for Personalized Recommendations
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Create an account to get movie and series recommendations uniquely tailored to your taste. Track what you watch, save favorites to your watchlist, and unlock AI-powered recommendations that adapt to your viewing habits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {onOpenSignUp && (
            <button
              onClick={onOpenSignUp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-sans font-bold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Create an Account
            </button>
          )}
          {onOpenSignUp && (
            <button
              onClick={onOpenSignUp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-zinc-700 font-sans font-semibold text-sm uppercase tracking-wider transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-zinc-900 max-w-2xl w-full text-left">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">Tailored Suggestions</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">Picks matched to the genres, directors, and eras you enjoy.</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">Cloud Sync</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">Your watch history and progress synchronize across all your devices.</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">Match Score %</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">See how closely each movie aligns with your profile in real time.</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. If logged in but hasn't watched any movies yet
  if (watchedMovies.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center space-y-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <FilmIcon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
          </div>
          <div className="absolute -inset-4 bg-amber-500/10 blur-2xl -z-10 rounded-full" />
        </div>

        <div className="space-y-3 max-w-xl">
          <span className="text-[11px] font-mono uppercase tracking-[3px] text-amber-400 font-bold">
            No Watch History Yet
          </span>
          <h1 className="text-3xl sm:text-5xl font-cinzel font-black uppercase text-white tracking-wide leading-tight">
            Recommendations Activate When You Watch Movies
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Your personalized recommendations will start working once you begin watching movies and series! Start streaming a few titles, and our algorithm will automatically analyze your taste to recommend films you will love.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
              window.history.pushState({}, "", "/collections");
              window.dispatchEvent(new PopStateEvent("popstate"));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-sans font-bold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Explore Movie Catalog
          </button>
          <button
            onClick={() => {
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-zinc-700 font-sans font-semibold text-sm uppercase tracking-wider transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-zinc-900 max-w-2xl w-full text-left">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400">Step 1</span>
            <h4 className="text-xs font-bold text-white uppercase">Watch Any Title</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">Pick any film or episode from our curated collections.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400">Step 2</span>
            <h4 className="text-xs font-bold text-white uppercase">Train Your Taste</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">We detect the genres, directors, and styles you enjoy most.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400">Step 3</span>
            <h4 className="text-xs font-bold text-white uppercase">Get Top Matches</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">Return here anytime for a constantly refreshed list of top picks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 max-w-[2000px] mx-auto px-4 sm:px-8 py-6">
      
      {/* ========================================================== */}
      {/* 1. HEADER & PERSONALIZED TASTE PROFILE                     */}
      {/* ========================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-[3px] text-amber-400 font-bold">
              Curated Recommendations Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-cinzel font-black uppercase text-white tracking-wide flex flex-wrap items-center gap-2 sm:gap-3">
            <span>Recommended for</span>
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              {activeProfileName || "You"}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-1.5 max-w-2xl leading-relaxed">
            {watchedMovies.length > 0 ? (
              <>
                Personalized according to your <span className="text-stone-200 font-semibold">{watchedMovies.length} watched titles</span>
                {favoriteGenre ? <> and favorite genre <span className="text-amber-400 font-semibold">{favoriteGenre}</span></> : ""}.
              </>
            ) : favoriteGenre ? (
              <>
                Personalized suggestions based on your favorite genre <span className="text-amber-400 font-semibold">{favoriteGenre}</span>. Recommendations adapt with every title you watch.
              </>
            ) : (
              <>
                Exceptional cinematic curation based on legendary filmmakers, genres, and critical acclaim.
              </>
            )}
          </p>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-zinc-800 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-amber-500 text-black shadow-md font-mono"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("movie")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterType === "movie"
                ? "bg-amber-500 text-black shadow-md font-mono"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FilmIcon className="w-3.5 h-3.5" />
            <span>Movies</span>
          </button>
          <button
            onClick={() => setFilterType("tv")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterType === "tv"
                ? "bg-amber-500 text-black shadow-md font-mono"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Series</span>
          </button>
        </div>
      </div>

      {/* Quick Taste Tuning Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          Focus:
        </span>
        <button
          onClick={() => setSelectedTasteGenre(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer border ${
            selectedTasteGenre === null
              ? "bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold"
              : "bg-neutral-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
          }`}
        >
          All Genres
        </button>
        {popularTastePills.map(pill => {
          const isSel = selectedTasteGenre === pill.genre;
          return (
            <button
              key={pill.genre}
              onClick={() => setSelectedTasteGenre(isSel ? null : pill.genre)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer border ${
                isSel
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold"
                  : "bg-neutral-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* 2. SPOTLIGHT FEATURE: #1 TOP PICK FOR YOU                 */}
      {/* ========================================================== */}
      {spotlightItem && (
        <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-800/80 bg-gradient-to-b from-neutral-900 to-black shadow-2xl">
          {/* Backdrop Image with gradient masks */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src={spotlightItem.movie.backdropUrl || spotlightItem.movie.posterUrl}
              alt={spotlightItem.movie.title}
              className="w-full h-full object-cover object-center opacity-40 md:opacity-50 scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl space-y-4 text-left">
            {/* Match Badge & Category */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {spotlightItem.matchScore}% Match
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold tracking-wider uppercase">
                <Flame className="w-3.5 h-3.5" />
                #1 Recommendation
              </span>

              {spotlightItem.movie.isTv && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono uppercase">
                  TV Series
                </span>
              )}
            </div>

            {/* Why Recommended Subtitle */}
            <p className="text-xs sm:text-sm text-amber-300/90 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{spotlightItem.reason}</span>
            </p>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight drop-shadow-md">
              {spotlightItem.movie.title}
            </h2>

            {/* Meta row: Year, Duration, Rating, Director */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-mono">
              {spotlightItem.movie.year > 0 && (
                <span>{spotlightItem.movie.year}</span>
              )}
              {spotlightItem.movie.duration && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span>{spotlightItem.movie.duration}</span>
                </>
              )}
              {(spotlightItem.movie.voteAverage || spotlightItem.movie.rating) && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {spotlightItem.movie.voteAverage || spotlightItem.movie.rating}
                  </span>
                </>
              )}
              {spotlightItem.movie.director && spotlightItem.movie.director !== "Unknown" && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400 italic">Dir: {spotlightItem.movie.director}</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed line-clamp-3 font-sans max-w-2xl">
              {spotlightItem.movie.description}
            </p>

            {/* Action Buttons: Always open modal details first as requested */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelect(spotlightItem.movie)}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-sans font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-black stroke-[2.5]" />
                <span>View Details & Watch</span>
              </button>

              <button
                onClick={() => toggleWatchlist(spotlightItem.movie.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-sans font-semibold tracking-wider transition-all cursor-pointer ${
                  watchlist.includes(spotlightItem.movie.id)
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
                }`}
              >
                {watchlist.includes(spotlightItem.movie.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-rose-400" />
                    <span>In My Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. RAIL 1: TOP PICKS FOR YOU (MATCH SCORE GRID)            */}
      {/* ========================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-lg sm:text-2xl font-cinzel font-bold text-white uppercase tracking-wider">
                Top Matches
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Ranked according to your favorite genres, preferred filmmakers, and critical acclaim
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 pt-2">
          {topPicks.map((item, idx) => (
            <div key={`pick-${item.movie.id}-${idx}`} className="relative group">
              {/* Match Badge Tag */}
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-black tracking-wider shadow-lg">
                <span>{item.matchScore}%</span>
              </div>

              <LazyVirtualCard priority={idx < 6} className="w-full aspect-[2/3]">
                <MovieCard
                  movie={item.movie}
                  onSelect={onSelect}
                  onPlay={onSelect}
                  progressPercent={getProgress(item.movie.id)}
                />
              </LazyVirtualCard>

              {/* Sub-label showing reason */}
              <p className="text-[10px] text-zinc-400 line-clamp-1 mt-1 font-mono text-left group-hover:text-amber-300 transition-colors">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. RAIL 2: "BECAUSE YOU WATCHED [MOVIE]"                   */}
      {/* ========================================================== */}
      {becauseYouWatched && becauseYouWatched.recommendations.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <FilmIcon className="w-4 h-4 text-amber-400" />
              <h3 className="text-lg sm:text-2xl font-cinzel font-bold text-white uppercase tracking-wider">
                Because you watched <span className="text-amber-400 normal-case italic">"{becauseYouWatched.sourceMovie.title}"</span>
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Similar themes, narrative style, and cinematic atmosphere
            </p>
          </div>

          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 pt-2">
            {becauseYouWatched.recommendations.map((movie, idx) => (
              <LazyVirtualCard key={`byw-${movie.id}-${idx}`} priority={idx < 6} className="w-full aspect-[2/3]">
                <MovieCard
                  movie={movie}
                  onSelect={onSelect}
                  onPlay={onSelect}
                  progressPercent={getProgress(movie.id)}
                />
              </LazyVirtualCard>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================== */}
      {/* 5. RAIL 3: RECOMMENDED SERIES (IF FILTER ALLOWS)           */}
      {/* ========================================================== */}
      {filterType !== "movie" && seriesPicks.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-sky-400" />
              <h3 className="text-lg sm:text-2xl font-cinzel font-bold text-white uppercase tracking-wider">
                Binge-Worthy Recommended Series
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Critically acclaimed television sagas tailored to your taste
            </p>
          </div>

          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 pt-2">
            {seriesPicks.map((item, idx) => (
              <div key={`series-${item.movie.id}-${idx}`} className="relative group">
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-sky-500/40 text-sky-300 font-mono text-[10px] font-black tracking-wider shadow-lg">
                  <span>{item.matchScore}% Match</span>
                </div>

                <LazyVirtualCard priority={idx < 6} className="w-full aspect-[2/3]">
                  <MovieCard
                    movie={item.movie}
                    onSelect={onSelect}
                    onPlay={onSelect}
                    progressPercent={getProgress(item.movie.id)}
                  />
                </LazyVirtualCard>

                <p className="text-[10px] text-zinc-400 line-clamp-1 mt-1 font-mono text-left">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================== */}
      {/* 6. RAIL 4: MASTERPIECES (8.3+ RATINGS)                     */}
      {/* ========================================================== */}
      {masterpiecesPicks.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-lg sm:text-2xl font-cinzel font-bold text-white uppercase tracking-wider">
                Must-Watch Masterpieces
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              The highest peaks in the history of world cinema
            </p>
          </div>

          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 pt-2">
            {masterpiecesPicks.map((item, idx) => (
              <div key={`master-${item.movie.id}-${idx}`} className="relative group">
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono text-[10px] font-black tracking-wider shadow-lg">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.movie.voteAverage || item.movie.rating}</span>
                </div>

                <LazyVirtualCard priority={idx < 6} className="w-full aspect-[2/3]">
                  <MovieCard
                    movie={item.movie}
                    onSelect={onSelect}
                    onPlay={onSelect}
                    progressPercent={getProgress(item.movie.id)}
                  />
                </LazyVirtualCard>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom invitation if not logged in */}
      {!isLoggedIn && onOpenSignUp && (
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/20 via-neutral-900 to-black border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-lg font-cinzel font-bold text-white uppercase">
              Create your profile and enjoy tailored suggestions
            </h4>
            <p className="text-xs text-zinc-400 font-sans max-w-xl">
              Create your free Classico account, choose your cult avatar, and receive refined recommendations after every viewing.
            </p>
          </div>
          <button
            onClick={onOpenSignUp}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shrink-0 cursor-pointer"
          >
            Create free account
          </button>
        </div>
      )}
    </div>
  );
}
