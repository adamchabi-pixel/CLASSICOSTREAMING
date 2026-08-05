import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

text = text.replace('origin-bottom-left', 'origin-bottom-right')

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
