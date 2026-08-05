import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_menu = 'className="md:hidden absolute top-16 right-4 w-48 bg-black/75 backdrop-blur-md overflow-hidden border border-white/5 rounded-2xl shadow-2xl origin-top-right"'
new_menu = 'className="md:hidden absolute top-[calc(100%+0.5rem)] right-4 w-48 bg-black/75 backdrop-blur-md overflow-hidden border border-white/5 rounded-2xl shadow-2xl origin-top-right"'

text = text.replace(old_menu, new_menu)

with open('src/App.tsx', 'w') as f:
    f.write(text)
