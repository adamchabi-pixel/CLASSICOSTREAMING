const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(/href="\/app-icon\.png\?v=3"/g, 'href="/app-icon.png?v=4"');
content = content.replace(/href="\/manifest\.json\?v=6"/g, 'href="/manifest.json?v=7"');

fs.writeFileSync('index.html', content);

let manifest = fs.readFileSync('public/manifest.json', 'utf8');
manifest = manifest.replace(/"src": "\/app-icon\.png\?v=3"/g, '"src": "/app-icon.png?v=4"');
fs.writeFileSync('public/manifest.json', manifest);
