const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  `history
                          .map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")))`,
  `history
                          .filter(id => typeof id === 'string')
                          .map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")))`
);

// Do the same for watchlist if it exists
file = file.replace(
  `watchlist
                          .map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")))`,
  `watchlist
                          .filter(id => typeof id === 'string')
                          .map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")))`
);

fs.writeFileSync('src/App.tsx', file);
