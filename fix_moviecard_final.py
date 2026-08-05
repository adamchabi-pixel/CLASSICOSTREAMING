import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

# Replace the outer class string to make trending cards larger
old_class = 'className={`relative flex-none aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-neutral-900 border border-neutral-800/80 transition-all duration-300 ease-out will-change-transform hover:scale-[1.03] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8),0_0_15px_2px_var(--hover-glow)] ${trendingIndex !== undefined ? "w-[170px] min-[400px]:w-[190px] sm:w-[250px]" : "w-[140px] min-[400px]:w-[160px] sm:w-[210px]"}`}'
new_class = 'className={`relative flex-none aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-neutral-900 border border-neutral-800/80 transition-all duration-300 ease-out will-change-transform hover:scale-[1.03] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8),0_0_15px_2px_var(--hover-glow)] ${trendingIndex !== undefined ? "w-[180px] min-[400px]:w-[220px] sm:w-[280px]" : "w-[140px] min-[400px]:w-[160px] sm:w-[210px]"}`}'
text = text.replace(old_class, new_class)

# Replace the number to be bottom-0 right-0 and z-[60] so it's fully inside and on top
old_number = """      {/* Trending Number Indicator */}
      {trendingIndex !== undefined && (
        <div className="absolute -bottom-4 -right-1 z-30 font-display font-black italic text-transparent bg-clip-text bg-gradient-to-t from-white via-neutral-300 to-neutral-500 drop-shadow-[0_4px_12px_rgba(0,0,0,1)] select-none pointer-events-none group-hover:scale-110 transition-transform duration-300" 
             style={{ fontSize: "6rem", lineHeight: "1", WebkitTextStroke: "2px rgba(0,0,0,0.8)" }}>
          {trendingIndex}
        </div>
      )}"""
new_number = """      {/* Trending Number Indicator */}
      {trendingIndex !== undefined && (
        <div className="absolute bottom-[-10px] right-2 z-[60] font-display font-black italic text-transparent bg-clip-text bg-gradient-to-t from-white via-neutral-300 to-neutral-500 drop-shadow-[0_8px_16px_rgba(0,0,0,1)] select-none pointer-events-none group-hover:scale-110 transition-transform duration-300 origin-bottom-right" 
             style={{ fontSize: "8rem", lineHeight: "1", WebkitTextStroke: "2px rgba(0,0,0,0.8)" }}>
          {trendingIndex}
        </div>
      )}"""
text = text.replace(old_number, new_number)

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
