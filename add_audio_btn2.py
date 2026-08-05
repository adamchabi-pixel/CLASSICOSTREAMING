import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Add the UI
ui_target = """            {/* Subtitles Button next to Volume */}
              <div className="relative border-l border-white/10 pl-2 sm:pl-4">"""

ui_replacement = """            {/* Audio Button */}
            <div className="relative border-l border-white/10 pl-2 sm:pl-4">
              <button
                id="cinema-audio-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAudioMenu(prev => !prev);
                  setShowSubtitleMenu(false);
                }}
                className={`px-3 py-1.5 rounded-lg border text-white/60 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeAudioIndex !== null ? "text-amber-400 border-amber-500/50 bg-amber-500/10" : "border-white/10"
                }`}
                title="Audio & Langues"
              >
                <Languages className="w-5 h-5" />
                <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider hidden sm:inline">Audio</span>
              </button>

              {/* Audio dropdown/popover */}
              {showAudioMenu && (
                <div id="cinema-audio-menu" className="absolute bottom-full left-0 mb-3 w-56 bg-zinc-950/95 border border-white/10 rounded-xl shadow-2xl p-2 z-50 overflow-hidden text-[11px] text-zinc-200">
                  <div className="px-2 py-1.5 border-b border-white/5 flex items-center justify-between gap-1">
                    <span className="font-bold uppercase tracking-wider text-amber-500 text-[9px] truncate">Audio Tracks</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAudioMenu(false);
                      }}
                      className="text-zinc-500 hover:text-white text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto py-1 space-y-0.5 mt-1 select-none">
                    {/* Jellyfin audio tracks */}
                    {playbackInfo?.audios && playbackInfo.audios.length > 0 ? playbackInfo.audios.map((track) => {
                      const isCurrentActive = activeAudioIndex === track.index;
                      return (
                        <button
                          key={track.index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAudioIndex(track.index);
                            setShowAudioMenu(false);
                            console.log(`[AUDIO TRACK SELECTED] Activated track ${track.index} (${track.label})`);
                          }}
                          className={`w-full px-2 py-2 text-left rounded hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between ${
                            isCurrentActive ? "text-amber-400 bg-white/5 font-bold" : ""
                          }`}
                        >
                          <span className="truncate pr-2 block">{track.label || `Track ${track.index}`}</span>
                          {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </button>
                      );
                    }) : (
                      <div className="px-2 py-3 text-center text-zinc-500 font-medium italic text-[10px]">
                        Aucune piste audio disponible
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Subtitles Button next to Volume */}
            <div className="relative pl-2 sm:pl-4">"""

if ui_target in content and "cinema-audio-btn" not in content:
    content = content.replace(ui_target, ui_replacement)
else:
    print("UI TARGET NOT FOUND")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
