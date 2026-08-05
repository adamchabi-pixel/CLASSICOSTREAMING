fetch("http://localhost:3000/api/jellyfin/movies").then(r => r.json()).then(data => {
  const jfMovies = data.movies;
  const jf21 = jfMovies.find(m => m.title.toLowerCase().includes("21 jump"));
  console.log("Jellyfin 21 Jump Street:", jf21);
}).catch(console.error);
