const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const targetStats = `  const collectionStats = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];

    return COLLECTIONS.map(collection => {
      const ownedTitles: string[] = [];
      const missingMovies: Array<{ title: string; year: number }> = [];

      collection.movies.forEach(expectedMovie => {
        const isOwned = allMoviesBase.some(jf => isMovieMatch(expectedMovie.title, jf.title));`;

const replaceStats = `  const collectionStats = React.useMemo(() => {
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

    return COLLECTIONS.map(collection => {
      const ownedTitles: string[] = [];
      const missingMovies: Array<{ title: string; year: number }> = [];

      collection.movies.forEach(expectedMovie => {
        const isOwned = fastCheckOwned(expectedMovie);`;

file = file.replace(targetStats, replaceStats);
fs.writeFileSync('src/App.tsx', file);
console.log("Success stats");
