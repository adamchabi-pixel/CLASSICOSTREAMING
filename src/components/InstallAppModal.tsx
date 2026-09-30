import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, Share2, PlusSquare, Check, Sparkles, Smartphone } from "lucide-react";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 via-neutral-950 to-black border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(251,191,36,0.15)] z-10 overflow-hidden font-sans select-none"
        >
          {/* Subtle gold decorative glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* App Header with authentic CLASSICO Navbar Logo */}
          <div className="flex flex-col items-center text-center space-y-1 mb-5">
            <div className="flex flex-col items-center select-none py-1 shrink-0 mb-1">
              <div className="relative overflow-hidden flex items-center">
                <span className="font-cinzel font-bold text-2xl sm:text-3xl tracking-[0.22em] gold-metallic-text uppercase leading-none">
                  CLASSICO
                </span>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              </div>
              <span className="block font-signature text-base sm:text-lg text-[#f4ecd8] leading-none mt-[-2px] select-none text-center translate-x-[-3px] filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)]">
                The Best
              </span>
            </div>

            <h3 className="font-cinzel font-bold text-base sm:text-lg text-white uppercase tracking-wider">
              Add CLASSICO to Home Screen
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              Install the app on your iPhone, iPad, or Android device for instant full-screen cinema without browser address bars.
            </p>
          </div>

          {/* Step by Step Guide */}
          <div className="space-y-3.5 mb-6">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Tap the Share button in Safari's toolbar
                  </h4>
                  {/* Safari Share Icon */}
                  <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-400 shrink-0" title="Safari Share">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Located at the bottom of Safari on iPhone or at the top right on iPad.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Scroll and tap Add to Home Screen
                  </h4>
                  {/* Plus Square Icon */}
                  <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 shrink-0" title="Add to Home Screen">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Scroll down the share sheet and select the <span className="text-zinc-200 font-medium">"Add to Home Screen"</span> option.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Tap Add in the top-right corner
                  </h4>
                  {/* Add button preview */}
                  <span className="text-[10px] bg-blue-600/30 border border-blue-500/50 text-blue-300 font-bold px-1.5 py-0.5 rounded">
                    Add
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  CLASSICO will appear as an app on your home screen with instant loading.
                </p>
              </div>
            </div>
          </div>

          {/* Android / Chromium 1-Click Install Button if supported */}
          {deferredPrompt && (
            <button
              onClick={handleNativeInstall}
              className="w-full mb-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Install Directly (1-Click)
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Got it
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function InstallAppHint({ onClick, isInitialLoadDone = true }: { onClick: () => void; isInitialLoadDone?: boolean }) {
  const [isStandalone] = useState(() => {
    try {
      return typeof window !== "undefined" && (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      );
    } catch (e) {
      return false;
    }
  });

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  const [isDismissed, setIsDismissed] = useState(false);

  // Keep completely unmounted during the initial loading/startup screen to eliminate any flash or lag
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Clear any previous permanent dismissal so the user always has access to the download button
    try {
      localStorage.removeItem("classico_download_hint_dismissed");
    } catch (e) {}

    // Reveal the hint shortly after the startup screen has smoothly faded out
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Strictly mobile only, never during loading, not in standalone/PWA, and not if dismissed
  if (!isMobile || isStandalone || isDismissed || !isAppReady || !isInitialLoadDone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-4 left-3 z-50 flex md:hidden items-center select-none"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
        left: "max(0.75rem, env(safe-area-inset-left, 0.75rem))",
      }}
    >
      <div className="relative flex items-center bg-black/92 border border-amber-500/50 hover:border-amber-400 rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.9),0_0_12px_rgba(245,158,11,0.2)] backdrop-blur-md overflow-hidden">
        {/* Subtle top golden light reflection */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent pointer-events-none" />

        <button
          onClick={onClick}
          className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 cursor-pointer active:scale-95 transition-transform"
          title="Download Classico App"
        >
          {/* Compact download icon */}
          <div className="w-5 h-5 rounded-sm bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center shrink-0 shadow-sm">
            <Download className="w-3 h-3 stroke-[2.5]" />
          </div>

          {/* Clean modern sans-serif typography */}
          <div className="flex flex-col text-left">
            <span className="font-sans font-bold text-[10px] tracking-wide text-zinc-100 uppercase leading-none">
              Download Classico
            </span>
            <span className="font-sans font-medium text-[8px] text-amber-400/90 leading-none mt-0.5">
              Add to Home Screen
            </span>
          </div>
        </button>

        {/* Divider & Close Button */}
        <div className="h-5 w-[1px] bg-white/10" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="px-2 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90"
          title="Close hint"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

interface InstallAppButtonProps {
  className?: string;
  onClick: () => void;
  compact?: boolean;
}

export function InstallAppButton({ className = "", onClick, compact = false }: InstallAppButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group/btn relative inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.1)] hover:shadow-[0_0_16px_rgba(251,191,36,0.25)] transition-all duration-200 cursor-pointer active:scale-95 ${className}`}
      title="Download CLASSICO App"
    >
      {/* Icon */}
      <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover/btn:scale-110 transition-transform" />
      
      {/* Text Encadré */}
      <span className="font-sans text-[10px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap">
        {compact ? "Download App" : "Download CLASSICO App"}
      </span>
    </button>
  );
}
