const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');
content = content.replace(/\\\`/g, '`');
fs.writeFileSync('src/components/LibraryView.tsx', content);
