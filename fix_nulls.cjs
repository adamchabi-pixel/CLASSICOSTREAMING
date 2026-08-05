const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix 1: tmdbCache load
const target1 = `  const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem("classico_tmdb_cache");
      if (saved) return JSON.parse(saved);
      return [];
    } catch (e) {`;
const replacement1 = `  const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem("classico_tmdb_cache");
      if (saved) {
         const parsed = JSON.parse(saved);
         if (Array.isArray(parsed)) return parsed.filter(Boolean);
      }
      return [];
    } catch (e) {`;
content = content.replace(target1, replacement1);

// Fix 2: combined array
const target2 = `const combined = [...importedMoviesData, ...allMoviesData].filter(m => !isAnimeOrAdult(m as unknown as Movie));`;
const replacement2 = `const combined = [...importedMoviesData, ...allMoviesData].filter(m => m && !isAnimeOrAdult(m as unknown as Movie));`;
content = content.replace(target2, replacement2);

// Fix 3: merged array some
const target3 = `      const existsLocal = merged.some(m => String(m.tmdbId) === String(tmdbMovie.tmdbId) || String(m.id) === String(tmdbMovie.id) || String(m.imdbId) === String(tmdbMovie.tmdbId) || (m.providerIds && m.providerIds.Tmdb && String(m.providerIds.Tmdb) === String(tmdbMovie.tmdbId)) || (m.title && tmdbMovie.title && m.title.toLowerCase() === tmdbMovie.title.toLowerCase() && m.year === tmdbMovie.year));`;
const replacement3 = `      const existsLocal = merged.some(m => m && (String(m.tmdbId) === String(tmdbMovie.tmdbId) || String(m.id) === String(tmdbMovie.id) || String(m.imdbId) === String(tmdbMovie.tmdbId) || (m.providerIds && m.providerIds.Tmdb && String(m.providerIds.Tmdb) === String(tmdbMovie.tmdbId)) || (m.title && tmdbMovie.title && m.title.toLowerCase() === tmdbMovie.title.toLowerCase() && m.year === tmdbMovie.year)));`;
content = content.replace(target3, replacement3);

fs.writeFileSync('src/App.tsx', content);
console.log('done nulls fix');
