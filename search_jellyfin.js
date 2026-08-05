fetch("http://localhost:3000/api/jellyfin/search?title=white+chicks").then(r => r.json()).then(console.log).catch(console.error);
fetch("http://localhost:3000/api/jellyfin/search?title=fbi").then(r => r.json()).then(console.log).catch(console.error);
