import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target = """                              <span className="font-sans text-[11px] font-semibold">{track.label}</span>
                              {track.language && track.language !== track.label && (
                                <span className="text-[9px] text-zinc-500 uppercase">{track.language}</span>
                              )}
                            </div>
                            {isCurrentActive && <span className="text-[9px] font-mono font-black text-amber-500">✔</span>}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-2 py-3 text-center text-zinc-500 font-medium italic text-[10px]">
                        Aucun sous-titre extrait
                      </div>
                    )}"""

# Let me first check if the target exists or if the structure is different.
