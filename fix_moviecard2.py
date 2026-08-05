import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

text = text.replace('className=`absolute', 'className={`absolute')
text = text.replace('origin-bottom-right`', 'origin-bottom-right`}')

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)
