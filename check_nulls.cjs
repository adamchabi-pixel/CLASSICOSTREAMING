const { allMoviesData } = require('./src/data/all_movies_cjs.js');
const { importedMoviesData } = require('./src/data/imported_movies_cjs.js');

console.log("allMoviesData nulls:", allMoviesData.filter(m => !m).length);
console.log("importedMoviesData nulls:", importedMoviesData.filter(m => !m).length);
