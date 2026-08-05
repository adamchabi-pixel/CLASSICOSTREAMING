const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

content = content.replace(/block md:hidden/g, 'block');

fs.writeFileSync('src/components/LibraryView.tsx', content);
