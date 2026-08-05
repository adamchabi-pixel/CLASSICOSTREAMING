import sys

with open("server.ts", "r") as f:
    content = f.read()

target = """    fs.writeFileSync(HERO_CACHE_PATH, JSON.stringify(formattedHeroes, null, 2), "utf-8");

    res.json({
      success: true,
      heroes: formattedHeroes,
      hero: formattedHeroes[0]
    });"""

replacement = """    fs.writeFileSync(HERO_CACHE_PATH, JSON.stringify(formattedHeroes, null, 2), "utf-8");

    let importedMovies = [];
    try {
      if (fs.existsSync(path.join(process.cwd(), "imported_movies.json"))) {
        importedMovies = JSON.parse(fs.readFileSync(path.join(process.cwd(), "imported_movies.json"), "utf-8"));
      }
    } catch (e) {}

    const allHeroes = [...importedMovies.reverse(), ...formattedHeroes].slice(0, 5);

    res.json({
      success: true,
      heroes: allHeroes,
      hero: allHeroes[0]
    });"""

content = content.replace(target, replacement)

with open("server.ts", "w") as f:
    f.write(content)
