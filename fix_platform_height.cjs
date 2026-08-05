const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

content = content.replace(/h-\[70px\]/g, 'h-[50px]');

fs.writeFileSync('src/components/LibraryView.tsx', content);
