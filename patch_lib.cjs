const fs = require('fs');
let file = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');
file = file.replace("activeYear === '2010'", "activeYear === 2010");
file = file.replace("activeYear === '2000'", "activeYear === 2000");
fs.writeFileSync('src/components/LibraryView.tsx', file);
console.log("Success");
