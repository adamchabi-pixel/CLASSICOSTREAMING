fetch("http://localhost:3000/api/jellyfin/movies").then(r => r.json()).then(data => {
  const m = data.movies.find(x => x.title.includes("White Chicks"));
  console.log("White Chicks in movies:", !!m);
  if (m) {
    console.log("Description:", m.description);
    console.log("Cast length:", m.cast ? m.cast.length : 0);
    console.log("isJellyfin:", m.isJellyfin);
  }
});
