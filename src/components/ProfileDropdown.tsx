import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Film, 
  Bookmark, 
  History, 
  Heart,
  LogIn,
  UserPlus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AvatarPickerModal from "./AvatarPickerModal";
import { DEFAULT_AVATARS } from "../lib/supabase";

interface ProfileDropdownProps {
  onNavigateToProfileTab?: () => void;
  watchlistCount?: number;
}

export default function ProfileDropdown({ onNavigateToProfileTab, watchlistCount }: ProfileDropdownProps) {
  const {
    user,
    activeProfile,
    signOut,
    openAuthModal
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to close event from mobile drawer or other menus
  useEffect(() => {
    const handleCloseMenu = () => setIsOpen(false);
    window.addEventListener("close-nav-dropdowns", handleCloseMenu);
    return () => window.removeEventListener("close-nav-dropdowns", handleCloseMenu);
  }, []);

  const handleToggle = () => {
    // Notify other menus to close
    window.dispatchEvent(new CustomEvent("close-mobile-drawer"));
    setIsOpen(prev => !prev);
  };

  const avatarUrl = activeProfile?.avatar_url || DEFAULT_AVATARS[0].url;
  const currentAvatarInfo = DEFAULT_AVATARS.find(a => a.url === avatarUrl);

  return (
    <>
      <div className="relative flex items-center" ref={menuRef}>
        {/* Profile / Avatar Trigger Button */}
        <button
          onClick={handleToggle}
          aria-label={user ? (activeProfile?.name || "My Account") : "Sign In"}
          title={user ? (activeProfile?.name || "My Account") : "Sign In"}
          className={`relative flex items-center justify-center transition-all cursor-pointer group focus:outline-none ${
            user
              ? "w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full overflow-hidden border border-amber-400/40 hover:border-amber-400 hover:scale-105 active:scale-95 shadow-md"
              : "p-2 text-zinc-300 hover:text-amber-400"
          }`}
        >
          {user ? (
            <img
              src={avatarUrl}
              alt={activeProfile?.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
          )}
          {watchlistCount !== undefined && watchlistCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] text-white font-mono rounded-full flex items-center justify-center border border-black font-extrabold shadow-sm animate-pulse">
              {watchlistCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu - EXACT SAME ANIMATION & ANCHORING AS THE 3-DOTS DRAWER */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[calc(100%+0.5rem)] right-0 w-64 max-w-[calc(100vw-2rem)] bg-neutral-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[150] text-left divide-y divide-neutral-900 origin-top-right"
            >
              {user ? (
                /* ================= LOGGED IN VIEW ================= */
                <>
                  {/* Account summary with current avatar */}
                  <div className="p-3 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-amber-400/80 shadow-md shrink-0">
                        <img
                          src={avatarUrl}
                          alt={activeProfile?.name || "Avatar"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate font-cinzel">
                          {activeProfile?.name || "My Profile"}
                        </h4>
                        {currentAvatarInfo && (
                          <p className="text-[10px] text-amber-400 font-semibold truncate">
                            {currentAvatarInfo.character}
                          </p>
                        )}
                        <p className="text-[10px] text-zinc-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Change Avatar Button */}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setShowAvatarPicker(true);
                      }}
                      className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer group shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                      <span>Change avatar</span>
                    </button>
                  </div>

                  {/* Navigation links */}
                  <div className="p-2 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (onNavigateToProfileTab) onNavigateToProfileTab();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <Film className="w-4 h-4 text-zinc-400" />
                      <span>My Profile & History</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (onNavigateToProfileTab) onNavigateToProfileTab();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-400" />
                      <span>My Watchlist</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (onNavigateToProfileTab) onNavigateToProfileTab();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-zinc-400" />
                      <span>My Favorites</span>
                    </button>
                  </div>

                  {/* Sign out */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              ) : (
                /* ================= NOT LOGGED IN VIEW ================= */
                <>
                  <div className="p-3 space-y-2 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      <span>Personal Space</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      Sign in to select your cult avatar and sync your favorites.
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          openAuthModal("login");
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer font-['Montserrat',sans-serif]"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign in</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          openAuthModal("signup");
                        }}
                        className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Create account</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-2 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (onNavigateToProfileTab) onNavigateToProfileTab();
                        else openAuthModal("login");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <Film className="w-4 h-4 text-zinc-500" />
                      <span>My Profile & History</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (onNavigateToProfileTab) onNavigateToProfileTab();
                        else openAuthModal("login");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-500" />
                      <span>My Watchlist</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
      />
    </>
  );
}
