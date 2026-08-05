import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Make sure we import Menu, Settings, Cast
if "Menu, Cast" not in content:
    content = content.replace("Airplay", "Airplay, Menu, Cast, Settings")

start_marker = "{/* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN */}"
end_marker = "{/* Playback Info Button"

if start_marker in content:
    # We will replace from start_marker up to the end of the Right Side block.
    # Where does the block end? Right before `</div>` then `</div>`
    # Let's find start_marker
    start_idx = content.find(start_marker)
    # The end of the block is the `</button>\n          </div>\n        </div>` or similar.
    # Let's just find `title="Plein écran"` and replace everything around it.
    
    pass

import sys

lines = content.split('\n')
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{/* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN */}" in line:
        start_idx = i
    if "title=\"Plein écran\"" in line:
        # Find the closing </button> and </div>
        for j in range(i, len(lines)):
            if "</div>" in lines[j]:
                end_idx = j
                break
        break

if start_idx != -1 and end_idx != -1:
    replacement = """          {/* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN */}
          <div className="flex items-center gap-3">
            {/* Cast Button */}
            {typeof window !== "undefined" && (window as any).PresentationRequest && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current && (videoRef.current as any).remote && (videoRef.current as any).remote.prompt) {
                    (videoRef.current as any).remote.prompt().catch(() => {});
                  }
                }}
                className="p-1.5 text-white/60 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="Caster"
              >
                <Cast className="w-5 h-5" />
              </button>
            )}

            {/* AirPlay Control */}
            {typeof window !== "undefined" && (window as any).WebKitPlaybackTargetAvailabilityEvent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current && (videoRef.current as any).webkitShowPlaybackTargetPicker) {
                    (videoRef.current as any).webkitShowPlaybackTargetPicker();
                  }
                }}
                className="p-1.5 text-white/60 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="AirPlay"
              >
                <Airplay className="w-5 h-5" />
              </button>
            )}

            {/* Unified Settings Menu */}
            <div className="relative">
              <button
                id="cinema-settings-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsMenu(prev => !prev);
                }}
                className={`p-1.5 rounded transition-all duration-150 cursor-pointer flex items-center justify-center ${
                  showSettingsMenu ? "text-amber-400 bg-amber-500/10" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                title="Paramètres"
              >
                <Menu className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <div 
                  id="cinema-settings-menu"
                  className="absolute bottom-full right-0 mb-3 w-64 bg-zinc-950/98 border border-zinc-800 rounded-xl p-3 shadow-2xl font-sans text-xs text-left backdrop-blur-md max-h-[60vh] overflow-y-auto text-zinc-200"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Vitesse de lecture */}
                  <div className="mb-3">
                    <div className="text-zinc-400 font-bold tracking-wide text-[10px] uppercase mb-1.5">Vitesse de lecture</div>
                    <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => {
                            setPlaybackRate(speed);
                            if (videoRef.current) videoRef.current.playbackRate = speed;
                          }}
                          className={`px-2 py-1.5 rounded shrink-0 font-bold transition-colors cursor-pointer text-[10px] ${
                            playbackRate === speed ? "bg-amber-500 text-zinc-950" : "bg-white/5 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio */}
                  <div className="mb-3">
                    <div className="text-zinc-400 font-bold tracking-wide text-[10px] uppercase mb-1.5">Audio</div>
                    <div className="space-y-0.5">
                      {playbackInfo?.audios && playbackInfo.audios.length > 0 ? (
                        playbackInfo.audios.map((track: any) => {
                          const isCurrentActive = activeAudioIndex === track.index;
                          return (
                            <button
                              key={track.index}
                              onClick={() => {
                                setActiveAudioIndex(track.index);
                                setShowSettingsMenu(false);
                              }}
                              className={`w-full px-2.5 py-1.5 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                isCurrentActive ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              <span className="font-semibold text-[11px] truncate">{track.label || `Track ${track.index}`}</span>
                              {isCurrentActive && <span className="text-amber-500 pl-2">✔</span>}
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-zinc-500 italic text-[10px]">Aucune piste audio</div>
                      )}
                    </div>
                  </div>

                  {/* Sous-titres */}
                  <div className="mb-3">
                    <div className="text-zinc-400 font-bold tracking-wide text-[10px] uppercase mb-1.5">Sous-titres</div>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveSubtitleIndex(null);
                          setSubtitlesOn(false);
                          setShowSettingsMenu(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          !subtitlesOn || activeSubtitleIndex === null ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="font-semibold text-[11px]">Désactivé</span>
                        {(!subtitlesOn || activeSubtitleIndex === null) && <span className="text-amber-500 pl-2">✔</span>}
                      </button>

                      {playbackInfo?.subtitles && playbackInfo.subtitles.length > 0 && playbackInfo.subtitles.map((track: any) => {
                        const isCurrentActive = subtitlesOn && activeSubtitleIndex === track.index;
                        return (
                          <button
                            key={track.index}
                            onClick={() => {
                              setActiveSubtitleIndex(track.index);
                              setSubtitlesOn(true);
                              setShowSettingsMenu(false);
                            }}
                            className={`w-full px-2.5 py-1.5 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                              isCurrentActive ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                            }`}
                          >
                            <span className="font-semibold text-[11px] truncate">{track.label || track.codec}</span>
                            {isCurrentActive && <span className="text-amber-500 pl-2">✔</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Popout (PiP) */}
                  {typeof document !== "undefined" && (document as any).pictureInPictureEnabled && (
                    <button
                      onClick={() => {
                        if (videoRef.current && videoRef.current !== document.pictureInPictureElement) {
                          videoRef.current.requestPictureInPicture().catch(() => {});
                        } else if (document.pictureInPictureElement) {
                          document.exitPictureInPicture().catch(() => {});
                        }
                        setShowSettingsMenu(false);
                      }}
                      className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-bold text-[11px] flex justify-center items-center cursor-pointer transition-colors"
                    >
                      Mode Popout (PiP)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-1.5 text-white/60 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Plein écran"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>"""
    
    lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
    content = "\n".join(lines)
    print("Replaced Right Side")
else:
    print("Could not find start or end index for right side")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
