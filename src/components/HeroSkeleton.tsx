import React from "react";
import { Sparkles } from "lucide-react";

export default function HeroSkeleton() {
  return (
    <div 
      className="relative w-full h-[70vh] sm:h-[85vh] md:h-screen bg-stone-950 overflow-hidden flex items-end select-none"
      id="hero-skeleton-loader"
    >
      {/* Dynamic Ambient Cinematic Shimmering/Glow */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-stone-900 via-neutral-950 to-stone-900 animate-pulse" />
      
      {/* Spotlight Linear Gradient bottom-to-top */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none" 
        style={{
          background: "linear-gradient(to top, #0c0a09 0%, rgba(12, 10, 9, 0.95) 15%, rgba(12, 10, 9, 0.75) 40%, rgba(12, 10, 9, 0.3) 75%, transparent 100%)"
        }}
      />

      {/* Golden Highlight Backdrop Accent to match the Classico theme */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-3000" />

      {/* Subtle loader in center-right to catch user attention elegantly */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          {/* External Spinning Golden Border */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/10 border-t-amber-500 animate-spin" />
          {/* Inner sparkling star icon */}
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        </div>
        <span className="text-[10px] font-mono tracking-[0.2em] text-amber-500/80 uppercase animate-pulse">
          Cinematic Loading...
        </span>
      </div>

      <div className="relative z-20 max-w-[2000px] mx-auto w-full px-4 sm:px-12 pb-14 sm:pb-28 pt-20 sm:pt-36 md:pt-28 flex flex-col items-start text-left">
        <div className="space-y-5 w-full md:max-w-[40%] lg:max-w-[35%] min-w-[280px] sm:min-w-[360px] z-20">
          
          {/* Categories/Metadata Pills Skeletons */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-neutral-800/60 rounded-full animate-pulse border border-white/5" />
            <div className="h-5 w-12 bg-neutral-800/60 rounded-full animate-pulse border border-white/5" />
            <div className="h-5 w-14 bg-neutral-800/60 rounded-full animate-pulse border border-white/5" />
          </div>

          {/* Title Placeholder with clean high contrast dark shimmer */}
          <div className="space-y-2">
            <div className="h-8 sm:h-12 w-3/4 bg-neutral-800/55 rounded-xl animate-pulse border border-white/5" />
            <div className="h-8 sm:h-12 w-1/2 bg-neutral-800/40 rounded-xl animate-pulse border border-white/5" />
          </div>

          {/* Short clamped bio/description rows */}
          <div className="space-y-2.5 pt-2">
            <div className="h-3.5 w-full bg-neutral-800/50 rounded-md animate-pulse" />
            <div className="h-3.5 w-[90%] bg-neutral-800/45 rounded-md animate-pulse" />
            <div className="h-3.5 w-[65%] bg-neutral-800/40 rounded-md animate-pulse" />
          </div>

          {/* Premium Fluid Control Buttons Skeletons */}
          <div className="flex items-center gap-3 pt-3">
            <div className="h-11 sm:h-12 w-28 sm:w-36 bg-neutral-800/70 rounded-full animate-pulse border border-white/10" />
            <div className="h-11 sm:h-12 w-28 sm:w-32 bg-neutral-800/40 rounded-full animate-pulse border border-white/5" />
          </div>

        </div>
      </div>

      {/* Dots Indicator Skeletons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2 bg-stone-950/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
        <div className="w-5 h-2 bg-neutral-800/80 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-neutral-800/50 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-neutral-800/50 rounded-full animate-pulse" />
      </div>

    </div>
  );
}
