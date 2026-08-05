const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const targetStats = `  // SAGA COMPLETENESS CHECKLIST VALIDATION ENGINE
  const sagaCompletenessList = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];

    return COLLECTIONS.map(collection => {`;

const replacementStats = `  // SAGA COMPLETENESS CHECKLIST VALIDATION ENGINE
  const sagaCompletenessList = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];

    const titleToMovieMap = new Map<string, Movie>();
    allMoviesBase.forEach(jf => {
      const ct = cleanTitle(jf.title);
      if (ct) titleToMovieMap.set(ct, jf);
    });

    const fastCheckOwned = (expectedMovie: Movie) => {
       const ct = cleanTitle(expectedMovie.title);
       if (ct && titleToMovieMap.has(ct)) return true;
       return allMoviesBase.some(jf => isMovieMatch(expectedMovie.title, jf.title));
    };

    return COLLECTIONS.map(collection => {`;

file = file.replace(targetStats, replacementStats);

fs.writeFileSync('src/App.tsx', file);
console.log("Success fix2");
