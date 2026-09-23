import { createClient } from "@supabase/supabase-js";

// Supabase credentials provided by user
// Uses VITE_ env variables if available, otherwise falls back to the exact project credentials
const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  "https://dqttuwyqhbsqrtusxkwd.supabase.co";

const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  "sb_publishable_89FxAlHiEsyu0eSF1LhFVw_NXv-riY0";

// Client initialized strictly with the anon / publishable key (never service_role key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  is_kids: boolean;
  is_primary: boolean;
  favorite_genre?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WatchHistoryItem {
  id?: string;
  user_id?: string;
  profile_id: string;
  movie_id: string;
  movie_data?: any;
  viewed_at?: string;
}

export interface PlaybackProgressItem {
  id?: string;
  user_id?: string;
  profile_id: string;
  media_id: string;
  media_type: "movie" | "tv";
  current_time: number;
  duration: number;
  season?: number | null;
  episode?: number | null;
  show_progress?: Record<string, any>;
  updated_at?: string;
}

export interface FavoriteItem {
  id?: string;
  user_id?: string;
  profile_id: string;
  movie_id: string;
  movie_data?: any;
  created_at?: string;
}

export interface WatchlistItem {
  id?: string;
  user_id?: string;
  profile_id: string;
  movie_id: string;
  movie_data?: any;
  created_at?: string;
}

// Curated High-Definition Cult Cinema and Series Avatars (25 iconic solo characters)
export const DEFAULT_AVATARS = [
  // --- Iconic Movies ---
  {
    id: "tony-montana",
    name: "Scarface",
    character: "Tony Montana",
    url: "/avatars/tony-montana.jpg",
    category: "Movie"
  },
  {
    id: "vito-corleone",
    name: "The Godfather",
    character: "Vito Corleone",
    url: "/avatars/vito-corleone.jpg",
    category: "Movie"
  },
  {
    id: "michael-corleone",
    name: "The Godfather",
    character: "Michael Corleone",
    url: "/avatars/michael-corleone.jpg",
    category: "Movie"
  },
  {
    id: "the-joker",
    name: "The Dark Knight",
    character: "The Joker",
    url: "/avatars/the-joker.jpg",
    category: "Movie"
  },
  {
    id: "bruce-wayne",
    name: "The Dark Knight",
    character: "Bruce Wayne",
    url: "/avatars/bruce-wayne.jpg",
    category: "Movie"
  },
  {
    id: "tyler-durden",
    name: "Fight Club",
    character: "Tyler Durden",
    url: "/avatars/tyler-durden.jpg",
    category: "Movie"
  },
  {
    id: "neo",
    name: "The Matrix",
    character: "Neo",
    url: "/avatars/neo.jpg",
    category: "Movie"
  },
  {
    id: "john-wick",
    name: "John Wick",
    character: "John Wick",
    url: "/avatars/john-wick.jpg",
    category: "Movie"
  },
  {
    id: "jordan-belfort",
    name: "The Wolf of Wall Street",
    character: "Jordan Belfort",
    url: "/avatars/jordan-belfort.jpg",
    category: "Movie"
  },
  {
    id: "hannibal-lecter",
    name: "The Silence of the Lambs",
    character: "Hannibal Lecter",
    url: "/avatars/hannibal-lecter.jpg",
    category: "Movie"
  },

  // --- Top Iconic TV Series ---
  {
    id: "walter-white",
    name: "Breaking Bad",
    character: "Walter White",
    url: "/avatars/walter-white.jpg",
    category: "Series"
  },
  {
    id: "jesse-pinkman",
    name: "Breaking Bad",
    character: "Jesse Pinkman",
    url: "/avatars/jesse-pinkman.jpg",
    category: "Series"
  },
  {
    id: "gus-fring",
    name: "Breaking Bad",
    character: "Gus Fring",
    url: "/avatars/gus-fring.jpg",
    category: "Series"
  },
  {
    id: "saul-goodman",
    name: "Better Call Saul",
    character: "Saul Goodman",
    url: "/avatars/saul-goodman.jpg",
    category: "Series"
  },
  {
    id: "thomas-shelby",
    name: "Peaky Blinders",
    character: "Thomas Shelby",
    url: "/avatars/thomas-shelby.jpg",
    category: "Series"
  },
  {
    id: "arthur-shelby",
    name: "Peaky Blinders",
    character: "Arthur Shelby",
    url: "/avatars/arthur-shelby.jpg",
    category: "Series"
  },
  {
    id: "tony-soprano",
    name: "The Sopranos",
    character: "Tony Soprano",
    url: "/avatars/tony-soprano.jpg",
    category: "Series"
  },
  {
    id: "jon-snow",
    name: "Game of Thrones",
    character: "Jon Snow",
    url: "/avatars/jon-snow.jpg",
    category: "Series"
  },
  {
    id: "daenerys",
    name: "Game of Thrones",
    character: "Daenerys Targaryen",
    url: "/avatars/daenerys.jpg",
    category: "Series"
  },
  {
    id: "tyrion-lannister",
    name: "Game of Thrones",
    character: "Tyrion Lannister",
    url: "/avatars/tyrion-lannister.jpg",
    category: "Series"
  },
  {
    id: "eleven",
    name: "Stranger Things",
    character: "Eleven",
    url: "/avatars/eleven.jpg",
    category: "Series"
  },
  {
    id: "jim-hopper",
    name: "Stranger Things",
    character: "Jim Hopper",
    url: "/avatars/jim-hopper.jpg",
    category: "Series"
  },
  {
    id: "wednesday-addams",
    name: "Wednesday",
    character: "Wednesday Addams",
    url: "/avatars/wednesday-addams.jpg",
    category: "Series"
  },
  {
    id: "dexter-morgan",
    name: "Dexter",
    character: "Dexter Morgan",
    url: "/avatars/dexter-morgan.jpg",
    category: "Series"
  },
  {
    id: "ragnar-lothbrok",
    name: "Vikings",
    character: "Ragnar Lothbrok",
    url: "/avatars/ragnar-lothbrok.jpg",
    category: "Series"
  }
];
