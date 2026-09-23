import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Trash2, Check, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Profile, DEFAULT_AVATARS } from "../lib/supabase";

interface ProfileEditModalProps {
  profile: Profile | null;
  isNew?: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({ profile, isNew = false, onClose }: ProfileEditModalProps) {
  const { profiles, createProfile, updateProfile, deleteProfile } = useAuth();

  const [name, setName] = useState<string>(profile?.name || (isNew ? `Profil ${profiles.length + 1}` : ""));
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url || DEFAULT_AVATARS[profiles.length % DEFAULT_AVATARS.length].url);
  const [isKids, setIsKids] = useState<boolean>(profile?.is_kids || false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Veuillez renseigner un nom pour ce profil.");
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const res = await createProfile(cleanName, avatarUrl, isKids);
        if (res.error) {
          setErrorMsg(res.error);
          setIsSaving(false);
          return;
        }
      } else if (profile) {
        const res = await updateProfile(profile.id, {
          name: cleanName,
          avatar_url: avatarUrl,
          is_kids: isKids
        });
        if (res.error) {
          setErrorMsg(res.error);
          setIsSaving(false);
          return;
        }
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const res = await deleteProfile(profile.id);
      if (res.error) {
        setErrorMsg(res.error);
        setIsSaving(false);
        return;
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la suppression.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white mb-2">
          {isNew ? "Ajouter un profil" : "Modifier le profil"}
        </h2>
        <p className="text-xs text-zinc-400 mb-6 font-sans">
          Personnalisez le nom et l'avatar de votre profil. (Jusqu'à 5 profils par compte)
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Name & Current Avatar Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0">
              <img src={avatarUrl} alt="Avatar sélectionné" className="w-full h-full object-cover" />
            </div>

            <div className="w-full space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                Nom du profil
              </label>
              <input
                type="text"
                required
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mon Profil"
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Avatar Selector Gallery */}
          <div className="space-y-2.5">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center justify-between">
              <span>Choisir un avatar ({DEFAULT_AVATARS.length} disponibles)</span>
              <span className="text-[10px] text-amber-400 font-normal">Cliquez pour sélectionner</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 bg-neutral-900/40 rounded-2xl border border-neutral-800/80 custom-scrollbar">
              {DEFAULT_AVATARS.map((av) => {
                const isSelected = avatarUrl === av.url;
                return (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setAvatarUrl(av.url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square group cursor-pointer ${
                      isSelected
                        ? "border-amber-400 ring-2 ring-amber-400/40 scale-105"
                        : "border-transparent hover:border-white/50 hover:scale-105"
                    }`}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kids Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div>
              <p className="text-sm font-semibold text-white">Profil Enfants</p>
              <p className="text-xs text-zinc-400">Contenus et séries adaptés pour la famille.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-neutral-900">
            {!isNew && profile && profiles.length > 1 ? (
              showConfirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400">Confirmer ?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Oui, supprimer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-zinc-300 text-xs transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer ce profil
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-neutral-800 hover:border-zinc-600 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <span>Enregistrer</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
