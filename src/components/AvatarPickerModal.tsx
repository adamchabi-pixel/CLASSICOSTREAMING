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
      {/* Container strictly below navbar */}
      <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 z-[500] flex items-center justify-center p-3 sm:p-5 overflow-y-auto custom-scrollbar">
        {/* Backdrop strictly below navbar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed top-16 sm:top-20 inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Card - Compact smaller rectangle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[460px] sm:max-w-[490px] bg-neutral-950/95 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden z-10 max-h-[78vh] flex flex-col backdrop-blur-2xl"
        >
          {/* Subtle Ambient Gold Glow Header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1.5 mb-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold tracking-wider uppercase font-['Montserrat',sans-serif]">
              <Sparkles className="w-3 h-3" />
              Cult Avatars
            </div>
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-white tracking-wide">
              Choose your Legend
            </h2>
            <p className="text-[11px] text-zinc-400 font-sans max-w-xs mx-auto">
              Select an iconic character to represent your profile.
            </p>

            {/* Filter buttons */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-amber-400 text-black font-bold shadow-sm"
                    : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                }`}
              >
                All ({DEFAULT_AVATARS.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("Movie")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  filter === "Movie"
                    ? "bg-amber-400 text-black font-bold shadow-sm"
                    : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                }`}
              >
                <Clapperboard className="w-2.5 h-2.5" />
                <span>Movies</span>
              </button>
              <button
                type="button"
                onClick={() => setFilter("Series")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  filter === "Series"
                    ? "bg-amber-400 text-black font-bold shadow-sm"
                    : "bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800"
                }`}
              >
                <Tv className="w-2.5 h-2.5" />
                <span>Series</span>
              </button>
            </div>
          </div>

          {/* Grid of cinema legends - Compact 3-columns */}
          <div className="grid grid-cols-3 gap-2.5 overflow-y-auto p-2 custom-scrollbar bg-black/50 rounded-2xl border border-neutral-800/80 mb-3 max-h-56 sm:max-h-60">
            {filteredAvatars.map((avatar) => {
              const isSelected = currentUrl === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelect(avatar.url)}
                  className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all duration-200 cursor-pointer text-center ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-[1.02]"
                      : "bg-neutral-900/60 border-neutral-800/90 hover:border-zinc-500 hover:bg-neutral-850"
                  }`}
                >
                  <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden mb-1.5 border border-neutral-700/80 shadow-md">
                    <img
                      src={avatar.url}
                      alt={avatar.character}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {avatar.character}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-sans line-clamp-1">
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-zinc-500 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Film className="w-3 h-3 text-amber-400" />
              {DEFAULT_AVATARS.length} icons
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
