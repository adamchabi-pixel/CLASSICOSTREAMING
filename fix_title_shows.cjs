const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

content = content.replace("{type === 'tv' ? 'Series' : 'Movies'}", "{type === 'tv' ? 'Shows' : 'Movies'}");

fs.writeFileSync('src/components/LibraryView.tsx', content);
