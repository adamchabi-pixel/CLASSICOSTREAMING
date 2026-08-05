import re
import sys

def main():
    with open("src/components/CinemaPlayerView.tsx", "r") as f:
        content = f.read()

    # 1. Add lucide imports
    if "Menu, Cast" not in content:
        content = content.replace("Captions, Lock, Airplay", "Captions, Lock, Airplay, Menu, Cast, Settings")

    # 2. Add state variables
    state_target = """  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);"""
    state_replacement = """  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);"""
    if state_target in content:
        content = content.replace(state_target, state_replacement)
    
    # Also update handleDocumentClick for settings menu
    click_target = """    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#cinema-subtitle-btn") && !target.closest("#cinema-subtitle-menu")) {
        setShowSubtitleMenu(false);
      }
    };"""
    click_replacement = """    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#cinema-subtitle-btn") && !target.closest("#cinema-subtitle-menu")) {
        setShowSubtitleMenu(false);
      }
      if (!target.closest("#cinema-settings-btn") && !target.closest("#cinema-settings-menu")) {
        setShowSettingsMenu(false);
      }
    };"""
    if click_target in content:
        content = content.replace(click_target, click_replacement)

    # 3. Remove Audio & Subtitle blocks on the left side
    lines = content.split('\n')
    start_audio_idx = -1
    end_subtitle_idx = -1
    for i, line in enumerate(lines):
        if "{/* Audio Button */}" in line:
            start_audio_idx = i
        if "{/* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN */}" in line:
            # We want to remove up to just before this line, but there is a </div> closing the left side
            # Let's see...
            #           </div>
            #
            #           {/* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN */}
            # We will stop at the line containing RIGHT SIDE minus 2? 
            # Or better, just regex replace the chunk
            pass

    # Let's use regex with re.DOTALL
    audio_sub_regex = re.compile(r'            \{\/\* Audio Button \*\/\}.*?            \{\/\* RIGHT SIDE:', re.DOTALL)
    content = audio_sub_regex.sub('            {/* RIGHT SIDE:', content)

    # 4. Modify RIGHT SIDE
    right_side_regex = re.compile(r'            \{\/\* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN \*\/\}.*?<\/div>        <\/div>', re.DOTALL)
    
    right_side_replacement = """            {/* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN */}
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
          </div>
        </div>"""
    
    content = right_side_regex.sub(right_side_replacement, content)

    # 5. Hide settings menu when controls are hidden
    hide_controls_target = """    hideControlsTimeout.current = setTimeout(() => {
      if (playing) {
        setControlsVisible(false);
      }
    }, 3000);"""
    hide_controls_replacement = """    hideControlsTimeout.current = setTimeout(() => {
      if (playing) {
        setControlsVisible(false);
        setShowSettingsMenu(false);
      }
    }, 3000);"""
    content = content.replace(hide_controls_target, hide_controls_replacement)

    with open("src/components/CinemaPlayerView.tsx", "w") as f:
        f.write(content)
        print("Updated CinemaPlayerView")

main()
