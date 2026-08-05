import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Remove the alias group
content = content.replace('    ["the batman", "batman begins", "the dark knight", "the dark knight rises"],\n', '')

# Remove recently viewed
target_recently_viewed = """                {/* RECENTLY VIEWED SECTION */}
                {recentlyViewed.length > 0 && !searchQuery && (
                  <div className="space-y-4 text-left pb-10">
                    <div className="flex flex-row items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-[#D4AF37]" />
                        <h2 className="text-[14px] sm:text-[18px] font-cinzel font-bold text-white uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                          Recently Viewed
                        </h2>
                      </div>
                    </div>
                    <div className="relative group w-full">
                      <div className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 pb-4 snap-x snap-mandatory">
                        {recentlyViewed.map((movie) => {
                          const progressPercent = movie.duration ? (movie.currentTime / movie.duration) * 100 : 0;
                          return (
                            <motion.div
                              key={movie.id}
                              whileHover={{ scale: 1.05, y: -5 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                // Jump directly to playback
                                (window as any).moviePlayClickTime = performance.now();
                                navigateTo("/player/" + movie.id);
                              }}
                              className="relative shrink-0 snap-center cursor-pointer group rounded-xl overflow-hidden shadow-xl"
                              style={{ width: "160px" }}
                            >
                              <div className="aspect-[2/3] w-full relative">
                                <img 
                                  src={movie.poster || movie.posterUrl} 
                                  alt={movie.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/90 text-zinc-950 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                                    <Play className="w-5 h-5 ml-1" />
                                  </div>
                                </div>
                                <div className="absolute bottom-4 left-2 right-2 text-center z-20">
                                  <h3 className="text-white text-xs font-bold truncate drop-shadow-md">{movie.title}</h3>
                                </div>
                              </div>
                              
                              {/* PROGRESS BAR */}
                              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-900 z-30">
                                <div 
                                  className="h-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
                                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}"""

content = content.replace(target_recently_viewed, "                {/* REMOVED RECENTLY VIEWED SECTION */}")

# Fix sortSagaMovies for Star Wars 1977
target_sort = '      if (/\\b(episode\\s*4|episode\\s*iv\\b|un\\s*nouvel\\s*espoir|new\\s*hope)/i.test(s)) return 4;'
replace_sort = '      if (/\\b(episode\\s*4|episode\\s*iv\\b|un\\s*nouvel\\s*espoir|new\\s*hope)/i.test(s) || (s.includes("star wars") && m.year === 1977) || s === "star wars") return 4;'

content = content.replace(target_sort, replace_sort)

with open("src/App.tsx", "w") as f:
    f.write(content)

