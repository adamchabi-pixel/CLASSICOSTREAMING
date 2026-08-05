with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace('    ["rocky balboa", "rocky 6", "rocky vi"],', '    ["rocky balboa", "rocky 6", "rocky vi"],\n    ["the terminator", "terminator", "terminator 1"],')

with open('src/App.tsx', 'w') as f:
    f.write(text)
