import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Bookmark, 
  Heart, 
  History, 
  Play, 
  Clock, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  LogIn, 
  Film
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Movie } from "../data";
import MovieCard from "./MovieCard";
import AvatarPickerModal from "./AvatarPickerModal";
import { DEFAULT_AVATARS } from "../lib/supabase";

interface UserProfileViewProps {
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  getProgressPercent: (movieId: string, isTv?: boolean) => number;
}

export default function UserProfileView({
  allMovies,
  onSelectMovie,
  onPlayMovie,
  getProgressPercent
}: UserProfileViewProps) {
  const {
    user,
    activeProfile,
    openAuthModal,
    watchHistory,
    clearHistory,
    removeFromHistory,
    favorites,
    toggleFavorite,
    watchlist,
    toggleWatchlist,
    playbackProgress
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<"watchlist" | "favorites" | "history" | "continue">("watchlist");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Helper to resolve movies from IDs robustly
  const findMovie = (id: string): Movie | null => {
    if (!id) return null;
    const strId = String(id).trim();
    const clean = strId.replace(/-S\d+E\d+$/, "");
    const cleanWithoutTv = clean.replace(/(-tv)+$/g, "");
    const isTvSearch = strId.endsWith("-tv") || strId.includes("-S") || clean.endsWith("-tv");

    // 1. Strict match on isTv
    let match = allMovies.find(m => {
      const isTv = Boolean(m.isTv || String(m.id || "").endsWith("-tv"));
      if (isTvSearch !== isTv) return false;
      return String(m.id) === strId || String(m.id) === clean || String(m.id) === `${cleanWithoutTv}-tv` || String(m.tmdbId) === clean || String(m.tmdbId) === cleanWithoutTv;
    });
    if (match) return match;

    // 2. Fallback relaxed match
    match = allMovies.find(m => 
      String(m.id) === strId || 
      String(m.id) === clean || 
      String(m.id) === `${cleanWithoutTv}-tv` ||
      String(m.tmdbId) === clean ||
      String(m.tmdbId) === cleanWithoutTv ||
      String((m as any).imdbId || "") === clean
    );
    return match || null;
  };

  // Watchlist movies (deduplicated)
  const watchlistMovies = useMemo(() => {
    const seen = new Set<string>();
    const list: Movie[] = [];
    watchlist.forEach(id => {
      const m = findMovie(id);
      if (m && !seen.has(String(m.id))) {
        seen.add(String(m.id));
        list.push(m);
      }
    });
    return list;
  }, [watchlist, allMovies]);

  // Favorites movies (deduplicated)
  const favoritesMovies = useMemo(() => {
    const seen = new Set<string>();
    const list: Movie[] = [];
    favorites.forEach(id => {
      const m = findMovie(id);
      if (m && !seen.has(String(m.id))) {
        seen.add(String(m.id));
        list.push(m);
      }
    });
    return list;
  }, [favorites, allMovies]);

  // History movies (deduplicated)
  const historyMovies = useMemo(() => {
    const seen = new Set<string>();
    const list: Movie[] = [];
    watchHistory.forEach(id => {
      const m = findMovie(id);
      if (m && !seen.has(String(m.id))) {
        seen.add(String(m.id));
        list.push(m);
      }
    });
    return list;
  }, [watchHistory, allMovies]);

  // Continue Watching movies (items with progress > 0 and < 0.95)
  const continueWatchingMovies = useMemo(() => {
    const seen = new Set<string>();
    const list: { movie: Movie; progress: number; rawProgress: any }[] = [];

    const localProgRaw = localStorage.getItem("classico_progress");
    let localProg: Record<string, any> = {};
    if (localProgRaw) {
      try { localProg = JSON.parse(localProgRaw) || {}; } catch {}
    }
    const combined = { ...localProg, ...(playbackProgress || {}) };

    Object.keys(combined).forEach(key => {
      const prog = combined[key];
      if (!prog) return;

      let pct = 0;
      if (typeof prog === "number") {
        pct = prog;
      } else if (prog.type === "tv" && prog.show_progress) {
        const s = prog.last_season_watched || 1;
        const e = prog.last_episode_watched || 1;
        const ep = prog.show_progress[`s${s}e${e}`];
        if (ep?.progress?.duration > 0) {
          pct = ep.progress.watched / ep.progress.duration;
        } else {
          pct = 0.35;
        }
      } else if (prog.duration > 0) {
        pct = (prog.currentTime || 0) / prog.duration;
      } else if ((prog.currentTime || 0) > 0) {
        pct = 0.25;
      }

      if (pct > 0.01 && pct < 0.95) {
        const m = findMovie(key);
        if (m && !seen.has(String(m.id))) {
          seen.add(String(m.id));
          list.push({ movie: m, progress: pct, rawProgress: prog });
        }
      }
    });

    return list;
  }, [playbackProgress, allMovies]);

  const avatarUrl = activeProfile?.avatar_url || DEFAULT_AVATARS[0].url;
  const currentAvatar = DEFAULT_AVATARS.find(a => a.url === avatarUrl) || DEFAULT_AVATARS[0];

  // If not logged in, prompt sign in
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-900/70 border border-neutral-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-cinzel font-bold text-white tracking-wide">
              Classico Personal Space
            </h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Sign in to choose your cult cinema avatar (The Godfather, Scarface, Pulp Fiction, The Joker...) and synchronize your watchlist, favorites, and playback progress across devices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer uppercase tracking-wider font-['Montserrat',sans-serif]"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal("signup")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-neutral-700 hover:border-zinc-500 text-white font-semibold text-sm transition-all hover:bg-neutral-800/80 cursor-pointer uppercase tracking-wider font-['Montserrat',sans-serif]"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-8 py-8 space-y-10 text-left">
      {/* Profile Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-48 bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => setShowAvatarPicker(true)}
              className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl ring-4 ring-amber-500/20 shrink-0 cursor-pointer"
              title="Click to change avatar"
            >
              <img
                src={avatarUrl}
                alt={activeProfile?.name || "Profile"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-bold">
                <Sparkles className="w-4 h-4 text-amber-300 mb-0.5" />
                <span>Change</span>
              </div>
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-white tracking-wide">
                  {activeProfile?.name || "My Account"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
                  {currentAvatar.character} ({currentAvatar.name})
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Account: <span className="text-zinc-200">{user.email}</span>
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cloud Connected & Synced
                </span>
              </div>
            </div>
          </div>

          {/* Quick Profile Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Change Avatar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-3 overflow-x-auto custom-scrollbar">
        {[
          { id: "watchlist", label: "My List", count: watchlistMovies.length, icon: Bookmark },
          { id: "favorites", label: "Favorites", count: favoritesMovies.length, icon: Heart },
          { id: "continue", label: "Continue Watching", count: continueWatchingMovies.length, icon: Clock },
          { id: "history", label: "History", count: historyMovies.length, icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-amber-500 text-black shadow-md font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? "bg-black/30 text-white" : "bg-neutral-800 text-zinc-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Content Views */}
      <div>
        {/* 1. WATCHLIST */}
        {activeSubTab === "watchlist" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-cinzel font-bold text-white">
                My List ({watchlistMovies.length})
              </h3>
              <p className="text-xs text-zinc-500">
                Movies and series saved to your personal list
              </p>
            </div>

            {watchlistMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {watchlistMovies.map(movie => {
                  const rawPct = getProgressPercent(movie.id, !!movie.isTv);
                  const pct = rawPct > 1 ? rawPct / 100 : rawPct;
                  return (
                    <div key={movie.id} className="relative w-full aspect-[2/3]">
                      <MovieCard
                        movie={movie}
                        onSelect={() => onSelectMovie(movie)}
                        onPlay={() => onSelectMovie(movie)}
                        progressPercent={pct}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800/60 p-8 space-y-3">
                <Bookmark className="w-12 h-12 text-zinc-600 mx-auto stroke-1" />
                <h4 className="text-base font-semibold text-zinc-300">Your list is empty</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Click the bookmark icon on any movie or series to save it to your list and easily find it here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. FAVORITES */}
        {activeSubTab === "favorites" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-cinzel font-bold text-white">
                My Favorites ({favoritesMovies.length})
              </h3>
              <p className="text-xs text-zinc-500">
                Your personal all-time favorites
              </p>
            </div>

            {favoritesMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {favoritesMovies.map(movie => {
                  const rawPct = getProgressPercent(movie.id, !!movie.isTv);
                  const pct = rawPct > 1 ? rawPct / 100 : rawPct;
                  return (
                    <div key={movie.id} className="relative w-full aspect-[2/3]">
                      <MovieCard
                        movie={movie}
                        onSelect={() => onSelectMovie(movie)}
                        onPlay={() => onSelectMovie(movie)}
                        progressPercent={pct}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800/60 p-8 space-y-3">
                <Heart className="w-12 h-12 text-zinc-600 mx-auto stroke-1" />
                <h4 className="text-base font-semibold text-zinc-300">No favorites yet</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Add favorites by clicking the heart icon on any movie card or details modal.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. CONTINUE WATCHING */}
        {activeSubTab === "continue" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-cinzel font-bold text-white">
                Continue Watching ({continueWatchingMovies.length})
              </h3>
              <p className="text-xs text-zinc-500">
                Titles you haven't finished watching yet
              </p>
            </div>

            {continueWatchingMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {continueWatchingMovies.map(({ movie, progress }) => (
                  <div key={movie.id} className="relative w-full aspect-[2/3]">
                    <MovieCard
                      movie={movie}
                      onSelect={() => onSelectMovie(movie)}
                      onPlay={() => onSelectMovie(movie)}
                      progressPercent={progress > 1 ? progress / 100 : progress}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800/60 p-8 space-y-3">
                <Clock className="w-12 h-12 text-zinc-600 mx-auto stroke-1" />
                <h4 className="text-base font-semibold text-zinc-300">Nothing in progress</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Start watching any film or episode; your exact timestamp will automatically be tracked and saved here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. WATCH HISTORY */}
        {activeSubTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-cinzel font-bold text-white">
                  Watch History ({historyMovies.length})
                </h3>
                {historyMovies.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Chronological list of watched movies and series
              </p>
            </div>

            {historyMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {historyMovies.map(movie => {
                  const rawPct = getProgressPercent(movie.id, !!movie.isTv);
                  const pct = rawPct > 1 ? rawPct / 100 : rawPct;
                  return (
                    <div key={movie.id} className="relative group w-full aspect-[2/3]">
                      <MovieCard
                        movie={movie}
                        onSelect={() => onSelectMovie(movie)}
                        onPlay={() => onSelectMovie(movie)}
                        progressPercent={pct}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(movie.id);
                        }}
                        title="Remove from history"
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/80 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-30 cursor-pointer shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800/60 p-8 space-y-3">
                <History className="w-12 h-12 text-zinc-600 mx-auto stroke-1" />
                <h4 className="text-base font-semibold text-zinc-300">History is empty</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Watched films and episodes will appear here automatically.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
      />
    </div>
  );
}
