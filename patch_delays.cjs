const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('animation-delay:-1.2s;', 'animation-delay:-1.0s;');
html = html.replace('animation-delay:-0.9s;', 'animation-delay:-0.5s;');
fs.writeFileSync('index.html', html);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('animationDelay: "-1.2s"', 'animationDelay: "-1.0s"');
app = app.replace('animationDelay: "-0.9s"', 'animationDelay: "-0.5s"');
fs.writeFileSync('src/App.tsx', app);
console.log("Success");
