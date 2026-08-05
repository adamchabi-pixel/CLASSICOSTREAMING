with open('src/components/MovieModal.tsx', 'r') as f:
    text = f.read()

text = text.replace('Cast principale', 'Main Cast')
text = text.replace('Fiche Technique', 'Technical Sheet')

with open('src/components/MovieModal.tsx', 'w') as f:
    f.write(text)
