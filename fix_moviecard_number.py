import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

old_number = """      {/* Trending Number Indicator */}
      {trendingIndex !== undefined && (
        <div className="absolute bottom-[-10px] right-2 z-[60] font-display font-black italic text-transparent bg-clip-text bg-gradient-to-t from-white via-neutral-300 to-neutral-500 drop-shadow-[0_8px_16px_rgba(0,0,0,1)] select-none pointer-events-none group-hover:scale-110 transition-transform duration-300 origin-bottom-right" 
             style={{ fontSize: "8rem", lineHeight: "1", WebkitTextStroke: "2px rgba(0,0,0,0.8)" }}>
          {trendingIndex}
        </div>
      )}"""
new_number = """      {/* Trending Number Indicator */}
      {trendingIndex !== undefined && (
        <div className="absolute bottom-1 right-2 z-[60] font-display font-black italic text-transparent bg-clip-text bg-gradient-to-t from-white via-neutral-200 to-neutral-500 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] select-none pointer-events-none group-hover:scale-110 transition-transform duration-300 origin-bottom-right" 
             style={{ fontSize: "7rem", lineHeight: "0.85", WebkitTextStroke: "3px rgba(0,0,0,0.6)" }}>
          {trendingIndex}
        </div>
      )}"""
text = text.replace(old_number, new_number)

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
