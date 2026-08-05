import sys

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace("const allHeroes = [...importedMovies.reverse(), ...cachedHeroes];", "const allHeroes = [...importedMovies.reverse(), ...cachedHeroes].slice(0, 5);")
content = content.replace("const allHeroes = [...importedMovies.reverse(), ...formattedHeroes];", "const allHeroes = [...importedMovies.reverse(), ...formattedHeroes].slice(0, 5);")

with open("server.ts", "w") as f:
    f.write(content)
