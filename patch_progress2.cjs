const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/progressPercent=\{progressData\[movie\.id\]\}/g, "progressPercent={getProgress(movie.id)}");

fs.writeFileSync('src/App.tsx', content);
console.log("patched all progressPercent");
