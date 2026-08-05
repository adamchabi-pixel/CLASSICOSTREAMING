const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('animation-delay:0.2s;', 'animation-delay:-1.2s;');
html = html.replace('animation-delay:0.4s;', 'animation-delay:-0.9s;');
fs.writeFileSync('index.html', html);
console.log("Success");
