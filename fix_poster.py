import re

with open('src/data.ts', 'r') as f:
    text = f.read()

text = text.replace(
    'title: "Devil Wears Prada 2",',
    'title: "Devil Wears Prada 2",\n        posterUrl: "https://image.tmdb.org/t/p/w500/fCAURTUx3YfsJ8k9I0UamjSILiR.jpg",'
)

with open('src/data.ts', 'w') as f:
    f.write(text)
