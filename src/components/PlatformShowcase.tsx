import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Film, Tv, Layers } from "lucide-react";
import { Movie } from "../data";
import MovieCard from "./MovieCard";
import LazyVirtualCard from "./LazyVirtualCard";
import { MomentumCarousel } from "./MomentumCarousel";

export interface PlatformItem {
  id: number;
  name: string;
  logo: string;
  badgeName?: string;
  brandColor?: string;
  filterClass?: string;
}

export const PLATFORMS_LIST: PlatformItem[] = [
  {
    id: 8,
    name: "Netflix",
    logo: "/platforms/netflix.svg",
    brandColor: "#E50914"
  },
  {
    id: 1899,
    name: "HBO Max",
    logo: "/platforms/hbo.svg",
    brandColor: "#5822b4"
  },
  {
    id: 337,
    name: "Disney+",
    logo: "/platforms/disney.svg",
    brandColor: "#113CCF"
  },
  {
    id: 9,
    name: "Prime Video",
    logo: "/platforms/prime.svg",
    brandColor: "#00A8E1"
  },
  {
    id: 350,
    name: "Apple TV+",
    logo: "/platforms/apple.svg",
    brandColor: "#ffffff"
  },
  {
    id: 531,
    name: "Paramount+",
    logo: "/platforms/paramount.svg",
    brandColor: "#0064FF"
  },
  {
    id: 15,
    name: "Hulu",
    logo: "/platforms/hulu.svg",
    brandColor: "#1CE783"
  }
];

interface PlatformShowcaseProps {
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  getProgress: (id: string) => number;
  onSeeAll?: (platformId: number) => void;
}

