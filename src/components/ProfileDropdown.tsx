import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Film, 
  Bookmark, 
  History, 
  Heart
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AvatarPickerModal from "./AvatarPickerModal";
import { DEFAULT_AVATARS } from "../lib/supabase";

interface ProfileDropdownProps {
  onNavigateToProfileTab?: () => void;
}

export default function ProfileDropdown({ onNavigateToProfileTab }: ProfileDropdownProps) {
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

  // 1. When NOT connected: JUST a profile icon (no circle frame, just like the search icon)
  if (!user) {
    return (
      <div className="flex items-center">
        <button
          onClick={() => openAuthModal("login")}
          aria-label="Sign In"
          title="Sign In"
          className="p-2 text-zinc-300 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer group focus:outline-none"
        >
          <UserIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>
      </div>
    );
  }

  // 2. When CONNECTED: sleek avatar icon in top right
  const avatarUrl = activeProfile?.avatar_url || DEFAULT_AVATARS[0].url;
  const currentAvatarInfo = DEFAULT_AVATARS.find(a => a.url === avatarUrl);

  return (
    <>
      <div className="relative flex items-center" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="My Account"
          title={activeProfile?.name || "My Account"}
          className="relative w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full overflow-hidden hover:opacity-90 transition-all hover:scale-105 active:scale-95 cursor-pointer block group focus:outline-none border border-amber-400/40 hover:border-amber-400"
        >
          <img
            src={avatarUrl}
            alt={activeProfile?.name || "Profile"}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-64 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-2 shadow-2xl z-[150] text-left divide-y divide-neutral-900"
            >
              {/* Account summary with current avatar */}
              <div className="p-3 space-y-2">
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
                      {activeProfile?.name || "My Account"}
                    </h4>
                    {currentAvatarInfo && (
                      <p className="text-[10px] text-amber-400 font-semibold truncate">
                        {currentAvatarInfo.name} ({currentAvatarInfo.character})
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
                  className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span>Choose Character Avatar</span>
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
                  <span>Sign Out</span>
                </button>
              </div>
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
