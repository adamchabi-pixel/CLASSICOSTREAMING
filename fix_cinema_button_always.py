import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """            {/* Subtitles Button next to Volume */}
            {playbackInfo?.subtitles && playbackInfo.subtitles.length > 0 && (
              <div className="relative border-l border-white/10 pl-2 sm:pl-4">
                <button"""

replacement = """            {/* Subtitles Button next to Volume */}
              <div className="relative border-l border-white/10 pl-2 sm:pl-4">
                <button"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("TARGET NOT FOUND 1")

# Also need to fix the closing brace for the condition
target2 = """                        return (
                          <button
                            key={track.index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSubtitleIndex(track.index);
                              setSubtitlesOn(true);
                              setShowSubtitleMenu(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                              isCurrentActive
                                ? "bg-amber-500/10 text-white font-bold"
                                : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            <span className="truncate pr-2">{track.label || track.language || `Track ${track.index}`}</span>
                            {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}"""

replacement2 = """                        return (
                          <button
                            key={track.index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSubtitleIndex(track.index);
                              setSubtitlesOn(true);
                              setShowSubtitleMenu(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                              isCurrentActive
                                ? "bg-amber-500/10 text-white font-bold"
                                : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            <span className="truncate pr-2">{track.label || track.language || `Track ${track.index}`}</span>
                            {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                          </button>
                        );
                      }) : (
                        <div className="px-2 py-3 text-center text-zinc-500 font-medium italic text-[10px]">
                          Aucun sous-titre disponible
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>"""

if target2 in content:
    content = content.replace(target2, replacement2)
else:
    print("TARGET NOT FOUND 2")


with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
