const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace('import { allMoviesData } from "./data/all_movies";\n', '');
app = app.replace('import { importedMoviesData } from "./data/imported_movies";\n', '');
app = app.replace('import { heroMoviesData } from "./data/hero_movies";\n', '');

const target = 'const [librarySort, setLibrarySort] = useState<"a-z" | "z-a" | "newest" | "oldest">("newest");';
const replacement = `const [librarySort, setLibrarySort] = useState<"a-z" | "z-a" | "newest" | "oldest">("newest");
  const [asyncData, setAsyncData] = useState<{all: any[], imported: any[], hero: any} | null>(null);

  useEffect(() => {
    Promise.all([
      import('./data/all_movies'),
      import('./data/imported_movies'),
      import('./data/hero_movies')
    ]).then(([all, imported, hero]) => {
      setAsyncData({
        all: all.allMoviesData,
        imported: imported.importedMoviesData,
        hero: hero.heroMoviesData
      });
    });
  }, []);`;

app = app.replace(target, replacement);

app = app.replace('const combined = [...importedMoviesData, ...allMoviesData]', 'const combined = asyncData ? [...asyncData.imported, ...asyncData.all] : []');
app = app.replace('const heroMovies = heroMoviesData.heroes;', 'const heroMovies = asyncData ? asyncData.hero.heroes : [];');
app = app.replace('}, []); // Assuming these are static imports, but if they become state they should be added here.', '}, [asyncData]);');
app = app.replace('    return finalMovies;\n  }, []);', '    return finalMovies;\n  }, [asyncData]);');

fs.writeFileSync('src/App.tsx', app);
console.log("Success");
