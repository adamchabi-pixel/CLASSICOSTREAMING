const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const targetMapped = `  const mappedCollections = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];
    const matchedServersMovieIds = new Set<string>();

    // 1. Process standard Saga Collections (Christopher Nolan, John Wick, etc.)
    // Keep ONLY movies actually found on the server, and drop empty collections
    const curatedSagaCollections = COLLECTIONS.map((collection) => {
      const enrichedMovies = collection.movies
        .map((movie) => {
          const match = allMoviesBase.find((jf) => isMovieMatch(movie.title, jf.title));`;

const replaceMapped = `  const mappedCollections = React.useMemo(() => {
    if (!allMoviesBase || allMoviesBase.length === 0) return [];
    const matchedServersMovieIds = new Set<string>();

    // PRE-COMPUTE MAP FOR FAST LOOKUP TO FIX HUGE LOAD TIME
    const titleToMovieMap = new Map<string, Movie>();
    allMoviesBase.forEach(jf => {
      const ct = cleanTitle(jf.title);
      if (ct) titleToMovieMap.set(ct, jf);
      // For Star Wars
      if (jf.title.toLowerCase().includes("star wars")) {
          // add to a fallback list or handle properly? We will just keep a fallback for isMovieMatch
      }
    });

    const fastFindMatch = (movie: Movie) => {
       const ct = cleanTitle(movie.title);
       if (ct && titleToMovieMap.has(ct)) return titleToMovieMap.get(ct);
       return allMoviesBase.find((jf) => isMovieMatch(movie.title, jf.title));
    };

    // 1. Process standard Saga Collections (Christopher Nolan, John Wick, etc.)
    // Keep ONLY movies actually found on the server, and drop empty collections
    const curatedSagaCollections = COLLECTIONS.map((collection) => {
      const enrichedMovies = collection.movies
        .map((movie) => {
          const match = fastFindMatch(movie);`;

file = file.replace(targetMapped, replaceMapped);
fs.writeFileSync('src/App.tsx', file);
console.log("Success mapped");
