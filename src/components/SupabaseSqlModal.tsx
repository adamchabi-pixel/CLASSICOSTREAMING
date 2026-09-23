import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Check, Database, ShieldCheck, ExternalLink } from "lucide-react";

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_MIGRATION_TEXT = `-- 1. PROFILES TABLE (Max 5 profils par utilisateur)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 30),
  avatar_url TEXT NOT NULL,
  is_kids BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 2. WATCH HISTORY (Par profil)
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  movie_data JSONB DEFAULT '{}'::jsonb,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_history_profile_movie UNIQUE (profile_id, movie_id)
);
CREATE INDEX IF NOT EXISTS idx_watch_history_profile_id ON public.watch_history(profile_id);

-- 3. PLAYBACK PROGRESS (Reprise de lecture par profil)
CREATE TABLE IF NOT EXISTS public.playback_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'movie',
  current_time NUMERIC NOT NULL DEFAULT 0,
  duration NUMERIC NOT NULL DEFAULT 0,
  season INT DEFAULT NULL,
  episode INT DEFAULT NULL,
  show_progress JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_progress_profile_media UNIQUE (profile_id, media_id)
);
CREATE INDEX IF NOT EXISTS idx_playback_progress_profile_id ON public.playback_progress(profile_id);

-- 4. FAVORITES (Favoris par profil)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  movie_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_favorites_profile_movie UNIQUE (profile_id, movie_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_profile_id ON public.favorites(profile_id);

-- 5. WATCHLIST ("Ma liste" par profil)
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  movie_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_watchlist_profile_movie UNIQUE (profile_id, movie_id)
);
CREATE INDEX IF NOT EXISTS idx_watchlist_profile_id ON public.watchlist(profile_id);

-- ROW LEVEL SECURITY (RLS) ACTIVÉ SUR TOUTES LES TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- POLICIES PROFILES
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
CREATE POLICY "Users can view own profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
CREATE POLICY "Users can insert own profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
CREATE POLICY "Users can update own profiles" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own profiles" ON public.profiles;
CREATE POLICY "Users can delete own profiles" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POLICIES WATCH HISTORY
DROP POLICY IF EXISTS "Users can view own watch history" ON public.watch_history;
CREATE POLICY "Users can view own watch history" ON public.watch_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own watch history" ON public.watch_history;
CREATE POLICY "Users can insert own watch history" ON public.watch_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own watch history" ON public.watch_history;
CREATE POLICY "Users can update own watch history" ON public.watch_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own watch history" ON public.watch_history;
CREATE POLICY "Users can delete own watch history" ON public.watch_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POLICIES PLAYBACK PROGRESS
DROP POLICY IF EXISTS "Users can view own playback progress" ON public.playback_progress;
CREATE POLICY "Users can view own playback progress" ON public.playback_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own playback progress" ON public.playback_progress;
CREATE POLICY "Users can insert own playback progress" ON public.playback_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own playback progress" ON public.playback_progress;
CREATE POLICY "Users can update own playback progress" ON public.playback_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own playback progress" ON public.playback_progress;
CREATE POLICY "Users can delete own playback progress" ON public.playback_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POLICIES FAVORITES
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own favorites" ON public.favorites;
CREATE POLICY "Users can update own favorites" ON public.favorites FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POLICIES WATCHLIST
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
CREATE POLICY "Users can view own watchlist" ON public.watchlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.watchlist;
CREATE POLICY "Users can insert own watchlist" ON public.watchlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own watchlist" ON public.watchlist;
CREATE POLICY "Users can update own watchlist" ON public.watchlist FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.watchlist;
CREATE POLICY "Users can delete own watchlist" ON public.watchlist FOR DELETE TO authenticated USING (auth.uid() = user_id);`;

export default function SupabaseSqlModal({ isOpen, onClose }: SupabaseSqlModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh] text-left"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-white">
                Migration SQL Supabase
              </h2>
              <p className="text-xs text-zinc-400">
                Tables, contraintes et sécurité Row Level Security (RLS)
              </p>
            </div>
          </div>

          <div className="my-3 p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-zinc-300 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              Instructions d'installation dans votre projet Supabase :
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 pl-1">
              <li>Ouvrez votre tableau de bord Supabase (<span className="text-zinc-200">dqttuwyqhbsqrtusxkwd</span>).</li>
              <li>Allez dans l'onglet <strong className="text-zinc-200">SQL Editor</strong>.</li>
              <li>Cliquez sur <strong className="text-zinc-200">New query</strong>, collez le code ci-dessous et cliquez sur <strong className="text-emerald-400">Run</strong>.</li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div className="relative flex-1 overflow-hidden rounded-xl border border-neutral-800 bg-black/60 my-2">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copié !" : "Copier le script SQL"}</span>
              </button>
            </div>
            <pre className="p-4 pt-12 overflow-x-auto text-[11px] font-mono text-zinc-300 leading-relaxed max-h-[35vh] custom-scrollbar">
              {SQL_MIGRATION_TEXT}
            </pre>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Fichier sauvegardé dans <code className="text-amber-400/80 font-mono">supabase/migrations/</code>
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
