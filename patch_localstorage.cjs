const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  `setWatchlist(JSON.parse(savedWatchlist));`,
  `const w = JSON.parse(savedWatchlist); if (Array.isArray(w)) setWatchlist(w);`
);

file = file.replace(
  `setHistory(JSON.parse(savedHistory));`,
  `const h = JSON.parse(savedHistory); if (Array.isArray(h)) setHistory(h);`
);

fs.writeFileSync('src/App.tsx', file);
