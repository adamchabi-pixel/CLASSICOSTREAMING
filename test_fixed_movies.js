fetch("http://localhost:3000/api/jellyfin/movies").then(r => r.json()).then(data => {
  const whiteChicks = data.movies.find(m => m.title === "White Chicks");
  console.log("White Chicks found:", !!whiteChicks);
}).catch(console.error);
