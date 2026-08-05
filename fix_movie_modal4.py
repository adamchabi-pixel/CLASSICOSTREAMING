with open('src/components/MovieModal.tsx', 'r') as f:
    text = f.read()

text = text.replace('          {(\n            /* ========================================================== */', '            {/* ========================================================== */')

with open('src/components/MovieModal.tsx', 'w') as f:
    f.write(text)
