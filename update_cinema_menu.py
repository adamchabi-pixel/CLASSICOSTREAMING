import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Add Chevron imports
if "ChevronRight" not in content:
    content = content.replace("Captions, Lock, Airplay, Menu, Cast, Settings", "Captions, Lock, Airplay, Menu, Cast, Settings, ChevronRight, ChevronLeft")

# Add settingsView state
state_target = "  const [showSettingsMenu, setShowSettingsMenu] = useState(false);"
state_replacement = "  const [showSettingsMenu, setShowSettingsMenu] = useState(false);\n  const [settingsView, setSettingsView] = useState<\"main\" | \"audio\" | \"subtitles\">(\"main\");"
if state_target in content:
    content = content.replace(state_target, state_replacement)

# Update resetting settingsView when menu closes
click_target = """      if (!target.closest("#cinema-settings-btn") && !target.closest("#cinema-settings-menu")) {
        setShowSettingsMenu(false);
      }
    };"""
click_replacement = """      if (!target.closest("#cinema-settings-btn") && !target.closest("#cinema-settings-menu")) {
        setShowSettingsMenu(false);
        setTimeout(() => setSettingsView("main"), 200);
      }
    };"""
if click_target in content:
    content = content.replace(click_target, click_replacement)

timeout_target = """      if (playing) {
        setControlsVisible(false);
        setShowSettingsMenu(false);
      }"""
timeout_replacement = """      if (playing) {
        setControlsVisible(false);
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
                              className={`px-2 py-1.5 rounded shrink-0 font-bold transition-colors cursor-pointer text-[10px] ${
                                playbackRate === speed ? "bg-amber-500 text-zinc-950" : "bg-white/5 text-zinc-300 hover:bg-white/10"
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Menu Audio */}
                      {playbackInfo?.audios && playbackInfo.audios.length > 0 && (
                        <button
                          onClick={() => setSettingsView("audio")}
                          className="w-full px-2.5 py-2 mb-1 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 text-zinc-300"
                        >
                          <span className="font-semibold text-[11px]">Audio</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-500 text-[10px] max-w-[80px] truncate">
                              {playbackInfo.audios.find((a: any) => a.index === activeAudioIndex)?.label || "Sélectionner"}
                            </span>
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                          </div>
                        </button>
                      )}

                      {/* Menu Sous-titres */}
                      <button
                        onClick={() => setSettingsView("subtitles")}
                        className="w-full px-2.5 py-2 mb-3 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 text-zinc-300"
                      >
                        <span className="font-semibold text-[11px]">Sous-titres</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 text-[10px] max-w-[80px] truncate">
                            {(!subtitlesOn || activeSubtitleIndex === null) 
                              ? "Désactivé" 
                              : (playbackInfo?.subtitles?.find((s: any) => s.index === activeSubtitleIndex)?.label || "Activé")}
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
                        {playbackInfo?.audios && playbackInfo.audios.map((track: any) => {
                          const isCurrentActive = activeAudioIndex === track.index;
                          return (
                            <button
                              key={track.index}
                              onClick={() => {
                                setActiveAudioIndex(track.index);
                                // Don't close immediately so user can see what they clicked
                              }}
                              className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                isCurrentActive ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              <span className="font-semibold text-[11px] truncate">{track.label || `Track ${track.index}`}</span>
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
                            setSubtitlesOn(false);
                          }}
                          className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
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
    print("Could not match settings menu in CinemaPlayerView")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
