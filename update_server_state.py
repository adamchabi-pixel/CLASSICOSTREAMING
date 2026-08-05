import sys

with open("server.ts", "r") as f:
    content = f.read()

# 1. Add the import
import_stmt = "import { importedMoviesData } from './src/data/imported_movies';\nlet globalImportedMovies = [...importedMoviesData];\n"
if "globalImportedMovies" not in content:
    content = content.replace("const app = express();", import_stmt + "\nconst app = express();")

# 2. Update POST /api/admin/movies/add
target_add = """    // Sauvegarde dans imported_movies.json
    const DB_PATH = path.join(process.cwd(), "imported_movies.json");
    let existingMovies = [];
    if (fs.existsSync(DB_PATH)) {
      try {
        existingMovies = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      } catch (e) {}
    }
    
    for (const newM of addedMovies) {
      existingMovies = existingMovies.filter(m => m.id !== newM.id);
      existingMovies.unshift(newM);
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(existingMovies, null, 2));"""

replacement_add = """    // Sauvegarde en mémoire et (optionnel) dans le fichier local
    for (const newM of addedMovies) {
      globalImportedMovies = globalImportedMovies.filter((m: any) => m.id !== newM.id);
      globalImportedMovies.unshift(newM);
    }
    
    try {
      const DB_PATH = path.join(process.cwd(), "imported_movies.json");
      fs.writeFileSync(DB_PATH, JSON.stringify(globalImportedMovies, null, 2));
    } catch (e) {
      // Ignorer si le système de fichiers est en lecture seule (ex: Cloud Run)
    }"""

content = content.replace(target_add, replacement_add)

# 3. Update all places reading imported_movies.json
read_target = """    let importedMovies = [];
    try {
      if (fs.existsSync(path.join(process.cwd(), "imported_movies.json"))) {
        importedMovies = JSON.parse(fs.readFileSync(path.join(process.cwd(), "imported_movies.json"), "utf-8"));
      }
    } catch (e) {}"""

content = content.replace(read_target, "    let importedMovies = globalImportedMovies;")

with open("server.ts", "w") as f:
    f.write(content)
