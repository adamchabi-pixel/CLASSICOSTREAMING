import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Pencil, Check, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Profile } from "../lib/supabase";
import ProfileEditModal from "./ProfileEditModal";

export default function ProfileSelectorModal() {
  const {
    user,
    profiles,
    activeProfile,
    selectProfile,
    isProfileSelectorOpen,
    setIsProfileSelectorOpen,
    openAuthModal
  } = useAuth();

  const [isManageMode, setIsManageMode] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  if (!isProfileSelectorOpen) return null;

  const handleProfileClick = (p: Profile) => {
    if (isManageMode) {
      setEditingProfile(p);
      setIsCreatingNew(false);
    } else {
      selectProfile(p);
    }
  };

  const handleAddNewClick = () => {
    if (!user) {
      setIsProfileSelectorOpen(false);
      openAuthModal("signup");
      return;
    }
    setEditingProfile(null);
    setIsCreatingNew(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Full-screen dark cinematic backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsProfileSelectorOpen(false)}
          className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl"
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-[120px] pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => setIsProfileSelectorOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-neutral-900 transition-colors z-20 cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center justify-center"
        >
          {/* Header Title */}
          <div className="space-y-3 mb-10 sm:mb-14">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-cinzel font-bold text-white tracking-wide">
              {isManageMode ? "Gérer les profils" : "Qui regarde ?"}
            </h1>
            <p className="text-sm text-zinc-400 font-sans">
              {isManageMode
                ? "Sélectionnez un profil pour modifier son nom, son avatar ou le supprimer."
                : "Choisissez votre profil pour retrouver vos favoris et votre reprise de lecture."}
            </p>
          </div>

          {/* Profiles Grid (up to 5 profiles + Add Card) */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-12 max-w-3xl">
            {profiles.map((p) => {
              const isCurrent = activeProfile?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleProfileClick(p)}
                  className="group flex flex-col items-center gap-3 cursor-pointer transition-transform duration-200 active:scale-95"
                >
                  {/* Avatar wrapper */}
                  <div
                    className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-xl ${
                      isCurrent && !isManageMode
                        ? "border-amber-400 shadow-amber-500/20 ring-4 ring-amber-500/30"
                        : "border-transparent group-hover:border-white/80 group-hover:scale-105"
                    }`}
                  >
                    <img
                      src={p.avatar_url}
                      alt={p.name}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        isManageMode ? "opacity-60 group-hover:opacity-80" : "opacity-100"
                      }`}
                    />

                    {/* Manage Overlay with Pencil */}
                    {isManageMode && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-10 h-10 rounded-full bg-black/80 border border-white/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <Pencil className="w-5 h-5 text-amber-400" />
                        </div>
                      </div>
                    )}

                    {/* Kids Badge */}
                    {p.is_kids && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-[9px] font-bold text-black tracking-wider uppercase">
                        Kids
                      </div>
                    )}
                  </div>

                  {/* Profile Name */}
                  <span
                    className={`text-sm sm:text-base font-medium tracking-wide transition-colors duration-200 ${
                      isCurrent && !isManageMode
                        ? "text-amber-400 font-semibold"
                        : "text-zinc-400 group-hover:text-white"
                    }`}
                  >
                    {p.name}
                  </span>
                </div>
              );
            })}

            {/* Add Profile Card (Allowed up to 5 profiles) */}
            {profiles.length < 5 && (
              <div
                onClick={handleAddNewClick}
                className="group flex flex-col items-center gap-3 cursor-pointer transition-transform duration-200 active:scale-95"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-zinc-700 group-hover:border-amber-400 group-hover:bg-neutral-900/50 flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 border border-zinc-700 group-hover:border-amber-400 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-all">
                    <Plus className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-sm sm:text-base text-zinc-500 group-hover:text-zinc-300 font-medium tracking-wide transition-colors">
                  Ajouter un profil
                </span>
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setIsManageMode(!isManageMode)}
              className={`px-8 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-200 cursor-pointer ${
                isManageMode
                  ? "bg-white text-black hover:bg-zinc-200 shadow-lg"
                  : "border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-neutral-900"
              }`}
            >
              {isManageMode ? "Terminé" : "Gérer les profils"}
            </button>
          </div>
        </motion.div>

        {/* Profile Edit / Create Sub-Modal */}
        {(editingProfile || isCreatingNew) && (
          <ProfileEditModal
            profile={editingProfile}
            isNew={isCreatingNew}
            onClose={() => {
              setEditingProfile(null);
              setIsCreatingNew(false);
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );
}
