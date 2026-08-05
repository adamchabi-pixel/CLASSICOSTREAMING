with open("index.html", "r") as f:
    text = f.read()

text = text.replace('<link rel="icon" type="image/x-icon" href="/favicon.ico?v=99" />', '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />')

with open("index.html", "w") as f:
    f.write(text)
