const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf-8');

// We can just create a small node script that uses the exact same logic
// Let's first dump the tmdbCache, allMoviesData, and see if there are duplicates.

