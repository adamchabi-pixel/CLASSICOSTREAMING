import sys

with open("server.ts", "r") as f:
    content = f.read()

target = """function getGlobalImportedMovies() {
    let imported = [...importedMoviesData];
    const DB_PATH = path.join(process.cwd(), "imported_movies.json");
    if (fs.existsSync(DB_PATH)) {
      try {
        const existingMovies = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
        if (Array.isArray(existingMovies)) {
           imported = [...existingMovies, ...imported];
        }
      } catch(e) {}
    }
    // Dedup by id
    const unique = [];
    const seen = new Set();
    for (const m of imported) {
       if (!seen.has(m.id)) {
           seen.add(m.id);
           unique.push(m);
       }
    }
    return unique;
}"""

replacement = """function getGlobalImportedMovies() {
    return [...importedMoviesData];
}"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target not found")

with open("server.ts", "w") as f:
    f.write(content)
