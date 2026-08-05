fetch("http://localhost:3000/api/jellyfin/movies").then(r => r.json()).then(data => {
  console.log("Total movies:", data.movies.length);
  console.log("Is White Chicks in there?", data.movies.some(m => m.title === "White Chicks"));
}).catch(console.error);
