const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/const match = allMoviesBase.find\\(\\(jf\\) => isMovieMatch\\(movie.title, jf.title\\)\\);/g,
"const match = fastFindMatch(movie);");

// For the `some` we can also optimize. But maybe it's not run that many times?
fs.writeFileSync('src/App.tsx', file);
