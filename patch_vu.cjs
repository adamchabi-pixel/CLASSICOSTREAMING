const fs = require('fs');
let file = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf8');
file = file.replace('> Vu</span>', '> Watched</span>');
fs.writeFileSync('src/components/MovieDetailView.tsx', file);
console.log("Success");
