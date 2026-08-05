const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  // Dynamically map movies into collections & genres by checking server presence
  const mappedCollections = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];
    const matchedServersMovieIds = new Set<string>();`;

const replacement = `  // Dynamically map movies into collections & genres by checking server presence
  const mappedCollections = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];
    const matchedServersMovieIds = new Set<string>();

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

const targetStats = `  const collectionStats = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];

    return COLLECTIONS.map(collection => {`;

const replacementStats = `  const collectionStats = React.useMemo(() => {
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
console.log("Success fix");
