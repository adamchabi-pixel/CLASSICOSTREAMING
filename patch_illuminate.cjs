const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('animationDelay: "0.2s"', 'animationDelay: "-1.2s"');
app = app.replace('animationDelay: "0.4s"', 'animationDelay: "-0.9s"');
fs.writeFileSync('src/App.tsx', app);
console.log("Success");