export default function PlatformShowcase({
  onSelectMovie,
  onPlayMovie,
  getProgress,
  onSeeAll
}: PlatformShowcaseProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem>(PLATFORMS_LIST[0]);
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [platformContent, setPlatformContent] = useState<{
    all: Movie[];
    movies: Movie[];
    series: Movie[];
  }>({ all: [], movies: [], series: [] });

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const cacheRef = useRef<Record<number, { all: Movie[]; movies: Movie[]; series: Movie[] }>>({});

  // Fetch movies and TV shows for selected platform
  useEffect(() => {
    let isCurrent = true;
    const platformId = selectedPlatform.id;

    if (cacheRef.current[platformId]) {
      setPlatformContent(cacheRef.current[platformId]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadPlatformMedia = async () => {
      try {
        const [resMovies, resTv] = await Promise.all([
          fetch(`/api/discover?type=movie&activePlatform=${platformId}`),
          fetch(`/api/discover?type=tv&activePlatform=${platformId}`)
        ]);

        const [dataMovies, dataTv] = await Promise.all([
          resMovies.ok ? resMovies.json() : { data: { results: [] } },
          resTv.ok ? resTv.json() : { data: { results: [] } }
        ]);

        const rawMovies = (dataMovies?.data?.results || dataMovies?.results || []).map((r: any) => ({
          id: String(r.id),
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
          isTv: false,
          duration: "Movie",
          director: ""
        })) as Movie[];

        const rawTv = (dataTv?.data?.results || dataTv?.results || []).map((r: any) => ({
          id: `${r.id}-tv`,
          tmdbId: String(r.id),
          title: r.name || r.title,
          originalTitle: r.original_name || r.original_title,
          description: r.overview,
          posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : "",
          backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : "",
          year: r.first_air_date ? parseInt(r.first_air_date.split("-")[0]) : 0,
          releaseDate: r.first_air_date,
          voteAverage: r.vote_average,
          rating: r.vote_average ? r.vote_average.toFixed(1) : "?",
          isTv: true,
          duration: "Series",
          director: ""
        })) as Movie[];

        // Interleave movies & series for a dynamic mixed showcase
        const maxLen = Math.max(rawMovies.length, rawTv.length);
        const combined: Movie[] = [];
        for (let i = 0; i < maxLen; i++) {
          if (i < rawMovies.length) combined.push(rawMovies[i]);
          if (i < rawTv.length) combined.push(rawTv[i]);
        }

        const packageData = {
          all: combined,
          movies: rawMovies,
          series: rawTv
        };

        cacheRef.current[platformId] = packageData;

        if (isCurrent) {
          setPlatformContent(packageData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load platform data:", err);
        if (isCurrent) setLoading(false);
      }
    };

    loadPlatformMedia();

    return () => {
      isCurrent = false;
    };
  }, [selectedPlatform.id]);

  const displayedList = 
    filterType === "movie" 
      ? platformContent.movies 
      : filterType === "tv" 
      ? platformContent.series 
      : platformContent.all;

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const distance = carouselRef.current.clientWidth * 0.75 * (direction === "left" ? -1 : 1);
    carouselRef.current.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <div className="space-y-5 text-left pt-8 sm:pt-10 border-t border-zinc-800/80">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-900 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono tracking-[3px] text-amber-500 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" /> STREAMING PLATFORMS
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-white uppercase tracking-widest leading-tight">
            Originals & Exclusives
          </h3>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-start sm:self-auto">
          {/* Content Type Filter: All / Movies / Series */}
          <div className="flex items-center gap-1 bg-neutral-900/90 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setFilterType("all")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-amber-400 text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All</span>
            </button>
            <button
              onClick={() => setFilterType("movie")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === "movie"
                  ? "bg-amber-400 text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => setFilterType("tv")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === "tv"
                  ? "bg-amber-400 text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Series</span>
            </button>
          </div>

          {/* See All Button - Encadré Gris */}
          {onSeeAll && (
            <button
              type="button"
              onClick={() => onSeeAll(selectedPlatform.id)}
              className="flex items-center gap-2 px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-700 hover:border-zinc-400 bg-neutral-900/90 hover:bg-neutral-800 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer shadow-md hover:shadow-zinc-800/40 active:scale-95 group"
              title={`See all titles on ${selectedPlatform.name}`}
            >
              <span>See all {selectedPlatform.name}</span>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Platforms Row: Symmetrically centered across FULL WIDTH on mobile, tablet, and desktop */}
      <div className="w-full flex items-center justify-center py-2 sm:py-3">
        <div className="flex w-full items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3.5 px-0.5 sm:px-1">
          {PLATFORMS_LIST.map((platform) => {
            const isSelected = selectedPlatform.id === platform.id;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => {
                  setSelectedPlatform(platform);
                }}
                className={`relative flex-1 min-w-0 h-11 sm:h-13 md:h-16 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer select-none group border-2 ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/15 shadow-[0_0_24px_rgba(245,158,11,0.4)] scale-[1.02] z-10"
                    : "border-zinc-700/80 bg-neutral-900/90 hover:border-amber-400/70 hover:bg-neutral-800/90 opacity-90 hover:opacity-100"
                }`}
                title={platform.name}
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

      {/* Selected Platform Content Carousel */}
      <div className="relative group/carousel pt-2">
        {/* Navigation Chevrons */}
        <div className="absolute inset-y-0 left-2 flex items-center z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-2 flex items-center z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
          <button
            type="button"
            onClick={() => scroll("right")}
            className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="w-full h-[280px] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Loading {selectedPlatform.name} catalog...
            </span>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="w-full py-16 text-center text-zinc-500 font-sans text-sm">
            No titles available for {selectedPlatform.name} at this time.
          </div>
        ) : (
          <MomentumCarousel
            id={`carousel-platform-${selectedPlatform.id}`}
            containerRef={(el) => {
              carouselRef.current = el;
            }}
            className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-2 px-1 pb-6 sm:pb-8"
          >
            {displayedList.slice(0, 40).map((movie, idx) => {
              const cardWidth = "w-[145px] min-[400px]:w-[165px] sm:w-[195px] md:w-[215px]";
              return (
                <LazyVirtualCard
                  key={`platform-${selectedPlatform.id}-${movie.id}-${idx}`}
                  priority={idx < 6}
                  className="shrink-0 flex items-start"
                  placeholderClassName={`${cardWidth} aspect-[2/3] rounded-none bg-neutral-900 border border-neutral-800/40 opacity-30`}
                >
                  <MovieCard
                    movie={movie}
                    variant="rectangular"
                    expandOnHover={true}
                    cardWidthClass={cardWidth}
                    onSelect={(m) => onSelectMovie(m)}
                    onPlay={(m) => onPlayMovie(m)}
                    progressPercent={getProgress(movie.id)}
                  />
                </LazyVirtualCard>
              );
            })}

            {/* End-of-carousel See All card */}
            {onSeeAll && (
              <div
                onClick={() => onSeeAll(selectedPlatform.id)}
                className="shrink-0 flex items-center justify-center cursor-pointer group"
              >
                <div className="w-[145px] min-[400px]:w-[165px] sm:w-[195px] md:w-[215px] aspect-[2/3] rounded-xl border border-zinc-700/80 hover:border-zinc-400 bg-neutral-900/80 hover:bg-neutral-800 flex flex-col items-center justify-center gap-3 text-center transition-all p-4 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 group-hover:border-zinc-500 flex items-center justify-center transition-colors shadow-sm">
                    <ChevronRight className="w-6 h-6 text-zinc-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-zinc-200 font-cinzel font-bold text-sm group-hover:text-white transition-colors">See All</div>
                    <div className="text-zinc-400 text-xs">{selectedPlatform.name}</div>
                  </div>
                </div>
              </div>
            )}
          </MomentumCarousel>
        )}
      </div>
    </div>
  );
}
