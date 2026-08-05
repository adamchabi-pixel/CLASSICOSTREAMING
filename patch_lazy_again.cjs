const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace('import { allMoviesData } from "./data/all_movies";\\nimport { importedMoviesData } from "./data/imported_movies";\\nimport { heroMoviesData } from "./data/hero_movies";\\n', '');

const targetHook = `  const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {`;

const replacementHook = `  const [asyncData, setAsyncData] = useState<{all: any[], imported: any[], hero: any} | null>(null);

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
  }, []);

  const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {`;

app = app.replace(targetHook, replacementHook);

app = app.replace('const combined = [...importedMoviesData, ...allMoviesData].filter(m => m && !isAnimeOrAdult(m as unknown as Movie));',
'const combined = (asyncData ? [...asyncData.imported, ...asyncData.all] : []).filter(m => m && !isAnimeOrAdult(m as unknown as Movie));');

app = app.replace('const heroMovies = heroMoviesData.heroes;',
'const heroMovies = asyncData ? asyncData.hero.heroes : [];');

app = app.replace('  }, []);', '  }, [asyncData]);');
app = app.replace('    return finalMovies;\\n  }, []);', '    return finalMovies;\\n  }, [asyncData]);');

app = app.replace('const isHeroLoading = false;', 'const isHeroLoading = !asyncData;');

fs.writeFileSync('src/App.tsx', app);
console.log("Success");
