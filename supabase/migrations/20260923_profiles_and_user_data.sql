-- ==============================================================================
-- SUPABASE MIGRATION: Profiles, Watch History, Progress, Favorites & Watchlist
-- Row Level Security (RLS) is ENABLED on every table.
-- Users can only read, insert, update and delete data for their own account (auth.uid()).
-- Max 5 profiles per user account enforced by check & triggers.
-- ==============================================================================

-- 1. PROFILES TABLE (Up to 5 profiles per user)
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

-- Indices for fast querying by user
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 2. WATCH HISTORY (Per profile)
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
CREATE INDEX IF NOT EXISTS idx_watch_history_viewed_at ON public.watch_history(profile_id, viewed_at DESC);

-- 3. PLAYBACK PROGRESS (Per profile resume position)
CREATE TABLE IF NOT EXISTS public.playback_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'movie', -- 'movie' or 'tv'
  current_time NUMERIC NOT NULL DEFAULT 0,
  duration NUMERIC NOT NULL DEFAULT 0,
  season INT DEFAULT NULL,
  episode INT DEFAULT NULL,
  show_progress JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_progress_profile_media UNIQUE (profile_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_playback_progress_profile_id ON public.playback_progress(profile_id);

-- 4. FAVORITES (Per profile liked items)
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

-- 5. WATCHLIST (Per profile "Ma liste")
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Function to enforce max 5 profiles per user
CREATE OR REPLACE FUNCTION public.check_max_profiles_limit()
RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM public.profiles WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'A maximum of 5 profiles is allowed per account.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_max_profiles ON public.profiles;
CREATE TRIGGER trg_check_max_profiles
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.check_max_profiles_limit();

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
CREATE POLICY "Users can view own profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
CREATE POLICY "Users can insert own profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
CREATE POLICY "Users can update own profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profiles" ON public.profiles;
CREATE POLICY "Users can delete own profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- WATCH HISTORY POLICIES
DROP POLICY IF EXISTS "Users can view own watch history" ON public.watch_history;
CREATE POLICY "Users can view own watch history"
  ON public.watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own watch history" ON public.watch_history;
CREATE POLICY "Users can insert own watch history"
  ON public.watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own watch history" ON public.watch_history;
CREATE POLICY "Users can update own watch history"
  ON public.watch_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own watch history" ON public.watch_history;
CREATE POLICY "Users can delete own watch history"
  ON public.watch_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PLAYBACK PROGRESS POLICIES
DROP POLICY IF EXISTS "Users can view own playback progress" ON public.playback_progress;
CREATE POLICY "Users can view own playback progress"
  ON public.playback_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own playback progress" ON public.playback_progress;
CREATE POLICY "Users can insert own playback progress"
  ON public.playback_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own playback progress" ON public.playback_progress;
CREATE POLICY "Users can update own playback progress"
  ON public.playback_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own playback progress" ON public.playback_progress;
CREATE POLICY "Users can delete own playback progress"
  ON public.playback_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- FAVORITES POLICIES
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own favorites" ON public.favorites;
CREATE POLICY "Users can update own favorites"
  ON public.favorites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- WATCHLIST POLICIES
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.watchlist;
CREATE POLICY "Users can insert own watchlist"
  ON public.watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own watchlist" ON public.watchlist;
CREATE POLICY "Users can update own watchlist"
  ON public.watchlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.watchlist;
CREATE POLICY "Users can delete own watchlist"
  ON public.watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTO-CREATE DEFAULT PROFILE ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, avatar_url, is_primary, is_kids)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Principal'),
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    true,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
