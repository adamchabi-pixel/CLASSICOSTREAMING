const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/const match = allMoviesBase\\.find\\(\\(jf\\) => isMovieMatch\\(movie\\.title, jf\\.title\\)\\);/g, 'const match = fastFindMatch(movie);');
fs.writeFileSync('src/App.tsx', file);
