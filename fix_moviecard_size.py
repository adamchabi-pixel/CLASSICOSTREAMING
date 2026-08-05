import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

# Replace the MovieCard className to just be w-full h-full, since LazyVirtualCard defines the size
text = text.replace(
    'className={`relative flex-none aspect-[2/3] cursor-pointer group transition-all duration-300 ease-out will-change-transform hover:scale-[1.03] ${trendingIndex !== undefined ? "w-[170px] min-[400px]:w-[200px] sm:w-[250px] mr-12 sm:mr-20" : "w-[140px] min-[400px]:w-[160px] sm:w-[210px]"}`}',
    'className="relative w-full h-full cursor-pointer group transition-all duration-300 ease-out will-change-transform hover:scale-[1.03]"'
)

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
