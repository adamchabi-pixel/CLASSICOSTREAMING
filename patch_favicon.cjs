const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace('href="/app-icon.png"', 'href="/app-icon.png?v=2"');
content = content.replace('href="/app-icon.png"', 'href="/app-icon.png?v=2"');

fs.writeFileSync('index.html', content);
