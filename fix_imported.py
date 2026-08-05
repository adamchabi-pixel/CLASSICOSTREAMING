import sys

with open("server.ts", "r") as f:
    content = f.read()

target = """let globalImportedMovies = [...importedMoviesData];"""

replacement = """let globalImportedMovies = [...importedMoviesData];
function getGlobalImportedMovies() {
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
}
"""
content = content.replace(target, replacement)
content = content.replace("let importedMovies = globalImportedMovies;", "let importedMovies = getGlobalImportedMovies();")

with open("server.ts", "w") as f:
    f.write(content)
