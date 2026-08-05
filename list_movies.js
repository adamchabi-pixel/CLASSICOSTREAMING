fetch("http://localhost:3000/api/jellyfin/movies").then(r => r.json()).then(data => {
  console.log("All Jellyfin movies:", data.movies.map(m => m.title).join(", "));
}).catch(console.error);
