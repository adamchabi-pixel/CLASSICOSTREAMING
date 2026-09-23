import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Film, Sparkles, Tv, Clapperboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_AVATARS } from "../lib/supabase";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarUrl?: string;
  onSelectAvatar?: (url: string) => void;
}

export default function AvatarPickerModal({
  isOpen,
  onClose,
  selectedAvatarUrl,
  onSelectAvatar
}: AvatarPickerModalProps) {
  const { activeProfile, updateProfile } = useAuth();
  const [filter, setFilter] = useState<"all" | "Movie" | "Series">("all");

  if (!isOpen) return null;

  const currentUrl = selectedAvatarUrl || activeProfile?.avatar_url || DEFAULT_AVATARS[0].url;

  const handleSelect = async (avatarUrl: string) => {
    if (onSelectAvatar) {
      onSelectAvatar(avatarUrl);
      onClose();
      return;
    }

    if (activeProfile) {
      await updateProfile(activeProfile.id, { avatar_url: avatarUrl });
    }
    onClose();
  };

  const filteredAvatars = DEFAULT_AVATARS.filter(a => {
    if (filter === "all") return true;
    return a.category === filter;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-start justify-center pt-20 sm:pt-24 pb-10 px-4 sm:px-6 overflow-y-auto custom-scrollbar">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl sm:max-w-3xl bg-neutral-950/95 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden z-10 max-h-[86vh] flex flex-col backdrop-blur-2xl"
        >
          {/* Subtle Ambient Gold Glow Header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-4 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider uppercase font-['Montserrat',sans-serif]">
              <Sparkles className="w-3.5 h-3.5" />
              Cult Cinema & Series Avatars
            </div>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white tracking-wide">
              Choose Your Legend
            </h2>
            <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto">
              Select an iconic movie or TV character to represent your profile across your devices.
            </p>

            {/* Filter buttons */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-amber-400 text-black shadow-sm shadow-amber-500/30"
                    : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                }`}
              >
                All ({DEFAULT_AVATARS.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("Movie")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  filter === "Movie"
                    ? "bg-amber-400 text-black shadow-sm shadow-amber-500/30"
                    : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                }`}
              >
                <Clapperboard className="w-3 h-3" />
                <span>Movies</span>
              </button>
              <button
                type="button"
                onClick={() => setFilter("Series")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  filter === "Series"
                    ? "bg-amber-400 text-black shadow-sm shadow-amber-500/30"
                    : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                }`}
              >
                <Tv className="w-3 h-3" />
                <span>Series</span>
              </button>
            </div>
          </div>

          {/* Grid of cinema legends */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 overflow-y-auto pr-1 pb-2 custom-scrollbar">
            {filteredAvatars.map((avatar) => {
              const isSelected = currentUrl === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelect(avatar.url)}
                  className={`group relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20"
                      : "bg-neutral-900/60 border-neutral-800 hover:border-zinc-700 hover:bg-neutral-900"
                  }`}
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 shadow-md">
                    <img
                      src={avatar.url}
                      alt={avatar.character}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {avatar.character}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-sans line-clamp-1">
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-zinc-500 shrink-0 mt-3">
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              {DEFAULT_AVATARS.length} legendary characters available
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
