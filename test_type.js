fetch("http://localhost:3000/api/jellyfin/search?title=white+chicks").then(r => r.json()).then(d => console.log(d.movies[0]));
