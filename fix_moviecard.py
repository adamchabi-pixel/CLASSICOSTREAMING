import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

# Fix the class name
old_class = r'className=\{\`absolute -bottom-1 sm:-bottom-2 \$\{trendingIndex === 1 \? "-right-4 sm:-right-8" : trendingIndex === 4 \? "-right-5 sm:-right-10" : "-right-7 sm:-right-12"\} z-50 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-\[0_10px_20px_rgba\(0,0,0,1\)\] group-hover:scale-105 transition-transform duration-300 origin-bottom-right\`\}'

new_class = 'className={`absolute -bottom-1 sm:-bottom-2 ${trendingIndex === 1 ? "-right-3 sm:-right-6" : "-right-5 sm:-right-8"} z-50 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300 origin-bottom-right`}'

text = re.sub(old_class, new_class, text)

# Fix the font size
text = text.replace('fontSize: "clamp(7rem, 11vw, 12rem)"', 'fontSize: "clamp(5.5rem, 8vw, 9rem)"')

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
