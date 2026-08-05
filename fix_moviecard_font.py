import re

with open('src/components/MovieCard.tsx', 'r') as f:
    text = f.read()

text = text.replace('clamp(10rem, 15vw, 16rem)', 'clamp(8rem, 12vw, 13rem)')
text = text.replace('-right-12 sm:-right-20', '-right-8 sm:-right-16')

with open('src/components/MovieCard.tsx', 'w') as f:
    f.write(text)

with open('src/App.tsx', 'r') as f:
    app_text = f.read()

app_text = app_text.replace('mr-12 sm:mr-20', 'mr-8 sm:mr-16')

with open('src/App.tsx', 'w') as f:
    f.write(app_text)
