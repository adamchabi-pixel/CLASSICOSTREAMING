const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = "THEMATIC LIBRARY";
const replacement = "STRAIGHT BANGERS";

if (app.includes(target)) {
    app = app.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', app);
    console.log("Success");
} else {
    console.log("Target not found");
}
