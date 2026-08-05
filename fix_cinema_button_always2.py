import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """                      {/* Jellyfin subtitle tracks */}
                      {playbackInfo.subtitles.map((track) => {"""

replacement = """                      {/* Jellyfin subtitle tracks */}
                      {playbackInfo?.subtitles && playbackInfo.subtitles.length > 0 ? playbackInfo.subtitles.map((track) => {"""

content = content.replace(target, replacement)

target2 = """                            {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}"""

replacement2 = """                            {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
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
