with open("index.html", "r") as f:
    text = f.read()

text = text.replace('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />', '<link rel="icon" type="image/png" href="/favicon.png" />')

with open("index.html", "w") as f:
    f.write(text)
