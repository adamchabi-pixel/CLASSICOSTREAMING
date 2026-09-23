import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff,
  Film,
  Tv,
  Clapperboard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_AVATARS } from "../lib/supabase";

const MOVIE_GENRES = [
  "Action & Aventure",
  "Crime & Mafia",
  "Science-Fiction",
  "Drame & Chefs-d'œuvre",
  "Thriller & Mystère",
  "Horreur & Frisson",
  "Comédie & Culte",
  "Animation & Fantastique",
  "Western & Historique"
];

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalInitialMode,
    signIn, 
    signUp,
    loginInstantaneously
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState<"form" | "avatar">("form");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [favoriteGenre, setFavoriteGenre] = useState<string>(MOVIE_GENRES[0]);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(DEFAULT_AVATARS[0].url);
  const [avatarFilter, setAvatarFilter] = useState<"all" | "Movie" | "Series">("all");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalInitialMode);
      setSignupStep("form");
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsRateLimited(false);
      setSelectedAvatarUrl(DEFAULT_AVATARS[0].url);
    }
  }, [isAuthModalOpen, authModalInitialMode]);

  if (!isAuthModalOpen) return null;

  // Step 1 validation before opening avatar choice popup
  const handleProceedToAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername) {
      setErrorMsg("Please enter a username.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (!favoriteGenre) {
      setErrorMsg("Please select your favorite movie genre.");
      return;
    }

    // All fields are valid -> open avatar popup!
    setSignupStep("avatar");
  };

  // Final account creation submit
  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setErrorMsg(error.message || "Invalid credentials. Please verify your email and password.");
        } else {
          setSuccessMsg("Signed in successfully! Welcome back.");
          setTimeout(() => {
            closeAuthModal();
          }, 600);
        }
      } else {
        const { error } = await signUp(
          email.trim(), 
          password, 
          username.trim() || undefined,
          selectedAvatarUrl,
          favoriteGenre
        );

        if (error) {
          const msg = error.message || "";
          if (
            msg.toLowerCase().includes("rate limit") || 
            msg.toLowerCase().includes("email rate limit exceeded") ||
            msg.toLowerCase().includes("quota")
          ) {
            setIsRateLimited(true);
            setErrorMsg("Email verification rate limit reached. Click below to continue directly:");
          } else {
            setErrorMsg(msg || "Failed to create account. Please try again.");
          }
        } else {
          setSuccessMsg(`Welcome to Classico, ${username.trim() || 'Cinephile'}! Your profile is ready.`);
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAvatarInfo = DEFAULT_AVATARS.find(a => a.url === selectedAvatarUrl) || DEFAULT_AVATARS[0];

  const filteredAvatars = DEFAULT_AVATARS.filter(a => {
    if (avatarFilter === "all") return true;
    return a.category === avatarFilter;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-start justify-center pt-20 sm:pt-24 pb-10 px-4 sm:px-6 overflow-y-auto custom-scrollbar">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative w-full ${
            mode === "signup" && signupStep === "avatar" ? "max-w-3xl" : "max-w-lg"
          } bg-[#0c0c0e]/95 border border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.06)] overflow-hidden z-10 max-h-[86vh] overflow-y-auto custom-scrollbar backdrop-blur-2xl transition-all duration-300`}
        >
          {/* Subtle Golden Top Hairline & Ambient Glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-[100px] pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mode Tabs (Only visible when NOT in the avatar popup step) */}
          {!(mode === "signup" && signupStep === "avatar") && (
            <div className="flex items-center justify-center gap-8 sm:gap-12 border-b border-zinc-800/80 mb-6 pt-2">
              <button
                type="button"
                onClick={() => { setMode("login"); setSignupStep("form"); setErrorMsg(null); setSuccessMsg(null); }}
                className={`relative pb-3 px-3 font-['Montserrat',sans-serif] text-xs sm:text-sm font-bold tracking-[0.25em] uppercase transition-all duration-200 cursor-pointer ${
                  mode === "login" 
                    ? "text-white" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                SIGN IN
                {mode === "login" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,0.85)]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode("signup"); setSignupStep("form"); setErrorMsg(null); setSuccessMsg(null); }}
                className={`relative pb-3 px-3 font-['Montserrat',sans-serif] text-xs sm:text-sm font-bold tracking-[0.25em] uppercase transition-all duration-200 cursor-pointer ${
                  mode === "signup" 
                    ? "text-white" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                SIGN UP
                {mode === "signup" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,0.85)]" />
                )}
              </button>
            </div>
          )}

          {/* Alert messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rate limit bypass */}
          {isRateLimited && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-zinc-300 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-['Montserrat',sans-serif] tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Instant Access Available</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed text-left">
                Supabase email verification is rate-limited on the free tier. You can continue right away with your chosen character avatar:
              </p>
              <button
                type="button"
                onClick={() => {
                  loginInstantaneously(
                    email.trim() || "member@classico.tv", 
                    username.trim() || "Tony Montana", 
                    selectedAvatarUrl, 
                    favoriteGenre
                  );
                  setSuccessMsg(`Welcome, ${username.trim() || 'Alex'}! Profile created.`);
                  setTimeout(() => {
                    closeAuthModal();
                  }, 800);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Continue Instantly</span>
              </button>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-400 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {mode === "login" && (
            <div>
              <p className="text-xs text-zinc-400 font-sans text-center mb-6 max-w-sm mx-auto">
                Access your personal watch history, resume playback, and manage favorites.
              </p>

              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-['Montserrat',sans-serif] font-bold text-xs sm:text-sm tracking-[0.18em] uppercase transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>SIGN IN</span>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-zinc-900 text-center text-xs text-zinc-500">
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setSignupStep("form"); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-amber-400 hover:underline font-semibold cursor-pointer ml-1"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW 2: SIGN UP - STEP 1 (Username, Email, Password, Favorite Genre) - NO AVATARS SHOWN HERE */}
          {mode === "signup" && signupStep === "form" && (
            <div>
              <p className="text-xs text-zinc-400 font-sans text-center mb-6 max-w-sm mx-auto">
                Create your Classico account. You'll choose your cult character avatar on the next step.
              </p>

              <form onSubmit={handleProceedToAvatar} className="space-y-4">
                {/* 1. Username */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 flex items-center gap-1.5 font-['Montserrat',sans-serif]">
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Username</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. TonyMontana, Cinephile99"
                      className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 2. Email Address */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 flex items-center gap-1.5 font-['Montserrat',sans-serif]">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 3. Password */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 flex items-center gap-1.5 font-['Montserrat',sans-serif]">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (min 6 characters)"
                      className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 4. Favorite Movie Genre */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 flex items-center gap-1.5 font-['Montserrat',sans-serif]">
                    <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                    <span>Favorite Movie Genre</span>
                  </label>
                  <div className="relative">
                    <select
                      value={favoriteGenre}
                      onChange={(e) => setFavoriteGenre(e.target.value)}
                      className="w-full appearance-none bg-neutral-900/90 border border-neutral-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all cursor-pointer font-medium"
                    >
                      {MOVIE_GENRES.map((g) => (
                        <option key={g} value={g} className="bg-neutral-900 text-white py-1">
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Next Step Button */}
                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-['Montserrat',sans-serif] font-bold text-xs sm:text-sm tracking-[0.18em] uppercase transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>NEXT: CHOOSE YOUR AVATAR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-zinc-900 text-center text-xs text-zinc-500">
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-amber-400 hover:underline font-semibold cursor-pointer ml-1"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW 3: SIGN UP - STEP 2 (The Dedicated Cult Avatar Popup) */}
          {mode === "signup" && signupStep === "avatar" && (
            <div className="animate-in fade-in duration-300 space-y-4">
              {/* Header with back button */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <button
                  type="button"
                  onClick={() => setSignupStep("form")}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  <span>Back to details</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Step 2 of 2
                  </span>
                </div>
              </div>

              {/* Title & subtitle */}
              <div className="text-center">
                <h3 className="font-['Montserrat',sans-serif] text-lg sm:text-xl font-black text-white tracking-wider uppercase">
                  Choose Your Cult Character
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Scroll below to discover all 25 iconic legends and select your avatar.
                </p>
              </div>

              {/* Active Selection Hero Ribbon */}
              <div className="p-3 sm:p-4 rounded-2xl bg-neutral-900/80 border border-amber-500/40 flex items-center gap-3.5 sm:gap-4 shadow-lg shadow-black/50">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] shrink-0">
                  <img
                    src={selectedAvatarUrl}
                    alt={selectedAvatarInfo.character}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Selected Avatar:
                    </span>
                    <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                      {favoriteGenre}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white truncate font-cinzel mt-0.5">
                    {selectedAvatarInfo.character}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">
                    {selectedAvatarInfo.name} • {selectedAvatarInfo.category === "Movie" ? "Cult Movie" : "Cult Series"}
                  </p>
                </div>
              </div>

              {/* Filter tabs (All, Movies, Series) */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-['Montserrat',sans-serif]">
                  25 Legendary Characters
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAvatarFilter("all")}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      avatarFilter === "all"
                        ? "bg-amber-400 text-black shadow-sm shadow-amber-500/30 font-bold"
                        : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    All ({DEFAULT_AVATARS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarFilter("Movie")}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                      avatarFilter === "Movie"
                        ? "bg-amber-400 text-black shadow-sm shadow-amber-500/30 font-bold"
                        : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    <Clapperboard className="w-3 h-3" />
                    <span>Movies</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarFilter("Series")}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                      avatarFilter === "Series"
                        ? "bg-amber-400 text-black shadow-sm shadow-amber-500/30 font-bold"
                        : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    <Tv className="w-3 h-3" />
                    <span>Series</span>
                  </button>
                </div>
              </div>

              {/* Spacious, Beautifully Designed & Scrollable Avatar Grid */}
              <div className="grid grid-cols-2 min-[440px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-3.5 max-h-[360px] sm:max-h-[420px] overflow-y-auto custom-scrollbar p-3 bg-black/60 rounded-2xl border border-neutral-800/90 shadow-inner">
                {filteredAvatars.map((avatar) => {
                  const isSelected = selectedAvatarUrl === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatarUrl(avatar.url)}
                      className={`group relative flex flex-col items-center p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer text-center ${
                        isSelected
                          ? "border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02] z-10"
                          : "border-neutral-800/90 bg-neutral-900/50 hover:border-zinc-500 hover:bg-neutral-850/80"
                      }`}
                    >
                      {/* Round Portrait */}
                      <div className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden mb-2 border transition-all ${
                        isSelected ? "border-amber-400 ring-2 ring-amber-400/40" : "border-neutral-700/80 group-hover:border-zinc-400"
                      }`}>
                        <img
                          src={avatar.url}
                          alt={avatar.character}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Selected check badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3]" />
                        </div>
                      )}

                      {/* Character Name */}
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate w-full text-center">
                        {avatar.character}
                      </span>

                      {/* Film / Series */}
                      <span className="text-[10px] text-zinc-400 truncate w-full text-center mt-0.5">
                        {avatar.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Final Confirm Button */}
              <button
                type="button"
                onClick={() => handleFinalSubmit()}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-['Montserrat',sans-serif] font-black text-xs sm:text-sm tracking-[0.18em] uppercase transition-all duration-200 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>CONFIRM AVATAR & COMPLETE SIGN UP</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
