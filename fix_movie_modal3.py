with open('src/components/MovieModal.tsx', 'r') as f:
    text = f.read()

text = text.replace('          (\n            <div className="flex flex-col h-full overflow-hidden">', '          <div className="flex flex-col h-full overflow-hidden">')
text = text.replace('            </div>\n)', '            </div>')

with open('src/components/MovieModal.tsx', 'w') as f:
    f.write(text)
