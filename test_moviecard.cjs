const fs = require('fs');
let file = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');
console.log(file.includes('saved[baseId].currentTime && saved[baseId].currentTime > 0'));
