const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      allMoviesBase.forEach((jf) => {
        if (!matchedServersMovieIds.has(jf.id)) {
          const sagaIds = getDynamicSagaIds(jf);
          if (sagaIds.includes(collection.id)) {
            // Check if it's already represented to prevent duplicate titles
            if (!enrichedMovies.some(m => isMovieMatch(m.title, jf.title))) {
              const enriched = enrichDynamicMovie(jf, collection.id);
              enrichedMovies.push(enriched);
              matchedServersMovieIds.add(jf.id);
            }
          }
        }
      });`;

const replacement = `      allMoviesBase.forEach((jf) => {
        const sagaIds = getDynamicSagaIds(jf);
        if (sagaIds.includes(collection.id)) {
          // Check if it's already represented to prevent duplicate titles
          if (!enrichedMovies.some(m => isMovieMatch(m.title, jf.title))) {
            const enriched = enrichDynamicMovie(jf, collection.id);
            enrichedMovies.push(enriched);
            matchedServersMovieIds.add(jf.id);
          }
        }
      });`;

if (app.includes(target)) {
    app = app.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', app);
    console.log("Success patching loop");
} else {
    console.log("Failed to find target");
}
