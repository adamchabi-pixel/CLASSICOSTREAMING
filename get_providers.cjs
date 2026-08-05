const fetch = require('node-fetch');
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";

fetch("https://api.themoviedb.org/3/watch/providers/movie?language=en-US", { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } })
.then(r => r.json())
.then(data => {
    const targets = ["Netflix", "Max", "Disney+", "Hulu", "Amazon Prime Video", "Apple TV+", "Paramount+"];
    const found = data.results.filter(p => targets.includes(p.provider_name));
    console.log(JSON.stringify(found.map(p => ({ id: p.provider_id, name: p.provider_name, logo: `https://image.tmdb.org/t/p/original${p.logo_path}` })), null, 2));
});
