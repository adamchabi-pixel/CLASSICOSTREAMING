const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

if(!app.includes('classico_tmdb_cache_v2')) {
  app = app.replace(
    `const saved = localStorage.getItem("classico_tmdb_cache");`,
    `const saved = localStorage.getItem("classico_tmdb_cache_v2");`
  );
  app = app.replaceAll(
    `localStorage.setItem("classico_tmdb_cache"`,
    `localStorage.setItem("classico_tmdb_cache_v2"`
  );
  fs.writeFileSync('src/App.tsx', app);
}
