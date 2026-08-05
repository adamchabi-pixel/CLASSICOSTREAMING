fetch("http://localhost:3000/api/jellyfin/search?title=21+jump+street").then(r => r.json()).then(d => {
  console.log(d.movies[0]);
});
