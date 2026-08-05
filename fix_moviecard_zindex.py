import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

# Change z-0 to z-50 for the number
text = text.replace('z-0 font-display font-black', 'z-50 font-display font-black')

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
