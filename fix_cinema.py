import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Make the subtitle button more prominent by adding text "SOUS-TITRES"
target = """                <button
                  id="cinema-subtitle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubtitleMenu(prev => !prev);
                  }}
                  className={`p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                    subtitlesOn && activeSubtitleIndex !== null ? "text-amber-400" : ""
                  }`}
                  title="Subtitles"
                >
                  <Captions className="w-5 h-5" />
                </button>"""

replacement = """                <button
                  id="cinema-subtitle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubtitleMenu(prev => !prev);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-white/60 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    subtitlesOn && activeSubtitleIndex !== null ? "text-amber-400 border-amber-500/50 bg-amber-500/10" : "border-white/10"
                  }`}
                  title="Sous-titres (Subtitles)"
                >
                  <Captions className="w-5 h-5" />
                  <span className="font-bold text-[11px] uppercase tracking-wider hidden sm:block">Sous-titres</span>
                </button>"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("TARGET NOT FOUND IN CINEMA")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
