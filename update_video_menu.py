import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

# Add Chevron imports
if "ChevronRight" not in content:
    content = content.replace("Captions, Airplay, Maximize2, Menu, Cast, Settings2, Info, Sparkles, AlertCircle, Rewind, FastForward", "Captions, Airplay, Maximize2, Menu, Cast, Settings2, Info, Sparkles, AlertCircle, Rewind, FastForward, ChevronRight, ChevronLeft")

# Add settingsView state
state_target = "  const [showSettingsMenu, setShowSettingsMenu] = useState(false);"
state_replacement = "  const [showSettingsMenu, setShowSettingsMenu] = useState(false);\n  const [settingsView, setSettingsView] = useState<\"main\" | \"audio\" | \"subtitles\">(\"main\");"
if state_target in content:
    content = content.replace(state_target, state_replacement)

# Update resetting settingsView when menu closes
click_target = """    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#player-settings-btn") && !target.closest("#player-settings-menu")) {
        setShowSettingsMenu(false);
      }
    };"""
click_replacement = """    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#player-settings-btn") && !target.closest("#player-settings-menu")) {
        setShowSettingsMenu(false);
        setTimeout(() => setSettingsView("main"), 200);
      }
    };"""
if click_target in content:
    content = content.replace(click_target, click_replacement)

timeout_target = """      if (videoRef.current && !videoRef.current.paused) {
        setIsControlsVisible(false);
        setShowSettingsMenu(false);
      }"""
timeout_replacement = """      if (videoRef.current && !videoRef.current.paused) {
        setIsControlsVisible(false);
        setShowSettingsMenu(false);
        setTimeout(() => setSettingsView("main"), 200);
      }"""
if timeout_target in content:
    content = content.replace(timeout_target, timeout_replacement)

# Update menu content
menu_regex = re.compile(r'                  \{\/\* Vitesse de lecture \*\/\}[\s\S]*?                  \{\/\* Popout \(PiP\) \*\/\}.*?<\/button>\s*\)\}\s*', re.DOTALL)

new_menu = """                  {settingsView === "main" && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-200">
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

                      {/* Menu Audio */}
                      {isJellyfinMovie && playbackInfo?.audios && playbackInfo.audios.length > 0 && (
                        <button
                          onClick={() => setSettingsView("audio")}
                          className="w-full px-2.5 py-2.5 mb-1 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 text-zinc-300"
                        >
                          <span className="font-semibold text-[11px]">Audio</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-500 text-[10px] max-w-[80px] truncate">
                              {playbackInfo.audios.find(a => a.index === activeAudioIndex)?.label || "Sélectionner"}
                            </span>
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                          </div>
                        </button>
                      )}

                      {/* Menu Sous-titres */}
                      <button
                        onClick={() => setSettingsView("subtitles")}
                        className="w-full px-2.5 py-2.5 mb-3 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 text-zinc-300"
                      >
                        <span className="font-semibold text-[11px]">Sous-titres</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 text-[10px] max-w-[80px] truncate">
                            {(!videoState.subtitlesOn || activeSubtitleIndex === null) 
                              ? "Désactivé" 
                              : (playbackInfo?.subtitles?.find(s => s.index === activeSubtitleIndex)?.label || "Activé")}
                          </span>
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                      </button>

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
                            setTimeout(() => setSettingsView("main"), 200);
                          }}
                          className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-bold text-[11px] flex justify-center items-center cursor-pointer transition-colors"
                        >
                          Mode Popout (PiP)
                        </button>
                      )}
                    </div>
                  )}

                  {settingsView === "audio" && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                        <button 
                          onClick={() => setSettingsView("main")}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-zinc-300 font-bold tracking-wide text-[11px] uppercase">Audio</span>
                      </div>
                      <div className="space-y-0.5 max-h-[40vh] overflow-y-auto pr-1">
                        {playbackInfo?.audios && playbackInfo.audios.map(track => {
                          const isCurrentActive = activeAudioIndex === track.index;
                          return (
                            <button
                              key={track.index}
                              onClick={() => {
                                setActiveAudioIndex(track.index);
                                // Don't close menu immediately, let user see selection
                              }}
                              className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                isCurrentActive ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              <span className="font-semibold text-[11px] truncate">{track.label}</span>
                              {isCurrentActive && <span className="text-amber-500 pl-2">✔</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {settingsView === "subtitles" && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                        <button 
                          onClick={() => setSettingsView("main")}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-zinc-300 font-bold tracking-wide text-[11px] uppercase">Sous-titres</span>
                      </div>
                      <div className="space-y-0.5 max-h-[40vh] overflow-y-auto pr-1">
                        <button
                          onClick={() => {
                            setActiveSubtitleIndex(null);
                            setVideoState(prev => ({ ...prev, subtitlesOn: false }));
                          }}
                          className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
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
                              className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
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
                  )}
"""

if menu_regex.search(content):
    content = menu_regex.sub(new_menu, content)
else:
    print("Could not match settings menu in VideoPlayer")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
