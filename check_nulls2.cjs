const fs = require('fs');

const f1 = fs.readFileSync('src/data/imported_movies.ts', 'utf8');
const f2 = fs.readFileSync('src/data/all_movies.ts', 'utf8');

console.log("imported contains null:", f1.includes('null,') || f1.includes(', null'));
console.log("all_movies contains null:", f2.includes('null,') || f2.includes(', null'));
