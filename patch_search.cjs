const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      const url = \`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(searchQuery)}&language=en-US&page=1&include_adult=false\`;
      const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
      fetch(url, { headers: { Authorization: \`Bearer \${TMDB_ACCESS_TOKEN}\`, Accept: "application/json" } })
        .then(res => res.json())
        .then(data => {
          if (data && data.results) {
            // Re-format TMDB results to Movie type
            const results = data.results
                .filter((r: any) => (r.media_type === 'movie' || r.media_type === 'tv') && !r.adult && !isAnimeOrAdult(r))
                .map((r: any) => ({
                  id: r.media_type === 'tv' ? \`\${r.id}-tv\` : r.id,
                  title: r.title || r.name,
                  posterUrl: r.poster_path ? \`https://image.tmdb.org/t/p/w500\${r.poster_path}\` : "",
                  year: parseInt((r.release_date || r.first_air_date || "0").substring(0, 4)) || 0,
                  genre: [],
                  type: r.media_type === 'tv' ? "serie" : "movie",
                  overview: r.overview,
                  rating: r.vote_average,
                  isTmdb: true
                }));
            setTmdbSearchResults(results);
          }
        })
        .finally(() => setIsSearchingTmdb(false));`;

const replace = `      const url = \`/api/search?query=\${encodeURIComponent(searchQuery)}\`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data && data.results) {
            setTmdbSearchResults(data.results.map((r: any) => ({ ...r, isTmdb: true, rating: r.voteAverage, type: r.isTv ? "serie" : "movie" })));
          }
        })
        .finally(() => setIsSearchingTmdb(false));`;
        
file = file.replace(target, replace);
fs.writeFileSync('src/App.tsx', file);
