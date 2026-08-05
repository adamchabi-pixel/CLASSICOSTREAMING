const fs = require('fs');
let file = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');
file = file.replace('return saved[baseId].progress > 300 || saved[baseId].progress > 0;',
'return (saved[baseId].currentTime && saved[baseId].currentTime > 0) || (saved[baseId].progress && saved[baseId].progress > 0);');
fs.writeFileSync('src/components/MovieCard.tsx', file);
console.log("Success");
