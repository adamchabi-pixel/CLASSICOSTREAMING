const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/Object\.keys\(parsed\)/g, `Object.keys(parsed || {})`);
fs.writeFileSync('src/App.tsx', file);
