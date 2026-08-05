import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_header = '      <header className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ease-in-out border-b ${isScrolled ? "bg-black border-white/5" : "bg-black border-transparent"}`}>'
new_header = '      <header className={`fixed top-0 left-0 right-0 z-[9999] pt-[env(safe-area-inset-top)] transition-all duration-300 ease-in-out border-b ${isScrolled ? "bg-black border-white/5" : "bg-black border-transparent"}`}>'

text = text.replace(old_header, new_header)

with open('src/App.tsx', 'w') as f:
    f.write(text)
