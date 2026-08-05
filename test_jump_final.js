fetch("http://localhost:3000/api/jellyfin/movies").then(r => r.json()).then(data => {
  const jump = data.movies.find(m => m.title.includes("21 Jump Street"));
  console.log("21 Jump Street in movies:", !!jump);
  if (jump) {
    console.log("Description:", jump.description);
    console.log("Cast length:", jump.cast ? jump.cast.length : 0);
    console.log("isJellyfin:", jump.isJellyfin);
  }
});
