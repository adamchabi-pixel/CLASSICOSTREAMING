import sys

def main():
    with open("src/components/VideoPlayer.tsx", "r") as f:
        lines = f.readlines()

    start_idx = -1
    end_idx = -1

    for i, line in enumerate(lines):
        if "{/* Subtitle Selection Popover Control */}" in line:
            start_idx = i
        if "id=\"player-close-view-btn\"" in line:
            # We want to remove up to the closing </button>
            # Let's just find the next </button>
            for j in range(i, len(lines)):
                if "</button>" in lines[j]:
                    end_idx = j
                    break
            break
            
    if start_idx != -1 and end_idx != -1:
        replacement = """            {/* Cast Button */}
            {typeof window !== "undefined" && (window as any).PresentationRequest && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current && (videoRef.current as any).remote && (videoRef.current as any).remote.prompt) {
                    (videoRef.current as any).remote.prompt().catch(() => {});
                  }
                }}
                className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer touch-manipulation z-50 relative"
                title="Caster"
              >
                <Cast className="w-4.5 h-4.5" />
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
                className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer touch-manipulation z-50 relative"
                title="AirPlay"
              >
                <Airplay className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Unified Settings Menu */}
            <div className="relative">
              <button
                id="player-settings-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsMenu(prev => !prev);
                }}
                className={`p-1.5 rounded transition-colors duration-150 cursor-pointer flex items-center justify-center ${
                  showSettingsMenu ? "text-amber-400 bg-amber-500/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
                title="Paramètres"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>

              {showSettingsMenu && (
                <div 
                  id="player-settings-menu"
                  className="absolute bottom-10 right-0 z-50 w-64 bg-zinc-950/98 border border-zinc-800 rounded-xl p-3 shadow-2xl font-sans text-xs text-left backdrop-blur-md max-h-[50vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150"
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
                          className={`px-2 py-1 rounded shrink-0 font-medium transition-colors cursor-pointer ${
                            playbackRate === speed ? "bg-amber-500 text-zinc-950 font-bold" : "bg-white/5 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio */}
                  {isJellyfinMovie && (
                    <div className="mb-3">
                      <div className="text-zinc-400 font-bold tracking-wide text-[10px] uppercase mb-1.5">Audio</div>
                      <div className="space-y-0.5">
                        {playbackInfo?.audios && playbackInfo.audios.length > 0 ? (
                          playbackInfo.audios.map(track => {
                            const isCurrentActive = activeAudioIndex === track.index;
                            return (
                              <button
                                key={track.index}
                                onClick={() => {
                                  setActiveAudioIndex(track.index);
                                }}
                                className={`w-full px-2.5 py-1.5 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                  isCurrentActive ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                                }`}
                              >
                                <span className="font-semibold text-[11px] truncate">{track.label}</span>
                                {isCurrentActive && <span className="text-amber-500 pl-2">✔</span>}
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-zinc-500 italic text-[10px]">Aucune piste audio</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sous-titres */}
                  <div className="mb-3">
                    <div className="text-zinc-400 font-bold tracking-wide text-[10px] uppercase mb-1.5">Sous-titres</div>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveSubtitleIndex(null);
                          setVideoState(prev => ({ ...prev, subtitlesOn: false }));
                        }}
                        className={`w-full px-2.5 py-1.5 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          !videoState.subtitlesOn || activeSubtitleIndex === null ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="font-semibold text-[11px]">Désactivé</span>
                        {(!videoState.subtitlesOn || activeSubtitleIndex === null) && <span className="text-amber-500 pl-2">✔</span>}
                      </button>

                      {playbackInfo?.subtitles && playbackInfo.subtitles.length > 0 && playbackInfo.subtitles.map(track => {
                        const isCurrentActive = videoState.subtitlesOn && activeSubtitleIndex === track.index;
                        return (
                          <button
                            key={track.index}
                            onClick={() => {
                              setActiveSubtitleIndex(track.index);
                              setVideoState(prev => ({ ...prev, subtitlesOn: true }));
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
              id="player-fullscreen-btn"
              type="button"
              onClick={handleFullscreenToggle}
              className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer touch-manipulation z-50 relative"
              title="Plein écran"
            >
              <Maximize2 className="w-4.5 h-4.5" />
            </button>

            {/* Return back to details view - Visible only for administrator */}
            {localStorage.getItem("isAdmin") === "true" && (
              <button
                onClick={() => setShowDiagnostics(prev => !prev)}
                className={`bg-zinc-900 border ${showDiagnostics ? "border-amber-500/80 text-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "border-zinc-800 hover:bg-neutral-800 text-zinc-300 font-bold"} font-mono text-xs px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer`}
                title="Real-time playback info (Admin Mode)"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Playback Info
              </button>
            )}\n"""
        
        new_lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
        
        with open("src/components/VideoPlayer.tsx", "w") as f:
            f.writelines(new_lines)
        print("Replaced VideoPlayer controls.")
    else:
        print(f"Could not find indices: {start_idx}, {end_idx}")

main()
