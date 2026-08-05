import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

# Add pr-4 pb-2 to the trendingIndex class
old_class = r'className=\{\`absolute -bottom-1 sm:-bottom-2 \$\{trendingIndex === 1 \? "-right-3 sm:-right-6" : "-right-5 sm:-right-8"\} z-50 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-\[0_10px_20px_rgba\(0,0,0,1\)\] group-hover:scale-105 transition-transform duration-300 origin-bottom-right\`\}'

new_class = 'className={`absolute -bottom-1 sm:-bottom-2 ${trendingIndex === 1 ? "-right-6 sm:-right-10" : "-right-8 sm:-right-12"} z-50 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300 origin-bottom-right pr-3 pb-2`}'

text = re.sub(old_class, new_class, text)

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
