fetch("http://localhost:3000/api/jellyfin/search?title=white+chicks").then(r => r.json()).then(d => console.log("WC", d.movies.length));
fetch("http://localhost:3000/api/jellyfin/search?title=fbi").then(r => r.json()).then(d => console.log("FBI", d.movies.length));
