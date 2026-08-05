const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace('import React, { useState, useEffect, useRef } from "react";',
'import React, { useState, useEffect, useRef } from "react";\nimport { allMoviesData } from "./data/all_movies";\nimport { importedMoviesData } from "./data/imported_movies";\nimport { heroMoviesData } from "./data/hero_movies";');

const target = `  const [asyncData, setAsyncData] = useState<{all: any[], imported: any[], hero: any} | null>(null);

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
app = app.replace(target, '');

app = app.replace('const combined = (asyncData ? [...asyncData.imported, ...asyncData.all] : []).filter(m => m && !isAnimeOrAdult(m as unknown as Movie));',
'const combined = [...importedMoviesData, ...allMoviesData].filter(m => m && !isAnimeOrAdult(m as unknown as Movie));');

app = app.replace('const heroMovies = asyncData ? asyncData.hero.heroes : [];',
'const heroMovies = heroMoviesData.heroes;');

app = app.replace('}, [asyncData]);', '}, []);');
app = app.replace('    return finalMovies;\n  }, [asyncData]);', '    return finalMovies;\n  }, []);');

fs.writeFileSync('src/App.tsx', app);
console.log("Success");
