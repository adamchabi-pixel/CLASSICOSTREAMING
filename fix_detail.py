import re

with open('src/components/MovieDetailView.tsx', 'r') as f:
    text = f.read()

# Fix the main CTA
old_btn = r'<button\s*onClick=\{\(\) => onPlay\(movie\.id\)\}\s*className="inline-flex items-center gap-2\.5 gold-button px-6 py-3 sm:px-8 sm:py-3\.5 \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:px-4 \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:py-2 rounded-full text-\[13px\] \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:text-\[11px\] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"\s*>\s*<Play className="w-4 h-4 fill-current" />\s*Play\s*</button>'

new_btn = """{movie.isJellyfin ? (
              <button
                onClick={() => onPlay(movie.id)}
                className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
              >
                <Play className="w-4 h-4 fill-current" />
                Play
              </button>
            ) : (
              <div className="inline-flex items-center gap-2.5 bg-neutral-900/60 border border-zinc-800 text-zinc-500 px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-[13px] tracking-widest uppercase font-bold cursor-not-allowed">
                <span className="whitespace-nowrap">Non dispo sur Jellyfin</span>
              </div>
            )}"""

text = re.sub(old_btn, new_btn, text)

# Fix the trailer CTA
old_trailer = r'<button\s*onClick=\{\(\) => onPlay\(movie\.id\)\}\s*className="bg-zinc-900 hover:bg-\[\#f4ecd8\] hover:text-black border border-zinc-800 text-white text-\[11px\] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-200"\s*>\s*Play Full Movie\s*</button>'

new_trailer = """{movie.isJellyfin ? (
                          <button
                            onClick={() => onPlay(movie.id)}
                            className="bg-zinc-900 hover:bg-[#f4ecd8] hover:text-black border border-zinc-800 text-white text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-200 cursor-pointer"
                          >
                            Play Full Movie
                          </button>
                        ) : (
                          <button
                            disabled
                            className="bg-zinc-900/50 border border-zinc-800/50 text-zinc-600 text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-lg cursor-not-allowed"
                          >
                            Bientôt Disponible
                          </button>
                        )}"""

text = re.sub(old_trailer, new_trailer, text)

with open('src/components/MovieDetailView.tsx', 'w') as f:
    f.write(text)
