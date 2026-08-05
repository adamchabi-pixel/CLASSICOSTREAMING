const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  // Intercept and return the standalone full-screen cinema view with zero overlay UI`;
const replacement = `  // Fetch missing history movies on mount so Resume Watching is preserved
  useEffect(() => {
    if (history.length > 0 && allMovies.length > 0) {
      const missingIds = history.filter(id => !allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")));
      if (missingIds.length > 0) {
        missingIds.forEach(id => {
          const tmdbId = id.replace("-tv", "");
          fetch(\`/api/movie/\${id}\`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.movie) {
                setTmdbCache(prev => {
                  if (prev.find(m => m.id === id)) return prev;
                  const map = new Map(prev.map(m => [m.id, m]));
                  map.set(id, { ...data.movie, id });
                  const newCache = Array.from(map.values());
                  localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
                  return newCache;
                });
              }
            })
            .catch(err => console.error("Failed to fetch missing history movie:", err));
        });
      }
    }
  }, [history, allMovies.length]); // allMovies.length is used so it runs initially when loaded

  // Intercept and return the standalone full-screen cinema view with zero overlay UI`;

if (content.includes(target) && !content.includes("Fetch missing history movies on mount")) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success");
} else {
    console.log("Target not found or already patched");
}
