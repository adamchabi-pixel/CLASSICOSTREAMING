with open('src/data.ts', 'r') as f:
    text = f.read()

text = text.replace('"Terminator 2 : Le Jugement dernier"', '"Terminator 2: Judgment Day"')
text = text.replace('"Terminator 3 : Le Soulèvement des machines"', '"Terminator 3: Rise of the Machines"')

with open('src/data.ts', 'w') as f:
    f.write(text)
