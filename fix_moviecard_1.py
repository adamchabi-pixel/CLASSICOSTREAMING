import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

# Make all numbers use the same right offset
old_line = "className={`absolute -bottom-1 sm:-bottom-2 ${trendingIndex === 1 ? '-right-6 sm:-right-12' : '-right-8 sm:-right-16'} z-50 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300 origin-bottom-right`}"
new_line = "className=\"absolute -bottom-1 sm:-bottom-2 -right-8 sm:-right-16 z-50 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300 origin-bottom-right\""
text = text.replace(old_line, new_line)

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
