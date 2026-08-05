const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
const target = /tarantino\|nolan\|avildsen\|stallone\|stalonne\|fincher\|wingard\|wingrad\|coogler\|spielberg\|horvath\|gareth edwards/i;
const replacement = "tarantino|nolan|avildsen|stallone|stalonne|fincher|wingard|wingrad|coogler|spielberg|horvath|gareth edwards|justin lin";
app = app.replace(target, replacement);
fs.writeFileSync('src/App.tsx', app);
console.log("Success");
