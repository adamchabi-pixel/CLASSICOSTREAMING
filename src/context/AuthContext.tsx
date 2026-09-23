import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, Profile, DEFAULT_AVATARS } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isTablesReady: boolean;
  
  // Auth actions
  signUp: (email: string, password: string, fullName?: string, avatarUrl?: string, favoriteGenre?: string) => Promise<{ error: AuthError | Error | null; isRateLimited?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  loginInstantaneously: (email: string, fullName?: string, avatarUrl?: string, favoriteGenre?: string) => void;

  // Profiles (Netflix-style)
  profiles: Profile[];
  activeProfile: Profile | null;
  isProfileSelectorOpen: boolean;
  setIsProfileSelectorOpen: (open: boolean) => void;
  selectProfile: (profile: Profile) => void;
  createProfile: (name: string, avatarUrl: string, isKids?: boolean) => Promise<{ profile?: Profile; error?: string }>;
  updateProfile: (profileId: string, updates: Partial<Profile>) => Promise<{ error?: string }>;
  deleteProfile: (profileId: string) => Promise<{ error?: string }>;

  // Profile-specific Data
  watchHistory: string[];
  addToHistory: (movieId: string, movieData?: any) => Promise<void>;
  removeFromHistory: (movieId: string) => Promise<void>;
  clearHistory: () => Promise<void>;

  favorites: string[];
  toggleFavorite: (movieId: string, movieData?: any) => Promise<void>;
  isFavorite: (movieId: string) => boolean;

  watchlist: string[];
  toggleWatchlist: (movieId: string, movieData?: any) => Promise<void>;
  isInWatchlist: (movieId: string) => boolean;

  playbackProgress: Record<string, any>;
  saveProgress: (
    mediaId: string, 
    currentTime: number, 
    duration: number, 
    isTv?: boolean, 
    season?: number, 
    episode?: number, 
    showProgress?: any
  ) => Promise<void>;

  // Auth Modal state
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  authModalInitialMode: "login" | "signup";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for local profile-scoped storage keys
const getStorageKey = (userId: string, profileId: string, type: string) => 
  `classico_u_${userId}_p_${profileId}_${type}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTablesReady, setIsTablesReady] = useState<boolean>(true);

  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState<boolean>(false);

  // Profile-specific state
  const [watchHistory, setWatchHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, any>>({});

  // Auth modal UI controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<"login" | "signup">("login");

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // 1. Check & Synchronize initial Auth Session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (isMounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
          } else {
            const savedInstant = localStorage.getItem("classico_instant_user");
            if (savedInstant) {
              try {
                const parsed = JSON.parse(savedInstant);
                if (parsed?.id) {
                  setUser(parsed);
                }
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        console.warn("[AUTH] Error initializing session:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen for real-time auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[AUTH] Event: ${event}`, newSession?.user?.email || "No session");
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      if (event === "SIGNED_OUT") {
        setProfiles([]);
        setActiveProfile(null);
        setWatchHistory([]);
        setFavorites([]);
        setWatchlist([]);
        setPlaybackProgress({});
        localStorage.removeItem("classico_active_profile_id");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch or initialize profiles when user changes
  const loadProfiles = useCallback(async (currentUser: User) => {
    try {
      // Attempt to query Supabase profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: true });

      if (error) {
        setIsTablesReady(false);
        const localProfilesKey = `classico_profiles_${currentUser.id}`;
        const raw = localStorage.getItem(localProfilesKey);
        let loadedProfiles: Profile[] = raw ? JSON.parse(raw) : [];

        if (loadedProfiles.length === 0) {
          // Generate default primary profile
          const primary: Profile = {
            id: "profile-1-" + currentUser.id.slice(0, 6),
            user_id: currentUser.id,
            name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Principal",
            avatar_url: currentUser.user_metadata?.avatar_url || DEFAULT_AVATARS[0].url,
            favorite_genre: currentUser.user_metadata?.favorite_genre || undefined,
            is_kids: false,
            is_primary: true,
            created_at: new Date().toISOString()
          };
          loadedProfiles = [primary];
          localStorage.setItem(localProfilesKey, JSON.stringify(loadedProfiles));
        }

        setProfiles(loadedProfiles);
        resolveActiveProfile(loadedProfiles);
        return;
      }

      setIsTablesReady(true);
      if (data && data.length > 0) {
        setProfiles(data as Profile[]);
        resolveActiveProfile(data as Profile[]);
      } else {
        // No profiles found in Supabase -> Auto-create primary profile
        const defaultName = currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Principal";
        const newProfile: Partial<Profile> = {
          user_id: currentUser.id,
          name: defaultName,
          avatar_url: currentUser.user_metadata?.avatar_url || DEFAULT_AVATARS[0].url,
          favorite_genre: currentUser.user_metadata?.favorite_genre || undefined,
          is_kids: false,
          is_primary: true
        };

        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (insertError) {
          console.warn("[AUTH] Could not insert default profile in Supabase:", insertError);
          // Fallback to local
          const fallbackProfile: Profile = {
            id: "profile-1-" + currentUser.id.slice(0, 6),
            user_id: currentUser.id,
            name: defaultName,
            avatar_url: currentUser.user_metadata?.avatar_url || DEFAULT_AVATARS[0].url,
            favorite_genre: currentUser.user_metadata?.favorite_genre || undefined,
            is_kids: false,
            is_primary: true,
            created_at: new Date().toISOString()
          };
          setProfiles([fallbackProfile]);
          resolveActiveProfile([fallbackProfile]);
        } else if (created) {
          setProfiles([created as Profile]);
          resolveActiveProfile([created as Profile]);
        }
      }
    } catch (e) {
      console.warn("[AUTH] Error loading profiles, using local fallback:", e);
      const localProfilesKey = `classico_profiles_${currentUser.id}`;
      const raw = localStorage.getItem(localProfilesKey);
      let loadedProfiles: Profile[] = raw ? JSON.parse(raw) : [];

      if (loadedProfiles.length === 0) {
        const primary: Profile = {
          id: "profile-1-" + currentUser.id.slice(0, 6),
          user_id: currentUser.id,
          name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Principal",
          avatar_url: currentUser.user_metadata?.avatar_url || DEFAULT_AVATARS[0].url,
          favorite_genre: currentUser.user_metadata?.favorite_genre || undefined,
          is_kids: false,
          is_primary: true,
          created_at: new Date().toISOString()
        };
        loadedProfiles = [primary];
        localStorage.setItem(localProfilesKey, JSON.stringify(loadedProfiles));
      }

      setProfiles(loadedProfiles);
      resolveActiveProfile(loadedProfiles);
    }
  }, []);

  const resolveActiveProfile = (profileList: Profile[]) => {
    if (!profileList || profileList.length === 0) return;
    const savedId = localStorage.getItem("classico_active_profile_id");
    const matched = profileList.find(p => p.id === savedId);
    if (matched) {
      setActiveProfile(matched);
    } else {
      const primary = profileList.find(p => p.is_primary) || profileList[0];
      setActiveProfile(primary);
      localStorage.setItem("classico_active_profile_id", primary.id);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfiles(user);
    } else {
      // Disconnected / guest mode: completely wipe session data
      setProfiles([]);
      setActiveProfile(null);
      setWatchHistory([]);
      setPlaybackProgress({});
      setFavorites([]);
      setWatchlist([]);
      try {
        localStorage.removeItem("classico_progress");
        localStorage.removeItem("classico_history");
        localStorage.removeItem("classico_watchlist");
        localStorage.removeItem("classico_favorites");
        localStorage.removeItem("classico_tv_state");
        window.dispatchEvent(new CustomEvent("classico_progress_updated"));
      } catch (e) {}
    }
  }, [user, loadProfiles]);

  // 3. Load profile-specific data whenever activeProfile changes
  useEffect(() => {
    if (!user || !activeProfile) return;

    let isMounted = true;
    const userId = user.id;
    const profileId = activeProfile.id;

    async function loadProfileData() {
      // 1. History
      let loadedHistory: string[] = [];
      if (isTablesReady) {
        try {
          const { data, error } = await supabase
            .from("watch_history")
            .select("movie_id")
            .eq("profile_id", profileId)
            .order("viewed_at", { ascending: false });

          if (!error && data && data.length > 0) {
            loadedHistory = data.map(d => d.movie_id);
          }
        } catch {}
      }
      
      const cleanEmail = user.email ? user.email.toLowerCase().trim() : "";
      const userKey = `classico_user_progress_${userId}`;
      const emailKey = cleanEmail ? `classico_email_progress_${cleanEmail}` : null;
      const profileKey = getStorageKey(userId, profileId, "progress");

      if (loadedHistory.length === 0) {
        const localHist = 
          localStorage.getItem(getStorageKey(userId, profileId, "history")) ||
          localStorage.getItem(`classico_user_history_${userId}`) ||
          (cleanEmail ? localStorage.getItem(`classico_email_history_${cleanEmail}`) : null) ||
          localStorage.getItem("classico_history");
        if (localHist) {
          try { loadedHistory = JSON.parse(localHist); } catch {}
        }
      }

      if (isMounted) {
        setWatchHistory(loadedHistory);
        localStorage.setItem("classico_history", JSON.stringify(loadedHistory));
        localStorage.setItem(getStorageKey(userId, profileId, "history"), JSON.stringify(loadedHistory));
        localStorage.setItem(`classico_user_history_${userId}`, JSON.stringify(loadedHistory));
        if (cleanEmail) localStorage.setItem(`classico_email_history_${cleanEmail}`, JSON.stringify(loadedHistory));
      }

      // 2. Favorites
      let loadedFavorites: string[] = [];
      if (isTablesReady) {
        try {
          const { data, error } = await supabase
            .from("favorites")
            .select("movie_id")
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            loadedFavorites = data.map(d => d.movie_id);
          }
        } catch {}
      }

      if (loadedFavorites.length === 0) {
        const localFav = 
          localStorage.getItem(getStorageKey(userId, profileId, "favorites")) ||
          localStorage.getItem(`classico_user_favorites_${userId}`) ||
          (cleanEmail ? localStorage.getItem(`classico_email_favorites_${cleanEmail}`) : null) ||
          localStorage.getItem("classico_favorites");
        if (localFav) {
          try { loadedFavorites = JSON.parse(localFav); } catch {}
        }
      }

      if (isMounted) {
        setFavorites(loadedFavorites);
        localStorage.setItem("classico_favorites", JSON.stringify(loadedFavorites));
        localStorage.setItem(getStorageKey(userId, profileId, "favorites"), JSON.stringify(loadedFavorites));
        localStorage.setItem(`classico_user_favorites_${userId}`, JSON.stringify(loadedFavorites));
        if (cleanEmail) localStorage.setItem(`classico_email_favorites_${cleanEmail}`, JSON.stringify(loadedFavorites));
      }

      // 3. Watchlist
      let loadedWatchlist: string[] = [];
      if (isTablesReady) {
        try {
          const { data, error } = await supabase
            .from("watchlist")
            .select("movie_id")
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            loadedWatchlist = data.map(d => d.movie_id);
          }
        } catch {}
      }

      if (loadedWatchlist.length === 0) {
        const localWatch = 
          localStorage.getItem(getStorageKey(userId, profileId, "watchlist")) ||
          localStorage.getItem(`classico_user_watchlist_${userId}`) ||
          (cleanEmail ? localStorage.getItem(`classico_email_watchlist_${cleanEmail}`) : null) ||
          localStorage.getItem("classico_watchlist");
        if (localWatch) {
          try { loadedWatchlist = JSON.parse(localWatch); } catch {}
        }
      }

      if (isMounted) {
        setWatchlist(loadedWatchlist);
        localStorage.setItem("classico_watchlist", JSON.stringify(loadedWatchlist));
        localStorage.setItem(getStorageKey(userId, profileId, "watchlist"), JSON.stringify(loadedWatchlist));
        localStorage.setItem(`classico_user_watchlist_${userId}`, JSON.stringify(loadedWatchlist));
        if (cleanEmail) localStorage.setItem(`classico_email_watchlist_${cleanEmail}`, JSON.stringify(loadedWatchlist));
      }

      // 4. Playback Progress
      let loadedProgress: Record<string, any> = {};
      if (isTablesReady) {
        try {
          const { data, error } = await supabase
            .from("playback_progress")
            .select("*")
            .eq("profile_id", profileId);

          if (!error && data && data.length > 0) {
            data.forEach((row: any) => {
              loadedProgress[row.media_id] = {
                currentTime: Number(row.current_time),
                duration: Number(row.duration),
                season: row.season,
                episode: row.episode,
                show_progress: row.show_progress,
                type: row.media_type
              };
            });
          }
        } catch {}
      }

      if (Object.keys(loadedProgress).length === 0) {
        const localProg = 
          localStorage.getItem(profileKey) ||
          localStorage.getItem(userKey) ||
          (emailKey ? localStorage.getItem(emailKey) : null) ||
          localStorage.getItem("classico_progress");
        if (localProg) {
          try { loadedProgress = JSON.parse(localProg) || {}; } catch {}
        }
      }

      if (isMounted) {
        setPlaybackProgress(loadedProgress);
        localStorage.setItem("classico_progress", JSON.stringify(loadedProgress));
        localStorage.setItem(profileKey, JSON.stringify(loadedProgress));
        localStorage.setItem(userKey, JSON.stringify(loadedProgress));
        if (emailKey) localStorage.setItem(emailKey, JSON.stringify(loadedProgress));
        window.dispatchEvent(new CustomEvent("classico_progress_updated"));
      }
    }

    loadProfileData();

    // Listen to video player updates during streaming to persist directly to user account
    const handleProgressUpdate = () => {
      try {
        const cleanEmail = user.email ? user.email.toLowerCase().trim() : "";
        const userKey = `classico_user_progress_${userId}`;
        const emailKey = cleanEmail ? `classico_email_progress_${cleanEmail}` : null;
        const profileKey = getStorageKey(userId, profileId, "progress");

        const currentRaw = localStorage.getItem("classico_progress");
        if (currentRaw) {
          const currentParsed = JSON.parse(currentRaw);
          localStorage.setItem(profileKey, currentRaw);
          localStorage.setItem(userKey, currentRaw);
          if (emailKey) localStorage.setItem(emailKey, currentRaw);
          setPlaybackProgress(currentParsed);

          if (isTablesReady) {
            Object.entries(currentParsed).forEach(([mId, pData]: [string, any]) => {
              const curTime = Number(pData?.currentTime ?? 0);
              const dur = Number(pData?.duration ?? 0);
              if (curTime > 0) {
                Promise.resolve(
                  supabase
                    .from("playback_progress")
                    .upsert({
                      user_id: userId,
                      profile_id: profileId,
                      media_id: mId,
                      media_type: pData?.type || (mId.includes("-tv") ? "tv" : "movie"),
                      current_time: curTime,
                      duration: dur,
                      season: pData?.season ?? null,
                      episode: pData?.episode ?? null,
                      show_progress: pData?.show_progress ?? {},
                      updated_at: new Date().toISOString()
                    }, { onConflict: "profile_id,media_id" })
                ).catch(() => {});
              }
            });
          }
        }

        const histRaw = localStorage.getItem("classico_history");
        if (histRaw) {
          const histParsed = JSON.parse(histRaw);
          localStorage.setItem(getStorageKey(userId, profileId, "history"), histRaw);
          localStorage.setItem(`classico_user_history_${userId}`, histRaw);
          if (cleanEmail) localStorage.setItem(`classico_email_history_${cleanEmail}`, histRaw);
          setWatchHistory(histParsed);

          if (isTablesReady && Array.isArray(histParsed)) {
            histParsed.slice(0, 10).forEach(mId => {
              Promise.resolve(
                supabase
                  .from("watch_history")
                  .upsert({
                    user_id: userId,
                    profile_id: profileId,
                    movie_id: String(mId),
                    viewed_at: new Date().toISOString()
                  }, { onConflict: "profile_id,movie_id" })
                ).catch(() => {});
            });
          }
        }
      } catch (e) {}
    };

    window.addEventListener("classico_progress_updated", handleProgressUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("classico_progress_updated", handleProgressUpdate);
    };
  }, [user, activeProfile, isTablesReady]);

  // Auth Operations
  const signUp = async (email: string, password: string, fullName?: string, avatarUrl?: string, favoriteGenre?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split("@")[0],
            avatar_url: avatarUrl || DEFAULT_AVATARS[0].url,
            favorite_genre: favoriteGenre || ""
          }
        }
      });
      if (error) {
        // If Supabase rate limits sending confirmation emails (default free tier is max 3 emails/hr)
        // Check if user was already created on earlier attempt
        if (error.message?.toLowerCase().includes("rate limit") || (error as any)?.code === "over_email_send_rate_limit") {
          const directLogin = await supabase.auth.signInWithPassword({ email, password });
          if (directLogin.data?.user) {
            setUser(directLogin.data.user);
            setSession(directLogin.data.session);
            return { error: null };
          }
          return { error, isRateLimited: true };
        }
        return { error };
      }
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const loginInstantaneously = useCallback((email: string, fullName?: string, avatarUrl?: string, favoriteGenre?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < cleanEmail.length; i++) {
      hash = ((hash << 5) - hash) + cleanEmail.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    const syntheticId = `00000000-0000-4000-8000-${hex.repeat(2).slice(0, 12)}`;

    const syntheticUser: User = {
      id: syntheticId,
      app_metadata: { provider: "email" },
      user_metadata: { 
        full_name: fullName || cleanEmail.split("@")[0],
        avatar_url: avatarUrl || DEFAULT_AVATARS[0].url,
        favorite_genre: favoriteGenre || ""
      },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: cleanEmail,
      phone: "",
      role: "authenticated",
      updated_at: new Date().toISOString()
    };

    setUser(syntheticUser);
    localStorage.setItem("classico_instant_user", JSON.stringify(syntheticUser));
    loadProfiles(syntheticUser);
    return syntheticUser;
  }, [loadProfiles]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) return { error };
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        const curProg = localStorage.getItem("classico_progress");
        if (curProg) {
          localStorage.setItem(`classico_user_progress_${user.id}`, curProg);
          if (user.email) localStorage.setItem(`classico_email_progress_${user.email.toLowerCase().trim()}`, curProg);
        }
        const curHist = localStorage.getItem("classico_history");
        if (curHist) {
          localStorage.setItem(`classico_user_history_${user.id}`, curHist);
          if (user.email) localStorage.setItem(`classico_email_history_${user.email.toLowerCase().trim()}`, curHist);
        }
        const curFav = localStorage.getItem("classico_favorites");
        if (curFav) {
          localStorage.setItem(`classico_user_favorites_${user.id}`, curFav);
          if (user.email) localStorage.setItem(`classico_email_favorites_${user.email.toLowerCase().trim()}`, curFav);
        }
        const curWatch = localStorage.getItem("classico_watchlist");
        if (curWatch) {
          localStorage.setItem(`classico_user_watchlist_${user.id}`, curWatch);
          if (user.email) localStorage.setItem(`classico_email_watchlist_${user.email.toLowerCase().trim()}`, curWatch);
        }
      }
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    } finally {
      localStorage.removeItem("classico_instant_user");
      localStorage.removeItem("classico_active_profile_id");
      localStorage.removeItem("classico_progress");
      localStorage.removeItem("classico_history");
      localStorage.removeItem("classico_watchlist");
      localStorage.removeItem("classico_favorites");
      localStorage.removeItem("classico_tv_state");

      setUser(null);
      setSession(null);
      setProfiles([]);
      setActiveProfile(null);
      setWatchHistory([]);
      setPlaybackProgress({});
      setFavorites([]);
      setWatchlist([]);

      window.dispatchEvent(new CustomEvent("classico_progress_updated"));
    }
  };

  // Profile Management Operations
  const selectProfile = (profile: Profile) => {
    setActiveProfile(profile);
    localStorage.setItem("classico_active_profile_id", profile.id);
    setIsProfileSelectorOpen(false);
  };

  const createProfile = async (name: string, avatarUrl: string, isKids: boolean = false) => {
    if (!user) return { error: "You must be signed in to create a profile" };
    if (profiles.length >= 5) {
      return { error: "Maximum limit of 5 profiles reached for this account." };
    }
    const cleanName = name.trim();
    if (!cleanName) return { error: "Profile name cannot be empty." };

    try {
      if (isTablesReady) {
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            name: cleanName,
            avatar_url: avatarUrl,
            is_kids: isKids,
            is_primary: profiles.length === 0
          })
          .select()
          .single();

        if (error) throw error;
        const newProf = data as Profile;
        const next = [...profiles, newProf];
        setProfiles(next);
        selectProfile(newProf);
        return { profile: newProf };
      } else {
        // Local fallback
        const newProf: Profile = {
          id: `profile-${Date.now()}-${user.id.slice(0, 4)}`,
          user_id: user.id,
          name: cleanName,
          avatar_url: avatarUrl,
          is_kids: isKids,
          is_primary: profiles.length === 0,
          created_at: new Date().toISOString()
        };
        const next = [...profiles, newProf];
        setProfiles(next);
        localStorage.setItem(`classico_profiles_${user.id}`, JSON.stringify(next));
        selectProfile(newProf);
        return { profile: newProf };
      }
    } catch (e: any) {
      console.error("[PROFILE] Error creating profile:", e);
      return { error: e.message || "Failed to create profile." };
    }
  };

  const updateProfile = async (profileId: string, updates: Partial<Profile>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      if (isTablesReady) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", profileId)
          .eq("user_id", user.id);

        if (error) throw error;
      }

      setProfiles(prev => {
        const updated = prev.map(p => p.id === profileId ? { ...p, ...updates } : p);
        if (!isTablesReady) {
          localStorage.setItem(`classico_profiles_${user.id}`, JSON.stringify(updated));
        }
        return updated;
      });

      if (activeProfile?.id === profileId) {
        setActiveProfile(prev => prev ? { ...prev, ...updates } : null);
      }
      return {};
    } catch (e: any) {
      return { error: e.message };
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!user) return { error: "Not authenticated" };
    if (profiles.length <= 1) {
      return { error: "You must have at least one profile." };
    }

    try {
      if (isTablesReady) {
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", profileId)
          .eq("user_id", user.id);

        if (error) throw error;
      }

      const updated = profiles.filter(p => p.id !== profileId);
      setProfiles(updated);
      if (!isTablesReady) {
        localStorage.setItem(`classico_profiles_${user.id}`, JSON.stringify(updated));
      }

      if (activeProfile?.id === profileId) {
        const next = updated[0];
        selectProfile(next);
      }
      return {};
    } catch (e: any) {
      return { error: e.message };
    }
  };

  // Watch History Operations (Per Profile)
  const addToHistory = async (movieId: string, movieData?: any) => {
    const cleanId = String(movieId || "");
    if (!cleanId) return;

    // Optimistic update
    setWatchHistory(prev => [cleanId, ...prev.filter(id => id !== cleanId)].slice(0, 50));

    if (!user || !activeProfile) {
      // Guest update
      const existing = JSON.parse(localStorage.getItem("classico_history") || "[]");
      const updated = [cleanId, ...existing.filter((id: string) => id !== cleanId)].slice(0, 50);
      localStorage.setItem("classico_history", JSON.stringify(updated));
      return;
    }

    const userId = user.id;
    const profileId = activeProfile.id;

    // Save locally
    const storageKey = getStorageKey(userId, profileId, "history");
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updated = [cleanId, ...existing.filter((id: string) => id !== cleanId)].slice(0, 50);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (isTablesReady) {
      try {
        await supabase
          .from("watch_history")
          .upsert({
            user_id: userId,
            profile_id: profileId,
            movie_id: cleanId,
            movie_data: movieData || {},
            viewed_at: new Date().toISOString()
          }, { onConflict: "profile_id,movie_id" });
      } catch (e) {
        console.warn("[HISTORY] Supabase sync error:", e);
      }
    }
  };

  const removeFromHistory = async (movieId: string) => {
    const cleanId = String(movieId || "");
    setWatchHistory(prev => prev.filter(id => id !== cleanId));

    if (!user || !activeProfile) {
      const existing = JSON.parse(localStorage.getItem("classico_history") || "[]");
      localStorage.setItem("classico_history", JSON.stringify(existing.filter((id: string) => id !== cleanId)));
      return;
    }

    const userId = user.id;
    const profileId = activeProfile.id;
    const storageKey = getStorageKey(userId, profileId, "history");
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    localStorage.setItem(storageKey, JSON.stringify(existing.filter((id: string) => id !== cleanId)));

    if (isTablesReady) {
      try {
        await supabase
          .from("watch_history")
          .delete()
          .eq("profile_id", profileId)
          .eq("movie_id", cleanId);
      } catch (e) {
        console.warn("[HISTORY] Supabase delete error:", e);
      }
    }
  };

  const clearHistory = async () => {
    setWatchHistory([]);
    if (!user || !activeProfile) {
      localStorage.removeItem("classico_history");
      return;
    }
    const userId = user.id;
    const profileId = activeProfile.id;
    localStorage.removeItem(getStorageKey(userId, profileId, "history"));

    if (isTablesReady) {
      try {
        await supabase
          .from("watch_history")
          .delete()
          .eq("profile_id", profileId);
      } catch (e) {
        console.warn("[HISTORY] Supabase clear error:", e);
      }
    }
  };

  // Favorites Operations (Per Profile)
  const isFavorite = (movieId: string) => favorites.includes(String(movieId));

  const toggleFavorite = async (movieId: string, movieData?: any) => {
    const cleanId = String(movieId || "");
    if (!cleanId) return;

    const exists = favorites.includes(cleanId);
    const updated = exists ? favorites.filter(id => id !== cleanId) : [cleanId, ...favorites];
    setFavorites(updated);

    if (!user || !activeProfile) {
      localStorage.setItem("classico_favorites", JSON.stringify(updated));
      return;
    }

    const userId = user.id;
    const profileId = activeProfile.id;
    localStorage.setItem(getStorageKey(userId, profileId, "favorites"), JSON.stringify(updated));

    if (isTablesReady) {
      try {
        if (exists) {
          await supabase
            .from("favorites")
            .delete()
            .eq("profile_id", profileId)
            .eq("movie_id", cleanId);
        } else {
          await supabase
            .from("favorites")
            .upsert({
              user_id: userId,
              profile_id: profileId,
              movie_id: cleanId,
              movie_data: movieData || {}
            }, { onConflict: "profile_id,movie_id" });
        }
      } catch (e) {
        console.warn("[FAVORITES] Supabase sync error:", e);
      }
    }
  };

  // Watchlist Operations (Per Profile)
  const isInWatchlist = (movieId: string) => watchlist.includes(String(movieId));

  const toggleWatchlist = async (movieId: string, movieData?: any) => {
    const cleanId = String(movieId || "");
    if (!cleanId) return;

    const exists = watchlist.includes(cleanId);
    const updated = exists ? watchlist.filter(id => id !== cleanId) : [cleanId, ...watchlist];
    setWatchlist(updated);

    if (!user || !activeProfile) {
      localStorage.setItem("classico_watchlist", JSON.stringify(updated));
      return;
    }

    const userId = user.id;
    const profileId = activeProfile.id;
    localStorage.setItem(getStorageKey(userId, profileId, "watchlist"), JSON.stringify(updated));

    if (isTablesReady) {
      try {
        if (exists) {
          await supabase
            .from("watchlist")
            .delete()
            .eq("profile_id", profileId)
            .eq("movie_id", cleanId);
        } else {
          await supabase
            .from("watchlist")
            .upsert({
              user_id: userId,
              profile_id: profileId,
              movie_id: cleanId,
              movie_data: movieData || {}
            }, { onConflict: "profile_id,movie_id" });
        }
      } catch (e) {
        console.warn("[WATCHLIST] Supabase sync error:", e);
      }
    }
  };

  // Playback Progress Operations (Per Profile)
  const saveProgress = async (
    mediaId: string,
    currentTime: number,
    duration: number,
    isTv: boolean = false,
    season?: number,
    episode?: number,
    showProgress?: any
  ) => {
    const cleanId = String(mediaId || "");
    if (!cleanId) return;

    const itemData: any = {
      currentTime,
      duration,
      type: isTv ? "tv" : "movie",
      updated_at: new Date().toISOString()
    };
    if (season !== undefined) itemData.season = season;
    if (episode !== undefined) itemData.episode = episode;
    if (showProgress) itemData.show_progress = showProgress;

    setPlaybackProgress(prev => {
      const next = { ...prev, [cleanId]: itemData };
      localStorage.setItem("classico_progress", JSON.stringify(next));
      return next;
    });

    if (!user || !activeProfile) return;

    const userId = user.id;
    const profileId = activeProfile.id;
    const storageKey = getStorageKey(userId, profileId, "progress");
    const local = JSON.parse(localStorage.getItem(storageKey) || "{}");
    local[cleanId] = itemData;
    localStorage.setItem(storageKey, JSON.stringify(local));
    localStorage.setItem(`classico_user_progress_${userId}`, JSON.stringify(local));
    if (user.email) {
      localStorage.setItem(`classico_email_progress_${user.email.toLowerCase().trim()}`, JSON.stringify(local));
    }

    if (isTablesReady) {
      try {
        await supabase
          .from("playback_progress")
          .upsert({
            user_id: userId,
            profile_id: profileId,
            media_id: cleanId,
            media_type: isTv ? "tv" : "movie",
            current_time: currentTime,
            duration: duration,
            season: season ?? null,
            episode: episode ?? null,
            show_progress: showProgress ?? {},
            updated_at: new Date().toISOString()
          }, { onConflict: "profile_id,media_id" });
      } catch (e) {
        console.warn("[PROGRESS] Supabase sync error:", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isTablesReady,
        signUp,
        signIn,
        signOut,
        loginInstantaneously,
        profiles,
        activeProfile,
        isProfileSelectorOpen,
        setIsProfileSelectorOpen,
        selectProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        watchHistory,
        addToHistory,
        removeFromHistory,
        clearHistory,
        favorites,
        toggleFavorite,
        isFavorite,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        playbackProgress,
        saveProgress,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalInitialMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
