import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target = """<span className="font-bold text-[11px] uppercase tracking-wider hidden sm:block">Sous-titres</span>"""
replacement = """<span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">Sous-titres</span>"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("TARGET NOT FOUND")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
