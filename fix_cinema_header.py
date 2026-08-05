import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    text = f.read()

old_header = 'className={`relative p-6 bg-gradient-to-b from-black/95 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-50 ${'
new_header = 'className={`relative p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] bg-gradient-to-b from-black/95 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-50 ${'

text = text.replace(old_header, new_header)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(text)
