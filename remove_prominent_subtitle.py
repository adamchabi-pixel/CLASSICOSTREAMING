import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target = """            {/* Prominent Subtitle Button next to Volume */}
            {isJellyfinMovie && (
              <div className="relative border-l border-zinc-850 pl-2 sm:pl-4">
                <button
                  id="prominent-subtitle-btn"
                  onClick={() => setShowSubtitleMenu(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold select-none transition-all cursor-pointer ${
                    videoState.subtitlesOn && activeSubtitleIndex !== null
                      ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/35"
                      : "bg-zinc-900 border-zinc-800/80 hover:bg-zinc-850 text-zinc-350"
                  }`}
                  title="Jellyfin Subtitles"
                >
                  <Captions className={`w-4 h-4 ${videoState.subtitlesOn && activeSubtitleIndex !== null ? "text-amber-400 animate-pulse" : "text-zinc-400"}`} />
                  <span className="text-zinc-400">Subtitles:</span>
                  <span className="font-sans font-bold text-zinc-100 truncate max-w-[120px]">
                    {videoState.subtitlesOn && activeSubtitleIndex !== null
                      ? (playbackInfo?.subtitles?.find(s => s.index === activeSubtitleIndex)?.label || "Oui")
                      : "None"}
                  </span>
                </button>
              </div>
            )}"""

if target in content:
    content = content.replace(target, "")
    print("Removed prominent subtitle button")
else:
    print("Prominent subtitle button not found")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
