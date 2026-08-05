fetch("http://localhost:3000/api/jellyfin/search?title=fbi").then(r => r.json()).then(d => {
  const item = d.movies.find(m => m.id === '83219aef79eeec58a306aac526257953');
  console.log("Item:", item);
}).catch(console.error);
