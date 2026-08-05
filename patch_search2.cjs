const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `            setTmdbSearchResults(results);
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              data.results.forEach((m: Movie) => map.set(m.id, m));`;

const replacement = `            setTmdbSearchResults(results);
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              results.forEach((m: Movie) => map.set(m.id, m));`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success");
} else {
    console.log("Target not found");
}
