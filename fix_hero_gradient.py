with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace('from-black via-black/50', 'from-stone-950 via-stone-950/60')

with open('src/App.tsx', 'w') as f:
    f.write(text)
