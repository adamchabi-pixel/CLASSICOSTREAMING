fetch("http://localhost:3000/api/jellyfin/movies").then(r => r.json()).then(data => {
  const m = data.movies.find(x => x.title.toLowerCase().includes("white chicks") || x.title.toLowerCase().includes("fbi"));
  console.log("Found:", m ? m.title : "Not found");
}).catch(console.error);
