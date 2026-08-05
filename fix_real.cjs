const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const target = /const matchedServersMovieIds = new Set<string>\(\);/;

const replacement = `const matchedServersMovieIds = new Set<string>();

    const titleToMovieMap = new Map<string, Movie>();
    allMoviesBase.forEach(jf => {
      const ct = cleanTitle(jf.title);
      if (ct) titleToMovieMap.set(ct, jf);
    });

    const fastFindMatch = (movie: Movie) => {
       const ct = cleanTitle(movie.title);
       if (ct && titleToMovieMap.has(ct)) return titleToMovieMap.get(ct);
       return allMoviesBase.find((jf) => isMovieMatch(movie.title, jf.title));
    };`;

file = file.replace(target, replacement);
fs.writeFileSync('src/App.tsx', file);
console.log("Replaced!");
