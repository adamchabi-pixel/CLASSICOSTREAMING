const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');
content = content.replace('md:top-[20px]', 'md:top-[80px]');
fs.writeFileSync('src/components/LibraryView.tsx', content);
