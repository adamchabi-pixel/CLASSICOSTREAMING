import sys

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                {/* Film Library & Watchlists */}
                <div className="space-y-8">
                  
                  {/* Watchlist Row displaying bookmarked films */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                      My Watchlist ({watchlist.length})
                    </h3>"""

replacement = """                {/* Film Library & Watchlists */}
                <div className="space-y-12">
                  
                  {/* Imported Movies Row */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Film className="w-4 h-4 text-indigo-500" />
                      Mes Films Ajoutés ({allMovies.filter(m => m.isIframeEmbed).length})
                    </h3>
                    {allMovies.filter(m => m.isIframeEmbed).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 justify-items-center">
                        {allMovies
                          .filter(m => m.isIframeEmbed)
                          .map((movie, idx) => (
                            <LazyVirtualCard key={`${movie.id}-imported-${idx}`}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                              />
                            </LazyVirtualCard>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-sm">Aucun film ajouté pour le moment.</p>
                    )}
                  </div>

                  {/* Watchlist Row displaying bookmarked films */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                      My Watchlist ({watchlist.length})
                    </h3>"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)
