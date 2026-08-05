import re

with open("src/components/MovieDetailView.tsx", "r") as f:
    content = f.read()

# We'll inject the Casting Carousel right before the accordion panels.
carousel_code = """
      {/* CASTING CAROUSEL (Loads immediately) */}
      {(movie.castDetails && movie.castDetails.length > 0) ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-12 text-left">
          <h3 className="flex items-center gap-2 font-forum text-xl font-bold uppercase tracking-wider text-[#f4ecd8] mb-6">
            <Users className="w-5 h-5 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
            Distribution
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {movie.castDetails.map((actor: any, idx: number) => (
              <div 
                key={`${actor.id}-${idx}`} 
                className="flex-shrink-0 w-[120px] sm:w-[140px] snap-start group cursor-pointer"
              >
                <div className="w-full aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 mb-3 shadow-lg relative">
                  {actor.imageUrl ? (
                    <img 
                      src={actor.imageUrl} 
                      alt={actor.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800/50 text-[#f4ecd8]/40">
                      <Users className="w-10 h-10" />
                    </div>
                  )}
                  {/* Subtle gradient overlay at bottom for text readability if we wanted to overlay text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h4 className="text-[#f4ecd8] font-sans font-bold text-sm leading-tight truncate">{actor.name}</h4>
                {actor.role && (
                  <p className="text-zinc-500 font-sans text-xs truncate mt-0.5">{actor.role}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-12 text-left">
          {movie.cast && movie.cast.length > 0 && (
            <>
              <h3 className="flex items-center gap-2 font-forum text-xl font-bold uppercase tracking-wider text-[#f4ecd8] mb-6">
                <Users className="w-5 h-5 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
                Distribution
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {movie.cast.map((actor, idx) => (
                  <div
                    key={`${actor}-${idx}`}
                    className="flex items-center gap-3 bg-neutral-900/60 border border-zinc-900 p-3.5 rounded-xl text-zinc-300 text-sm font-sans"
                  >
                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-[#f4ecd8] border border-[#f4ecd8]/20 bg-[#f4ecd8]/5 shadow-sm">
                      {actor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="font-medium tracking-wide text-zinc-200 truncate">{actor}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
"""

# Find where to insert it: right before {/* 3. MINIMALIST COLLAPSIBLE ACCORDION PANELS */}
target_insert = "{/* 3. MINIMALIST COLLAPSIBLE ACCORDION PANELS */}"
if target_insert in content:
    content = content.replace(target_insert, carousel_code + "\n      " + target_insert)

# Now remove SECTION B from the accordion
section_b_regex = re.compile(r'          \{\/\* SECTION B: CASTING \*\/\}[\s\S]*?\{\/\* SECTION C: BANDE ANNONCE \*\/\}')
if section_b_regex.search(content):
    content = section_b_regex.sub('          {/* SECTION C: BANDE ANNONCE */}', content)

with open("src/components/MovieDetailView.tsx", "w") as f:
    f.write(content)
    print("Updated MovieDetailView.tsx")
