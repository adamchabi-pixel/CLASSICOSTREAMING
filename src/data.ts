export interface Movie {
  trailerUrl?: string;
  originalLanguage?: string;
  similar?: any[];
  hasLogo?: boolean;
  logoUrl?: string;
  id: string;
  isIframeEmbed?: boolean;
  iframeSrc?: string;
  title: string;
  year: number;
  duration: string;
  voteAverage?: number;
  rating: string;
  director: string;
  cast: string[];
  castDetails?: { id: string; name: string; role?: string; imageUrl?: string; }[];
  genre: string[];
  description?: string;
  gradient?: string; // Tailwind gradient colors e.g., 'from-slate-900 to-indigo-950'
  accentColor?: string; // Tailwind text/border e.g., 'text-indigo-400 font-bold border-indigo-400'
  accentHex?: string; // Hex code for custom badges and glows
  symbol?: string; // Emoji symbols reflecting theme for graphic poster layout
  tagline?: string;
  streamUrl?: string;
  posterUrl?: string;
  backdropUrl?: string;
  isJellyfin?: boolean;
  customCategory?: string;
  tmdbId?: string;
  imdbId?: string;
  originalTitle?: string;
  studios?: string[];
  providerIds?: Record<string, string>;
  isTv?: boolean;
  seasons?: { season_number: number, name: string, episode_count: number, posterUrl?: string }[];
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  movies: Movie[];
}

import { TMDB_COLLECTIONS } from "./data/tmdb_collections";

export const COLLECTIONS: Collection[] = TMDB_COLLECTIONS;
